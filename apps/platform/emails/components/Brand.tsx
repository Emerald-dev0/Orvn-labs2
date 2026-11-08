import * as React from 'react';
import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

/**
 * The shell every email shares.
 *
 * It is the site in miniature: bone page, pine header with the ORREI wordmark, a warm-white
 * card, lime used once for the action, and a quiet footer that says who sent this and why.
 * Colours are inline because mail clients strip stylesheets; the layout is a single column
 * because Outlook still behaves like 2007.
 */

export const palette = {
  bone: '#f5f2eb',
  bone2: '#ece7dc',
  card: '#fffdf8',
  pine: '#0e1512',
  ink: '#101613',
  muted: '#55605a',
  lime: '#c9f26e',
  limeInk: '#22380c',
  line: '#eae8e3', // rgba(16,22,19,0.09) over the card, matching --line
};

/**
 * Figtree where the client supports webfonts (Apple Mail, iOS, Outlook for Mac), the system stack
 * everywhere else. Gmail strips @font-face, so the fallback is the design, not the emergency plan:
 * the sizes and spacing assume the fallback and only the letterforms improve.
 */
export const FONT_URL = 'https://orvnlabs.com/fonts/figtree.woff2';

const FONT =
  "'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export function Brand({
  preview,
  children,
  footnote,
}: {
  preview: string;
  children: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Figtree"
          fallbackFontFamily={['Arial', 'Helvetica', 'sans-serif']}
          webFont={{ url: FONT_URL, format: 'woff2' }}
          fontWeight={400}
          fontStyle="normal"
        />
        {/* React Email does not add this for us; without it Gmail and iOS zoom the layout out. */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={masthead}>
            <Text style={wordmark}>ORREI</Text>
            <Text style={wordmarkBy}>by ORVN Labs</Text>
          </Section>

          <Section style={card}>{children}</Section>

          <Section style={footer}>
            <Hr style={rule} />
            {footnote ? <Text style={footnoteText}>{footnote}</Text> : null}
            <Text style={footerText}>
              ORVN Labs · <a href="mailto:hello@orvnlabs.com" style={footerLink}>hello@orvnlabs.com</a>
            </Text>
            <Text style={footerFine}>
              ORREI is in development. Screens and figures in this email refer to your own record.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function Heading({ children }: { children: React.ReactNode }) {
  return <Text style={heading}>{children}</Text>;
}

export function Para({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return <Text style={muted ? paragraphMuted : paragraph}>{children}</Text>;
}

export function Action({
  href,
  children,
  note,
}: {
  href: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <Section style={{ margin: '26px 0 8px' }}>
      <a href={href} style={button}>
        {children}
      </a>
      {note ? <Text style={smallNote}>{note}</Text> : null}
    </Section>
  );
}

/** The URL, spelled out, for people whose client refuses to make links clickable. */
export function FallbackUrl({ url }: { url: string }) {
  return (
    <Section style={urlBox}>
      <Text style={urlLabel}>Or paste this address into your browser:</Text>
      <Text style={urlText}>{url}</Text>
    </Section>
  );
}

export function Quote({ children }: { children: React.ReactNode }) {
  return (
    <Section style={quoteBox}>
      <Text style={quoteText}>{children}</Text>
    </Section>
  );
}

export function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <Section style={detailRow}>
      <Text style={detailLabel}>{label}</Text>
      <Text style={detailValue}>{value}</Text>
    </Section>
  );
}

export function SmallPrint({ children }: { children: React.ReactNode }) {
  return <Text style={smallNote}>{children}</Text>;
}

const body: React.CSSProperties = {
  margin: 0,
  padding: '28px 14px',
  backgroundColor: palette.bone,
  fontFamily: FONT,
  WebkitFontSmoothing: 'antialiased',
};

const container: React.CSSProperties = {
  width: '100%',
  maxWidth: 560,
  margin: '0 auto',
};

const masthead: React.CSSProperties = {
  backgroundColor: palette.pine,
  borderRadius: '16px 16px 0 0',
  padding: '18px 26px',
};

const wordmark: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT,
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: '0.14em',
  color: palette.lime,
  lineHeight: '18px',
};

const wordmarkBy: React.CSSProperties = {
  margin: '2px 0 0',
  fontSize: 11,
  lineHeight: '15px',
  color: 'rgba(255,253,248,0.55)',
  letterSpacing: '0.02em',
};

const card: React.CSSProperties = {
  backgroundColor: palette.card,
  border: `1px solid ${palette.line}`,
  borderTop: 'none',
  borderRadius: '0 0 16px 16px',
  padding: '30px 26px 26px',
};

const heading: React.CSSProperties = {
  margin: '0 0 12px',
  fontFamily: FONT,
  fontSize: 22,
  lineHeight: '29px',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  color: palette.ink,
};

const paragraph: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 15,
  lineHeight: '24px',
  color: '#2c352f',
};

const paragraphMuted: React.CSSProperties = {
  ...paragraph,
  color: palette.muted,
  fontSize: 14,
  lineHeight: '22px',
};

const button: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: palette.lime,
  color: palette.limeInk,
  fontSize: 15,
  fontWeight: 600,
  lineHeight: '20px',
  padding: '12px 20px',
  borderRadius: 10,
  textDecoration: 'none',
};

const smallNote: React.CSSProperties = {
  margin: '10px 0 0',
  fontSize: 13,
  lineHeight: '20px',
  color: palette.muted,
};

const urlBox: React.CSSProperties = {
  backgroundColor: palette.bone,
  borderRadius: 10,
  padding: '12px 14px',
  margin: '4px 0 16px',
};

const urlLabel: React.CSSProperties = {
  margin: '0 0 4px',
  fontSize: 12,
  lineHeight: '17px',
  color: palette.muted,
};

const urlText: React.CSSProperties = {
  margin: 0,
  fontSize: 12.5,
  lineHeight: '19px',
  color: palette.ink,
  wordBreak: 'break-all',
};

const quoteBox: React.CSSProperties = {
  backgroundColor: palette.bone,
  borderLeft: `3px solid ${palette.lime}`,
  borderRadius: '4px 10px 10px 4px',
  padding: '14px 16px',
  margin: '14px 0 18px',
};

const quoteText: React.CSSProperties = {
  margin: 0,
  fontSize: 14.5,
  lineHeight: '23px',
  color: '#222b25',
  whiteSpace: 'pre-wrap',
};

const detailRow: React.CSSProperties = {
  borderBottom: `1px solid ${palette.bone2}`,
  padding: '9px 0',
};

const detailLabel: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: '16px',
  color: palette.muted,
};

const detailValue: React.CSSProperties = {
  margin: '2px 0 0',
  fontSize: 14.5,
  lineHeight: '21px',
  color: palette.ink,
};

const footer: React.CSSProperties = { padding: '18px 8px 8px' };

const rule: React.CSSProperties = {
  border: 'none',
  borderTop: `1px solid ${palette.line}`,
  margin: '0 0 14px',
};

const footnoteText: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 12.5,
  lineHeight: '19px',
  color: palette.muted,
};

const footerText: React.CSSProperties = {
  margin: '0 0 4px',
  fontSize: 12,
  lineHeight: '18px',
  color: palette.muted,
};

const footerLink: React.CSSProperties = { color: palette.muted, textDecoration: 'underline' };

const footerFine: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: 11,
  lineHeight: '16px',
  color: '#8a938d',
};
