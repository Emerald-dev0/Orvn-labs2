"use client";

import React from 'react';
import LegalPage, { P, UL } from './LegalPage';

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      path="/legal/terms"
      lastUpdated="2026-11-05"
      description="The terms that apply to orvnlabs.com and to LAREI during its private beta."
      intro="These terms cover this website and access to LAREI while it is in private beta. They are short because the beta is short."
      sections={[
        {
          heading: 'Using this site',
          body: (
            <UL items={[
              'You may read, link to and share this site for lawful purposes.',
              'You may not scrape it, reverse-engineer it, or use automated tools to extract content beyond what robots.txt allows.',
              'You may not impersonate ORVN Labs, LAREI, a business that publishes here, or any other person.',
            ]} />
          ),
        },
        {
          heading: 'Beta access',
          body: (
            <>
              <P>
                LAREI is invitation only and not on general sale. Access is granted to a named
                business and the people invited into it; it cannot be transferred. Nothing is
                charged during the beta, and there is no obligation to continue afterwards.
              </P>
              <P>
                Because it is a beta, features change, and we may pause or end access. If we end a
                workspace we will give notice and a way to export your content. A request for
                access is not a promise of an invitation.
              </P>
            </>
          ),
        },
        {
          heading: 'Your content stays yours',
          body: (
            <>
              <P>
                Property records, photographs and business details you upload remain yours. You give
                us permission to store, resize, and serve them for the purpose of running your
                workspace and any page you choose to publish.
              </P>
              <P>
                You confirm you have the right to publish what you upload — that the photographs are
                yours to use and the facts are accurate as far as you know. Facts you have not
                confirmed are marked unknown rather than filled in, and a page will not publish
                while required details are missing.
              </P>
            </>
          ),
        },
        {
          heading: 'Published pages',
          body: (
            <UL items={[
              'You are responsible for the accuracy of a published listing, and for keeping it current.',
              'Listings must not discriminate on grounds protected by fair housing law, including race, colour, religion, sex, national origin, familial status, disability, or source of income where local law extends protection.',
              'Publishing does not create a contract, an offer, or a valuation. Prices shown are the ones you entered.',
              'Withdrawing a publication stops the page and its files being served.',
            ]} />
          ),
        },
        {
          heading: 'Our content',
          body: (
            <P>
              The site, its design and its writing belong to ORVN Labs. LAREI and ORVN Labs are
              names of ORVN Labs. Personal, non-commercial sharing is welcome with attribution.
              Screens and listings used on this site are illustrative.
            </P>
          ),
        },
        {
          heading: 'Content on this site is not advice',
          body: (
            <P>
              Anything published here — including the calculators and the journal — is general
              information for people working in real estate. It is not financial, legal, valuation
              or fiduciary advice, and it does not know your circumstances.
            </P>
          ),
        },
        {
          heading: 'Disclaimers',
          body: (
            <P>
              The site and the beta are provided “as is”. Beyond what applicable law requires, we
              make no warranty about availability, accuracy or fitness for a particular purpose.
            </P>
          ),
        },
        {
          heading: 'Limitation of liability',
          body: (
            <P>
              To the maximum extent permitted by law, ORVN Labs is not liable for indirect,
              incidental or consequential loss arising from use of this site or the beta, including
              a lost deal or a missed inquiry.
            </P>
          ),
        },
        {
          heading: 'Governing law',
          body: (
            <P>{/* TODO: counsel to confirm jurisdiction. */}These terms are governed by the law of the jurisdiction ORVN Labs is established in, which will be named here once confirmed by counsel.</P>
          ),
        },
      ]}
    />
  );
}
