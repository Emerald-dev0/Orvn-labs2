import Nav from '../src/components/site/Nav';
import Footer from '../src/components/site/Footer';
import NotFound from '../src/views/NotFound';

export const metadata = {
  title: 'Not on the register',
  description: 'That address is not listed here. Every page that does exist is one tap away.',
  robots: { index: false, follow: true },
};

export default function NotFoundRoute() {
  return (
    <>
      <Nav />
      <NotFound />
      <Footer />
    </>
  );
}
