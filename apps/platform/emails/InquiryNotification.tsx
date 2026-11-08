import * as React from 'react';
import { Action, Brand, Heading, Para, Quote, SmallPrint } from './components/Brand';

/**
 * One inquiry, forwarded to the business that published the page.
 *
 * The buyer's words are rendered as text in a React tree, so anything they typed — including a
 * tag — arrives as characters. Reply-to is the buyer, so answering is one click.
 */
export function InquiryNotification({
  inquirerName,
  inquirerEmail,
  message,
  propertyTitle,
  workspaceName,
  inboxUrl,
}: {
  inquirerName?: string | null;
  inquirerEmail: string;
  message: string;
  propertyTitle: string;
  workspaceName: string;
  inboxUrl: string;
}) {
  const from = inquirerName ? `${inquirerName} · ${inquirerEmail}` : inquirerEmail;

  return (
    <Brand
      preview={`${inquirerName ?? 'Someone'} asked about ${propertyTitle}.`}
      footnote={`You are receiving this because inquiry notifications are on for ${workspaceName}.`}
    >
      <Heading>New inquiry about {propertyTitle}</Heading>

      <Para muted>From {from}</Para>

      <Quote>{message}</Quote>

      <Action href={inboxUrl} note="Replying to this email answers the buyer directly.">
        Open the inquiry
      </Action>

      <SmallPrint>
        The inquiry is stored in {workspaceName}. It is not shared with anybody else, and it is not
        counted as a customer result.
      </SmallPrint>
    </Brand>
  );
}

export default InquiryNotification;
