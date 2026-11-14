'use server';

/**
 * Extraction actions.
 *
 * Same shape as drafting, and for the same reason: the model proposes, the person decides, and
 * nothing crosses the line without a person. Two steps with a review in between.
 *
 *   extractNotesAction    reads the pasted notes, calls the model, hard-validates the answer, and
 *                         returns candidates plus how each compares with the current record. It
 *                         writes nothing and renders nothing to the public surface.
 *   acceptExtractionAction re-validates the accepted candidates server-side (allowlist, lengths,
 *                         and the snippet must come from the notes — the client is never trusted),
 *                         enforces a keep/change/unknown decision for every conflict that actually
 *                         exists in the database, and writes `unreviewed` rows. Approval is a
 *                         separate, deliberate act on the Details tab, as ever.
 */

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireEditor } from '../access';
import { withUserDb } from '../db/tenant';
import { properties, propertyDetails } from '../../db/schema';
import { recordAudit } from '../audit';
import {
  EXTRACT_KEYS,
  EXTRACT_MAX_CHARS,
  EXTRACT_VALUE_MAX,
  EXTRACT_SNIPPET_MAX,
  buildExtractionMessages,
  compareWithCurrent,
  isUnknownish,
  normaliseKey,
  parseExtractionOutput,
  snippetInSource,
  type Comparison,
} from '../ai/extract';
import { complete, draftingConfigured } from '../ai/groq';
import type { ActionState, ExtractionState } from './types';

const propertyIdSchema = z.string().regex(/^[0-9a-f-]{36}$/i);

const ACCEPT_DECISIONS = ['keep', 'change', 'unknown'] as const;
type AcceptDecision = (typeof ACCEPT_DECISIONS)[number];

const payloadSchema = z.object({
  accepted: z
    .array(
      z.object({
        key: z.string().min(1).max(40),
        value: z.string().min(1).max(EXTRACT_VALUE_MAX),
        snippet: z.string().min(1).max(EXTRACT_SNIPPET_MAX),
        decision: z.enum(ACCEPT_DECISIONS).optional(),
      }),
    )
    .max(EXTRACT_MAX_CHARS),
});

async function loadCurrentFacts(
  tx: Parameters<Parameters<typeof withUserDb>[1]>[0],
  propertyId: string,
  workspaceId: string,
) {
  const owned = await tx
    .select({ id: properties.id })
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.workspaceId, workspaceId)))
    .limit(1);
  if (owned.length === 0) return null;

  const facts = await tx
    .select({ key: propertyDetails.key, value: propertyDetails.value, state: propertyDetails.approvalState })
    .from(propertyDetails)
    .where(eq(propertyDetails.propertyId, propertyId));

  return facts.map((fact) => ({ key: fact.key, value: fact.value ?? '', state: fact.state }));
}

export async function extractNotesAction(
  _previous: ExtractionState,
  formData: FormData,
): Promise<ExtractionState> {
  const { viewer, workspace } = await requireEditor();

  const propertyId = String(formData.get('propertyId') ?? '');
  const notes = String(formData.get('notes') ?? '').trim();
  if (!propertyIdSchema.safeParse(propertyId).success) {
    return { status: 'error', message: 'Unknown property.' };
  }
  if (!notes) {
    return { status: 'error', message: 'Paste the notes first — an empty source gives an empty answer.' };
  }
  if (notes.length > EXTRACT_MAX_CHARS) {
    return { status: 'error', message: `Those notes are longer than ${EXTRACT_MAX_CHARS.toLocaleString()} characters. Split them into parts and extract one at a time.` };
  }

  const current = await withUserDb(viewer.userId, (tx) =>
    loadCurrentFacts(tx, propertyId, workspace.id),
  );
  if (!current) return { status: 'error', message: 'Unknown property.' };

  if (!draftingConfigured()) {
    return {
      status: 'error',
      message: 'The drafting service is not configured on this deployment, so extraction cannot run. You can continue entering details manually.',
    };
  }

  const result = await complete(buildExtractionMessages(notes), { temperature: 0, maxTokens: 2000 });
  if (!result.ok) {
    console.error('[extract] provider failure', { reason: result.reason });
    return {
      status: 'error',
      message: 'The extraction service did not answer. Nothing was saved. Try again, or continue entering details manually.',
    };
  }

  const { candidates, problems } = parseExtractionOutput(result.text ?? '', notes);
  const comparisons = compareWithCurrent(candidates, current);

  if (candidates.length === 0) {
    return {
      status: 'error',
      message: problems[0]?.message ?? 'Nothing could be extracted from those notes. You can continue entering details manually.',
    };
  }

  return {
    status: 'ok',
    message: `${candidates.length} ${candidates.length === 1 ? 'fact' : 'facts'} proposed. Nothing is saved until you accept.`,
    candidates,
    comparisons,
    notes,
  };
}

export async function acceptExtractionAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { viewer, workspace } = await requireEditor();

  const propertyId = String(formData.get('propertyId') ?? '');
  const notes = String(formData.get('notes') ?? '');
  if (!propertyIdSchema.safeParse(propertyId).success) {
    return { status: 'error', message: 'Unknown property.' };
  }
  if (!notes.trim() || notes.length > EXTRACT_MAX_CHARS) {
    return { status: 'error', message: 'The notes are missing or too long, so the sources could not be re-checked.' };
  }

  let payload: z.infer<typeof payloadSchema>;
  try {
    payload = payloadSchema.parse(JSON.parse(String(formData.get('payload') ?? '{}')));
  } catch {
    return { status: 'error', message: 'The selection could not be read. Extract again and choose what to keep.' };
  }

  const KEY_SET = new Set<string>(EXTRACT_KEYS);
  const cleaned = [] as { key: string; value: string; snippet: string; decision?: AcceptDecision }[];
  const problems: string[] = [];
  for (const item of payload.accepted) {
    const key = normaliseKey(item.key);
    const value = item.value.trim();
    const snippet = item.snippet.trim();
    if (!KEY_SET.has(key)) { problems.push(`"${item.key.slice(0, 40)}" is not a fact key this product records.`); continue; }
    if (isUnknownish(value)) { problems.push(`${key}: unknown values are not written to the record.`); continue; }
    if (!snippetInSource(snippet, notes)) { problems.push(`${key}: the snippet does not come from your notes, so it was not written.`); continue; }
    cleaned.push({ key, value, snippet, decision: item.decision });
  }

  if (cleaned.length === 0) {
    return { status: 'error', message: problems[0] ?? 'Nothing valid was selected.' };
  }

  // Re-detect conflicts against the database. The client's view is advisory only.
  const outcome = await withUserDb(viewer.userId, async (tx) => {
    const current = await loadCurrentFacts(tx, propertyId, workspace.id);
    if (!current) return { ok: false as const, blockers: ['Unknown property.'] };

    const comparisons = compareWithCurrent(
      cleaned.map((item) => ({ key: item.key, value: item.value, snippet: item.snippet, unitAmbiguous: false })),
      current,
    );
    const conflictByKey = new Map<string, Comparison>();
    for (const comparison of comparisons) if (comparison.kind === 'conflict') conflictByKey.set(comparison.key, comparison);

    const blockers: string[] = [];
    for (const item of cleaned) {
      if (conflictByKey.has(item.key) && !item.decision) {
        blockers.push(`"${item.key.replace(/_/g, ' ')}" disagrees with what is already on the record — choose keep, change or unknown.`);
      }
    }
    if (blockers.length > 0) return { ok: false as const, blockers };

    let wrote = 0;
    let kept = 0;
    let unknown = 0;
    for (const item of cleaned) {
      const conflict = conflictByKey.get(item.key);
      if (conflict && item.decision === 'keep') { kept += 1; continue; }
      if (conflict && item.decision === 'unknown') { unknown += 1; continue; }
      await tx.insert(propertyDetails).values({
        propertyId,
        key: item.key,
        value: item.value,
        sourceType: 'paste',
        sourceReference: item.snippet.slice(0, EXTRACT_SNIPPET_MAX),
        confidence: null,
        approvalState: 'unreviewed',
        isPublic: false,
      });
      wrote += 1;
    }

    await recordAudit(
      {
        workspaceId: workspace.id,
        actorId: viewer.userId,
        action: 'property.extraction.accepted',
        targetType: 'property',
        targetId: propertyId,
        metadata: { wrote, kept, unknown, rejected: problems.length },
      },
      tx,
    );

    return { ok: true as const, wrote, kept, unknown };
  });

  if (!outcome.ok) {
    return { status: 'error', message: 'Some facts disagree with the record and each needs a decision.', blockers: outcome.blockers };
  }

  revalidatePath(`/properties/${propertyId}`);

  const parts = [`${outcome.wrote} ${outcome.wrote === 1 ? 'fact' : 'facts'} added for review`];
  if (outcome.kept > 0) parts.push(`${outcome.kept} kept as recorded`);
  if (outcome.unknown > 0) parts.push(`${outcome.unknown} marked unknown`);
  if (problems.length > 0) parts.push(`${problems.length} skipped (${problems[0]})`);
  return { status: 'ok', message: `${parts.join('; ')}. Approve or reject them on this tab before anything goes public.` };
}
