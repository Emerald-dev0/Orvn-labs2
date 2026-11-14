import FAQ from '../../../src/views/FAQ';

export const metadata = {
  alternates: { canonical: '/faq' },
  title: 'FAQ',
  description: 'The practical questions people ask before signing up: what ORREI does, what it does not do, and when it ships.',
};

export default function Page() {
  return <FAQ />;
}
