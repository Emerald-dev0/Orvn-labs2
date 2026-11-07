/**
 * Visibility: the three states a property can be in, and the rules that connect them to the
 * publication machinery.
 *
 *   private    nothing is published. The page 404s, the files are not released, the record is
 *              the workspace's business.
 *   link_only  published, but not listed on the profile and not indexable. Anyone holding the
 *              URL can open it. Unlisted is not the same as confidential, and the UI has to say so.
 *   public     published, listed on the profile portfolio, indexable.
 *
 * This module is pure so the state machine can be tested without a database, and so the page,
 * the sheet and the metadata all read the same rule instead of three near-copies of it.
 */

export const VISIBILITIES = ['private', 'link_only', 'public'] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export type VisibilityInput = {
  publicationStatus: string | null | undefined;
  showOnPortfolio: boolean;
};

/** What the record is right now, derived from the two columns that actually store it. */
export function visibilityOf(input: VisibilityInput): Visibility {
  if (input.publicationStatus !== 'published') return 'private';
  return input.showOnPortfolio ? 'public' : 'link_only';
}

/** Only a public page may be indexed. Link-only pages stay reachable and stay out of indexes. */
export function isIndexable(visibility: Visibility): boolean {
  return visibility === 'public';
}

/**
 * Whether the file boundary may release a photo or document. Files follow the page: if nothing is
 * published, nothing is served, whatever a stale row says about the file itself.
 */
export function filesReleased(input: VisibilityInput): boolean {
  return visibilityOf(input) !== 'private';
}

export type VisibilityTarget = {
  /** Whether the publication snapshot must be opened, rewritten or closed. */
  publish: boolean;
  showOnPortfolio: boolean;
};

/** The intent behind a choice, before any publication check has run. */
export function targetFor(visibility: Visibility): VisibilityTarget {
  switch (visibility) {
    case 'public':
      return { publish: true, showOnPortfolio: true };
    case 'link_only':
      return { publish: true, showOnPortfolio: false };
    case 'private':
    default:
      return { publish: false, showOnPortfolio: false };
  }
}

export type VisibilityCopy = {
  label: string;
  summary: string;
  detail: string;
};

/**
 * The words the control shows. They are deliberately specific about the limit of each state,
 * because "link-only" is the one people assume is private.
 */
export function visibilityCopy(visibility: Visibility): VisibilityCopy {
  switch (visibility) {
    case 'public':
      return {
        label: 'Public',
        summary: 'On your profile and in search',
        detail:
          'The page is published, listed on your portfolio and allowed into search results. Buyers open it without an account.',
      };
    case 'link_only':
      return {
        label: 'Link only',
        summary: 'Unlisted, not private',
        detail:
          'The page is published and anyone with the link can open it. It stays off your portfolio and out of search results. It is unlisted, not confidential, so do not send it to somebody you would not show the page to.',
      };
    case 'private':
    default:
      return {
        label: 'Private',
        summary: 'Nobody outside the workspace',
        detail:
          'Nothing is published. The page returns not found, the photos and documents are not released, and the record stays inside the workspace.',
      };
  }
}
