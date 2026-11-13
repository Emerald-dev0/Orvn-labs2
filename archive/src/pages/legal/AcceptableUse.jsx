import React from 'react';
import LegalPage, { P, UL } from './LegalPage';

export default function AcceptableUse() {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      path="/legal/acceptable-use"
      lastUpdated="2026-05-01"
      intro="PAS exists to protect intent and route inbound real estate leads. It is not a tool for spam, illegal outreach, or discrimination. This policy makes the line clear."
      sections={[
        {
          heading: 'Permitted use',
          body: (
            <UL items={[
              'Responding to inbound leads who voluntarily contacted the brokerage.',
              'Qualifying leads on intent, budget, timeline, location, and consent.',
              'Booking appointments and routing leads to agents.',
              'Logging conversation outcomes for the brokerage’s own records.',
            ]} />
          ),
        },
        {
          heading: 'Prohibited use',
          body: (
            <UL items={[
              'Cold outbound messaging or calling without consent.',
              'Spam, harassment, or repeated contact after opt-out.',
              'Discrimination based on race, color, religion, sex, national origin, familial status, or disability.',
              'Misrepresenting that PAS is a human, when asked directly.',
              'Use to evade do-not-call lists, TCPA, or analogous regulations.',
              'Use against any individual without a real estate basis.',
            ]} />
          ),
        },
        {
          heading: 'Enforcement',
          body: (
            <P>
              Violations may result in suspension or termination of PAS access. ORVN Labs reserves
              the right to refuse onboarding for brokerages whose practices conflict with this
              policy.
            </P>
          ),
        },
        {
          heading: 'Reporting',
          body: <P>Suspected violations can be reported to abuse@orvnlabs.com. Reports are reviewed and acted on promptly.</P>,
        },
      ]}
    />
  );
}
