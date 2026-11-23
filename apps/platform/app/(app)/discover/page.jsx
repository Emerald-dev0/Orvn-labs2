import Discover from '../../../src/app/views/Discover';
import { requireUser } from '../../../lib/access';
import { discoverProfessionals, listMyConnections, savedProfileIds } from '../../../lib/data/network';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Discover',
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }) {
  const viewer = await requireUser('/discover');
  const sp = await searchParams;
  const q = typeof sp?.q === 'string' ? sp.q : '';
  const role = typeof sp?.role === 'string' ? sp.role : '';

  const [cards, connections, saved] = await Promise.all([
    discoverProfessionals(viewer.userId, { q, role }),
    listMyConnections(viewer.userId),
    savedProfileIds(viewer.userId),
  ]);

  const states = {};
  for (const c of connections) {
    const other = c.requesterId === viewer.userId ? c.recipientId : c.requesterId;
    states[other] = { status: c.status, direction: c.requesterId === viewer.userId ? 'out' : 'in' };
  }

  return <Discover cards={cards} states={states} savedIds={[...saved]} q={q} role={role} />;
}