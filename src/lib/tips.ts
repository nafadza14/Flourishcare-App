export interface ExpertTip {
  text: string;
  author: string;
  role: string;
}

/** Daily tips from the FlourishCare clinical team, rotated by day of year. */
export const DAILY_TIPS: ExpertTip[] = [
  {
    text: 'Puji usaha si Kecil secara spesifik, misalnya "Hebat, kamu berhasil menumpuk tiga balok!". Pujian yang jelas melatih rasa percaya diri dan kemandirian.',
    author: 'Ira Amanda, M.Psi., Psikolog',
    role: 'Psikolog anak',
  },
  {
    text: 'Matikan layar saat bermain bersama. Interaksi tatap muka 15 menit setiap hari jauh lebih bermakna untuk perkembangan bahasa daripada video edukasi.',
    author: 'Dina Lestari, A.Md.TW',
    role: 'Terapis wicara',
  },
  {
    text: 'Biarkan si Kecil bermain dengan tekstur berbeda seperti pasir, air, dan adonan. Pengalaman sensori yang beragam membantu otaknya mengolah rangsangan.',
    author: 'Rian Hidayat, A.Md.OT',
    role: 'Terapis okupasi',
  },
  {
    text: 'Saat anak tantrum, sejajarkan tinggi mata, tenangkan diri lebih dulu, lalu beri nama pada perasaannya. Anak belajar mengatur emosi dari ketenangan orang tuanya.',
    author: 'Siti Sarah, M.Psi., Psikolog',
    role: 'Psikolog tumbuh kembang',
  },
  {
    text: 'Bacakan buku bergambar sebelum tidur dan tunjuk gambarnya sambil menyebut nama benda. Kebiasaan kecil ini memperkaya kosakata si Kecil.',
    author: 'Dina Lestari, A.Md.TW',
    role: 'Terapis wicara',
  },
];

export function tipOfTheDay(date: Date = new Date()): ExpertTip {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}
