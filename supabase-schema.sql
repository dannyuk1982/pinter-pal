-- Pinter Pal - Supabase Schema
-- Run this in the Supabase SQL editor

-- 1. Tables

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Household',
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  household_id uuid not null references households on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table pinters (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table brews (
  id uuid primary key default gen_random_uuid(),
  pinter_id uuid not null references pinters on delete cascade,
  household_id uuid not null references households on delete cascade,
  name text not null,
  kit_name text not null default '',
  start_date timestamptz not null,
  fermentation_days int not null default 7,
  conditioning_days int not null default 3,
  completed_steps int[] not null default '{}',
  created_at timestamptz not null default now()
);

create table invite_codes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  code text not null unique,
  used_by uuid references auth.users,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- 2. Helper function to get current user's household

create or replace function user_household_id()
returns uuid
language sql
stable
security definer
as $$
  select household_id from profiles where id = auth.uid()
$$;

-- 3. Row Level Security

alter table households enable row level security;
alter table profiles enable row level security;
alter table pinters enable row level security;
alter table brews enable row level security;
alter table invite_codes enable row level security;

-- Households: users can read their own household
create policy "Users can view own household"
  on households for select
  using (id = user_household_id());

create policy "Users can update own household"
  on households for update
  using (id = user_household_id());

-- Profiles: users can read profiles in their household
create policy "Users can view household profiles"
  on profiles for select
  using (household_id = user_household_id());

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

-- Pinters: CRUD scoped to household
create policy "Users can view household pinters"
  on pinters for select
  using (household_id = user_household_id());

create policy "Users can insert household pinters"
  on pinters for insert
  with check (household_id = user_household_id());

create policy "Users can update household pinters"
  on pinters for update
  using (household_id = user_household_id());

create policy "Users can delete household pinters"
  on pinters for delete
  using (household_id = user_household_id());

-- Brews: CRUD scoped to household
create policy "Users can view household brews"
  on brews for select
  using (household_id = user_household_id());

create policy "Users can insert household brews"
  on brews for insert
  with check (household_id = user_household_id());

create policy "Users can update household brews"
  on brews for update
  using (household_id = user_household_id());

create policy "Users can delete household brews"
  on brews for delete
  using (household_id = user_household_id());

-- Invite codes: users can manage codes for their household
create policy "Users can view household invite codes"
  on invite_codes for select
  using (household_id = user_household_id());

create policy "Users can create household invite codes"
  on invite_codes for insert
  with check (household_id = user_household_id());

-- 4. Trigger: auto-create household + profile + seed pinters on signup

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_household_id uuid;
begin
  -- Create a new household
  insert into public.households (name)
  values (coalesce(split_part(new.email, '@', 1), 'My') || '''s Household')
  returning id into new_household_id;

  -- Create profile
  insert into public.profiles (id, household_id, display_name)
  values (new.id, new_household_id, split_part(new.email, '@', 1));

  -- Seed default pinters
  insert into public.pinters (household_id, name) values
    (new_household_id, 'Derry'),
    (new_household_id, 'Jerry');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 5. RPC: join a household via invite code

create or replace function join_household(invite_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_household_id uuid;
  old_household_id uuid;
begin
  -- Validate the invite code
  select household_id into target_household_id
  from public.invite_codes
  where code = invite_code
    and used_by is null
    and expires_at > now();

  if target_household_id is null then
    raise exception 'Invalid or expired invite code';
  end if;

  -- Get user's current household
  select household_id into old_household_id
  from public.profiles
  where id = auth.uid();

  -- Move user to new household
  update public.profiles
  set household_id = target_household_id
  where id = auth.uid();

  -- Mark invite code as used
  update public.invite_codes
  set used_by = auth.uid()
  where code = invite_code;

  -- Delete old household if empty
  if not exists (
    select 1 from public.profiles where household_id = old_household_id
  ) then
    delete from public.households where id = old_household_id;
  end if;
end;
$$;

-- 6. Enable Realtime on pinters and brews

alter publication supabase_realtime add table pinters;
alter publication supabase_realtime add table brews;
