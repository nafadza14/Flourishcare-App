import type { Child, GrowthRecord } from '../types';
import { ageInMonthsDecimal, daysBetween, parseDate } from './format';
import {
  CDC_BFA,
  CDC_HFA,
  CDC_WFA,
  WHO_BFA,
  WHO_BFA_LENGTH24,
  WHO_HCFA,
  WHO_LHFA,
  WHO_LHFA_LENGTH24,
  WHO_WFA,
  WHO_WFH,
  WHO_WFL,
  type LmsRow,
  type LmsTable,
} from '../data/growthRef';

/**
 * Growth assessment.
 *  - 0 to 60 months: WHO Child Growth Standards 2006, categories from Permenkes No. 2 Tahun 2020.
 *  - Above 60 months: CDC 2000 growth charts (as recommended by IDAI for children over 5), percentile based.
 *  - Premature babies (born before 37 weeks) use corrected age until 24 months.
 */

export type Indicator = 'wfa' | 'lhfa' | 'hcfa' | 'wflh' | 'bfa';
export type GrowthTone = 'success' | 'warning' | 'danger' | 'neutral';
export type GrowthStandard = 'WHO' | 'CDC';

export const WHO_MAX_MONTH = 60;
export const CDC_MAX_MONTH = 96;

export function indicatorInfo(indicator: Indicator, ageMonths: number) {
  const standing = ageMonths >= 24;
  switch (indicator) {
    case 'wfa':
      return { short: 'BB/U', label: 'Berat badan menurut umur', unit: 'kg' };
    case 'lhfa':
      return standing
        ? { short: 'TB/U', label: 'Tinggi badan menurut umur', unit: 'cm' }
        : { short: 'PB/U', label: 'Panjang badan menurut umur', unit: 'cm' };
    case 'hcfa':
      return { short: 'LK/U', label: 'Lingkar kepala menurut umur', unit: 'cm' };
    case 'wflh':
      return standing
        ? { short: 'BB/TB', label: 'Berat badan menurut tinggi badan', unit: 'kg' }
        : { short: 'BB/PB', label: 'Berat badan menurut panjang badan', unit: 'kg' };
    case 'bfa':
      return { short: 'IMT/U', label: 'Indeks massa tubuh menurut umur', unit: 'kg/m²' };
  }
}

/* ------------------------------------------------------------------ */
/* LMS maths                                                           */
/* ------------------------------------------------------------------ */

function tableFor(t: LmsTable, gender: Child['gender']): LmsRow[] {
  return gender === 'P' ? t.girls : t.boys;
}

/** Linear interpolation of L, M, S at x. Returns null outside the table. */
function lmsAt(rows: LmsRow[], x: number): [number, number, number] | null {
  if (!rows.length || x < rows[0][0] - 1e-9 || x > rows[rows.length - 1][0] + 1e-9) return null;
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i];
    const b = rows[i + 1];
    if (x >= a[0] && x <= b[0]) {
      const t = (x - a[0]) / (b[0] - a[0] || 1);
      return [a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];
    }
  }
  const last = rows[rows.length - 1];
  return [last[1], last[2], last[3]];
}

export function valueAtZ(L: number, M: number, S: number, z: number): number {
  return Math.abs(L) < 1e-7 ? M * Math.exp(S * z) : M * Math.pow(1 + L * S * z, 1 / L);
}

function zFromLms(y: number, L: number, M: number, S: number): number {
  return Math.abs(L) < 1e-7 ? Math.log(y / M) / S : (Math.pow(y / M, L) - 1) / (L * S);
}

/** WHO "restricted application" of the LMS method beyond ±3 SD for weight based indicators. */
function whoAdjustedZ(y: number, L: number, M: number, S: number): number {
  const z = zFromLms(y, L, M, S);
  if (z > 3) {
    const sd3 = valueAtZ(L, M, S, 3);
    const sd23 = sd3 - valueAtZ(L, M, S, 2);
    return 3 + (y - sd3) / sd23;
  }
  if (z < -3) {
    const sd3 = valueAtZ(L, M, S, -3);
    const sd23 = valueAtZ(L, M, S, -2) - sd3;
    return -3 + (y - sd3) / sd23;
  }
  return z;
}

/** Standard normal CDF (Abramowitz and Stegun 7.1.26), returns a percentile 0 to 100. */
export function zToPercentile(z: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(z / Math.SQRT2));
  const erf =
    1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2);
  const cdf = 0.5 * (1 + Math.sign(z) * erf);
  return Math.min(99.9, Math.max(0.1, cdf * 100));
}

export function percentileLabel(p: number): string {
  if (p < 1) return 'di bawah P1';
  if (p > 99) return 'di atas P99';
  return `P${Math.round(p)}`;
}

/* ------------------------------------------------------------------ */
/* Age                                                                 */
/* ------------------------------------------------------------------ */

/** Born before 37 weeks with a known gestational age */
export function prematureWeeks(child: Child): number | null {
  const w = child.gestationalWeeks;
  if (typeof w === 'number' && w >= 22 && w < 37) return w;
  return null;
}

/**
 * Age in decimal months used for growth: corrected for prematurity until 24 months
 * (WHO and IDAI practice), chronological afterwards.
 */
export function growthAgeMonths(child: Child, at: string | Date): { age: number; corrected: boolean } {
  const chrono = ageInMonthsDecimal(child.birthDate, at);
  const weeks = prematureWeeks(child);
  if (weeks && chrono < 24) {
    const corrected = Math.max(0, chrono - ((40 - weeks) * 7) / 30.4375);
    return { age: Math.round(corrected * 10) / 10, corrected: true };
  }
  return { age: chrono, corrected: false };
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export interface Category {
  label: string;
  tone: GrowthTone;
  advice: string;
}

interface Band {
  /** upper bound (exclusive for the next band) in z or percentile */
  max: number;
  category: Category;
}

const OK_ADVICE = 'Pertahankan gizi seimbang dan ukur rutin setiap bulan.';
const CONSULT = 'Sebaiknya diperiksakan ke dokter anak atau tenaga kesehatan.';

/** Permenkes No. 2 Tahun 2020 (z-score) */
const WHO_BANDS: Record<Indicator, Band[]> = {
  wfa: [
    { max: -3, category: { label: 'Berat badan sangat kurang', tone: 'danger', advice: CONSULT } },
    { max: -2, category: { label: 'Berat badan kurang', tone: 'danger', advice: CONSULT } },
    { max: 1, category: { label: 'Berat badan normal', tone: 'success', advice: OK_ADVICE } },
    { max: Infinity, category: { label: 'Risiko berat badan lebih', tone: 'warning', advice: 'Cek juga BB/PB atau BB/TB untuk menilai status gizi.' } },
  ],
  lhfa: [
    { max: -3, category: { label: 'Sangat pendek', tone: 'danger', advice: CONSULT + ' Perlu dinilai risiko stunting.' } },
    { max: -2, category: { label: 'Pendek', tone: 'danger', advice: CONSULT + ' Perlu dinilai risiko stunting.' } },
    { max: 3, category: { label: 'Normal', tone: 'success', advice: OK_ADVICE } },
    { max: Infinity, category: { label: 'Tinggi', tone: 'warning', advice: 'Umumnya tidak masalah. Bicarakan dengan dokter bila Ayah Bunda ragu.' } },
  ],
  hcfa: [
    { max: -2, category: { label: 'Lingkar kepala di bawah normal', tone: 'danger', advice: 'Sebaiknya dievaluasi dokter anak.' } },
    { max: 2, category: { label: 'Normal', tone: 'success', advice: 'Ukur lingkar kepala rutin sampai usia 2 tahun.' } },
    { max: Infinity, category: { label: 'Lingkar kepala di atas normal', tone: 'danger', advice: 'Sebaiknya dievaluasi dokter anak.' } },
  ],
  wflh: [
    { max: -3, category: { label: 'Gizi buruk', tone: 'danger', advice: 'Segera periksakan ke dokter anak atau Puskesmas.' } },
    { max: -2, category: { label: 'Gizi kurang', tone: 'danger', advice: CONSULT } },
    { max: 1, category: { label: 'Gizi baik', tone: 'success', advice: OK_ADVICE } },
    { max: 2, category: { label: 'Berisiko gizi lebih', tone: 'warning', advice: 'Perhatikan porsi, kurangi gula, dan perbanyak aktivitas.' } },
    { max: 3, category: { label: 'Gizi lebih', tone: 'danger', advice: CONSULT } },
    { max: Infinity, category: { label: 'Obesitas', tone: 'danger', advice: CONSULT } },
  ],
  bfa: [],
};
WHO_BANDS.bfa = WHO_BANDS.wflh;

/** CDC 2000 (percentile), as used by IDAI for children above 5 years */
const CDC_BANDS: Partial<Record<Indicator, Band[]>> = {
  bfa: [
    { max: 5, category: { label: 'Berat badan kurang', tone: 'danger', advice: CONSULT } },
    { max: 85, category: { label: 'Normal', tone: 'success', advice: OK_ADVICE } },
    { max: 95, category: { label: 'Berat badan lebih', tone: 'warning', advice: 'Perhatikan porsi, kurangi gula, dan perbanyak aktivitas.' } },
    { max: Infinity, category: { label: 'Obesitas', tone: 'danger', advice: CONSULT } },
  ],
  lhfa: [
    { max: 3, category: { label: 'Perawakan pendek', tone: 'danger', advice: CONSULT } },
    { max: 97, category: { label: 'Normal', tone: 'success', advice: OK_ADVICE } },
    { max: Infinity, category: { label: 'Tinggi', tone: 'warning', advice: 'Umumnya tidak masalah. Bicarakan dengan dokter bila Ayah Bunda ragu.' } },
  ],
  wfa: [
    { max: 3, category: { label: 'Berat badan rendah', tone: 'danger', advice: CONSULT } },
    { max: 97, category: { label: 'Normal', tone: 'success', advice: 'Status gizi anak di atas 5 tahun dinilai dari IMT/U.' } },
    { max: Infinity, category: { label: 'Berat badan tinggi', tone: 'warning', advice: 'Lihat IMT/U untuk menilai status gizi.' } },
  ],
};

function categorize(bands: Band[], value: number): Category {
  for (const b of bands) if (value < b.max || (b.max === Infinity)) return b.category;
  return bands[bands.length - 1].category;
}

/** Category boundaries, used to colour the chart zones */
export function zoneBoundaries(indicator: Indicator, standard: GrowthStandard): { from: number; to: number; tone: GrowthTone }[] {
  const bands = standard === 'WHO' ? WHO_BANDS[indicator] : CDC_BANDS[indicator] ?? [];
  const lowEdge = standard === 'WHO' ? -4 : 0.5;
  const highEdge = standard === 'WHO' ? 4 : 99.5;
  const out: { from: number; to: number; tone: GrowthTone }[] = [];
  let from = lowEdge;
  for (const b of bands) {
    const to = Math.min(b.max, highEdge);
    if (to > from) out.push({ from, to, tone: b.category.tone });
    from = to;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Assessment                                                          */
/* ------------------------------------------------------------------ */

export interface IndicatorResult {
  indicator: Indicator;
  short: string;
  label: string;
  value: number;
  unit: string;
  z: number;
  percentile: number;
  category: Category;
  standard: GrowthStandard;
}

export interface RecordAssessment {
  age: number;
  corrected: boolean;
  standard: GrowthStandard | null;
  results: IndicatorResult[];
}

function hasValue(v: number | null | undefined): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

/** z-score for one indicator at a given age (or length/height for BB/PB and BB/TB) */
export function zScore(indicator: Indicator, gender: Child['gender'], age: number, value: number, heightCm?: number): { z: number; standard: GrowthStandard } | null {
  if (age <= WHO_MAX_MONTH) {
    let lms: [number, number, number] | null = null;
    const lengthPhase = age < 24;
    switch (indicator) {
      case 'wfa':
        lms = lmsAt(tableFor(WHO_WFA, gender), age);
        break;
      case 'hcfa':
        lms = lmsAt(tableFor(WHO_HCFA, gender), age);
        break;
      case 'lhfa': {
        const rows = tableFor(WHO_LHFA, gender);
        if (lengthPhase) {
          const l24 = (gender === 'P' ? WHO_LHFA_LENGTH24.girls : WHO_LHFA_LENGTH24.boys) as LmsRow;
          lms = lmsAt([...rows.filter((r) => r[0] < 24), l24], age);
        } else lms = lmsAt(rows.filter((r) => r[0] >= 24), age);
        break;
      }
      case 'bfa': {
        const rows = tableFor(WHO_BFA, gender);
        if (lengthPhase) {
          const l24 = (gender === 'P' ? WHO_BFA_LENGTH24.girls : WHO_BFA_LENGTH24.boys) as LmsRow;
          lms = lmsAt([...rows.filter((r) => r[0] < 24), l24], age);
        } else lms = lmsAt(rows.filter((r) => r[0] >= 24), age);
        break;
      }
      case 'wflh':
        if (!hasValue(heightCm)) return null;
        lms = lmsAt(tableFor(lengthPhase ? WHO_WFL : WHO_WFH, gender), Math.round(heightCm * 2) / 2);
        break;
    }
    if (!lms) return null;
    const [L, M, S] = lms;
    const weightBased = indicator === 'wfa' || indicator === 'wflh' || indicator === 'bfa';
    return { z: weightBased ? whoAdjustedZ(value, L, M, S) : zFromLms(value, L, M, S), standard: 'WHO' };
  }
  if (age <= CDC_MAX_MONTH) {
    const table = indicator === 'wfa' ? CDC_WFA : indicator === 'lhfa' ? CDC_HFA : indicator === 'bfa' ? CDC_BFA : null;
    if (!table) return null;
    const lms = lmsAt(tableFor(table, gender), age);
    if (!lms) return null;
    return { z: zFromLms(value, lms[0], lms[1], lms[2]), standard: 'CDC' };
  }
  return null;
}

export function assessRecord(child: Child, record: GrowthRecord): RecordAssessment {
  const { age, corrected } = growthAgeMonths(child, record.date);
  const results: IndicatorResult[] = [];
  const push = (indicator: Indicator, value: number, height?: number) => {
    const r = zScore(indicator, child.gender, age, value, height);
    if (!r) return;
    const info = indicatorInfo(indicator, age);
    const percentile = zToPercentile(r.z);
    const bands = r.standard === 'WHO' ? WHO_BANDS[indicator] : CDC_BANDS[indicator];
    if (!bands || !bands.length) return;
    const category = categorize(bands, r.standard === 'WHO' ? r.z : percentile);
    results.push({ indicator, short: info.short, label: info.label, unit: info.unit, value, z: r.z, percentile, category, standard: r.standard });
  };
  const w = record.weightKg;
  const h = record.heightCm;
  const hc = record.headCircumferenceCm;
  if (hasValue(h)) push('lhfa', h);
  if (hasValue(w) && hasValue(h)) {
    if (age <= WHO_MAX_MONTH) push('wflh', w, h);
    push('bfa', bmi(w, h));
  }
  if (hasValue(w)) push('wfa', w);
  if (hasValue(hc)) push('hcfa', hc);
  return { age, corrected, standard: results[0]?.standard ?? null, results };
}

/* ------------------------------------------------------------------ */
/* Summary status                                                      */
/* ------------------------------------------------------------------ */

export type GrowthLevel = 'normal' | 'watch' | 'concern' | 'out_of_range' | 'empty';

export interface GrowthStatus {
  level: GrowthLevel;
  tone: GrowthTone;
  title: string;
  short: string;
  description: string;
  assessment: RecordAssessment | null;
  /** Indicators shown as chips on cards (nutrition first) */
  chips: IndicatorResult[];
  trend: TrendNote | null;
}

export interface TrendNote {
  tone: GrowthTone;
  text: string;
}

export function sortRecords(records: GrowthRecord[]): GrowthRecord[] {
  return records.slice().sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
}

export function latestRecord(records: GrowthRecord[]): GrowthRecord | null {
  const sorted = sortRecords(records);
  return sorted.length ? sorted[sorted.length - 1] : null;
}

const CHIP_ORDER: Indicator[] = ['wflh', 'bfa', 'lhfa', 'wfa', 'hcfa'];

/** Compare the last two measurements: weight change and percentile drift */
export function trendNote(child: Child, records: GrowthRecord[]): TrendNote | null {
  const sorted = sortRecords(records).filter((r) => hasValue(r.weightKg));
  if (sorted.length < 2) return null;
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const days = daysBetween(parseDate(prev.date), parseDate(last.date));
  if (days <= 0) return null;
  const grams = Math.round((last.weightKg - prev.weightKg) * 1000);
  const a = zScore('wfa', child.gender, growthAgeMonths(child, prev.date).age, prev.weightKg);
  const b = zScore('wfa', child.gender, growthAgeMonths(child, last.date).age, last.weightKg);
  const span = days < 45 ? `${days} hari` : `${Math.round(days / 30.4)} bulan`;
  const change = grams >= 0 ? `naik ${grams.toLocaleString('id-ID')} gram` : `turun ${Math.abs(grams).toLocaleString('id-ID')} gram`;
  if (grams < 0) return { tone: 'danger', text: `Berat ${change} dalam ${span}. Berat badan anak seharusnya terus naik, sebaiknya konsultasikan.` };
  if (a && b && a.standard === b.standard && a.z - b.z >= 0.67) {
    return { tone: 'warning', text: `Berat ${change} dalam ${span}, tetapi posisinya di kurva turun dari ${percentileLabel(zToPercentile(a.z))} ke ${percentileLabel(zToPercentile(b.z))}. Pantau lebih sering.` };
  }
  if (grams === 0 && growthAgeMonths(child, last.date).age < 24) {
    return { tone: 'warning', text: `Berat tidak naik dalam ${span}. Cek kecukupan ASI atau MPASI, lalu ukur ulang.` };
  }
  return { tone: 'success', text: `Berat ${change} dalam ${span}.` };
}

export function getGrowthStatus(child: Child, records: GrowthRecord[]): GrowthStatus {
  const latest = latestRecord(records);
  const name = child.name;
  if (!latest) {
    return {
      level: 'empty',
      tone: 'neutral',
      title: 'Belum ada data pengukuran',
      short: 'Belum ada data',
      description: `Catat berat, panjang atau tinggi, dan lingkar kepala ${name} untuk melihat posisinya di kurva.`,
      assessment: null,
      chips: [],
      trend: null,
    };
  }
  const assessment = assessRecord(child, latest);
  const chips = CHIP_ORDER.map((k) => assessment.results.find((r) => r.indicator === k)).filter(Boolean) as IndicatorResult[];
  // BB/PB already covers nutrition for under-fives: do not show IMT/U twice
  const visible = chips.filter((c) => !(c.indicator === 'bfa' && chips.some((x) => x.indicator === 'wflh')));
  const trend = trendNote(child, records);
  if (!visible.length) {
    return {
      level: 'out_of_range',
      tone: 'neutral',
      title: 'Di luar rentang kurva aplikasi',
      short: 'Pantau rutin',
      description: `Kurva di aplikasi mencakup usia 0 sampai 8 tahun. Diskusikan grafik ${name} bersama dokter anak.`,
      assessment,
      chips: [],
      trend,
    };
  }
  const red = visible.filter((c) => c.category.tone === 'danger');
  const yellow = visible.filter((c) => c.category.tone === 'warning');
  if (red.length) {
    return {
      level: 'concern',
      tone: 'danger',
      title: red.map((r) => r.category.label).join(', '),
      short: 'Perlu konsultasi',
      description: `${red[0].short}: ${red[0].category.label.toLowerCase()}. ${red[0].category.advice}`,
      assessment,
      chips: visible,
      trend,
    };
  }
  if (yellow.length || trend?.tone === 'warning' || trend?.tone === 'danger') {
    const first = yellow[0];
    return {
      level: 'watch',
      tone: 'warning',
      title: first ? first.category.label : 'Kenaikan berat perlu dipantau',
      short: 'Perlu dipantau',
      description: first ? `${first.short}: ${first.category.label.toLowerCase()}. ${first.category.advice}` : trend!.text,
      assessment,
      chips: visible,
      trend,
    };
  }
  return {
    level: 'normal',
    tone: 'success',
    title: 'Pertumbuhan sesuai usia',
    short: 'Sesuai usianya',
    description: `Semua indikator ${name} berada di rentang normal ${assessment.standard === 'CDC' ? 'CDC' : 'WHO'}. Pertahankan gizi seimbang dan ukur rutin.`,
    assessment,
    chips: visible,
    trend,
  };
}

/* ------------------------------------------------------------------ */
/* Chart helpers                                                       */
/* ------------------------------------------------------------------ */

export interface CurvePoint {
  x: number;
  y: number;
}

/** Reference curve for a z (WHO) or percentile (CDC) value across the chart's x range */
export function referenceCurve(indicator: Indicator, gender: Child['gender'], standard: GrowthStandard, xs: number[], level: number, phase: 'length' | 'height'): CurvePoint[] {
  const out: CurvePoint[] = [];
  for (const x of xs) {
    let lms: [number, number, number] | null = null;
    if (standard === 'WHO') {
      if (indicator === 'wflh') lms = lmsAt(tableFor(phase === 'length' ? WHO_WFL : WHO_WFH, gender), x);
      else if (indicator === 'lhfa' || indicator === 'bfa') {
        const table = indicator === 'lhfa' ? WHO_LHFA : WHO_BFA;
        const l24 = indicator === 'lhfa' ? WHO_LHFA_LENGTH24 : WHO_BFA_LENGTH24;
        const rows = tableFor(table, gender);
        const use =
          phase === 'length'
            ? [...rows.filter((r) => r[0] < 24), (gender === 'P' ? l24.girls : l24.boys) as LmsRow]
            : rows.filter((r) => r[0] >= 24);
        lms = lmsAt(use, x);
      } else lms = lmsAt(tableFor(indicator === 'wfa' ? WHO_WFA : WHO_HCFA, gender), x);
      if (lms) out.push({ x, y: valueAtZ(lms[0], lms[1], lms[2], level) });
    } else {
      const table = indicator === 'wfa' ? CDC_WFA : indicator === 'lhfa' ? CDC_HFA : CDC_BFA;
      lms = lmsAt(tableFor(table, gender), x);
      if (lms) out.push({ x, y: valueAtZ(lms[0], lms[1], lms[2], percentileToZ(level)) });
    }
  }
  return out;
}

/** Inverse normal CDF (Acklam) for percentile lines */
export function percentileToZ(p: number): number {
  const q = Math.min(0.9999, Math.max(0.0001, p / 100));
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  if (q < plow) {
    const r = Math.sqrt(-2 * Math.log(q));
    return (((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) / ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1);
  }
  if (q > 1 - plow) {
    const r = Math.sqrt(-2 * Math.log(1 - q));
    return -(((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) / ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1);
  }
  const r = q - 0.5;
  const s = r * r;
  return ((((((a[0] * s + a[1]) * s + a[2]) * s + a[3]) * s + a[4]) * s + a[5]) * r) / (((((b[0] * s + b[1]) * s + b[2]) * s + b[3]) * s + b[4]) * s + 1);
}
