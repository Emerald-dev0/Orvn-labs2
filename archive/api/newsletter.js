import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { email, role, companyName, leadVolume, source } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email,
        role,
        company_name: companyName,
        lead_volume: leadVolume,
        source: source || 'website',
        subscribed_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[newsletter/subscribe]', err);
    // Even if it fails, we might want to return 200 for UX, but 500 is more correct for logs.
    // The client side handles the 404/500 gracefully.
    return res.status(500).json({ error: 'failed_to_subscribe' });
  }
}
