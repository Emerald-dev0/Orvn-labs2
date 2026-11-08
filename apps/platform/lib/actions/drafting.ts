'use server';

/**
 * Drafting actions.
 *
 * Two steps, and the gap between them is the whole point:
 *
 *   draftDescriptionAction   reads the record, builds the prompt from approved public facts only,
 *                            calls the model, checks the answer, and returns it. It writes nothing.
 *   acceptDraftAction        writes a draft the person has read, after re-validating it against the
 *                            same facts. A rejected draft is simply dropped by the client.
 *
 * Because a draft only exists between those two calls, nothing unreviewed can ever be published:
 * the page renders `properties.description`, and only acceptance writes that column.
 */

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { requireEditor } from '../access';
import { withUserDb } from '../db/tenant';
import { properties, propertyDetails } from '../../db/schema';
import { recordAudit } from '../audit';
import { humaniseFactKey } from '../print/sheet';
import { priceLabel, typeLabel } from '../format';
import { cleanDraft, draftBlockers, draftPriceProblem, draftProblems, buildDraftMessages, type DraftSource } from '../ai/draft';
import { complete, completionMessage, draftingConfigured } from '../ai/groq';
import type { DraftState } from './types';

async function loadSource(
  tx: Parameters<Parameters<typeof withUserDb>[1]>[0],
  propertyId: string,
  workspaceId: string,
): Promise<DraftSource | null> {
  const [row] = await tx
    .select({
      title: properties.title,
      propertyType: properties.propertyType,
      city: properties.city,
      region: properties.region,
      country: properties.country,
      priceAmount: properties.priceAmount,
      currency: properties.currency,
      priceVisibility: properties.priceVisibility,
    })
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.workspaceId, workspaceId)))
    .limit(1);

  if (!row) return null;

  const facts = await tx
    .select({
      key: propertyDetails.key,
      value: propertyDetails.value,
      state: propertyDetails.approvalState,
      public: propertyDetails.isPublic,
    })
    .from(propertyDetails)
    .where(eq(propertyDetails.propertyId, propertyId));

  return {
    title: row.title,
    propertyType: typeLabel(row.propertyType),
    city: row.city ?? '',
    region: row.region ?? '',
    country: row.country ?? '',
    priceLabel: priceLabel({
      priceAmount: row.priceAmount,
      currency: row.currency,
      priceVisibility: row.priceVisibility,
    }),
    facts: facts.map((fact) => ({
      key: humaniseFactKey(fact.key),
      value: fact.value ?? '',
      state: fact.state,
      public: fact.public,
    })),
  };
}

export async function draftDescriptionAction(
  _previous: DraftState,
  formData: FormData,
): Promise<DraftState> {
  const { viewer, workspace } = await requireEditor();
  const propertyId = String(formData.get('propertyId') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(propertyId)) {
    return { status: 'error', message: 'Unknown property.' };
  }

  if (!draftingConfigured()) {
    return { status: 'error', message: completionMessage('not_configured') };
  }

  let source: DraftSource | null = null;
  try {
    source = await withUserDb(viewer.userId, (tx) => loadSource(tx, propertyId, workspace.id));
  } catch (error) {
    console.error('[draft] read failed', { message: (error as Error).message });
    return { status: 'error', message: 'That record could not be read. Nothing changed.' };
  }

  if (!source) return { status: 'error', message: 'That property is not in this workspace.' };

  const blockers = draftBlockers(source);
  if (blockers.length > 0) {
    return { status: 'error', message: blockers[0], blockers };
  }

  const result = await complete(buildDraftMessages(source));
  if (!result.ok) return { status: 'error', message: completionMessage(result.reason) };

  const draft = cleanDraft(result.text ?? '');
  if (!draft) return { status: 'error', message: 'The drafting service returned nothing usable. Nothing was saved.' };

  const problems = draftProblems(draft, source);
  const priceProblem = draftPriceProblem(draft, source);
  const warnings = [
    ...problems.map(
      (problem) => `The draft mentions “${problem.text}”, which is not in any approved fact.`,
    ),
    ...(priceProblem ? [priceProblem.text] : []),
  ];

  return { status: 'ok', draft, warnings, usedFacts: source.facts.filter((f) => f.state === 'approved' && f.public) };
}

/**
 * Accepting a draft is a write, so it re-checks everything the draft step checked. A stale tab, a
 * fact rejected in another window, or a hand-edited draft all land in the same place: refused, with
 * the record untouched.
 */
export async function acceptDraftAction(
  _previous: DraftState,
  formData: FormData,
): Promise<DraftState> {
  const { viewer, workspace } = await requireEditor();
  const propertyId = String(formData.get('propertyId') ?? '');
  const submitted = String(formData.get('draft') ?? '');

  if (!/^[0-9a-f-]{36}$/i.test(propertyId)) {
    return { status: 'error', message: 'Unknown property.' };
  }
  if (!submitted.trim()) {
    return { status: 'error', message: 'There is no draft to accept.' };
  }

  let problems: string[] = [];
  try {
    await withUserDb(viewer.userId, async (tx) => {
      const source = await loadSource(tx, propertyId, workspace.id);
      if (!source) throw new Error('missing');

      const facts = source.facts.filter((f) => f.state === 'approved' && f.public);
      if (facts.length === 0) {
        problems = ['No approved public facts remain, so this draft cannot be accepted.'];
        return;
      }

      const text = cleanDraft(submitted);
      const found = draftProblems(text, source).map((problem) => problem.text);
      if (found.length > 0) {
        problems = found.map(
          (value) => `The text mentions “${value}”, which no approved fact supports. Edit it out before accepting.`,
        );
        return;
      }

      await tx
        .update(properties)
        .set({ description: text, updatedAt: new Date() })
        .where(and(eq(properties.id, propertyId), eq(properties.workspaceId, workspace.id)));

      await recordAudit(
        {
          workspaceId: workspace.id,
          actorId: viewer.userId,
          action: 'property.description.drafted',
          targetType: 'property',
          targetId: propertyId,
          metadata: { chars: text.length, facts: facts.length },
        },
        tx,
      );
    });
  } catch (error) {
    console.error('[draft] accept failed', { message: (error as Error).message });
    return { status: 'error', message: 'That draft could not be saved. The record is unchanged.' };
  }

  if (problems.length > 0) {
    return { status: 'error', message: problems[0], blockers: problems };
  }

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath('/properties');
  revalidatePath(`/w/${workspace.username}`);
  return { status: 'ok', message: 'Description saved from the draft.' };
}
