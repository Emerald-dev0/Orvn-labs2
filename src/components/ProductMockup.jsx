import React, { useState } from 'react';
import { SlHome, SlLayers, SlEnvelopeOpen, SlGraph, SlSettings, SlUser, SlMap, SlEye, SlArrowRight } from 'react-icons/sl';

const NAV = [
  { k: 'dashboard', label: 'Dashboard', icon: SlHome },
  { k: 'site', label: 'My Website', icon: SlUser },
  { k: 'props', label: 'Properties', icon: SlLayers },
  { k: 'inq', label: 'Inquiries', icon: SlEnvelopeOpen },
  { k: 'analytics', label: 'Analytics', icon: SlGraph },
  { k: 'settings', label: 'Settings', icon: SlSettings },
];

const PROPS = [
  { id: 1, title: 'Oak Hollow Parcel', loc: 'Austin, TX', status: 'Published', img: '/images/prop-1.jpg', views: 312, inq: 7 },
  { id: 2, title: 'Riverbend Lot', loc: 'Nashville, TN', status: 'Draft', img: '/images/prop-2.jpg', views: 0, inq: 0 },
  { id: 3, title: 'Pine Ridge Acreage', loc: 'Boise, ID', status: 'Published', img: '/images/prop-3.jpg', views: 184, inq: 4 },
  { id: 4, title: 'Maple Grove', loc: 'Raleigh, NC', status: 'Review', img: '/images/prop-4.jpg', views: 0, inq: 0 },
];

export default function ProductMockup() {
  const [active, setActive] = useState('props');
  const [selected, setSelected] = useState(1);
  const sel = PROPS.find((p) => p.id === selected);

  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', width: '100%', transform: 'perspective(1400px) rotateX(4deg) rotateY(-6deg)', transition: 'transform 0.6s cubic-bezier(0.23,1,0.32,1)' }} onMouseEnter={(e)=>e.currentTarget.style.transform='perspective(1400px) rotateX(0deg) rotateY(0deg)'} onMouseLeave={(e)=>e.currentTarget.style.transform='perspective(1400px) rotateX(4deg) rotateY(-6deg)'}>
      {/* window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
        <div style={{ marginLeft: 12, flex: 1, background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)' }}>
          app.orvnlabs.com / workspace / properties
        </div>
      </div>

      <div style={{ display: 'grid', minHeight: 460 }} className="product-mockup-grid">
        {/* sidebar */}
        <div style={{ borderRight: '1px solid var(--line)', background: 'var(--background)', padding: '16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', marginBottom: 16 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>O</div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>ORVN Labs</span>
          </div>
          {NAV.map((n) => {
            const Icon = n.icon;
            const is = active === n.k;
            return (
              <button
                key={n.k}
                onClick={() => setActive(n.k)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: is ? 'var(--primary-pale)' : 'transparent', color: is ? 'var(--primary)' : 'var(--ink-mid)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 2, textAlign: 'left' }}
              >
                <Icon size={16} /> {n.label}
              </button>
            );
          })}
        </div>

        {/* main */}
        <div style={{ padding: 20, background: 'var(--surface)', display: 'grid', gap: 16 }} className="product-mockup-detail">
          {/* list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>Properties</span>
              <span className="pill" style={{ fontSize: 11, padding: '4px 10px' }}>+ New</span>
            </div>
            {PROPS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 'var(--radius-md)', border: selected === p.id ? '1.5px solid var(--primary)' : '1px solid var(--line)', background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              >
                <img src={p.img} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} loading="lazy" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-mid)', marginBottom: 4 }}>{p.loc}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: p.status === 'Published' ? 'var(--primary)' : 'var(--ink-dim)' }}>{p.status}</span>
                </div>
              </button>
            ))}
          </div>

          {/* detail */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Property record</span>
              <span className="pill" style={{ fontSize: 10, padding: '3px 9px' }}>{sel.status}</span>
            </div>
            <img src={sel.img} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} loading="lazy" />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{sel.title}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-mid)', display: 'flex', alignItems: 'center', gap: 6 }}><SlMap size={12} /> {sel.loc}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { k: 'Views', v: sel.views },
                { k: 'Inquiries', v: sel.inq },
                { k: 'APN', v: '12-34-56' },
                { k: 'Lot size', v: '2.4 ac' },
              ].map((m) => (
                <div key={m.k} style={{ padding: 8, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--line)' }}>
                  <div className="label-mono" style={{ fontSize: 9 }}>{m.k}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginTop: 2 }}>{m.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <button className="btn-primary" style={{ flex: 1, padding: '9px 14px', fontSize: 12 }}>Preview page</button>
              <button className="btn-secondary" style={{ flex: 1, padding: '9px 14px', fontSize: 12 }}>Publish</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
