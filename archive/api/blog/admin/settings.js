import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('blog_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Table or row doesn't exist, return defaults
          return res.status(200).json({
            settings: {
              site_title: 'ORVN Labs Blog',
              posts_per_page: 12,
              enable_comments_globally: true,
              enable_likes_globally: true,
              show_views_publicly: true,
              enable_sharing: true,
            }
          });
        }
        throw error;
      }

      return res.status(200).json({ settings: data.settings });
    } catch (err) {
      console.error('[blog/admin/settings/get]', err);
      return res.status(500).json({ error: 'failed_to_fetch_settings' });
    }
  }

  if (req.method === 'POST') {
    const { settings } = req.body;
    try {
      // Upsert the settings row
      const { data, error } = await supabase
        .from('blog_settings')
        .upsert({ id: 1, settings, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, settings: data.settings });
    } catch (err) {
      console.error('[blog/admin/settings/update]', err);
      return res.status(500).json({ error: 'failed_to_update_settings' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
