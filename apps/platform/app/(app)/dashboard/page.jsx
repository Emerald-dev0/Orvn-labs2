import Dashboard from '../../../src/app/views/Dashboard';
import { loadAppContext } from '../../../lib/app-context';
import { getOverview } from '../../../lib/data/workspace';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Overview',
  description: 'What is published, what is waiting, and who got in touch.',
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const context = await loadAppContext();

  if (context.demo) {
    return <Dashboard empty={params?.state === 'empty'} />;
  }

  const overview = await getOverview(context.viewer.userId, context.workspace.id);
  return <Dashboard empty={params?.state === 'empty'} data={overview} />;
}
