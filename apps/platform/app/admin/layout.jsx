import Link from 'next/link';
import '../../src/styles/app.css';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** The operator surface. Deliberately plain: it is read once a day, not lived in. */
export default function AdminLayout({ children }) {
  return (
    <div className="adm">
      <header className="adm-bar">
        <Link href="/admin/early-access" className="adm-brand">
          <span className="adm-mark" aria-hidden="true">O</span>
          <span>
            <strong>ORREI</strong>
            <em>Admin</em>
          </span>
        </Link>
        <nav className="adm-nav" aria-label="Admin">
          <Link href="/admin/early-access">Early access</Link>
          <Link href="/dashboard">Workspace</Link>
          <Link href="/">Site</Link>
        </nav>
      </header>
      <main className="adm-main">{children}</main>
    </div>
  );
}
