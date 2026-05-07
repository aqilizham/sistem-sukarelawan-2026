# Audit Repo

Audit dibuat sebelum refactor production Supabase.

## Struktur Aplikasi Lama

- `index.html`: entry point statik, sidebar, topbar, pilihan role/kluster, modal pas.
- `app.js`: semua data seed, render UI, event handler, mutation, CSV export, dan persistence.
- `styles.css`: styling dashboard responsif.
- `icons.js`: fallback ikon Lucide.
- `README.md`: nota demo GitHub Pages.

App asal ialah single-page static app tanpa build step. Semua modul dirender oleh fungsi dalam `app.js` berdasarkan `state.view`.

## Modul Sedia Ada

- Dashboard
- Permohonan
- Saringan
- Penempatan
- Jadual & Latihan
- Kit & Akreditasi
- Kehadiran
- Aduan & Sokongan
- Sistem Tambahan
- Sijil & Laporan

## Penggunaan localStorage Lama

- `app.js:340`: `localStorage.getItem(STORAGE_KEY)` membaca keseluruhan state demo.
- `app.js:350`: `localStorage.setItem(STORAGE_KEY, JSON.stringify(state))` menyimpan semua data sukarelawan, aduan, attendance, role, dan state lain.

Penggunaan ini telah dibuang daripada kod production. Data operasi kini datang daripada Supabase PostgreSQL melalui service layer.

## Risiko Lama Yang Dibaiki

- Role boleh ditukar sendiri melalui dropdown frontend.
- Data peribadi sukarelawan berada dalam browser state/localStorage.
- CSV export menggunakan data local user sahaja.
- `Reset demo` boleh memadam/mengubah state local.
- Tiada database schema, RLS, audit trail, atau migration.
- Tiada login sebenar.
- Tiada validation pusat untuk email, telefon, umur, status, dan duplicate.

## Pendekatan Refactor

- UI utama dikekalkan sebagai static GitHub Pages app.
- Supabase Auth menjadi login/register/logout.
- `profiles.role` menjadi sumber role sebenar.
- Supabase RLS menjadi kawalan akses sebenar.
- Mutasi data bergerak ke `services.js`.
- SQL migration disimpan dalam `supabase/`.
