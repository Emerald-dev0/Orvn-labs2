import Analytics from '../../../src/app/views/Analytics';
import { loadAppContext } from '../../../lib/app-context';
import { getAnalytics } from '../../../lib/data/workspace';

export const metadata = {
  title: 'Analytics',
  description: 'Page opens and inquiry counts, with their limits stated plainly.',
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const context = await loadAppContext();

  if (sp?.state === 'empty') {
    return <Analytics empty />;
  }

  if (context.demo) {
    return <Analytics sample />;
  }

  const data = await getAnalytics(context.viewer.userId, context.workspace.id, 30);
  const nothingYet = data.totals.views === 0 && data.totals.inquiries === 0 && data.totals.published === 0;
  if (nothingYet) {
    return <Analytics empty />;
  }

  return <Analytics data={data} />;
}
