/**
 * FlourishCare clinical team.
 * Live data comes from the Supabase table `staff_profiles` (the same table that
 * powers www.flourishcare.id/team). The fallback below mirrors that page so the
 * app still shows the real team when the database cannot be reached.
 * Shared by the browser app and the API server.
 */

export const WEBSITE_ORIGIN = 'https://www.flourishcare.id';
export const CLINIC_LOCATION = 'Klinik Mitra Diani, Jakarta Timur';
/** Signature for content written by the clinic as a whole (not by one person). */
export const TEAM_SIGNATURE = 'Tim FlourishCare';

export interface StaffProfileRow {
  id: string;
  profile_id?: string | null;
  title: string;
  slug?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  specialties?: string[] | null;
  therapy_types?: string[] | null;
  is_visible?: boolean | null;
  display_order?: number | null;
}

export interface ClinicalExpert {
  /** Stable id (slug), identical for live and fallback data */
  id: string;
  /** Full name with credentials, for example "Achla Himmah, M.Psi., Psikolog" */
  name: string;
  /** First name, for friendly copy */
  shortName: string;
  kind: 'psikolog' | 'terapis';
  /** Role label as shown on the website */
  role: string;
  bio: string;
  photoUrl?: string;
  specialties: string[];
  /** Service codes this person handles (see data/pricing.ts) */
  services: string[];
  /** Supabase auth profile id when the staff member has an account */
  profileId?: string | null;
}

const PSYCHOLOGIST_SERVICES = ['KONSUL', 'EVAL', 'IQ', 'SCHOOL', 'DIAG'];
const THERAPY_MATCHERS: [RegExp, string][] = [
  [/^tw$|wicara|speech/i, 'TW'],
  [/^si$|sensori|sensory/i, 'SI'],
  [/^ot$|okupasi|occupational/i, 'OT'],
  [/^bt$|behavio|perilaku/i, 'BT'],
];

function absolutePhoto(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${WEBSITE_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .split(',')[0]
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function mapStaffProfile(row: StaffProfileRow): ClinicalExpert {
  const name = (row.title || '').trim();
  const isPsychologist = /psikolog/i.test(name);
  const specialties = (row.specialties ?? []).filter(Boolean);
  const therapyCodes = Array.from(
    new Set(
      [...(row.therapy_types ?? []), ...specialties].flatMap((label) =>
        THERAPY_MATCHERS.filter(([re]) => re.test(String(label).trim())).map(([, code]) => code),
      ),
    ),
  );
  return {
    id: row.slug || slugify(name) || row.id,
    name,
    shortName: name.split(',')[0].trim().split(/\s+/)[0] || name,
    kind: isPsychologist ? 'psikolog' : 'terapis',
    role: isPsychologist ? 'Psikolog Anak' : 'Terapis Anak',
    bio: (row.bio ?? '').trim(),
    photoUrl: absolutePhoto(row.photo_url),
    specialties,
    services: isPsychologist ? PSYCHOLOGIST_SERVICES : therapyCodes.length ? therapyCodes : ['TW', 'SI', 'OT'],
    profileId: row.profile_id ?? null,
  };
}

/** Mirror of www.flourishcare.id/team, used when staff_profiles cannot be read. */
export const FALLBACK_STAFF: StaffProfileRow[] = [
  {
    id: 'fallback-achla',
    title: 'Achla Himmah, M.Psi., Psikolog',
    slug: 'achla-himmah',
    bio: 'Psikolog anak yang berfokus pada asesmen tumbuh kembang, konseling keluarga, dan pendampingan orang tua. Achla percaya bahwa setiap anak memiliki potensi unik yang dapat mekar dengan pendekatan hangat, sabar, dan berbasis bukti.',
    photo_url: '/team/achla.jpeg',
    specialties: ['Asesmen Anak', 'Konseling Keluarga', 'Kesiapan Sekolah', 'Parenting'],
    display_order: 1,
  },
  {
    id: 'fallback-roffany',
    title: 'Roffany Hasnatu P K, M.Psi., Psikolog',
    slug: 'roffany-hasnatu-p-k',
    bio: 'Psikolog anak yang berdedikasi mendampingi anak dan orang tua di setiap tahap tumbuh kembang. Roffany berpengalaman dalam asesmen perkembangan, konseling anak, serta membantu keluarga menyusun strategi intervensi yang selaras dengan kebutuhan si kecil.',
    photo_url: '/team/roffany.jpeg',
    specialties: ['Asesmen Perkembangan', 'Konseling Anak', 'Intervensi Terapi', 'Kolaborasi Keluarga'],
    display_order: 2,
  },
  {
    id: 'fallback-putri',
    title: 'Putri Solihah, Terapis Anak',
    slug: 'putri-solihah',
    bio: 'Terapis anak yang berpengalaman dalam berbagai jenis terapi tumbuh kembang. Putri mendampingi anak-anak dalam sesi terapi on-site di Klinik Mitra Diani dengan pendekatan yang hangat dan menyenangkan.',
    photo_url: null,
    specialties: ['Terapi Wicara', 'Sensori Integrasi', 'Okupasi Terapi'],
    display_order: 3,
  },
];

export const FALLBACK_TEAM: ClinicalExpert[] = FALLBACK_STAFF.map(mapStaffProfile);

export function findExpertByName(list: ClinicalExpert[], name?: string | null): ClinicalExpert | undefined {
  if (!name) return undefined;
  const key = name.split(',')[0].trim().toLowerCase();
  return list.find((e) => e.name.split(',')[0].trim().toLowerCase() === key);
}
