import { and, or, eq, ne, desc, asc, isNull, inArray } from 'drizzle-orm';
import { databaseConfigured, withPublicDb, withUserDb } from '../db/tenant';
import {
  connections,
  messages,
  savedProfiles,
  professionalProfiles,
  workspaces,
} from '../../db/schema';

/**
 * The professional network read model.
 *
 * Two access modes, both deliberate:
 *  - Discovery reads PUBLISHED profiles through `withPublicDb` (orrei_public). That role can
 *    already see every published profile and the workspace behind it, so a signed-in member
 *    discovers the same professionals a visitor could — no private row is reachable.
 *  - Connections, messages and saved profiles are private and account-scoped. They go through
 *    `withUserDb`, and RLS keys on `app_uid()`, so a caller only ever reads their own side.
 *
 * Dates are returned as ISO strings so a server component can hand them straight to a client view.
 */

export type DiscoverCard = {
  profileId: string;
  userId: string;
  name: string;
  username: string;
  headline: string | null;
  role: string | null;
  markets: string[];
};

export type PersonInfo = {
  userId: string;
  profileId: string | null;
  name: string;
  headline: string | null;
  role: string | null;
  username: string | null;
};

export type ConnectionRecord = {
  id: string;
  requesterId: string;
  recipientId: string;
  status: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  mine: boolean;
};

export type InboxThread = {
  userId: string;
  name: string;
  lastBody: string;
  lastAt: string;
  unread: number;
};

/** Published professionals, newest first, minus the viewer's own profile(s). */
export async function discoverProfessionals(
  viewerId: string,
  opts: { q?: string; role?: string } = {},
): Promise<DiscoverCard[]> {
  if (!databaseConfigured) return [];

  const rows = await withPublicDb(async (tx) =>
    tx
      .select({
        profileId: professionalProfiles.id,
        userId: workspaces.ownerId,
        name: professionalProfiles.displayName,
        workspaceName: workspaces.name,
        username: workspaces.username,
        headline: professionalProfiles.headline,
        role: professionalProfiles.role,
        markets: professionalProfiles.markets,
      })
      .from(professionalProfiles)
      .innerJoin(workspaces, eq(workspaces.id, professionalProfiles.workspaceId))
      .where(ne(workspaces.ownerId, viewerId))
      .orderBy(desc(professionalProfiles.publishedAt))
      .limit(200),
  );

  const q = opts.q?.trim().toLowerCase() ?? '';
  const role = opts.role?.trim().toLowerCase() ?? '';

  const cards = rows.map((r) => ({
    profileId: r.profileId,
    userId: r.userId,
    name: r.name?.trim() || r.workspaceName,
    username: r.username,
    headline: r.headline,
    role: r.role,
    markets: Array.isArray(r.markets) ? r.markets : [],
  }));

  return cards
    .filter((c) => {
      if (!q) return true;
      return `${c.name} ${c.headline ?? ''} ${c.role ?? ''} ${c.markets.join(' ')}`
        .toLowerCase()
        .includes(q);
    })
    .filter((c) => (role ? (c.role ?? '').toLowerCase() === role : true));
}

/** Published cards for a specific set of profile ids (used by the Saved page). */
export async function getProfilesByIds(profileIds: string[]): Promise<DiscoverCard[]> {
  if (profileIds.length === 0 || !databaseConfigured) return [];
  const rows = await withPublicDb(async (tx) =>
    tx
      .select({
        profileId: professionalProfiles.id,
        userId: workspaces.ownerId,
        name: professionalProfiles.displayName,
        workspaceName: workspaces.name,
        username: workspaces.username,
        headline: professionalProfiles.headline,
        role: professionalProfiles.role,
        markets: professionalProfiles.markets,
      })
      .from(professionalProfiles)
      .innerJoin(workspaces, eq(workspaces.id, professionalProfiles.workspaceId))
      .where(inArray(professionalProfiles.id, profileIds)),
  );
  return rows.map((r) => ({
    profileId: r.profileId,
    userId: r.userId,
    name: r.name?.trim() || r.workspaceName,
    username: r.username,
    headline: r.headline,
    role: r.role,
    markets: Array.isArray(r.markets) ? r.markets : [],
  }));
}

/** Mark every unread message from one person as read (called when their thread is opened). */
export async function markThreadRead(viewerId: string, otherId: string): Promise<void> {
  if (!otherId) return;
  await withUserDb(viewerId, async (tx) => {
    await tx
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.recipientId, viewerId),
          eq(messages.senderId, otherId),
          isNull(messages.readAt),
        ),
      );
  });
}

/** Best-effort display info for a set of user ids, from their published profiles only. */
export async function resolvePeople(userIds: string[]): Promise<Record<string, PersonInfo>> {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  const out: Record<string, PersonInfo> = {};
  if (unique.length === 0 || !databaseConfigured) return out;

  const rows = await withPublicDb(async (tx) =>
    tx
      .select({
        userId: workspaces.ownerId,
        profileId: professionalProfiles.id,
        name: professionalProfiles.displayName,
        workspaceName: workspaces.name,
        headline: professionalProfiles.headline,
        role: professionalProfiles.role,
        username: workspaces.username,
      })
      .from(workspaces)
      .innerJoin(professionalProfiles, eq(professionalProfiles.workspaceId, workspaces.id))
      .where(inArray(workspaces.ownerId, unique)),
  );

  for (const r of rows) {
    if (!out[r.userId]) {
      out[r.userId] = {
        userId: r.userId,
        profileId: r.profileId,
        name: r.name?.trim() || r.workspaceName || 'ORREI member',
        headline: r.headline,
        role: r.role,
        username: r.username,
      };
    }
  }
  return out;
}

/** Every connection that involves the viewer, newest first. */
export async function listMyConnections(viewerId: string): Promise<ConnectionRecord[]> {
  return withUserDb(viewerId, async (tx) => {
    const rows = await tx
      .select()
      .from(connections)
      .where(or(eq(connections.requesterId, viewerId), eq(connections.recipientId, viewerId)))
      .orderBy(desc(connections.createdAt));
    return rows.map((r) => ({
      id: r.id,
      requesterId: r.requesterId,
      recipientId: r.recipientId,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));
  });
}

/** The full thread between the viewer and one other person, oldest first. */
export async function getThread(viewerId: string, otherId: string): Promise<ChatMessage[]> {
  return withUserDb(viewerId, async (tx) => {
    const rows = await tx
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, viewerId), eq(messages.recipientId, otherId)),
          and(eq(messages.senderId, otherId), eq(messages.recipientId, viewerId)),
        ),
      )
      .orderBy(asc(messages.createdAt));
    return rows.map((r) => ({
      id: r.id,
      senderId: r.senderId,
      recipientId: r.recipientId,
      body: r.body,
      readAt: r.readAt ? r.readAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      mine: r.senderId === viewerId,
    }));
  });
}

/** Inbox: one entry per person the viewer has exchanged messages with, newest first. */
export async function getInbox(viewerId: string): Promise<InboxThread[]> {
  const rows = await withUserDb(viewerId, async (tx) =>
    tx
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, viewerId), eq(messages.recipientId, viewerId)))
      .orderBy(desc(messages.createdAt))
      .limit(500),
  );

  const byOther = new Map<string, { lastBody: string; lastAt: string; unread: number }>();
  for (const m of rows) {
    const other = m.senderId === viewerId ? m.recipientId : m.senderId;
    const existing = byOther.get(other);
    if (!existing) {
      byOther.set(other, {
        lastBody: m.body,
        lastAt: m.createdAt.toISOString(),
        unread: m.recipientId === viewerId && !m.readAt ? 1 : 0,
      });
    } else if (m.recipientId === viewerId && !m.readAt) {
      existing.unread += 1;
    }
  }

  const people = await resolvePeople(Array.from(byOther.keys()));
  const threads: InboxThread[] = [];
  for (const [userId, info] of byOther) {
    threads.push({
      userId,
      name: people[userId]?.name ?? 'ORREI member',
      lastBody: info.lastBody,
      lastAt: info.lastAt,
      unread: info.unread,
    });
  }
  return threads;
}

/** Saved profiles for the viewer (ids + timestamps only; the page hydrates public data). */
export async function listSaved(viewerId: string): Promise<{ profileId: string; savedAt: string }[]> {
  return withUserDb(viewerId, async (tx) => {
    const rows = await tx
      .select({ profileId: savedProfiles.profileId, savedAt: savedProfiles.createdAt })
      .from(savedProfiles)
      .where(eq(savedProfiles.userId, viewerId))
      .orderBy(desc(savedProfiles.createdAt));
    return rows.map((r) => ({ profileId: r.profileId, savedAt: r.savedAt.toISOString() }));
  });
}

/** Saved profile ids for the viewer, for quick button-state checks on the discover grid. */
export async function savedProfileIds(viewerId: string): Promise<Set<string>> {
  const rows = await listSaved(viewerId);
  return new Set(rows.map((r) => r.profileId));
}

export type NetworkCounts = { messagesUnread: number; connectionsPending: number };

export async function networkCounts(viewerId: string): Promise<NetworkCounts> {
  return withUserDb(viewerId, async (tx) => {
    const unreadRows = await tx
      .select({ id: messages.id })
      .from(messages)
      .where(and(eq(messages.recipientId, viewerId), isNull(messages.readAt)));
    const pending = await tx
      .select({ id: connections.id })
      .from(connections)
      .where(and(eq(connections.recipientId, viewerId), eq(connections.status, 'pending')));
    return { messagesUnread: unreadRows.length, connectionsPending: pending.length };
  });
}