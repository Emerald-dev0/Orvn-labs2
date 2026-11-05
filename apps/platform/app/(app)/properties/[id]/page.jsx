import { notFound } from 'next/navigation';
import { mediaUrl } from '@/lib/images';
import PropertyDetail from '../../../../src/app/views/PropertyDetail';
import { loadAppContext } from '../../../../lib/app-context';
import { getPropertyDetail } from '../../../../lib/data/workspace';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Property',
  robots: { index: false, follow: false },
};

export default async function Page({ params, searchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const tab = typeof query?.tab === 'string' ? query.tab : 'overview';
  const context = await loadAppContext();

  if (context.demo) {
    return <PropertyDetail id={id} initialTab={tab} />;
  }

  const property = await getPropertyDetail(context.viewer.userId, context.workspace.id, id);
  if (!property) notFound();

  return (
    <PropertyDetail
      id={property.id}
      property={{
        ...property,
        cover: mediaUrl(property.cover, { width: 960 }) ?? null,
      }}
      initialTab={tab}
      live={context.workspace.role !== 'viewer'}
      publicPath={`/w/${context.workspace.username}/p/${property.slug}`}
    />
  );
}
