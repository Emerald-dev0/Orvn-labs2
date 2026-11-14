import EarlyAccess from '../../../src/views/EarlyAccess';

export const metadata = {
  alternates: { canonical: '/early-access' },
  title: 'Early access',
  description: 'Ask for early access to ORREI, the workspace ORVN Labs is building. Applications are reviewed individually.',
};

export default function Page() {
  return <EarlyAccess />;
}
