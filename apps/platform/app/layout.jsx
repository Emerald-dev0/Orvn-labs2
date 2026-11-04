import '@fontsource-variable/bricolage-grotesque/index.css';
import '@fontsource-variable/figtree/index.css';
import '@fontsource-variable/figtree/wght-italic.css';
import '../src/index.css';
import '../src/styles/sections.css';

import Nav from '../src/components/site/Nav';
import Footer from '../src/components/site/Footer';

export const metadata = {
  metadataBase: new URL('https://orvnlabs.com'),
  title: {
    default: 'LAREI by ORVN Labs | Professional websites and property deal pages',
    template: '%s · ORVN Labs',
  },
  description:
    'LAREI is being built for wholesalers, agents, investors and real-estate operators who want one professional home for their brand, property portfolio and deal presentations.',
  applicationName: 'ORVN Labs',
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'ORVN Labs',
    title: 'LAREI by ORVN Labs | Professional websites and property deal pages',
    description:
      'One professional home for your brand, property portfolio and deal presentations. LAREI is in private beta.',
    url: '/',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ORVN Labs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LAREI by ORVN Labs',
    description: 'Professional websites, property portfolios and shareable property pages.',
    images: ['/logo.png'],
  },
};

export const viewport = {
  themeColor: '#0e1512',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
