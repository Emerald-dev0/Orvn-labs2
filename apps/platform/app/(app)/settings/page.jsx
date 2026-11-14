import Settings from '../../../src/app/views/Settings';
import { loadAppContext } from '../../../lib/app-context';
import { listMembers } from '../../../lib/data/workspace';

export const metadata = {
  title: 'Settings',
  description: 'Account, workspace and what leaves this building.',
};

export default async function Page() {
  const context = await loadAppContext();

  if (context.demo) {
    return <Settings data={null} />;
  }

  const members = await listMembers(context.viewer.userId, context.workspace.id);
  const isOwner = context.workspace.role === 'owner';

  return (
    <Settings
      showNotifications={isOwner}
      data={{
        workspace: { name: context.workspace.name, username: context.workspace.username },
        owner: { name: context.viewer.name, email: context.viewer.email },
        memberCount: members.length,
      }}
    />
  );
}
