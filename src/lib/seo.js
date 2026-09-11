import { useEffect } from 'react';

const SITE = {
  name: 'ORVN Labs',
  url: 'https://orvnlabs.com',
  defaultTitle: 'ORVN Labs — AI First-Touch Infrastructure for Real Estate Brokerages',
  defaultDescription:
    'ORVN Labs builds brokerage intelligence infrastructure. PAS answers, qualifies, routes, books, and logs inbound real estate leads before delay kills conversion.',
};

const setMeta = (name, content, attr = 'name') => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setLink = (rel, href) => {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const setJsonLd = (data) => {
  let el = document.head.querySelector('script[type="application/ld+json"]');
  if (el) {
    el.textContent = JSON.stringify(data);
  } else {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
  }
};

export function useDocumentMeta({ title, description, path, image, type = 'website', canonical, schema } = {}) {
  useEffect(() => {
    const finalTitle = title ? `${title} — ${SITE.name}` : SITE.defaultTitle;
    const finalDesc = description || SITE.defaultDescription;
    const finalUrl = path ? `${SITE.url}${path}` : SITE.url;
    const finalImage = image || `${SITE.url}/og-default.png`;
    const finalCanonical = canonical || finalUrl;

    document.title = finalTitle;
    setMeta('description', finalDesc);
    setMeta('og:title', finalTitle, 'property');
    setMeta('og:description', finalDesc, 'property');
    setMeta('og:url', finalUrl, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:image', finalImage, 'property');
    setMeta('og:site_name', SITE.name, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', finalTitle);
    setMeta('twitter:description', finalDesc);
    setMeta('twitter:image', finalImage);
    setLink('canonical', finalCanonical);

    // Default global schema: @graph so AI agents and search engines get the
    // site entity, the org entity, and the product entity in one payload.
    // Page-level `schema` merges in and wins on conflicting keys.
    const defaultSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${SITE.url}/#org`,
          name: SITE.name,
          url: SITE.url,
          logo: `${SITE.url}/logo.png`,
          description: SITE.defaultDescription,
          email: 'hello@orvnlabs.com',
          knowsAbout: [
            'first-contact infrastructure',
            'lead response management',
            'real estate lead conversion',
            'AI call handling',
            'appointment booking automation',
            'CRM hygiene',
          ],
          sameAs: [
            'https://twitter.com/orvnlabs',
            'https://linkedin.com/company/orvnlabs',
          ],
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE.url}/#website`,
          url: SITE.url,
          name: SITE.name,
          publisher: { '@id': `${SITE.url}/#org` },
        },
      ],
    };

    if (schema) {
      if (schema['@graph']) {
        setJsonLd({
          '@context': 'https://schema.org',
          '@graph': [...defaultSchema['@graph'], ...schema['@graph']],
        });
      } else {
        setJsonLd({ ...defaultSchema, ...schema });
      }
    } else {
      setJsonLd(defaultSchema);
    }
  }, [title, description, path, image, type, canonical, schema]);
}

export const SITE_INFO = SITE;
