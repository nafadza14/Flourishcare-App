/* Generated from research data (scratchpad/gen/gen.py). Edit the generator, not this file. */
export type KpspDomain = 'gerak_kasar' | 'gerak_halus' | 'bicara_bahasa' | 'sosialisasi_kemandirian';
export type KpspPicture = 'prone_head' | 'prone_45' | 'prone_90' | 'pull_to_sit' | 'prone_chest' | 'raking' | 'line_copy' | 'pictures' | 'pictures_actions' | 'longer_line' | 'draw_plus' | 'draw_square';
export interface KpspItem { id: string; no: number; text: string; domain: KpspDomain; mode: 'tanya' | 'perintah' | 'amati'; picture?: KpspPicture }
export interface KpspForm { ageMonths: number; verified: boolean; tools: string[]; items: KpspItem[] }

/** Official KPSP schedule ages (months) */
export const KPSP_SCHEDULE = [3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, 72];

export const KPSP_SOURCE = 'Kemenkes RI, Buku Bagan Stimulasi, Deteksi dan Intervensi Dini Tumbuh Kembang Anak (revisi 2022)';

/** Forms whose 2022 wording is available. Missing ages are done with a health worker instead. */
export const KPSP_FORMS: KpspForm[] = [
 {
  "ageMonths": 3,
  "verified": true,
  "tools": [
   "alas datar",
   "gulungan wool merah"
  ],
  "items": [
   {
    "id": "kpsp3_1",
    "no": 1,
    "text": "Pada saat bayi terlentang, apakah masing-masing lengan dan tungkai bergerak dengan mudah? Jawab ‘Tidak’ bila salah satu atau kedua tungkai atau lengan bayi bergerak tak terarah atau tak terkendali.",
    "domain": "gerak_kasar",
    "mode": "amati"
   },
   {
    "id": "kpsp3_2",
    "no": 2,
    "text": "Jangan membuat suara apapun. Pada saat bayi terlentang apakah ia melihat dan menatap wajah Anda?",
    "domain": "sosialisasi_kemandirian",
    "mode": "amati"
   },
   {
    "id": "kpsp3_3",
    "no": 3,
    "text": "Pada saat Anda mengajak bayi berbicara dan tersenyum, apakah ia tersenyum kembali kepada Anda?",
    "domain": "sosialisasi_kemandirian",
    "mode": "amati"
   },
   {
    "id": "kpsp3_4",
    "no": 4,
    "text": "Apakah bayi dapat mengeluarkan suara-suara lain (mengoceh) selain menangis?",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp3_5",
    "no": 5,
    "text": "Apakah bayi suka tertawa keras walau tidak digelitik atau diraba-raba?",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp3_6",
    "no": 6,
    "text": "Ambil gulungan wool merah, lalu letakkan di atas wajah di depan mata bayi. Gerakkan wool dari samping kiri ke kanan kepala atau sebaliknya. Apakah ia dapat mengikuti gerakan Anda dengan menggerakkan kepalanya dari kanan atau kiri ke tengah?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp3_7",
    "no": 7,
    "text": "Ambil gulungan wool merah, lalu letakkan di atas wajah di depan mata bayi. Gerakkan wool dari samping kiri ke kanan kepala atau sebaliknya. Apakah ia dapat mengikuti gerakan Anda dengan menggerakkan kepalanya dari satu sisi hampir sampai pada sisi yang lain?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp3_8",
    "no": 8,
    "text": "Pada saat bayi tengkurap di alas yang datar, apakah ia dapat mengangkat kepalanya seperti pada gambar?",
    "domain": "gerak_kasar",
    "mode": "amati",
    "picture": "prone_head"
   },
   {
    "id": "kpsp3_9",
    "no": 9,
    "text": "Pada saat bayi tengkurap di alas yang datar, apakah ia dapat mengangkat kepalanya sehingga membentuk sudut 45˚ seperti pada gambar?",
    "domain": "gerak_kasar",
    "mode": "amati",
    "picture": "prone_45"
   },
   {
    "id": "kpsp3_10",
    "no": 10,
    "text": "Pada saat bayi tengkurap di alas yang datar, apakah ia dapat mengangkat kepalanya dengan tegak seperti pada gambar?",
    "domain": "gerak_kasar",
    "mode": "amati",
    "picture": "prone_90"
   }
  ]
 },
 {
  "ageMonths": 6,
  "verified": false,
  "tools": [
   "alas datar",
   "benda kecil (kacang/kismis/uang logam)",
   "gulungan wool merah",
   "mainan",
   "pensil"
  ],
  "items": [
   {
    "id": "kpsp6_1",
    "no": 1,
    "text": "Bayi diposisikan terlentang. Ambil gulungan wool merah, letakkan di atas wajah di depan mata bayi. Gerakkan wool dari samping kiri ke kanan kepala. Apakah ia dapat mengikuti gerakan Anda dengan menggerakkan kepala sepenuhnya dari satu ke sisi yang lain?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp6_2",
    "no": 2,
    "text": "Pada posisi bayi terlentang, pegang kedua tangannya lalu tarik perlahan ke posisi duduk. Dapatkah bayi mempertahankan lehernya secara kaku seperti pada gambar? Jawab ‘Tidak’ bila kepala bayi jatuh kembali seperti gambar.",
    "domain": "gerak_kasar",
    "mode": "perintah",
    "picture": "pull_to_sit"
   },
   {
    "id": "kpsp6_3",
    "no": 3,
    "text": "Ketika bayi tengkurap di alas yang datar, apakah ia dapat mengangkat dada dengan kedua lengannya sebagai penyangga seperti pada gambar?",
    "domain": "gerak_kasar",
    "mode": "amati",
    "picture": "prone_chest"
   },
   {
    "id": "kpsp6_4",
    "no": 4,
    "text": "Bayi dipangku orang tua atau pengasuh. Dapatkah bayi mempertahankan posisi kepala dalam keadaan tegak dan stabil? Jawab ‘Tidak’ bila kepala bayi cenderung jatuh ke kanan, kiri, atau ke dadanya.",
    "domain": "gerak_kasar",
    "mode": "amati"
   },
   {
    "id": "kpsp6_5",
    "no": 5,
    "text": "Bayi dipangku orang tua atau pengasuh. Sentuhkan pensil di punggung tangan atau ujung jari bayi (jangan meletakkan di atas telapak tangan bayi). Apakah bayi dapat menggenggam pensil itu selama beberapa detik?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp6_6",
    "no": 6,
    "text": "Bayi dipangku orang tua atau pengasuh. Dapatkah bayi mengarahkan matanya pada benda kecil sebesar kacang, kismis atau uang logam? Jawab ‘Tidak’ jika ia tidak dapat mengarahkan matanya.",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp6_7",
    "no": 7,
    "text": "Bayi dipangku orang tua atau pengasuh. Dapatkah bayi meraih mainan yang diletakkan agak jauh namun masih berada dalam jangkauan tangannya?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp6_8",
    "no": 8,
    "text": "Tanyakan kepada orang tua atau pengasuh, pernahkah bayi berbalik paling sedikit 2 kali, dari terlentang ke tengkurap atau sebaliknya?",
    "domain": "gerak_kasar",
    "mode": "tanya"
   },
   {
    "id": "kpsp6_9",
    "no": 9,
    "text": "Tanyakan kepada orang tua atau pengasuh, pernahkah bayi mengeluarkan suara gembira bernada tinggi atau memekik tetapi bukan menangis?",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp6_10",
    "no": 10,
    "text": "Tanyakan kepada orang tua atau pengasuh, pernahkah orang tua atau pengasuh melihat bayi tersenyum ketika melihat mainan yang lucu, gambar, atau binatang peliharaan pada saat ia bermain sendiri?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   }
  ]
 },
 {
  "ageMonths": 9,
  "verified": true,
  "tools": [
   "2 kubus, meja",
   "gulungan wool merah",
   "kismis, meja",
   "mainan"
  ],
  "items": [
   {
    "id": "kpsp9_1",
    "no": 1,
    "text": "Bayi dipangku orang tua atau pengasuh, Taruh kismis di atas meja. Dapatkah bayi memungut dengan tangannya benda-benda kecil seperti kismis, kacang-kacangan, potongan biskuit dengan gerakan miring atau menggerapai seperti gambar?",
    "domain": "gerak_halus",
    "mode": "perintah",
    "picture": "raking"
   },
   {
    "id": "kpsp9_2",
    "no": 2,
    "text": "Bayi dipangku orang tua atau pengasuh. Taruh 2 kubus di atas meja, buat agar bayi dapat memungut dan memegang kubus pada masing-masing tangannya. Dapatkah ia melakukannya?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp9_3",
    "no": 3,
    "text": "Bayi dipangku orang tua atau pengasuh. Tarik perhatian bayi dengan memperlihatkan gulungan wool merah, kemudian jatuhkan ke lantai. Apakah bayi mencoba mencari benda tersebut, misalnya mencari di bawah meja atau di belakang kursi?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp9_4",
    "no": 4,
    "text": "Bayi dipangku orang tua atau pengasuh. Letakkan suatu mainan yang diinginkan bayi di luar jangkauannya, apakah ia mencoba mendapatkan mainan dengan mengulurkan lengan atau badannya?",
    "domain": "sosialisasi_kemandirian",
    "mode": "perintah"
   },
   {
    "id": "kpsp9_5",
    "no": 5,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah bayi menengok ke belakang seperti mendengar kedatangan seseorang pada saat bayi sedang bermain sendiri dan seseorang diam-diam datang berdiri di belakangnya? Suara keras tidak ikut dihitung. Jawab ‘Ya’ hanya jika melihat reaksinya terhadap suara yang perlahan atau bisikan.",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp9_6",
    "no": 6,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat mengatakan 2 suku kata yang sama, misalnya: “Ma-ma”, “Da-da” atau “Pa-pa”? Jawab ‘Ya’ bila ia dapat mengeluarkan salah 1 suara tersebut.",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp9_7",
    "no": 7,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah bayi dapat makan kue kering sendiri?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp9_8",
    "no": 8,
    "text": "Tanyakan kepada orang tua atau pengasuh apakah pernah melihat bayi memindahkan mainan atau kue kering dari satu tangan ke tangan yang lain? Benda-benda panjang seperti sendok atau kerincingan bertangkai tidak ikut dinilai.",
    "domain": "gerak_halus",
    "mode": "tanya"
   },
   {
    "id": "kpsp9_9",
    "no": 9,
    "text": "Tanpa disangga oleh bantal, kursi atau dinding, dapatkah bayi duduk sendiri selama 60 detik?",
    "domain": "gerak_kasar",
    "mode": "amati"
   },
   {
    "id": "kpsp9_10",
    "no": 10,
    "text": "Jika Anda mengangkat bayi melalui ketiaknya ke posisi berdiri, dapatkah ia menyangga sebagian berat badan dengan kedua kakinya? Jawab ‘Ya’ bila ia mencoba berdiri dan sebagian berat badan tertumpu pada kedua kakinya.",
    "domain": "gerak_kasar",
    "mode": "perintah"
   }
  ]
 },
 {
  "ageMonths": 12,
  "verified": false,
  "tools": [
   "2 kubus",
   "kismis, meja",
   "kursi atau meja",
   "pensil"
  ],
  "items": [
   {
    "id": "kpsp12_1",
    "no": 1,
    "text": "Bayi dipangku orang tua atau pengasuh. Letakkan pensil di telapak tangan anak. Coba ambil pensil tersebut dengan perlahan-lahan. Apakah anak menggenggam pensil dengan erat dan Anda merasa kesulitan mendapatkan pensil itu kembali?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp12_2",
    "no": 2,
    "text": "Bayi dipangku orang tua atau pengasuh. Letakkan kismis di atas meja. Dapatkah anak memungut dengan tangannya benda-benda kecil seperti kismis, kacang-kacangan, potongan biskuit dengan gerakan miring atau menggerapai seperti gambar?",
    "domain": "gerak_halus",
    "mode": "perintah",
    "picture": "raking"
   },
   {
    "id": "kpsp12_3",
    "no": 3,
    "text": "Bayi dipangku orang tua atau pengasuh. Berikan 2 kubus kepada bayi. Tanpa bantuan, apakah anak dapat mempertemukan 2 kubus kecil yang ia pegang?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp12_4",
    "no": 4,
    "text": "Sebut 2-3 kata yang dapat ditiru oleh anak (tidak perlu kata-kata yang lengkap). Apakah ia mencoba meniru kata-kata tadi?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp12_5",
    "no": 5,
    "text": "Tanyakan kepada ibu atau pengasuh, apakah anak dapat mengangkat badannya ke posisi berdiri tanpa bantuan?",
    "domain": "gerak_kasar",
    "mode": "tanya"
   },
   {
    "id": "kpsp12_6",
    "no": 6,
    "text": "Tanyakan kepada ibu atau pengasuh, apakah anak dapat duduk sendiri tanpa bantuan dari posisi tidur atau tengkurap?",
    "domain": "gerak_kasar",
    "mode": "tanya"
   },
   {
    "id": "kpsp12_7",
    "no": 7,
    "text": "Tanyakan kepada ibu atau pengasuh, apakah anak dapat memahami makna kata ’jangan’?",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp12_8",
    "no": 8,
    "text": "Tanyakan kepada ibu atau pengasuh, apakah anak akan mencari atau terlihat mengharapkan muncul kembali jika ibu atau pengasuh bersembunyi di belakang sesuatu atau di pojok, kemudian muncul dan menghilang secara berulang-ulang di hadapan anak?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp12_9",
    "no": 9,
    "text": "Tanyakan kepada ibu atau pengasuh, apakah anak dapat membedakan ibu atau pengasuh dengan orang yang belum ia kenal? Ia akan menunjukkan sikap malu-malu atau ragu-ragu pada saat permulaan bertemu dengan orang yang belum dikenalnya.",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp12_10",
    "no": 10,
    "text": "Berdirikan anak. Apakah anak dapat berdiri dengan berpegangan pada kursi atau meja selama 30 detik atau lebih?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   }
  ]
 },
 {
  "ageMonths": 15,
  "verified": true,
  "tools": [
   "2 kubus",
   "kubus",
   "kubus, cangkir"
  ],
  "items": [
   {
    "id": "kpsp15_1",
    "no": 1,
    "text": "Bayi dipangku orang tua atau pengasuh. Berikan 2 kubus kepada anak. Tanpa bantuan, apakah anak dapat mempertemukan 2 kubus kecil yang ia pegang?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp15_2",
    "no": 2,
    "text": "Bayi dipangku orang tua atau pengasuh. Berikan sebuah kubus dan cangkir. Apakah anak dapat memasukkan 1 kubus ke dalam cangkir?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp15_3",
    "no": 3,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat berjalan dengan berpegangan?",
    "domain": "gerak_kasar",
    "mode": "tanya"
   },
   {
    "id": "kpsp15_4",
    "no": 4,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat mengatakan ‘papa’ ketika ia memanggil atau melihat ayahnya, atau mengatakan ‘mama’ jika memanggil atau melihat ibunya? Jawab ‘Ya’ bila anak mengatakan salah satu di antaranya.",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp15_5",
    "no": 5,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat mengucapkan 1 kata yang bermakna selain ‘mama’, ‘papa’, atau nama panggilan orang?",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp15_6",
    "no": 6,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat bertepuk tangan atau melambai-lambai tanpa bantuan? Jawab ‘Tidak’ bila ia membutuhkan bantuan.",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp15_7",
    "no": 7,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat menunjukkan apa yang diinginkannya tanpa menangis atau merengek? Jawab ‘Ya’ bila ia menunjuk, menarik atau mengeluarkan suara yang menyenangkan.",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp15_8",
    "no": 8,
    "text": "Coba berdirikan anak. Apakah anak dapat berdiri sendiri tanpa berpegangan selama 30 detik atau lebih?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   },
   {
    "id": "kpsp15_9",
    "no": 9,
    "text": "Letakkan kubus di lantai, tanpa berpegangan atau menyentuh lantai, apakah anak dapat membungkuk untuk memungut kubus di lantai dan kemudian berdiri kembali?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   },
   {
    "id": "kpsp15_10",
    "no": 10,
    "text": "Apakah anak dapat berjalan di sepanjang ruangan tanpa jatuh atau terhuyung-huyung?",
    "domain": "gerak_kasar",
    "mode": "amati"
   }
  ]
 },
 {
  "ageMonths": 18,
  "verified": false,
  "tools": [
   "bola tenis",
   "kertas, pensil",
   "kubus",
   "pensil, kertas"
  ],
  "items": [
   {
    "id": "kpsp18_1",
    "no": 1,
    "text": "Bayi dipangku orang tua atau pengasuh. Berikan anak sebuah pensil dan kertas. Apakah anak dapat mencoret-coret kertas tanpa bantuan atau petunjuk?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp18_2",
    "no": 2,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat menyebutkan sedikitnya 3 kata yang bermakna?",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp18_3",
    "no": 3,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat menunjukkan apa yang diinginkannya tanpa menangis atau merengek?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp18_4",
    "no": 4,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat minum dari cangkir atau gelas sendiri tanpa banyak yang tumpah?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp18_5",
    "no": 5,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak suka meniru bila ibu atau pengasuh sedang melakukan pekerjaan rumah tangga (merapikan mainan, menyapu, dll)?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp18_6",
    "no": 6,
    "text": "Gelindingkan bola tenis ke arah anak. Apakah anak dapat menggelindingkan atau melempar bola tersebut kembali kepada Anda?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp18_7",
    "no": 7,
    "text": "Letakkan kubus di lantai, tanpa berpegangan atau menyentuh lantai, apakah anak dapat membungkuk untuk memungut kubus di lantai dan kemudian berdiri kembali?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   },
   {
    "id": "kpsp18_8",
    "no": 8,
    "text": "Minta anak untuk berjalan sepanjang ruangan. Dapatkah ia berjalan tanpa terhuyung-huyung atau terjatuh?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   },
   {
    "id": "kpsp18_9",
    "no": 9,
    "text": "Dapatkah anak berjalan mundur minimal 5 langkah tanpa kehilangan keseimbangan?",
    "domain": "gerak_kasar",
    "mode": "amati"
   },
   {
    "id": "kpsp18_10",
    "no": 10,
    "text": "Berikan anak perintah berikut ini dengan bantuan telunjuk atau isyarat: “Ambil kertas” “Ambil pensil” “Tutup pintu” Dapatkah anak melakukan perintah tersebut dengan bantuan telunjuk atau isyarat?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   }
  ]
 },
 {
  "ageMonths": 30,
  "verified": false,
  "tools": [
   "bola tenis",
   "gambar (lembar KPSP)",
   "kubus",
   "pensil, kertas"
  ],
  "items": [
   {
    "id": "kpsp30_1",
    "no": 1,
    "text": "Beri kubus di depan anak. Dapatkah anak menyusun 4 buah kubus menyerupai kereta api dengan cerobong asap (dicontohkan)?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp30_2",
    "no": 2,
    "text": "Buat garis lurus ke bawah sepanjang sekurang-kurangnya 2,5 cm. Minta anak untuk menggambar garis lain di samping garis ini. Jawab ‘Ya’ bila ia menggambar garis seperti ini:",
    "domain": "gerak_halus",
    "mode": "perintah",
    "picture": "line_copy"
   },
   {
    "id": "kpsp30_3",
    "no": 3,
    "text": "Tanpa bimbingan, petunjuk, atau bantuan Anda, dapatkah anak menyebut 2 gambar di antara gambar-gambar di bawah dengan benar? Menyebut dengan suara binatang tidak ikut dinilai.",
    "domain": "bicara_bahasa",
    "mode": "perintah",
    "picture": "pictures"
   },
   {
    "id": "kpsp30_4",
    "no": 4,
    "text": "Tanpa bimbingan, petunjuk, atau bantuan Anda, dapatkah anak menunjuk 4 gambar di antara gambar-gambar di atas ini dengan benar ketika Anda sebutkan namanya?",
    "domain": "bicara_bahasa",
    "mode": "perintah",
    "picture": "pictures"
   },
   {
    "id": "kpsp30_5",
    "no": 5,
    "text": "Tanpa bimbingan, petunjuk, atau bantuan Anda, dapatkah anak menunjuk paling sedikit 6 bagian tubuhnya?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp30_6",
    "no": 6,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat memahami perintah yang terdiri dari 2 langkah, misalnya ‘Tolong ambil bola dan berikan kepada Ayah’?",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp30_7",
    "no": 7,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak berpakaian sendiri seperti baju, rok, celana (topi dan kaos kaki tidak ikut dinilai)?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp30_8",
    "no": 8,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak bermain peran, misalnya menyuapi boneka?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp30_9",
    "no": 9,
    "text": "Letakkan bola tenis di depan kaki anak. Dapatkah anak menendang ke depan tanpa berpegangan pada apapun? Mendorong bola tidak ikut dinilai.",
    "domain": "gerak_kasar",
    "mode": "perintah"
   },
   {
    "id": "kpsp30_10",
    "no": 10,
    "text": "Minta anak untuk melompat atau mengangkat kedua kakinya pada saat bersamaan. Dapatkah ia melakukannya?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   }
  ]
 },
 {
  "ageMonths": 36,
  "verified": false,
  "tools": [
   "bola tenis",
   "gambar (lembar KPSP)",
   "kubus",
   "pensil, kertas",
   "selembar kertas seukuran buku"
  ],
  "items": [
   {
    "id": "kpsp36_1",
    "no": 1,
    "text": "Beri kubus di depan anak. Dapatkah anak menyusun 6 buah kubus satu persatu di atas kubus yang lain tanpa menjatuhkan kubus tersebut?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp36_2",
    "no": 2,
    "text": "Buat garis lurus ke bawah sepanjang sekurang-kurangnya 2,5 cm. Minta anak untuk menggambar garis lain di samping garis ini. Jawab ‘Ya’ bila ia menggambar garis seperti ini: Jawab ‘Tidak’ bila ia menggambar garis seperti ini:",
    "domain": "gerak_halus",
    "mode": "perintah",
    "picture": "line_copy"
   },
   {
    "id": "kpsp36_3",
    "no": 3,
    "text": "Tanpa bimbingan, petunjuk, atau bantuan Anda, dapatkah anak menyebut 4 gambar di antara gambar-gambar di bawah ini dengan benar? Menyebut dengan suara binatang tidak ikut dinilai.",
    "domain": "bicara_bahasa",
    "mode": "perintah",
    "picture": "pictures"
   },
   {
    "id": "kpsp36_4",
    "no": 4,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat memahami perintah yang terdiri dari 2 langkah, misalnya “Tolong ambil bola dan berikan kepada Ayah”?",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp36_5",
    "no": 5,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah sebagian dari bicara anak dapat dipahami oleh orang asing (yang tidak bertemu setiap hari)?",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp36_6",
    "no": 6,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak merangkai kalimat sederhana yang terdiri dari minimal 3 kata, misalnya “Aku makan roti” atau ”Ibu minta susu”?",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp36_7",
    "no": 7,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak menggosok gigi dengan bantuan?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp36_8",
    "no": 8,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak mengenakan baju, celana, atau sepatu sendiri (tidak termasuk mengancing dan menali)?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp36_9",
    "no": 9,
    "text": "Berikan kepada anak sebuah bola tenis. Minta ia untuk melemparkan ke arah dada Anda. Dapatkah anak melempar bola dengan lurus ke arah perut atau dada Anda dari jarak 1,5 meter?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   },
   {
    "id": "kpsp36_10",
    "no": 10,
    "text": "Letakkan selembar kertas seukuran buku ini di atas lantai. Apakah anak dapat melompati bagian lebar kertas dengan mengangkat kedua kakinya secara bersamaan tanpa didahului lari?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   }
  ]
 },
 {
  "ageMonths": 42,
  "verified": false,
  "tools": [
   "gambar (lembar KPSP)",
   "kubus",
   "pensil, kertas",
   "selembar kertas seukuran buku"
  ],
  "items": [
   {
    "id": "kpsp42_1",
    "no": 1,
    "text": "Buat garis lurus ke bawah sepanjang sekurang-kurangnya 2,5 cm. Minta anak untuk menggambar garis lain di samping garis ini. Jawab ‘Ya’ bila ia menggambar garis seperti ini: Jawab ‘Tidak’ bila ia menggambar garis seperti ini:",
    "domain": "gerak_halus",
    "mode": "perintah",
    "picture": "line_copy"
   },
   {
    "id": "kpsp42_2",
    "no": 2,
    "text": "Beri kubus di depan anak. Dapatkah anak menyusun 8 buah kubus satu persatu di atas kubus yang lain tanpa menjatuhkannya?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp42_3",
    "no": 3,
    "text": "Tunjukkan anak gambar di bawah ini dan tanyakan: “Mana yang dapat terbang?” “Mana yang dapat mengeong?” “Mana yang dapat bicara?” “Mana yang dapat menggonggong?” “Mana yang dapat meringkik?” Apakah anak dapat menunjuk 2 kegiatan yang sesuai?",
    "domain": "bicara_bahasa",
    "mode": "perintah",
    "picture": "pictures_actions"
   },
   {
    "id": "kpsp42_4",
    "no": 4,
    "text": "Tanyakan kepada anak pertanyaan berikut ini satu persatu: “Apa yang kamu lakukan bila kedinginan?” Jawaban: pakai jaket, pakai selimut “Apa yang kamu lakukan bila kamu kelelahan?” Jawaban: tidur, berbaring, istirahat “Apa yang kamu lakukan bila kamu merasa lapar?” Jawaban: makan “Apa yang kamu lakukan bila kamu merasa haus?” Jawaban: minum Apakah anak dapat menjawab 3 pertanyaan dengan benar tanpa gerakan dan isyarat?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp42_5",
    "no": 5,
    "text": "Minta anak untuk menyebut 1 warna. Dapatkah anak menyebut 1 warna dengan benar?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp42_6",
    "no": 6,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat mencuci tangannya sendiri dengan baik setelah makan?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp42_7",
    "no": 7,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak menyebut nama teman bermain di luar rumah atau saudara yang tidak tinggal serumah?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp42_8",
    "no": 8,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak mengenakan kaos (T-shirt) tanpa dibantu?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp42_9",
    "no": 9,
    "text": "Letakkan selembar kertas seukuran buku ini di atas lantai. Apakah anak dapat melompati bagian lebar kertas dengan mengangkat kedua kakinya secara bersamaan tanpa didahului lari?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   },
   {
    "id": "kpsp42_10",
    "no": 10,
    "text": "Minta anak untuk berdiri 1 kaki tanpa berpegangan. Jika perlu tunjukkan caranya dan beri anak kesempatan sebanyak 3 kali. Dapatkah ia mempertahankan keseimbangan dalam waktu 1 detik atau lebih?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   }
  ]
 },
 {
  "ageMonths": 48,
  "verified": true,
  "tools": [
   "3 kubus",
   "5 kubus, kertas",
   "gambar (lembar KPSP)",
   "pensil, kertas",
   "selembar kertas seukuran buku"
  ],
  "items": [
   {
    "id": "kpsp48_1",
    "no": 1,
    "text": "Berikan contoh membuat jembatan dari 3 buah kubus, yaitu dengan meletakkan 2 kubus dengan sedikit jarak (kira kira satu jari), lalu letakkan balok ketiga di atas kedua balok sehingga terbentuk seperti jembatan. Minta anak untuk melakukan. Dapatkah anak melakukannya?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp48_2",
    "no": 2,
    "text": "Beri pensil dan kertas. Jangan membantu anak dan jangan menyebut lingkaran. Buatlah lingkaran di atas kertas tersebut. Minta anak menirunya. Dapatkah anak menggambar lingkaran?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp48_3",
    "no": 3,
    "text": "Tunjukkan anak gambar di bawah ini dan tanyakan: “Yang mana yang dapat terbang?” “Yang mana yang dapat mengeong?” “Yang mana yang dapat bicara?” “Yang mana yang dapat menggonggong?” “Yang mana yang dapat meringkik?” Apakah anak dapat menunjuk 2 kegiatan yang sesuai?",
    "domain": "bicara_bahasa",
    "mode": "perintah",
    "picture": "pictures_actions"
   },
   {
    "id": "kpsp48_4",
    "no": 4,
    "text": "Dapatkah anak menyebut nama lengkapnya tanpa dibantu? Jawab ‘Tidak’ jika ia menyebut sebagian namanya atau ucapannya sulit dimengerti.",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp48_5",
    "no": 5,
    "text": "Letakkan 5 kubus di atas meja dan selembar kertas di samping kubus. Katakan kepada anak “Ambil 1 kubus dan letakkan di atas kertas”. Setelah anak selesai meletakkan, tanyakan “Ada berapa banyak kubus di atas kertas?” Dapatkah anak melakukan dengan hanya mengambil satu kubus dan bisa menyebutkan “Satu”?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp48_6",
    "no": 6,
    "text": "Tanyakan kepada anak pertanyaan di bawah satu persatu: “Apa kegunaan kursi?” Jawaban: untuk duduk “Apa kegunaan cangkir?” Jawaban: untuk minum “Apa kegunaan pensil?” Jawaban: untuk mencoret, menulis, menggambar Dapatkah anak menjawab ketiga pertanyaan terkait kegunaan benda tersebut dengan benar?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp48_7",
    "no": 7,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak mengikuti peraturan permainan saat bermain dengan teman-temannya (misal: ular tangga, petak umpet, dll)?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp48_8",
    "no": 8,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak mengenakan kaos (T-shirt) tanpa dibantu?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp48_9",
    "no": 9,
    "text": "Letakkan selembar kertas seukuran buku ini di atas lantai. Apakah anak dapat melompati bagian lebar kertas dengan mengangkat kedua kakinya secara bersamaan tanpa didahului lari?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   },
   {
    "id": "kpsp48_10",
    "no": 10,
    "text": "Minta anak untuk berdiri 1 kaki tanpa berpegangan. Jika perlu tunjukkan caranya dan beri anak kesempatan sebanyak 3 kali. Dapatkah ia mempertahankan keseimbangan dalam waktu 2 detik atau lebih?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   }
  ]
 },
 {
  "ageMonths": 54,
  "verified": true,
  "tools": [
   "benda (kertas/balok), meja",
   "gambar dua garis (lembar KPSP)",
   "pensil, kertas",
   "pensil, kertas kosong"
  ],
  "items": [
   {
    "id": "kpsp54_1",
    "no": 1,
    "text": "Jangan mengoreksi atau membantu anak. Jangan menyebut kata “Lebih panjang”. Perlihatkan gambar kedua garis ini pada anak. Tanyakan: “Mana garis yang lebih panjang?” Minta anak menunjuk garis yang lebih panjang. Setelah anak menunjuk, putar lembar ini dan ulangi pertanyaan tersebut. Apakah anak dapat menunjuk garis yang lebih panjang sebanyak 3 kali dengan benar?",
    "domain": "gerak_halus",
    "mode": "perintah",
    "picture": "longer_line"
   },
   {
    "id": "kpsp54_2",
    "no": 2,
    "text": "Jangan membantu anak dan jangan memberitahu nama gambar ini. Minta anak untuk menggambar seperti contoh di kertas kosong yang tersedia. Berikan 3 kali kesempatan. Apakah anak dapat menggambar + seperti contoh di bawah?",
    "domain": "gerak_halus",
    "mode": "perintah",
    "picture": "draw_plus"
   },
   {
    "id": "kpsp54_3",
    "no": 3,
    "text": "Berikan anak pensil dan kertas lalu katakan kepada anak “Buatlah gambar orang” (anak laki-laki, anak perempuan, papa, mama, dll). Jangan memberi perintah lebih dari itu. Jangan bertanya atau mengingatkan anak bila ada bagian yang belum tergambar. Dalam memberi nilai, hitunglah berapa bagian tubuh yang tergambar. Untuk bagian tubuh yang berpasangan seperti mata, telinga, lengan, dan kaki, setiap pasang dinilai 1 bagian. Pastikan anak telah menyelesaikan gambar sebelum memberikan penilaian. Dapatkah anak menggambar orang dengan sedikitnya 3 bagian tubuh?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp54_4",
    "no": 4,
    "text": "Minta anak untuk menyebutkan 2 warna. Dapatkah anak menyebut 2 warna dengan benar?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp54_5",
    "no": 5,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah bicara anak mampu dipahami seluruhnya oleh orang lain (yang tidak bertemu setiap hari)?",
    "domain": "bicara_bahasa",
    "mode": "tanya"
   },
   {
    "id": "kpsp54_6",
    "no": 6,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak mengikuti peraturan permainan saat bermain dengan teman-temannya (misal: ular tangga, petak umpet, dll)?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp54_7",
    "no": 7,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak menggosok gigi tanpa dibantu?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp54_8",
    "no": 8,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat mengancingkan bajunya atau pakaian boneka?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp54_9",
    "no": 9,
    "text": "Minta anak untuk mengikuti perintah di bawah, jangan memberi isyarat. “Ambil benda (misalnya kertas, balok) dan letakkan di atas meja” “Ambil benda (misalnya kertas, balok) dan letakkan di bawah meja” “Ambil benda (misalnya kertas, balok) dan letakkan di depan ibu” “Ambil benda (misalnya kertas, balok) dan letakkan di samping ibu” “Ambil benda (misalnya kertas, balok) dan letakkan di belakang ibu” Dapatkah anak melakukan sedikitnya 2 perintah (memahami 2 kata depan)?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp54_10",
    "no": 10,
    "text": "Minta anak untuk berdiri 1 kaki tanpa berpegangan. Jika perlu tunjukkan caranya dan beri anak kesempatan sebanyak 3 kali. Dapatkah ia mempertahankan keseimbangan dalam waktu 2 detik atau lebih?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   }
  ]
 },
 {
  "ageMonths": 60,
  "verified": true,
  "tools": [
   "benda (kertas/balok), meja",
   "gambar dua garis (lembar KPSP)",
   "pensil, kertas"
  ],
  "items": [
   {
    "id": "kpsp60_1",
    "no": 1,
    "text": "Perlihatkan gambar kedua garis ini pada anak. Tanyakan: “Mana garis yang lebih panjang?” Minta anak menunjuk garis yang lebih panjang. Setelah anak menunjuk, putar lembar ini dan ulangi pertanyaan tersebut. Apakah anak dapat menunjuk garis yang lebih panjang sebanyak 3 kali dengan benar?",
    "domain": "gerak_halus",
    "mode": "perintah",
    "picture": "longer_line"
   },
   {
    "id": "kpsp60_2",
    "no": 2,
    "text": "Berikan anak pensil dan kertas lalu katakan kepada anak “Buatlah gambar orang” (anak laki-laki, anak perempuan, papa, mama, dll). Jangan memberi perintah lebih dari itu. Jangan bertanya atau mengingatkan anak bila ada bagian yang belum tergambar. Dalam memberi nilai, hitunglah berapa bagian tubuh yang tergambar. Untuk bagian tubuh yang berpasangan seperti mata, telinga, lengan dan kaki, setiap pasang dinilai 1 bagian. Pastikan anak telah menyelesaikan gambar sebelum memberikan penilaian. Dapatkah anak menggambar orang dengan sedikitnya 3 bagian tubuh?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp60_3",
    "no": 3,
    "text": "Minta anak untuk menyebutkan 4 warna. Dapatkah anak menyebut keempat warna tersebut dengan benar?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp60_4",
    "no": 4,
    "text": "Tanyakan kepada anak pertanyaan berikut ini satu persatu: “Apa yang kamu lakukan saat kedinginan?” Jawaban: pakai jaket, pakai selimut “Apa yang kamu lakukan saat kelelahan?” Jawaban: tidur, berbaring, istirahat “Apa yang kamu lakukan saat merasa lapar?” Jawaban: makan “Apa yang kamu lakukan saat merasa haus?” Jawaban: minum Dapatkah anak menjawab 3 pertanyaan terkait kata sifat tersebut dengan benar?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp60_5",
    "no": 5,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak dapat mengancingkan bajunya atau pakaian boneka?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp60_6",
    "no": 6,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak bereaksi dengan tenang dan tidak rewel (tanpa menangis atau menggelayut) pada saat ditinggal oleh orang tua atau pengasuh?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp60_7",
    "no": 7,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak sepenuhnya berpakaian sendiri tanpa dibantu?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp60_8",
    "no": 8,
    "text": "Minta anak untuk mengikuti perintah di bawah, jangan memberi isyarat: “Ambil benda (misalnya kertas, balok) dan letakkan di atas meja” “Ambil benda (misalnya kertas, balok) dan letakkan di bawah meja” “Ambil benda (misalnya kertas, balok) dan letakkan di depan ibu” “Ambil benda (misalnya kertas, balok) dan letakkan di samping ibu” “Ambil benda (misalnya kertas, balok) dan letakkan di belakang ibu” Dapatkah anak melakukan sedikitnya 4 perintah (memahami 4 kata depan)?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp60_9",
    "no": 9,
    "text": "Minta anak untuk berdiri 1 kaki tanpa berpegangan. Jika perlu tunjukkan caranya dan beri anak kesempatan sebanyak 3 kali. Dapatkah ia mempertahankan keseimbangan dalam waktu 4 detik atau lebih?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   },
   {
    "id": "kpsp60_10",
    "no": 10,
    "text": "Minta anak untuk melompat dengan 1 kaki beberapa kali tanpa berpegangan (lompatan dengan 2 kaki tidak ikut dinilai). Dapatkah anak melompat 2-3 kali dengan 1 kaki?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   }
  ]
 },
 {
  "ageMonths": 66,
  "verified": false,
  "tools": [
   "8 kubus, kertas",
   "bola tenis/bola kasti",
   "pensil, kertas",
   "pensil, kertas kosong"
  ],
  "items": [
   {
    "id": "kpsp66_1",
    "no": 1,
    "text": "Jangan membantu anak dan jangan memberitahu nama gambar ini. Minta anak untuk menggambar seperti contoh di kertas kosong yang tersedia. Berikan 3 kali kesempatan. Apakah anak dapat menggambar + seperti contoh di bawah?",
    "domain": "gerak_halus",
    "mode": "perintah",
    "picture": "draw_plus"
   },
   {
    "id": "kpsp66_2",
    "no": 2,
    "text": "Berikan kepada anak pensil dan kertas. Tunjukkan kepada anak contoh gambar di bawah. Anda bisa mencontohkan cara membuat kotak. Dapatkah anak menggambar kotak seperti contoh di bawah?",
    "domain": "gerak_halus",
    "mode": "perintah",
    "picture": "draw_square"
   },
   {
    "id": "kpsp66_3",
    "no": 3,
    "text": "Berikan anak pensil dan kertas lalu katakan kepada anak “Buatlah gambar orang” (anak laki-laki, anak perempuan, papa, mama, dll). Jangan memberi perintah lebih dari itu. Jangan bertanya atau mengingatkan anak bila ada bagian yang belum tergambar. Dalam memberi nilai, hitunglah berapa bagian tubuh yang tergambar. Untuk bagian tubuh yang berpasangan seperti mata, telinga, lengan dan kaki, setiap pasang dinilai 1 bagian. Pastikan anak telah menyelesaikan gambar sebelum memberikan penilaian. Dapatkah anak menggambar orang dengan sedikitnya 6 bagian tubuh?",
    "domain": "gerak_halus",
    "mode": "perintah"
   },
   {
    "id": "kpsp66_4",
    "no": 4,
    "text": "Letakkan 8 kubus di atas meja dan selembar kertas di samping kubus. Katakan kepada anak “Ambil 5 kubus dan letakkan di atas kertas”. Setelah anak selesai meletakkan, tanyakan “Ada berapa banyak kubus di atas kertas?” Dapatkah anak melakukannya?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp66_5",
    "no": 5,
    "text": "Pastikan anak mendengar pemeriksa lalu katakan “Saya akan mengucapkan 1 kata dan saya ingin kamu menyebutkan apa arti kata itu”. Setiap kata dapat diberikan sebanyak 3 kali bila perlu. Pemeriksa dapat mengatakan “Beritahu saya sesuatu tentang itu” tetapi jangan tanya apa kegunaannya. Tanyalah setiap kata dalam satu waktu. “Apakah bola itu?” “Apakah sungai itu?” “Apakah meja itu?” “Apakah mobil/motor itu?” “Apakah rumah itu?” “Apakah pisang itu?” “Apakah pintu itu?” “Apakah atap itu?” Anak dikatakan dapat mengartikan jika anak mengartikan yang sesuai dalam istilah: 1) kegunaan, 2) bentuk, 3) terbuat dari apa, 4) kategori umum. Dapatkah anak mengartikan 5 kata yang sesuai?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp66_6",
    "no": 6,
    "text": "Minta anak untuk melengkapi kalimat di bawah ini, jangan membantu kecuali mengulang pertanyaan: “Jika kuda besar, maka tikus...?” Jawaban: kecil “Jika api panas, maka es...?” Jawaban: dingin “Jika ibu seorang wanita, maka ayah seorang...” Jawaban: pria, laki-laki Apakah anak menjawab ketiga pertanyaan dengan benar?",
    "domain": "bicara_bahasa",
    "mode": "perintah"
   },
   {
    "id": "kpsp66_7",
    "no": 7,
    "text": "Tanyakan kepada orang tua atau pengasuh, apakah anak bereaksi dengan tenang dan tidak rewel (tanpa menangis atau menggelayut) pada saat ditinggal oleh orang tua atau pengasuh?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp66_8",
    "no": 8,
    "text": "Tanyakan kepada orang tua atau pengasuh, dapatkah anak sepenuhnya berpakaian sendiri tanpa dibantu?",
    "domain": "sosialisasi_kemandirian",
    "mode": "tanya"
   },
   {
    "id": "kpsp66_9",
    "no": 9,
    "text": "Minta anak untuk berdiri 1 kaki tanpa berpegangan. Jika perlu tunjukkan caranya dan beri anak kesempatan sebanyak 3 kali. Dapatkah ia mempertahankan keseimbangan dalam waktu 6 detik atau lebih?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   },
   {
    "id": "kpsp66_10",
    "no": 10,
    "text": "Apakah anak dapat menangkap bola kecil sebesar bola tenis atau bola kasti hanya dengan menggunakan kedua tangannya?",
    "domain": "gerak_kasar",
    "mode": "perintah"
   }
  ]
 }
];
