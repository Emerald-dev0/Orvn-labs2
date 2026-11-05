import Properties from '../../../src/app/views/Properties';
import { loadAppContext } from '../../../lib/app-context';
import { listPropertyCards } from '../../../lib/data/workspace';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Properties',
  description: 'One record per property. Every page, sheet and printout is generated from it.',
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const context = await loadAppContext();

  if (context.demo) {
    return <Properties empty={params?.state === 'empty'} />;
  }

  const items = await listPropertyCards(context.viewer.userId, context.workspace.id);
  return <Properties empty={params?.state === 'empty'} items={items} />;
}
