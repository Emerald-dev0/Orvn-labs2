/** Shared result shape for form actions. Errors are sentences a person can act on. */
export type ActionState =
  | { status: 'idle' }
  | { status: 'ok'; message?: string }
  | { status: 'error'; message: string; blockers?: string[] };

/**
 * Drafting results carry the text and its warnings, because a draft is a proposal to a person, not
 * a saved value. `usedFacts` is the provenance shown next to it.
 */
export type DraftState =
  | { status: 'idle' }
  | { status: 'ok'; message?: string; draft?: string; warnings?: string[]; usedFacts?: { key: string; value: string }[] }
  | { status: 'error'; message: string; blockers?: string[] };

/** Extraction results carry the candidates to review, plus every problem the parser hit, in plain language. */
export type ExtractionState =
  | { status: 'idle' }
  | { status: 'ok'; message?: string; candidates?: import('../ai/extract').ExtractCandidate[]; comparisons?: import('../ai/extract').Comparison[]; notes?: string }
  | { status: 'error'; message: string };
