import { MilestoneReference, ImmunizationReference, Article, Activity } from '../types';

export const MILESTONES_SEED: MilestoneReference[] = [
  // 0 - 3 Bulan
  {
    id: 'm_03_mk_1',
    domain: 'motorik_kasar',
    ageMonthMin: 0,
    ageMonthMax: 3,
    description: 'Mengangkat kepala setinggi 45 derajat ketika ditengkurapkan.',
  },
  {
    id: 'm_03_mh_1',
    domain: 'motorik_halus',
    ageMonthMin: 0,
    ageMonthMax: 3,
    description: 'Menggerakkan lengan dan kaki secara bersamaan dan aktif, menggenggam mainan yang disentuhkan ke telapak tangan.',
  },
  {
    id: 'm_03_b_1',
    domain: 'bahasa',
    ageMonthMin: 0,
    ageMonthMax: 3,
    description: 'Bereaksi terhadap suara keras dengan terkejut, mengeluarkan suara "ooh" atau "aah" (cooing).',
  },
  {
    id: 'm_03_se_1',
    domain: 'sosial_emosional',
    ageMonthMin: 0,
    ageMonthMax: 3,
    description: 'Tersenyum secara spontan ketika diajak bicara atau melihat wajah orang tua (social smile).'
  },

  // 4 - 6 Bulan
  {
    id: 'm_46_mk_1',
    domain: 'motorik_kasar',
    ageMonthMin: 4,
    ageMonthMax: 6,
    description: 'Tengkurap dan telentang sendiri tanpa bantuan (guling-guling).',
  },
  {
    id: 'm_46_mh_1',
    domain: 'motorik_halus',
    ageMonthMin: 4,
    ageMonthMax: 6,
    description: 'Meraih dan memegang mainan atau benda yang ada di dekatnya.',
  },
  {
    id: 'm_46_b_1',
    domain: 'bahasa',
    ageMonthMin: 4,
    ageMonthMax: 6,
    description: 'Mulai mengoceh suara satu suku kata berulang seperti "ba-ba", "da-da" (babbling).',
  },
  {
    id: 'm_46_se_1',
    domain: 'sosial_emosional',
    ageMonthMin: 4,
    ageMonthMax: 6,
    description: 'Tertawa keras jika diajak bercanda, mengekspresikan rasa senang atau tidak senang.',
  },

  // 7 - 9 Bulan
  {
    id: 'm_79_mk_1',
    domain: 'motorik_kasar',
    ageMonthMin: 7,
    ageMonthMax: 9,
    description: 'Duduk tegak sendiri tanpa disangga punggungnya.',
  },
  {
    id: 'm_79_mh_1',
    domain: 'motorik_halus',
    ageMonthMin: 7,
    ageMonthMax: 9,
    description: 'Memindahkan benda atau mainan dari tangan kanan ke tangan kiri atau sebaliknya.',
  },
  {
    id: 'm_79_b_1',
    domain: 'bahasa',
    ageMonthMin: 7,
    ageMonthMax: 9,
    description: 'Memahami kata "tidak" secara kontekstual, merespons ketika namanya dipanggil.',
  },
  {
    id: 'm_79_se_1',
    domain: 'sosial_emosional',
    ageMonthMin: 7,
    ageMonthMax: 9,
    description: 'Mulai cemas terhadap orang asing (stranger anxiety) dan mencari kenyamanan di dekat ibu.',
  },

  // 10 - 12 Bulan
  {
    id: 'm_1012_mk_1',
    domain: 'motorik_kasar',
    ageMonthMin: 10,
    ageMonthMax: 12,
    description: 'Berdiri tegak dengan berpegangan pada furnitur, melangkah beberapa langkah sambil merambat.',
  },
  {
    id: 'm_1012_mh_1',
    domain: 'motorik_halus',
    ageMonthMin: 10,
    ageMonthMax: 12,
    description: 'Menjepit benda kecil menggunakan ibu jari dan jari telunjuk (pincer grasp).',
  },
  {
    id: 'm_1012_b_1',
    domain: 'bahasa',
    ageMonthMin: 10,
    ageMonthMax: 12,
    description: 'Mengucapkan 1-2 kata bermakna selain "mama" atau "papa" (seperti "mam", "num").',
  },
  {
    id: 'm_1012_se_1',
    domain: 'sosial_emosional',
    ageMonthMin: 10,
    ageMonthMax: 12,
    description: 'Melambaikan tangan ("da-da") atau tos tangan saat diminta, bertepuk tangan (clapping).',
  },

  // 13 - 18 Bulan
  {
    id: 'm_1318_mk_1',
    domain: 'motorik_kasar',
    ageMonthMin: 13,
    ageMonthMax: 18,
    description: 'Berjalan tegak sendiri tanpa disangga atau dipapah.',
  },
  {
    id: 'm_1318_mh_1',
    domain: 'motorik_halus',
    ageMonthMin: 13,
    ageMonthMax: 18,
    description: 'Menumpuk minimal 2 balok kayu kecil ke atas tanpa jatuh, mencoret-coret kertas secara bebas.',
  },
  {
    id: 'm_1318_b_1',
    domain: 'bahasa',
    ageMonthMin: 13,
    ageMonthMax: 18,
    description: 'Menunjuk anggota tubuh atau objek yang ditanyakan oleh orang dewasa, menguasai 6-10 kosakata bermakna.',
  },
  {
    id: 'm_1318_se_1',
    domain: 'sosial_emosional',
    ageMonthMin: 13,
    ageMonthMax: 18,
    description: 'Menunjukkan kasih sayang kepada mainan (memeluk boneka) atau mengajak orang tua bermain bersama.',
  },

  // 19 - 24 Bulan
  {
    id: 'm_1924_mk_1',
    domain: 'motorik_kasar',
    ageMonthMin: 19,
    ageMonthMax: 24,
    description: 'Berlari kencang, menendang bola ke arah depan tanpa jatuh terpeleset.',
  },
  {
    id: 'm_1924_mh_1',
    domain: 'motorik_halus',
    ageMonthMin: 19,
    ageMonthMax: 24,
    description: 'Menyusun menara berisi 4-6 balok kecil, menuangkan air dari wadah ke wadah lain tanpa tumpah banyak.',
  },
  {
    id: 'm_1924_b_1',
    domain: 'bahasa',
    ageMonthMin: 19,
    ageMonthMax: 24,
    description: 'Menggabungkan 2 kata menjadi kalimat sederhana (misal: "mau mimi", "mama bobo", "minta roti").',
  },
  {
    id: 'm_1924_se_1',
    domain: 'sosial_emosional',
    ageMonthMin: 19,
    ageMonthMax: 24,
    description: 'Menolak dengan keras ("enggak mau") saat kesal, mulai menunjukkan sifat kepemilikan mainan ("punyaku").',
  },

  // 2 - 3 Tahun
  {
    id: 'm_2436_mk_1',
    domain: 'motorik_kasar',
    ageMonthMin: 25,
    ageMonthMax: 36,
    description: 'Melompat dengan kedua kaki bersamaan di tempat, menaiki anak tangga sendiri dengan berpegangan.',
  },
  {
    id: 'm_2436_mh_1',
    domain: 'motorik_halus',
    ageMonthMin: 25,
    ageMonthMax: 36,
    description: 'Membuka dan menutup tutup botol berulir, memegang pensil atau krayon di antara jari-jari.',
  },
  {
    id: 'm_2436_b_1',
    domain: 'bahasa',
    ageMonthMin: 25,
    ageMonthMax: 36,
    description: 'Bisa menyebutkan nama lengkapnya jika ditanya, bertanya dengan awalan "apa", "siapa", atau "di mana".',
  },
  {
    id: 'm_2436_se_1',
    domain: 'sosial_emosional',
    ageMonthMin: 25,
    ageMonthMax: 36,
    description: 'Mulai melakukan roleplay (bermain pura-pura memasak, menyuapi boneka), mau berbagi mainan dengan pengawasan.',
  },

  // 3 - 5 Tahun
  {
    id: 'm_3660_mk_1',
    domain: 'motorik_kasar',
    ageMonthMin: 37,
    ageMonthMax: 60,
    description: 'Berdiri satu kaki selama 3-5 detik, menangkap bola besar yang dilemparkan dari jarak 1,5 meter.',
  },
  {
    id: 'm_3660_mh_1',
    domain: 'motorik_halus',
    ageMonthMin: 37,
    ageMonthMax: 60,
    description: 'Menggunting kertas mengikuti garis lurus, menggambar bentuk lingkaran yang cukup beraturan.',
  },
  {
    id: 'm_3660_b_1',
    domain: 'bahasa',
    ageMonthMin: 37,
    ageMonthMax: 60,
    description: 'Bisa merangkai 4-5 kata menjadi cerita runut, memahami konsep preposisi (atas, bawah, dalam, luar).',
  },
  {
    id: 'm_3660_se_1',
    domain: 'sosial_emosional',
    ageMonthMin: 37,
    ageMonthMax: 60,
    description: 'Mandiri mencuci tangan sendiri, memakai pakaian berkancing dengan sedikit bantuan.',
  },

  // 5 - 7 Tahun
  {
    id: 'm_6084_mk_1',
    domain: 'motorik_kasar',
    ageMonthMin: 61,
    ageMonthMax: 84,
    description: 'Bersepeda roda dua, melompat tali secara dinamis, melakukan gerakan engklek satu kaki melompati rintangan.',
  },
  {
    id: 'm_6084_mh_1',
    domain: 'motorik_halus',
    ageMonthMin: 61,
    ageMonthMax: 84,
    description: 'Menulis huruf alfabet dasar dan angka 1-10, menggambar figur manusia yang memiliki 6 bagian tubuh jelas.',
  },
  {
    id: 'm_6084_b_1',
    domain: 'bahasa',
    ageMonthMin: 61,
    ageMonthMax: 84,
    description: 'Mengucapkan kata dengan pelafalan R, S, L yang jelas, memahami lelucon sederhana, bercerita dongeng pendek.',
  },
  {
    id: 'm_6084_se_1',
    domain: 'sosial_emosional',
    ageMonthMin: 61,
    ageMonthMax: 84,
    description: 'Bermain kooperatif dalam kelompok besar dengan aturan (seperti petak umpet), mampu bernegosiasi dan menyelesaikan konflik sederhana.',
  }
];

export const IMMUNIZATIONS_SEED: ImmunizationReference[] = [
  { id: 'v_hb_0', vaccineName: 'Hepatitis B (HB-0)', recommendedAgeMonth: 0, description: 'Mencegah infeksi hati berbahaya akibat virus Hepatitis B. Diberikan segera setelah lahir (<24 jam).' },
  { id: 'v_bcg', vaccineName: 'BCG', recommendedAgeMonth: 1, description: 'Mencegah penyakit TBC parah (Tuberkulosis selaput otak & paru). Diberikan 1 kali.' },
  { id: 'v_polio_1', vaccineName: 'Polio Oral (OPV-1)', recommendedAgeMonth: 1, description: 'Mencegah kelumpuhan permanen akibat virus Polio. Diberikan di mulut.' },
  { id: 'v_dpt_1', vaccineName: 'DPT-HB-Hib 1', recommendedAgeMonth: 2, description: 'Mencegah Difteri, Pertusis (Batuk Rejan), Tetanus, Hepatitis B, serta Radang Otak & Paru akibat kuman Hib.' },
  { id: 'v_polio_2', vaccineName: 'OPV-2 + IPV-1', recommendedAgeMonth: 2, description: 'Vaksinasi Polio tetes ke-2 ditambah suntikan Polio aktif ke-1 untuk proteksi optimal.' },
  { id: 'v_pcv_1', vaccineName: 'PCV 1', recommendedAgeMonth: 2, description: 'Mencegah Radang Paru (Pneumonia) dan Radang Selaput Otak akibat kuman Pneumokokus.' },
  { id: 'v_rotavirus_1', vaccineName: 'Rotavirus Monovalen 1', recommendedAgeMonth: 2, description: 'Mencegah diare cair parah yang memicu dehidrasi hebat pada bayi.' },
  { id: 'v_dpt_2', vaccineName: 'DPT-HB-Hib 2', recommendedAgeMonth: 3, description: 'Pemberian dosis ke-2 untuk pembentukan antibodi yang stabil.' },
  { id: 'v_polio_3', vaccineName: 'OPV-3', recommendedAgeMonth: 3, description: 'Pemberian dosis tetes ke-3 untuk imun Polio.' },
  { id: 'v_pcv_2', vaccineName: 'PCV 2', recommendedAgeMonth: 3, description: 'Pemberian dosis ke-2 vaksin Pneumokokus.' },
  { id: 'v_rotavirus_2', vaccineName: 'Rotavirus Monovalen 2', recommendedAgeMonth: 3, description: 'Pemberian dosis ke-2 untuk proteksi diare.' },
  { id: 'v_dpt_3', vaccineName: 'DPT-HB-Hib 3', recommendedAgeMonth: 4, description: 'Dosis ke-3 untuk melengkapi kekebalan primer.' },
  { id: 'v_polio_4', vaccineName: 'OPV-4 + IPV-2', recommendedAgeMonth: 4, description: 'Vaksinasi Polio dosis penutup pada masa bayi.' },
  { id: 'v_mr_1', vaccineName: 'Campak-Rubela (MR 1)', recommendedAgeMonth: 9, description: 'Mencegah penyakit Campak yang bisa memicu radang paru berat & Rubela penyebab cacat lahir.' },
  { id: 'v_pcv_3', vaccineName: 'PCV 3 (Booster)', recommendedAgeMonth: 12, description: 'Dosis penguat (booster) untuk antibodi Pneumokokus jangka panjang.' },
  { id: 'v_mr_2', vaccineName: 'Campak-Rubela (MR 2 Booster)', recommendedAgeMonth: 18, description: 'Dosis penguat campak rubela untuk anak balita.' },
  { id: 'v_dpt_b', vaccineName: 'DPT-HB-Hib Booster', recommendedAgeMonth: 18, description: 'Dosis penguat DPT-HB-Hib agar daya kekebalan tubuh tidak menurun.' }
];

export const ARTICLES_SEED: Article[] = [
  {
    id: 'art_1',
    title: 'Mengenal Tanda Red Flag Speech Delay (Keterlambatan Bicara) pada Anak',
    slug: 'red-flag-speech-delay-anak',
    category: 'Bahasa',
    ageRange: '1 - 3 Tahun',
    body: `
      <p class="mb-4">Orang tua mana yang tidak cemas jika anak seusianya sudah lancar berceloteh, sementara si Kecil masih minim kosakata? Speech delay atau keterlambatan bicara adalah salah satu kekhawatiran tumbuh kembang paling sering di klinik kami.</p>
      <h3 class="text-xl font-bold mt-6 mb-2">Mengapa Deteksi Dini Sangat Krusial?</h3>
      <p class="mb-4">Bahasa adalah cerminan dari kemampuan kognitif dan sosial anak. Semakin cepat kita mendeteksi kendala bicara, semakin cepat stimulasi atau terapi wicara terarah bisa diberikan, sehingga meminimalkan efek sekunder seperti tantrum akibat anak frustrasi karena tidak bisa mengekspresikan keinginannya.</p>
      <h3 class="text-xl font-bold mt-6 mb-2">Tanda Bahaya (Red Flags) Berdasarkan Usia anak:</h3>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li><strong>Usia 12 Bulan:</strong> Anak belum merespons ketika namanya dipanggil, tidak melambaikan tangan "da-da", atau tidak menunjuk benda yang diinginkannya.</li>
        <li><strong>Usia 15 Bulan:</strong> Belum mengucapkan kata tunggal bermakna selain celotehan kosong (babbling).</li>
        <li><strong>Usia 18 Bulan:</strong> Belum memahami instruksi sederhana (seperti "ambil bola") atau belum bisa menunjuk minimal 3 anggota tubuh saat ditanyakan.</li>
        <li><strong>Usia 24 Bulan (2 Tahun):</strong> Kosakata yang dikuasai kurang dari 50 kata, belum bisa merangkai frasa 2 kata, atau pelafalannya sangat tidak jelas hingga orang tua pun tidak paham.</li>
      </ul>
      <h3 class="text-xl font-bold mt-6 mb-2">Langkah Pertama yang Harus Dilakukan Orang Tua</h3>
      <p class="mb-4">Lakukan skrining perkembangan bahasa secara berkala. Hindari paparan gawai (screen-time) sebelum usia 2 tahun karena gawai bersifat komunikasi satu arah yang menghambat perkembangan motorik bicara anak. Segera konsultasikan ke klinik terapi wicara FlourishCare jika Anda menemui salah satu tanda red flag di atas.</p>
    `,
    coverImageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop',
    authorName: 'Tim FlourishCare',
    authorCredential: 'Psikolog dan terapis anak FlourishCare',
    publishedAt: '2026-06-20',
    seoMeta: {
      title: 'Tanda Red Flag Speech Delay pada Anak 0-3 Tahun | FlourishCare',
      description: 'Kenali tanda keterlambatan bicara (speech delay) pada anak sejak dini beserta panduan stimulasi mandiri di rumah dari psikolog klinis FlourishCare.'
    }
  },
  {
    id: 'art_2',
    title: 'Pentingnya Sensori Integrasi untuk Mengatasi Anak Sensitif Suara dan Tekstur',
    slug: 'sensori-integrasi-anak-sensitif-tekstur',
    category: 'Sensori & Motorik',
    ageRange: '0 - 5 Tahun',
    body: `
      <p class="mb-4">Apakah si Kecil seringkali menutup telinga dengan histeris saat mendengar suara blender atau penyedot debu, atau menolak keras menyentuh pasir, rumput basah, bahkan tidak mau makan makanan tertentu yang sedikit bertekstur (picky eater)?</p>
      <h3 class="text-xl font-bold mt-6 mb-2">Apa itu Sensori Integrasi?</h3>
      <p class="mb-4">Sensori Integrasi (SI) adalah kemampuan sistem saraf pusat untuk menerima, menyaring, mengatur, dan memproses informasi dari indera kita (melihat, mendengar, menyentuh, mencium, merasakan, keseimbangan, serta posisi sendi) sehingga tubuh bisa merespons lingkungan secara adekuat.</p>
      <h3 class="text-xl font-bold mt-6 mb-2">Tanda Anak Mengalami Defisit Sensori</h3>
      <p class="mb-4">Anak yang sensitif berlebihan disebut <em>sensory defensive</em>. Sebaliknya, ada anak yang justru mencari stimulasi berlebih (misalnya senang berputar-putar tanpa pusing atau gemar menabrakkan diri ke tembok). Ini pertanda bahwa sistem pemrosesan sensorinya sedang tidak seimbang.</p>
      <h3 class="text-xl font-bold mt-6 mb-2">Contoh Terapi Sensori Integrasi Sederhana di Rumah</h3>
      <p class="mb-4">Orang tua bisa melatih sensori anak melalui permainan <strong>Sensory Play</strong> yang murah dan asyik:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Bermain dengan beras, kacang hijau, atau jelly warna-warni (merangsang indera perabaan taktil).</li>
        <li>Berjalan tanpa alas kaki di atas rumput, kerikil halus, karpet kasar, lantai licin (tactile path).</li>
        <li>Bermain ayunan secara berirama perlahan untuk melatih indera vestibular (keseimbangan).</li>
      </ul>
      <p class="mb-4">Jika anak terus-menerus terganggu oleh sensitivitas sensorinya hingga memicu tantrum hebat setiap hari, jadwalkan konsultasi dengan Terapis Okupasi (OT) FlourishCare untuk pemeriksaan terfokus dan program okupasi terarah.</p>
    `,
    coverImageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600&auto=format&fit=crop',
    authorName: 'Tim FlourishCare',
    authorCredential: 'Psikolog dan terapis anak FlourishCare',
    publishedAt: '2026-06-25',
    seoMeta: {
      title: 'Sensori Integrasi pada Anak Sensitif Tekstur & Suara | FlourishCare',
      description: 'Panduan mendalam tentang sensori integrasi (SI) anak dan tips sensory play menyenangkan di rumah untuk meredakan kecemasan taktil pada balita.'
    }
  },
  {
    id: 'art_3',
    title: 'Panduan Mengatasi Tantrum Berlebihan (Mengenal Meltdown vs Tantrum)',
    slug: 'mengatasi-tantrum-dan-meltdown-balita',
    category: 'Sosial Emosional',
    ageRange: '1 - 5 Tahun',
    body: `
      <p class="mb-4">Anak menjerit-jerit, berguling di lantai supermarket, melempar barang. Menghadapi anak tantrum adalah salah satu momen paling menguji kesabaran orang tua. Namun, tahukah Anda bahwa ada perbedaan besar antara tantrum biasa dan "Meltdown" sensori?</p>
      <h3 class="text-xl font-bold mt-6 mb-2">Tantrum vs. Meltdown: Apa Bedanya?</h3>
      <p class="mb-4"><strong>Tantrum</strong> adalah ledakan amarah yang didorong oleh rasa frustrasi karena keinginan yang tidak terpenuhi (misalnya tidak dibelikan mainan). Tantrum biasanya memiliki tujuan, mereda ketika penontonnya pergi atau anak mendapatkan apa yang ia inginkan.</p>
      <p class="mb-4"><strong>Meltdown</strong> adalah respons alami sistem saraf yang kewalahan (sensory overload atau fatigue kognitif). Anak kehilangan kontrol tubuh secara utuh. Meltdown tidak memiliki target audiens, dan tidak akan langsung berhenti hanya karena keinginan anak dituruti.</p>
      <h3 class="text-xl font-bold mt-6 mb-2">Cara Mengatasi Tantrum dengan Tenang:</h3>
      <ul class="list-decimal list-inside mb-4 space-y-2">
        <li><strong>Tetap Tenang & Tarik Napas:</strong> Jangan membalas kemarahan anak dengan teriakan Anda. Anak perlu melihat orang tuanya memiliki kendali emosi yang kokoh.</li>
        <li><strong>Validasi Emosi Anak:</strong> "Kamu marah ya karena tidak boleh makan es krim? Ibu paham kamu sedih. Tapi es krimnya nanti setelah makan nasi ya."</li>
        <li><strong>Beri Batasan yang Konsisten:</strong> Jangan menyerah di tengah jalan. Jika Anda melarang anak membeli mainan saat tantrum, lalu menyerah karena malu dilihat orang, anak akan belajar bahwa tantrum adalah senjata ampuh untuk mendikte kemauan orang tua.</li>
      </ul>
      <h3 class="text-xl font-bold mt-6 mb-2">Kapan Harus Konsultasi ke Psikolog Anak?</h3>
      <p class="mb-4">Jika tantrum terjadi berkali-kali setiap hari, diiringi perilaku melukai diri (membenturkan kepala, menggigit), menyakiti orang lain, atau berlangsung lebih dari 30 menit setiap kalinya, disarankan berkonsultasi ke Psikolog Anak FlourishCare untuk mengevaluasi apakah ada hambatan neurodevelopmental yang melatarbelakanginya.</p>
    `,
    coverImageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop',
    authorName: 'Tim FlourishCare',
    authorCredential: 'Psikolog dan terapis anak FlourishCare',
    publishedAt: '2026-06-28',
    seoMeta: {
      title: 'Mengatasi Tantrum & Meltdown Balita Secara Bijak | FlourishCare',
      description: 'Pelajari perbedaan tantrum vs meltdown sensori serta 3 langkah klinis menenangkan anak tantrum tanpa kekerasan menurut psikolog anak FlourishCare.'
    }
  }
];

export const ACTIVITIES_SEED: Activity[] = [
  {
    id: 'act_1',
    title: 'Sensory Rice Bin (Mangkuk Beras Sensori)',
    domain: 'Motorik Halus & Sensori',
    ageMonthMin: 6,
    ageMonthMax: 18,
    steps: [
      'Siapkan nampan plastik besar atau baskom lebar.',
      'Isi dengan beras putih mentah (bisa diberi pewarna makanan agar menarik).',
      'Sembunyikan mainan kecil (seperti hewan plastik, sendok, mangkuk kecil) di dalam tumpukan beras.',
      'Biarkan anak meraba, menggenggam, meraup, dan menuangkan beras memakai sendok ke mangkuk.'
    ],
    rationale: 'Melatih kekuatan otot tangan, genggaman jemari, dan meredakan hipersensitivitas taktil anak terhadap tekstur kering kasar.',
    relatedScreeningResult: 'taktil_sensory'
  },
  {
    id: 'act_2',
    title: 'Tebak Suara Hewan Kreatif',
    domain: 'Bahasa & Auditori',
    ageMonthMin: 12,
    ageMonthMax: 36,
    steps: [
      'Duduk berhadapan dengan anak tanpa gawai sama sekali.',
      'Tirukan suara hewan yang akrab dengan pelafalan tebal (misal: "Mooo", "Meong", "Kukuruyuk").',
      'Minta anak menebak hewan apa itu.',
      'Ajak anak menirukan kembali suara tersebut dan berikan pujian meriah saat ia mencoba bersuara.'
    ],
    rationale: 'Merangsang kemampuan meniru suara (imitasi verbal), melatih fokus pendengaran, meningkatkan perbendaharaan kata, dan memperkuat bonding.',
    relatedScreeningResult: 'speech_delay'
  },
  {
    id: 'act_3',
    title: 'Jalan Garis Zebra (Zebra Crossing Path)',
    domain: 'Motorik Kasar & Keseimbangan',
    ageMonthMin: 24,
    ageMonthMax: 60,
    steps: [
      'Gunakan selotip kertas (lakban kertas) berwarna terang untuk menempelkan garis lurus sepanjang 2 meter di lantai.',
      'Minta anak berjalan di atas lakban tersebut seperti meniti jembatan sempit, tumit menyentuh jempol kaki berikutnya.',
      'Tantang anak berjalan membawa sendok berisi bola plastik kecil tanpa jatuh.'
    ],
    rationale: 'Melatih keseimbangan tubuh (indera vestibular), koordinasi motorik mata-kaki, serta fokus konsentrasi anak usia dini.',
    relatedScreeningResult: 'motorik_kasar'
  },
  {
    id: 'act_4',
    title: 'Tummy Time Bersama Mainan Berbunyi',
    domain: 'Motorik Kasar',
    ageMonthMin: 0,
    ageMonthMax: 6,
    steps: [
      'Bentangkan matras atau selimut di lantai yang rata dan aman.',
      'Telungkupkan bayi saat ia segar, bukan setelah menyusu.',
      'Letakkan mainan berbunyi di depan wajahnya agar ia terdorong mengangkat kepala.',
      'Mulai 1 sampai 3 menit, lalu tambah perlahan hingga total 15 menit sehari.'
    ],
    rationale: 'Menguatkan otot leher, bahu, dan punggung sebagai fondasi tengkurap, duduk, dan merangkak.',
    relatedScreeningResult: 'motorik_kasar'
  },
  {
    id: 'act_5',
    title: 'Membaca Buku Bergambar Bersama',
    domain: 'Bahasa & Kognitif',
    ageMonthMin: 6,
    ageMonthMax: 36,
    steps: [
      'Pilih buku bergambar dengan gambar besar dan warna kontras.',
      'Pangku si Kecil dan tunjuk setiap gambar sambil menyebut namanya dengan jelas.',
      'Beri jeda agar anak sempat menunjuk atau bersuara, lalu tanggapi dengan antusias.',
      'Ulangi buku yang sama beberapa hari agar kosakatanya melekat.'
    ],
    rationale: 'Memperkaya kosakata, melatih atensi bersama, dan menumbuhkan kebiasaan membaca sejak dini.',
    relatedScreeningResult: 'speech_delay'
  },
  {
    id: 'act_6',
    title: 'Menara Balok Warna',
    domain: 'Motorik Halus',
    ageMonthMin: 12,
    ageMonthMax: 36,
    steps: [
      'Siapkan 4 sampai 6 balok kayu atau gelas plastik yang mudah digenggam.',
      'Contohkan cara menumpuk dua balok, lalu ajak anak menirukan.',
      'Tambah satu balok setiap kali berhasil dan rayakan saat menara roboh bersama.',
      'Sebutkan warna setiap balok untuk sekaligus melatih bahasa.'
    ],
    rationale: 'Melatih koordinasi mata dan tangan, kekuatan jari, serta kesabaran.',
    relatedScreeningResult: 'motorik_halus'
  },
  {
    id: 'act_7',
    title: 'Bermain Peran Dokter Kecil',
    domain: 'Sosial Emosional',
    ageMonthMin: 36,
    ageMonthMax: 84,
    steps: [
      'Siapkan boneka dan peralatan dokter mainan atau benda di rumah.',
      'Ajak anak bergantian menjadi dokter dan pasien.',
      'Tanyakan perasaan boneka, misalnya "Kenapa bonekanya sedih?"',
      'Tutup permainan dengan berterima kasih kepada dokter kecil.'
    ],
    rationale: 'Melatih empati, kemampuan bercerita, dan mengurangi kecemasan saat periksa ke dokter.',
    relatedScreeningResult: 'sosial_emosional'
  },
  {
    id: 'act_8',
    title: 'Meronce Manik Besar',
    domain: 'Motorik Halus & Konsentrasi',
    ageMonthMin: 36,
    ageMonthMax: 84,
    steps: [
      'Siapkan tali sepatu atau benang tebal dan manik berukuran besar.',
      'Ikat salah satu ujung tali agar manik tidak terlepas.',
      'Minta anak memasukkan manik satu per satu mengikuti pola warna sederhana.',
      'Tingkatkan tantangan dengan pola yang lebih panjang.'
    ],
    rationale: 'Melatih genggaman pinset, koordinasi bilateral, dan konsentrasi sebagai bekal menulis.',
    relatedScreeningResult: 'motorik_halus'
  }
];

// The clinical team now comes from data/team.ts (same source as www.flourishcare.id/team)
export type { ClinicalExpert } from './team';
export { FALLBACK_TEAM as CLINICAL_EXPERTS } from './team';
