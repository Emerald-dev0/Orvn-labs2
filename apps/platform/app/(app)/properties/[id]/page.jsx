import PropertyDetail from '../../../../src/app/views/PropertyDetail';

export const metadata = { title: 'Property', robots: { index: false, follow: false } };

export default async function Page({ params, searchParams }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const tab = typeof sp?.tab === 'string' ? sp.tab : 'overview';
  return <PropertyDetail id={id} initialTab={tab} />;
}
