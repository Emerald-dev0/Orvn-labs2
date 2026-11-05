"use client";

import React from 'react';
import LegalPage, { P, UL } from './LegalPage';

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/legal/privacy"
      lastUpdated="2026-11-05"
      description="What ORVN Labs collects when you visit this site, request early access or use LAREI, and what we do not do with it."
      intro="This policy describes what ORVN Labs collects when you visit orvnlabs.com, request early access, or use LAREI — and what we deliberately do not collect."
      sections={[
        {
          heading: 'Who this policy covers',
          body: (
            <>
              <P>Three groups of people:</P>
              <UL items={[
                'Visitors to orvnlabs.com, including anyone who requests early access or writes to us.',
                'People who use LAREI — during the beta, invited businesses and the individuals inside them.',
                'Buyers who send an inquiry through a published property page. For that inquiry, the business that published the page decides what happens to it and ORVN Labs processes it on their behalf.',
              ]} />
            </>
          ),
        },
        {
          heading: 'What we collect',
          body: (
            <UL items={[
              'Account details: your name, email address and password hash. Authentication is handled by our auth provider; we never see your password.',
              'Workspace content: your business profile, property records, notes, and the files you upload.',
              'Inquiries: the name, contact details and question a buyer chooses to send to a business through a published page.',
              'Early access requests: your name, email, and whatever you choose to tell us about how you work today.',
              'Security and operational logs: timestamps, IP-derived hashes, and error traces, kept to defend the service.',
              'Visit counts on published pages, recorded against a rotating hash rather than a stored identity.',
            ]} />
          ),
        },
        {
          heading: 'What we do not collect',
          body: (
            <UL items={[
              'No advertising or cross-site tracking cookies, and no third-party analytics SDKs.',
              'No location tracking. A static location on a listing is typed by the business, not derived from a device.',
              'No photo metadata. Uploaded images are re-encoded, which removes EXIF data such as GPS coordinates and device identifiers.',
              'Nothing that identifies an individual reader of a published page, and nothing that re-identifies a hashed visitor.',
            ]} />
          ),
        },
        {
          heading: 'Why we hold it',
          body: (
            <UL items={[
              'To run the product: accounts, workspaces, published pages and the inbox where inquiries arrive.',
              'To send transactional email only — invitations, password resets, and notice that an inquiry arrived.',
              'To keep the service secure and to investigate abuse.',
              'To meet legal obligations and to answer you when you write to us.',
            ]} />
          ),
        },
        {
          heading: 'How we share it',
          body: (
            <P>
              We do not sell personal information and we do not share it for advertising. We use a
              small number of subprocessors to operate the service — hosting, managed database, file
              storage and email delivery — each under a data-processing agreement, and each limited
              to what the task requires. We also share data with the business a record belongs to,
              and where the law requires it.
            </P>
          ),
        },
        {
          heading: 'What is private by default',
          body: (
            <>
              <P>
                A property that has not been published cannot be read by anyone outside its
                workspace, and neither can its files. Files are not given public links: every
                request passes a release check first. Withdrawing a publication stops the page and
                its files being served.
              </P>
              <P>
                Deleting a file removes it from storage, including the resized versions made for
                delivery.
              </P>
            </>
          ),
        },
        {
          heading: 'Retention',
          body: (
            <P>
              Workspace content is kept while the account is open. Inquiries are kept for as long
              as the business needs them and can be deleted on request. Early access requests are
              kept until the beta closes, then deleted. Security logs are kept for a limited period
              and rotated.
            </P>
          ),
        },
        {
          heading: 'Your rights',
          body: (
            <P>
              Write to hello@orvnlabs.com to ask what we hold about you, to correct it, or to have it
              deleted. If your inquiry went to a business through a published page, that business
              holds the record; we will support their response and delete on their instruction.
            </P>
          ),
        },
        {
          heading: 'Children',
          body: (
            <P>
              The site and LAREI are not directed to children under 13, and we do not knowingly
              collect their information.
            </P>
          ),
        },
        {
          heading: 'Changes',
          body: (
            <P>
              Material changes will update the date at the top of this page and be noted on the
              homepage. This policy is a draft pending review by counsel, as is everything under
              Legal.
            </P>
          ),
        },
      ]}
    />
  );
}
