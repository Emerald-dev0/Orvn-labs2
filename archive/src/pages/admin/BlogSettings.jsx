import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Globe, Eye, MessageSquare, Heart, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function BlogSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    site_title: 'ORVN Labs Blog',
    posts_per_page: 12,
    enable_comments_globally: true,
    enable_likes_globally: true,
    show_views_publicly: true,
    enable_sharing: true,
    default_social_image: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blog/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/blog/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        showToast('Global settings saved successfully');
      } else {
        showToast('Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      showToast('Error saving settings');
    } finally {
      setSaving(false);
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
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Global Settings</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#5B3FD4', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="container-page" style={{ maxWidth: 800, paddingBlock: 40 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Loading settings...</div>
        ) : (
          <div style={{ display: 'grid', gap: 24 }}>
          {/* General */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E5E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
               <Globe size={20} style={{ color: '#5B3FD4' }} />
               <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>General Configuration</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Blog Name</label>
                <input
                  type="text"
                  value={settings.site_title}
                  onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E5E8F0', borderRadius: 10, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Articles per Page</label>
                <input
                  type="number"
                  value={settings.posts_per_page}
                  onChange={(e) => setSettings({ ...settings, posts_per_page: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E5E8F0', borderRadius: 10, outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E5E8F0' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Feature Toggles (Global)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
               {[
                 { label: 'Allow Comments', icon: <MessageSquare size={16} />, key: 'enable_comments_globally' },
                 { label: 'Allow Likes', icon: <Heart size={16} />, key: 'enable_likes_globally' },
                 { label: 'Show View Count', icon: <Eye size={16} />, key: 'show_views_publicly' },
                 { label: 'Enable Sharing', icon: <Share2 size={16} />, key: 'enable_sharing' },
               ].map(feat => (
                 <label key={feat.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#F8FAFC', borderRadius: 10, cursor: 'pointer' }}>
                   <input
                     type="checkbox"
                     checked={settings[feat.key]}
                     onChange={(e) => setSettings({ ...settings, [feat.key]: e.target.checked })}
                   />
                   <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                     {feat.icon} {feat.label}
                   </span>
                 </label>
               ))}
            </div>
          </div>
        </div>
        )}
      </div>

      {toast.show && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: '#0F172A', color: '#fff', borderRadius: 10, zIndex: 2000 }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
