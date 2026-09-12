import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

// Slug helper
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// Merged posts CRUD: POST (create), PUT ?slug (update), DELETE ?slug (delete).
// Consolidates create.js + update.js + delete.js into one serverless function.
export default async function handler(req, res) {
  // Auth check: verify admin token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const token = authHeader.slice(7);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    if (req.method === 'POST') return await handleCreate(req, res);
    if (req.method === 'PUT') return await handleUpdate(req, res);
    if (req.method === 'DELETE') return await handleDelete(req, res);

    res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[blog/admin/posts]', err);
    return res.status(500).json({ error: 'failed_posts_operation' });
  }
}

async function handleCreate(req, res) {
  const {
    title,
    excerpt,
    body,
    category,
    author,
    tags,
    featured_image_url,
    featured_image_alt,
    is_published,
    seo_title,
    seo_description,
    og_image_url,
    canonical_url,
    settings,
    published_at
  } = req.body;

  // Validation
  if (!title || !excerpt || !body || !category) {
    return res.status(400).json({ error: 'missing_required_fields' });
  }

  const slug = slugify(title);
  const readMinutes = Math.ceil(body.split(/\s+/).length / 200); // ~200 words per minute

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([
      {
        slug,
        title,
        excerpt,
        body,
        category,
        author: author || 'ORVN Labs',
        tags: tags || [],
        featured_image_url: featured_image_url || null,
        featured_image_alt: featured_image_alt || '',
        is_published: is_published || false,
        read_minutes: readMinutes,
        published_at: is_published ? (published_at || new Date().toISOString()) : null,
        seo_title: seo_title || title,
        seo_description: seo_description || excerpt,
        og_image_url: og_image_url || featured_image_url || null,
        canonical_url: canonical_url || null,
        settings: settings || {
          show_author: true,
          show_related: true,
          enable_comments: true,
          enable_likes: true,
          is_featured: false
        }
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return res.status(201).json({ post: data });
}

async function handleUpdate(req, res) {
  const { slug } = req.query;

  const {
    title,
    excerpt,
    body,
    category,
    author,
    tags,
    featured_image_url,
    featured_image_alt,
    is_published,
    seo_title,
    seo_description,
    og_image_url,
    canonical_url,
    settings,
    published_at,
    last_broadcast_at
  } = req.body;

  const readMinutes = body ? Math.ceil(body.split(/\s+/).length / 200) : undefined;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (excerpt !== undefined) updateData.excerpt = excerpt;
  if (body !== undefined) updateData.body = body;
  if (category !== undefined) updateData.category = category;
  if (author !== undefined) updateData.author = author;
  if (tags !== undefined) updateData.tags = tags;
  if (featured_image_url !== undefined) updateData.featured_image_url = featured_image_url;
  if (featured_image_alt !== undefined) updateData.featured_image_alt = featured_image_alt;
  if (published_at !== undefined) updateData.published_at = published_at;
  if (is_published !== undefined) {
    updateData.is_published = is_published;
    if (is_published && !updateData.published_at) {
      // Only auto-set if not already set or being set
      updateData.published_at = new Date().toISOString();
    } else if (!is_published) {
      updateData.published_at = null;
    }
  }
  if (readMinutes !== undefined) updateData.read_minutes = readMinutes;
  if (seo_title !== undefined) updateData.seo_title = seo_title;
  if (seo_description !== undefined) updateData.seo_description = seo_description;
  if (og_image_url !== undefined) updateData.og_image_url = og_image_url;
  if (canonical_url !== undefined) updateData.canonical_url = canonical_url;
  if (settings !== undefined) updateData.settings = settings;
  if (last_broadcast_at !== undefined) updateData.last_broadcast_at = last_broadcast_at;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updateData)
    .eq('slug', slug)
    .select()
    .single();

  if (error) throw error;

  if (!data) {
    return res.status(404).json({ error: 'post_not_found' });
  }

  return res.status(200).json({ post: data });
}

async function handleDelete(req, res) {
  const { slug } = req.query;

  // Get the post first to get the image URL
  const { data: post, error: fetchError } = await supabase
    .from('blog_posts')
    .select('featured_image_url')
    .eq('slug', slug)
    .single();

  if (fetchError) throw fetchError;

  // Delete the post
  const { error: deleteError } = await supabase
    .from('blog_posts')
    .delete()
    .eq('slug', slug);

  if (deleteError) throw deleteError;

  // Delete the featured image if it exists
  if (post?.featured_image_url) {
    const imagePath = post.featured_image_url.split('/blog-images/')[1];
    if (imagePath) {
      await supabase.storage
        .from('blog-images')
        .remove([imagePath])
        .catch((err) => console.warn('Failed to delete image:', err));
    }
  }

  return res.status(200).json({ success: true, message: 'post_deleted' });
}
