import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Tag, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function BlogCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/blog/admin/categories', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/blog/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ name, description })
      });

      if (res.ok) {
        setName('');
        setDescription('');
        fetchCategories();
        showToast('Category added successfully');
      }
    } catch (err) {
      console.error('Create error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/blog/admin/categories?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
        showToast('Category deleted');
      }
    } catch (err) {
      console.error('Delete error:', err);
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
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Blog Categories</h1>
          <div style={{ width: 40 }} />
        </div>
      </div>

      <div className="container-page" style={{ maxWidth: 800, paddingBlock: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: 32, alignItems: 'start' }}>
          {/* Form */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E5E8F0' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800 }}>Create Category</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Industry News"
                  style={{ width: '100%', padding: 12, border: '1px solid #E5E8F0', borderRadius: 8, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this category about?"
                  rows={3}
                  style={{ width: '100%', padding: 12, border: '1px solid #E5E8F0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ background: '#5B3FD4', color: '#fff', border: 'none', padding: 14, borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isSubmitting ? 0.7 : 1 }}
              >
                <Plus size={18} /> {isSubmitting ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </div>

          {/* List */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #E5E8F0', fontWeight: 700, fontSize: 13, color: '#94A3B8', textTransform: 'uppercase' }}>
              Existing Categories
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div>
            ) : categories.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No categories found.</div>
            ) : (
              <div>
                {categories.map((cat) => (
                  <div key={cat.id} style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Tag size={14} style={{ color: '#5B3FD4' }} />
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{cat.name}</span>
                      </div>
                      {cat.description && (
                        <p style={{ margin: 0, fontSize: 13, color: '#64748B', lineHeight: 1.4 }}>{cat.description}</p>
                      )}
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontFamily: 'monospace' }}>/{cat.slug}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      style={{ background: 'none', border: 'none', padding: 4, color: '#EF4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast.show && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: '#0F172A', color: '#fff', borderRadius: 10, zIndex: 2000 }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
