import NewProperty from '../../../../src/app/views/NewProperty';
import { databaseConfigured } from '../../../../lib/db/tenant';

export const metadata = { title: 'Create a property', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function Page() {
  // The same screen either creates a record or explains why it cannot.
  return <NewProperty live={databaseConfigured} />;
}
