// Vercel serverless function: receives forum/signup submissions and routes them to hello@orvnlabs.com.
//
// Env vars:
//   - RESEND_API_KEY (required to send email)
//   - FROM_EMAIL (Resend "from" - must be verified)

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

  if (!payload || !isValidEmail(payload.email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  await routeToAdmin(payload);

  return res.status(200).json({ ok: true });
}

async function routeToAdmin(record) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = 'ORVN Labs <hello@orvnlabs.com>';
  const to = 'hello@orvnlabs.com';

  if (!apiKey) {
    console.warn('[waitlist] RESEND_API_KEY not set, logging record:', record);
    return;
  }

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
        subject: `New Forum Signup: ${record.email}`,
        html: `
          <h3>New Forum Signup</h3>
          <p><strong>Email:</strong> ${record.email}</p>
          <p><strong>Source:</strong> ${record.source || 'product_forum'}</p>
          <pre>${JSON.stringify(record, null, 2)}</pre>
        `,
      }),
    });
  } catch (err) {
    console.error('[waitlist] routing failed', err);
  }
}
