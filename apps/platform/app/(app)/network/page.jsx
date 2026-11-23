import Network from '../../../src/app/views/Network';
import { requireUser } from '../../../lib/access';
import { listMyConnections, resolvePeople } from '../../../lib/data/network';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Network',
  robots: { index: false, follow: false },
};

export default async function Page() {
  const viewer = await requireUser('/network');
  const connections = await listMyConnections(viewer.userId);
  const others = connections.map((c) => (c.requesterId === viewer.userId ? c.recipientId : c.requesterId));
  const people = await resolvePeople(others);

  const enrich = (c) => {
    const other = c.requesterId === viewer.userId ? c.recipientId : c.requesterId;
    return { id: c.id, other, info: people[other] ?? { userId: other, name: 'ORREI member' } };
  };

  const incoming = connections
    .filter((c) => c.recipientId === viewer.userId && c.status === 'pending')
    .map(enrich);
  const accepted = connections.filter((c) => c.status === 'accepted').map(enrich);
  const sent = connections
    .filter((c) => c.requesterId === viewer.userId && c.status === 'pending')
    .map(enrich);

  return <Network incoming={incoming} accepted={accepted} sent={sent} />;
}