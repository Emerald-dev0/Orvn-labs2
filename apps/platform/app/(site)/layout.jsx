import Nav from '../../src/components/site/Nav';
import Footer from '../../src/components/site/Footer';

export default function SiteLayout({ children }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
