import * as React from 'react';
import { render } from '@react-email/render';

/**
 * One rendering seam for every email.
 *
 * React builds the markup, so a value that comes from a person — a workspace name, an inquiry
 * message — is escaped by React before it can reach a tag. That is the reason for using React
 * here rather than string-built HTML: the escaping is a property of the renderer, not a habit
 * someone has to remember.
 *
 * Plain text is written by hand in the wrappers under `lib/emails`. Auto-generated text loses
 * the URLs, and a link nobody can copy is the one thing a plain-text client cannot forgive.
 */
export async function renderEmail(element: React.ReactElement): Promise<string> {
  return render(element, { pretty: false });
}
