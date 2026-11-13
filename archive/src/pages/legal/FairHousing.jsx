import React from 'react';
import LegalPage, { P, UL } from './LegalPage';

export default function FairHousing() {
  return (
    <LegalPage
      title="Fair Housing Compliance Guardrails"
      path="/legal/fair-housing"
      lastUpdated="2026-05-01"
      intro="PAS is built to qualify real estate leads on intent and operational fit — never on protected traits. This page describes the guardrails baked into the system."
      sections={[
        {
          heading: 'Protected classes — never qualified on',
          body: (
            <UL items={[
              'Race or color',
              'Religion',
              'Sex (including gender identity and sexual orientation)',
              'National origin',
              'Familial status (including children)',
              'Disability',
              'Source of income (where state/local law extends Fair Housing).',
            ]} />
          ),
        },
        {
          heading: 'What PAS does qualify on',
          body: (
            <UL items={[
              'Intent — buy, sell, both, or information-gathering.',
              'Budget and financing readiness.',
              'Timeline and urgency.',
              'Location or property interest expressed by the lead.',
              'Availability for an appointment.',
              'Consent to be contacted.',
            ]} />
          ),
        },
        {
          heading: 'Conversation guardrails',
          body: (
            <UL items={[
              'PAS does not ask about, infer from, or use protected-class signals to alter routing, scripts, or follow-up cadence.',
              'If a lead volunteers protected-class information, PAS does not act on it and does not store it as a routing input.',
              'Steering — pushing leads toward or away from neighborhoods based on protected traits — is explicitly disallowed.',
            ]} />
          ),
        },
        {
          heading: 'Brokerage responsibility',
          body: (
            <P>
              Brokerages remain responsible for Fair Housing compliance under applicable federal,
              state, and local law. ORVN Labs’ guardrails support compliance but do not transfer
              responsibility for fair housing outcomes off the brokerage.
            </P>
          ),
        },
        {
          heading: 'Audit and review',
          body: (
            <P>
              Conversation logs are available to the brokerage for compliance audits. ORVN Labs
              reviews high-risk patterns and can produce reports on routing fairness on request.
            </P>
          ),
        },
      ]}
    />
  );
}
