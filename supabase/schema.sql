begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'Sukarelawan'
    check (role in ('Admin Induk', 'Admin Kluster', 'Admin Venue', 'Ketua Unit', 'Sukarelawan')),
  cluster text,
  venue text,
  unit text,
  status text not null default 'Aktif'
    check (status in ('Aktif', 'Digantung', 'Tidak aktif')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_format check (email is null or email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint profiles_phone_format check (phone is null or phone ~ '^\+?[0-9]{9,15}$')
);

create unique index if not exists profiles_email_unique
  on public.profiles (lower(email))
  where email is not null;

create table if not exists public.volunteers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null check (length(trim(name)) >= 2),
  email text,
  phone text,
  age int check (age between 18 and 80),
  cluster text,
  venue text,
  unit text,
  application_status text not null default 'Permohonan'
    check (application_status in ('Permohonan', 'Semakan', 'Diluluskan', 'Ditolak')),
  screening_status text not null default 'Belum'
    check (screening_status in ('Belum', 'Semakan', 'Lulus', 'Gagal', 'Diluluskan', 'Ditolak')),
  placement_status text not null default 'Belum ditempatkan'
    check (placement_status in ('Belum ditempatkan', 'Ditempatkan', 'Ditukar', 'Selesai')),
  kit_status text not null default 'Belum agih'
    check (kit_status in ('Belum agih', 'Sebahagian', 'Belum lengkap', 'Lengkap')),
  accreditation_status text not null default 'Belum'
    check (accreditation_status in ('Belum', 'Draf', 'Aktif', 'Digantung')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint volunteers_email_format check (email is null or email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint volunteers_phone_format check (phone is null or phone ~ '^\+?[0-9]{9,15}$')
);

create unique index if not exists volunteers_email_unique
  on public.volunteers (lower(email))
  where email is not null;

create unique index if not exists volunteers_phone_unique
  on public.volunteers (phone)
  where phone is not null;

create unique index if not exists volunteers_profile_unique
  on public.volunteers (profile_id)
  where profile_id is not null;

create index if not exists volunteers_scope_idx on public.volunteers (cluster, venue, unit);
create index if not exists volunteers_status_idx on public.volunteers (application_status);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  status text not null default 'Permohonan'
    check (status in ('Permohonan', 'Semakan', 'Diluluskan', 'Ditolak')),
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  remarks text
);

create table if not exists public.screening_results (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  score numeric check (score >= 0 and score <= 100),
  result text check (result in ('Belum', 'Semakan', 'Lulus', 'Gagal', 'Diluluskan', 'Ditolak')),
  notes text,
  screened_by uuid references auth.users(id) on delete set null,
  screened_at timestamptz not null default now()
);

create table if not exists public.placements (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  cluster text,
  venue text,
  unit text,
  shift text,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now()
);

create table if not exists public.training_records (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  training_name text not null,
  training_date date,
  attendance_status text check (attendance_status in ('Hadir', 'Tidak hadir', 'Dikecualikan')),
  completion_status text check (completion_status in ('Belum mula', 'Dalam latihan', 'Selesai', 'Gagal')),
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  event_name text,
  venue text,
  check_in_time timestamptz not null default now(),
  check_out_time timestamptz,
  method text check (method in ('QR', 'Manual', 'GPS', 'Import')),
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint attendance_checkout_after_checkin check (check_out_time is null or check_out_time >= check_in_time)
);

create table if not exists public.kit_accreditation (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  kit_status text check (kit_status in ('Belum agih', 'Sebahagian', 'Belum lengkap', 'Lengkap')),
  pass_status text check (pass_status in ('Belum', 'Draf', 'Aktif', 'Digantung')),
  accreditation_status text check (accreditation_status in ('Belum', 'Draf', 'Aktif', 'Digantung')),
  issued_by uuid references auth.users(id) on delete set null,
  issued_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references auth.users(id) on delete set null,
  volunteer_id uuid references public.volunteers(id) on delete set null,
  category text,
  subject text,
  message text not null check (length(trim(message)) > 0),
  status text not null default 'Baharu'
    check (status in ('Baharu', 'Dalam tindakan', 'Selesai', 'Ditutup')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  message text not null check (length(trim(message)) > 0),
  target_role text check (target_role is null or target_role in ('Admin Induk', 'Admin Kluster', 'Admin Venue', 'Ketua Unit', 'Sukarelawan')),
  target_cluster text,
  target_venue text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);
create index if not exists audit_logs_table_idx on public.audit_logs (table_name, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_volunteers_updated_at on public.volunteers;
create trigger set_volunteers_updated_at
before update on public.volunteers
for each row execute function public.set_updated_at();

drop trigger if exists set_complaints_updated_at on public.complaints;
create trigger set_complaints_updated_at
before update on public.complaints
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'phone', ''), '[[:space:]-]', '', 'g'), ''),
    'Sukarelawan',
    'Aktif'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      phone = coalesce(public.profiles.phone, excluded.phone),
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_cluster()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select cluster from public.profiles where id = auth.uid()
$$;

create or replace function public.current_venue()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select venue from public.profiles where id = auth.uid()
$$;

create or replace function public.current_unit()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select unit from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin_induk()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role(), '') = 'Admin Induk'
$$;

create or replace function public.can_access_volunteer(
  volunteer_cluster text,
  volunteer_venue text,
  volunteer_unit text,
  volunteer_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin_induk()
    or (
      public.current_role() = 'Admin Kluster'
      and volunteer_cluster is not distinct from public.current_cluster()
    )
    or (
      public.current_role() = 'Admin Venue'
      and volunteer_venue is not distinct from public.current_venue()
    )
    or (
      public.current_role() = 'Ketua Unit'
      and volunteer_unit is not distinct from public.current_unit()
    )
    or (
      public.current_role() = 'Sukarelawan'
      and volunteer_profile_id = auth.uid()
    )
$$;

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if public.is_admin_induk() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.id := auth.uid();
    new.role := 'Sukarelawan';
    new.status := coalesce(new.status, 'Aktif');
    return new;
  end if;

  if old.role is distinct from new.role
    or old.cluster is distinct from new.cluster
    or old.venue is distinct from new.venue
    or old.unit is distinct from new.unit
    or old.status is distinct from new.status then
    raise exception 'Only Admin Induk can change role, scope, or status fields.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_privilege_escalation on public.profiles;
create trigger prevent_profile_privilege_escalation
before insert or update on public.profiles
for each row execute function public.prevent_profile_privilege_escalation();

create or replace function public.protect_volunteer_sensitive_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
begin
  if auth.uid() is null then
    return new;
  end if;

  actor_role := public.current_role();

  if actor_role = 'Admin Induk' then
    return new;
  end if;

  if tg_op = 'INSERT' and actor_role = 'Sukarelawan' then
    new.profile_id := auth.uid();
    new.application_status := 'Permohonan';
    new.screening_status := 'Belum';
    new.placement_status := 'Belum ditempatkan';
    new.kit_status := 'Belum agih';
    new.accreditation_status := 'Belum';
    return new;
  end if;

  if tg_op = 'UPDATE' and actor_role = 'Sukarelawan' then
    if old.profile_id is distinct from auth.uid()
      or old.profile_id is distinct from new.profile_id
      or old.cluster is distinct from new.cluster
      or old.venue is distinct from new.venue
      or old.unit is distinct from new.unit
      or old.application_status is distinct from new.application_status
      or old.screening_status is distinct from new.screening_status
      or old.placement_status is distinct from new.placement_status
      or old.kit_status is distinct from new.kit_status
      or old.accreditation_status is distinct from new.accreditation_status
      or old.created_by is distinct from new.created_by then
      raise exception 'Sukarelawan can only update own personal volunteer fields.';
    end if;
  end if;

  if tg_op = 'UPDATE' and actor_role = 'Admin Venue' then
    if old.application_status is distinct from new.application_status
      or old.screening_status is distinct from new.screening_status then
      raise exception 'Admin Venue cannot approve applications or change screening status.';
    end if;
  end if;

  if tg_op = 'UPDATE' and actor_role = 'Ketua Unit' then
    raise exception 'Ketua Unit cannot update main volunteer records directly.';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_volunteer_sensitive_fields on public.volunteers;
create trigger protect_volunteer_sensitive_fields
before insert or update on public.volunteers
for each row execute function public.protect_volunteer_sensitive_fields();

create or replace function public.audit_table_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changed_record_id uuid;
begin
  changed_record_id := coalesce((to_jsonb(new)->>'id')::uuid, (to_jsonb(old)->>'id')::uuid);

  insert into public.audit_logs (actor_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    changed_record_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'volunteers',
    'applications',
    'screening_results',
    'placements',
    'training_records',
    'attendance_logs',
    'kit_accreditation',
    'complaints',
    'broadcasts'
  ]
  loop
    execute format('drop trigger if exists audit_%I_changes on public.%I', table_name, table_name);
    execute format(
      'create trigger audit_%I_changes after insert or update or delete on public.%I for each row execute function public.audit_table_changes()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

commit;
