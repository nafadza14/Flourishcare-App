/* Generated from research data (scratchpad/gen/gen.py). Edit the generator, not this file. */
export interface SpeechBand { fromMonths: number; toMonths: number; label: string; skills: { id: string; text: string }[]; redFlags: { id: string; text: string }[]; activities: { id: string; title: string; text: string }[] }
export const SPEECH_INTRO = "Daftar ini membantu Ayah Bunda mengamati perkembangan bicara dan bahasa. Setiap anak berkembang dengan kecepatan berbeda, tetapi bila ada tanda waspada, sebaiknya konsultasikan ke dokter anak atau terapis wicara. Jangan menunggu.";
export const SPEECH_UNIVERSAL_FLAGS = [
 {
  "id": "sp-u-1",
  "text": "Kehilangan kemampuan bicara, mengoceh, atau berinteraksi yang sebelumnya sudah dimiliki, pada usia berapa pun: segera konsultasi."
 },
 {
  "id": "sp-u-2",
  "text": "Ada keraguan tentang pendengaran anak: minta pemeriksaan pendengaran. Gangguan dengar adalah salah satu penyebab terlambat bicara."
 },
 {
  "id": "sp-u-3",
  "text": "Ayah Bunda merasa ada yang tidak sesuai dengan usianya: konsultasikan ke ahli."
 }
];
export const SPEECH_BANDS: SpeechBand[] = [
 {
  "fromMonths": 0,
  "toMonths": 3,
  "label": "0 sampai 3 bulan",
  "skills": [
   {
    "id": "sp0_3-s-1",
    "text": "Kaget, berkedip, atau berhenti bergerak saat ada suara keras"
   },
   {
    "id": "sp0_3-s-2",
    "text": "Menjadi lebih tenang atau tersenyum saat diajak bicara"
   },
   {
    "id": "sp0_3-s-3",
    "text": "Mengeluarkan suara selain menangis, seperti 'ooo' atau 'aaa'"
   },
   {
    "id": "sp0_3-s-4",
    "text": "Tampak mengenali suara Ayah atau Bunda, misalnya menjadi tenang saat mendengarnya"
   },
   {
    "id": "sp0_3-s-5",
    "text": "Menangis dengan bunyi yang berbeda untuk kebutuhan yang berbeda (lapar, tidak nyaman)"
   },
   {
    "id": "sp0_3-s-6",
    "text": "Menatap wajah Ayah Bunda saat diajak bicara"
   }
  ],
  "redFlags": [
   {
    "id": "sp0_3-r-1",
    "text": "Tidak pernah bereaksi terhadap suara keras di sekitarnya"
   },
   {
    "id": "sp0_3-r-2",
    "text": "Tidak tertarik menatap wajah atau tidak tersenyum saat diajak tersenyum sampai usia 2 sampai 3 bulan"
   },
   {
    "id": "sp0_3-r-3",
    "text": "Hampir tidak pernah bersuara selain menangis pada usia 3 bulan"
   }
  ],
  "activities": [
   {
    "id": "sp0_3-a-1",
    "title": "Ngobrol saat merawat",
    "text": "Ajak bayi bicara dengan kalimat pendek dan nada riang saat menyusui, mandi, atau ganti popok, dengan wajah Ayah Bunda dekat dan terlihat jelas."
   },
   {
    "id": "sp0_3-a-2",
    "title": "Bergantian bersuara",
    "text": "Tirukan suara bayi ('ooo'), lalu diam beberapa detik menunggu ia membalas. Ini latihan awal percakapan bergantian."
   },
   {
    "id": "sp0_3-a-3",
    "title": "Bernyanyi dan membacakan buku",
    "text": "Nyanyikan lagu anak atau lagu pengantar tidur dan bacakan buku bergambar sejak bayi; yang penting suara dan kedekatannya, bukan isi bukunya."
   },
   {
    "id": "sp0_3-a-4",
    "title": "Tanpa layar",
    "text": "IDAI menganjurkan tidak ada waktu layar untuk bayi di bawah 1 tahun; pilih interaksi langsung."
   }
  ]
 },
 {
  "fromMonths": 4,
  "toMonths": 6,
  "label": "4 sampai 6 bulan",
  "skills": [
   {
    "id": "sp4_6-s-1",
    "text": "Menoleh atau melirik ke arah sumber suara, termasuk suara Ayah Bunda"
   },
   {
    "id": "sp4_6-s-2",
    "text": "Tertawa saat diajak bercanda"
   },
   {
    "id": "sp4_6-s-3",
    "text": "Mengoceh 'ooo' atau 'aah' dan membalas saat diajak bicara"
   },
   {
    "id": "sp4_6-s-4",
    "text": "Bergantian bersuara dengan Ayah Bunda seperti sedang mengobrol"
   },
   {
    "id": "sp4_6-s-5",
    "text": "Membuat suara 'brrr' dengan bibir atau meniup gelembung ludah"
   },
   {
    "id": "sp4_6-s-6",
    "text": "Memekik atau bersuara melengking saat senang"
   }
  ],
  "redFlags": [
   {
    "id": "sp4_6-r-1",
    "text": "Tidak menoleh atau tidak bereaksi terhadap suara pada usia 4 sampai 6 bulan"
   },
   {
    "id": "sp4_6-r-2",
    "text": "Tidak tertawa atau memekik pada usia 6 bulan"
   },
   {
    "id": "sp4_6-r-3",
    "text": "Tampak tidak berminat berkomunikasi, atau suara dan ocehan yang tadinya ada menjadi hilang"
   }
  ],
  "activities": [
   {
    "id": "sp4_6-a-1",
    "title": "Main 'ngobrol bergantian'",
    "text": "Saat bayi mengoceh, balas dengan ocehan atau kata, lalu tunggu gilirannya. Lakukan beberapa kali sehari dalam suasana santai."
   },
   {
    "id": "sp4_6-a-2",
    "title": "Beri nama segala hal",
    "text": "Sebut nama benda dan kegiatan yang sedang dilakukan, misalnya 'Ini sendok. Sendoknya dingin ya.'"
   },
   {
    "id": "sp4_6-a-3",
    "title": "Cari sumber suara",
    "text": "Bunyikan kerincingan di samping kiri atau kanan bayi, lalu biarkan ia menoleh mencarinya, dan beri senyum saat ia menemukannya."
   },
   {
    "id": "sp4_6-a-4",
    "title": "Lagu dengan gerakan",
    "text": "Nyanyikan lagu anak sambil bertepuk atau menggerakkan tangan bayi dengan lembut."
   }
  ]
 },
 {
  "fromMonths": 7,
  "toMonths": 12,
  "label": "7 sampai 12 bulan",
  "skills": [
   {
    "id": "sp7_12-s-1",
    "text": "Menoleh saat namanya dipanggil"
   },
   {
    "id": "sp7_12-s-2",
    "text": "Mengoceh dengan suku kata berulang seperti 'bababa' atau 'mamama'"
   },
   {
    "id": "sp7_12-s-3",
    "text": "Berhenti sejenak saat Ayah Bunda berkata 'jangan'"
   },
   {
    "id": "sp7_12-s-4",
    "text": "Melambaikan tangan 'dadah' atau ikut bermain cilukba"
   },
   {
    "id": "sp7_12-s-5",
    "text": "Mengangkat kedua tangan minta digendong"
   },
   {
    "id": "sp7_12-s-6",
    "text": "Memanggil 'mama' atau 'papa' (atau sebutan khusus) untuk orang yang tepat"
   }
  ],
  "redFlags": [
   {
    "id": "sp7_12-r-1",
    "text": "Belum mengoceh dengan suku kata seperti 'bababa' pada usia 12 bulan"
   },
   {
    "id": "sp7_12-r-2",
    "text": "Belum memakai isyarat seperti menunjuk atau melambai pada usia 12 bulan"
   },
   {
    "id": "sp7_12-r-3",
    "text": "Tidak menoleh saat dipanggil namanya"
   },
   {
    "id": "sp7_12-r-4",
    "text": "Kehilangan kemampuan bersuara atau berinteraksi yang sebelumnya sudah ada (pada usia berapa pun)"
   }
  ],
  "activities": [
   {
    "id": "sp7_12-a-1",
    "title": "Cilukba dan dadah",
    "text": "Main cilukba, tepuk tangan, dan lambaian 'dadah' sambil mengucapkan katanya setiap kali."
   },
   {
    "id": "sp7_12-a-2",
    "title": "Ikuti arah pandangnya",
    "text": "Perhatikan benda yang sedang dilihat atau dipegang bayi, lalu sebut namanya, misalnya 'Bola! Bolanya bulat.'"
   },
   {
    "id": "sp7_12-a-3",
    "title": "Beri kesempatan meminta",
    "text": "Tawarkan dua pilihan sambil memperlihatkannya ('Mau pisang atau biskuit?') dan tunggu bayi meraih, menunjuk, atau bersuara sebelum memberi."
   },
   {
    "id": "sp7_12-a-4",
    "title": "Buku bergambar",
    "text": "Bacakan buku bergambar besar, tunjuk gambarnya, dan sebut namanya dengan jelas."
   }
  ]
 },
 {
  "fromMonths": 12,
  "toMonths": 18,
  "label": "12 sampai 18 bulan",
  "skills": [
   {
    "id": "sp12_18-s-1",
    "text": "Mengucapkan setidaknya 1 sampai 2 kata selain 'mama' atau 'papa' (pada sekitar 15 bulan), dan 3 kata atau lebih (pada sekitar 18 bulan)"
   },
   {
    "id": "sp12_18-s-2",
    "text": "Menunjuk untuk meminta sesuatu atau minta tolong"
   },
   {
    "id": "sp12_18-s-3",
    "text": "Menunjuk untuk memperlihatkan sesuatu yang menarik kepada Ayah Bunda"
   },
   {
    "id": "sp12_18-s-4",
    "text": "Melihat ke benda yang dikenalnya saat namanya disebut"
   },
   {
    "id": "sp12_18-s-5",
    "text": "Mengikuti perintah sederhana tanpa isyarat, misalnya 'Kasih ke Bunda'"
   }
  ],
  "redFlags": [
   {
    "id": "sp12_18-r-1",
    "text": "Belum ada satu kata pun yang bermakna pada usia 16 bulan"
   },
   {
    "id": "sp12_18-r-2",
    "text": "Tidak menunjuk untuk meminta atau memperlihatkan sesuatu pada usia 18 bulan"
   },
   {
    "id": "sp12_18-r-3",
    "text": "Tampak tidak mengerti saat diajak bicara atau diberi perintah sederhana"
   }
  ],
  "activities": [
   {
    "id": "sp12_18-a-1",
    "title": "Ceritakan kegiatan",
    "text": "Narasikan kegiatan sehari-hari dengan kalimat pendek, misalnya 'Adik minum. Minum air. Airnya habis.'"
   },
   {
    "id": "sp12_18-a-2",
    "title": "Tambah satu kata",
    "text": "Saat anak mengucapkan satu kata, ulangi dengan pengucapan yang benar dan tambah satu kata. Anak: 'Cu.' Bunda: 'Susu. Mau susu.' Hindari ikut meniru kata cadelnya."
   },
   {
    "id": "sp12_18-a-3",
    "title": "Buat ia perlu meminta",
    "text": "Letakkan mainan kesukaan di tempat terlihat tetapi tidak terjangkau, tunggu anak menunjuk atau bersuara, lalu sebut nama mainannya sebelum diberikan."
   },
   {
    "id": "sp12_18-a-4",
    "title": "Lagu dan buku setiap hari",
    "text": "Nyanyikan lagu dengan gerakan (misalnya 'Kepala Pundak Lutut Kaki') dan bacakan buku. IDAI menganjurkan usia 1 sampai 2 tahun hanya memakai layar untuk video call dengan pendampingan."
   }
  ]
 },
 {
  "fromMonths": 18,
  "toMonths": 24,
  "label": "18 sampai 24 bulan",
  "skills": [
   {
    "id": "sp18_24-s-1",
    "text": "Menggabungkan dua kata sendiri (bukan menirukan), misalnya 'mau susu' atau 'Ayah pergi'"
   },
   {
    "id": "sp18_24-s-2",
    "text": "Menunjuk gambar di buku saat ditanya 'Mana kucing?'"
   },
   {
    "id": "sp18_24-s-3",
    "text": "Menunjuk minimal dua bagian tubuh saat diminta"
   },
   {
    "id": "sp18_24-s-4",
    "text": "Memakai isyarat selain menunjuk dan melambai, seperti mengangguk atau cium jauh"
   },
   {
    "id": "sp18_24-s-5",
    "text": "Kosakatanya terus bertambah, ada kata-kata baru dari waktu ke waktu"
   },
   {
    "id": "sp18_24-s-6",
    "text": "Bertanya pendek 1 sampai 2 kata, seperti 'Apa itu?'"
   }
  ],
  "redFlags": [
   {
    "id": "sp18_24-r-1",
    "text": "Belum menggabungkan dua kata secara spontan (bukan membeo) pada usia 24 bulan"
   },
   {
    "id": "sp18_24-r-2",
    "text": "Kosakata kurang dari sekitar 50 kata pada usia 24 bulan"
   },
   {
    "id": "sp18_24-r-3",
    "text": "Tidak menunjuk gambar atau bagian tubuh saat diminta, atau tidak mengerti perintah sederhana"
   }
  ],
  "activities": [
   {
    "id": "sp18_24-a-1",
    "title": "Tambah satu kata",
    "text": "Perluas ucapan anak: anak berkata 'mobil', Ayah menjawab 'Mobil merah' atau 'Mobilnya jalan'."
   },
   {
    "id": "sp18_24-a-2",
    "title": "Beri pilihan",
    "text": "Tanya dengan dua pilihan, misalnya 'Mau pisang atau apel?', supaya anak terdorong mengucapkan katanya."
   },
   {
    "id": "sp18_24-a-3",
    "title": "Membaca interaktif",
    "text": "Saat membaca buku, tanyakan 'Mana...?' dan 'Ini apa?', beri waktu menjawab, lalu puji usahanya."
   },
   {
    "id": "sp18_24-a-4",
    "title": "Main pura-pura",
    "text": "Main masak-masakan atau boneka sambil berbicara, misalnya 'Bonekanya lapar. Kita suapi, yuk.'"
   }
  ]
 },
 {
  "fromMonths": 24,
  "toMonths": 36,
  "label": "24 sampai 36 bulan",
  "skills": [
   {
    "id": "sp24_36-s-1",
    "text": "Berbicara dengan kalimat 2 sampai 3 kata yang berisi kata kerja, misalnya 'kucing lari'"
   },
   {
    "id": "sp24_36-s-2",
    "text": "Menyebut nama benda di buku saat ditunjuk dan ditanya 'Ini apa?'"
   },
   {
    "id": "sp24_36-s-3",
    "text": "Mengikuti perintah dua langkah, misalnya 'Taruh mainannya, lalu tutup pintu'"
   },
   {
    "id": "sp24_36-s-4",
    "text": "Bertanya 'apa', 'di mana', 'siapa', atau 'kenapa'"
   },
   {
    "id": "sp24_36-s-5",
    "text": "Menyebutkan namanya sendiri saat ditanya"
   },
   {
    "id": "sp24_36-s-6",
    "text": "Bicaranya dimengerti keluarga, dan menjelang 3 tahun sebagian besar dimengerti orang lain"
   }
  ],
  "redFlags": [
   {
    "id": "sp24_36-r-1",
    "text": "Pada usia 30 bulan masih jarang menggabungkan kata atau kosakatanya sangat terbatas"
   },
   {
    "id": "sp24_36-r-2",
    "text": "Pada usia 3 tahun bicaranya masih sulit dipahami orang yang tidak dikenal"
   },
   {
    "id": "sp24_36-r-3",
    "text": "Tidak bisa bercakap-cakap bergantian minimal dua kali, atau tampak tidak berminat berkomunikasi"
   }
  ],
  "activities": [
   {
    "id": "sp24_36-a-1",
    "title": "Ceritakan hari ini",
    "text": "Ajak anak bercerita tentang kegiatannya hari ini dengan pertanyaan spesifik, misalnya 'Tadi main apa sama Kakak?'"
   },
   {
    "id": "sp24_36-a-2",
    "title": "Lengkapi lagunya",
    "text": "Nyanyikan lagu yang dikenal anak dan berhenti sebelum kata terakhir agar ia melengkapi."
   },
   {
    "id": "sp24_36-a-3",
    "title": "Contohkan, jangan koreksi",
    "text": "Bila anak salah mengucap, ulangi kalimatnya dengan pengucapan yang benar tanpa menyuruhnya mengulang."
   },
   {
    "id": "sp24_36-a-4",
    "title": "Main peran",
    "text": "Main dokter-dokteran atau warung-warungan supaya anak memakai banyak kata dan kalimat. Batasi layar kurang dari 1 jam per hari dengan pendampingan."
   }
  ]
 },
 {
  "fromMonths": 36,
  "toMonths": 48,
  "label": "36 sampai 48 bulan",
  "skills": [
   {
    "id": "sp36_48-s-1",
    "text": "Berbicara dengan kalimat 4 kata atau lebih"
   },
   {
    "id": "sp36_48-s-2",
    "text": "Menceritakan minimal satu hal yang terjadi hari itu"
   },
   {
    "id": "sp36_48-s-3",
    "text": "Menjawab pertanyaan sederhana, misalnya 'Payung untuk apa?'"
   },
   {
    "id": "sp36_48-s-4",
    "text": "Menjawab pertanyaan siapa, apa, di mana, dan kenapa"
   },
   {
    "id": "sp36_48-s-5",
    "text": "Ikut menyanyikan sebagian kata dari lagu atau cerita yang sering didengar"
   },
   {
    "id": "sp36_48-s-6",
    "text": "Mendengar dan menyahut saat dipanggil dari ruangan lain"
   }
  ],
  "redFlags": [
   {
    "id": "sp36_48-r-1",
    "text": "Pada usia 4 tahun bicaranya masih sering tidak dimengerti orang lain"
   },
   {
    "id": "sp36_48-r-2",
    "text": "Belum memakai kalimat lengkap sederhana atau sulit mengikuti percakapan"
   },
   {
    "id": "sp36_48-r-3",
    "text": "Gagap (mengulang bunyi, tersendat) yang disertai ketegangan, membuat anak menghindari bicara, sudah berlangsung lebih dari 6 bulan, atau ada riwayat gagap dalam keluarga"
   },
   {
    "id": "sp36_48-r-4",
    "text": "Perlu volume TV lebih keras dari anggota keluarga lain atau sering tidak menyahut saat dipanggil"
   }
  ],
  "activities": [
   {
    "id": "sp36_48-a-1",
    "title": "Cerita ulang",
    "text": "Setelah membaca buku, minta anak menceritakan ulang dengan kata-katanya sendiri, lalu tanyakan 'Kenapa begitu?'"
   },
   {
    "id": "sp36_48-a-2",
    "title": "Memasak bersama",
    "text": "Ajak anak membantu di dapur sambil mengenalkan kata urutan: 'pertama', 'lalu', 'terakhir'."
   },
   {
    "id": "sp36_48-a-3",
    "title": "Tebak fungsi benda",
    "text": "Main tebak-tebakan: 'Apa yang kita pakai untuk menyapu?' atau 'Gelas untuk apa?'"
   },
   {
    "id": "sp36_48-a-4",
    "title": "Main peran",
    "text": "Main sekolah-sekolahan atau toko-tokoan dan biarkan anak memimpin ceritanya."
   }
  ]
 },
 {
  "fromMonths": 48,
  "toMonths": 60,
  "label": "48 sampai 60 bulan",
  "skills": [
   {
    "id": "sp48_60-s-1",
    "text": "Menceritakan cerita yang didengar atau dikarang dengan minimal dua kejadian"
   },
   {
    "id": "sp48_60-s-2",
    "text": "Menjawab pertanyaan sederhana tentang cerita yang baru dibacakan"
   },
   {
    "id": "sp48_60-s-3",
    "text": "Bercakap-cakap lebih dari tiga kali bergantian"
   },
   {
    "id": "sp48_60-s-4",
    "text": "Memakai kata waktu seperti 'kemarin', 'besok', 'pagi', 'malam'"
   },
   {
    "id": "sp48_60-s-5",
    "text": "Mengenali kata yang bunyinya mirip atau berima, misalnya 'topi' dan 'kopi'"
   },
   {
    "id": "sp48_60-s-6",
    "text": "Bicaranya mudah dimengerti dalam percakapan sehari-hari"
   }
  ],
  "redFlags": [
   {
    "id": "sp48_60-r-1",
    "text": "Bicaranya masih sulit dimengerti orang yang tidak dikenal"
   },
   {
    "id": "sp48_60-r-2",
    "text": "Belum bisa menceritakan kejadian sederhana atau kalimatnya masih sangat pendek"
   },
   {
    "id": "sp48_60-r-3",
    "text": "Sulit mengikuti instruksi atau aturan permainan sederhana"
   },
   {
    "id": "sp48_60-r-4",
    "text": "Sangat sulit mengingat nama warna, angka, atau huruf dibanding anak seusianya"
   }
  ],
  "activities": [
   {
    "id": "sp48_60-a-1",
    "title": "Membaca setiap hari",
    "text": "Baca bersama setiap hari dan biarkan anak menceritakan halaman favoritnya."
   },
   {
    "id": "sp48_60-a-2",
    "title": "Permainan bunyi",
    "text": "Main tebak bunyi awal ('Apa saja yang bunyinya mulai dengan 'b'? Bola, buku...') dan cari kata yang berima."
   },
   {
    "id": "sp48_60-a-3",
    "title": "Dongeng sebelum tidur",
    "text": "Gantian mendongeng: Ayah mulai satu kalimat, anak melanjutkan."
   },
   {
    "id": "sp48_60-a-4",
    "title": "Batasi layar",
    "text": "IDAI menganjurkan anak 2 sampai 6 tahun kurang dari 1 jam layar per hari dengan konten berkualitas dan pendampingan; ganti dengan ngobrol saat makan bersama."
   }
  ]
 }
];
