import Inquiries from '../../../src/app/views/Inquiries';
import { loadAppContext } from '../../../lib/app-context';
import { listInquiryCards } from '../../../lib/data/workspace';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Inquiries',
  description: 'People who wrote to you from a published page.',
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const context = await loadAppContext();

  if (context.demo) {
    return <Inquiries empty={params?.state === 'empty'} />;
  }

  const items = await listInquiryCards(context.viewer.userId, context.workspace.id);
  return <Inquiries empty={params?.state === 'empty'} items={items} />;
}
