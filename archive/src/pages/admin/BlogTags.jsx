import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function BlogTags() {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    loadTags();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const loadTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('tags');

      if (error) throw error;

      const allTags = data.flatMap(p => p.tags || []);
      const unique = [...new Set(allTags)].filter(Boolean);
      setTags(unique.map((name, id) => ({ id, name })));
    } catch (err) {
      console.error('Failed to load tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!newTag.trim()) return;
    if (tags.some(t => t.name === newTag.trim().toLowerCase())) {
      showToast('Tag already exists');
      return;
    }
    setTags([...tags, { id: Date.now(), name: newTag.trim().toLowerCase() }]);
    setNewTag('');
    showToast('Tag added (save post to use)');
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
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Manage Tags</h1>
        </div>
      </div>

      <div className="container-page" style={{ maxWidth: 600, paddingBlock: 40 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E5E8F0', marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12 }}>
            Add New Tag
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g. guide"
              style={{ flex: 1, padding: '12px 14px', border: '1px solid #E5E8F0', borderRadius: 10, outline: 'none' }}
            />
            <button
              onClick={handleAdd}
              style={{ background: '#5B3FD4', color: '#fff', border: 'none', padding: '0 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
            >
              Add
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {tags.map((tag) => (
            <div
              key={tag.id}
              style={{
                background: '#fff',
                padding: '8px 14px',
                borderRadius: 100,
                border: '1px solid #E5E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                fontWeight: 600,
                color: '#475569'
              }}
            >
              <Tag size={14} style={{ color: '#94A3B8' }} />
              {tag.name}
              <button
                onClick={() => setTags(tags.filter(t => t.id !== tag.id))}
                style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: 0, fontSize: 18, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          ))}
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
