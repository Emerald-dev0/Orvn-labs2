import React from 'react';
import LegalPage, { P, UL } from './LegalPage';

export default function AIDisclosure() {
  return (
    <LegalPage
      title="AI / Call Recording Disclosure"
      path="/legal/ai-disclosure"
      lastUpdated="2026-05-01"
      intro="PAS uses AI to handle first-contact conversations on behalf of customer brokerages. This page explains how that works, when leads are notified, and how recordings are handled."
      sections={[
        {
          heading: 'AI-assisted conversation',
          body: (
            <P>
              When PAS answers a lead, the conversation is AI-driven. PAS identifies itself as a
              brokerage assistant and follows the brokerage’s scripts and routing rules. A human
              agent enters the conversation when PAS hands off, escalates, or when the lead
              requests a human.
            </P>
          ),
        },
        {
          heading: 'Notice and consent',
          body: (
            <UL items={[
              'Voice calls handled by PAS include an audible disclosure that the call is being recorded and may use AI, in accordance with applicable consent requirements.',
              'SMS and chat conversations are confirmed by the lead’s response and subject to TCPA and platform terms.',
              'Brokerages are responsible for configuring consent language consistent with the laws of their state(s) (one-party vs two-party consent jurisdictions).',
            ]} />
          ),
        },
        {
          heading: 'Recording and transcription',
          body: (
            <UL items={[
              'PAS may record voice calls and store transcripts for service delivery, quality, and compliance.',
              'Recordings are encrypted in transit and at rest.',
              'Retention windows follow the Data Retention Policy.',
            ]} />
          ),
        },
        {
          heading: 'Lead requests',
          body: (
            <P>
              A lead can request human handoff at any time. They may also request that the
              recording be deleted, subject to the brokerage’s retention obligations and applicable
              law. Requests can be sent to hello@orvnlabs.com or to the brokerage directly.
            </P>
          ),
        },
      ]}
    />
  );
}
