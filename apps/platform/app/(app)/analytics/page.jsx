import Analytics from '../../../src/app/views/Analytics';

export const metadata = {
  title: 'Analytics',
  description: 'What was viewed, what was clicked, and what prompted a reply.',
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return <Analytics empty={sp?.state === 'empty'} />;
}
