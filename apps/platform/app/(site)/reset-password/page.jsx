import ResetPassword from '../../../src/views/ResetPassword';

export const metadata = {
  title: 'Choose a new password',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const token = typeof params?.token === 'string' ? params.token : '';
  return <ResetPassword token={token} />;
}
