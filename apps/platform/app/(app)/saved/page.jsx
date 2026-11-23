import Saved from '../../../src/app/views/Saved';
import { requireUser } from '../../../lib/access';
import { listSaved, getProfilesByIds } from '../../../lib/data/network';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Saved',
  robots: { index: false, follow: false },
};

export default async function Page() {
  const viewer = await requireUser('/saved');
  const saved = await listSaved(viewer.userId);
  const cards = await getProfilesByIds(saved.map((s) => s.profileId));
  return <Saved cards={cards} />;
}