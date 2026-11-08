'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './icons';
import { Avatar } from './ui';
import { workspace } from './data';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { href: '/properties', label: 'Properties', icon: 'properties' },
  { href: '/website', label: 'My website', icon: 'website' },
  { href: '/inquiries', label: 'Inquiries', icon: 'inquiries', badgeKey: 'inquiries' },
  { href: '/analytics', label: 'Analytics', icon: 'analytics' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

function Brand() {
  return (
    <Link href="/dashboard" className="ws-brand">
      <span className="ws-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M4 19V5l8 8 8-8v14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="ws-brand-text">
        <strong>ORREI</strong>
        <em>by ORVN Labs</em>
      </span>
    </Link>
  );
}

export default function AppShell({ children, workspace: ws = workspace, unread = 0, demo = false }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const nav = (
    <nav className="ws-nav" aria-label="Workspace">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`ws-nav-item ${isActive(item.href) ? 'is-active' : ''}`}
          onClick={() => setOpen(false)}
        >
          <Icon name={item.icon} size={19} strokeWidth={1.6} />
          <span>{item.label}</span>
          {item.badgeKey === 'inquiries' && unread > 0 ? (
            <span className="ws-nav-badge">{unread}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="ws">
      <aside className={`ws-side ${open ? 'is-open' : ''}`}>
        <div className="ws-side-top">
          <Brand />
          <button type="button" className="ws-switcher" aria-label="Switch workspace">
            <span className="ws-switcher-initial">N</span>
            <span className="ws-switcher-text">
              <strong>{ws.name}</strong>
              <em>{ws.handle}</em>
            </span>
            <Icon name="arrowDown" size={15} strokeWidth={2} />
          </button>
          {nav}
        </div>

        <div className="ws-side-foot">
          <Link href="/product" className="ws-side-link">
            <Icon name="help" size={17} strokeWidth={1.6} />
            How it works
          </Link>
          <Link href="/website" className="ws-side-link">
            <Icon name="arrowUpRight" size={17} strokeWidth={1.6} />
            View public site
          </Link>
          <div className="ws-account">
            <Avatar initials={ws.owner.initials} />
            <span className="ws-account-text">
              <strong>{ws.owner.name}</strong>
              <em>{ws.plan}</em>
            </span>
            <button type="button" className="ws-icon-btn" aria-label="Account menu">
              <Icon name="more" size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="ws-side-close"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <Icon name="close" size={20} />
        </button>
      </aside>

      {open ? <button className="ws-scrim" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}

      <div className="ws-body">
        <header className="ws-topbar">
          <button
            type="button"
            className="ws-icon-btn ws-menu-btn"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" size={20} />
          </button>

          <div className="ws-search">
            <Icon name="search" size={17} strokeWidth={1.8} />
            <input placeholder="Search properties, inquiries, settings" aria-label="Search" />
            <kbd>⌘K</kbd>
          </div>

          <div className="ws-topbar-actions">
            <button type="button" className="ws-icon-btn" aria-label="Notifications">
              <Icon name="bell" size={19} strokeWidth={1.7} />
              <span className="ws-dot" aria-hidden="true" />
            </button>
            <Link href="/properties/new" className="ws-btn is-lime is-sm">
              <Icon name="add" size={16} strokeWidth={2.2} />
              Create property
            </Link>
          </div>
        </header>

        <main className="ws-main" id="main">
          {demo ? (
            <div className="ws-demo-banner" role="status">
              <strong>Preview build</strong>
              <span>
                Sample data. No database is connected, so nothing here is saved and nothing is
                published.
              </span>
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
