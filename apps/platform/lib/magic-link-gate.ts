/**
 * Whether a sign-in email should be sent at all.
 *
 * The beta gate used to run only when the link was clicked, so an uninvited address was sent a
 * link it could never use. The check now runs before the send. Pure, so the rule is tested
 * without a database.
 *
 * The sign-in page says "Check your inbox" to every address, whatever this returns, so the
 * response reveals nothing about whether an account exists.
 */
export type MagicLinkDecision = 'send' | 'skip';

export function magicLinkDecision(opts: {
  isAdmin: boolean;
  hasAccount: boolean;
  hasInvitation: boolean;
}): MagicLinkDecision {
  if (opts.isAdmin) return 'send';
  if (opts.hasAccount) return 'send';
  if (opts.hasInvitation) return 'send';
  return 'skip';
}
