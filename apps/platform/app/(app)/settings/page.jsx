import Settings from '../../../src/app/views/Settings';

export const metadata = {
  title: 'Settings',
  description: 'Account, workspace and what leaves this building.',
};

export default async function Page() {
  return <Settings />;
}
