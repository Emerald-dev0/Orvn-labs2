// Vercel serverless function: receives leakage-scorecard submissions from
// /src/pages/LeakageScorecard.jsx and emails the scorecard report.
//
// Env vars (set in Vercel project settings):
//   - RESEND_API_KEY    (required to send the report email; otherwise function is a no-op)
//   - SHEET_WEBHOOK_URL (optional — log to a Google Sheet)
//   - SLACK_WEBHOOK_URL (optional — notify Daniel of a new submission)
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
    source: 'leakage_scorecard',
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
        subject: `New Leakage Scorecard: ${record.email}`,
        html: `<p>New leakage scorecard submission from ${record.email}</p><pre>${JSON.stringify(record, null, 2)}</pre>`,
      }),
    });
  } catch (err) {
    console.warn('[leakage-email] admin routing failed', err);
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
    console.warn('[leakage-email] sheet log failed', err);
  }
}

async function notifySlack(record) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    const o = record.outputs || {};
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `New leakage-scorecard submission · ${record.email}\nLeakage Score: ${o.leakageScore}/100 · Health: ${o.healthScore}/100 · Risk: ${o.riskLevel} · Bottleneck: ${o.bottleneckName}`,
      }),
    });
  } catch (err) {
    console.warn('[leakage-email] slack notify failed', err);
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
        subject: `Your ORVN Lead Leakage Scorecard — Risk Level: ${o.riskLevel}`,
        html: buildEmailHtml({ inputs: i, outputs: o }),
      }),
    });
  } catch (err) {
    console.warn('[leakage-email] resend failed', err);
  }
}

function buildEmailHtml({ inputs, outputs }) {
  const GREEN = '#0D9E6E';
  const AMBER = '#D97706';
  const RED = '#DC2626';
  const PURPLE = '#5B3FD4';

  const getRiskColor = (leakage) => {
    if (leakage <= 20) return GREEN;
    if (leakage <= 40) return AMBER;
    return RED;
  };

  const getHealthColor = (score) => {
    if (score >= 70) return GREEN;
    if (score >= 40) return AMBER;
    return RED;
  };

  const riskColor = getRiskColor(outputs.leakageScore || 0);
  const healthColor = getHealthColor(outputs.healthScore || 0);

  const row = (k, v, color = '#0F172A', bold = false) =>
    `<tr>
      <td style="padding:10px 0;color:#475569;font-size:14px;border-bottom:1px solid #F1F3F9;">${k}</td>
      <td style="padding:10px 0;color:${color};font-weight:${bold ? '700' : '600'};font-family:monospace;font-size:14px;text-align:right;border-bottom:1px solid #F1F3F9;">${v}</td>
    </tr>`;

  const sectionHeader = (title) =>
    `<div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;font-family:monospace;margin:24px 0 12px;font-weight:700;">${title}</div>`;

  return `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#F7F8FB;font-family:Inter,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border:1px solid #E5E8F0;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.04);">
    <div style="background:${PURPLE};padding:40px 32px;text-align:center;color:#fff;">
      <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.8;font-family:monospace;margin-bottom:8px;font-weight:700;">ORVN LABS — LEAD LEAKAGE SCORECARD</div>
      <div style="font-size:15px;opacity:0.9;margin-bottom:12px;">First-Contact Health Diagnostic</div>
      <div style="font-size:56px;font-weight:800;line-height:1;letter-spacing:-0.02em;">${outputs.leakageScore || 0}</div>
      <div style="font-size:14px;opacity:0.9;margin-top:8px;">Leakage Score / 100</div>
    </div>

    <div style="padding:32px;">
      <p style="color:#475569;font-size:16px;line-height:1.7;margin:0 0 28px;">
        Your first-contact layer has been analyzed against operator-grade benchmarks. Below is your diagnostic and recommended priority fix.
      </p>

      ${sectionHeader('Overall Health Assessment')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
        <div style="background:#F7F8FB;border:1px solid #E5E8F0;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;font-family:monospace;margin-bottom:6px;font-weight:700;">Leakage Score</div>
          <div style="font-size:32px;color:${riskColor};font-weight:800;line-height:1;">${outputs.leakageScore || 0}<span style="font-size:14px;color:#94A3B8;">/100</span></div>
        </div>
        <div style="background:#F7F8FB;border:1px solid #E5E8F0;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;font-family:monospace;margin-bottom:6px;font-weight:700;">Health Score</div>
          <div style="font-size:32px;color:${healthColor};font-weight:800;line-height:1;">${outputs.healthScore || 0}<span style="font-size:14px;color:#94A3B8;">/100</span></div>
        </div>
      </div>

      ${sectionHeader('Risk Assessment')}
      <div style="background:${outputs.riskLevel === 'Low' ? '#ECFDF5' : outputs.riskLevel === 'Moderate' ? '#FFFBEB' : '#FEF2F2'};border:1px solid ${outputs.riskLevel === 'Low' ? '#A7F3D0' : outputs.riskLevel === 'Moderate' ? '#FDE68A' : '#FECACA'};border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${outputs.riskLevel === 'Low' ? GREEN : outputs.riskLevel === 'Moderate' ? AMBER : RED};font-family:monospace;margin-bottom:8px;font-weight:700;">First-Contact Risk Level</div>
        <div style="font-size:28px;color:${outputs.riskLevel === 'Low' ? GREEN : outputs.riskLevel === 'Moderate' ? AMBER : RED};font-weight:800;line-height:1;margin-bottom:8px;">${outputs.riskLevel || 'Unknown'}</div>
        <div style="font-size:13px;color:${outputs.riskLevel === 'Low' ? '#065F46' : outputs.riskLevel === 'Moderate' ? '#92400E' : '#7F1D1D'};line-height:1.5;">
          ${outputs.riskLevel === 'Low' ? 'Your first-contact layer is performing well against operator benchmarks.' : 'Your first-contact layer has opportunities for improvement.'}
        </div>
      </div>

      ${sectionHeader('Audit Inputs')}
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${row('Monthly inbound leads', inputs.monthlyLeads)}
        ${row('Avg response time', (inputs.avgResponseTimeMin || 0) + ' min')}
        ${row('Contact rate', pct(inputs.contactRate))}
        ${row('Qualification rate', pct(inputs.qualificationRate))}
        ${row('Appointment rate', pct(inputs.appointmentRate))}
        ${row('After-hours %', pct(inputs.afterHoursPct))}
        ${row('Avg commission per deal', fmt(inputs.avgCommission))}
        ${inputs.leadCost ? row('Avg lead cost', fmt(inputs.leadCost)) : ''}
        ${row('First-contact owner', inputs.firstContactOwner)}
      </table>

      ${sectionHeader('Bottleneck Analysis')}
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-left:3px solid ${RED};border-radius:10px;padding:18px;margin-bottom:24px;">
        <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${RED};font-family:monospace;margin-bottom:6px;font-weight:700;">Likely Bottleneck</div>
        <div style="font-size:18px;font-weight:600;color:#0F172A;margin-bottom:8px;">
          ${outputs.bottleneckName || 'Response time'} — ${outputs.bottleneckScore || 0}/100
        </div>
        <p style="font-size:13px;color:#475569;line-height:1.6;margin:0;">
          This metric has the lowest sub-score and represents your highest-leverage opportunity for improvement. Addressing this bottleneck will have the greatest impact on your overall first-contact performance.
        </p>
      </div>

      ${sectionHeader('Financial Impact')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
        ${outputs.missedRevenue > 0 ? `
          <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:16px;text-align:center;">
            <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;font-family:monospace;margin-bottom:6px;font-weight:700;">Estimated Missed Revenue</div>
            <div style="font-size:24px;color:${RED};font-weight:800;line-height:1;">
              ${fmt(outputs.missedRevenue)}<span style="font-size:12px;color:#94A3B8;">/month</span>
            </div>
          </div>
        ` : ''}
        ${outputs.missedSpend > 0 ? `
          <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:16px;text-align:center;">
            <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;font-family:monospace;margin-bottom:6px;font-weight:700;">Wasted Lead Spend</div>
            <div style="font-size:24px;color:${AMBER};font-weight:800;line-height:1;">
              ${fmt(outputs.missedSpend)}<span style="font-size:12px;color:#94A3B8;">/month</span>
            </div>
          </div>
        ` : ''}
      </div>

      ${sectionHeader('Recommended Next Steps')}
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px;">
        <div style="background:#F1F5F9;border-radius:8px;padding:12px;font-size:14px;color:#1E293B;">
          <strong>01.</strong> Address your bottleneck: ${outputs.bottleneckName || 'Response time'}
        </div>
        <div style="background:#F1F5F9;border-radius:8px;padding:12px;font-size:14px;color:#1E293B;">
          <strong>02.</strong> Run the Revenue Calculator to quantify the annual opportunity cost.
        </div>
        <div style="background:#F1F5F9;border-radius:8px;padding:12px;font-size:14px;color:#1E293B;">
          <strong>03.</strong> Explore technology or process changes to improve your weakest metric.
        </div>
      </div>

      ${sectionHeader('Summary')}
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${row('Leakage Score', outputs.leakageScore + '/100', PURPLE, true)}
        ${row('Health Score', outputs.healthScore + '/100', healthColor, true)}
        ${row('Risk Level', outputs.riskLevel, riskColor, true)}
        ${row('Bottleneck', outputs.bottleneckName, RED, true)}
      </table>

      <div style="margin-top:32px;padding:20px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;text-align:center;">
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px;">
          This scorecard was generated based on your inputs and compared against operator-grade benchmarks. Every metric is independently weighted based on its impact on first-contact performance.
        </p>
        <p style="color:#94A3B8;font-size:12px;margin:0;">
          Questions? Reach out to <a href="mailto:hello@orvnlabs.com" style="color:${PURPLE};text-decoration:none;font-weight:600;">hello@orvnlabs.com</a>
        </p>
      </div>
    </div>

    <div style="padding:24px 32px;border-top:1px solid #F1F3F9;text-align:center;color:#94A3B8;font-size:13px;font-weight:500;">
      ORVN Labs · <a href="mailto:hello@orvnlabs.com" style="color:${PURPLE};text-decoration:none;">hello@orvnlabs.com</a>
    </div>
  </div>
</body></html>
  `;
}
