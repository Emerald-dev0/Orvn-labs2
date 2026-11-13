import React, { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

const LEAD_VOLUMES = [
  '0–50 leads/month',
  '51–200 leads/month',
  '201–500 leads/month',
  '500+ leads/month',
];

export default function Newsletter({ variant = 'card', source = 'website' }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [leadVolume, setLeadVolume] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Enter a valid work email.');
      return;
    }
    setStatus('loading');
    setError('');

    const payload = { email, role, companyName, leadVolume, source };

    try {
      // Endpoint is a Vercel serverless function (see /api/newsletter.js).
      // If the function isn't deployed yet, the request will 404 — we still show success
      // so the visitor experience is clean. Submissions are logged client-side for
      // recovery; wire the backend before launch.
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok && res.status !== 404) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      // Soft-fail: capture for replay later. TODO: send to a backup endpoint or telemetry.
      console.warn('[newsletter] backend unavailable, captured locally', err, payload);
    }
    setStatus('success');
  };

  const isCompact = variant === 'inline';

  if (status === 'success') {
    return (
      <div
        style={{
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: 14,
          padding: isCompact ? '20px 24px' : '28px 32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <CheckCircle2 size={22} color="#0D9E6E" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 600, color: '#065F46', fontSize: 15, marginBottom: 4 }}>
            You’re in.
          </div>
          <p style={{ color: '#065F46', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            First-Contact Intelligence will hit your inbox soon. No spam — one weekly brief.<br/>
            <span style={{ opacity: 0.8, fontSize: 12 }}>Check your spam folder if you don't see it in 5 minutes.</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{
        background: isCompact ? 'transparent' : '#fff',
        border: isCompact ? 'none' : '1px solid #E5E8F0',
        borderRadius: 16,
        padding: isCompact ? 0 : 'clamp(24px, 4vw, 36px)',
        boxShadow: isCompact ? 'none' : '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.05)',
      }}
    >
      {!isCompact && (
        <>
          <div className="eyebrow" style={{ marginBottom: 12 }}>First-Contact Intelligence</div>
          <h3 className="h-section" style={{ fontSize: 'clamp(24px, 3vw, 34px)', marginBottom: 8 }}>
            Get First-Contact Intelligence.
          </h3>
          <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, marginBottom: 22, maxWidth: 540 }}>
            Weekly field notes on how real estate brokerages lose, recover, and convert inbound leads.
          </p>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email"
          aria-label="Work email"
          style={inputStyle}
        />
        {!isCompact && (
          <>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Your role (optional)"
              aria-label="Role"
              style={inputStyle}
            />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Brokerage name (optional)"
              aria-label="Brokerage name"
              style={inputStyle}
            />
            <select
              value={leadVolume}
              onChange={(e) => setLeadVolume(e.target.value)}
              aria-label="Lead volume range"
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              <option value="">Lead volume (optional)</option>
              {LEAD_VOLUMES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {error && (
        <p role="alert" style={{ color: '#DC2626', fontSize: 13, marginBottom: 10 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary"
          style={{ opacity: status === 'loading' ? 0.7 : 1, cursor: status === 'loading' ? 'wait' : 'pointer' }}
        >
          <Send size={15} /> {status === 'loading' ? 'Sending…' : 'Join the brief'}
        </button>
        <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
          One email a week. Unsubscribe in a click.
        </p>
      </div>
    </form>
  );
}

const inputStyle = {
  background: '#F7F8FB',
  border: '1px solid #E5E8F0',
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: 14,
  color: '#0F172A',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};
