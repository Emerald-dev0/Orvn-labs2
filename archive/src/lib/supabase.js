import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Helper to get all published posts with sorting
export async function getPublishedPosts(orderBy = 'published_at', limit = null) {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order(orderBy, { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  return data || [];
}

// Helper to get a single post by slug
export async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }
  return data;
}

// Helper to get posts by category
export async function getPostsByCategory(category, limit = null) {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .order('published_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }
  return data || [];
}

// Helper to get related posts
export async function getRelatedPosts(slug, category, limit = 3) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
  return data || [];
}

// Helper to get all categories from published posts
export async function getAllCategories() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const categories = [...new Set((data || []).map((p) => p.category))];
  return categories.sort();
}

// Upload image to storage
export async function uploadBlogImage(file, subfolder = '') {
  const path = subfolder ? `${subfolder}/${file.name}` : file.name;
  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(path, file, { upsert: true });

  if (error) {
    console.error('Error uploading image:', error);
    return '';
  }

  const { data: urlData } = supabase.storage
    .from('blog-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Delete image from storage
export async function deleteBlogImage(imageUrl) {
  if (!imageUrl) return;

  const urlParts = imageUrl.split('/blog-images/');
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];
  const { error } = await supabase.storage
    .from('blog-images')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
  }
}
