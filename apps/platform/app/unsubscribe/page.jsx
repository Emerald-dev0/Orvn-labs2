import PageWrapper from '../../src/components/PageWrapper';
import { verifyUnsubscribeToken } from '../../lib/unsubscribe';
import { suppressEmail } from '../../lib/marketing';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Unsubscribe',
  description: 'Stop receiving optional ORREI product and development updates.',
  robots: { index: false, follow: false },
};

/**
 * One-click unsubscribe from optional (marketing) updates, per PRD §19.4.
 * Operational email — invitations, sign-in links, security notices — is a separate stream
 * and cannot be suppressed here.
 */
export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const token = typeof sp?.t === 'string' ? sp.t : null;
  const email = verifyUnsubscribeToken(token);

  let state = 'invalid';
  if (email) {
    try {
      await suppressEmail(email);
      state = 'done';
    } catch (error) {
      console.error('[unsubscribe] suppression write failed', { message: error?.message });
      state = 'error';
    }
  }

  return (
    <PageWrapper>
      <section className="section-y">
        <div className="shell" style={{ maxWidth: 720 }}>
          {state === 'done' ? (
            <>
              <span className="eyebrow">Unsubscribed</span>
              <h1 className="section-title" style={{ marginTop: 12 }}>You won’t receive optional updates.</h1>
              <p className="lead" style={{ marginTop: 12 }}>
                The address is off the list for product and development updates. Invitations, sign-in
                links and security notices still arrive — those can’t be opted out of.
              </p>
              <p className="ws-small ws-muted" style={{ marginTop: 16 }}>
                Questions? Write to hello@orvnlabs.com and a person will handle it.
              </p>
            </>
          ) : null}
          {state === 'invalid' ? (
            <>
              <span className="eyebrow">Unsubscribe</span>
              <h1 className="section-title" style={{ marginTop: 12 }}>That link doesn’t work.</h1>
              <p className="lead" style={{ marginTop: 12 }}>
                The link may be incomplete or old. Reply to any ORREI email with “unsubscribe” and we
                will remove you by hand, or write to hello@orvnlabs.com.
              </p>
            </>
          ) : null}
          {state === 'error' ? (
            <>
              <span className="eyebrow">Unsubscribe</span>
              <h1 className="section-title" style={{ marginTop: 12 }}>We couldn’t save that.</h1>
              <p className="lead" style={{ marginTop: 12 }}>
                Nothing was recorded. Try the link again in a minute, or reply to any ORREI email with
                “unsubscribe” and we will remove you by hand.
              </p>
            </>
          ) : null}
        </div>
      </section>
    </PageWrapper>
  );
}
