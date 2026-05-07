begin;

create or replace function public.current_status()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select status from public.profiles where id = auth.uid()
$$;

create or replace function public.is_active_account()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_status(), '') = 'Aktif'
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
    public.is_active_account()
    and (
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
    )
$$;

alter table public.profiles enable row level security;
alter table public.volunteers enable row level security;
alter table public.applications enable row level security;
alter table public.screening_results enable row level security;
alter table public.placements enable row level security;
alter table public.training_records enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.kit_accreditation enable row level security;
alter table public.complaints enable row level security;
alter table public.broadcasts enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_select_scope on public.profiles;
create policy profiles_select_scope on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or (public.is_admin_induk() and public.is_active_account())
  or (public.is_active_account() and public.current_role() = 'Admin Kluster' and cluster is not distinct from public.current_cluster())
  or (public.is_active_account() and public.current_role() = 'Admin Venue' and venue is not distinct from public.current_venue())
  or (public.is_active_account() and public.current_role() = 'Ketua Unit' and unit is not distinct from public.current_unit())
);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
for insert to authenticated
with check (id = auth.uid() or (public.is_admin_induk() and public.is_active_account()));

drop policy if exists profiles_update_scope on public.profiles;
create policy profiles_update_scope on public.profiles
for update to authenticated
using ((id = auth.uid() and public.is_active_account()) or (public.is_admin_induk() and public.is_active_account()))
with check ((id = auth.uid() and public.is_active_account()) or (public.is_admin_induk() and public.is_active_account()));

drop policy if exists volunteers_select_scope on public.volunteers;
create policy volunteers_select_scope on public.volunteers
for select to authenticated
using (public.can_access_volunteer(cluster, venue, unit, profile_id));

drop policy if exists volunteers_insert_scope on public.volunteers;
create policy volunteers_insert_scope on public.volunteers
for insert to authenticated
with check (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or (public.current_role() = 'Admin Kluster' and cluster is not distinct from public.current_cluster())
    or (public.current_role() = 'Admin Venue' and venue is not distinct from public.current_venue())
    or (public.current_role() = 'Sukarelawan' and profile_id = auth.uid())
  )
);

drop policy if exists volunteers_update_scope on public.volunteers;
create policy volunteers_update_scope on public.volunteers
for update to authenticated
using (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or (public.current_role() = 'Admin Kluster' and cluster is not distinct from public.current_cluster())
    or (public.current_role() = 'Admin Venue' and venue is not distinct from public.current_venue())
    or (public.current_role() = 'Sukarelawan' and profile_id = auth.uid())
  )
)
with check (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or (public.current_role() = 'Admin Kluster' and cluster is not distinct from public.current_cluster())
    or (public.current_role() = 'Admin Venue' and venue is not distinct from public.current_venue())
    or (public.current_role() = 'Sukarelawan' and profile_id = auth.uid())
  )
);

drop policy if exists volunteers_delete_admin_induk on public.volunteers;
create policy volunteers_delete_admin_induk on public.volunteers
for delete to authenticated
using (public.is_admin_induk() and public.is_active_account());

drop policy if exists applications_select_scope on public.applications;
create policy applications_select_scope on public.applications
for select to authenticated
using (
  exists (
    select 1 from public.volunteers v
    where v.id = applications.volunteer_id
      and public.can_access_volunteer(v.cluster, v.venue, v.unit, v.profile_id)
  )
);

drop policy if exists applications_insert_scope on public.applications;
create policy applications_insert_scope on public.applications
for insert to authenticated
with check (
  exists (
    select 1 from public.volunteers v
    where v.id = applications.volunteer_id
      and public.is_active_account()
      and (
        public.is_admin_induk()
        or (public.current_role() = 'Admin Kluster' and v.cluster is not distinct from public.current_cluster())
        or (public.current_role() = 'Sukarelawan' and v.profile_id = auth.uid())
      )
  )
);

drop policy if exists applications_update_reviewer_scope on public.applications;
create policy applications_update_reviewer_scope on public.applications
for update to authenticated
using (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or exists (
      select 1 from public.volunteers v
      where v.id = applications.volunteer_id
        and public.current_role() = 'Admin Kluster'
        and v.cluster is not distinct from public.current_cluster()
    )
  )
)
with check (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or exists (
      select 1 from public.volunteers v
      where v.id = applications.volunteer_id
        and public.current_role() = 'Admin Kluster'
        and v.cluster is not distinct from public.current_cluster()
    )
  )
);

drop policy if exists screening_select_scope on public.screening_results;
create policy screening_select_scope on public.screening_results
for select to authenticated
using (
  exists (
    select 1 from public.volunteers v
    where v.id = screening_results.volunteer_id
      and public.can_access_volunteer(v.cluster, v.venue, v.unit, v.profile_id)
  )
);

drop policy if exists screening_write_admin_scope on public.screening_results;
create policy screening_write_admin_scope on public.screening_results
for insert to authenticated
with check (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or exists (
      select 1 from public.volunteers v
      where v.id = screening_results.volunteer_id
        and public.current_role() = 'Admin Kluster'
        and v.cluster is not distinct from public.current_cluster()
    )
  )
);

drop policy if exists screening_update_admin_scope on public.screening_results;
create policy screening_update_admin_scope on public.screening_results
for update to authenticated
using (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or exists (
      select 1 from public.volunteers v
      where v.id = screening_results.volunteer_id
        and public.current_role() = 'Admin Kluster'
        and v.cluster is not distinct from public.current_cluster()
    )
  )
)
with check (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or exists (
      select 1 from public.volunteers v
      where v.id = screening_results.volunteer_id
        and public.current_role() = 'Admin Kluster'
        and v.cluster is not distinct from public.current_cluster()
    )
  )
);

drop policy if exists placements_select_scope on public.placements;
create policy placements_select_scope on public.placements
for select to authenticated
using (
  exists (
    select 1 from public.volunteers v
    where v.id = placements.volunteer_id
      and public.can_access_volunteer(v.cluster, v.venue, v.unit, v.profile_id)
  )
);

drop policy if exists placements_write_scope on public.placements;
create policy placements_write_scope on public.placements
for insert to authenticated
with check (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or (public.current_role() = 'Admin Kluster' and cluster is not distinct from public.current_cluster())
    or (public.current_role() = 'Admin Venue' and venue is not distinct from public.current_venue())
  )
);

drop policy if exists placements_update_scope on public.placements;
create policy placements_update_scope on public.placements
for update to authenticated
using (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or (public.current_role() = 'Admin Kluster' and cluster is not distinct from public.current_cluster())
    or (public.current_role() = 'Admin Venue' and venue is not distinct from public.current_venue())
  )
)
with check (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or (public.current_role() = 'Admin Kluster' and cluster is not distinct from public.current_cluster())
    or (public.current_role() = 'Admin Venue' and venue is not distinct from public.current_venue())
  )
);

drop policy if exists training_select_scope on public.training_records;
create policy training_select_scope on public.training_records
for select to authenticated
using (
  exists (
    select 1 from public.volunteers v
    where v.id = training_records.volunteer_id
      and public.can_access_volunteer(v.cluster, v.venue, v.unit, v.profile_id)
  )
);

drop policy if exists training_write_scope on public.training_records;
create policy training_write_scope on public.training_records
for insert to authenticated
with check (
  exists (
    select 1 from public.volunteers v
    where v.id = training_records.volunteer_id
      and public.is_active_account()
      and (
        public.is_admin_induk()
        or (public.current_role() = 'Admin Kluster' and v.cluster is not distinct from public.current_cluster())
        or (public.current_role() = 'Admin Venue' and v.venue is not distinct from public.current_venue())
        or (public.current_role() = 'Ketua Unit' and v.unit is not distinct from public.current_unit())
      )
  )
);

drop policy if exists attendance_select_scope on public.attendance_logs;
create policy attendance_select_scope on public.attendance_logs
for select to authenticated
using (
  exists (
    select 1 from public.volunteers v
    where v.id = attendance_logs.volunteer_id
      and public.can_access_volunteer(v.cluster, v.venue, v.unit, v.profile_id)
  )
);

drop policy if exists attendance_write_scope on public.attendance_logs;
create policy attendance_write_scope on public.attendance_logs
for insert to authenticated
with check (
  exists (
    select 1 from public.volunteers v
    where v.id = attendance_logs.volunteer_id
      and public.is_active_account()
      and (
        public.is_admin_induk()
        or (public.current_role() = 'Admin Kluster' and v.cluster is not distinct from public.current_cluster())
        or (public.current_role() = 'Admin Venue' and v.venue is not distinct from public.current_venue())
        or (public.current_role() = 'Ketua Unit' and v.unit is not distinct from public.current_unit())
      )
  )
);

drop policy if exists kit_select_scope on public.kit_accreditation;
create policy kit_select_scope on public.kit_accreditation
for select to authenticated
using (
  exists (
    select 1 from public.volunteers v
    where v.id = kit_accreditation.volunteer_id
      and public.can_access_volunteer(v.cluster, v.venue, v.unit, v.profile_id)
  )
);

drop policy if exists kit_write_scope on public.kit_accreditation;
create policy kit_write_scope on public.kit_accreditation
for insert to authenticated
with check (
  exists (
    select 1 from public.volunteers v
    where v.id = kit_accreditation.volunteer_id
      and public.is_active_account()
      and (
        public.is_admin_induk()
        or (public.current_role() = 'Admin Kluster' and v.cluster is not distinct from public.current_cluster())
        or (public.current_role() = 'Admin Venue' and v.venue is not distinct from public.current_venue())
      )
  )
);

drop policy if exists complaints_select_scope on public.complaints;
create policy complaints_select_scope on public.complaints
for select to authenticated
using (
  (public.is_admin_induk() and public.is_active_account())
  or (
    public.is_active_account()
    and (
      submitted_by = auth.uid()
      or assigned_to = auth.uid()
      or exists (
        select 1 from public.volunteers v
        where v.id = complaints.volunteer_id
          and public.can_access_volunteer(v.cluster, v.venue, v.unit, v.profile_id)
      )
    )
  )
);

drop policy if exists complaints_insert_authenticated on public.complaints;
create policy complaints_insert_authenticated on public.complaints
for insert to authenticated
with check (
  public.is_active_account()
  and submitted_by = auth.uid()
  and (
    volunteer_id is null
    or exists (
      select 1 from public.volunteers v
      where v.id = complaints.volunteer_id
        and public.can_access_volunteer(v.cluster, v.venue, v.unit, v.profile_id)
    )
  )
);

drop policy if exists complaints_update_staff_scope on public.complaints;
create policy complaints_update_staff_scope on public.complaints
for update to authenticated
using (
  (public.is_admin_induk() and public.is_active_account())
  or (
    public.is_active_account()
    and (
      assigned_to = auth.uid()
      or exists (
        select 1 from public.volunteers v
        where v.id = complaints.volunteer_id
          and (
            (public.current_role() = 'Admin Kluster' and v.cluster is not distinct from public.current_cluster())
            or (public.current_role() = 'Admin Venue' and v.venue is not distinct from public.current_venue())
            or (public.current_role() = 'Ketua Unit' and v.unit is not distinct from public.current_unit())
          )
      )
    )
  )
)
with check (
  (public.is_admin_induk() and public.is_active_account())
  or (
    public.is_active_account()
    and (
      assigned_to = auth.uid()
      or exists (
        select 1 from public.volunteers v
        where v.id = complaints.volunteer_id
          and (
            (public.current_role() = 'Admin Kluster' and v.cluster is not distinct from public.current_cluster())
            or (public.current_role() = 'Admin Venue' and v.venue is not distinct from public.current_venue())
            or (public.current_role() = 'Ketua Unit' and v.unit is not distinct from public.current_unit())
          )
      )
    )
  )
);

drop policy if exists broadcasts_select_scope on public.broadcasts;
create policy broadcasts_select_scope on public.broadcasts
for select to authenticated
using (
  (public.is_admin_induk() and public.is_active_account())
  or (
    public.is_active_account()
    and (
      (target_role is null and target_cluster is null and target_venue is null)
      or target_role = public.current_role()
      or (target_cluster is not null and target_cluster is not distinct from public.current_cluster())
      or (target_venue is not null and target_venue is not distinct from public.current_venue())
    )
  )
);

drop policy if exists broadcasts_insert_staff on public.broadcasts;
create policy broadcasts_insert_staff on public.broadcasts
for insert to authenticated
with check (
  public.is_active_account()
  and (
    public.is_admin_induk()
    or public.current_role() in ('Admin Kluster', 'Admin Venue', 'Ketua Unit')
  )
);

drop policy if exists audit_insert_actor on public.audit_logs;
create policy audit_insert_actor on public.audit_logs
for insert to authenticated
with check (actor_id = auth.uid() and public.is_active_account());

drop policy if exists audit_select_admin_induk on public.audit_logs;
create policy audit_select_admin_induk on public.audit_logs
for select to authenticated
using (public.is_admin_induk() and public.is_active_account());

commit;
