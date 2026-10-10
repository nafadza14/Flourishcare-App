import type { Child, Screening, ScreeningType } from '../types';
import type { ServiceCategory } from '../data/pricing';
import { KPSP_FORMS, KPSP_SCHEDULE, KPSP_SOURCE, type KpspDomain, type KpspPicture } from '../data/kpsp';
import { TDD_FORMS, TDD_SOURCE } from '../data/tdd';
import { GPPH_CUTOFF, GPPH_ITEMS, GPPH_SCALE, GPPH_SOURCE } from '../data/gpph';
import { SPEECH_BANDS, type SpeechBand } from '../data/speech';
import { SENSORY_AREAS, SENSORY_INFO, SENSORY_ITEMS, SENSORY_MESSAGES } from '../data/sensory';
import { AUTISM_SIGNS, AUTISM_SIGNS_SOURCE } from '../data/autismSigns';
import { ageInMonths, daysBetween, parseDate } from './format';

/** Universal speech red flags phrased as observations for the report */
const SPEECH_FLAG_CONCERN: Record<string, string> = {
  'sp-u-1q': 'Kehilangan kemampuan bicara, mengoceh, atau berinteraksi yang sudah dimiliki',
  'sp-u-2q': 'Ayah Bunda ragu pendengarannya baik',
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ScreeningResult = Screening['result'];
export type AnswerValue = 'Ya' | 'Tidak' | number;
/** yesno: Ya/Tidak. skill: Sudah/Belum (stored as Ya/Tidak). freq3: 0..2. gpph4: 0..3 */
export type ScaleKind = 'yesno' | 'skill' | 'freq3' | 'gpph4';
export type InstrumentGroup = 'perkembangan' | 'komunikasi' | 'sensori' | 'perilaku';

export interface ScreeningItem {
  id: string;
  text: string;
  scale: ScaleKind;
  section?: string;
  picture?: KpspPicture;
  /** 'perintah' and 'amati' items ask the parent to try something with the child */
  mode?: string;
  domain?: KpspDomain;
  note?: string;
}

export interface ScreeningForm {
  type: ScreeningType;
  /** Saved with the answers so a report can be rebuilt later */
  key: string;
  title: string;
  label: string;
  items: ScreeningItem[];
  tools?: string[];
  intro?: string;
  source: string;
  /** False when the wording still needs proofreading against the printed book */
  verified?: boolean;
}

export interface ScoreResult {
  score: number;
  max: number;
  result: ScreeningResult;
  recommendation: string;
  details?: string[];
}

export interface BookingTarget {
  category: ServiceCategory;
  subCode: string;
  label: string;
}

export interface Instrument {
  type: ScreeningType;
  title: string;
  short: string;
  group: InstrumentGroup;
  minMonths: number;
  maxMonths: number;
  minutes: number;
  description: string;
  /** Short badge: how solid the tool is */
  basis: string;
  booking: BookingTarget;
}

export const GROUPS: { key: InstrumentGroup; title: string; subtitle: string }[] = [
  { key: 'perkembangan', title: 'Perkembangan umum', subtitle: 'Gerak, bicara, sosial, dan pendengaran' },
  { key: 'komunikasi', title: 'Bicara dan komunikasi sosial', subtitle: 'Keterlambatan bicara dan tanda awal autisme' },
  { key: 'sensori', title: 'Sensori', subtitle: 'Reaksi terhadap suara, sentuhan, dan gerak' },
  { key: 'perilaku', title: 'Perilaku dan emosi', subtitle: 'Perhatian, hiperaktivitas, dan emosi' },
];

export const INSTRUMENTS: Instrument[] = [
  {
    type: 'kpsp',
    title: 'KPSP',
    short: 'KPSP',
    group: 'perkembangan',
    minMonths: 3,
    maxMonths: 72,
    minutes: 10,
    description: 'Kuesioner Pra Skrining Perkembangan resmi Kemenkes. 10 pertanyaan sesuai usia, mencakup gerak kasar, gerak halus, bicara, dan sosialisasi.',
    basis: 'Instrumen resmi Kemenkes',
    booking: { category: 'psikolog', subCode: 'KONSUL', label: 'Konsultasi dengan psikolog' },
  },
  {
    type: 'tdd',
    title: 'Tes Daya Dengar',
    short: 'Daya dengar',
    group: 'perkembangan',
    minMonths: 0,
    maxMonths: 12,
    minutes: 4,
    description: 'Tes Daya Dengar (TDD) Kemenkes untuk bayi. Menilai kemampuan bicara, mendengar, dan melihat sesuai usia.',
    basis: 'Instrumen resmi Kemenkes',
    booking: { category: 'onsite', subCode: 'TW', label: 'Konsultasi terapis wicara' },
  },
  {
    type: 'speech_delay',
    title: 'Cek Kemampuan Bicara',
    short: 'Bicara',
    group: 'komunikasi',
    minMonths: 0,
    maxMonths: 60,
    minutes: 4,
    description: 'Kemampuan bicara dan bahasa yang seharusnya sudah ada di usia ini, plus tanda waspada keterlambatan bicara.',
    basis: 'Berdasarkan IDAI, ASHA, dan CDC',
    booking: { category: 'onsite', subCode: 'TW', label: 'Jadwalkan terapi wicara' },
  },
  {
    type: 'autism_signs',
    title: 'Tanda Awal Autisme',
    short: 'Tanda autisme',
    group: 'komunikasi',
    minMonths: 9,
    maxMonths: 72,
    minutes: 4,
    description: 'Daftar pengamatan tanda awal autisme dari CDC, disesuaikan dengan usia. Membantu memutuskan perlu tidaknya asesmen.',
    basis: 'Daftar pengamatan CDC',
    booking: { category: 'psikotes', subCode: 'DIAG', label: 'Jadwalkan asesmen psikolog' },
  },
  {
    type: 'sensory',
    title: 'Catatan Sensori',
    short: 'Sensori',
    group: 'sensori',
    minMonths: SENSORY_INFO.minMonths,
    maxMonths: SENSORY_INFO.maxMonths,
    minutes: 6,
    description: 'Mengenali pola anak terhadap suara, sentuhan, gerak, makanan, dan cahaya. Cocok bila si Kecil sangat sensitif atau justru mencari sensasi.',
    basis: 'Catatan pengamatan, bukan tes baku',
    booking: { category: 'onsite', subCode: 'SI', label: 'Konsultasi Sensori Integrasi' },
  },
  {
    type: 'gpph',
    title: 'Perhatian dan Hiperaktivitas',
    short: 'GPPH',
    group: 'perilaku',
    minMonths: 36,
    maxMonths: 84,
    minutes: 3,
    description: 'Formulir deteksi dini GPPH Kemenkes (berbasis Abbreviated Conners). 10 perilaku tentang perhatian, hiperaktivitas, dan emosi.',
    basis: 'Instrumen resmi Kemenkes',
    booking: { category: 'psikolog', subCode: 'KONSUL', label: 'Konsultasi dengan psikolog' },
  },
];

/** M-CHAT-R/F is copyrighted: the app does not run it, the clinic does it with a psychologist. */
export const MCHAT_CLINIC = {
  minMonths: 16,
  maxMonths: 30,
  booking: { category: 'psikotes' as ServiceCategory, subCode: 'DIAG', label: 'Jadwalkan M-CHAT-R/F di klinik' },
};

export function instrumentInfo(type: ScreeningType): Instrument {
  return (
    INSTRUMENTS.find((i) => i.type === type) ?? {
      type,
      title: type === 'mchat_r' ? 'M-CHAT-R' : 'Skrining',
      short: type === 'mchat_r' ? 'M-CHAT-R' : 'Skrining',
      group: 'komunikasi',
      minMonths: 16,
      maxMonths: 30,
      minutes: 5,
      description: '',
      basis: '',
      booking: { category: 'psikolog', subCode: 'KONSUL', label: 'Konsultasi dengan psikolog' },
    }
  );
}

/* ------------------------------------------------------------------ */
/* Ages                                                                */
/* ------------------------------------------------------------------ */

/**
 * KPSP age: months, rounded up when the extra days are more than 16, corrected for
 * prematurity (born before 38 weeks) while the child is under 2 years.
 */
export function kpspAgeMonths(child: Child, at: Date = new Date()): number {
  const birth = parseDate(child.birthDate);
  let days = Math.max(0, daysBetween(birth, at));
  const weeks = child.gestationalWeeks;
  if (typeof weeks === 'number' && weeks > 0 && weeks < 38 && days < 730) days = Math.max(0, days - (40 - weeks) * 7);
  const months = Math.floor(days / 30.4375);
  const rest = days - months * 30.4375;
  return months + (rest > 16 ? 1 : 0);
}

export function kpspScheduleAge(ageMonths: number): number | null {
  let pick: number | null = null;
  for (const a of KPSP_SCHEDULE) if (a <= ageMonths) pick = a;
  return pick;
}

export function nextKpspAge(ageMonths: number): number | null {
  return KPSP_SCHEDULE.find((a) => a > ageMonths) ?? null;
}

function speechBandFor(age: number): SpeechBand {
  let pick = SPEECH_BANDS[0];
  for (const b of SPEECH_BANDS) if (b.toMonths <= age) pick = b;
  return pick;
}

/* ------------------------------------------------------------------ */
/* Forms                                                               */
/* ------------------------------------------------------------------ */

export interface FormAvailability {
  form: ScreeningForm | null;
  /** Why the app cannot run it now */
  reason?: string;
}

export function formFor(type: ScreeningType, child: Child): FormAvailability {
  const age = ageInMonths(child.birthDate);
  const info = instrumentInfo(type);
  if (child.isUnborn) return { form: null, reason: 'Tersedia setelah si Kecil lahir.' };
  switch (type) {
    case 'kpsp': {
      const kAge = kpspAgeMonths(child);
      if (kAge < 3) return { form: null, reason: 'KPSP dimulai di usia 3 bulan.' };
      if (kAge > 72 + 5) return { form: null, reason: 'KPSP berlaku sampai usia 6 tahun.' };
      const schedule = kpspScheduleAge(kAge);
      const form = schedule ? formByKey('kpsp', `kpsp${schedule}`) : null;
      if (!form) {
        return {
          form: null,
          reason: `Form KPSP usia ${schedule} bulan belum tersedia di aplikasi. Lakukan KPSP bersama tenaga kesehatan di Posyandu, Puskesmas, atau klinik.`,
        };
      }
      return { form };
    }
    case 'tdd': {
      if (age > 12) return { form: null, reason: 'Tes Daya Dengar di aplikasi untuk usia 0 sampai 12 bulan.' };
      const band = TDD_FORMS.find((f) => age <= f.toMonths) ?? TDD_FORMS[TDD_FORMS.length - 1];
      return { form: formByKey('tdd', `tdd${band.toMonths}`) };
    }
    case 'speech_delay': {
      if (age > info.maxMonths) return { form: null, reason: 'Cek bicara di aplikasi untuk usia 0 sampai 5 tahun.' };
      const band = speechBandFor(age);
      return { form: formByKey('speech_delay', `speech${band.fromMonths}_${band.toMonths}`, age) };
    }
    case 'autism_signs': {
      if (age < info.minMonths) return { form: null, reason: `Mulai usia ${info.minMonths} bulan.` };
      return { form: formByKey('autism_signs', `autism${Math.min(age, 72)}`, age) };
    }
    case 'sensory': {
      if (age < info.minMonths) return { form: null, reason: `Mulai usia ${info.minMonths} bulan.` };
      return { form: formByKey('sensory', 'sensory1') };
    }
    case 'gpph': {
      if (age < info.minMonths) return { form: null, reason: 'Mulai usia 3 tahun.' };
      return { form: formByKey('gpph', 'gpph1') };
    }
    default:
      return { form: null, reason: 'Skrining ini dilakukan bersama psikolog di klinik.' };
  }
}

/** Rebuild a form from the key saved in a report */
export function formByKey(type: ScreeningType, key: string, ageForItems?: number): ScreeningForm | null {
  switch (type) {
    case 'kpsp': {
      const age = Number(key.replace('kpsp', ''));
      const f = KPSP_FORMS.find((x) => x.ageMonths === age);
      if (!f) return null;
      return {
        type,
        key,
        title: `KPSP ${age} bulan`,
        label: `KPSP usia ${age} bulan`,
        tools: f.tools,
        verified: f.verified,
        intro: 'Lakukan bersama si Kecil saat ia sedang segar dan tidak lapar. Ikuti petunjuk di setiap pertanyaan, lalu jawab sesuai yang benar-benar terjadi.',
        source: KPSP_SOURCE,
        items: f.items.map((i) => ({ id: i.id, text: i.text, scale: 'yesno' as const, picture: i.picture, mode: i.mode, domain: i.domain })),
      };
    }
    case 'tdd': {
      const to = Number(key.replace('tdd', ''));
      const f = TDD_FORMS.find((x) => x.toMonths === to);
      if (!f) return null;
      const sectionLabel: Record<string, string> = { ekspresif: 'Kemampuan bicara (ekspresif)', reseptif: 'Kemampuan mendengar (reseptif)', visual: 'Kemampuan melihat (visual)' };
      return {
        type,
        key,
        title: 'Tes Daya Dengar',
        label: `TDD ${f.label.toLowerCase()}`,
        tools: f.items.some((i) => /bel/i.test(i.text)) ? ['bel kecil atau mainan berbunyi'] : [],
        intro: 'Untuk pertanyaan pemeriksaan, Ayah Bunda bisa mencobanya sendiri dengan dibantu anggota keluarga lain.',
        source: TDD_SOURCE,
        verified: true,
        items: f.items.map((i) => ({ id: i.id, text: i.text, scale: 'yesno' as const, section: sectionLabel[i.section], mode: i.mode })),
      };
    }
    case 'speech_delay': {
      const band = SPEECH_BANDS.find((b) => key === `speech${b.fromMonths}_${b.toMonths}`);
      if (!band) return null;
      return {
        type,
        key,
        title: 'Cek Kemampuan Bicara',
        label: `Kemampuan bicara usia ${band.label}`,
        intro: 'Pikirkan keseharian si Kecil dalam 2 minggu terakhir.',
        source: 'Disusun dari IDAI, ASHA, AAP, dan CDC',
        items: [
          ...band.skills.map((s) => ({ id: s.id, text: s.text, scale: 'skill' as const, section: `Seharusnya sudah bisa di usia ${band.label}` })),
          ...band.redFlags.map((s) => ({ id: s.id, text: s.text, scale: 'yesno' as const, section: 'Tanda waspada: apakah ini terjadi pada si Kecil?' })),
          { id: 'sp-u-1q', text: 'Apakah si Kecil kehilangan kemampuan bicara, mengoceh, atau berinteraksi yang sebelumnya sudah dimiliki?', scale: 'yesno', section: 'Tanda waspada: apakah ini terjadi pada si Kecil?' },
          { id: 'sp-u-2q', text: 'Apakah Ayah Bunda ragu si Kecil bisa mendengar dengan baik?', scale: 'yesno', section: 'Tanda waspada: apakah ini terjadi pada si Kecil?' },
        ],
      };
    }
    case 'autism_signs': {
      const age = ageForItems ?? Number(key.replace('autism', ''));
      const items = AUTISM_SIGNS.filter((i) => i.minMonths <= age);
      return {
        type,
        key,
        title: 'Tanda Awal Autisme',
        label: 'Pengamatan tanda awal autisme',
        intro: 'Jawab berdasarkan kebiasaan si Kecil sehari-hari, bukan hanya sekali dua kali.',
        source: AUTISM_SIGNS_SOURCE,
        items: items.map((i) => ({ id: i.id, text: i.text, scale: 'yesno' as const, section: i.group === 'sosial' ? 'Interaksi dan komunikasi' : 'Perilaku dan minat' })),
      };
    }
    case 'sensory': {
      const areaLabel = Object.fromEntries(SENSORY_AREAS.map((a) => [a.key, a.label]));
      return {
        type,
        key,
        title: 'Catatan Sensori',
        label: SENSORY_INFO.title,
        intro: SENSORY_INFO.instructions,
        source: SENSORY_INFO.disclaimer,
        items: SENSORY_ITEMS.map((i) => ({ id: i.id, text: i.text, scale: 'freq3' as const, section: areaLabel[i.area], note: (i as { note?: string }).note })),
      };
    }
    case 'gpph':
      return {
        type,
        key,
        title: 'Perhatian dan Hiperaktivitas',
        label: 'Deteksi dini GPPH',
        intro: 'Nilai perilaku si Kecil di semua situasi: di rumah, saat bermain, dan bersama orang lain.',
        source: GPPH_SOURCE,
        verified: false,
        items: GPPH_ITEMS.map((i) => ({ id: i.id, text: i.text, scale: 'gpph4' as const })),
      };
    default:
      return null;
  }
}

export function scaleOptions(scale: ScaleKind): { value: AnswerValue; label: string; hint?: string }[] {
  switch (scale) {
    case 'skill':
      return [
        { value: 'Tidak', label: 'Belum' },
        { value: 'Ya', label: 'Sudah' },
      ];
    case 'freq3':
      return [
        { value: 0, label: 'Tidak pernah' },
        { value: 1, label: 'Kadang' },
        { value: 2, label: 'Sering' },
      ];
    case 'gpph4':
      return GPPH_SCALE.map((s, i) => ({ value: i, label: ['Tidak ada', 'Kadang-kadang', 'Sering', 'Selalu'][i], hint: s }));
    default:
      return [
        { value: 'Tidak', label: 'Tidak' },
        { value: 'Ya', label: 'Ya' },
      ];
  }
}

export function answerLabel(item: ScreeningItem, value: AnswerValue | undefined): string {
  if (value === undefined || value === null) return '-';
  return scaleOptions(item.scale).find((o) => o.value === value)?.label ?? String(value);
}

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

export function scoreForm(form: ScreeningForm, answers: Record<string, AnswerValue>, childName: string): ScoreResult {
  const name = childName;
  switch (form.type) {
    case 'kpsp': {
      const yes = form.items.filter((i) => answers[i.id] === 'Ya').length;
      const max = form.items.length;
      if (yes >= 9) {
        return { score: yes, max, result: 'normal', recommendation: `Perkembangan ${name} sesuai umur. Berikan pujian, lanjutkan stimulasi sesuai tahapan usianya, dan lakukan KPSP lagi di jadwal berikutnya.` };
      }
      const lagging = domainsLagging(form, answers);
      if (yes >= 7) {
        return {
          score: yes,
          max,
          result: 'meragukan',
          recommendation: `Hasil KPSP ${name} meragukan. Lakukan stimulasi lebih sering dengan penuh kasih sayang, terutama pada aspek yang tertinggal, lalu ulangi KPSP 2 minggu lagi. Bila hasilnya tetap meragukan, konsultasikan ke tenaga ahli tumbuh kembang.`,
          details: lagging,
        };
      }
      return {
        score: yes,
        max,
        result: 'penyimpangan',
        recommendation: `Hasil KPSP ${name} menunjukkan kemungkinan penyimpangan perkembangan. Sesuai pedoman Kemenkes, sebaiknya segera dirujuk untuk pemeriksaan tumbuh kembang lebih lanjut bersama dokter anak atau psikolog.`,
        details: lagging,
      };
    }
    case 'tdd': {
      const no = form.items.filter((i) => answers[i.id] === 'Tidak');
      if (!no.length) return { score: 0, max: form.items.length, result: 'normal', recommendation: `Kemampuan dengar, bicara, dan lihat ${name} sesuai umur. Lanjutkan ajak bicara dan bernyanyi setiap hari.` };
      return {
        score: no.length,
        max: form.items.length,
        result: 'penyimpangan',
        recommendation: `Ada ${no.length} jawaban "Tidak". Menurut pedoman Kemenkes, ini menandakan kemungkinan gangguan pendengaran. Sebaiknya ${name} diperiksakan pendengarannya (misalnya OAE atau BERA) di rumah sakit, dan konsultasikan perkembangan bicaranya.`,
        details: Array.from(new Set(no.map((i) => i.section).filter(Boolean))) as string[],
      };
    }
    case 'speech_delay': {
      const flags = form.items.filter((i) => i.scale === 'yesno' && answers[i.id] === 'Ya');
      const notYet = form.items.filter((i) => i.scale === 'skill' && answers[i.id] === 'Tidak');
      const skills = form.items.filter((i) => i.scale === 'skill').length;
      const score = skills - notYet.length;
      if (flags.length) {
        return {
          score,
          max: skills,
          result: 'penyimpangan',
          recommendation: `Ada tanda waspada keterlambatan bicara pada ${name}. Jangan menunggu: konsultasikan ke dokter anak dan terapis wicara, dan pastikan pendengarannya diperiksa. Sambil menunggu, lakukan aktivitas bahasa di bawah setiap hari.`,
          details: flags.map((f) => SPEECH_FLAG_CONCERN[f.id] ?? f.text),
        };
      }
      if (notYet.length >= 3) {
        return {
          score,
          max: skills,
          result: 'penyimpangan',
          recommendation: `Beberapa kemampuan bicara yang umumnya sudah ada di usia ini belum terlihat pada ${name}. Sebaiknya konsultasikan ke terapis wicara, sambil rutin melakukan aktivitas bahasa di bawah.`,
          details: notYet.map((f) => f.text),
        };
      }
      if (notYet.length) {
        return {
          score,
          max: skills,
          result: 'meragukan',
          recommendation: `Sebagian kecil kemampuan belum terlihat. Perbanyak aktivitas bahasa di bawah setiap hari, lalu cek lagi dalam 1 bulan. Bila belum ada kemajuan, konsultasikan ke terapis wicara.`,
          details: notYet.map((f) => f.text),
        };
      }
      return { score, max: skills, result: 'normal', recommendation: `Kemampuan bicara ${name} sesuai usianya. Terus ajak ngobrol, membaca buku, dan bernyanyi bersama.` };
    }
    case 'autism_signs': {
      const flagged = form.items.filter((i) => {
        const def = AUTISM_SIGNS.find((a) => a.id === i.id);
        return def && answers[i.id] === def.flagOn;
      });
      const strong = flagged.some((i) => AUTISM_SIGNS.find((a) => a.id === i.id)?.strong);
      const n = flagged.length;
      const details = flagged.map((i) => AUTISM_SIGNS.find((a) => a.id === i.id)?.concern ?? i.text);
      if (!n) {
        return {
          score: 0,
          max: form.items.length,
          result: 'normal',
          recommendation: `Belum tampak tanda awal yang perlu dikhawatirkan pada ${name}. Tetap pantau milestone, dan lakukan skrining autisme (M-CHAT-R/F) di usia 18 dan 24 bulan bersama tenaga kesehatan.`,
        };
      }
      if (n >= 3 || strong) {
        return {
          score: n,
          max: form.items.length,
          result: 'penyimpangan',
          recommendation: `Ada beberapa tanda yang sebaiknya segera dievaluasi. Disarankan asesmen perkembangan bersama psikolog anak, termasuk skrining M-CHAT-R/F. Deteksi dan intervensi yang lebih awal memberi hasil terbaik.`,
          details,
        };
      }
      return {
        score: n,
        max: form.items.length,
        result: 'meragukan',
        recommendation: `Ada ${n} tanda yang sebaiknya dibicarakan dengan psikolog atau dokter anak. Catat contoh kejadiannya untuk dibawa saat konsultasi.`,
        details,
      };
    }
    case 'sensory': {
      const flaggedAreas = SENSORY_AREAS.filter((a) => {
        const inArea = SENSORY_ITEMS.filter((i) => i.area === a.key);
        return inArea.filter((i) => answers[i.id] === 2).length >= 2;
      });
      if (!flaggedAreas.length) return { score: 0, max: SENSORY_AREAS.length, result: 'normal', recommendation: SENSORY_MESSAGES.noFlag };
      return {
        score: flaggedAreas.length,
        max: SENSORY_AREAS.length,
        result: 'meragukan',
        recommendation: SENSORY_MESSAGES.flag.replace('{areas}', flaggedAreas.map((a) => a.label.toLowerCase()).join(', ')),
        details: flaggedAreas.map((a) => a.label),
      };
    }
    case 'gpph': {
      const total = form.items.reduce((sum, i) => sum + (typeof answers[i.id] === 'number' ? (answers[i.id] as number) : 0), 0);
      const max = form.items.length * 3;
      if (total >= GPPH_CUTOFF) {
        return {
          score: total,
          max,
          result: 'penyimpangan',
          recommendation: `Skor ${total} (batas ${GPPH_CUTOFF}). Menurut pedoman Kemenkes, ${name} kemungkinan mengalami Gangguan Pemusatan Perhatian dan Hiperaktivitas. Sebaiknya dievaluasi oleh psikolog atau dokter anak untuk memastikan.`,
        };
      }
      return {
        score: total,
        max,
        result: 'normal',
        recommendation: `Skor ${total}, di bawah batas ${GPPH_CUTOFF}. Belum tampak tanda GPPH. Bila Ayah Bunda tetap merasa ada yang berbeda, ulangi dalam 1 bulan atau konsultasikan.`,
      };
    }
    default:
      return { score: 0, max: 0, result: 'normal', recommendation: '' };
  }
}

const KPSP_DOMAIN_LABEL: Record<KpspDomain, string> = {
  gerak_kasar: 'Gerak kasar',
  gerak_halus: 'Gerak halus',
  bicara_bahasa: 'Bicara dan bahasa',
  sosialisasi_kemandirian: 'Sosialisasi dan kemandirian',
};

function domainsLagging(form: ScreeningForm, answers: Record<string, AnswerValue>): string[] {
  const out = new Set<string>();
  for (const i of form.items) if (answers[i.id] === 'Tidak' && i.domain) out.add(KPSP_DOMAIN_LABEL[i.domain]);
  return [...out].map((d) => `Aspek yang perlu distimulasi: ${d}`);
}

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

export function resultLabel(result: ScreeningResult, type?: ScreeningType): string {
  if (type === 'kpsp') return { normal: 'Sesuai umur', meragukan: 'Meragukan', penyimpangan: 'Kemungkinan penyimpangan' }[result as 'normal'] ?? result;
  if (type === 'tdd') return result === 'normal' ? 'Sesuai umur' : 'Perlu cek pendengaran';
  if (type === 'speech_delay') return { normal: 'Sesuai usia', meragukan: 'Perlu dipantau', penyimpangan: 'Perlu konsultasi' }[result as 'normal'] ?? result;
  if (type === 'autism_signs') return { normal: 'Belum tampak tanda', meragukan: 'Perlu dibicarakan', penyimpangan: 'Disarankan asesmen' }[result as 'normal'] ?? result;
  if (type === 'sensory') return result === 'normal' ? 'Tidak ada pola menonjol' : 'Perlu pengamatan lanjut';
  if (type === 'gpph') return result === 'normal' ? 'Belum tampak tanda' : 'Kemungkinan GPPH';
  switch (result) {
    case 'normal':
      return 'Sesuai usia';
    case 'meragukan':
      return 'Meragukan';
    case 'penyimpangan':
      return 'Perlu evaluasi';
    case 'risiko_rendah':
      return 'Risiko rendah';
    case 'risiko_sedang':
      return 'Risiko sedang';
    case 'risiko_tinggi':
      return 'Risiko tinggi';
  }
}

export function resultTone(result: ScreeningResult): 'success' | 'warning' | 'danger' {
  if (result === 'normal' || result === 'risiko_rendah') return 'success';
  if (result === 'meragukan' || result === 'risiko_sedang') return 'warning';
  return 'danger';
}

/* ------------------------------------------------------------------ */
/* What to do now                                                      */
/* ------------------------------------------------------------------ */

export interface Suggestion {
  type: ScreeningType;
  reason: string;
  /** Strongly recommended now (due by schedule) vs simply available */
  due: boolean;
}

function lastOf(screenings: Screening[], type: ScreeningType, filter?: (s: Screening) => boolean) {
  return screenings.filter((s) => s.type === type && (!filter || filter(s))).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

function monthsSince(iso: string): number {
  return Math.max(0, daysBetween(new Date(iso), new Date()) / 30.4375);
}

/** Screenings recommended for the child's age and history, most important first */
export function suggestions(child: Child, screenings: Screening[]): Suggestion[] {
  if (child.isUnborn) return [];
  const age = ageInMonths(child.birthDate);
  const out: Suggestion[] = [];
  const kAge = kpspAgeMonths(child);
  const sched = kpspScheduleAge(kAge);
  const kpsp = formFor('kpsp', child);
  if (kpsp.form && sched) {
    const done = lastOf(screenings, 'kpsp', (s) => String(s.answers?._form ?? '') === kpsp.form!.key);
    const last = lastOf(screenings, 'kpsp');
    const retest = last && last.result === 'meragukan' && monthsSince(last.createdAt) >= 0.45;
    if (!done) out.push({ type: 'kpsp', due: true, reason: `Jadwal KPSP usia ${sched} bulan` });
    else if (retest) out.push({ type: 'kpsp', due: true, reason: 'Ulangi 2 minggu setelah hasil meragukan' });
  }
  if (age <= 12) {
    const tdd = formFor('tdd', child).form;
    if (tdd && !lastOf(screenings, 'tdd', (s) => String(s.answers?._form ?? '') === tdd.key)) out.push({ type: 'tdd', due: true, reason: 'Cek pendengaran sesuai usianya' });
  }
  if (age >= 9 && age <= 36) {
    const last = lastOf(screenings, 'autism_signs');
    if (!last || monthsSince(last.createdAt) >= 6) out.push({ type: 'autism_signs', due: age >= 16 && age <= 30, reason: age >= 16 && age <= 30 ? 'Usia penting untuk skrining autisme' : 'Pengamatan rutin setiap 6 bulan' });
  }
  if (age >= 12 && age <= 60) {
    const speech = formFor('speech_delay', child).form;
    if (speech && !lastOf(screenings, 'speech_delay', (s) => String(s.answers?._form ?? '') === speech.key)) out.push({ type: 'speech_delay', due: age >= 18 && age <= 36, reason: 'Kemampuan bicara sesuai usia' });
  }
  return out;
}
