import Home from '../../src/views/Home';

export const metadata = {
  alternates: { canonical: '/' },
  description:
    'ORREI, from ORVN Labs, turns property details into presentations you can share: organise a property, prepare an editable deal sheet and publish a professional page linked to your profile.',
};

export default function Page() {
  return <Home />;
}
