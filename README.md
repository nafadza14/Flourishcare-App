# FlourishCare: Rumah Tumbuh Kembang

Aplikasi pendamping tumbuh kembang anak (0 sampai 7 tahun) dari klinik FlourishCare, berjalan di app.flourishcare.id. Gratis untuk orang tua dan terhubung ke layanan klinik.

Tampilan bergaya aplikasi iOS: tab bar mengambang, navigasi push/pop dengan swipe dari tepi kiri, bottom sheet yang bisa ditarik, segmented control, notifikasi banner, dan animasi berbasis spring.

## Fitur

- Masuk dengan Google atau email (Supabase Auth). Satu akun dipakai bersama www.flourishcare.id dan book.flourishcare.id
- Beranda dengan ringkasan anak, hal yang perlu diperhatikan, tim ahli FlourishCare, dan tips harian
- Navigasi 4 tab: Beranda, Pantau, Skrining, Akun. Semua fitur menyesuaikan usia profil yang dipilih
- **Pantau** (pilar 1)
  - Sampai 5 profil per akun, termasuk kehamilan. Foto profil, alergi, golongan darah, usia kehamilan saat lahir, riwayat kesehatan. Ganti profil satu ketuk
  - Kehamilan: HPL dari HPHT (rumus Naegele) atau HPL dokter, perkembangan janin minggu demi minggu, hitung gerakan janin (mulai 28 minggu), jadwal periksa dan tanda bahaya (Buku KIA). Saat lahir, profil berubah menjadi profil anak dan data lahir menjadi titik pertama grafik
  - Grafik pertumbuhan: WHO 2006 untuk 0 sampai 5 tahun, CDC 2000 untuk 5 sampai 8 tahun (anjuran IDAI). Indikator BB/PB atau BB/TB, PB/U atau TB/U, BB/U, LK/U, IMT/U. Kategori Permenkes No. 2 Tahun 2020, zona hijau, kuning, merah, perbandingan dengan pengukuran sebelumnya, usia koreksi untuk bayi prematur sampai 2 tahun
  - Milestone CDC 2022 (2 bulan sampai 5 tahun) dalam 4 ranah, contoh dan ide stimulasi per kemampuan, pengingat lembut dan saran skrining bila tahap sebelumnya belum tercapai
  - Imunisasi IDAI dengan foto buku KIA dan cetak kartu
  - Jurnal dan album: foto dan video singkat (maks. 1 menit), kategori momen pertama, bisa dibagikan ke terapis
  - Catatan harian 0 sampai 2 tahun: menyusu (timer kiri/kanan, botol, MPASI), tidur, popok, satu ketuk
- **Skrining** (pilar 2), hasil langsung dan laporan PDF berlogo dengan ajakan booking (QR ke book.flourishcare.id)
  - KPSP Kemenkes 2022 sesuai jadwal usia (hasil Sesuai, Meragukan, Penyimpangan)
  - Tes Daya Dengar (0 sampai 12 bulan)
  - Cek kemampuan bicara (IDAI, ASHA, CDC) dengan aktivitas stimulasi di rumah
  - Tanda awal autisme (daftar pengamatan CDC). M-CHAT-R/F dilakukan bersama psikolog di klinik karena memerlukan lisensi
  - Catatan sensori (pengamatan, bukan tes baku)
  - Perhatian dan hiperaktivitas (GPPH, Kemenkes) untuk usia 3 tahun ke atas
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
   Untuk database yang sudah berjalan, cukup jalankan `supabase/migrations/2026-10-10_pantau_skrining.sql` (kolom profil baru, tabel jurnal dan catatan harian). Foto dan video disimpan di bucket privat `app-media` yang dibuat otomatis oleh server.
5. Cek: buka app.flourishcare.id/api/supabase-status. Harus `"connected": true`, `"tablesReady": true`, dan `"migrationNeeded": false`. Kalau muncul `"Invalid API key"`, nilai secret key salah: lihat `secretKeyCheck` (format dan panjang key, tanpa membocorkan isinya), salin ulang memakai tombol salin di Supabase, simpan tanpa tanda kutip, lalu Redeploy.

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
  data/                tim klinik, harga layanan, skema SQL, tabel acuan (WHO/CDC, KPSP, TDD, GPPH, milestone CDC, kehamilan)
supabase/schema.sql    skema database aplikasi
supabase/migrations/   perubahan skema per versi
server.ts              API Express (juga dipakai Vercel lewat api/index.ts)
server/features.ts     API jurnal, catatan harian, dan unggah media
```
