// Vercel serverless function: receives revenue-calculator submissions from
// /src/pages/RevenueCalculator.jsx and emails the audit report.
//
// Env vars (set in Vercel project settings):
//   - RESEND_API_KEY    (required to send the report email; otherwise function is a no-op)
//   - SHEET_WEBHOOK_URL (optional — log to a Google Sheet)
//   - SLACK_WEBHOOK_URL (optional — notify Daniel of a new lead)
//   - FROM_EMAIL        (Resend "from" — must be verified)
//
// IMPORTANT: keep all secrets here. The browser-side client only sends inputs/outputs.

const fmt = (n) => '$' + Math.round(Number(n) || 0).toLocaleString();
const pct = (n) => Math.round((Number(n) || 0) * 100) + '%';

const isValidEmail = (s) => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      return res.status(400).json({ error: 'invalid_json' });
    }
  }
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'missing_body' });
  }
  if (!isValidEmail(payload.email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  const inputs = payload.inputs || {};
  const outputs = payload.outputs || {};
  const submittedAt = payload.submittedAt || new Date().toISOString();

  const record = {
    email: payload.email,
    submittedAt,
    source: 'revenue_calculator',
    inputs,
    outputs,
  };

  await Promise.allSettled([
    logToSheet(record),
    notifySlack(record),
    sendReportEmail(record),
    routeToAdmin(record),
  ]);

  return res.status(200).json({ ok: true });
}

async function routeToAdmin(record) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = 'ORVN Labs <hello@orvnlabs.com>';
  const to = 'hello@orvnlabs.com';
  if (!apiKey) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New Calculator Submission: ${record.email}`,
        html: `<p>New submission from ${record.email}</p><pre>${JSON.stringify(record, null, 2)}</pre>`,
      }),
    });
  } catch (err) {
    console.warn('[calculator-email] admin routing failed', err);
  }
}

async function logToSheet(record) {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  } catch (err) {
    console.warn('[calculator-email] sheet log failed', err);
  }
}

async function notifySlack(record) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    const o = record.outputs || {};
    const i = record.inputs || {};
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `New revenue-calculator submission · ${record.email}\nRecoverable opportunity: ${fmt(o.recoverableRevenuePerYear)} / yr · Database reactivation: ${fmt(o.databaseReactivationValue)} · Combined upside: ${fmt(o.combinedUpsideScenario)}\nLeads/mo ${i.monthlyLeads} · Commission ${fmt(i.avgCommission)} · Close ${pct(i.currentCloseRate)} → ${pct(i.targetCloseRate)} · Response ${i.responseTimeMin} min (${o.responseRiskBand || 'n/a'})`,
      }),
    });
  } catch (err) {
    console.warn('[calculator-email] slack notify failed', err);
  }
}

async function sendReportEmail(record) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = 'ORVN Labs <hello@orvnlabs.com>';
  if (!apiKey) return;

  const o = record.outputs || {};
  const i = record.inputs || {};

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [record.email],
        subject: `Your ORVN revenue audit — ${fmt(o.recoverableRevenuePerYear)} annual recoverable opportunity`,
        html: buildEmailHtml({ inputs: i, outputs: o, email: record.email }),
      }),
    });
  } catch (err) {
    console.warn('[calculator-email] resend failed', err);
  }
}

function buildEmailHtml({ inputs, outputs, email }) {
  const row = (k, v, color = '#0F172A', bold = false) =>
    `<tr>
      <td style="padding:10px 0;color:#475569;font-size:14px;border-bottom:1px solid #F1F3F9;">${k}</td>
      <td style="padding:10px 0;color:${color};font-weight:${bold ? '700' : '600'};font-family:monospace;font-size:14px;text-align:right;border-bottom:1px solid #F1F3F9;">${v}</td>
    </tr>`;

  const sectionHeader = (title) =>
    `<div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;font-family:monospace;margin:24px 0 12px;font-weight:700;">${title}</div>`;

  const isaComparison = inputs.annualIsaCost ? `
    ${sectionHeader('Analysis 03: ISA coverage & cost context')}
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;font-size:13px;color:#64748B;">Your annual ISA cost</td><td style="padding:6px 0;font-size:13px;text-align:right;color:#DC2626;">${fmt(inputs.annualIsaCost)}/yr</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#64748B;">Human ISA coverage</td><td style="padding:6px 0;font-size:13px;text-align:right;color:#64748B;">~45 hrs/wk (2,340 hrs/yr)</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#64748B;">Continuous coverage gap</td><td style="padding:6px 0;font-size:13px;text-align:right;color:#0D9E6E;">~6,420 hrs/yr</td></tr>
        <tr style="border-top:1px solid #E2E8F0;"><td style="padding:8px 0;font-size:13px;font-weight:700;color:#0F172A;">PAS pricing</td><td style="padding:8px 0;font-size:13px;text-align:right;font-weight:700;color:#0F172A;">Custom early-access quote</td></tr>
      </table>
      <div style="font-size:12px;color:#94A3B8;margin-top:10px;line-height:1.5;">Revenue opportunity and operating-cost savings are different buckets — they are not added together. PAS early-access pricing is quoted per brokerage.</div>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#F7F8FB;font-family:Inter,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border:1px solid #E5E8F0;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.04);">
    <div style="background:#5B3FD4;padding:40px 32px;text-align:center;color:#fff;">
      <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.8;font-family:monospace;margin-bottom:8px;font-weight:700;">ORVN LABS — REVENUE AUDIT</div>
      <div style="font-size:15px;opacity:0.9;margin-bottom:12px;">Estimated annual recoverable opportunity</div>
      <div style="font-size:56px;font-weight:800;line-height:1;letter-spacing:-0.02em;">${fmt(outputs.recoverableRevenuePerYear)}</div>
    </div>

    <div style="padding:32px;">
      <p style="color:#475569;font-size:16px;line-height:1.7;margin:0 0 28px;">
        The numbers below are based on the inputs you provided. This models the opportunity if faster, more consistent first contact lifts your close rate from your current baseline to the target scenario you chose. Your current close rate is never penalized twice.
      </p>

      ${sectionHeader('Audit Inputs')}
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${row('Monthly leads', inputs.monthlyLeads)}
        ${row('Avg commission', fmt(inputs.avgCommission))}
        ${row('Current close rate', pct(inputs.currentCloseRate))}
        ${row('Target close rate (scenario)', pct(inputs.targetCloseRate))}
        ${row('Avg response time', inputs.responseTimeMin + ' min' + (outputs.responseRiskBand ? ' · ' + outputs.responseRiskBand : ''))}
        ${inputs.crmDatabaseSize ? row('CRM database size', inputs.crmDatabaseSize.toLocaleString() + ' leads') : ''}
      </table>

      ${sectionHeader('Analysis 01: Close-rate opportunity')}
      <div style="background:#EEEAFB;border:1px solid #C7BCF5;border-radius:12px;padding:24px;text-align:center;margin-bottom:16px;">
        <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5B3FD4;font-family:monospace;margin-bottom:8px;font-weight:700;">Recoverable revenue / month</div>
        <div style="font-size:36px;color:#5B3FD4;font-weight:800;line-height:1;margin-bottom:8px;">${fmt(outputs.recoverableRevenuePerMonth)}</div>
        <div style="font-size:13px;color:#3A2899;line-height:1.5;">${Number(outputs.recoverableDealsPerMonth || 0)} recoverable deals/month (target − current close rate). Response time is a qualitative risk signal only — it does not multiply this figure.</div>
      </div>

      ${outputs.databaseReactivationValue > 0 ? `
        ${sectionHeader('Analysis 02: Database reactivation (illustrative)')}
        <div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:24px;text-align:center;margin-bottom:16px;">
          <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0D9E6E;font-family:monospace;margin-bottom:8px;font-weight:700;">Database reactivation value</div>
          <div style="font-size:36px;color:#0D9E6E;font-weight:800;line-height:1;margin-bottom:8px;">${fmt(outputs.databaseReactivationValue)}</div>
          <div style="font-size:13px;color:#064E3B;line-height:1.5;">A separate, illustrative estimate from your existing database — editable assumption, not research-backed. Kept apart from the close-rate opportunity above.</div>
        </div>
      ` : ''}

      ${isaComparison}

      ${sectionHeader('Next Steps')}
      <div style="margin-bottom:24px;">
        <div style="background:#F1F5F9;border-radius:8px;padding:12px;margin-bottom:8px;font-size:14px;color:#1E293B;">
          <strong>01.</strong> Stand up a sub-5-minute response mechanism on every channel.
        </div>
        <div style="background:#F1F5F9;border-radius:8px;padding:12px;margin-bottom:8px;font-size:14px;color:#1E293B;">
          <strong>02.</strong> Run a graveyard scan on your CRM to identify dormant intent.
        </div>
      </div>

      ${sectionHeader('Summary')}
      <table style="width:100%;border-collapse:collapse;margin-top:8px;">
        ${row('Recoverable revenue / year (close-rate opportunity)', fmt(outputs.recoverableRevenuePerYear), '#0F172A', true)}
        ${outputs.databaseReactivationValue > 0 ? row('Database reactivation (illustrative)', fmt(outputs.databaseReactivationValue), '#0D9E6E') : ''}
        ${outputs.databaseReactivationValue > 0 ? row('Combined upside scenario', fmt(outputs.combinedUpsideScenario), '#0F172A', true) : ''}
      </table>

      <div style="margin-top:40px;text-align:center;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:32px;">
        <div style="font-size:20px;color:#0F172A;font-weight:700;margin-bottom:12px;letter-spacing:-0.01em;">Download your official PDF</div>
        <p style="color:#475569;font-size:15px;line-height:1.65;margin:0 0 24px;">Get a professionally formatted version of this audit to share with your team or file for review.</p>
        <a href="https://orvnlabs.com/calculators/revenue?email=${email}&leads=${inputs.monthlyLeads}&comm=${inputs.avgCommission}&cr=${inputs.currentCloseRate * 100}&tc=${inputs.targetCloseRate * 100}&rt=${inputs.responseTimeMin}&crm=${inputs.crmDatabaseSize || 0}&isa=${inputs.annualIsaCost || 0}" style="display:inline-block;background:#5B3FD4;color:#fff;padding:14px 28px;border-radius:100px;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 8px 16px rgba(91,63,212,0.2);">Download PDF Report →</a>
      </div>
    </div>

    <div style="padding:24px 32px;border-top:1px solid #F1F3F9;text-align:center;color:#94A3B8;font-size:13px;font-weight:500;">
      ORVN Labs · <a href="mailto:hello@orvnlabs.com" style="color:#5B3FD4;text-decoration:none;">hello@orvnlabs.com</a>
    </div>
  </div>
</body></html>
  `;
}
