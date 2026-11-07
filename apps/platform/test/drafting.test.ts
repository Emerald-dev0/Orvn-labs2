import { describe, expect, it } from 'vitest';
import {
  DRAFT_MAX_CHARS,
  buildDraftMessages,
  cleanDraft,
  draftBlockers,
  draftPriceProblem,
  draftProblems,
  draftableFacts,
  unreviewedPublicFacts,
  wordDiff,
  type DraftFact,
  type DraftSource,
} from '../lib/ai/draft';

const facts: DraftFact[] = [
  { key: 'Bedrooms', value: '4 bedrooms', state: 'approved', public: true },
  { key: 'Internal area', value: '620 m²', state: 'approved', public: true },
  { key: 'Service charge', value: '$1,200 a year', state: 'approved', public: true },
  { key: 'Owner note', value: 'Motivated seller', state: 'unreviewed', public: false },
  { key: 'Roof', value: 'Replaced 2019', state: 'rejected', public: true },
  { key: 'Zoning', value: '', state: 'approved', public: true },
];

const source: DraftSource = {
  title: 'Harbour house',
  propertyType: 'House',
  city: 'Portland',
  region: 'Oregon',
  country: 'United States',
  priceLabel: '$480,000',
  facts,
};

describe('which facts drafting may use', () => {
  it('takes approved, public facts with a value and nothing else', () => {
    expect(draftableFacts(facts).map((fact) => fact.key)).toEqual([
      'Bedrooms',
      'Internal area',
      'Service charge',
    ]);
  });

  it('never counts a rejected fact, an unreviewed fact or an empty value', () => {
    const keys = draftableFacts(facts).map((fact) => fact.key);
    expect(keys).not.toContain('Roof');
    expect(keys).not.toContain('Owner note');
    expect(keys).not.toContain('Zoning');
  });

  it('reports public facts that still need a decision', () => {
    const pending: DraftFact[] = [
      { key: 'Bedrooms', value: '4', state: 'unreviewed', public: true },
      { key: 'Private note', value: 'x', state: 'unreviewed', public: false },
    ];
    expect(unreviewedPublicFacts(pending).map((fact) => fact.key)).toEqual(['Bedrooms']);
  });
});

describe('draftBlockers', () => {
  it('refuses to draft when no fact is approved and public', () => {
    const blockers = draftBlockers({ ...source, facts: facts.filter((fact) => !fact.public) });
    expect(blockers[0]).toMatch(/no facts are approved and public/i);
  });

  it('refuses while a public fact is unreviewed, and says how many', () => {
    const blockers = draftBlockers({
      ...source,
      facts: [...facts, { key: 'Plot', value: '0.3 acres', state: 'unreviewed', public: true } as DraftFact],
    });
    expect(blockers.join(' ')).toMatch(/1 public fact is still unreviewed/);
  });

  it('permits drafting when the record is reviewed', () => {
    expect(draftBlockers(source)).toEqual([]);
  });
});

describe('the prompt', () => {
  const messages = buildDraftMessages(source);
  const user = messages.find((message) => message.role === 'user')!.content;

  it('carries the approved facts', () => {
    expect(user).toContain('4 bedrooms');
    expect(user).toContain('620 m²');
    expect(user).toContain('$1,200 a year');
  });

  it('never carries an unapproved value', () => {
    expect(user).not.toContain('Motivated seller');
    expect(user).not.toContain('Replaced 2019');
  });

  it('forbids invention in the system message', () => {
    const system = messages.find((message) => message.role === 'system')!.content;
    expect(system.toLowerCase()).toContain('never invent a number');
    expect(system.toLowerCase()).toContain('no headings');
  });
});

describe('cleanDraft', () => {
  it('strips fences, wrapping quotes and markdown emphasis', () => {
    expect(cleanDraft('```\n"**A four bedroom house.**"\n```')).toBe('A four bedroom house.');
  });

  it('drops headings and bullets, keeping the prose', () => {
    const raw = '## Overview\n- A house by the water.\n- Parking for two cars.';
    expect(cleanDraft(raw)).toBe('A house by the water. Parking for two cars.');
  });

  it('collapses whitespace and blank lines', () => {
    expect(cleanDraft('  One line.\n\n\n  Second line.  ')).toBe('One line. Second line.');
  });

  it('caps the length at a sentence boundary', () => {
    const raw = `${'A sentence about the house. '.repeat(80)}`;
    const cleaned = cleanDraft(raw);
    expect(cleaned.length).toBeLessThanOrEqual(DRAFT_MAX_CHARS);
    expect(cleaned.endsWith('.')).toBe(true);
  });

  it('returns an empty string rather than a stray character', () => {
    expect(cleanDraft('   ')).toBe('');
    expect(cleanDraft('"')).toBe('"');
  });
});

describe('checking a draft against the facts', () => {
  it('accepts numbers that an approved fact supports', () => {
    const draft = 'A house with 4 bedrooms and 620 m² of internal space, priced at $480,000.';
    expect(draftProblems(draft, source)).toEqual([]);
  });

  it('flags a number that no approved fact contains', () => {
    const problems = draftProblems('A house with 5 bedrooms and a pool.', source);
    expect(problems).toEqual([{ kind: 'number', text: '5' }]);
  });

  it('flags a price the record does not carry', () => {
    const problems = draftProblems('Offered at $450,000 today.', source);
    expect(problems.map((problem) => problem.text)).toContain('450,000');
  });

  it('flags a price written into a page that shows no price', () => {
    const onRequest = { ...source, priceLabel: 'Price on request' };
    const problem = draftPriceProblem('Asking $480,000 for the house.', onRequest);
    expect(problem?.kind).toBe('price');
  });

  it('says nothing about prices when the record shows one', () => {
    expect(draftPriceProblem('Asking $480,000 for the house.', source)).toBeNull();
  });
});

describe('word diff', () => {
  it('marks added words and leaves shared words intact', () => {
    const tokens = wordDiff('A house by the water.', 'A four bedroom house by the water.');
    expect(tokens.map((token) => token.kind)).toContain('added');
    expect(tokens.filter((token) => token.kind === 'added').map((token) => token.text).join(' ')).toContain(
      'four bedroom',
    );
    expect(tokens.filter((token) => token.kind === 'removed')).toHaveLength(0);
  });

  it('marks removed words when the draft says less', () => {
    const tokens = wordDiff('A house with a pool by the water.', 'A house by the water.');
    expect(tokens.filter((token) => token.kind === 'removed').map((token) => token.text).join(' ')).toContain('pool');
  });

  it('rebuilds both sides from the tokens', () => {
    const before = 'A house with four bedrooms.';
    const after = 'A house with five bedrooms and a garden.';
    const tokens = wordDiff(before, after);
    const rebuiltBefore = tokens
      .filter((token) => token.kind !== 'added')
      .map((token) => token.text)
      .join(' ');
    expect(rebuiltBefore).toBe(before);
  });

  it('handles an empty current description', () => {
    const tokens = wordDiff('', 'A house by the water.');
    expect(tokens).toEqual([{ text: 'A house by the water.', kind: 'added' }]);
  });
});
