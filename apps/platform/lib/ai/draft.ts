/**
 * Drafting, as a pure contract.
 *
 * The rule the product promises is narrow and absolute: the model may arrange words, never
 * invent a fact. So the input is built here, from rows that already passed their own review,
 * and the output is checked against the same rows before a human is ever offered it.
 *
 * Everything in this file is pure: the prompt, the sanitiser, the comparison and the diff. The
 * network call lives in ./groq, the database in ../actions/drafting.
 */

export type DraftFact = {
  key: string;
  value: string;
  /** approved | unreviewed | rejected | unknown */
  state: string;
  /** Whether the fact's row is marked public. */
  public: boolean;
};

export type DraftSource = {
  title: string;
  propertyType: string;
  city: string;
  region: string;
  country: string;
  priceLabel: string;
  facts: DraftFact[];
};

/** A description is a paragraph, not a brochure. Anything longer is the model freelancing. */
export const DRAFT_MAX_CHARS = 900;

export function isUsableFact(fact: DraftFact): boolean {
  return fact.state === 'approved' && fact.public && fact.value.trim().length > 0;
}

/** The only facts the model is allowed to know about. */
export function draftableFacts(facts: DraftFact[]): DraftFact[] {
  return facts.filter(isUsableFact);
}

/**
 * Public facts that have not been reviewed. These block publication: a page should not carry a
 * claim nobody has looked at, and the drafting flow is where such claims accumulate.
 */
export function unreviewedPublicFacts(facts: DraftFact[]): DraftFact[] {
  return facts.filter(
    (fact) => fact.public && fact.state === 'unreviewed' && fact.value.trim().length > 0,
  );
}

/** Why drafting cannot start yet, in the order a person would fix it. */
export function draftBlockers(source: DraftSource): string[] {
  const blockers: string[] = [];
  if (draftableFacts(source.facts).length === 0) {
    blockers.push(
      'No facts are approved and public yet. Approve a fact first: drafting is not allowed to invent one.',
    );
  }
  const pending = unreviewedPublicFacts(source.facts).length;
  if (pending > 0) {
    blockers.push(
      `${pending} public ${pending === 1 ? 'fact is' : 'facts are'} still unreviewed. Approve or reject ${
        pending === 1 ? 'it' : 'them'
      } before drafting.`,
    );
  }
  return blockers;
}

export type ChatMessage = { role: 'system' | 'user'; content: string };

/**
 * The prompt is built from the approved facts and nothing else. The description currently on the
 * record is not sent: letting the model see it invites it to smooth over a claim that was never
 * approved, which is exactly the failure this flow exists to prevent.
 */
export function buildDraftMessages(source: DraftSource): ChatMessage[] {
  const facts = draftableFacts(source.facts)
    .map((fact) => `- ${fact.key}: ${fact.value.trim()}`)
    .join('\n');

  const where = [source.city, source.region, source.country].filter(Boolean).join(', ');

  return [
    {
      role: 'system',
      content: [
        'You write short property descriptions for a professional real-estate workspace.',
        'Hard rules:',
        '1. Use only the facts listed. Never invent a number, a feature, a date, a distance, a school, a view or a neighbourhood claim.',
        '2. Never add an opinion about value, investment return, or the seller\'s motivation.',
        '3. Never mention square footage, bedroom counts or prices that are not in the list.',
        '4. Write 60 to 110 words, plain sentences, no headings, no bullet points, no emoji, no exclamation marks.',
        '5. Do not open with "Introducing" or "Welcome to". Start with the property itself.',
        '6. Return the description only. No preamble, no quotation marks around it.',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `Title: ${source.title}`,
        `Type: ${source.propertyType}`,
        where ? `Approximate location: ${where}` : null,
        `Price: ${source.priceLabel}`,
        'Approved facts:',
        facts,
        '',
        'Write the description.',
      ]
        .filter((line): line is string => line !== null)
        .join('\n'),
    },
  ];
}

/**
 * Model output is untrusted text. Strip wrapping quotes, code fences and markdown emphasis, collapse
 * whitespace, drop any line that looks like a heading or a bullet, and cap the length. Nothing here
 * tries to correct facts: it only refuses to dress the text up as anything but a paragraph.
 */
export function cleanDraft(raw: string): string {
  let text = (raw ?? '').trim();

  text = text.replace(/^```[a-z]*\s*/i, '').replace(/```$/i, '').trim();
  text = text.replace(/^(["'“”‘’])([\s\S]*)(["'“”‘’])$/, '$2').trim();

  const lines = text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/^#{1,6}\s/.test(line))
    .map((line) => line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, ''))
    .map((line) => line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|\s)_(.+?)_(?=\s|$)/g, '$1$2'));

  text = lines.join(' ').replace(/\s+/g, ' ').trim();

  if (text.length > DRAFT_MAX_CHARS) {
    const cut = text.slice(0, DRAFT_MAX_CHARS);
    const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
    text = lastStop > 120 ? cut.slice(0, lastStop + 1) : cut.trimEnd();
  }

  return text;
}

export type DraftProblem = { kind: 'number' | 'price' | 'unlisted'; text: string };

const NUMBER = /\d[\d,.]*/g;

/**
 * Does the draft claim anything the approved facts do not support?
 *
 * Numbers are the check that matters: a model that adds "5 bedrooms" or "$450,000" is producing a
 * claim about the property, and every number it writes must already exist in an approved fact or in
 * the property's approved fields. Unknown numbers are reported, not silently removed, so the person
 * reviewing sees exactly what the model tried to do.
 */
export function draftProblems(draft: string, source: DraftSource): DraftProblem[] {
  const allowed = new Set<string>();
  const add = (value: string) => {
    for (const match of value.match(NUMBER) ?? []) {
      const normalised = match.replace(/[,\s]/g, '').replace(/\.$/, '');
      if (normalised) allowed.add(normalised);
    }
  };

  add(source.priceLabel);
  for (const fact of draftableFacts(source.facts)) add(fact.value);
  for (const part of [source.title, source.city, source.region, source.country]) add(part);

  const problems: DraftProblem[] = [];
  const seen = new Set<string>();

  for (const match of draft.match(NUMBER) ?? []) {
    const normalised = match.replace(/[,\s]/g, '').replace(/\.$/, '');
    if (!normalised || seen.has(normalised)) continue;
    seen.add(normalised);
    if (!allowed.has(normalised)) {
      problems.push({ kind: 'number', text: match });
    }
  }

  return problems;
}

/**
 * "Does this draft copy mention a price when the price is on request?" is a distinct failure from a
 * stray number, so it gets its own report.
 */
export function draftPriceProblem(draft: string, source: DraftSource): DraftProblem | null {
  if (source.priceLabel !== 'Price on request') return null;
  const currency = /(?:[$£€₦]|\b(?:usd|ngn|gbp|eur)\b|\b(?:million|thousand)\b)/i;
  if (!currency.test(draft)) return null;
  return { kind: 'price', text: 'A price appears in the draft, but this property shows no price.' };
}

export type DiffToken = { text: string; kind: 'same' | 'added' | 'removed' };

/**
 * A word diff, because the reviewer's real question is "what changed?". Longest-common-subsequence
 * over words is enough for a 100-word paragraph and keeps the output readable.
 */
export function wordDiff(before: string, after: string): DiffToken[] {
  const a = tokenise(before);
  const b = tokenise(after);

  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] =
        a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const tokens: DiffToken[] = [];
  const push = (text: string, kind: DiffToken['kind']) => {
    const last = tokens[tokens.length - 1];
    if (last && last.kind === kind) last.text += ` ${text}`;
    else tokens.push({ text, kind });
  };

  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push(a[i], 'same');
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      push(a[i], 'removed');
      i += 1;
    } else {
      push(b[j], 'added');
      j += 1;
    }
  }
  while (i < a.length) {
    push(a[i], 'removed');
    i += 1;
  }
  while (j < b.length) {
    push(b[j], 'added');
    j += 1;
  }

  return tokens;
}

function tokenise(text: string): string[] {
  return (text ?? '').trim().split(/\s+/).filter(Boolean);
}
