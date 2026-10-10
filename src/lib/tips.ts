import { TEAM_SIGNATURE } from '../data/team';

export interface ExpertTip {
  text: string;
  author: string;
  role: string;
}

/** Daily tips from the FlourishCare clinical team, rotated by day of year. */
export const DAILY_TIPS: ExpertTip[] = [
  {
    text: 'Puji usaha si Kecil secara spesifik, misalnya "Hebat, kamu berhasil menumpuk tiga balok!". Pujian yang jelas melatih rasa percaya diri dan kemandirian.',
    author: TEAM_SIGNATURE,
    role: 'Psikolog dan terapis anak',
  },
  {
    text: 'Matikan layar saat bermain bersama. Interaksi tatap muka 15 menit setiap hari jauh lebih bermakna untuk perkembangan bahasa daripada video edukasi.',
    author: TEAM_SIGNATURE,
    role: 'Psikolog dan terapis anak',
  },
  {
    text: 'Biarkan si Kecil bermain dengan tekstur berbeda seperti pasir, air, dan adonan. Pengalaman sensori yang beragam membantu otaknya mengolah rangsangan.',
    author: TEAM_SIGNATURE,
    role: 'Psikolog dan terapis anak',
  },
  {
    text: 'Saat anak tantrum, sejajarkan tinggi mata, tenangkan diri lebih dulu, lalu beri nama pada perasaannya. Anak belajar mengatur emosi dari ketenangan orang tuanya.',
    author: TEAM_SIGNATURE,
    role: 'Psikolog dan terapis anak',
  },
  {
    text: 'Bacakan buku bergambar sebelum tidur dan tunjuk gambarnya sambil menyebut nama benda. Kebiasaan kecil ini memperkaya kosakata si Kecil.',
    author: TEAM_SIGNATURE,
    role: 'Psikolog dan terapis anak',
  },
];

export function tipOfTheDay(date: Date = new Date()): ExpertTip {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}
