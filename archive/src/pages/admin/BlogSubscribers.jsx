import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Trash2, Download, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function BlogSubscribers() {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/blog/admin/subscribers', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (email) => {
    if (!window.confirm(`Remove ${email} from list?`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/blog/admin/subscribers?email=${email}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        setSubscribers(subscribers.filter(s => s.email !== email));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const exportCSV = () => {
    const headers = ['Email', 'Role', 'Company', 'Lead Volume', 'Source', 'Date'];
    const rows = subscribers.map(s => [
      s.email,
      s.role || '',
      s.company_name || '',
      s.lead_volume || '',
      s.source || '',
      new Date(s.subscribed_at).toLocaleDateString()
    ]);

    const content = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.company_name?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Newsletter Subscribers</h1>
          <button
            onClick={exportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', color: '#475569', border: '1px solid #E5E8F0', padding: '10px 16px', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="container-page" style={{ paddingBlock: 40 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E8F0', overflow: 'hidden' }}>
          <div style={{ padding: 20, borderBottom: '1px solid #F1F5F9', position: 'relative' }}>
             <Search size={18} style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
             <input
               type="text"
               placeholder="Search subscribers..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 10, border: '1px solid #E5E8F0', outline: 'none', fontSize: 14 }}
             />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E8F0' }}>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Subscriber</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Company / Role</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Volume</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Source</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px 20px' }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No subscribers found.</td></tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.email} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{s.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 14, color: '#475569' }}>{s.company_name || '-'}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>{s.role || '-'}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 13, color: '#475569' }}>{s.lead_volume || '-'}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#64748B', padding: '4px 8px', borderRadius: 4 }}>{s.source}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 13, color: '#94A3B8' }}>{new Date(s.subscribed_at).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button onClick={() => handleDelete(s.email)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 8 }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
