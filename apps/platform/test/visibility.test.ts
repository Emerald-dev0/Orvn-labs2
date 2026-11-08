import { describe, expect, it } from 'vitest';
import {
  VISIBILITIES,
  filesReleased,
  isIndexable,
  targetFor,
  visibilityCopy,
  visibilityOf,
} from '../lib/publication/visibility';

/**
 * The visibility contract, as the three states a property can be in.
 *
 * These are the rules the public page, the metadata, the portfolio listing and the file boundary
 * all read. If one of them changes here, every surface changes with it.
 */

describe('visibilityOf', () => {
  it('treats every unpublished state as private', () => {
    for (const status of ['draft', 'needs_review', 'unpublished', 'archived', null, undefined, '']) {
      expect(visibilityOf({ publicationStatus: status, showOnPortfolio: true })).toBe('private');
      expect(visibilityOf({ publicationStatus: status, showOnPortfolio: false })).toBe('private');
    }
  });

  it('splits published records by the portfolio flag', () => {
    expect(visibilityOf({ publicationStatus: 'published', showOnPortfolio: true })).toBe('public');
    expect(visibilityOf({ publicationStatus: 'published', showOnPortfolio: false })).toBe('link_only');
  });

  it('offers exactly three states, in the order a person narrows them', () => {
    expect([...VISIBILITIES]).toEqual(['private', 'link_only', 'public']);
  });
});

describe('indexing', () => {
  it('indexes only public pages', () => {
    expect(isIndexable('public')).toBe(true);
    expect(isIndexable('link_only')).toBe(false);
    expect(isIndexable('private')).toBe(false);
  });
});

describe('file release', () => {
  it('releases nothing for a private record, even if a file row says public', () => {
    expect(filesReleased({ publicationStatus: 'draft', showOnPortfolio: true })).toBe(false);
    expect(filesReleased({ publicationStatus: 'unpublished', showOnPortfolio: true })).toBe(false);
    expect(filesReleased({ publicationStatus: 'archived', showOnPortfolio: true })).toBe(false);
  });

  it('releases files for both published states, because both render a page', () => {
    expect(filesReleased({ publicationStatus: 'published', showOnPortfolio: true })).toBe(true);
    expect(filesReleased({ publicationStatus: 'published', showOnPortfolio: false })).toBe(true);
  });
});

describe('targetFor', () => {
  it('maps each state to the publication work it needs', () => {
    expect(targetFor('public')).toEqual({ publish: true, showOnPortfolio: true });
    expect(targetFor('link_only')).toEqual({ publish: true, showOnPortfolio: false });
    expect(targetFor('private')).toEqual({ publish: false, showOnPortfolio: false });
  });

  it('never lists a page that is not published', () => {
    for (const visibility of VISIBILITIES) {
      if (!targetFor(visibility).publish) {
        expect(targetFor(visibility).showOnPortfolio).toBe(false);
      }
    }
  });
});

describe('copy', () => {
  it('says link-only is unlisted, not confidential', () => {
    const copy = visibilityCopy('link_only');
    expect(copy.summary.toLowerCase()).toContain('unlisted');
    expect(copy.detail.toLowerCase()).toContain('not confidential');
  });

  it('promises no account wall for a public page', () => {
    expect(visibilityCopy('public').detail.toLowerCase()).toContain('without an account');
  });

  it('states that a private page is not found and releases no files', () => {
    const detail = visibilityCopy('private').detail.toLowerCase();
    expect(detail).toContain('not found');
    expect(detail).toContain('not released');
  });

  it('gives every state a distinct summary', () => {
    const summaries = VISIBILITIES.map((visibility) => visibilityCopy(visibility).summary);
    expect(new Set(summaries).size).toBe(summaries.length);
  });
});

describe('revoking a shared link', () => {
  /**
   * The accepted behaviour: a page goes public, somebody saves the URL, the owner withdraws it, and
   * the next request finds nothing. Modelled here as the state the server derives on each request.
   */
  it('goes from reachable to not found, from the derived state alone', () => {
    const shared = { publicationStatus: 'published', showOnPortfolio: true };
    expect(visibilityOf(shared)).toBe('public');
    expect(isIndexable(visibilityOf(shared))).toBe(true);

    const withdrawn = { publicationStatus: 'unpublished', showOnPortfolio: true };
    expect(visibilityOf(withdrawn)).toBe('private');
    expect(filesReleased(withdrawn)).toBe(false);
  });

  it('is reversible: re-publishing restores the link the reader already had', () => {
    const withdrawn = { publicationStatus: 'unpublished', showOnPortfolio: false };
    expect(visibilityOf(withdrawn)).toBe('private');

    const reissued = { publicationStatus: 'published', showOnPortfolio: false };
    expect(visibilityOf(reissued)).toBe('link_only');
    expect(isIndexable(visibilityOf(reissued))).toBe(false);
  });
});
