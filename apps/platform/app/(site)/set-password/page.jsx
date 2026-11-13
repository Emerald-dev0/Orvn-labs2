import SetPasswordForm from './SetPasswordForm';

export const metadata = {
  title: 'Set a password',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function SetPasswordPage() {
  return <SetPasswordForm />;
}
