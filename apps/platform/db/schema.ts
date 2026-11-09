import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export * from './auth-schema';
import { user } from './auth-schema';

/* ── Enums ─────────────────────────────────────────────────────────────── */

export const memberRole = pgEnum('member_role', ['owner', 'editor', 'viewer']);
export const propertyType = pgEnum('property_type', [
  'vacant_land',
  'residential',
  'package',
  'project',
]);
export const availabilityStatus = pgEnum('availability_status', [
  'available',
  'pending',
  'sold',
  'showcase',
]);
export const publicationStatus = pgEnum('publication_status', [
  'draft',
  'needs_review',
  'published',
  'unpublished',
  'archived',
]);
export const visibility = pgEnum('visibility', ['public', 'private']);
export const approvalState = pgEnum('approval_state', [
  'unreviewed',
  'approved',
  'rejected',
  'unknown',
]);
export const locationPrecision = pgEnum('location_precision', ['exact', 'approximate', 'unknown']);
export const priceVisibility = pgEnum('price_visibility', ['public', 'on_request', 'hidden']);
export const inquiryStatus = pgEnum('inquiry_status', ['new', 'read', 'archived']);

/* ── Tenancy ───────────────────────────────────────────────────────────── */

export const workspaces = pgTable(
  'workspaces',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    username: text('username').notNull(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    headline: text('headline'),
    brand: jsonb('brand').$type<{ accent?: string; logoKey?: string; coverKey?: string }>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('workspaces_username_key').on(t.username)],
);

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: memberRole('role').notNull().default('owner'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('memberships_user_workspace_key').on(t.userId, t.workspaceId)],
);

/* ── Property records ──────────────────────────────────────────────────── */

export const properties = pgTable(
  'properties',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    /** Owner-written copy for the public page. Facts stay in property_details. */
    description: text('description'),
    propertyType: propertyType('property_type').notNull(),
    addressLine: text('address_line'),
    addressVisible: boolean('address_visible').notNull().default(true),
    city: text('city'),
    region: text('region'),
    country: text('country'),
    lat: numeric('lat', { precision: 9, scale: 6 }),
    lng: numeric('lng', { precision: 9, scale: 6 }),
    locationPrecision: locationPrecision('location_precision').notNull().default('unknown'),
    priceAmount: numeric('price_amount', { precision: 14, scale: 2 }),
    currency: text('currency'),
    priceVisibility: priceVisibility('price_visibility').notNull().default('on_request'),
    /** A published property stays off the professional portfolio until its owner opts in. */
    showOnPortfolio: boolean('show_on_portfolio').notNull().default(true),
    availabilityStatus: availabilityStatus('availability_status').notNull().default('available'),
    publicationStatus: publicationStatus('publication_status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    /** F08 requires an explicit attestation that the user has the right to publish. */
    rightsAttestedAt: timestamp('rights_attested_at', { withTimezone: true }),
    rightsAttestedBy: text('rights_attested_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  },
  (t) => [
    uniqueIndex('properties_workspace_slug_key').on(t.workspaceId, t.slug),
    index('properties_workspace_status_idx').on(t.workspaceId, t.publicationStatus),
  ],
);

/** One row per fact. Provenance lives here, not in a blob, because F04 requires it. */
export const propertyDetails = pgTable(
  'property_details',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    value: text('value'),
    sourceType: text('source_type').notNull().default('manual'),
    sourceReference: text('source_reference'),
    confidence: numeric('confidence', { precision: 3, scale: 2 }),
    approvalState: approvalState('approval_state').notNull().default('unreviewed'),
    isPublic: boolean('is_public').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('property_details_property_idx').on(t.propertyId)],
);

export const propertyMedia = pgTable(
  'property_media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    storageKey: text('storage_key').notNull(),
    kind: text('kind').notNull().default('photo'),
    sortOrder: integer('sort_order').notNull().default(0),
    isCover: boolean('is_cover').notNull().default(false),
    visibility: visibility('visibility').notNull().default('private'),
    width: integer('width'),
    height: integer('height'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('property_media_property_idx').on(t.propertyId)],
);

/** What actually went live. The public page renders this, never the live draft. */
export const propertyPublications = pgTable(
  'property_publications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    version: integer('version').notNull().default(1),
    snapshot: jsonb('snapshot').notNull(),
    publishedBy: text('published_by').references(() => user.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    unpublishedAt: timestamp('unpublished_at', { withTimezone: true }),
  },
  (t) => [index('property_publications_property_idx').on(t.propertyId)],
);

/* ── Demand ────────────────────────────────────────────────────────────── */

export const inquiries = pgTable(
  'inquiries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'set null' }),
    name: text('name'),
    email: text('email').notNull(),
    phone: text('phone'),
    message: text('message').notNull(),
    consent: boolean('consent').notNull().default(false),
    source: text('source'),
    /** Hashed submit token. The unique index is what makes "exactly once" true, not retries. */
    dedupeKey: text('dedupe_key'),
    /** Salted hash of the submitter's address, for abuse limits only. Raw IP is never stored. */
    ipHash: text('ip_hash'),
    status: inquiryStatus('status').notNull().default('new'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('inquiries_workspace_idx').on(t.workspaceId, t.createdAt),
    uniqueIndex('inquiries_dedupe_key').on(t.dedupeKey),
  ],
);

export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'set null' }),
    type: text('type').notNull(),
    visitorHash: text('visitor_hash'),
    referrer: text('referrer'),
    isBot: boolean('is_bot').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('analytics_events_workspace_idx').on(t.workspaceId, t.createdAt)],
);

/* ── Beta access ───────────────────────────────────────────────────────── */

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
    role: memberRole('role').notNull().default('owner'),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    acceptedBy: text('accepted_by').references(() => user.id, { onDelete: 'set null' }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    note: text('note'),
    invitedBy: text('invited_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('invitations_token_hash_key').on(t.tokenHash)],
);

/* ── AI audit trail ────────────────────────────────────────────────────── */

export const aiGenerations = pgTable(
  'ai_generations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'set null' }),
    kind: text('kind').notNull(),
    model: text('model').notNull(),
    promptVersion: text('prompt_version').notNull(),
    input: jsonb('input'),
    output: text('output'),
    usage: jsonb('usage'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('ai_generations_workspace_idx').on(t.workspaceId, t.createdAt)],
);

/* ── Professional profile (the public "site") ──────────────────────────── */

export const professionalProfiles = pgTable(
  'professional_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    displayName: text('display_name'),
    headline: text('headline'),
    bio: text('bio'),
    markets: jsonb('markets').$type<string[]>().notNull().default([]),
    services: jsonb('services').$type<{ title: string; body: string }[]>().notNull().default([]),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    /** Only these are allowed on the public page. Anything else stays internal. */
    showPhone: boolean('show_phone').notNull().default(false),
    logoKey: text('logo_key'),
    coverKey: text('cover_key'),
    accent: text('accent'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('professional_profiles_workspace_key').on(t.workspaceId)],
);

/* ── Operations ────────────────────────────────────────────────────────── */

/** Fixed-window counters. Keys are hashed before they get here, never raw addresses. */
export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  count: integer('count').notNull().default(0),
});

/** Who did what to which record. Append-only from the application's point of view. */
export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
    actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    targetType: text('target_type'),
    targetId: text('target_id'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_events_workspace_idx').on(t.workspaceId, t.createdAt)],
);

/* ── Beta access requests ──────────────────────────────────────────────── */

/**
 * Waitlist applications. Operator data, not tenant data: no workspace owns a row, so no
 * tenant role can read them. They are readable only over the admin connection.
 *
 * One row per email. A resubmission is accepted and ignored rather than creating a second
 * application, which keeps the inbox honest and stops the form from being an existence oracle.
 */
export const betaApplications = pgTable(
  'beta_applications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    company: text('company'),
    role: text('role'),
    markets: text('markets'),
    volume: text('volume'),
    currentTools: text('current_tools'),
    frustration: text('frustration'),
    website: text('website'),
    consent: boolean('consent').notNull().default(false),
    status: text('status').notNull().default('new'),
    source: text('source'),
    ipHash: text('ip_hash'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('beta_applications_email_key').on(t.email)],
);

/**
 * Messages from the public contact form. Same principle as the beta queue: the row is the record,
 * the email is a nudge, and losing the notification must not lose the person.
 */
export const contactMessages = pgTable(
  'contact_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    company: text('company'),
    topic: text('topic'),
    message: text('message').notNull(),
    status: text('status').notNull().default('new'),
    source: text('source'),
    /** Salted hash of the submitter's address, for abuse limits only. Never the raw IP. */
    ipHash: text('ip_hash'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('contact_messages_created_idx').on(t.createdAt)],
);
