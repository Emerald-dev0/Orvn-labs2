import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('blog_authors')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ authors: data });
    } catch (err) {
      console.error('[blog/admin/authors/list]', err);
      return res.status(500).json({ error: 'failed_to_fetch_authors' });
    }
  }

  if (req.method === 'POST') {
    const { author } = req.body;
    try {
      const { data, error } = await supabase
        .from('blog_authors')
        .insert([author])
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ author: data });
    } catch (err) {
      console.error('[blog/admin/authors/create]', err);
      return res.status(500).json({ error: 'failed_to_create_author' });
    }
  }

  if (req.method === 'PUT') {
    const { author } = req.body;
    try {
      const { data, error } = await supabase
        .from('blog_authors')
        .update(author)
        .eq('id', author.id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ author: data });
    } catch (err) {
      console.error('[blog/admin/authors/update]', err);
      return res.status(500).json({ error: 'failed_to_update_author' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      const { error } = await supabase
        .from('blog_authors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[blog/admin/authors/delete]', err);
      return res.status(500).json({ error: 'failed_to_delete_author' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
