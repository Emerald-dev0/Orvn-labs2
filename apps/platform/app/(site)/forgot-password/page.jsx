import ForgotPassword from '../../../src/views/ForgotPassword';

export const metadata = {
  title: 'Reset your password',
  description: 'Request a password reset link for your LAREI account.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ForgotPassword />;
}
