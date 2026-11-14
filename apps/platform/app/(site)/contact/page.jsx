import Contact from '../../../src/views/Contact';

export const metadata = {
  alternates: { canonical: '/contact' },
  title: 'Contact',
  description: 'Talk to a person at ORVN Labs about ORREI, early access or anything on this site.',
};

export default function Page() {
  return <Contact />;
}
