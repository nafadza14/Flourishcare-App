# FlourishCare: Rumah Tumbuh Kembang

Aplikasi pendamping tumbuh kembang anak (0 sampai 7 tahun) dari klinik FlourishCare. Gratis untuk orang tua dan terhubung langsung ke layanan klinik (terapi, psikolog, psikotes).

Tampilan dibuat dengan gaya aplikasi iOS: tab bar mengambang, navigasi push/pop dengan swipe dari tepi kiri, bottom sheet yang bisa ditarik, segmented control, notifikasi banner, dan animasi berbasis spring.

## Fitur

- Beranda dengan ringkasan anak, hal yang perlu diperhatikan, dan menu fitur
- Profil anak: berat, tinggi, usia, grafik pertumbuhan (standar WHO), milestone, riwayat skrining
- Grafik pertumbuhan: tambah dan hapus pengukuran, status gizi otomatis
- Milestone per rentang usia dan per domain, dengan peringatan bila terlambat
- Jadwal imunisasi (IDAI): catat tanggal, unggah foto buku KIA, cetak kartu
- Skrining dini: KPSP, M-CHAT-R, deteksi keterlambatan bicara, laporan PDF
- Stimulasi harian sesuai usia dengan streak
- Tanya Ahli (3 pertanyaan gratis per bulan) dan mode ahli untuk demo
- Pustaka artikel
- Booking klinik: terapi on-site, home visit, psikolog, psikotes, lengkap dengan paket, jadwal, DP 50%, dan pembayaran sandbox
- Notifikasi dan preferensi pengingat
- PWA: bisa dipasang ke layar utama, aset di-cache untuk offline

## Teknologi

Vite 6, React 19, TypeScript, Tailwind CSS v4, Motion (motion/react), lucide-react, font Outfit (self-hosted), Express (API), Supabase (opsional, otomatis memakai penyimpanan memori bila tidak terhubung), Gemini (opsional, untuk draf jawaban ahli).

## Menjalankan di komputer

Syarat: Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000

Akun demo: `flourishcare.id@gmail.com` / `password123` (atau tekan tombol "Coba akun demo" di layar masuk).

## Variabel lingkungan

Salin `.env.example` menjadi `.env` lalu isi bila perlu:

- `GEMINI_API_KEY` untuk draf jawaban AI di Tanya Ahli (opsional)
- `SUPABASE_URL` dan `SUPABASE_KEY` untuk database Supabase (opsional). Skema SQL bisa disalin dari menu Akun, Tentang Aplikasi.

## Build produksi

```bash
npm run build
npm start
```

Untuk Vercel, `api/index.ts` memakai aplikasi Express yang sama dan `vercel.json` sudah mengatur rewrite.

## Struktur

```
src/
  App.tsx              kerangka aplikasi, tab, dan stack navigasi
  screens/             semua layar (Home, Profil Anak, Imunisasi, Akun, Booking, dll)
  components/ui/       komponen bergaya iOS (Screen, Sheet, Segmented, Switch, TabBar, Toast, grafik)
  components/sheets/   bottom sheet bersama
  lib/                 store, navigasi, format, logika pertumbuhan, milestone, vaksin, skrining
  data/                harga layanan, data awal, skema SQL
server.ts              API Express
```
