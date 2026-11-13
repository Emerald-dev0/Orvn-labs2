import React from 'react';

const DEFAULT_STEPS = [
  { label: 'Lead inquiry', tone: 'neutral', icon: 'phone' },
  { label: 'PAS', tone: 'primary', icon: 'brain' },
  { label: 'Qualified', tone: 'primary', icon: 'check' },
  { label: 'Routed / Booked', tone: 'primary', icon: 'route' },
  { label: 'Logged', tone: 'ok', icon: 'log' },
];

const toneColors = (t) => {
  if (t === 'primary')
    return { bg: '#F0EEFF', border: '#D4CBF9', color: '#3A2899', dot: '#5B3FD4', iconBg: '#E4DEFF' };
  if (t === 'ok')
    return { bg: '#ECFDF5', border: '#A7F3D0', color: '#065F46', dot: '#0D9E6E', iconBg: '#D1FAE5' };
  if (t === 'risk')
    return { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B', dot: '#DC2626', iconBg: '#FEE2E2' };
  return { bg: '#F8F9FA', border: '#E5E8F0', color: '#0F172A', dot: '#94A3B8', iconBg: '#EEF0F3' };
};

function StepIcon({ icon, color }) {
  const iconMap = {
    phone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    brain: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.59.68 3.03 1.77 4.02L12 18l6.23-6.48A5.46 5.46 0 0 0 20 7.5 5.5 5.5 0 0 0 14.5 2"/>
        <path d="M12 2v16"/>
        <circle cx="8" cy="8" r="1.5" fill={color} stroke="none"/>
        <circle cx="16" cy="8" r="1.5" fill={color} stroke="none"/>
      </svg>
    ),
    check: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    ),
    route: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v8"/>
        <path d="M5 18l7-8 7 8"/>
        <circle cx="5" cy="20" r="2" fill={color} stroke="none"/>
        <circle cx="19" cy="20" r="2" fill={color} stroke="none"/>
      </svg>
    ),
    log: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6"/>
        <path d="M8 13h8"/>
        <path d="M8 17h8"/>
      </svg>
    ),
  };
  return iconMap[icon] || null;
}

function ConnectorArrow() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        padding: '0 2px',
      }}
    >
      <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
        <defs>
          <linearGradient id="arrowGrad" x1="0" y1="6" x2="28" y2="6" gradientUnits="userSpaceOnUse">
            <stop stopColor="#CBD5E1"/>
            <stop offset="1" stopColor="#5B3FD4" stopOpacity="0.5"/>
          </linearGradient>
        </defs>
        <line x1="0" y1="6" x2="20" y2="6" stroke="url(#arrowGrad)" strokeWidth="1.5" strokeDasharray="3 3">
          <animate attributeName="stroke-dashoffset" from="6" to="0" dur="1.5s" repeatCount="indefinite"/>
        </line>
        <path d="M18 3l5 3-5 3" stroke="#5B3FD4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      </svg>
    </div>
  );
}

export default function FlowDiagram({ steps = DEFAULT_STEPS, label = 'How a lead flows through PAS' }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E5E8F0',
        borderRadius: 20,
        padding: 'clamp(20px, 3vw, 28px)',
        boxShadow: '0 2px 8px rgba(15,23,42,0.03), 0 8px 24px rgba(15,23,42,0.04)',
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#94A3B8',
          marginBottom: 18,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 4,
          overflowX: 'auto',
          paddingBottom: 8,
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
        className="hide-scrollbar"
      >
        {steps.map((s, i) => {
          const t = toneColors(s.tone);
          return (
            <React.Fragment key={s.label}>
              <div
                style={{
                  flex: '1 1 130px',
                  minWidth: 115,
                  background: t.bg,
                  border: `1.5px solid ${t.border}`,
                  color: t.color,
                  borderRadius: 14,
                  padding: '14px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '-0.01em',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: t.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <StepIcon icon={s.icon} color={t.dot} />
                </span>
                {s.label}
              </div>
              {i < steps.length - 1 && <ConnectorArrow />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
