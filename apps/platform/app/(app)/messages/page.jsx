import Messages from '../../../src/app/views/Messages';
import { requireUser } from '../../../lib/access';
import { getInbox, getThread, resolvePeople, markThreadRead } from '../../../lib/data/network';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Messages',
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }) {
  const viewer = await requireUser('/messages');
  const sp = await searchParams;

  const threads = await getInbox(viewer.userId);
  const requested = typeof sp?.to === 'string' ? sp.to : '';
  // A requested person may be a brand-new conversation (not yet in the inbox), so honour it
  // directly; otherwise fall back to the most recent thread.
  const active = requested && requested !== viewer.userId ? requested : threads[0]?.userId ?? '';

  let thread = [];
  let person = null;
  if (active) {
    await markThreadRead(viewer.userId, active);
    thread = await getThread(viewer.userId, active);
    const people = await resolvePeople([active]);
    person = people[active] ?? { userId: active, name: 'ORREI member' };
  }

  return <Messages threads={threads} active={active} thread={thread} person={person} viewerId={viewer.userId} />;
}