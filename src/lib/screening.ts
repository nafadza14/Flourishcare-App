import { Screening, ScreeningType } from '../types';

export interface ScreeningQuestion {
  id: string;
  text: string;
  scoreOn?: 'Ya' | 'Tidak';
}

export type ScreeningResult = Screening['result'];

// KPSP set for 18 months (Kemenkes RI)
export const KPSP_18_MONTHS: ScreeningQuestion[] = [
  { id: 'k_18_1', text: 'Tanpa dibantu, dapatkah anak bertepuk tangan atau melambaikan tangan "da-da" saat berpisah?' },
  { id: 'k_18_2', text: 'Dapatkah anak meletakkan satu balok di atas balok lain tanpa menjatuhkannya (menara 2 balok)?' },
  { id: 'k_18_3', text: 'Apakah anak sering menirukan kata-kata baru yang Bunda ucapkan, atau minimal mencoba menirukan suaranya?' },
  { id: 'k_18_4', text: 'Dapatkah anak menunjuk minimal satu anggota badannya (mata, hidung, mulut) saat ditanya?' },
  { id: 'k_18_5', text: 'Apakah anak dapat berjalan tegak ke depan tanpa dibantu atau tanpa berpegangan pada furnitur?' },
  { id: 'k_18_6', text: 'Dapatkah anak menggelindingkan bola ke arah Bunda saat diajak bermain di lantai?' },
  { id: 'k_18_7', text: 'Dapatkah anak minum dari gelas sendiri tanpa menumpahkan sebagian besar isinya?' },
  { id: 'k_18_8', text: 'Dapatkah anak menunjuk ke atas dengan jari telunjuknya saat melihat burung terbang atau cicak di plafon?' },
  { id: 'k_18_9', text: 'Apakah anak suka bermain pura-pura atau meniru aktivitas rumah, misalnya menyapu atau menyuapi boneka?' },
  { id: 'k_18_10', text: 'Dapatkah anak mengucapkan minimal 3 sampai 5 kata yang bermakna, misalnya "mimi", "mam", "bobo"?' },
];

// M-CHAT-R (risk answers in scoreOn)
export const M_CHAT_R_ITEMS: ScreeningQuestion[] = [
  { id: 'm_1', text: 'Jika Anda menunjuk sesuatu di ruangan, apakah anak melihat ke arah yang Anda tunjuk?', scoreOn: 'Tidak' },
  { id: 'm_2', text: 'Pernahkah Anda bertanya-tanya apakah anak Anda mengalami gangguan pendengaran?', scoreOn: 'Ya' },
  { id: 'm_3', text: 'Apakah anak bermain pura-pura, misalnya pura-pura minum dari gelas kosong atau memasak?', scoreOn: 'Tidak' },
  { id: 'm_4', text: 'Apakah anak suka memanjat benda, misalnya kursi, furnitur, atau tangga bermain?', scoreOn: 'Tidak' },
  { id: 'm_5', text: 'Apakah anak membuat gerakan jari yang tidak biasa di dekat matanya, seperti mengepakkan jemari?', scoreOn: 'Ya' },
  { id: 'm_6', text: 'Apakah anak menunjuk dengan satu jari untuk meminta sesuatu, misalnya mainan yang tidak terjangkau?', scoreOn: 'Tidak' },
  { id: 'm_7', text: 'Apakah anak menunjuk dengan satu jari untuk menunjukkan sesuatu yang menarik, misalnya pesawat di langit?', scoreOn: 'Tidak' },
  { id: 'm_8', text: 'Apakah anak tertarik pada anak-anak lain, misalnya memperhatikan, tersenyum, atau mendekati mereka?', scoreOn: 'Tidak' },
  { id: 'm_9', text: 'Apakah anak membawa benda kepada Anda hanya untuk menunjukkannya, bukan untuk minta tolong?', scoreOn: 'Tidak' },
  { id: 'm_10', text: 'Apakah anak merespons saat namanya dipanggil, misalnya menoleh, berbicara, atau berhenti beraktivitas?', scoreOn: 'Tidak' },
  { id: 'm_11', text: 'Ketika Anda tersenyum pada anak, apakah ia tersenyum kembali?', scoreOn: 'Tidak' },
  { id: 'm_12', text: 'Apakah anak terganggu secara berlebihan oleh suara bising sehari-hari, seperti blender atau penyedot debu?', scoreOn: 'Ya' },
  { id: 'm_13', text: 'Apakah anak sudah bisa berjalan sendiri?', scoreOn: 'Tidak' },
  { id: 'm_14', text: 'Apakah anak menatap mata Anda saat Anda berbicara, bermain, atau mendandaninya?', scoreOn: 'Tidak' },
  { id: 'm_15', text: 'Apakah anak mencoba meniru apa yang Anda lakukan, misalnya melambaikan tangan atau bertepuk tangan?', scoreOn: 'Tidak' },
  { id: 'm_16', text: 'Jika Anda menoleh untuk melihat sesuatu, apakah anak ikut menoleh untuk melihat apa yang Anda lihat?', scoreOn: 'Tidak' },
  { id: 'm_17', text: 'Apakah anak berusaha membuat Anda memperhatikannya, misalnya melihat ke arah Anda untuk dipuji?', scoreOn: 'Tidak' },
  { id: 'm_18', text: 'Apakah anak memahami ketika Anda memintanya melakukan sesuatu tanpa isyarat, misalnya "ambil sepatu"?', scoreOn: 'Tidak' },
  { id: 'm_19', text: 'Jika terjadi sesuatu yang baru, apakah anak melihat wajah Anda untuk melihat reaksi Anda?', scoreOn: 'Tidak' },
  { id: 'm_20', text: 'Apakah anak menyukai aktivitas bergerak, misalnya diayun atau diangkat naik turun?', scoreOn: 'Tidak' },
];

export const SPEECH_DELAY_ITEMS: ScreeningQuestion[] = [
  { id: 's_1', text: 'Apakah anak konsisten mengoceh dengan suku kata berulang, seperti "bababa", "dadada", atau "mamama"?' },
  { id: 's_2', text: 'Apakah anak menoleh atau mencari sumber suara secara spontan saat dipanggil namanya?' },
  { id: 's_3', text: 'Apakah anak menirukan bunyi atau intonasi suara orang dewasa di sekitarnya?' },
  { id: 's_4', text: 'Apakah anak memahami minimal 10 instruksi sederhana tanpa bantuan isyarat tangan?' },
  { id: 's_5', text: 'Apakah anak menunjuk benda yang ia inginkan dengan jari telunjuk untuk berkomunikasi?' },
  { id: 's_6', text: 'Apakah anak sudah bisa menggabungkan 2 kata menjadi permintaan, misalnya "mimi susu" atau "mau mam"?' },
];

export interface InstrumentInfo {
  type: ScreeningType;
  title: string;
  short: string;
  description: string;
  ageLabel: string;
  minMonth: number;
  maxMonth: number;
  minutes: number;
}

export const INSTRUMENTS: InstrumentInfo[] = [
  {
    type: 'kpsp',
    title: 'KPSP Kemenkes',
    short: 'KPSP',
    description: 'Kuesioner Pra Skrining Perkembangan untuk motorik, bicara, dan sosialisasi. Set yang tersedia untuk usia 18 bulan.',
    ageLabel: 'Set usia 18 bulan',
    minMonth: 15,
    maxMonth: 21,
    minutes: 5,
  },
  {
    type: 'mchat_r',
    title: 'M-CHAT-R',
    short: 'M-CHAT-R',
    description: '20 pertanyaan tervalidasi untuk deteksi dini risiko autisme pada balita.',
    ageLabel: 'Usia 16 sampai 30 bulan',
    minMonth: 16,
    maxMonth: 30,
    minutes: 7,
  },
  {
    type: 'speech_delay',
    title: 'Skrining Bicara',
    short: 'Bicara',
    description: 'Ceklis terfokus untuk kemampuan mendengar, memahami, dan berbicara.',
    ageLabel: 'Usia 6 bulan sampai 5 tahun',
    minMonth: 6,
    maxMonth: 60,
    minutes: 3,
  },
];

export function instrumentInfo(type: ScreeningType): InstrumentInfo {
  return INSTRUMENTS.find((i) => i.type === type) ?? INSTRUMENTS[0];
}

export function questionsFor(type: ScreeningType): ScreeningQuestion[] {
  if (type === 'kpsp') return KPSP_18_MONTHS;
  if (type === 'mchat_r') return M_CHAT_R_ITEMS;
  return SPEECH_DELAY_ITEMS;
}

export function scoreScreening(type: ScreeningType, answers: Record<string, 'Ya' | 'Tidak'>, childName: string) {
  let score = 0;
  let result: ScreeningResult = 'normal';
  let recommendation = '';

  if (type === 'kpsp') {
    score = KPSP_18_MONTHS.filter((q) => answers[q.id] === 'Ya').length;
    if (score >= 9) {
      result = 'normal';
      recommendation = `Perkembangan ${childName} sesuai dengan usianya. Lanjutkan stimulasi harian di rumah dan ulangi KPSP 3 bulan lagi.`;
    } else if (score >= 7) {
      result = 'meragukan';
      recommendation = `Hasil KPSP ${childName} meragukan. Lakukan stimulasi terarah selama 2 minggu pada kemampuan yang belum tercapai, lalu ulangi skrining. Bila hasil tetap meragukan, jadwalkan konsultasi dengan psikolog anak FlourishCare.`;
    } else {
      result = 'penyimpangan';
      recommendation = `Hasil KPSP ${childName} menunjukkan kemungkinan penyimpangan perkembangan. Sebaiknya segera lakukan pemeriksaan bersama psikolog anak atau dokter spesialis anak tumbuh kembang untuk intervensi dini.`;
    }
  } else if (type === 'mchat_r') {
    score = M_CHAT_R_ITEMS.filter((q) => answers[q.id] === q.scoreOn).length;
    if (score <= 2) {
      result = 'risiko_rendah';
      recommendation = `Risiko autisme ${childName} tergolong rendah. Tetap pantau milestone sosial emosionalnya secara berkala dan ulangi bila ada kekhawatiran baru.`;
    } else if (score <= 7) {
      result = 'risiko_sedang';
      recommendation = `Risiko tergolong sedang. Disarankan wawancara lanjutan bersama psikolog anak FlourishCare untuk memastikan jawaban yang berisiko dan menyusun program stimulasi yang terfokus.`;
    } else {
      result = 'risiko_tinggi';
      recommendation = `Risiko tergolong tinggi. Sebaiknya segera jadwalkan asesmen diagnostik bersama psikolog klinis anak FlourishCare agar intervensi dini bisa direncanakan sejak sekarang.`;
    }
  } else {
    score = SPEECH_DELAY_ITEMS.filter((q) => answers[q.id] === 'Ya').length;
    if (score >= 5) {
      result = 'normal';
      recommendation = `Kemampuan bahasa ${childName} berada pada rentang normal. Teruskan ajak bicara tatap muka, batasi layar, dan bacakan buku cerita setiap hari.`;
    } else if (score >= 3) {
      result = 'risiko_sedang';
      recommendation = `Ada beberapa tanda keterlambatan bicara. Lakukan stimulasi bahasa 15 menit setiap hari selama 2 minggu, lalu ulangi skrining. Bila belum membaik, konsultasikan dengan terapis wicara FlourishCare.`;
    } else {
      result = 'risiko_tinggi';
      recommendation = `Terdeteksi risiko keterlambatan bicara. Sebaiknya segera jadwalkan evaluasi bersama terapis wicara FlourishCare agar stimulasi verbal yang terukur bisa dimulai.`;
    }
  }

  return { score, result, recommendation };
}

export function resultLabel(result: ScreeningResult): string {
  switch (result) {
    case 'normal': return 'Sesuai usia';
    case 'meragukan': return 'Meragukan';
    case 'penyimpangan': return 'Kemungkinan penyimpangan';
    case 'risiko_rendah': return 'Risiko rendah';
    case 'risiko_sedang': return 'Risiko sedang';
    case 'risiko_tinggi': return 'Risiko tinggi';
    default: return result;
  }
}

export function resultTone(result: ScreeningResult): 'success' | 'warning' | 'danger' {
  if (result === 'normal' || result === 'risiko_rendah') return 'success';
  if (result === 'meragukan' || result === 'risiko_sedang') return 'warning';
  return 'danger';
}

export function maxScore(type: ScreeningType): number {
  return questionsFor(type).length;
}
