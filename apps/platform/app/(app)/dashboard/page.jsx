import Dashboard from '../../../src/app/views/Dashboard';

export const metadata = {
  title: 'Overview',
  description: 'What is published, what is waiting, and who got in touch.',
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return <Dashboard empty={sp?.state === 'empty'} />;
}
