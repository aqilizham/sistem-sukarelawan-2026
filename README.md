# Sistem Sukarelawan 2026

Aplikasi pengurusan sukarelawan untuk pendaftaran, saringan, penempatan, latihan, kehadiran, kit, sokongan, audit trail, dan laporan CSV. Versi ini menggunakan Supabase sebagai backend production.

Live URL:

`https://aqilizham.github.io/sistem-sukarelawan-2026/`

## Ringkasan Production

- Supabase Auth untuk login/register/logout.
- Supabase PostgreSQL untuk data pusat.
- Supabase Row Level Security untuk kawalan akses sebenar.
- Role dibaca daripada `profiles.role`, bukan dropdown frontend.
- Data peribadi sukarelawan tidak lagi disimpan sebagai database dalam `localStorage`.
- CSV export membaca data daripada Supabase dan tertakluk kepada RLS.
- Audit log disimpan dalam `audit_logs` melalui trigger database dan service layer.
- GitHub Pages masih disokong sebagai static frontend.

## Fail Penting

- `index.html`: static shell dan script loading.
- `supabase-config.js`: runtime config public untuk Supabase URL dan anon key.
- `supabase-client.js`: Supabase client initializer.
- `auth.js`: login, register, logout, profile loading.
- `services.js`: data service untuk sukarelawan, permohonan, saringan, attendance, laporan, audit, sokongan.
- `app.js`: UI dan event binding.
- `supabase/schema.sql`: schema, validation constraints, trigger, helper function.
- `supabase/rls-policies.sql`: semua RLS policy.
- `supabase/user-management-migration.sql`: migration tambahan untuk approval status pengguna dan modul Pengurusan Pengguna.
- `supabase/account-status-access-migration.sql`: migration tambahan untuk sekatan login/dashboard mengikut `profiles.status`.
- `supabase/seed-demo-data.sql`: optional seed data pusat.
- `.github/workflows/deploy-pages.yml`: deploy static site ke GitHub Pages.
- `AUDIT.md`: audit repo asal dan localStorage lama.

## Setup Supabase

1. Cipta project baru di Supabase.
2. Pergi ke SQL Editor.
3. Jalankan SQL mengikut urutan ini:
   ```sql
   -- 1
   -- copy/paste supabase/schema.sql

   -- 2
   -- copy/paste supabase/rls-policies.sql

   -- 3 jika anda upgrade repo lama yang sudah pernah deploy
   -- copy/paste supabase/user-management-migration.sql

   -- 4 jika anda mahu enforce sekatan akses untuk akaun bukan Aktif
   -- copy/paste supabase/account-status-access-migration.sql

   -- 5 optional
   -- copy/paste supabase/seed-demo-data.sql
   ```
4. Pergi ke Authentication > URL Configuration.
5. Tambah Site URL:
   `https://aqilizham.github.io/sistem-sukarelawan-2026/`
6. Tambah Redirect URL untuk local:
   `http://localhost:8080/`

## Config Frontend

Isi `supabase-config.js`:

```js
window.SUKARELAWAN_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_PUBLIC_KEY"
};

window.SUKARELAWAN_DEMO_MODE = false;
```

Nota keselamatan:

- `anonKey` ialah public key dan mesti dilindungi oleh RLS.
- Jangan letak `service_role` key dalam frontend, GitHub Pages, atau repo public.
- `DEMO_MODE` default ialah `false`.

## Run Local

Daripada folder repo:

```bash
python -m http.server 8080
```

Buka:

`http://localhost:8080/`

## Create Admin Pertama

1. Buka app dan register user pertama.
2. User baharu akan dicipta sebagai `Sukarelawan` dengan status `Menunggu Kelulusan`.
3. Di Supabase SQL Editor, promote user itu:

```sql
update public.profiles
set role = 'Admin Induk',
    status = 'Aktif',
    cluster = null,
    venue = null,
    unit = null
where email = 'email-admin-anda@example.com';
```

Selepas itu logout/login semula. Role sebenar akan dipaparkan di topbar.

## Tables

- `profiles`
- `volunteers`
- `applications`
- `screening_results`
- `placements`
- `training_records`
- `attendance_logs`
- `kit_accreditation`
- `complaints`
- `broadcasts`
- `audit_logs`

## Role & Permission

| Role | Akses |
| --- | --- |
| Admin Induk | Lihat/urus semua data, approve/reject, export semua, akses modul `Pengurusan Pengguna` untuk tukar role/status/cluster/venue/unit. |
| Admin Kluster | Lihat/urus data kluster sendiri, review permohonan kluster, export kluster. |
| Admin Venue | Lihat data venue sendiri, urus penempatan, latihan, attendance, kit venue. |
| Ketua Unit | Lihat unit sendiri, rekod latihan/kehadiran, export unit. Tidak ada delete utama. |
| Sukarelawan | Lihat/kemas kini profil dan permohonan sendiri, buka tiket sendiri. |

RLS berada di database, jadi user yang manipulate frontend masih tertakluk kepada policy Supabase.

## Deployment GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` deploy static app ke GitHub Pages.

1. Di GitHub repo, pergi ke Settings > Pages.
2. Pilih Source: GitHub Actions.
3. Tambah repository variables/secrets:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Push ke branch `main`.
5. Workflow akan generate `supabase-config.js` semasa deploy.

Rujukan rasmi GitHub Pages Actions: [actions/deploy-pages](https://github.com/actions/deploy-pages) dan [actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact).

Jika tidak mahu GitHub Actions, anda boleh commit `supabase-config.js` dengan anon public key. Ini selamat selagi semua table dilindungi RLS.

## Alternatif Vercel

GitHub Pages tidak mempunyai runtime environment variables sebenar. Jika mahu config melalui env build platform, deploy ke Vercel:

1. Import repo ke Vercel.
2. Set Environment Variables `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.
3. Tambah build script kecil untuk generate `supabase-config.js`, atau gunakan static file yang sama.
4. Set Supabase redirect URL kepada domain Vercel.

Hosting tidak dipindahkan secara automatik; GitHub Pages masih laluan default.

## Testing Manual

- User login berjaya.
- Register user baru berjaya.
- User baru didaftarkan sebagai `Sukarelawan` dengan status `Menunggu Kelulusan`.
- Promote user pertama kepada Admin Induk melalui SQL.
- Admin Induk buka modul `Pengurusan Pengguna` dan nampak user baru.
- Admin Induk tukar status ke `Aktif`, tetapkan role, cluster, venue, dan unit.
- Set user kepada `Digantung`, login sebagai user itu, dan sahkan dashboard disekat dengan skrin status akaun.
- Tukar semula status user kepada `Aktif`, logout/login semula, dan sahkan dashboard boleh diakses.
- Admin create volunteer.
- Sukarelawan submit/update profil sendiri.
- Admin approve/reject application.
- Admin Kluster hanya nampak kluster sendiri.
- Admin Venue hanya nampak venue sendiri.
- Ketua Unit hanya nampak unit sendiri.
- Sukarelawan tidak nampak sukarelawan lain.
- CSV export ikut role access.
- Refresh browser, data masih kekal.
- Buka device lain, data sama kerana Supabase.
- Clear cache browser tidak memadam database.
- Logout/login semula berjaya.
- GitHub Pages deploy berjaya di live URL.

## Troubleshooting

- `Konfigurasi Supabase diperlukan`: isi `supabase-config.js` atau set GitHub Actions variables.
- `Akses ditolak oleh polisi keselamatan Supabase`: semak `profiles.role`, `cluster`, `venue`, `unit`, dan RLS policy.
- Login berjaya tetapi data kosong: role mungkin `Sukarelawan` tanpa `volunteers.profile_id`, atau seed data belum dimasukkan.
- Register tidak terus login: Supabase email confirmation mungkin aktif. Sahkan emel dahulu.
- CSV kosong: data yang dieksport tertakluk kepada RLS dan skop role.

## Limitasi Semasa

- Admin-created user penuh masih perlu dibuat melalui Supabase Dashboard/Auth API kerana `service_role` tidak boleh berada di frontend.
- SMS/WhatsApp, PayGate, SponsorHub, dan AssistAI masih integration placeholder UI.
- Backup production perlu dibuat melalui Supabase dashboard atau scheduled database backup plan.
