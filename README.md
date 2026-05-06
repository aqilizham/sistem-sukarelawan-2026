# V-CORE 360 - Sistem Sukarelawan Sukan SEA 2027

Prototaip ini dibina berdasarkan proposal `Sistem Bersepadu Pengurusan Sukarelawan V-CORE 360` untuk Sukan SEA 2027 dan Sukan Para ASEAN 2027.

## GitHub Pages

Aplikasi ini boleh dibuka melalui GitHub Pages:

`https://aqilizham.github.io/NAMA-REPO/`

GitHub Pages ialah hosting statik, jadi semua fungsi butang berjalan di browser dan data demo/perubahan pengguna disimpan di `localStorage` peranti masing-masing. Untuk data berpusat merentas semua pengguna, aplikasi ini perlu disambung kepada backend seperti Supabase, Firebase, atau API tersendiri.

## Modul yang dibina

- Dashboard analitik masa nyata untuk Kluster Kuala Lumpur.
- Permohonan dan pangkalan data sukarelawan.
- Saringan, skor, kelulusan, dan penolakan.
- Penempatan mengikut kluster, venue, dan unit.
- Jadual tugasan dan matriks latihan.
- Pengurusan kit dan akreditasi.
- Kehadiran QR/manual/GPS.
- HelpDesk Pro, tiket aduan, AssistAI chat, dan MWGateway.
- StaySmart, SponsorHub, Rewards+, PayGate, AdaSMS, dan ringkasan sistem tambahan.
- Sijil digital dan eksport laporan CSV.

## Nota teknikal

- `index.html` ialah entry point.
- `app.js`, `styles.css`, dan `icons.js` tidak memerlukan build step.
- Aplikasi boleh dibuka di laptop atau telefon melalui browser moden.
- Untuk produksi, modul berikut perlu disambung kepada backend, pangkalan data, autentikasi peranan, audit log, integrasi SMS/WhatsApp, dan pembayaran.
