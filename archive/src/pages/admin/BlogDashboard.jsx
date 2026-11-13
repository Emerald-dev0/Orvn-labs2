import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Edit2, Trash2, Eye, EyeOff, AlertTriangle, BarChart2, BookOpen, FileText, CheckCircle, Copy, Settings, Tag, Layers, Users, MessageSquare, ExternalLink, Mail, Send, Search } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { signOut, getCurrentUser } from '../../lib/admin-auth';
import Modal from '../../components/ui/Modal';

export default function BlogDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [pendingComments, setPendingComments] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [recentComments, setRecentComments] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, slug: '', title: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/admin/login');
        return;
      }
      setUser(user);
      loadPosts();
      loadPendingComments();
    } catch (err) {
      console.error('Auth check failed:', err);
      navigate('/admin/login');
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setPosts(data || []);
        // Calculate category distribution
        const dist = data.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {});
        setCategoryStats(Object.entries(dist).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));

        // Top Posts
        setTopPosts([...data].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingComments = async () => {
    try {
      const { count, error } = await supabase
        .from('blog_comments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (!error) setPendingComments(count || 0);

      const { data: recent, error: recentErr } = await supabase
        .from('blog_comments')
        .select('*, blog_posts(title)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!recentErr) setRecentComments(recent || []);

      const { count: subCount, error: subErr } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true });

      if (!subErr) setTotalSubscribers(subCount || 0);
    } catch (err) {
      console.warn('Failed to load comments data:', err);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/admin/login');
    } catch (err) {
      console.error('Sign out failed:', err);
      showToast('Failed to sign out', 'error');
      setIsSigningOut(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleDelete = async () => {
    const { slug } = deleteModal;
    setIsDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showToast('Session expired. Please login again.', 'error');
        navigate('/admin/login');
        return;
      }

      // 1. Call the API to delete from DB and Storage
      const res = await fetch(`/api/blog/admin/posts?slug=${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete post');
      }

      // 2. IMPORTANT: Update local state immediately
      setPosts(prevPosts => prevPosts.filter((p) => p.slug !== slug));

      showToast('Post deleted successfully');
      setDeleteModal({ isOpen: false, slug: '', title: '' });
    } catch (err) {
      console.error('Delete failed:', err);
      showToast(err.message || 'Failed to delete post', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showToast('Session expired. Please log in again.', 'error');
        navigate('/admin/login');
        return;
      }

      const res = await fetch(`/api/blog/admin/posts?slug=${post.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          is_published: !post.is_published,
        }),
      });

      if (!res.ok) throw new Error('Failed to update post');

      const updated = await res.json();
      setPosts(posts.map((p) => (p.slug === post.slug ? updated.post : p)));
      showToast(`Post ${!post.is_published ? 'published' : 'moved to drafts'}`);
    } catch (err) {
      console.error('Toggle publish failed:', err);
      showToast('Failed to update post', 'error');
    }
  };

  const handleDuplicate = async (post) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showToast('Session expired. Please log in again.', 'error');
        navigate('/admin/login');
        return;
      }

      const duplicatedPost = {
        ...post,
        title: `${post.title} (Copy)`,
        slug: `${post.slug}-copy-${Math.floor(Math.random() * 1000)}`,
        is_published: false,
        published_at: null,
        views_count: 0,
        likes_count: 0,
      };

      // Clean up metadata
      delete duplicatedPost.id;
      delete duplicatedPost.created_at;
      delete duplicatedPost.updated_at;

      const res = await fetch('/api/blog/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(duplicatedPost),
      });

      if (!res.ok) throw new Error('Failed to duplicate post');

      const data = await res.json();
      setPosts([data.post, ...posts]);
      showToast('Post duplicated as draft');
    } catch (err) {
      console.error('Duplicate failed:', err);
      showToast('Failed to duplicate post', 'error');
    }
  };

  const handleSendEmail = async (post) => {
    if (post.last_broadcast_at) return;
    if (!window.confirm(`Send "${post.title}" to ${totalSubscribers} subscribers?`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/blog/admin/posts?slug=${post.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ last_broadcast_at: new Date().toISOString() })
      });

      if (res.ok) {
        showToast('Email broadcast initiated!');
        loadPosts();
      }
    } catch (err) {
      console.error('Email error:', err);
    }
  };

  const fmt = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FB' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E8F0', padding: '20px' }}>
        <div className="container-page" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              Blog Dashboard
            </h1>
            <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>
              Logged in as {user?.email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/admin/blog/categories')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                color: '#475569',
                border: '1px solid #E5E8F0',
                padding: '12px 16px',
                borderRadius: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Layers size={18} /> Categories
            </button>
            <button
              onClick={() => navigate('/admin/blog/tags')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                color: '#475569',
                border: '1px solid #E5E8F0',
                padding: '12px 16px',
                borderRadius: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Tag size={18} /> Tags
            </button>
            <button
              onClick={() => navigate('/admin/blog/authors')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                color: '#475569',
                border: '1px solid #E5E8F0',
                padding: '12px 16px',
                borderRadius: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Users size={18} /> Authors
            </button>
            <button
              onClick={() => navigate('/admin/blog/comments')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                color: '#475569',
                border: '1px solid #E5E8F0',
                padding: '12px 16px',
                borderRadius: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <MessageSquare size={18} /> Comments
            </button>
            <button
              onClick={() => navigate('/admin/blog/subscribers')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                color: '#475569',
                border: '1px solid #E5E8F0',
                padding: '12px 16px',
                borderRadius: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Mail size={18} /> Subscribers
            </button>
            <button
              onClick={() => navigate('/admin/blog/settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                color: '#475569',
                border: '1px solid #E5E8F0',
                padding: '12px 16px',
                borderRadius: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Settings size={18} /> Settings
            </button>
            <button
              onClick={() => navigate('/admin/blog/create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#5B3FD4',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={18} /> New Post
            </button>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#FEF2F2',
                color: '#DC2626',
                border: 'none',
                padding: '12px 20px',
                borderRadius: 10,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: isSigningOut ? 0.7 : 1,
              }}
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-page" style={{ padding: '40px 0' }}>
        {/* Stats Row */}
        {!loading && posts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
            {[
              { label: 'Total Posts', value: posts.length, icon: <FileText size={20} />, color: '#5B3FD4' },
              { label: 'Total Views', value: posts.reduce((acc, p) => acc + (p.views_count || 0), 0), icon: <BarChart2 size={20} />, color: '#F59E0B' },
              { label: 'Subscribers', value: totalSubscribers, icon: <Mail size={20} />, color: '#0EA5E9', onClick: () => navigate('/admin/blog/subscribers') },
              { label: 'Pending Comments', value: pendingComments, icon: <MessageSquare size={20} />, color: '#D97706', onClick: () => navigate('/admin/blog/comments') },
            ].map((stat, i) => (
              <div
                key={i}
                onClick={stat.onClick}
                style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 12,
                  border: '1px solid #E5E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: stat.onClick ? 'pointer' : 'default',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => stat.onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => stat.onClick && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ background: `${stat.color}10`, color: stat.color, padding: 12, borderRadius: 10 }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(250px, 1fr)', gap: 32, marginBottom: 40 }}>
           {/* Post List */}
           <div>
             <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
               <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ fontWeight: 700, fontSize: 13, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Posts</div>
                 <div style={{ position: 'relative', width: 240 }}>
                   <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                   <input
                     type="text"
                     placeholder="Search posts..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: 6, border: '1px solid #E5E8F0', outline: 'none', fontSize: 13 }}
                   />
                 </div>
               </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 3fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) auto',
                gap: 16,
                padding: '16px 20px',
                background: '#F7F8FB',
                borderBottom: '1px solid #E5E8F0',
                fontWeight: 600,
                fontSize: 13,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <div>Post</div>
              <div>Category</div>
              <div>Date</div>
              <div>Status</div>
              <div>Views</div>
              <div>Actions</div>
            </div>

            {posts
              .filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.slug.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((post) => (
                <div
                  key={post.id}
                  style={{
                    display: 'grid',
                gridTemplateColumns: 'minmax(0, 3fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) auto',
                    gap: 16,
                    padding: '16px 20px',
                    borderBottom: '1px solid #F1F5F9',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 8, background: '#F1F5F9', overflow: 'hidden', flexShrink: 0 }}>
                      {post.featured_image_url ? (
                        <img src={post.featured_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
                          <FileText size={18} />
                        </div>
                      )}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {post.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>
                        /{post.slug}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: '#475569' }}>
                    {post.category}
                  </div>
                  <div style={{ fontSize: 13, color: '#94A3B8' }}>
                    {fmt(post.created_at)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => handleTogglePublish(post)}
                      style={{
                        background: post.is_published ? (new Date(post.published_at) > new Date() ? '#FFFBEB' : '#ECFDF5') : '#F8FAFC',
                        border: 'none',
                        cursor: 'pointer',
                        color: post.is_published ? (new Date(post.published_at) > new Date() ? '#D97706' : '#059669') : '#94A3B8',
                        padding: '4px 8px',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                      title={post.is_published ? 'Click to draft' : 'Click to publish'}
                    >
                      {post.is_published ? (new Date(post.published_at) > new Date() ? <BookOpen size={12} /> : <Eye size={12} />) : <EyeOff size={12} />}
                      {post.is_published ? (new Date(post.published_at) > new Date() ? 'SCHEDULED' : 'LIVE') : 'DRAFT'}
                    </button>
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
                    {post.views_count || 0}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a
                      href={`/blog/${post.slug}${post.is_published ? '' : '?preview=true'}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#F8FAFC',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        color: '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                      title="View on site"
                    >
                      <ExternalLink size={14} />
                    </a>

                    {post.is_published && new Date(post.published_at) <= new Date() && (
                      <button
                        onClick={() => handleSendEmail(post)}
                        disabled={post.last_broadcast_at}
                        style={{
                          background: post.last_broadcast_at ? '#F1F5F9' : '#F0F9FF',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: 6,
                          cursor: post.last_broadcast_at ? 'default' : 'pointer',
                          color: post.last_broadcast_at ? '#94A3B8' : '#0369A1',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        title={post.last_broadcast_at ? `Sent on ${new Date(post.last_broadcast_at).toLocaleDateString()}` : 'Send to subscribers'}
                      >
                        <Send size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDuplicate(post)}
                      style={{
                        background: '#F1F5F9',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/blog/edit/${post.slug}`)}
                      style={{
                        background: '#EEEAFB',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        color: '#5B3FD4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, slug: post.slug, title: post.title })}
                      style={{
                        background: '#FEE2E2',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        color: '#DC2626',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recent Comments */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E5E8F0' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={18} style={{ color: '#5B3FD4' }} /> Recent Comments
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recentComments.length === 0 ? (
                <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: 20 }}>No comments yet</div>
              ) : (
                recentComments.map(comment => (
                  <div key={comment.id} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{comment.author_name}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', margin: '0 0 6px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {comment.content}
                    </p>
                    <div style={{ fontSize: 11, color: '#5B3FD4', fontWeight: 600 }}>
                      On: {comment.blog_posts?.title}
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentComments.length > 0 && (
              <button
                onClick={() => navigate('/admin/blog/comments')}
                style={{ width: '100%', marginTop: 16, padding: '10px', background: '#F8FAFC', border: '1px solid #E5E8F0', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#5B3FD4', cursor: 'pointer' }}
              >
                View all comments
              </button>
            )}
          </div>

          {/* Category Stats */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E5E8F0' }}>
             <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
               <Layers size={18} style={{ color: '#5B3FD4' }} /> Categories
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {categoryStats.map(cat => (
                 <div key={cat.name}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                     <span style={{ fontWeight: 600, color: '#475569' }}>{cat.name}</span>
                     <span style={{ color: '#94A3B8' }}>{cat.count} posts</span>
                   </div>
                   <div style={{ height: 6, background: '#F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
                     <div style={{ height: '100%', background: '#5B3FD4', width: `${(cat.count / posts.length) * 100}%` }} />
                   </div>
                 </div>
               ))}
             </div>
             <button
                onClick={() => navigate('/admin/blog/categories')}
                style={{ width: '100%', marginTop: 20, padding: '10px', background: '#F8FAFC', border: '1px solid #E5E8F0', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#5B3FD4', cursor: 'pointer' }}
              >
                Manage categories
              </button>
          </div>

          {/* Top Posts */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E5E8F0' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart2 size={18} style={{ color: '#F59E0B' }} /> Top Performing
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {topPosts.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#94A3B8' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{p.views_count || 0} views</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => !isDeleting && setDeleteModal({ isOpen: false, slug: '', title: '' })}
        title="Delete Post"
        footer={
          <>
            <button
              disabled={isDeleting}
              onClick={() => setDeleteModal({ isOpen: false, slug: '', title: '' })}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: '#fff',
                color: '#475569',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              disabled={isDeleting}
              onClick={handleDelete}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#DC2626',
                color: '#fff',
                fontWeight: 600,
                cursor: isDeleting ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isDeleting ? 0.7 : 1,
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Post'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ padding: '10px', background: '#FEF2F2', borderRadius: '50%', color: '#DC2626' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#0F172A' }}>
              Are you sure you want to delete this post?
            </p>
            <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
              "<strong>{deleteModal.title}</strong>" will be permanently removed. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 20px',
            background: toast.type === 'success' ? '#0F172A' : '#DC2626',
            color: '#fff',
            borderRadius: '10px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 2000,
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
