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
        .from('blog_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ categories: data || [] });
    } catch (err) {
      console.error('[blog/admin/categories/list]', err);
      return res.status(500).json({ error: 'failed_to_fetch_categories' });
    }
  }

  if (req.method === 'POST') {
    const { name, description } = req.body;
    try {
      const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const { data, error } = await supabase
        .from('blog_categories')
        .insert([{ name, slug, description }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ category: data });
    } catch (err) {
      console.error('[blog/admin/categories/create]', err);
      return res.status(500).json({ error: 'failed_to_create_category' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[blog/admin/categories/delete]', err);
      return res.status(500).json({ error: 'failed_to_delete_category' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
