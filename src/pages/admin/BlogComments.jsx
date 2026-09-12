import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Trash2, MessageSquare, ExternalLink, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function BlogComments() {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/blog/admin/comments?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id, status) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/blog/admin/comments?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setComments(comments.map(c => c.id === id ? { ...c, status } : c));
      }
    } catch (err) {
      console.error('Moderation error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this comment?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/blog/admin/comments?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (res.ok) {
        setComments(comments.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDeleteAllSpams = async () => {
    if (!window.confirm('Permanently delete ALL spam comments?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // We can iterate or add a bulk delete endpoint. For now, let's just do it sequentially or simple loop.
      // Better: add support to moderate API for bulk.
      const spamIds = comments.filter(c => c.status === 'spam').map(c => c.id);
      for (const id of spamIds) {
        await fetch(`/api/blog/admin/comments?id=${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
      }
      setComments(comments.filter(c => c.status !== 'spam'));
    } catch (err) {
      console.error('Bulk delete error:', err);
    }
  };

  const fmt = (iso) => new Date(iso).toLocaleString();

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FB' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E8F0', padding: '20px' }}>
        <div className="container-page" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/admin/blog')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#5B3FD4', fontWeight: 600 }}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Comments Moderation</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {filter === 'spam' && comments.length > 0 && (
              <button
                onClick={handleDeleteAllSpams}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginRight: 12
                }}
              >
                Delete All Spams
              </button>
            )}
            {['all', 'pending', 'approved', 'spam'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #E5E8F0',
                  background: filter === f ? '#5B3FD4' : '#fff',
                  color: filter === f ? '#fff' : '#475569',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page" style={{ paddingBlock: 40 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8', background: '#fff', borderRadius: 12, border: '1px solid #E5E8F0' }}>
            No comments found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {comments.map((c) => (
              <div key={c.id} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E5E8F0', display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>{c.author_name}</span>
                      <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
                      <span style={{ fontSize: 13, color: '#94A3B8' }}>{c.author_email}</span>
                      <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
                      <span style={{ fontSize: 13, color: '#94A3B8' }}>{fmt(c.created_at)}</span>
                    </div>
                    <div style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 800,
                      background: c.status === 'approved' ? '#ECFDF5' : c.status === 'pending' ? '#FFFBEB' : '#FEF2F2',
                      color: c.status === 'approved' ? '#059669' : c.status === 'pending' ? '#D97706' : '#DC2626'
                    }}>
                      {c.status.toUpperCase()}
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 12px' }}>{c.content}</p>
                  <div style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MessageSquare size={12} /> On: <a href={`/blog/${c.blog_posts?.slug}`} target="_blank" rel="noreferrer" style={{ color: '#5B3FD4', fontWeight: 600 }}>{c.blog_posts?.title}</a>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {c.status !== 'approved' && (
                    <button onClick={() => handleModerate(c.id, 'approved')} style={{ padding: 8, background: '#ECFDF5', border: 'none', borderRadius: 8, color: '#059669', cursor: 'pointer' }} title="Approve">
                      <Check size={18} />
                    </button>
                  )}
                  {c.status !== 'spam' && (
                    <button onClick={() => handleModerate(c.id, 'spam')} style={{ padding: 8, background: '#FFFBEB', border: 'none', borderRadius: 8, color: '#D97706', cursor: 'pointer' }} title="Mark as Spam">
                      <ShieldAlert size={18} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(c.id)} style={{ padding: 8, background: '#FEF2F2', border: 'none', borderRadius: 8, color: '#DC2626', cursor: 'pointer' }} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
