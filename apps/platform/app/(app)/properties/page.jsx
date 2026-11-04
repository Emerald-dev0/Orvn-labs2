import Properties from '../../../src/app/views/Properties';

export const metadata = {
  title: 'Properties',
  description: 'One record per property. Every page, sheet and printout is generated from it.',
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return <Properties empty={sp?.state === 'empty'} />;
}
