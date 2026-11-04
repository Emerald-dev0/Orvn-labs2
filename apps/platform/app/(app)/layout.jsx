import '../../src/styles/app.css';
import AppShell from '../../src/app/AppShell';

export const metadata = {
  title: 'Workspace',
  robots: { index: false, follow: false },
};

export default function WorkspaceLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
