begin;

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  alter column status set default 'Menunggu Kelulusan';

update public.profiles
set status = 'Menunggu Kelulusan'
where status is null;

update public.profiles
set status = 'Digantung'
where status = 'Tidak aktif';

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('Aktif', 'Menunggu Kelulusan', 'Digantung', 'Ditolak'));

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
    'Menunggu Kelulusan'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      phone = coalesce(public.profiles.phone, excluded.phone),
      updated_at = now();

  return new;
end;
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
    new.status := 'Menunggu Kelulusan';
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

commit;
