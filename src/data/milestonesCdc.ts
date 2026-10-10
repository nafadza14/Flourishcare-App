/* Generated from research data (scratchpad/gen/gen.py). Edit the generator, not this file. */
import type { MilestoneDomain } from '../types';
export interface CdcMilestone { id: string; domain: MilestoneDomain; text: string; example: string; tip: string }
export interface CdcCheckpoint { ageMonths: number; label: string; items: CdcMilestone[]; actEarly: string[] }
export const MILESTONE_ATTRIBUTION = "Diadaptasi dari materi CDC 'Learn the Signs. Act Early.' (2022), tersedia gratis di www.cdc.gov/ActEarly. Penggunaan materi ini tidak berarti dukungan dari CDC atau Pemerintah Amerika Serikat.";
export const ACT_EARLY_GENERAL = "Bila anak belum menunjukkan satu atau lebih kemampuan di atas, kehilangan kemampuan yang sebelumnya sudah dimiliki, atau Ayah Bunda punya kekhawatiran lain, bicarakan dengan dokter anak atau tenaga kesehatan dan tanyakan tentang skrining perkembangan. Jangan menunggu.";
export const CDC_CHECKPOINTS: CdcCheckpoint[] = [
 {
  "ageMonths": 2,
  "label": "2 bulan",
  "items": [
   {
    "id": "m02-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Tenang saat diajak bicara atau digendong",
    "example": "Saat bayi menangis lalu digendong atau diajak bicara dengan lembut, tangisnya mereda dalam beberapa saat.",
    "tip": "Gendong dan ajak bicara dengan suara lembut saat bayi rewel, supaya ia belajar bahwa Ayah Bunda adalah tempat yang aman."
   },
   {
    "id": "m02-sosial_emosional-2",
    "domain": "sosial_emosional",
    "text": "Melihat wajah Ayah atau Bunda",
    "example": "Saat digendong atau disusui, mata bayi tertuju ke wajah Bunda, tidak hanya ke lampu atau dinding.",
    "tip": "Bicaralah dari jarak dekat, kira-kira sejauh wajah Bunda saat menyusui, agar bayi mudah melihat wajah Ayah Bunda."
   },
   {
    "id": "m02-sosial_emosional-3",
    "domain": "sosial_emosional",
    "text": "Tampak senang saat Ayah Bunda mendekat",
    "example": "Saat Ayah datang mendekat, bayi menggerakkan tangan dan kakinya dengan riang atau wajahnya tampak berbinar.",
    "tip": "Sapa bayi dengan namanya setiap kali mendekat, misalnya 'Halo, Adik, Ayah datang.'"
   },
   {
    "id": "m02-sosial_emosional-4",
    "domain": "sosial_emosional",
    "text": "Tersenyum saat diajak bicara atau saat Ayah Bunda tersenyum padanya",
    "example": "Bunda tersenyum dan berkata 'Hai, sayang', lalu bayi membalas dengan senyuman saat ia terjaga (bukan senyum saat tidur).",
    "tip": "Sering bertatap muka sambil tersenyum dan beri jeda agar bayi sempat membalas."
   },
   {
    "id": "m02-bahasa-1",
    "domain": "bahasa",
    "text": "Mengeluarkan suara selain menangis",
    "example": "Saat tenang atau diajak ngobrol, bayi bersuara pelan seperti 'aah' atau 'ngg'.",
    "tip": "Tirukan suara bayi, lalu diam sejenak menunggu ia membalas, seperti sedang bergantian bicara."
   },
   {
    "id": "m02-bahasa-2",
    "domain": "bahasa",
    "text": "Bereaksi terhadap suara keras",
    "example": "Bayi kaget, berkedip, menangis, atau berhenti bergerak saat ada suara keras seperti pintu tertutup keras.",
    "tip": "Perhatikan reaksi bayi terhadap suara sehari-hari dan tanyakan hasil skrining pendengaran bayi baru lahir ke tenaga kesehatan."
   },
   {
    "id": "m02-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Mengikuti gerakan Ayah Bunda dengan matanya",
    "example": "Saat Bunda bergerak pelan dari sisi kiri ke kanan tempat tidur, mata bayi ikut bergerak mengikuti.",
    "tip": "Bergeraklah perlahan di depan bayi sambil bicara agar ia terlatih mengikuti dengan mata."
   },
   {
    "id": "m02-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Memandangi mainan selama beberapa detik",
    "example": "Saat mainan berwarna kontras digoyangkan pelan di depannya, bayi memperhatikannya selama beberapa detik.",
    "tip": "Tunjukkan satu mainan atau gambar hitam putih yang kontras dari jarak dekat, lalu gerakkan perlahan."
   },
   {
    "id": "m02-motorik_kasar-1",
    "domain": "motorik_kasar",
    "text": "Mengangkat kepala saat tengkurap",
    "example": "Saat ditengkurapkan di atas kasur atau di dada Ayah, bayi mengangkat kepalanya sebentar.",
    "tip": "Latih tengkurap (tummy time) beberapa kali sehari saat bayi terjaga dan selalu diawasi."
   },
   {
    "id": "m02-motorik_kasar-2",
    "domain": "motorik_kasar",
    "text": "Menggerakkan kedua lengan dan kedua kaki",
    "example": "Saat telentang, bayi menendang dengan kedua kaki dan menggerakkan kedua tangannya secara aktif.",
    "tip": "Beri waktu bayi bergerak bebas di alas yang aman saat ia terjaga, tanpa dibedong."
   },
   {
    "id": "m02-motorik_halus-3",
    "domain": "motorik_halus",
    "text": "Membuka kepalan tangan sesaat",
    "example": "Tangan bayi yang biasanya mengepal sesekali terbuka, misalnya saat ia meregangkan badan.",
    "tip": "Letakkan jari Ayah Bunda di telapak tangan bayi atau usap lembut punggung tangannya."
   }
  ],
  "actEarly": [
   "Tidak bereaksi terhadap suara keras",
   "Tidak menatap wajah atau tidak tersenyum saat diajak tersenyum",
   "Tidak mengangkat kepala sama sekali saat tengkurap",
   "Bayi lahir prematur atau punya kebutuhan kesehatan khusus: sampaikan ke dokter saat kontrol"
  ]
 },
 {
  "ageMonths": 4,
  "label": "4 bulan",
  "items": [
   {
    "id": "m04-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Tersenyum lebih dulu untuk menarik perhatian",
    "example": "Bayi tersenyum ke arah Bunda tanpa dipancing, seolah mengajak bermain.",
    "tip": "Tanggapi senyumnya dengan senyum dan kata-kata, agar ia tahu usahanya berhasil."
   },
   {
    "id": "m04-sosial_emosional-2",
    "domain": "sosial_emosional",
    "text": "Terkekeh (belum tertawa lepas) saat diajak bercanda",
    "example": "Saat Ayah membuat suara lucu atau ekspresi wajah lucu, bayi mengeluarkan suara tawa kecil.",
    "tip": "Buat ekspresi wajah dan suara lucu setiap hari saat bayi dalam suasana hati yang baik."
   },
   {
    "id": "m04-sosial_emosional-3",
    "domain": "sosial_emosional",
    "text": "Melihat, bergerak, atau bersuara untuk mendapatkan perhatian Ayah Bunda",
    "example": "Saat Bunda berhenti bicara, bayi menendang-nendang atau bersuara agar Bunda kembali memperhatikannya.",
    "tip": "Segera tanggapi saat bayi 'memanggil' dengan suara atau gerakan."
   },
   {
    "id": "m04-bahasa-1",
    "domain": "bahasa",
    "text": "Mengoceh dengan suara seperti 'ooo' atau 'aaah'",
    "example": "Saat ditatap dan diajak bicara, bayi membalas 'ooo... aaah' dengan nada senang.",
    "tip": "Ajak bayi mengobrol saat ganti popok atau mandi, dan beri jeda agar ia membalas."
   },
   {
    "id": "m04-bahasa-2",
    "domain": "bahasa",
    "text": "Membalas dengan suara saat diajak bicara",
    "example": "Bunda berkata 'Adik lagi apa?', lalu bayi menjawab dengan ocehan.",
    "tip": "Gunakan kalimat pendek dengan nada riang, lalu tunggu beberapa detik untuk balasannya."
   },
   {
    "id": "m04-bahasa-3",
    "domain": "bahasa",
    "text": "Menoleh ke arah suara Ayah Bunda",
    "example": "Saat Ayah memanggil dari samping, bayi memutar kepala mencari sumber suara.",
    "tip": "Panggil bayi dari sisi kiri dan kanan secara bergantian dengan suara lembut."
   },
   {
    "id": "m04-sosial_emosional-4",
    "domain": "sosial_emosional",
    "text": "Saat lapar, membuka mulut ketika melihat payudara atau botol susu",
    "example": "Begitu melihat Bunda bersiap menyusui, bayi membuka mulut dan tampak bersemangat.",
    "tip": "Kenali tanda lapar awal seperti membuka mulut atau mengisap tangan, dan susui sebelum ia menangis keras."
   },
   {
    "id": "m04-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Memperhatikan tangannya sendiri dengan tertarik",
    "example": "Bayi telentang sambil memandangi dan memainkan jari-jarinya sendiri.",
    "tip": "Biarkan tangan bayi bebas, tidak selalu tertutup sarung tangan, saat ia terjaga dan diawasi."
   },
   {
    "id": "m04-motorik_kasar-1",
    "domain": "motorik_kasar",
    "text": "Kepala tegak dan stabil tanpa disangga saat digendong",
    "example": "Saat digendong tegak, kepala bayi tidak lagi terkulai ke depan atau ke belakang.",
    "tip": "Lanjutkan tummy time beberapa kali sehari untuk menguatkan otot leher dan punggung."
   },
   {
    "id": "m04-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Menggenggam mainan yang diletakkan di tangannya",
    "example": "Saat kerincingan diletakkan di telapak tangannya, bayi menggenggam dan menahannya.",
    "tip": "Beri mainan ringan bergagang yang mudah digenggam, seperti kerincingan kecil."
   },
   {
    "id": "m04-motorik_halus-3",
    "domain": "motorik_halus",
    "text": "Mengayunkan lengan untuk memukul mainan",
    "example": "Saat mainan digantung di atasnya, bayi mengayunkan tangan sampai mengenai mainan itu.",
    "tip": "Gantung mainan yang aman dalam jangkauan tangan saat bayi telentang dan diawasi."
   },
   {
    "id": "m04-motorik_halus-4",
    "domain": "motorik_halus",
    "text": "Membawa tangan ke mulut",
    "example": "Bayi memasukkan kepalan atau jarinya ke mulut lalu mengisapnya.",
    "tip": "Ini cara bayi mengenal tubuhnya; cukup jaga tangan dan mainannya tetap bersih."
   },
   {
    "id": "m04-motorik_kasar-2",
    "domain": "motorik_kasar",
    "text": "Bertumpu pada siku atau lengan bawah saat tengkurap",
    "example": "Saat tengkurap, bayi mengangkat dada dengan bertumpu pada kedua lengan bawah.",
    "tip": "Letakkan mainan di depan bayi saat tengkurap agar ia terdorong mengangkat kepala dan dada."
   }
  ],
  "actEarly": [
   "Tidak menoleh ke arah suara Ayah Bunda",
   "Tidak mengoceh atau tidak membalas saat diajak bicara",
   "Kepala belum tegak dan stabil saat digendong",
   "Tidak membawa tangan ke mulut atau tidak bisa menggenggam mainan"
  ]
 },
 {
  "ageMonths": 6,
  "label": "6 bulan",
  "items": [
   {
    "id": "m06-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Mengenali orang-orang yang sudah dikenal",
    "example": "Bayi tersenyum atau mengulurkan tangan ke Ayah dan Bunda, tetapi bersikap berbeda pada orang baru.",
    "tip": "Sebut nama anggota keluarga saat mereka datang, misalnya 'Itu Nenek!'"
   },
   {
    "id": "m06-sosial_emosional-2",
    "domain": "sosial_emosional",
    "text": "Senang melihat dirinya di cermin",
    "example": "Di depan cermin, bayi tersenyum, menatap, atau menepuk bayangannya.",
    "tip": "Ajak bayi bermain di depan cermin yang aman sambil berkata 'Ini Adik!'"
   },
   {
    "id": "m06-sosial_emosional-3",
    "domain": "sosial_emosional",
    "text": "Tertawa",
    "example": "Bayi tertawa lepas saat diajak bercanda atau digelitik ringan.",
    "tip": "Bermain cilukba dan bernyanyi dengan ekspresi lucu setiap hari."
   },
   {
    "id": "m06-bahasa-1",
    "domain": "bahasa",
    "text": "Bergantian bersuara dengan Ayah Bunda",
    "example": "Bunda bersuara 'baa', bayi membalas, lalu Bunda menjawab lagi, seperti sedang bercakap-cakap.",
    "tip": "Tirukan ocehan bayi lalu tunggu gilirannya, jadikan permainan rutin."
   },
   {
    "id": "m06-bahasa-2",
    "domain": "bahasa",
    "text": "Meniup sambil menjulurkan lidah sehingga berbunyi 'brrr'",
    "example": "Bayi membuat suara 'brrr' dengan bibir bergetar dan kadang mengeluarkan gelembung ludah.",
    "tip": "Contohkan suara 'brrr' dan suara lucu lainnya, lalu biarkan bayi menirukan."
   },
   {
    "id": "m06-bahasa-3",
    "domain": "bahasa",
    "text": "Memekik atau bersuara melengking",
    "example": "Saat senang, bayi memekik dengan suara tinggi.",
    "tip": "Tanggapi pekikannya dengan antusias dan beri nama perasaannya, misalnya 'Adik senang, ya!'"
   },
   {
    "id": "m06-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Memasukkan benda ke mulut untuk mengenalinya",
    "example": "Setiap mainan yang dipegang, bayi bawa ke mulut untuk digigit atau dijilat.",
    "tip": "Sediakan mainan bersih yang aman digigit dan jauhkan benda kecil yang bisa tertelan."
   },
   {
    "id": "m06-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Meraih mainan yang diinginkan",
    "example": "Saat melihat mainan kesukaannya di dekatnya, bayi mengulurkan tangan untuk mengambilnya.",
    "tip": "Letakkan mainan sedikit di luar jangkauan agar bayi berusaha meraihnya."
   },
   {
    "id": "m06-sosial_emosional-4",
    "domain": "sosial_emosional",
    "text": "Menutup mulut untuk menunjukkan sudah tidak mau makan atau menyusu lagi",
    "example": "Saat sudah kenyang, bayi mengatupkan bibir atau memalingkan wajah dari sendok atau puting.",
    "tip": "Hargai tanda kenyang ini dan jangan memaksa; ini bagian dari belajar mengenali lapar dan kenyang."
   },
   {
    "id": "m06-motorik_kasar-1",
    "domain": "motorik_kasar",
    "text": "Berguling dari tengkurap ke telentang",
    "example": "Saat ditengkurapkan, bayi bisa membalikkan badan sendiri menjadi telentang.",
    "tip": "Beri waktu bermain di lantai beralas yang aman dan jangan tinggalkan bayi sendirian di kasur yang tinggi."
   },
   {
    "id": "m06-motorik_kasar-2",
    "domain": "motorik_kasar",
    "text": "Menopang badan dengan lengan lurus saat tengkurap",
    "example": "Saat tengkurap, bayi mengangkat dadanya tinggi dengan kedua lengan lurus.",
    "tip": "Lanjutkan tummy time dan letakkan mainan menarik di depannya."
   },
   {
    "id": "m06-motorik_kasar-3",
    "domain": "motorik_kasar",
    "text": "Bertumpu pada tangan untuk menyangga badan saat didudukkan",
    "example": "Saat didudukkan, bayi menopang badannya dengan kedua tangan di depan.",
    "tip": "Latih duduk dengan bantuan di lantai, dengan bantal di sekelilingnya untuk berjaga-jaga."
   }
  ],
  "actEarly": [
   "Tidak tertawa atau memekik",
   "Tidak berusaha meraih mainan",
   "Belum bisa berguling dari tengkurap ke telentang",
   "Tidak menunjukkan bahwa ia mengenali orang terdekat"
  ]
 },
 {
  "ageMonths": 9,
  "label": "9 bulan",
  "items": [
   {
    "id": "m09-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Malu, menempel, atau takut pada orang yang belum dikenal",
    "example": "Saat ada tamu baru, bayi memeluk erat Bunda atau menangis saat hendak digendong orang lain.",
    "tip": "Beri waktu bayi mengamati orang baru dari pelukan Ayah Bunda; jangan dipaksa langsung digendong."
   },
   {
    "id": "m09-sosial_emosional-2",
    "domain": "sosial_emosional",
    "text": "Menunjukkan beragam ekspresi wajah, seperti senang, sedih, marah, dan terkejut",
    "example": "Bayi cemberut saat mainannya diambil dan tampak terkejut saat mendengar suara baru.",
    "tip": "Beri nama emosi yang ditunjukkan bayi, misalnya 'Adik kaget, ya?'"
   },
   {
    "id": "m09-sosial_emosional-3",
    "domain": "sosial_emosional",
    "text": "Menoleh saat namanya dipanggil",
    "example": "Saat Bunda memanggil 'Adik!' dari samping, bayi menoleh ke arah Bunda.",
    "tip": "Panggil nama bayi secara konsisten dan beri senyuman saat ia menoleh."
   },
   {
    "id": "m09-sosial_emosional-4",
    "domain": "sosial_emosional",
    "text": "Bereaksi saat Ayah Bunda pergi (melihat, meraih, atau menangis)",
    "example": "Saat Bunda keluar kamar, bayi melihat ke arah pintu, mengulurkan tangan, atau menangis.",
    "tip": "Biasakan pamit singkat dan hangat, lalu kembali sesuai janji, agar bayi belajar percaya."
   },
   {
    "id": "m09-sosial_emosional-5",
    "domain": "sosial_emosional",
    "text": "Tersenyum atau tertawa saat diajak main cilukba",
    "example": "Saat Ayah menutup wajah lalu membukanya sambil berkata 'Ba!', bayi tertawa.",
    "tip": "Main cilukba setiap hari dengan variasi, misalnya bersembunyi di balik kain."
   },
   {
    "id": "m09-bahasa-1",
    "domain": "bahasa",
    "text": "Mengoceh dengan berbagai bunyi seperti 'mamama' dan 'bababa'",
    "example": "Bayi mengulang suku kata seperti 'bababa' atau 'dadada' saat bermain sendiri maupun saat diajak bicara.",
    "tip": "Tirukan ocehan bayi lalu tambahkan bunyi atau kata baru, misalnya 'Ba... bola!'"
   },
   {
    "id": "m09-bahasa-2",
    "domain": "bahasa",
    "text": "Mengangkat kedua tangan minta digendong",
    "example": "Saat melihat Ayah, bayi mengangkat kedua tangannya ke atas tanda ingin digendong.",
    "tip": "Saat ia mengangkat tangan, katakan 'Mau gendong? Ayo gendong!' sebelum menggendongnya."
   },
   {
    "id": "m09-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Mencari benda yang jatuh dari pandangannya",
    "example": "Saat sendok jatuh dari kursi makan, bayi melongok ke bawah mencarinya.",
    "tip": "Main menjatuhkan bola lalu bertanya 'Mana bolanya?' dan bantu ia mencarinya."
   },
   {
    "id": "m09-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Memukul-mukulkan dua benda",
    "example": "Bayi memegang dua balok atau dua gelas plastik di masing-masing tangan lalu membenturkannya.",
    "tip": "Berikan dua mainan aman yang berbunyi saat dibenturkan, seperti gelas plastik."
   },
   {
    "id": "m09-motorik_kasar-1",
    "domain": "motorik_kasar",
    "text": "Bangun ke posisi duduk sendiri",
    "example": "Dari posisi tengkurap atau berbaring, bayi mendorong badannya sampai duduk tanpa dibantu.",
    "tip": "Beri banyak waktu bermain di lantai agar bayi bebas berlatih berganti posisi."
   },
   {
    "id": "m09-motorik_halus-3",
    "domain": "motorik_halus",
    "text": "Memindahkan benda dari satu tangan ke tangan lain",
    "example": "Bayi memegang kerincingan di tangan kanan lalu memindahkannya ke tangan kiri.",
    "tip": "Sodorkan mainan ke tangan yang sedang memegang benda lain agar ia belajar memindahkan."
   },
   {
    "id": "m09-motorik_halus-4",
    "domain": "motorik_halus",
    "text": "Menggunakan jari untuk 'menyapu' makanan ke arahnya",
    "example": "Bayi menarik potongan makanan kecil di meja dengan gerakan jari seperti menggaruk.",
    "tip": "Sediakan potongan makanan lunak sesuai usia di piringnya dan biarkan ia mencoba mengambil sendiri, selalu dengan pengawasan."
   },
   {
    "id": "m09-motorik_kasar-2",
    "domain": "motorik_kasar",
    "text": "Duduk tanpa disangga",
    "example": "Bayi bisa duduk sendiri di lantai sambil bermain tanpa dipegangi.",
    "tip": "Letakkan mainan di sekitar bayi saat duduk agar ia belajar menjaga keseimbangan sambil meraih."
   }
  ],
  "actEarly": [
   "Tidak menoleh saat namanya dipanggil",
   "Belum mengoceh dengan suku kata seperti 'bababa' atau 'mamama'",
   "Belum bisa duduk tanpa disangga",
   "Tidak mencari benda yang jatuh dari pandangannya"
  ]
 },
 {
  "ageMonths": 12,
  "label": "12 bulan (1 tahun)",
  "items": [
   {
    "id": "m12-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Ikut bermain permainan bersama, seperti tepuk tangan 'Pok Ame-Ame'",
    "example": "Saat Bunda bernyanyi 'Pok Ame-Ame', bayi ikut bertepuk tangan.",
    "tip": "Nyanyikan lagu anak sambil bertepuk dan biarkan ia ikut menirukan."
   },
   {
    "id": "m12-bahasa-1",
    "domain": "bahasa",
    "text": "Melambaikan tangan 'dadah'",
    "example": "Saat Ayah berangkat kerja dan berkata 'Dadah!', bayi melambaikan tangannya.",
    "tip": "Ucapkan 'dadah' sambil melambai setiap kali ada yang pergi."
   },
   {
    "id": "m12-bahasa-2",
    "domain": "bahasa",
    "text": "Memanggil Ayah atau Bunda dengan 'mama', 'papa', atau sebutan khusus lainnya",
    "example": "Bayi berkata 'mama' sambil melihat ke arah Bunda, tidak sekadar mengoceh.",
    "tip": "Sebut diri Ayah Bunda dengan nama panggilan yang sama setiap hari, misalnya 'Bunda di sini.'"
   },
   {
    "id": "m12-bahasa-3",
    "domain": "bahasa",
    "text": "Memahami kata 'jangan' (berhenti sejenak saat dilarang)",
    "example": "Saat hendak meraih colokan listrik dan Bunda berkata 'Jangan!', bayi berhenti dan menoleh.",
    "tip": "Gunakan kata 'jangan' secukupnya dengan nada tegas tetapi tenang, lalu alihkan ke kegiatan lain."
   },
   {
    "id": "m12-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Memasukkan benda ke dalam wadah, seperti balok ke dalam gelas",
    "example": "Bayi memasukkan mainan kecil ke dalam ember atau gelas plastik.",
    "tip": "Main 'masuk-keluar' dengan wadah dan benda yang cukup besar sehingga tidak bisa tertelan."
   },
   {
    "id": "m12-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Mencari benda yang ia lihat disembunyikan, seperti mainan di bawah selimut",
    "example": "Saat Bunda menutupi bola dengan kain di depannya, bayi menyingkap kain untuk menemukan bola.",
    "tip": "Sembunyikan mainan di bawah kain saat ia melihat, lalu ajak ia mencarinya."
   },
   {
    "id": "m12-motorik_kasar-1",
    "domain": "motorik_kasar",
    "text": "Berdiri dengan berpegangan (menarik badan ke posisi berdiri)",
    "example": "Bayi berpegangan pada pinggir sofa atau meja lalu menarik badannya sampai berdiri.",
    "tip": "Pastikan perabot yang dijadikan pegangan kokoh dan tidak mudah terguling."
   },
   {
    "id": "m12-motorik_kasar-2",
    "domain": "motorik_kasar",
    "text": "Berjalan sambil berpegangan pada perabot (merambat)",
    "example": "Bayi melangkah ke samping sambil berpegangan pada sofa atau dinding.",
    "tip": "Susun perabot yang aman berdekatan agar bayi bisa merambat dari satu ke yang lain."
   },
   {
    "id": "m12-motorik_halus-3",
    "domain": "motorik_halus",
    "text": "Minum dari gelas tanpa tutup yang dipegangi Ayah Bunda",
    "example": "Saat Bunda memegang gelas kecil berisi air di bibirnya, bayi menyeruput tanpa banyak tumpah.",
    "tip": "Latih minum dari gelas kecil terbuka berisi sedikit air saat waktu makan."
   },
   {
    "id": "m12-motorik_halus-4",
    "domain": "motorik_halus",
    "text": "Mengambil benda kecil dengan ibu jari dan jari telunjuk (menjimpit)",
    "example": "Bayi mengambil potongan kecil makanan lunak dengan menjepitnya di antara ibu jari dan telunjuk.",
    "tip": "Sediakan potongan makanan kecil yang lunak dan aman, dan selalu awasi saat makan."
   }
  ],
  "actEarly": [
   "Belum memakai isyarat seperti melambai atau menunjuk",
   "Belum mengoceh dengan suku kata",
   "Belum bisa berdiri dengan berpegangan",
   "Tidak berhenti sejenak saat dilarang 'jangan'"
  ]
 },
 {
  "ageMonths": 15,
  "label": "15 bulan",
  "items": [
   {
    "id": "m15-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Meniru anak lain saat bermain",
    "example": "Melihat kakaknya mengeluarkan mainan dari kotak, anak ikut mengeluarkan mainan juga.",
    "tip": "Beri kesempatan bermain di dekat anak lain, misalnya saudara atau teman di posyandu."
   },
   {
    "id": "m15-sosial_emosional-2",
    "domain": "sosial_emosional",
    "text": "Memperlihatkan benda yang ia sukai kepada Ayah Bunda",
    "example": "Anak membawa boneka kesayangannya dan menyodorkannya ke Bunda sambil melihat wajah Bunda.",
    "tip": "Tanggapi dengan antusias, misalnya 'Wah, bonekanya lucu!', dan sebut nama bendanya."
   },
   {
    "id": "m15-sosial_emosional-3",
    "domain": "sosial_emosional",
    "text": "Bertepuk tangan saat senang",
    "example": "Saat menara baloknya berhasil berdiri atau mendengar lagu kesukaannya, anak bertepuk tangan.",
    "tip": "Rayakan keberhasilan kecil bersama dengan tepuk tangan dan pujian."
   },
   {
    "id": "m15-sosial_emosional-4",
    "domain": "sosial_emosional",
    "text": "Memeluk boneka atau mainan lain",
    "example": "Anak memeluk boneka kesayangannya seolah sedang menyayanginya.",
    "tip": "Contohkan memeluk dan 'menyayangi' boneka sambil berkata 'Sayang boneka.'"
   },
   {
    "id": "m15-sosial_emosional-5",
    "domain": "sosial_emosional",
    "text": "Menunjukkan kasih sayang (memeluk, bermanja, atau mencium)",
    "example": "Anak tiba-tiba memeluk atau mencium pipi Ayah.",
    "tip": "Balas pelukan dan ciumannya, lalu ucapkan 'Ayah sayang Adik.'"
   },
   {
    "id": "m15-bahasa-1",
    "domain": "bahasa",
    "text": "Mencoba mengucapkan satu atau dua kata selain 'mama' atau 'papa'",
    "example": "Anak mengucapkan 'cu' untuk susu atau 'ba' untuk bola secara konsisten setiap kali melihat bendanya.",
    "tip": "Ulangi kata yang benar dengan jelas tanpa meniru versi cadelnya: anak berkata 'cu', Bunda menjawab 'Susu, ya. Adik mau susu.'"
   },
   {
    "id": "m15-bahasa-2",
    "domain": "bahasa",
    "text": "Melihat ke benda yang dikenalnya saat namanya disebut",
    "example": "Saat Bunda bertanya 'Mana kipas?', anak melihat ke arah kipas angin.",
    "tip": "Sebut nama benda di sekitar rumah sambil menunjuknya dalam kegiatan sehari-hari."
   },
   {
    "id": "m15-bahasa-3",
    "domain": "bahasa",
    "text": "Mengikuti perintah yang disertai isyarat dan kata-kata",
    "example": "Saat Ayah menadahkan tangan sambil berkata 'Kasih bolanya ke Ayah', anak memberikan bolanya.",
    "tip": "Beri perintah sederhana sambil memberi isyarat tangan, lalu puji saat ia melakukannya."
   },
   {
    "id": "m15-bahasa-4",
    "domain": "bahasa",
    "text": "Menunjuk untuk meminta sesuatu atau minta tolong",
    "example": "Anak menunjuk biskuit di atas lemari sambil melihat Bunda dan bersuara.",
    "tip": "Saat ia menunjuk, sebut nama bendanya ('Oh, mau biskuit?') sebelum memberikannya."
   },
   {
    "id": "m15-sosial_emosional-6",
    "domain": "sosial_emosional",
    "text": "Mencoba memakai benda sesuai fungsinya, seperti telepon, gelas, atau buku",
    "example": "Anak menempelkan telepon mainan ke telinga atau membuka-buka halaman buku.",
    "tip": "Contohkan cara memakai benda sehari-hari dan biarkan ia menirukan."
   },
   {
    "id": "m15-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Menumpuk minimal dua benda kecil, seperti balok",
    "example": "Anak meletakkan satu balok di atas balok lain tanpa jatuh.",
    "tip": "Main menyusun balok atau gelas plastik bersama dan beri pujian saat berhasil."
   },
   {
    "id": "m15-motorik_kasar-1",
    "domain": "motorik_kasar",
    "text": "Melangkah beberapa langkah sendiri",
    "example": "Anak melepaskan pegangan dan berjalan dua sampai tiga langkah ke arah Bunda.",
    "tip": "Berdirilah sedikit menjauh dan ajak ia melangkah ke arah Ayah Bunda dengan tangan terbuka."
   },
   {
    "id": "m15-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Makan sendiri sebagian makanannya dengan jari",
    "example": "Anak mengambil potongan buah atau nasi kepal lalu memasukkannya ke mulut sendiri.",
    "tip": "Sediakan makanan potong yang aman dan biarkan anak makan sendiri meski berantakan."
   }
  ],
  "actEarly": [
   "Belum mencoba mengucapkan kata selain 'mama' atau 'papa'",
   "Tidak menunjuk untuk meminta sesuatu",
   "Belum bisa melangkah sendiri",
   "Tidak pernah memperlihatkan benda yang ia sukai kepada Ayah Bunda"
  ]
 },
 {
  "ageMonths": 18,
  "label": "18 bulan",
  "items": [
   {
    "id": "m18-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Bermain menjauh, tetapi sesekali menoleh memastikan Ayah Bunda ada di dekatnya",
    "example": "Di taman, anak berjalan ke ayunan lalu menoleh ke belakang memastikan Bunda masih terlihat.",
    "tip": "Tetap terlihat dan tersenyum saat ia menoleh, agar ia merasa aman untuk menjelajah."
   },
   {
    "id": "m18-sosial_emosional-2",
    "domain": "sosial_emosional",
    "text": "Menunjuk untuk memperlihatkan sesuatu yang menarik",
    "example": "Anak menunjuk pesawat di langit sambil melihat ke Ayah, seakan berkata 'Lihat!'",
    "tip": "Ikuti arah tunjukannya dan beri komentar, misalnya 'Iya, pesawat! Terbang tinggi.'"
   },
   {
    "id": "m18-sosial_emosional-3",
    "domain": "sosial_emosional",
    "text": "Menyodorkan tangan untuk dicuci",
    "example": "Saat diajak cuci tangan sebelum makan, anak mengulurkan kedua tangannya ke bawah keran.",
    "tip": "Jadikan cuci tangan rutinitas sebelum makan dengan lagu singkat."
   },
   {
    "id": "m18-sosial_emosional-4",
    "domain": "sosial_emosional",
    "text": "Melihat beberapa halaman buku bersama Ayah Bunda",
    "example": "Anak duduk di pangkuan dan memperhatikan gambar di beberapa halaman buku.",
    "tip": "Bacakan buku bergambar setiap hari, cukup beberapa menit, sambil menunjuk gambarnya."
   },
   {
    "id": "m18-sosial_emosional-5",
    "domain": "sosial_emosional",
    "text": "Membantu saat dipakaikan baju, seperti memasukkan tangan ke lengan baju atau mengangkat kaki",
    "example": "Saat dipakaikan celana, anak mengangkat kakinya sendiri.",
    "tip": "Beri waktu dan kesempatan anak ikut membantu saat berpakaian."
   },
   {
    "id": "m18-bahasa-1",
    "domain": "bahasa",
    "text": "Mencoba mengucapkan tiga kata atau lebih selain 'mama' atau 'papa'",
    "example": "Anak memakai beberapa kata secara konsisten untuk hal yang sama, misalnya 'mamam' untuk makan, 'bobo' untuk tidur, dan 'bola'.",
    "tip": "Ulangi dan perluas ucapannya dengan kata yang benar, misalnya 'Mamam? Iya, kita makan nasi.'"
   },
   {
    "id": "m18-bahasa-2",
    "domain": "bahasa",
    "text": "Mengikuti perintah satu langkah tanpa isyarat",
    "example": "Saat Bunda berkata 'Ambil sepatumu' tanpa menunjuk, anak mengambil sepatunya.",
    "tip": "Beri perintah sederhana dengan kata-kata saja, lalu bantu dengan isyarat bila ia belum paham."
   },
   {
    "id": "m18-sosial_emosional-6",
    "domain": "sosial_emosional",
    "text": "Menirukan pekerjaan rumah, seperti menyapu",
    "example": "Anak mengambil sapu dan bergaya menyapu lantai seperti Bunda.",
    "tip": "Libatkan anak dalam pekerjaan rumah sederhana, misalnya mengelap meja dengan lap kecil."
   },
   {
    "id": "m18-sosial_emosional-7",
    "domain": "sosial_emosional",
    "text": "Bermain mainan dengan cara sederhana yang sesuai, seperti mendorong mobil-mobilan",
    "example": "Anak mendorong mobil-mobilan di lantai sambil bersuara 'brum brum'.",
    "tip": "Bermain bersama di lantai, contohkan cara bermain, lalu ikuti ide anak."
   },
   {
    "id": "m18-motorik_kasar-1",
    "domain": "motorik_kasar",
    "text": "Berjalan tanpa berpegangan",
    "example": "Anak berjalan sendiri di dalam rumah tanpa memegang tangan orang atau perabot.",
    "tip": "Beri ruang yang aman untuk berjalan dan bermain di luar, seperti halaman atau taman."
   },
   {
    "id": "m18-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Mencoret-coret",
    "example": "Anak memegang krayon dan membuat coretan di kertas.",
    "tip": "Sediakan krayon besar dan kertas lebar, lalu ajak mencoret bersama."
   },
   {
    "id": "m18-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Minum dari gelas tanpa tutup, meski kadang tumpah",
    "example": "Anak memegang gelas sendiri dan minum, kadang sedikit tumpah.",
    "tip": "Gunakan gelas kecil berisi sedikit air dan biarkan ia berlatih sendiri."
   },
   {
    "id": "m18-motorik_halus-3",
    "domain": "motorik_halus",
    "text": "Makan sendiri dengan jari",
    "example": "Anak mengambil dan memakan potongan makanan sendiri tanpa disuapi.",
    "tip": "Beri kesempatan makan sendiri di setiap waktu makan."
   },
   {
    "id": "m18-motorik_halus-4",
    "domain": "motorik_halus",
    "text": "Mencoba memakai sendok",
    "example": "Anak menyendok nasi atau bubur dan berusaha memasukkannya ke mulut walau masih tumpah.",
    "tip": "Berikan sendok sendiri untuk anak saat makan, sementara Ayah Bunda membantu menyuapi dengan sendok lain bila perlu."
   },
   {
    "id": "m18-motorik_kasar-2",
    "domain": "motorik_kasar",
    "text": "Naik dan turun dari sofa atau kursi tanpa bantuan",
    "example": "Anak memanjat ke sofa lalu turun sendiri dengan posisi mundur.",
    "tip": "Ajarkan cara turun yang aman (kaki lebih dulu) dan selalu awasi."
   }
  ],
  "actEarly": [
   "Belum ada kata bermakna (seharusnya sudah ada sejak sekitar 16 bulan)",
   "Tidak menunjuk untuk memperlihatkan sesuatu yang menarik",
   "Belum bisa berjalan sendiri",
   "Tidak mengikuti perintah sederhana tanpa isyarat"
  ]
 },
 {
  "ageMonths": 24,
  "label": "24 bulan (2 tahun)",
  "items": [
   {
    "id": "m24-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Menyadari saat orang lain terluka atau sedih",
    "example": "Saat temannya menangis, anak berhenti bermain dan memperhatikan dengan wajah sedih.",
    "tip": "Beri nama perasaan orang lain, misalnya 'Kakak sedih karena jatuh. Yuk, kita peluk.'"
   },
   {
    "id": "m24-sosial_emosional-2",
    "domain": "sosial_emosional",
    "text": "Melihat wajah Ayah Bunda untuk menentukan reaksi dalam situasi baru",
    "example": "Saat bertemu kucing untuk pertama kali, anak melihat wajah Bunda dulu sebelum mendekat.",
    "tip": "Tunjukkan ekspresi tenang dan beri penjelasan singkat dalam situasi baru."
   },
   {
    "id": "m24-bahasa-1",
    "domain": "bahasa",
    "text": "Menunjuk gambar di buku saat ditanya, misalnya 'Mana kucing?'",
    "example": "Saat membaca buku hewan dan Bunda bertanya 'Mana kucing?', anak menunjuk gambar kucing.",
    "tip": "Bacakan buku bergambar dan ajukan pertanyaan 'Mana...?' secara bergantian."
   },
   {
    "id": "m24-bahasa-2",
    "domain": "bahasa",
    "text": "Menggabungkan minimal dua kata, seperti 'mau susu'",
    "example": "Anak berkata 'mau susu' atau 'Ayah pergi' dengan kata-katanya sendiri, bukan sekadar menirukan.",
    "tip": "Perluas ucapan anak satu kata: anak berkata 'mobil', Ayah menjawab 'Mobil merah.'"
   },
   {
    "id": "m24-bahasa-3",
    "domain": "bahasa",
    "text": "Menunjuk minimal dua bagian tubuh saat diminta",
    "example": "Saat ditanya 'Mana hidung?', anak menunjuk hidungnya.",
    "tip": "Nyanyikan 'Kepala Pundak Lutut Kaki' sambil menyentuh bagian tubuh."
   },
   {
    "id": "m24-bahasa-4",
    "domain": "bahasa",
    "text": "Memakai isyarat lain selain melambai dan menunjuk, seperti cium jauh atau mengangguk",
    "example": "Anak mengangguk saat ditawari makanan yang ia mau atau memberi cium jauh saat berpisah.",
    "tip": "Pakai isyarat bersama kata-kata dalam keseharian, seperti mengangguk saat berkata 'iya'."
   },
   {
    "id": "m24-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Memegang benda dengan satu tangan sambil tangan lain melakukan sesuatu",
    "example": "Anak memegang botol dengan satu tangan dan membuka tutupnya dengan tangan yang lain.",
    "tip": "Berikan wadah bertutup yang mudah dibuka berisi mainan yang aman."
   },
   {
    "id": "m24-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Mencoba memakai tombol, kenop, atau sakelar pada mainan",
    "example": "Anak menekan tombol mainan yang berbunyi atau memutar kenop mainan.",
    "tip": "Pilih mainan sebab-akibat yang aman, tunjukkan caranya sekali, lalu biarkan ia mencoba."
   },
   {
    "id": "m24-sosial_emosional-3",
    "domain": "sosial_emosional",
    "text": "Bermain dengan lebih dari satu mainan sekaligus, seperti menaruh makanan mainan di piring mainan",
    "example": "Anak meletakkan buah mainan di piring lalu menyodorkannya ke boneka.",
    "tip": "Sediakan set mainan sederhana seperti masak-masakan dan ikut bermain."
   },
   {
    "id": "m24-motorik_kasar-1",
    "domain": "motorik_kasar",
    "text": "Menendang bola",
    "example": "Anak menendang bola ke depan tanpa jatuh.",
    "tip": "Main tendang bola bersama di halaman atau lapangan."
   },
   {
    "id": "m24-motorik_kasar-2",
    "domain": "motorik_kasar",
    "text": "Berlari",
    "example": "Anak berlari kecil saat bermain kejar-kejaran.",
    "tip": "Ajak bermain kejar-kejaran di tempat yang aman setiap hari."
   },
   {
    "id": "m24-motorik_kasar-3",
    "domain": "motorik_kasar",
    "text": "Naik beberapa anak tangga dengan berjalan (bukan merangkak), dengan atau tanpa bantuan",
    "example": "Anak menaiki tangga sambil berpegangan pada pegangan tangga atau tangan Bunda.",
    "tip": "Latih naik tangga sambil memegang tangannya, dan pasang pagar pengaman di tangga rumah."
   },
   {
    "id": "m24-motorik_halus-3",
    "domain": "motorik_halus",
    "text": "Makan dengan sendok",
    "example": "Anak menyendok makanan dan memasukkannya ke mulut walau kadang tumpah.",
    "tip": "Biarkan anak makan sendiri dengan sendok di setiap waktu makan."
   }
  ],
  "actEarly": [
   "Belum menggabungkan dua kata secara spontan, bukan menirukan",
   "Tidak menunjuk gambar atau bagian tubuh saat diminta",
   "Belum bisa berlari atau menendang bola",
   "Tidak menyadari saat orang lain sedih atau terluka"
  ]
 },
 {
  "ageMonths": 30,
  "label": "30 bulan",
  "items": [
   {
    "id": "m30-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Bermain di dekat anak lain dan kadang bermain bersama",
    "example": "Di taman bermain, anak bermain pasir di samping anak lain dan sesekali berbagi sekop.",
    "tip": "Atur waktu bermain bersama anak sebaya secara rutin."
   },
   {
    "id": "m30-sosial_emosional-2",
    "domain": "sosial_emosional",
    "text": "Memamerkan kemampuannya dengan berkata 'Lihat aku!'",
    "example": "Anak berseru 'Bunda, lihat!' sebelum melompat dari anak tangga paling bawah.",
    "tip": "Beri perhatian dan pujian yang spesifik, misalnya 'Wah, kamu melompat dengan dua kaki!'"
   },
   {
    "id": "m30-sosial_emosional-3",
    "domain": "sosial_emosional",
    "text": "Mengikuti rutinitas sederhana saat diminta, seperti membereskan mainan",
    "example": "Saat Bunda berkata 'Waktunya beres-beres', anak ikut memasukkan mainan ke keranjang.",
    "tip": "Buat rutinitas harian yang sama dan beri penanda, misalnya lagu beres-beres."
   },
   {
    "id": "m30-bahasa-1",
    "domain": "bahasa",
    "text": "Mengucapkan sekitar 50 kata",
    "example": "Anak sudah memakai banyak kata untuk benda, orang, dan kegiatan, misalnya 'mobil', 'makan', 'Nenek', 'mandi'.",
    "tip": "Catat kata-kata yang diucapkan anak selama seminggu untuk melihat perkembangannya."
   },
   {
    "id": "m30-bahasa-2",
    "domain": "bahasa",
    "text": "Menggabungkan dua kata atau lebih dengan satu kata kerja, seperti 'kucing lari'",
    "example": "Anak berkata 'Adik makan' atau 'mobil jalan'.",
    "tip": "Ceritakan kegiatan yang sedang terjadi dengan kalimat pendek yang berisi kata kerja."
   },
   {
    "id": "m30-bahasa-3",
    "domain": "bahasa",
    "text": "Menyebut nama benda di buku saat ditunjuk dan ditanya 'Ini apa?'",
    "example": "Bunda menunjuk gambar dan bertanya 'Ini apa?', anak menjawab 'Bebek!'",
    "tip": "Saat membaca, berhenti di sebuah gambar dan beri kesempatan anak menyebut namanya."
   },
   {
    "id": "m30-bahasa-4",
    "domain": "bahasa",
    "text": "Memakai kata seperti 'aku', 'saya', atau 'kita'",
    "example": "Anak berkata 'Aku mau' atau 'Kita main' alih-alih hanya menyebut namanya sendiri.",
    "tip": "Contohkan kata ganti dalam kalimat sehari-hari, misalnya 'Aku ambil gelas, ya.'"
   },
   {
    "id": "m30-sosial_emosional-4",
    "domain": "sosial_emosional",
    "text": "Memakai benda untuk bermain pura-pura, seperti menyuapkan balok ke boneka seolah makanan",
    "example": "Anak menyuapkan balok ke boneka sambil berkata 'Aaam, makan.'",
    "tip": "Ikut bermain pura-pura dan beri ide baru, misalnya 'Bonekanya haus, yuk kasih minum.'"
   },
   {
    "id": "m30-sosial_emosional-5",
    "domain": "sosial_emosional",
    "text": "Menunjukkan cara memecahkan masalah sederhana, seperti naik ke bangku kecil untuk meraih sesuatu",
    "example": "Anak menarik bangku kecil ke dekat meja untuk mengambil mainan di atasnya.",
    "tip": "Beri kesempatan anak mencari cara sendiri sebelum dibantu, dengan tetap menjaga keamanan."
   },
   {
    "id": "m30-bahasa-5",
    "domain": "bahasa",
    "text": "Mengikuti perintah dua langkah",
    "example": "Saat diminta 'Taruh mainannya, lalu tutup pintu', anak melakukan keduanya.",
    "tip": "Beri instruksi dua langkah dalam kegiatan sehari-hari dan bantu bila ia lupa langkah kedua."
   },
   {
    "id": "m30-bahasa-6",
    "domain": "bahasa",
    "text": "Menunjukkan bahwa ia mengenal minimal satu warna",
    "example": "Saat ditanya 'Mana yang merah?', anak menunjuk krayon merah.",
    "tip": "Sebut warna benda dalam keseharian, misalnya 'Bajumu biru.'"
   },
   {
    "id": "m30-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Memutar benda dengan tangan, seperti gagang pintu atau tutup botol",
    "example": "Anak memutar tutup botol minumnya sampai terbuka.",
    "tip": "Beri botol plastik bertutup ulir untuk dimainkan buka dan tutup."
   },
   {
    "id": "m30-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Melepas sebagian pakaian sendiri, seperti celana longgar atau jaket terbuka",
    "example": "Sebelum mandi, anak menurunkan dan melepas celananya sendiri.",
    "tip": "Pilih pakaian longgar dan beri waktu anak mencoba melepasnya sendiri."
   },
   {
    "id": "m30-motorik_kasar-1",
    "domain": "motorik_kasar",
    "text": "Melompat dengan kedua kaki terangkat dari lantai",
    "example": "Anak melompat di tempat dengan dua kaki bersamaan.",
    "tip": "Main lompat-lompatan seperti kodok bersama anak."
   },
   {
    "id": "m30-motorik_halus-3",
    "domain": "motorik_halus",
    "text": "Membalik halaman buku satu per satu saat dibacakan",
    "example": "Saat dibacakan buku, anak membalik halaman berikutnya sendiri satu per satu.",
    "tip": "Biarkan anak yang membalik halaman saat membaca bersama."
   }
  ],
  "actEarly": [
   "Kosakata masih sangat sedikit, jauh di bawah sekitar 50 kata",
   "Belum bermain pura-pura",
   "Belum bisa mengikuti perintah dua langkah",
   "Belum bisa melompat dengan dua kaki"
  ]
 },
 {
  "ageMonths": 36,
  "label": "36 bulan (3 tahun)",
  "items": [
   {
    "id": "m36-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Tenang dalam 10 menit setelah ditinggal, misalnya saat diantar ke tempat penitipan atau PAUD",
    "example": "Setelah Bunda pamit di PAUD, anak sempat menangis tetapi kemudian mau bermain dalam waktu kurang dari 10 menit.",
    "tip": "Pamit dengan singkat dan konsisten; jangan pergi diam-diam."
   },
   {
    "id": "m36-sosial_emosional-2",
    "domain": "sosial_emosional",
    "text": "Memperhatikan anak lain dan ikut bergabung bermain",
    "example": "Melihat anak lain bermain bola, anak mendekat dan ikut bermain.",
    "tip": "Beri kesempatan bermain dengan anak lain dan bantu memulai, misalnya 'Boleh ikut main?'"
   },
   {
    "id": "m36-bahasa-1",
    "domain": "bahasa",
    "text": "Bercakap-cakap dengan minimal dua kali saling menanggapi",
    "example": "Bunda: 'Tadi main apa?' Anak: 'Main bola.' Bunda: 'Sama siapa?' Anak: 'Sama Kakak.'",
    "tip": "Ajak mengobrol tentang hal yang anak minati dan beri waktu ia menjawab."
   },
   {
    "id": "m36-bahasa-2",
    "domain": "bahasa",
    "text": "Mengajukan pertanyaan 'siapa', 'apa', 'di mana', atau 'kenapa'",
    "example": "Anak bertanya 'Ayah di mana?' atau 'Itu apa?'",
    "tip": "Jawab pertanyaannya dengan sabar dan sederhana, lalu balik bertanya."
   },
   {
    "id": "m36-bahasa-3",
    "domain": "bahasa",
    "text": "Menyebutkan kegiatan yang terjadi di gambar saat ditanya",
    "example": "Saat ditanya 'Anak itu sedang apa?', anak menjawab 'Lari' atau 'Makan'.",
    "tip": "Saat membaca, tanyakan 'Dia sedang apa?' pada setiap gambar."
   },
   {
    "id": "m36-bahasa-4",
    "domain": "bahasa",
    "text": "Menyebutkan nama panggilannya saat ditanya",
    "example": "Saat ditanya 'Namamu siapa?', anak menjawab dengan nama panggilannya.",
    "tip": "Latih anak menyebut namanya dalam permainan berkenalan dengan boneka."
   },
   {
    "id": "m36-bahasa-5",
    "domain": "bahasa",
    "text": "Bicaranya cukup jelas sehingga sebagian besar dapat dimengerti orang lain",
    "example": "Tetangga atau guru PAUD bisa memahami sebagian besar ucapan anak tanpa perlu diterjemahkan Bunda.",
    "tip": "Ulangi ucapan anak dengan pelafalan yang benar tanpa menyuruhnya mengulang."
   },
   {
    "id": "m36-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Menggambar lingkaran setelah dicontohkan",
    "example": "Setelah Bunda menggambar lingkaran, anak bisa membuat bentuk bulat yang tertutup.",
    "tip": "Main menggambar bersama dengan krayon atau kapur di lantai."
   },
   {
    "id": "m36-sosial_emosional-3",
    "domain": "sosial_emosional",
    "text": "Menghindari benda panas setelah diperingatkan",
    "example": "Saat Bunda berkata 'Awas, panas!', anak menjauhkan tangannya dari panci atau setrika.",
    "tip": "Jelaskan bahaya dengan kalimat singkat dan konsisten, dan tetap jauhkan benda panas dari jangkauan."
   },
   {
    "id": "m36-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Meronce benda, seperti manik-manik besar atau makaroni",
    "example": "Anak memasukkan tali ke lubang manik-manik besar satu per satu.",
    "tip": "Sediakan manik-manik besar dan tali berujung kaku untuk meronce."
   },
   {
    "id": "m36-motorik_halus-3",
    "domain": "motorik_halus",
    "text": "Memakai sebagian pakaian sendiri, seperti celana longgar atau jaket",
    "example": "Anak memakai celana berkaret sendiri, walau mungkin masih terbalik.",
    "tip": "Puji usahanya, bukan hasil sempurnanya, dan siapkan pakaian yang mudah dipakai."
   },
   {
    "id": "m36-motorik_halus-4",
    "domain": "motorik_halus",
    "text": "Menggunakan garpu",
    "example": "Anak menusuk potongan buah atau lauk dengan garpu lalu memakannya.",
    "tip": "Sediakan garpu anak yang tumpul dan makanan yang mudah ditusuk."
   }
  ],
  "actEarly": [
   "Bicaranya sebagian besar belum dimengerti orang lain",
   "Belum bisa bercakap-cakap bergantian minimal dua kali",
   "Tidak tertarik bergabung bermain dengan anak lain",
   "Sangat sulit tenang setelah ditinggal (lebih dari 10 menit) hampir setiap kali"
  ]
 },
 {
  "ageMonths": 48,
  "label": "48 bulan (4 tahun)",
  "items": [
   {
    "id": "m48-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Berpura-pura menjadi tokoh lain saat bermain (guru, pahlawan super, kucing)",
    "example": "Anak berperan sebagai guru dan 'mengajar' boneka-bonekanya.",
    "tip": "Sediakan kain, topi, atau kardus bekas untuk bermain peran."
   },
   {
    "id": "m48-sosial_emosional-2",
    "domain": "sosial_emosional",
    "text": "Minta bermain dengan anak lain bila tidak ada teman di sekitarnya",
    "example": "Anak bertanya 'Boleh main sama Rafi?'",
    "tip": "Jadwalkan waktu bermain dengan teman atau sepupu secara rutin."
   },
   {
    "id": "m48-sosial_emosional-3",
    "domain": "sosial_emosional",
    "text": "Menghibur orang lain yang terluka atau sedih",
    "example": "Anak memeluk temannya yang menangis atau meminjamkan mainannya.",
    "tip": "Puji perilaku peduli dan ceritakan bagaimana temannya jadi merasa lebih baik."
   },
   {
    "id": "m48-sosial_emosional-4",
    "domain": "sosial_emosional",
    "text": "Menghindari bahaya, seperti tidak melompat dari tempat tinggi di taman bermain",
    "example": "Anak memilih turun lewat tangga perosotan daripada melompat dari atas.",
    "tip": "Diskusikan aturan keselamatan sederhana sebelum bermain."
   },
   {
    "id": "m48-sosial_emosional-5",
    "domain": "sosial_emosional",
    "text": "Senang membantu (menjadi 'asisten kecil')",
    "example": "Anak menawarkan diri membawa belanjaan ringan atau menata piring.",
    "tip": "Beri tugas kecil yang bisa ia selesaikan dan ucapkan terima kasih."
   },
   {
    "id": "m48-sosial_emosional-6",
    "domain": "sosial_emosional",
    "text": "Menyesuaikan perilaku dengan tempat (tempat ibadah, perpustakaan, taman bermain)",
    "example": "Anak lebih tenang dan berbicara pelan di tempat ibadah, tetapi bebas berlari di taman.",
    "tip": "Jelaskan aturan setiap tempat sebelum datang, misalnya 'Di tempat ibadah kita bicara pelan, ya.'"
   },
   {
    "id": "m48-bahasa-1",
    "domain": "bahasa",
    "text": "Berbicara dengan kalimat empat kata atau lebih",
    "example": "Anak berkata 'Aku mau main sepeda di luar.'",
    "tip": "Ajak anak bercerita dan perluas kalimatnya dengan detail baru."
   },
   {
    "id": "m48-bahasa-2",
    "domain": "bahasa",
    "text": "Mengucapkan sebagian kata dari lagu, cerita, atau sajak anak",
    "example": "Anak ikut menyanyikan 'Balonku Ada Lima' atau melanjutkan kalimat dari cerita yang sering dibacakan.",
    "tip": "Nyanyikan lagu anak berulang-ulang dan berhenti sebelum kata terakhir agar anak melengkapi."
   },
   {
    "id": "m48-bahasa-3",
    "domain": "bahasa",
    "text": "Menceritakan minimal satu hal yang terjadi hari itu",
    "example": "Sepulang dari PAUD, anak berkata 'Tadi aku main bola.'",
    "tip": "Tanyakan hal yang spesifik, misalnya 'Tadi main apa di sekolah?', bukan hanya 'Bagaimana harimu?'"
   },
   {
    "id": "m48-bahasa-4",
    "domain": "bahasa",
    "text": "Menjawab pertanyaan sederhana tentang fungsi benda",
    "example": "Saat ditanya 'Payung untuk apa?', anak menjawab 'Biar nggak kehujanan.'",
    "tip": "Main tebak fungsi benda di rumah, misalnya 'Sendok untuk apa?'"
   },
   {
    "id": "m48-bahasa-5",
    "domain": "bahasa",
    "text": "Menyebut beberapa warna benda",
    "example": "Anak menyebut 'Bolanya merah, mobilnya kuning.'",
    "tip": "Main mencari benda dengan warna tertentu di rumah."
   },
   {
    "id": "m48-bahasa-6",
    "domain": "bahasa",
    "text": "Menyebutkan kelanjutan cerita yang sudah sering didengar",
    "example": "Saat membaca cerita kesukaannya, anak menebak dengan benar apa yang terjadi di halaman berikutnya.",
    "tip": "Saat membaca buku favorit, berhenti dan tanya 'Habis itu apa, ya?'"
   },
   {
    "id": "m48-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Menggambar orang dengan tiga bagian tubuh atau lebih",
    "example": "Anak menggambar orang dengan kepala, mata, dan kaki.",
    "tip": "Ajak menggambar anggota keluarga dan tanyakan bagian tubuh apa lagi yang bisa ditambahkan."
   },
   {
    "id": "m48-motorik_kasar-1",
    "domain": "motorik_kasar",
    "text": "Menangkap bola besar hampir setiap kali dilempar",
    "example": "Saat bola besar dilempar pelan dari dekat, anak sering berhasil menangkapnya dengan kedua tangan.",
    "tip": "Main lempar tangkap bola besar yang lunak dari jarak dekat."
   },
   {
    "id": "m48-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Mengambil makanan sendiri atau menuang air dengan pengawasan orang dewasa",
    "example": "Anak menuang air dari teko kecil ke gelasnya sendiri.",
    "tip": "Sediakan teko kecil dan biarkan anak menuang sendiri saat makan."
   },
   {
    "id": "m48-motorik_halus-3",
    "domain": "motorik_halus",
    "text": "Membuka beberapa kancing",
    "example": "Anak membuka kancing baju yang besar saat akan mandi.",
    "tip": "Latih dengan kancing besar pada baju atau papan latihan kancing."
   },
   {
    "id": "m48-motorik_halus-4",
    "domain": "motorik_halus",
    "text": "Memegang krayon atau pensil dengan jari dan ibu jari (tidak digenggam)",
    "example": "Anak memegang krayon dengan ujung jari, tidak dengan seluruh kepalan tangan.",
    "tip": "Gunakan krayon pendek atau patahan krayon agar anak terdorong memegang dengan ujung jari."
   }
  ],
  "actEarly": [
   "Belum berbicara dengan kalimat sekitar empat kata",
   "Belum bermain peran atau pura-pura menjadi tokoh lain",
   "Belum bisa menceritakan kejadian hari itu",
   "Masih menggenggam krayon dengan kepalan tangan"
  ]
 },
 {
  "ageMonths": 60,
  "label": "60 bulan (5 tahun)",
  "items": [
   {
    "id": "m60-sosial_emosional-1",
    "domain": "sosial_emosional",
    "text": "Mengikuti aturan atau bergiliran saat bermain bersama anak lain",
    "example": "Saat bermain ular tangga atau petak umpet, anak mau menunggu gilirannya.",
    "tip": "Main permainan bergiliran yang sederhana di rumah, seperti ular tangga."
   },
   {
    "id": "m60-sosial_emosional-2",
    "domain": "sosial_emosional",
    "text": "Bernyanyi, menari, atau berakting di depan Ayah Bunda",
    "example": "Anak menyanyikan lagu dari sekolah sambil menari di ruang keluarga.",
    "tip": "Jadilah penonton yang antusias dan beri tepuk tangan."
   },
   {
    "id": "m60-sosial_emosional-3",
    "domain": "sosial_emosional",
    "text": "Mengerjakan tugas rumah sederhana, seperti memasangkan kaus kaki atau membereskan piring",
    "example": "Setelah makan, anak membawa piringnya ke tempat cuci piring.",
    "tip": "Beri tugas rumah rutin yang sesuai usianya dan hargai usahanya."
   },
   {
    "id": "m60-bahasa-1",
    "domain": "bahasa",
    "text": "Menceritakan cerita yang ia dengar atau karang sendiri dengan minimal dua kejadian",
    "example": "Anak bercerita: 'Kucingnya naik pohon, terus nggak bisa turun, terus ditolong pemadam kebakaran.'",
    "tip": "Minta anak menceritakan ulang cerita sebelum tidur."
   },
   {
    "id": "m60-bahasa-2",
    "domain": "bahasa",
    "text": "Menjawab pertanyaan sederhana tentang buku atau cerita setelah dibacakan",
    "example": "Setelah membaca cerita, Bunda bertanya 'Kenapa kelincinya sedih?' dan anak bisa menjawab.",
    "tip": "Ajukan pertanyaan 'siapa', 'apa', dan 'kenapa' setelah membaca bersama."
   },
   {
    "id": "m60-bahasa-3",
    "domain": "bahasa",
    "text": "Melanjutkan percakapan lebih dari tiga kali saling menanggapi",
    "example": "Anak dan Ayah mengobrol tentang hewan di kebun binatang dengan saling bertanya dan menjawab beberapa kali.",
    "tip": "Saat makan bersama, ajak mengobrol tanpa gawai dan beri anak kesempatan bicara."
   },
   {
    "id": "m60-bahasa-4",
    "domain": "bahasa",
    "text": "Memakai atau mengenali kata-kata berima sederhana",
    "example": "Anak menyadari bahwa 'topi' dan 'kopi' bunyinya mirip, atau ikut melengkapi pantun anak sederhana.",
    "tip": "Main tebak kata berima, misalnya 'Apa yang bunyinya mirip dengan batu? Satu, paku...'"
   },
   {
    "id": "m60-bahasa-5",
    "domain": "bahasa",
    "text": "Berhitung sampai 10",
    "example": "Anak menyebut angka satu sampai sepuluh secara berurutan.",
    "tip": "Hitung benda sehari-hari bersama, misalnya anak tangga atau buah di piring."
   },
   {
    "id": "m60-bahasa-6",
    "domain": "bahasa",
    "text": "Menyebut beberapa angka antara 1 dan 5 saat ditunjuk",
    "example": "Saat Bunda menunjuk angka 3 di kalender, anak menyebut 'tiga'.",
    "tip": "Tunjukkan angka di sekitar, seperti nomor rumah atau angka di jam."
   },
   {
    "id": "m60-bahasa-7",
    "domain": "bahasa",
    "text": "Memakai kata-kata waktu, seperti 'kemarin', 'besok', 'pagi', atau 'malam'",
    "example": "Anak berkata 'Besok aku mau ke rumah Nenek.'",
    "tip": "Gunakan kata waktu saat membicarakan rencana dan kejadian sehari-hari."
   },
   {
    "id": "m60-sosial_emosional-4",
    "domain": "sosial_emosional",
    "text": "Memusatkan perhatian 5 sampai 10 menit saat beraktivitas (menonton layar tidak dihitung)",
    "example": "Anak bisa menyimak cerita atau mewarnai selama 5 sampai 10 menit tanpa beralih kegiatan.",
    "tip": "Lakukan kegiatan bersama tanpa layar, seperti membaca atau prakarya, dan tambah durasinya perlahan."
   },
   {
    "id": "m60-motorik_halus-1",
    "domain": "motorik_halus",
    "text": "Menulis beberapa huruf dari namanya",
    "example": "Anak menulis beberapa huruf dari namanya walau bentuknya belum rapi.",
    "tip": "Tuliskan nama anak dengan huruf besar dan ajak ia menirunya."
   },
   {
    "id": "m60-bahasa-8",
    "domain": "bahasa",
    "text": "Menyebut beberapa huruf saat ditunjuk",
    "example": "Saat Bunda menunjuk huruf B di buku, anak menyebut 'be'.",
    "tip": "Kenalkan huruf-huruf dari nama anak dan anggota keluarga terlebih dahulu."
   },
   {
    "id": "m60-motorik_halus-2",
    "domain": "motorik_halus",
    "text": "Memasang beberapa kancing",
    "example": "Anak memasang sebagian kancing bajunya sendiri.",
    "tip": "Beri waktu lebih saat berpakaian agar anak bisa berlatih mengancingkan sendiri."
   },
   {
    "id": "m60-motorik_kasar-1",
    "domain": "motorik_kasar",
    "text": "Melompat dengan satu kaki",
    "example": "Anak bisa melompat beberapa kali dengan satu kaki, misalnya saat bermain engklek.",
    "tip": "Ajak bermain engklek atau lompat-lompatan dengan satu kaki."
   }
  ],
  "actEarly": [
   "Belum bisa menceritakan cerita dengan dua kejadian",
   "Sulit mengikuti aturan atau bergiliran saat bermain",
   "Belum bisa memusatkan perhatian 5 menit pada kegiatan tanpa layar",
   "Belum bisa melompat dengan satu kaki"
  ]
 }
];
