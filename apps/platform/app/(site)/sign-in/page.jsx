import SignIn from '../../../src/views/SignIn';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to ORREI, the workspace ORVN Labs is building. Access is by invitation during early access.',
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const next = typeof params?.next === 'string' ? params.next : '/dashboard';
  const refused = params?.refused === '1';
  return <SignIn next={next} refused={refused} />;
}
