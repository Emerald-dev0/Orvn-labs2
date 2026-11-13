import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, User, Globe, Github, Twitter } from 'lucide-react';
import Modal from '../../components/ui/Modal';

export default function BlogAuthors() {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    avatar_url: '',
    twitter_url: '',
    github_url: '',
    website_url: '',
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blog/admin/authors');
      if (res.ok) {
        const data = await res.json();
        setAuthors(data.authors || []);
      }
    } catch (err) {
      console.error('Failed to fetch authors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (author = null) => {
    if (author) {
      setEditingAuthor(author);
      setFormData({
        name: author.name || '',
        role: author.role || '',
        bio: author.bio || '',
        avatar_url: author.avatar_url || '',
        twitter_url: author.twitter_url || '',
        github_url: author.github_url || '',
        website_url: author.website_url || '',
      });
    } else {
      setEditingAuthor(null);
      setFormData({
        name: '',
        role: '',
        bio: '',
        avatar_url: '',
        twitter_url: '',
        github_url: '',
        website_url: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingAuthor ? 'PUT' : 'POST';
    const body = editingAuthor ? { author: { ...formData, id: editingAuthor.id } } : { author: formData };

    try {
      const res = await fetch('/api/blog/admin/authors', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchAuthors();
      }
    } catch (err) {
      console.error('Failed to save author:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this author?')) return;

    try {
      const res = await fetch(`/api/blog/admin/authors?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAuthors();
      }
    } catch (err) {
      console.error('Failed to delete author:', err);
    }
  };

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
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Author Management</h1>
          <button
            onClick={() => handleOpenModal()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#5B3FD4', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus size={18} /> Add Author
          </button>
        </div>
      </div>

      <div className="container-page" style={{ paddingBlock: 40 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Loading authors...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {authors.map((author) => (
              <div key={author.id} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E5E8F0', display: 'flex', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F1F5F9', flexShrink: 0, overflow: 'hidden' }}>
                  {author.avatar_url ? (
                    <img src={author.avatar_url} alt={author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                      <User size={32} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{author.name}</h3>
                      <div style={{ fontSize: 13, color: '#5B3FD4', fontWeight: 600, marginBottom: 8 }}>{author.role}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleOpenModal(author)} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(author.id)} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px' }}>{author.bio}</p>
                  <div style={{ display: 'flex', gap: 12, color: '#94A3B8' }}>
                    {author.twitter_url && <a href={author.twitter_url} target="_blank" rel="noreferrer"><Twitter size={14} /></a>}
                    {author.github_url && <a href={author.github_url} target="_blank" rel="noreferrer"><Github size={14} /></a>}
                    {author.website_url && <a href={author.website_url} target="_blank" rel="noreferrer"><Globe size={14} /></a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAuthor ? 'Edit Author' : 'Add New Author'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: 12, border: '1px solid #E5E8F0', borderRadius: 8 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Role / Title</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ width: '100%', padding: 12, border: '1px solid #E5E8F0', borderRadius: 8 }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Avatar URL</label>
            <input
              type="text"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              style={{ width: '100%', padding: 12, border: '1px solid #E5E8F0', borderRadius: 8 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              style={{ width: '100%', padding: 12, border: '1px solid #E5E8F0', borderRadius: 8, fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>TWITTER</label>
              <input type="text" value={formData.twitter_url} onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E8F0', borderRadius: 8, fontSize: 12 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>GITHUB</label>
              <input type="text" value={formData.github_url} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E8F0', borderRadius: 8, fontSize: 12 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>WEBSITE</label>
              <input type="text" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E8F0', borderRadius: 8, fontSize: 12 }} />
            </div>
          </div>
          <button type="submit" style={{ marginTop: 8, background: '#5B3FD4', color: '#fff', border: 'none', padding: 14, borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
            {editingAuthor ? 'Update Author' : 'Create Author'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
