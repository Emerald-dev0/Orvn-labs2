'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Inbox, LayoutDashboard } from 'lucide-react';

/** Operator navigation. The current page is marked for keyboard and screen-reader users too. */
const ITEMS = [
  { href: '/admin/early-access', label: 'Early access', icon: Inbox, match: '/admin/early-access' },
  { href: '/dashboard', label: 'Workspace', icon: LayoutDashboard, match: '/dashboard' },
  { href: '/', label: 'Public site', icon: Globe, match: null },
];

export default function AdminNav({ email }) {
  const pathname = usePathname() ?? '';

  return (
    <aside className="adm-side">
      <Link href="/admin/early-access" className="adm-brand">
        <span className="adm-mark" aria-hidden="true">O</span>
        <span>
          <strong>ORREI</strong>
          <em>Operator console</em>
        </span>
      </Link>

      <nav aria-label="Operator" className="adm-nav">
        {ITEMS.map((item) => {
          const current = item.match !== null && pathname.startsWith(item.match);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`adm-navlink ${current ? 'is-current' : ''}`} aria-current={current ? 'page' : undefined}>
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {email ? <p className="adm-who">Signed in as<br /><span>{email}</span></p> : null}
    </aside>
  );
}
