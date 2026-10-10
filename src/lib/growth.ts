import { Child, GrowthRecord } from '../types';
import { ageInMonthsDecimal } from './format';

export interface WeightStandard {
  ageMonth: number;
  p3: number;
  p15: number;
  median: number;
  p85: number;
  p97: number;
}

// WHO weight-for-age reference points (kg), boys
export const WHO_BOYS_WEIGHT: WeightStandard[] = [
  { ageMonth: 0, p3: 2.4, p15: 2.9, median: 3.3, p85: 3.9, p97: 4.4 },
  { ageMonth: 3, p3: 5.0, p15: 5.7, median: 6.4, p85: 7.2, p97: 8.0 },
  { ageMonth: 6, p3: 6.4, p15: 7.1, median: 7.9, p85: 8.9, p97: 9.8 },
  { ageMonth: 9, p3: 7.2, p15: 8.0, median: 8.9, p85: 10.0, p97: 11.0 },
  { ageMonth: 12, p3: 7.8, p15: 8.6, median: 9.6, p85: 10.8, p97: 12.0 },
  { ageMonth: 15, p3: 8.3, p15: 9.2, median: 10.3, p85: 11.5, p97: 12.8 },
  { ageMonth: 18, p3: 8.8, p15: 9.8, median: 11.0, p85: 12.2, p97: 13.7 },
  { ageMonth: 24, p3: 9.7, p15: 10.8, median: 12.2, p85: 13.6, p97: 15.3 },
];

// WHO weight-for-age reference points (kg), girls
export const WHO_GIRLS_WEIGHT: WeightStandard[] = [
  { ageMonth: 0, p3: 2.3, p15: 2.8, median: 3.2, p85: 3.7, p97: 4.2 },
  { ageMonth: 3, p3: 4.5, p15: 5.2, median: 5.8, p85: 6.6, p97: 7.5 },
  { ageMonth: 6, p3: 5.8, p15: 6.5, median: 7.3, p85: 8.2, p97: 9.3 },
  { ageMonth: 9, p3: 6.5, p15: 7.3, median: 8.2, p85: 9.3, p97: 10.5 },
  { ageMonth: 12, p3: 7.0, p15: 7.9, median: 8.9, p85: 10.1, p97: 11.5 },
  { ageMonth: 15, p3: 7.6, p15: 8.5, median: 9.5, p85: 10.8, p97: 12.4 },
  { ageMonth: 18, p3: 8.1, p15: 9.1, median: 10.2, p85: 11.6, p97: 13.2 },
  { ageMonth: 24, p3: 9.0, p15: 10.1, median: 11.5, p85: 13.0, p97: 14.8 },
];

export const STANDARD_MAX_MONTH = 24;

export function standardsFor(child: Pick<Child, 'gender'>): WeightStandard[] {
  return child.gender === 'P' ? WHO_GIRLS_WEIGHT : WHO_BOYS_WEIGHT;
}

/** Linear interpolation of the reference curve at any age inside the table. */
export function standardAt(standards: WeightStandard[], age: number): WeightStandard | null {
  if (age < standards[0].ageMonth || age > standards[standards.length - 1].ageMonth + 0.5) return null;
  const clamped = Math.min(age, standards[standards.length - 1].ageMonth);
  for (let i = 0; i < standards.length - 1; i++) {
    const a = standards[i];
    const b = standards[i + 1];
    if (clamped >= a.ageMonth && clamped <= b.ageMonth) {
      const t = (clamped - a.ageMonth) / (b.ageMonth - a.ageMonth || 1);
      const lerp = (x: number, y: number) => x + (y - x) * t;
      return {
        ageMonth: clamped,
        p3: lerp(a.p3, b.p3),
        p15: lerp(a.p15, b.p15),
        median: lerp(a.median, b.median),
        p85: lerp(a.p85, b.p85),
        p97: lerp(a.p97, b.p97),
      };
    }
  }
  return standards[standards.length - 1];
}

export type GrowthLevel = 'normal' | 'watch_low' | 'watch_high' | 'low' | 'high' | 'out_of_range' | 'empty';

export interface GrowthStatus {
  level: GrowthLevel;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  title: string;
  short: string;
  description: string;
}

export function sortRecords(records: GrowthRecord[]): GrowthRecord[] {
  return records.slice().sort((a, b) => a.date.localeCompare(b.date));
}

export function latestRecord(records: GrowthRecord[]): GrowthRecord | null {
  const sorted = sortRecords(records);
  return sorted.length ? sorted[sorted.length - 1] : null;
}

export function getWeightStatus(child: Child, records: GrowthRecord[]): GrowthStatus {
  const latest = latestRecord(records);
  if (!latest) {
    return {
      level: 'empty',
      tone: 'neutral',
      title: 'Belum ada data pengukuran',
      short: 'Belum ada data',
      description: `Catat berat dan tinggi ${child.name} untuk melihat posisinya di kurva WHO.`,
    };
  }
  const age = ageInMonthsDecimal(child.birthDate, latest.date);
  const std = standardAt(standardsFor(child), age);
  if (!std) {
    return {
      level: 'out_of_range',
      tone: 'neutral',
      title: 'Di luar rentang kurva aplikasi',
      short: 'Pantau rutin',
      description: `Kurva WHO di aplikasi ini mencakup usia 0 sampai 24 bulan. Untuk usia ${child.name} saat ini, diskusikan grafiknya bersama dokter anak.`,
    };
  }
  const w = latest.weightKg;
  if (w < std.p3) {
    return {
      level: 'low',
      tone: 'danger',
      title: 'Berat badan sangat kurang',
      short: 'Perlu konsultasi',
      description: `Berat ${child.name} berada di bawah persentil ke-3 WHO. Sebaiknya segera dievaluasi dokter anak untuk menilai risiko gizi kurang.`,
    };
  }
  if (w < std.p15) {
    return {
      level: 'watch_low',
      tone: 'warning',
      title: 'Berat badan perlu dipantau',
      short: 'Perlu dipantau',
      description: `Berat ${child.name} ada di zona waspada bawah (antara P3 dan P15). Cek kecukupan ASI atau MPASI, lalu ukur ulang dalam 2 minggu.`,
    };
  }
  if (w > std.p97) {
    return {
      level: 'high',
      tone: 'danger',
      title: 'Berat badan berlebih',
      short: 'Perlu konsultasi',
      description: `Berat ${child.name} di atas persentil ke-97 WHO. Jaga asupan gizi seimbang dan diskusikan dengan dokter anak.`,
    };
  }
  if (w > std.p85) {
    return {
      level: 'watch_high',
      tone: 'warning',
      title: 'Berat badan di batas atas',
      short: 'Perlu dipantau',
      description: `Berat ${child.name} di zona waspada atas. Perbanyak aktivitas fisik dan kurangi camilan manis.`,
    };
  }
  return {
    level: 'normal',
    tone: 'success',
    title: 'Pertumbuhan sesuai usia',
    short: 'Sesuai usianya',
    description: `Berat ${child.name} ada di zona ideal WHO (antara P15 dan P85). Pertahankan gizi seimbang dan stimulasi aktif.`,
  };
}
