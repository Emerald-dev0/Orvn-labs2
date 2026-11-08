import '../../src/styles/app.css';
import AppShell from '../../src/app/AppShell';
import { loadAppContext } from '../../lib/app-context';
import { isAdminEmail } from '../../lib/admin';

export const metadata = {
  title: 'Workspace',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function WorkspaceLayout({ children }) {
  const context = await loadAppContext();

  return (
    <AppShell
      workspace={context.shell}
      unread={context.unread}
      demo={context.demo}
      admin={context.demo ? false : isAdminEmail(context.viewer.email)}
    >
      {children}
    </AppShell>
  );
}
