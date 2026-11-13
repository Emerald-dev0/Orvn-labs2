import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

export default async function handler(req, res) {
  // Auth check
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ subscribers: data || [] });
    } catch (err) {
      console.error('[blog/admin/subscribers/list]', err);
      return res.status(500).json({ error: 'failed_to_fetch_subscribers' });
    }
  }

  if (req.method === 'DELETE') {
    const { email } = req.query;
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('email', email);

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[blog/admin/subscribers/delete]', err);
      return res.status(500).json({ error: 'failed_to_delete_subscriber' });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
