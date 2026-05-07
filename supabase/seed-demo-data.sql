begin;

insert into public.volunteers
  (id, name, age, phone, email, cluster, venue, unit, application_status, screening_status, placement_status, kit_status, accreditation_status)
values
  ('10000000-0000-4000-8000-000000000001', 'Arman Shah', 24, '60123456001', 'arman@example.com', 'Kuala Lumpur', 'KL Sports City', 'Venue Ops', 'Diluluskan', 'Lulus', 'Ditempatkan', 'Belum lengkap', 'Draf'),
  ('10000000-0000-4000-8000-000000000002', 'Kavitha Nair', 31, '60123456002', 'kavitha@example.com', 'Kuala Lumpur', 'KLCC', 'Protokol', 'Semakan', 'Semakan', 'Ditempatkan', 'Belum agih', 'Belum'),
  ('10000000-0000-4000-8000-000000000003', 'Hakim Roslan', 27, '60123456003', 'hakim@example.com', 'Selangor', 'Axiata Arena', 'Media', 'Permohonan', 'Belum', 'Belum ditempatkan', 'Belum agih', 'Belum'),
  ('10000000-0000-4000-8000-000000000004', 'Mei Ling Tan', 22, '60123456004', 'meiling@example.com', 'Kuala Lumpur', 'Axiata Arena', 'Media', 'Diluluskan', 'Lulus', 'Ditempatkan', 'Lengkap', 'Aktif'),
  ('10000000-0000-4000-8000-000000000005', 'Daniel Lim', 29, '60123456005', 'daniel@example.com', 'Kuala Lumpur', 'Bukit Jalil Stadium', 'Crowd Control', 'Diluluskan', 'Lulus', 'Ditempatkan', 'Sebahagian', 'Draf'),
  ('10000000-0000-4000-8000-000000000006', 'Farah Izzati', 26, '60123456006', 'farah@example.com', 'Kuala Lumpur', 'MITEC', 'Accreditation', 'Ditolak', 'Gagal', 'Belum ditempatkan', 'Belum agih', 'Belum'),
  ('10000000-0000-4000-8000-000000000007', 'Iqbal Danish', 35, '60123456007', 'iqbal@example.com', 'Putrajaya', 'Merdeka Square', 'Transport', 'Semakan', 'Semakan', 'Ditempatkan', 'Belum agih', 'Belum'),
  ('10000000-0000-4000-8000-000000000008', 'Sofia Rahman', 21, '60123456008', 'sofia@example.com', 'Kuala Lumpur', 'National Aquatic Centre', 'Medical Support', 'Diluluskan', 'Lulus', 'Ditempatkan', 'Lengkap', 'Aktif'),
  ('10000000-0000-4000-8000-000000000009', 'Nurin Aisyah', 28, '60123456009', 'nurin@example.com', 'Kuala Lumpur', 'KLCC', 'Protokol', 'Diluluskan', 'Lulus', 'Ditempatkan', 'Lengkap', 'Aktif'),
  ('10000000-0000-4000-8000-000000000010', 'Jason Wong', 33, '60123456010', 'jason@example.com', 'Kuala Lumpur', 'Bukit Jalil Stadium', 'Crowd Control', 'Permohonan', 'Belum', 'Belum ditempatkan', 'Belum agih', 'Belum')
on conflict (id) do nothing;

insert into public.applications (volunteer_id, status, submitted_at, reviewed_at, remarks)
select id, application_status, now() - interval '7 days', case when application_status in ('Diluluskan', 'Ditolak') then now() - interval '2 days' else null end, 'Seed demo'
from public.volunteers
where email like '%@example.com'
on conflict do nothing;

insert into public.screening_results (volunteer_id, score, result, notes, screened_at)
values
  ('10000000-0000-4000-8000-000000000001', 88, 'Lulus', 'Skor demo', now() - interval '3 days'),
  ('10000000-0000-4000-8000-000000000002', 72, 'Semakan', 'Skor demo', now() - interval '3 days'),
  ('10000000-0000-4000-8000-000000000003', 64, 'Semakan', 'Skor demo', now() - interval '3 days'),
  ('10000000-0000-4000-8000-000000000004', 91, 'Lulus', 'Skor demo', now() - interval '3 days'),
  ('10000000-0000-4000-8000-000000000005', 82, 'Lulus', 'Skor demo', now() - interval '3 days'),
  ('10000000-0000-4000-8000-000000000006', 41, 'Gagal', 'Skor demo', now() - interval '3 days'),
  ('10000000-0000-4000-8000-000000000007', 78, 'Semakan', 'Skor demo', now() - interval '3 days'),
  ('10000000-0000-4000-8000-000000000008', 95, 'Lulus', 'Skor demo', now() - interval '3 days'),
  ('10000000-0000-4000-8000-000000000009', 84, 'Lulus', 'Skor demo', now() - interval '3 days'),
  ('10000000-0000-4000-8000-000000000010', 58, 'Belum', 'Skor demo', now() - interval '3 days');

insert into public.placements (volunteer_id, cluster, venue, unit, shift, assigned_at)
select id, cluster, venue, unit, '07:00-15:00', now() - interval '2 days'
from public.volunteers
where application_status in ('Diluluskan', 'Semakan');

insert into public.training_records (volunteer_id, training_name, training_date, attendance_status, completion_status)
values
  ('10000000-0000-4000-8000-000000000001', 'Orientasi Operasi 2026', current_date - 5, 'Hadir', 'Selesai'),
  ('10000000-0000-4000-8000-000000000004', 'Orientasi Operasi 2026', current_date - 5, 'Hadir', 'Selesai'),
  ('10000000-0000-4000-8000-000000000005', 'Orientasi Operasi 2026', current_date - 5, 'Hadir', 'Selesai'),
  ('10000000-0000-4000-8000-000000000008', 'Orientasi Operasi 2026', current_date - 5, 'Hadir', 'Selesai'),
  ('10000000-0000-4000-8000-000000000009', 'Orientasi Operasi 2026', current_date - 5, 'Hadir', 'Selesai');

insert into public.attendance_logs (volunteer_id, event_name, venue, check_in_time, method)
values
  ('10000000-0000-4000-8000-000000000004', 'Operasi Sukarelawan 2026', 'Axiata Arena', now() - interval '90 minutes', 'QR'),
  ('10000000-0000-4000-8000-000000000009', 'Operasi Sukarelawan 2026', 'KLCC', now() - interval '74 minutes', 'Manual'),
  ('10000000-0000-4000-8000-000000000008', 'Operasi Sukarelawan 2026', 'National Aquatic Centre', now() - interval '65 minutes', 'GPS');

insert into public.kit_accreditation (volunteer_id, kit_status, pass_status, accreditation_status, issued_at)
values
  ('10000000-0000-4000-8000-000000000004', 'Lengkap', 'Aktif', 'Aktif', now() - interval '1 day'),
  ('10000000-0000-4000-8000-000000000008', 'Lengkap', 'Aktif', 'Aktif', now() - interval '1 day'),
  ('10000000-0000-4000-8000-000000000009', 'Lengkap', 'Aktif', 'Aktif', now() - interval '1 day'),
  ('10000000-0000-4000-8000-000000000001', 'Belum lengkap', 'Draf', 'Draf', now() - interval '1 day');

insert into public.complaints (volunteer_id, category, subject, message, status)
values
  ('10000000-0000-4000-8000-000000000001', 'Sederhana', 'Pertukaran saiz jaket', 'Sukarelawan memohon pertukaran saiz jaket.', 'Dalam tindakan'),
  ('10000000-0000-4000-8000-000000000002', 'Tinggi', 'Jadual latihan bertembung', 'Latihan bertembung dengan jadual kerja.', 'Baharu');

insert into public.broadcasts (title, message, target_role, target_cluster)
values
  ('Sahkan syif minggu ini', 'Sahkan senarai syif minggu ini sebelum 5 petang.', 'Ketua Unit', 'Kuala Lumpur');

commit;
