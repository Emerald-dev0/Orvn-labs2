import Privacy from '../../../../src/views/legal/Privacy';

export const metadata = {
  alternates: { canonical: '/legal/privacy' },
  title: 'Privacy Policy',
  description: 'What ORVN Labs collects, why, how long it is kept and what you can ask us to do. The ORREI privacy notice.',
};

export default function Page() {
  return <Privacy />;
}
