import React from 'react';
import LegalPage, { P, UL } from './LegalPage';

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      path="/legal/terms"
      lastUpdated="2026-05-01"
      intro="These Terms govern access to orvnlabs.com and the marketing tools published here. PAS service usage is governed by a separate Master Services Agreement signed at the time of engagement."
      sections={[
        {
          heading: 'Use of the website',
          body: (
            <UL items={[
              'You may browse, read, and use the calculators, blog, and newsletter for lawful purposes.',
              'You may not scrape, reverse-engineer, or use automated tools to extract content beyond what robots.txt allows.',
              'You may not impersonate ORVN Labs, PAS, or any other person.',
            ]} />
          ),
        },
        {
          heading: 'Calculators and content',
          body: (
            <P>
              Numbers produced by the calculators are estimates intended for diagnostic purposes.
              Blog content reflects opinion and operating experience. Neither constitutes
              financial, legal, or fiduciary advice.
            </P>
          ),
        },
        {
          heading: 'Intellectual property',
          body: (
            <P>
              The site, brand, and content are © ORVN Labs. PAS is a trademark of ORVN Labs.
              Personal, non-commercial sharing is welcome with attribution.
            </P>
          ),
        },
        {
          heading: 'PAS service terms',
          body: (
            <P>
              Access to PAS, its dashboard, and APIs is governed by the Master Services Agreement
              signed by the customer brokerage. Nothing on this website creates a PAS service
              contract.
            </P>
          ),
        },
        {
          heading: 'Disclaimers',
          body: (
            <P>
              The site is provided “as is”. We make no warranties as to availability, accuracy, or
              fitness for any particular purpose, beyond what is required by applicable law.
            </P>
          ),
        },
        {
          heading: 'Limitation of liability',
          body: (
            <P>
              To the maximum extent permitted by law, ORVN Labs is not liable for indirect,
              incidental, or consequential damages arising from the use of this website. PAS
              service liability is set in the Master Services Agreement.
            </P>
          ),
        },
        {
          heading: 'Governing law',
          body: <P>{/* TODO: counsel to confirm jurisdiction. */}These Terms are governed by the laws of the jurisdiction confirmed in the Master Services Agreement at engagement.</P>,
        },
      ]}
    />
  );
}
