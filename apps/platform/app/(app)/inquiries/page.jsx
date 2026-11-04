import Inquiries from '../../../src/app/views/Inquiries';

export const metadata = {
  title: 'Inquiries',
  description: 'People who wrote to you from a published page.',
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return <Inquiries empty={sp?.state === 'empty'} />;
}
