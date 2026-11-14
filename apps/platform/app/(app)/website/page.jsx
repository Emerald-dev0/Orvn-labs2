import Website from '../../../src/app/views/Website';
import { loadAppContext } from '../../../lib/app-context';
import { getProfile } from '../../../lib/data/workspace';
import { withUserDb } from '../../../lib/db/tenant';
import { properties } from '../../../db/schema';
import { eq, sql } from 'drizzle-orm';

export const metadata = {
  title: 'Professional profile',
  description: 'A permanent address for the business, not a folder of links.',
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const context = await loadAppContext();

  if (sp?.state === 'empty' || context.demo) {
    return <Website empty={sp?.state === 'empty'} sample={context.demo} />;
  }

  const { profile, workspace } = await getProfile(context.viewer.userId, context.workspace.id);
  const [portfolioRow] = await withUserDb(context.viewer.userId, async (tx) =>
    tx
      .select({
        total: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where ${properties.publicationStatus} = 'published')::int`,
      })
      .from(properties)
      .where(eq(properties.workspaceId, context.workspace.id)),
  );

  return (
    <Website
      data={{
        profile,
        workspace,
        publishedCount: portfolioRow?.published ?? 0,
        totalCount: portfolioRow?.total ?? 0,
      }}
    />
  );
}
