import Website from '../../../src/app/views/Website';

export const metadata = {
  title: 'My website',
  description: 'A permanent address for the business, not a folder of links.',
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return <Website empty={sp?.state === 'empty'} />;
}
