import '@fontsource-variable/bricolage-grotesque/index.css';
import '@fontsource-variable/figtree/index.css';
import '@fontsource-variable/figtree/wght-italic.css';
import '../src/index.css';
import '../src/styles/sections.css';

export const metadata = {
  metadataBase: new URL('https://orvnlabs.com'),
  title: {
    default: 'ORVN Labs | Property presentations you can share',
    template: '%s · ORVN Labs',
  },
  description:
    'ORVN Labs is building a platform that turns property details into presentations you can share: organise a property, prepare an editable deal sheet and publish a professional page linked to your profile.',
  applicationName: 'ORVN Labs',
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'ORVN Labs',
    title: 'ORVN Labs | Property presentations you can share',
    description:
      'Organise a property, prepare an editable deal sheet, and publish a professional page linked to your profile. In development; early access is by request.',
    url: '/',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'ORVN Labs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ORVN Labs',
    description: 'Property records, deal sheets and shareable property pages from ORVN Labs.',
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
        {children}
      </body>
    </html>
  );
}
