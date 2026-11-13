import '../../src/styles/app.css';
import { getViewer } from '../../lib/access';
import AdminNav from './AdminNav';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * The operator surface: a sidebar on desktop, a top bar on phones. Pages are read by a few people
 * every day, so the layout favours a clear current location over decoration.
 */
export default async function AdminLayout({ children }) {
  const viewer = await getViewer();
  return (
    <div className="adm">
      <div className="adm-shell">
        <AdminNav email={viewer?.email ?? null} />
        <main id="main" className="adm-main">{children}</main>
      </div>
    </div>
  );
}
