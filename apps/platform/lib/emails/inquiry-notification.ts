import type { EmailMessage } from '../email';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Tells the owner once. It never says the owner has read anything, because nobody has yet. */
export function inquiryNotificationEmail(opts: {
  to: string;
  inquirerName: string | null;
  inquirerEmail: string;
  message: string;
  propertyTitle: string;
  workspaceName: string;
  inboxUrl: string;
  inquiryId: string;
}): EmailMessage {
  const from = opts.inquirerName ? `${opts.inquirerName} (${opts.inquirerEmail})` : opts.inquirerEmail;

  return {
    to: opts.to,
    subject: `New inquiry: ${opts.propertyTitle}`,
    businessKey: `inquiry:${opts.inquiryId}`,
    replyTo: opts.inquirerEmail,
    text: [
      `Someone asked about ${opts.propertyTitle}.`,
      '',
      `From: ${from}`,
      '',
      opts.message,
      '',
      `Open the inquiry in ${opts.workspaceName}: ${opts.inboxUrl}`,
      '',
      'You are receiving this because inquiry notifications are on for this workspace.',
    ].join('\n'),
    html: [
      `<p>Someone asked about <strong>${escape(opts.propertyTitle)}</strong>.</p>`,
      `<p style="color:#6b7280;font-size:13px">From: ${escape(from)}</p>`,
      `<blockquote style="margin:0;padding:12px 16px;background:#f6f4ee;border-radius:10px">${escape(
        opts.message,
      ).replace(/\n/g, '<br>')}</blockquote>`,
      `<p><a href="${escape(opts.inboxUrl)}">Open the inquiry</a></p>`,
    ].join(''),
  };
}
