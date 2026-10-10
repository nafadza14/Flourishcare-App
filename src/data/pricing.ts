/**
 * FlourishCare clinic services and prices (PRD section 9).
 * Shared by the client booking flow and the server, so the amount shown is the amount charged.
 */

export type ServiceCategory = 'onsite' | 'home_visit' | 'psikolog' | 'psikotes';
export type PackageSize = 4 | 8 | 12 | 16;

export interface SubService {
  code: string;
  name: string;
  description: string;
  /** Therapy codes use the package table, others are priced per visit */
  kind: 'therapy' | 'single';
}

export const SERVICE_CATEGORIES: { key: ServiceCategory; title: string; description: string }[] = [
  { key: 'onsite', title: 'Terapi di klinik', description: 'Sesi terapi di rumah tumbuh kembang FlourishCare.' },
  { key: 'home_visit', title: 'Terapi home visit', description: 'Terapis datang ke rumah, radius hingga 10 km.' },
  { key: 'psikolog', title: 'Konsultasi psikolog', description: 'Sesi bersama psikolog anak berpengalaman.' },
  { key: 'psikotes', title: 'Psikotes', description: 'Tes IQ, kesiapan sekolah, dan penegakan diagnosa.' },
];

export const THERAPIES: SubService[] = [
  { code: 'SI', name: 'Sensori Integrasi', description: 'Melatih pengolahan sensori untuk anak yang terlalu sensitif atau mencari stimulasi berlebih.', kind: 'therapy' },
  { code: 'TW', name: 'Terapi Wicara', description: 'Mendukung kemampuan bicara, bahasa, dan komunikasi.', kind: 'therapy' },
  { code: 'OT', name: 'Okupasi Terapi', description: 'Melatih motorik halus, kemandirian, dan aktivitas sehari-hari.', kind: 'therapy' },
  { code: 'BT', name: 'Behavioral Therapy', description: 'Membangun perilaku adaptif dan regulasi emosi.', kind: 'therapy' },
];

export const PSIKOLOG_SERVICES: SubService[] = [
  { code: 'KONSUL', name: 'Konsultasi Psikolog', description: 'Diskusi kekhawatiran tumbuh kembang dan rencana penanganan.', kind: 'single' },
  { code: 'EVAL', name: 'Evaluasi Kematangan Perkembangan', description: 'Evaluasi menyeluruh setiap 16 sesi terapi, gratis untuk evaluasi pertama.', kind: 'single' },
];

export const PSIKOTES_SERVICES: SubService[] = [
  { code: 'IQ', name: 'Tes IQ', description: 'Mengukur kemampuan kognitif anak secara terstandar.', kind: 'single' },
  { code: 'SCHOOL', name: 'Tes Kesiapan Sekolah', description: 'Menilai kesiapan akademik dan sosial untuk masuk sekolah.', kind: 'single' },
  { code: 'DIAG', name: 'Tes Penegakan Diagnosa', description: 'Asesmen klinis untuk menegakkan diagnosa perkembangan.', kind: 'single' },
];

export const PACKAGE_SIZES: PackageSize[] = [4, 8, 12, 16];

// Therapy package prices (Rupiah)
const ONSITE_WEEKDAY: Record<'STD' | 'BT', Record<PackageSize, number>> = {
  STD: { 4: 720000, 8: 1425000, 12: 2130000, 16: 2835000 },
  BT: { 4: 920000, 8: 1825000, 12: 2730000, 16: 3635000 },
};
const ONSITE_WEEKEND: Record<'STD' | 'BT', Record<PackageSize, number>> = {
  STD: { 4: 760000, 8: 1510000, 12: 2250000, 16: 2980000 },
  BT: { 4: 960000, 8: 1910000, 12: 2850000, 16: 3780000 },
};
const HOME_WEEKDAY: Record<PackageSize, number> = { 4: 1440000, 8: 2880000, 12: 4320000, 16: 5760000 };
const HOME_WEEKEND: Record<PackageSize, number> = { 4: 1520000, 8: 3040000, 12: 4560000, 16: 6080000 };

// Single-visit prices: on-site / home visit
const SINGLE_PRICES: Record<string, { onsite: number; home: number }> = {
  KONSUL: { onsite: 300000, home: 600000 },
  EVAL: { onsite: 300000, home: 600000 },
  IQ: { onsite: 350000, home: 700000 },
  SCHOOL: { onsite: 350000, home: 700000 },
  DIAG: { onsite: 350000, home: 700000 },
};

export function subServicesFor(category: ServiceCategory): SubService[] {
  if (category === 'onsite') return THERAPIES;
  if (category === 'home_visit') return THERAPIES.filter((t) => t.code !== 'BT');
  if (category === 'psikolog') return PSIKOLOG_SERVICES;
  return PSIKOTES_SERVICES;
}

export function isTherapyCategory(category: ServiceCategory): boolean {
  return category === 'onsite' || category === 'home_visit';
}

export interface PriceInput {
  category: ServiceCategory;
  subCode: string;
  packageSessions?: PackageSize;
  weekend?: boolean;
  /** For psikolog/psikotes only: visit at home doubles the price */
  atHome?: boolean;
}

export function calculatePrice(input: PriceInput): number {
  const { category, subCode } = input;
  if (isTherapyCategory(category)) {
    const size = (PACKAGE_SIZES.includes(input.packageSessions as PackageSize) ? input.packageSessions : 4) as PackageSize;
    if (category === 'home_visit') {
      return (input.weekend ? HOME_WEEKEND : HOME_WEEKDAY)[size];
    }
    const table = input.weekend ? ONSITE_WEEKEND : ONSITE_WEEKDAY;
    return table[subCode === 'BT' ? 'BT' : 'STD'][size];
  }
  const single = SINGLE_PRICES[subCode] ?? SINGLE_PRICES.KONSUL;
  return input.atHome ? single.home : single.onsite;
}

export function pricePerSession(input: PriceInput): number {
  if (!isTherapyCategory(input.category)) return calculatePrice(input);
  const size = (input.packageSessions ?? 4) as PackageSize;
  return Math.round(calculatePrice(input) / size);
}

export function subServiceName(category: ServiceCategory, code: string): string {
  return subServicesFor(category).find((s) => s.code === code)?.name ?? code;
}

export function categoryTitle(category: string): string {
  return SERVICE_CATEGORIES.find((c) => c.key === category)?.title ?? category;
}
