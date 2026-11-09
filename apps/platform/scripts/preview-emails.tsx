/**
 * Renders every email to a standalone HTML file so the design can be looked at in a browser.
 *
 *   npm run email:preview
 *
 * The output goes to `public/preview-emails/`, which is gitignored: these are proofs, not
 * product assets, and they must never ship to a customer.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { render } from '@react-email/render';
import { Invitation } from '../emails/Invitation';
import { ResetPassword } from '../emails/ResetPassword';
import { SignInLink } from '../emails/SignInLink';
import { InquiryNotification } from '../emails/InquiryNotification';
import { BetaApplication } from '../emails/BetaApplication';
import { EarlyAccessReceived } from '../emails/EarlyAccessReceived';
import { ContactMessage } from '../emails/ContactMessage';

const outDir = path.join(process.cwd(), 'public', 'preview-emails');

const samples = [
  {
    name: 'invitation',
    element: (
      <Invitation
        workspaceName="Northaven Property Group"
        acceptUrl="https://orvnlabs.com/invite/9f2c1a7e-5b6d-4c8a-9e10-2f3b4c5d6e7f"
        expiresAt={new Date('2026-11-11T18:30:00Z')}
      />
    ),
  },
  {
    name: 'reset-password',
    element: (
      <ResetPassword url="https://orvnlabs.com/reset-password?token=8d1f0a2b3c4d5e6f7a8b9c0d1e2f3a4b" />
    ),
  },
  {
    name: 'sign-in-link',
    element: (
      <SignInLink
        url="https://orvnlabs.com/sign-in?token=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
        expiresAt={new Date('2026-11-04T14:10:00Z')}
      />
    ),
  },
  {
    name: 'inquiry',
    element: (
      <InquiryNotification
        inquirerName="Tunde Balogun"
        inquirerEmail="tunde@example.com"
        message={
          'Is the service charge fixed for the first year, and can I see the survey before an offer? I am free on Saturday morning.'
        }
        propertyTitle="Harbour house, four bedrooms"
        workspaceName="Northaven Property Group"
        inboxUrl="https://orvnlabs.com/inquiries/6b1c2d3e-4f50-4a1b-8c2d-3e4f5a6b7c8d"
      />
    ),
  },
  {
    name: 'early-access-received',
    element: (
      <EarlyAccessReceived
        name="Ada Okonkwo"
        email="ada@example.com"
        company="Northaven Property Group"
        role="Agent or broker"
        markets="Lagos mainland"
        volume="3–10"
        frustration="Rebuilding the same deck for every viewing, and it never looks the same twice."
        receivedAt={new Date('2026-11-08T09:15:00Z')}
        productUrl="https://orvnlabs.com/product"
      />
    ),
  },
  {
    name: 'contact-message',
    element: (
      <ContactMessage
        id="msg_1"
        name="Ada Okonkwo"
        email="ada@example.com"
        company="Northaven Property Group"
        topic="Teams and agencies"
        message="We list around twenty units a month and the deck is rebuilt by hand each time."
        receivedAt={new Date('2026-11-08T09:15:00Z')}
      />
    ),
  },
  {
    name: 'beta-application',
    element: (
      <BetaApplication
        id="app_9f2c1a7e"
        name="Ada Okonkwo"
        email="ada@northaven.example"
        company="Northaven Property Group"
        role="Wholesaler or disposition lead"
        markets="Portland, Oregon"
        volume="3–10"
        currentTools="A PDF template, a WhatsApp broadcast list and a shared drive."
        frustration="Every buyer asks for the same three details and I retype them each time."
        website="northaven.example"
        receivedAt={new Date('2026-11-04T09:12:00Z')}
        adminUrl="https://orvnlabs.com/admin/early-access#9f2c1a7e-5b6d-4c8a-9e10-2f3b4c5d6e7f"
      />
    ),
  },
];

async function main() {
  await mkdir(outDir, { recursive: true });

  for (const sample of samples) {
    const html = await render(sample.element, { pretty: true });
    const file = path.join(outDir, `${sample.name}.html`);
    await writeFile(file, html, 'utf8');
    console.log(`wrote ${path.relative(process.cwd(), file)}`);
  }
}

await main();
