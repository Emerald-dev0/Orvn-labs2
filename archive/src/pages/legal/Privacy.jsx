import React from 'react';
import LegalPage, { P, UL } from './LegalPage';

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/legal/privacy"
      lastUpdated="2026-05-01"
      intro="This Privacy Policy describes how ORVN Labs collects, uses, and protects information when you visit orvnlabs.com or interact with PAS through a customer brokerage."
      sections={[
        {
          heading: 'Who this policy applies to',
          body: (
            <>
              <P>This policy covers two distinct audiences:</P>
              <UL items={[
                'Visitors to orvnlabs.com (you, reading this).',
                'End-leads of brokerages that use PAS — for those interactions, the brokerage is the data controller and ORVN Labs is the processor.',
              ]} />
            </>
          ),
        },
        {
          heading: 'What we collect from website visitors',
          body: (
            <UL items={[
              'Form submissions (newsletter, calculator email capture, contact requests).',
              'Standard server logs (IP, user agent, referrer) for security and analytics.',
              'Aggregated, anonymous usage analytics.',
            ]} />
          ),
        },
        {
          heading: 'What PAS processes for customer brokerages',
          body: (
            <UL items={[
              'Lead contact information (name, phone, email, channel, timestamp).',
              'Conversation content (transcripts and summaries of inbound calls, SMS, chat, email).',
              'Qualification data captured during the conversation (intent, budget, timeline, location).',
              'Routing outcomes and booking details.',
              'Usage and operational metadata (call duration, channels used, status changes).',
            ]} />
          ),
        },
        {
          heading: 'How we use information',
          body: (
            <UL items={[
              'To deliver the PAS service to the brokerage.',
              'To produce dashboards and PAS Intelligence Reports for the brokerage.',
              'To respond to inbound enquiries and newsletter signups.',
              'To improve the product (in aggregated, de-identified form only).',
              'To meet legal, security, and compliance obligations.',
            ]} />
          ),
        },
        {
          heading: 'How we share information',
          body: (
            <P>
              We do not sell personal information. We share information only with subprocessors
              required to operate PAS (telephony, transcription, model providers, hosting), all
              under written data-protection agreements; with the customer brokerage that owns the
              lead record; and where required by law.
            </P>
          ),
        },
        {
          heading: 'Your rights',
          body: (
            <P>
              You may request access, correction, or deletion of your personal information by
              emailing hello@orvnlabs.com. For PAS lead data held on behalf of a brokerage,
              contact the brokerage directly; we will support their response.
            </P>
          ),
        },
        {
          heading: 'Children',
          body: <P>The website and PAS are not directed to children under 13 and do not knowingly collect their information.</P>,
        },
        {
          heading: 'Changes to this policy',
          body: <P>We will update the “Last updated” date and, for material changes, post a notice on the homepage.</P>,
        },
      ]}
    />
  );
}
