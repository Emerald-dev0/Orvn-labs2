/**
 * AUTH-02: first-run onboarding rules.
 *
 * Kept pure so the decision "does this user see the onboarding step?" and the shape of its
 * answer are testable without a database.
 */

export const ONBOARDING_ROLES = [
  { id: 'wholesaler', label: 'Wholesaler / disposition operator' },
  { id: 'agent', label: 'Agent or broker' },
  { id: 'investor', label: 'Investor or developer' },
  { id: 'other', label: 'Something else' },
] as const;

export type OnboardingRole = (typeof ONBOARDING_ROLES)[number]['id'];

const ROLE_SET = new Set<string>(ONBOARDING_ROLES.map((role) => role.id));

export type OnboardingInput = {
  displayName: string;
  role: string;
  market: string;
  contactEmail: string;
  contactPhone: string;
};

export type ParsedOnboarding =
  | { ok: true; displayName: string; role: OnboardingRole; market: string; contactEmail: string; contactPhone: string | null }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Parse and validate the onboarding form. Mirrors the inline rules in the form exactly. */
export function parseOnboarding(input: OnboardingInput): ParsedOnboarding {
  const displayName = input.displayName.trim();
  if (displayName.length < 2 || displayName.length > 120) {
    return { ok: false, error: 'Enter the name you want buyers to see (at least 2 characters).' };
  }

  const role = input.role.trim();
  if (!ROLE_SET.has(role)) {
    return { ok: false, error: 'Choose the closest role to yours.' };
  }

  const market = input.market.trim();
  if (market.length < 2 || market.length > 80) {
    return { ok: false, error: 'Name the market you work in (e.g. "Miami, FL").' };
  }

  const contactEmail = input.contactEmail.trim();
  if (!EMAIL_RE.test(contactEmail)) {
    return { ok: false, error: 'Enter a reachable email address.' };
  }

  const contactPhone = input.contactPhone.trim();
  if (contactPhone.length > 40) {
    return { ok: false, error: 'That phone number is too long.' };
  }

  return {
    ok: true,
    displayName,
    role: role as OnboardingRole,
    market,
    contactEmail,
    contactPhone: contactPhone || null,
  };
}

/** Whether the onboarding step still has work to do for this profile. */
export function needsOnboarding(profile: { onboardedAt: Date | null } | null): boolean {
  return !profile?.onboardedAt;
}

/** Short display label for a stored role id, for the public page and settings. */
export function roleLabel(role: string | null | undefined): string | null {
  switch (role) {
    case 'wholesaler':
      return 'Wholesaler';
    case 'agent':
      return 'Agent';
    case 'investor':
      return 'Investor';
    default:
      return null; // 'other' and unknown values say nothing rather than something wrong
  }
}
