# FlourishCare: Rumah Tumbuh Kembang

Aplikasi pendamping tumbuh kembang anak (0 sampai 7 tahun) dari klinik FlourishCare, berjalan di app.flourishcare.id. Gratis untuk orang tua dan terhubung ke layanan klinik.

Tampilan bergaya aplikasi iOS: tab bar mengambang, navigasi push/pop dengan swipe dari tepi kiri, bottom sheet yang bisa ditarik, segmented control, notifikasi banner, dan animasi berbasis spring.

## Fitur

- Masuk dengan Google atau email (Supabase Auth). Satu akun dipakai bersama www.flourishcare.id dan book.flourishcare.id
- Beranda dengan ringkasan anak, hal yang perlu diperhatikan, tim ahli FlourishCare, dan tips harian
- Profil anak: berat, tinggi, usia, grafik pertumbuhan (standar WHO), milestone, riwayat skrining
- Jadwal imunisasi (IDAI): catat satu per satu atau sekaligus dari buku KIA, foto bukti, cetak kartu
- Skrining dini: KPSP, M-CHAT-R, deteksi keterlambatan bicara, laporan PDF
- Stimulasi harian sesuai usia dengan streak
- Tanya Ahli: 3 pertanyaan gratis per bulan, dijawab psikolog dan terapis lewat Mode ahli (khusus akun staf)
- Tim ahli diambil dari tabel `staff_profiles` (sama dengan halaman flourishcare.id/team)
- Booking klinik membuka book.flourishcare.id. Alur booking di dalam aplikasi tetap ada dan bisa diaktifkan lagi
- Notifikasi dan preferensi pengingat
- PWA: bisa dipasang ke layar utama. Pengunjung web melihat kartu "Pasang FlourishCare di HP": Android cukup sekali ketuk, iPhone mendapat panduan Bagikan > Tambah ke Layar Utama, pengunjung dari Instagram/TikTok diarahkan membuka di Safari/Chrome, dan di komputer tampil kode QR. Kalau ditutup, muncul lagi setelah 3, 7, lalu 30 hari (`src/lib/install.ts`)

## Teknologi

Vite 6, React 19, TypeScript, Tailwind CSS v4, Motion (motion/react), lucide-react, font Outfit (self-hosted), Express (API, juga dipakai sebagai Vercel Function), Supabase (Auth dan database), Gemini (opsional, draf jawaban untuk tim ahli).

## Pengaturan sekali jalan (produksi)

1. **Supabase SQL Editor**: jalankan isi `supabase/schema.sql`. Ini membuat tabel `app_*` dan mengaktifkan Row Level Security.
2. **Supabase > Authentication > URL Configuration > Redirect URLs**: tambahkan
   - `https://app.flourishcare.id/**`
   - `http://localhost:3000/**` (untuk uji di komputer)
3. **Supabase > Authentication > Providers > Google**: pastikan aktif (sudah dipakai www dan book).
4. **Vercel > Project Settings > Environment Variables**: isi `SUPABASE_SECRET_KEY` (Supabase > Project Settings > API Keys > Secret keys). Lalu redeploy.
5. Cek: buka app.flourishcare.id/api/supabase-status. Harus `"connected": true` dan `"tablesReady": true`. Kalau muncul `"Invalid API key"`, nilai secret key salah: lihat `secretKeyCheck` (format dan panjang key, tanpa membocorkan isinya), salin ulang memakai tombol salin di Supabase, simpan tanpa tanda kutip, lalu Redeploy.

Server API berjalan di region Singapura (`"regions": ["sin1"]` di `vercel.json`), dekat dengan pengguna dan database. Cek `dbMs.warm` di `/api/supabase-status`: di bawah sekitar 30 ms berarti server dan database berada di region yang sama.

Di Vercel, server tidak pernah menyimpan data ke memori (data akan hilang di instance berikutnya). Kalau database belum siap, API menjawab 503 dan aplikasi menampilkan pesan, bukan meminta orang tua mengisi ulang data.

Akun staf (yang di dashboard flourishcare.id bertanda staf) otomatis mendapat Mode ahli di Tanya Ahli. Agar jawaban tampil dengan nama dan foto psikolog, isi kolom `profile_id` di `staff_profiles` dengan id akun staf tersebut.

## Menjalankan di komputer

Syarat: Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000 lalu masuk dengan Google atau daftar dengan email.

## Variabel lingkungan

Lihat `.env.example`. Yang penting:

- `SUPABASE_SECRET_KEY` (server saja, wajib di Vercel)
- `VITE_BOOKING_URL` (default `https://book.flourishcare.id/`, kosongkan untuk booking di dalam aplikasi)
- `GEMINI_API_KEY` (opsional)

## Build produksi

```bash
npm run build
npm start
```

## Struktur

```
src/
  App.tsx              kerangka aplikasi, tab, dan stack navigasi
  screens/             semua layar (Home, Profil Anak, Imunisasi, Akun, Booking, dll)
  components/ui/       komponen bergaya iOS (Screen, Sheet, Segmented, Switch, TabBar, Toast, grafik)
  components/sheets/   bottom sheet bersama
  lib/                 store, navigasi, auth Supabase, booking, logika pertumbuhan, milestone, vaksin, skrining
  data/                tim klinik, harga layanan, data awal, skema SQL
supabase/schema.sql    skema database aplikasi
server.ts              API Express (juga dipakai Vercel lewat api/index.ts)
```
