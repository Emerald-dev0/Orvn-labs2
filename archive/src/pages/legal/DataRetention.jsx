import React from 'react';
import LegalPage, { P, UL } from './LegalPage';

export default function DataRetention() {
  return (
    <LegalPage
      title="Data Retention Policy"
      path="/legal/data-retention"
      lastUpdated="2026-05-01"
      intro="This policy describes how long PAS retains different categories of data and how deletion requests are handled."
      sections={[
        {
          heading: 'Retention windows',
          body: (
            <UL items={[
              'Lead identifiers (name, phone, email): retained for the term of the brokerage’s subscription, plus a 30-day grace period after termination.',
              'Conversation transcripts and summaries: retained for 24 months by default; brokerages may shorten this on request.',
              'Voice recordings: retained for 90 days by default; configurable by the brokerage.',
              'Usage and operational metadata (timestamps, durations, channel): retained for 24 months for reporting.',
              'Aggregated, de-identified analytics: retained indefinitely.',
            ]} />
          ),
        },
        {
          heading: 'Deletion requests',
          body: (
            <P>
              The brokerage may request deletion of any subset of records on request. Individual
              leads may request deletion under applicable privacy law (CCPA, GDPR where in scope,
              etc.); ORVN Labs supports the brokerage’s response.
            </P>
          ),
        },
        {
          heading: 'Backups',
          body: (
            <P>
              Encrypted backups are retained for up to 35 days for disaster recovery. Deleted
              records are purged from active systems immediately and from backups within the
              backup rotation window.
            </P>
          ),
        },
        {
          heading: 'Subprocessors',
          body: (
            <P>
              Subprocessor retention windows are bounded by ORVN Labs’ contracts with each
              subprocessor and never exceed the windows above for customer data.
              {/* TODO: maintain a public subprocessor list once finalized. */}
            </P>
          ),
        },
      ]}
    />
  );
}
