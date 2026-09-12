import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

// Merged comments moderation: GET ?status (list), PUT ?id (moderate), DELETE ?id.
// Consolidates comments/list.js + comments/moderate.js into one serverless function.
export default async function handler(req, res) {
  // Auth check
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  try {
    if (req.method === 'GET') return await handleList(req, res);
    if (req.method === 'PUT') return await handleModerate(req, res);
    if (req.method === 'DELETE') return await handleDelete(req, res);

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[blog/admin/comments]', err);
    return res.status(500).json({ error: 'failed_comments_operation' });
  }
}

async function handleList(req, res) {
  const { status } = req.query;

  let query = supabase
    .from('blog_comments')
    .select(`
      *,
      blog_posts (
        title,
        slug
      )
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return res.status(200).json({ comments: data || [] });
}

async function handleModerate(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'missing_id' });
  }

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'missing_status' });

  const { data, error } = await supabase
    .from('blog_comments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return res.status(200).json({ success: true, comment: data });
}

async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'missing_id' });
  }

  const { error } = await supabase
    .from('blog_comments')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return res.status(200).json({ success: true });
}
