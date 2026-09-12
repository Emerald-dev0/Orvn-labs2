import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Trash2, Eye, Layout } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import RichTextEditor from '../../components/RichTextEditor';
import ContentRenderer from '../../components/ContentRenderer';

export default function BlogEditor() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditing = !!slug;

  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState({
    title: '',
    excerpt: '',
    body: '',
    category: '',
    author: '',
    tags: [],
    featured_image_url: '',
    featured_image_alt: '',
    is_published: false,
    seo_title: '',
    seo_description: '',
    og_image_url: '',
    canonical_url: '',
    settings: {
      show_author: true,
      show_related: true,
      enable_comments: true,
      enable_likes: true,
      is_featured: false,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [user, setUser] = useState(null);
  const [readMinutes, setReadMinutes] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (post.title || post.body) {
        localStorage.setItem(`blog_draft_${slug || 'new'}`, JSON.stringify(post));
        setLastSaved(new Date());
      }
    }, 5000); // Auto-save to localStorage every 5 seconds
    return () => clearTimeout(timer);
  }, [post, slug]);

  const restoreDraft = () => {
    const saved = localStorage.getItem(`blog_draft_${slug || 'new'}`);
    if (saved) {
      setPost(JSON.parse(saved));
      alert('Draft restored from local storage.');
    }
  };

  useEffect(() => {
    const words = post.body.replace(/<[^>]*>/g, '').split(/\s+/).length;
    setReadMinutes(Math.ceil(words / 200));
  }, [post.body]);

  useEffect(() => {
    checkAuth();
    loadAuthors();
    loadCategories();
    if (isEditing) {
      loadPost();
    } else {
      setLoading(false);
    }
  }, [slug]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin/login');
      return;
    }
    setUser(user);
  };

  const loadAuthors = async () => {
    try {
      const res = await fetch('/api/blog/admin/authors');
      if (res.ok) {
        const data = await res.json();
        setAuthors(data.authors || []);
      }
    } catch (err) {
      console.warn('Failed to load authors:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('name')
        .order('name', { ascending: true });
      if (error) throw error;
      const cats = (data || []).map((c) => c.name);
      setCategories(cats);
      if (!isEditing && cats.length > 0) {
        setPost(prev => ({ ...prev, category: cats[0] }));
      }
    } catch (err) {
      console.warn('Failed to load categories:', err);
    }
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;

      setPost(data);
      setImagePreview(data.featured_image_url || '');
    } catch (err) {
      console.error('Failed to load post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      const filename = `${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filename, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filename);

      setPost({ ...post, featured_image_url: publicUrl.publicUrl });
      setImagePreview(publicUrl.publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload image');
    }
  };

  const handleDeleteImage = async () => {
    if (!post.featured_image_url) return;

    try {
      const path = post.featured_image_url.split('/blog-images/')[1];
      if (path) {
        await supabase.storage
          .from('blog-images')
          .remove([path]);
      }

      setPost({ ...post, featured_image_url: '', featured_image_alt: '' });
      setImagePreview('');
    } catch (err) {
      console.error('Delete image failed:', err);
      setError('Failed to delete image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!post.title || !post.excerpt || !post.body || !post.category) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        navigate('/admin/login');
        return;
      }

      const endpoint = isEditing
        ? `/api/blog/admin/posts?slug=${slug}`
        : '/api/blog/admin/posts';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(post),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save post');
      }

      alert(isEditing ? 'Post updated successfully!' : 'Post created successfully!');
      navigate('/admin/blog');
    } catch (err) {
      console.error('Save failed:', err);
      setError(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8FB' }}>
        <div style={{ color: '#94A3B8' }}>Loading post...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FB' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E8F0', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container-page" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/admin/blog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#5B3FD4',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            {lastSaved && (
               <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8', marginRight: 12 }}>
                 <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                 Draft saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </div>
            )}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: showPreview ? '#EEEAFB' : '#fff',
                color: showPreview ? '#5B3FD4' : '#475569',
                border: '1px solid #E5E8F0',
                padding: '10px 20px',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {showPreview ? <Layout size={16} /> : <Eye size={16} />}
              {showPreview ? 'Edit Mode' : 'Live Preview'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#5B3FD4',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-page" style={{ maxWidth: showPreview ? 1400 : 900, paddingBlock: '40px' }}>
        {error && (
          <div
            style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '12px 14px',
              borderRadius: 8,
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr',
          gap: 40,
          alignItems: 'start'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Title */}
          <div style={{ background: '#fff', border: '1px solid #E5E8F0', borderRadius: 12, padding: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>
              Post Title *
            </label>
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              placeholder="Enter a compelling title"
              style={{
                width: '100%',
                fontSize: 24,
                fontWeight: 700,
                border: 'none',
                outline: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#0F172A',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Excerpt & Category Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(200px, 1fr)', gap: 20 }}>
            <div style={{ background: '#fff', border: '1px solid #E5E8F0', borderRadius: 12, padding: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>
                Excerpt *
              </label>
              <textarea
                value={post.excerpt}
                onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                placeholder="One or two sentences summarizing the post"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E8F0',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#fff', border: '1px solid #E5E8F0', borderRadius: 12, padding: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>
                  Author
                </label>
                <select
                  value={post.author || ''}
                  onChange={(e) => setPost({ ...post, author: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E8F0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">ORVN Labs (Default)</option>
                  {authors.map((auth) => (
                    <option key={auth.id} value={auth.name}>{auth.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ background: '#fff', border: '1px solid #E5E8F0', borderRadius: 12, padding: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>
                  Category *
                </label>
                <select
                  value={post.category}
                  onChange={(e) => setPost({ ...post, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E8F0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ background: '#fff', border: '1px solid #E5E8F0', borderRadius: 12, padding: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>
                  Stats
                </label>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  ~ {readMinutes} min read
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                  {post.body.replace(/<[^>]*>/g, '').length} characters
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #E5E8F0', borderRadius: 12, padding: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={post.tags?.join(', ') || ''}
                  onChange={(e) => setPost({ ...post, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder="e.g. tutorial, news"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E8F0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div style={{ background: '#fff', border: '1px solid #E5E8F0', borderRadius: 12, padding: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 16 }}>
              Featured Image
            </label>

            {imagePreview ? (
              <div>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      background: '#EEEAFB',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: '#5B3FD4',
                      fontSize: 13,
                    }}
                  >
                    <Upload size={14} /> Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      background: '#FEE2E2',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: '#DC2626',
                      fontSize: 13,
                    }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={post.featured_image_alt}
                  onChange={(e) => setPost({ ...post, featured_image_alt: e.target.value })}
                  placeholder="Alt text for accessibility"
                  style={{
                    marginTop: 12,
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E8F0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: "'Inter', sans-serif",
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ) : (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '40px',
                  border: '2px dashed #E5E8F0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: '#F7F8FB',
                  transition: 'all 0.2s',
                }}
              >
                <Upload size={20} style={{ color: '#94A3B8' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#5B3FD4' }}>Click to upload image</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>or drag and drop</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Body */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12 }}>
              Post Content *
            </label>
            <RichTextEditor
              value={post.body}
              onChange={(html) => setPost({ ...post, body: html })}
              placeholder="Start writing your post..."
            />
          </div>

          {/* SEO & Metadata */}
          <div style={{ background: '#fff', border: '1px solid #E5E8F0', borderRadius: 12, padding: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 16 }}>
              SEO & Metadata
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  SEO Title
                </label>
                <input
                  type="text"
                  value={post.seo_title || ''}
                  onChange={(e) => setPost({ ...post, seo_title: e.target.value })}
                  placeholder="Custom browser tab title"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E8F0',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Meta Description
                </label>
                <textarea
                  value={post.seo_description || ''}
                  onChange={(e) => setPost({ ...post, seo_description: e.target.value })}
                  placeholder="Brief summary for search engine results"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E5E8F0',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Article Settings */}
          <div style={{ background: '#fff', border: '1px solid #E5E8F0', borderRadius: 12, padding: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 16 }}>
              Article Settings
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px', background: '#F8FAFC', borderRadius: 8 }}>
                <input
                  type="checkbox"
                  checked={post.settings?.enable_comments}
                  onChange={(e) => setPost({ ...post, settings: { ...post.settings, enable_comments: e.target.checked } })}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Enable Comments</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px', background: '#F8FAFC', borderRadius: 8 }}>
                <input
                  type="checkbox"
                  checked={post.settings?.enable_likes}
                  onChange={(e) => setPost({ ...post, settings: { ...post.settings, enable_likes: e.target.checked } })}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Enable Likes</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px', background: '#F8FAFC', borderRadius: 8 }}>
                <input
                  type="checkbox"
                  checked={post.settings?.show_author}
                  onChange={(e) => setPost({ ...post, settings: { ...post.settings, show_author: e.target.checked } })}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Show Author Info</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px', background: '#F8FAFC', borderRadius: 8 }}>
                <input
                  type="checkbox"
                  checked={post.settings?.is_featured}
                  onChange={(e) => setPost({ ...post, settings: { ...post.settings, is_featured: e.target.checked } })}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Featured Article</span>
              </label>
            </div>
          </div>

          {/* Publish Toggle */}
          <div style={{ background: '#fff', border: '1px solid #E5E8F0', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0F172A' }}>
                  {post.is_published ? '✓ Published' : '○ Draft'}
                </div>
                <p style={{ fontSize: 13, color: '#94A3B8', margin: '4px 0 0' }}>
                  {post.is_published ? 'This post is visible to readers' : 'Only you can see this post'}
                </p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={post.is_published}
                  onChange={(e) => setPost({ ...post, is_published: e.target.checked })}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600, color: '#0F172A' }}>Publish Now</span>
              </label>
            </div>

            {post.is_published && (
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>
                  Publish Date / Schedule
                </label>
                <input
                  type="datetime-local"
                  value={post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setPost({ ...post, published_at: new Date(e.target.value).toISOString() })}
                  style={{ width: '100%', padding: 12, border: '1px solid #E5E8F0', borderRadius: 8, fontSize: 14 }}
                />
                <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                  If set in the future, the post will be scheduled.
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Preview Panel */}
        {showPreview && (
          <div style={{
            background: '#fff',
            border: '1px solid #E5E8F0',
            borderRadius: 12,
            padding: '40px',
            position: 'sticky',
            top: 100,
            maxHeight: 'calc(100vh - 140px)',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: '4px 10px', background: '#F1F5F9', borderRadius: 100, fontSize: 11, fontWeight: 700, color: '#475569' }}>
                PREVIEW
              </div>
              <div style={{ height: 1, flex: 1, background: '#F1F5F9' }} />
            </div>

            {post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt=""
                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 24 }}
              />
            )}
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', marginBottom: 16, lineHeight: 1.2 }}>
              {post.title || 'Untitled Post'}
            </h1>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>
              {post.excerpt}
            </p>
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 32 }}>
              <ContentRenderer html={post.body} />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
