import SignIn from '../../../src/views/SignIn';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to your ORVN Labs workspace. Access is by invitation during early access.',
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const next = typeof params?.next === 'string' ? params.next : '/dashboard';
  return <SignIn next={next} />;
}
