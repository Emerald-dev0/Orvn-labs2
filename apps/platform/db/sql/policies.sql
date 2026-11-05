-- ============================================================================
-- LAREI — row level security
--
-- Applied after migrations:  npm run db:policies
-- Idempotent. Safe to re-run.
--
-- Roles
--   larei_app     authenticated application role. RLS applies to every tenant table.
--   larei_public  the role the *public page code path* uses. Read-only over published
--                 projections, plus the two writes a visitor can cause: an inquiry row and
--                 a view counter.
--
-- The application never ships a browser-direct database connection: both roles are used
-- server-side only. They exist so that authorisation is enforced twice — once by the scoped
-- data layer, once by Postgres.
--
-- Table owners bypass RLS unless FORCE is set. We do not FORCE here because the same
-- connection also runs Better Auth against non-tenant tables; instead the data layer always
-- issues SET LOCAL ROLE, so even an owner connection is demoted for tenant queries.
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'larei_app') then
    create role larei_app nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'larei_public') then
    create role larei_public nologin;
  end if;
end $$;

-- The migrating role must be able to assume them (needed for SET LOCAL ROLE).
do $$
begin
  execute format('grant larei_app, larei_public to %I', current_user);
exception when others then
  raise notice 'Could not grant roles to %: %', current_user, sqlerrm;
end $$;

grant usage on schema public to larei_app, larei_public;

grant select, insert, update, delete on all tables in schema public to larei_app;
grant usage, select on all sequences in schema public to larei_app;

alter default privileges in schema public grant select, insert, update, delete on tables to larei_app;

-- ---------------------------------------------------------------------------
-- Helper functions. Security definer so policies can look at memberships without
-- recursing through the memberships policy itself.
-- ---------------------------------------------------------------------------

create or replace function app_uid() returns text
language sql stable
as $$ select nullif(current_setting('app.user_id', true), '') $$;

create or replace function app_is_member(ws uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from memberships m
    where m.workspace_id = ws and m.user_id = app_uid()
  )
$$;

create or replace function app_is_owner(ws uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from memberships m
    where m.workspace_id = ws and m.user_id = app_uid() and m.role = 'owner'
  )
$$;

create or replace function app_can_write(ws uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from memberships m
    where m.workspace_id = ws and m.user_id = app_uid() and m.role in ('owner', 'editor')
  )
$$;

create or replace function app_property_workspace(p uuid) returns uuid
language sql stable security definer set search_path = public, pg_temp
as $$ select workspace_id from properties where id = p $$;

create or replace function app_property_is_public(p uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from properties pr
    where pr.id = p and pr.publication_status = 'published' and pr.published_at is not null
  )
$$;

-- ---------------------------------------------------------------------------
-- Tenancy
-- ---------------------------------------------------------------------------

alter table workspaces enable row level security;
drop policy if exists workspaces_read on workspaces;
create policy workspaces_read on workspaces for select to larei_app using (app_is_member(id));
drop policy if exists workspaces_update on workspaces;
create policy workspaces_update on workspaces for update to larei_app
  using (app_is_owner(id))
  with check (app_is_owner(id) and owner_id = app_uid());
drop policy if exists workspaces_public_read on workspaces;
create policy workspaces_public_read on workspaces for select to larei_public
  using (exists (
    select 1 from professional_profiles pp
    where pp.workspace_id = workspaces.id and pp.published_at is not null
  ));

alter table memberships enable row level security;
drop policy if exists memberships_read on memberships;
create policy memberships_read on memberships for select to larei_app using (app_is_member(workspace_id));
drop policy if exists memberships_owner_write on memberships;
create policy memberships_owner_write on memberships for all to larei_app
  using (app_is_owner(workspace_id))
  with check (app_is_owner(workspace_id));

-- ---------------------------------------------------------------------------
-- Property records
-- ---------------------------------------------------------------------------

alter table properties enable row level security;
drop policy if exists properties_read on properties;
create policy properties_read on properties for select to larei_app using (app_is_member(workspace_id));
drop policy if exists properties_insert on properties;
create policy properties_insert on properties for insert to larei_app
  with check (app_can_write(workspace_id) and created_by = app_uid());
drop policy if exists properties_update on properties;
create policy properties_update on properties for update to larei_app
  using (app_can_write(workspace_id))
  with check (app_can_write(workspace_id));
drop policy if exists properties_delete on properties;
create policy properties_delete on properties for delete to larei_app using (app_is_owner(workspace_id));
drop policy if exists properties_public_read on properties;
create policy properties_public_read on properties for select to larei_public
  using (publication_status = 'published' and published_at is not null);

alter table property_details enable row level security;
drop policy if exists details_read on property_details;
create policy details_read on property_details for select to larei_app
  using (app_is_member(app_property_workspace(property_id)));
drop policy if exists details_write on property_details;
create policy details_write on property_details for all to larei_app
  using (app_can_write(app_property_workspace(property_id)))
  with check (app_can_write(app_property_workspace(property_id)));
drop policy if exists details_public_read on property_details;
create policy details_public_read on property_details for select to larei_public
  using (
    is_public = true
    and approval_state = 'approved'
    and app_property_is_public(property_id)
  );

alter table property_media enable row level security;
drop policy if exists media_read on property_media;
create policy media_read on property_media for select to larei_app
  using (app_is_member(app_property_workspace(property_id)));
drop policy if exists media_write on property_media;
create policy media_write on property_media for all to larei_app
  using (app_can_write(app_property_workspace(property_id)))
  with check (app_can_write(app_property_workspace(property_id)));
drop policy if exists media_public_read on property_media;
create policy media_public_read on property_media for select to larei_public
  using (visibility = 'public' and app_property_is_public(property_id));

alter table property_publications enable row level security;
drop policy if exists publications_read on property_publications;
create policy publications_read on property_publications for select to larei_app
  using (app_is_member(app_property_workspace(property_id)));
drop policy if exists publications_write on property_publications;
create policy publications_write on property_publications for all to larei_app
  using (app_can_write(app_property_workspace(property_id)))
  with check (app_can_write(app_property_workspace(property_id)));
drop policy if exists publications_public_read on property_publications;
create policy publications_public_read on property_publications for select to larei_public
  using (unpublished_at is null and app_property_is_public(property_id));

-- A snapshot is evidence of what went live. Only the unpublish timestamp may change.
create or replace function prevent_snapshot_mutation() returns trigger
language plpgsql
as $$
begin
  if new.snapshot is distinct from old.snapshot
     or new.version is distinct from old.version
     or new.property_id is distinct from old.property_id then
    raise exception 'publication snapshots are immutable';
  end if;
  return new;
end $$;

drop trigger if exists property_publications_immutable on property_publications;
create trigger property_publications_immutable
  before update on property_publications
  for each row execute function prevent_snapshot_mutation();

-- ---------------------------------------------------------------------------
-- Demand
-- ---------------------------------------------------------------------------

alter table inquiries enable row level security;
drop policy if exists inquiries_read on inquiries;
create policy inquiries_read on inquiries for select to larei_app using (app_is_member(workspace_id));
drop policy if exists inquiries_update on inquiries;
create policy inquiries_update on inquiries for update to larei_app
  using (app_is_member(workspace_id))
  with check (app_is_member(workspace_id));
-- No insert policy for larei_app: the workspace is chosen by the server, never by the tenant.
drop policy if exists inquiries_public_insert on inquiries;
create policy inquiries_public_insert on inquiries for insert to larei_public
  with check (
    consent = true
    and property_id is not null
    and workspace_id = app_property_workspace(property_id)
    and app_property_is_public(property_id)
  );

alter table analytics_events enable row level security;
drop policy if exists events_read on analytics_events;
create policy events_read on analytics_events for select to larei_app using (app_is_member(workspace_id));
drop policy if exists events_public_insert on analytics_events;
create policy events_public_insert on analytics_events for insert to larei_public
  with check (
    property_id is not null
    and workspace_id = app_property_workspace(property_id)
    and app_property_is_public(property_id)
  );
-- Append-only: no update or delete policy for either role.

-- ---------------------------------------------------------------------------
-- Beta access and audit
-- ---------------------------------------------------------------------------

alter table invitations enable row level security;
drop policy if exists invitations_read on invitations;
create policy invitations_read on invitations for select to larei_app
  using (workspace_id is not null and app_is_owner(workspace_id));
drop policy if exists invitations_owner_write on invitations;
create policy invitations_owner_write on invitations for all to larei_app
  using (workspace_id is not null and app_is_owner(workspace_id))
  with check (workspace_id is not null and app_is_owner(workspace_id));
-- Beta invitations (workspace_id null) are readable only through app_inspect_invitation()
-- and the admin connection, so a workspace owner can never enumerate the waitlist.

alter table ai_generations enable row level security;
drop policy if exists generations_read on ai_generations;
create policy generations_read on ai_generations for select to larei_app using (app_is_member(workspace_id));
drop policy if exists generations_write on ai_generations;
create policy generations_write on ai_generations for all to larei_app
  using (app_can_write(workspace_id))
  with check (app_can_write(workspace_id));

alter table audit_events enable row level security;
drop policy if exists audit_read on audit_events;
create policy audit_read on audit_events for select to larei_app using (app_is_member(workspace_id));
drop policy if exists audit_append on audit_events;
create policy audit_append on audit_events for insert to larei_app
  with check (actor_id = app_uid() and (workspace_id is null or app_is_member(workspace_id)));
-- Append-only: deliberately no update or delete policy.

alter table rate_limits enable row level security;
drop policy if exists rate_limits_public on rate_limits;
create policy rate_limits_public on rate_limits for all to larei_public using (true) with check (true);
drop policy if exists rate_limits_app on rate_limits;
create policy rate_limits_app on rate_limits for all to larei_app using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Public professional profile
-- ---------------------------------------------------------------------------

alter table professional_profiles enable row level security;
drop policy if exists profiles_read on professional_profiles;
create policy profiles_read on professional_profiles for select to larei_app
  using (app_is_member(workspace_id));
drop policy if exists profiles_write on professional_profiles;
create policy profiles_write on professional_profiles for all to larei_app
  using (app_can_write(workspace_id))
  with check (app_can_write(workspace_id));
drop policy if exists profiles_public_read on professional_profiles;
create policy profiles_public_read on professional_profiles for select to larei_public
  using (published_at is not null);

grant select on properties, property_details, property_media, property_publications,
  professional_profiles, workspaces to larei_public;
grant insert on inquiries, analytics_events to larei_public;
grant select, insert, update on rate_limits to larei_public;

-- ---------------------------------------------------------------------------
-- Narrow privileged paths.
--
-- Everything above denies by default. These two functions are the only places the
-- application can cross a tenant boundary, and both are tightly constrained:
-- accepting an invitation bound to the signed-in address, and creating a workspace for
-- the signed-in user.
-- ---------------------------------------------------------------------------

create or replace function app_inspect_invitation(p_token_hash text, p_email text default null)
returns table (
  valid boolean,
  masked_email text,
  workspace_id uuid,
  workspace_name text,
  role member_role,
  expires_at timestamptz,
  email_matches boolean
)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
declare inv invitations;
begin
  select * into inv from invitations i where i.token_hash = p_token_hash;
  if not found then
    return query select false, null::text, null::uuid, null::text, null::member_role,
                        null::timestamptz, false;
    return;
  end if;

  return query
    select
      (inv.accepted_at is null and inv.revoked_at is null and inv.expires_at > now()) as valid,
      left(inv.email, 1) || '•••' || substring(inv.email from position('@' in inv.email)) as masked_email,
      inv.workspace_id,
      w.name,
      inv.role,
      inv.expires_at,
      (p_email is not null and lower(inv.email) = lower(p_email)) as email_matches
    from (select 1) s
    left join workspaces w on w.id = inv.workspace_id;
end $$;

-- Accepting an invitation. One function, one transaction: validate the token, attach the
-- signed-in user, and for a beta invitation (no workspace yet) create the workspace it opens.
create or replace function app_accept_invitation(
  p_token_hash text,
  p_user_id text,
  p_email text,
  p_workspace_name text default null,
  p_username text default null
)
returns uuid
language plpgsql security definer set search_path = public, pg_temp
as $$
declare inv invitations; ws uuid;
begin
  select * into inv from invitations i
   where i.token_hash = p_token_hash
   for update;

  if not found then
    raise exception 'invitation_invalid' using errcode = 'P0001';
  end if;
  if inv.accepted_at is not null then
    raise exception 'invitation_already_used' using errcode = 'P0001';
  end if;
  if inv.revoked_at is not null or inv.expires_at <= now() then
    raise exception 'invitation_expired' using errcode = 'P0001';
  end if;
  if lower(inv.email) <> lower(p_email) then
    raise exception 'invitation_email_mismatch' using errcode = 'P0001';
  end if;

  ws := inv.workspace_id;

  if ws is null then
    if p_workspace_name is null or p_username is null then
      raise exception 'workspace_details_required' using errcode = 'P0001';
    end if;

    insert into workspaces (name, username, owner_id)
    values (p_workspace_name, lower(p_username), p_user_id)
    returning id into ws;

    insert into professional_profiles (workspace_id, display_name, contact_email)
    select ws, coalesce(u.name, p_workspace_name), u.email from "user" u where u.id = p_user_id;
  end if;

  insert into memberships (workspace_id, user_id, role)
  values (ws, p_user_id, inv.role)
  on conflict (user_id, workspace_id) do update set role = excluded.role;

  update invitations
     set accepted_at = now(), accepted_by = p_user_id
   where id = inv.id;

  insert into audit_events (workspace_id, actor_id, action, target_type, target_id, metadata)
  values (ws, p_user_id, 'invitation.accepted', 'invitation', inv.id::text,
          jsonb_build_object('role', inv.role));

  return ws;
end $$;

create or replace function app_create_workspace(p_name text, p_username text)
returns uuid
language plpgsql security definer set search_path = public, pg_temp
as $$
declare ws uuid; uid text;
begin
  select app_uid() into uid;
  if uid is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  insert into workspaces (name, username, owner_id)
  values (p_name, lower(p_username), uid)
  returning id into ws;

  insert into memberships (workspace_id, user_id, role) values (ws, uid, 'owner');

  insert into professional_profiles (workspace_id, display_name, contact_email)
  select ws, coalesce(u.name, p_name), u.email from "user" u where u.id = uid;

  insert into audit_events (workspace_id, actor_id, action, target_type, target_id)
  values (ws, uid, 'workspace.created', 'workspace', ws::text);

  return ws;
end $$;

revoke all on function app_accept_invitation(text, text, text, text, text) from public;
revoke all on function app_create_workspace(text, text) from public;
revoke all on function app_inspect_invitation(text, text) from public;
grant execute on function app_accept_invitation(text, text, text, text, text) to larei_app;
grant execute on function app_create_workspace(text, text) to larei_app;
grant execute on function app_inspect_invitation(text, text) to larei_app;

-- ---------------------------------------------------------------------------
-- Beta applications
--
-- Operator data. No tenant owns a row, so neither application role gets a policy: RLS is
-- enabled and denies everything by default. Applications are read and written only over the
-- admin connection, which is the table owner and therefore bypasses these policies.
-- ---------------------------------------------------------------------------

alter table beta_applications enable row level security;
