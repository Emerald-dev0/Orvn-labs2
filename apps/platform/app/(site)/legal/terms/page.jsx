import Terms from '../../../../src/views/legal/Terms';

export const metadata = {
  alternates: { canonical: '/legal/terms' },
  title: 'Terms of Use',
  description: 'The terms that apply when you use orvnlabs.com and ORREI: acceptable use, early access, IP and liability.',
};

export default function Page() {
  return <Terms />;
}
