/**
 * Observation checklist of early signs, adapted from CDC "Signs and Symptoms of Autism Spectrum
 * Disorder" (public domain, www.cdc.gov/autism). Not the M-CHAT-R/F and not a diagnostic tool:
 * it helps parents notice signs worth discussing with a professional.
 *
 * flagOn: the answer that is a sign to discuss. minMonths: the age from which the item applies.
 */
export interface AutismSignItem {
  id: string;
  group: 'sosial' | 'perilaku';
  text: string;
  flagOn: 'Ya' | 'Tidak';
  minMonths: number;
  /** The sign phrased as an observation, for reports */
  concern: string;
  /** A lost skill is always worth a prompt evaluation */
  strong?: boolean;
}

export const AUTISM_SIGNS_SOURCE =
  "Diadaptasi dari CDC 'Signs and Symptoms of Autism Spectrum Disorder' (www.cdc.gov/autism). Penggunaan materi ini tidak berarti dukungan dari CDC.";

export const AUTISM_SIGNS: AutismSignItem[] = [
  { id: 'as_eye', group: 'sosial', text: 'Apakah si Kecil menatap mata Ayah Bunda saat diajak bicara atau bermain?', flagOn: 'Tidak', minMonths: 6, concern: 'Jarang menatap mata saat diajak bicara atau bermain' },
  { id: 'as_name', group: 'sosial', text: 'Apakah si Kecil menoleh atau merespons saat namanya dipanggil?', flagOn: 'Tidak', minMonths: 9, concern: 'Belum menoleh atau merespons saat namanya dipanggil' },
  { id: 'as_face', group: 'sosial', text: 'Apakah si Kecil menunjukkan ekspresi wajah seperti senang, sedih, marah, atau terkejut?', flagOn: 'Tidak', minMonths: 9, concern: 'Jarang menunjukkan ekspresi wajah seperti senang, sedih, atau terkejut' },
  { id: 'as_games', group: 'sosial', text: "Apakah si Kecil ikut permainan sederhana bergantian, seperti 'Pok Ame-Ame' atau 'Cilukba'?", flagOn: 'Tidak', minMonths: 12, concern: "Belum ikut permainan bergantian seperti 'Cilukba'" },
  { id: 'as_gesture', group: 'sosial', text: "Apakah si Kecil memakai isyarat, misalnya melambaikan tangan 'dadah' atau menggeleng?", flagOn: 'Tidak', minMonths: 12, concern: "Belum memakai isyarat seperti 'dadah' atau menggeleng" },
  { id: 'as_share', group: 'sosial', text: 'Apakah si Kecil memperlihatkan benda kesukaannya kepada Ayah Bunda hanya untuk berbagi rasa senang?', flagOn: 'Tidak', minMonths: 15, concern: 'Belum memperlihatkan benda kesukaan untuk berbagi rasa senang' },
  { id: 'as_point', group: 'sosial', text: 'Apakah si Kecil menunjuk dengan jari untuk memperlihatkan sesuatu yang menarik, misalnya pesawat atau kucing?', flagOn: 'Tidak', minMonths: 18, concern: 'Belum menunjuk untuk memperlihatkan sesuatu yang menarik' },
  { id: 'as_hurt', group: 'sosial', text: 'Apakah si Kecil memperhatikan saat orang lain terluka atau sedih?', flagOn: 'Tidak', minMonths: 24, concern: 'Kurang memperhatikan saat orang lain terluka atau sedih' },
  { id: 'as_peers', group: 'sosial', text: 'Apakah si Kecil memperhatikan anak lain dan ikut bermain bersama mereka?', flagOn: 'Tidak', minMonths: 36, concern: 'Kurang tertarik bermain bersama anak lain' },
  { id: 'as_pretend', group: 'sosial', text: 'Apakah si Kecil bermain peran, misalnya pura-pura menjadi guru, dokter, atau tokoh kesukaannya?', flagOn: 'Tidak', minMonths: 48, concern: 'Belum bermain peran atau pura-pura' },
  { id: 'as_perform', group: 'sosial', text: 'Apakah si Kecil suka bernyanyi, menari, atau berakting untuk Ayah Bunda?', flagOn: 'Tidak', minMonths: 60, concern: 'Jarang bernyanyi, menari, atau berakting untuk Ayah Bunda' },
  { id: 'as_lineup', group: 'perilaku', text: 'Apakah si Kecil sering menjajarkan mainan atau benda dan sangat marah bila urutannya diubah?', flagOn: 'Ya', minMonths: 12, concern: 'Sering menjajarkan benda dan sangat marah bila urutannya diubah' },
  { id: 'as_same', group: 'perilaku', text: 'Apakah si Kecil hampir selalu memainkan mainan dengan cara yang persis sama?', flagOn: 'Ya', minMonths: 12, concern: 'Hampir selalu memainkan mainan dengan cara yang persis sama' },
  { id: 'as_parts', group: 'perilaku', text: 'Apakah si Kecil lebih tertarik pada bagian benda, misalnya terus memutar roda mobil mainan?', flagOn: 'Ya', minMonths: 12, concern: 'Lebih tertarik pada bagian benda, misalnya terus memutar roda' },
  { id: 'as_motor', group: 'perilaku', text: 'Apakah si Kecil sering mengepakkan tangan, mengayun-ayun badan, atau berputar-putar?', flagOn: 'Ya', minMonths: 12, concern: 'Sering mengepakkan tangan, mengayun badan, atau berputar-putar' },
  { id: 'as_sense', group: 'perilaku', text: 'Apakah si Kecil bereaksi tidak biasa terhadap suara, bau, rasa, tampilan, atau tekstur benda?', flagOn: 'Ya', minMonths: 12, concern: 'Bereaksi tidak biasa terhadap suara, bau, rasa, tampilan, atau tekstur' },
  { id: 'as_change', group: 'perilaku', text: 'Apakah si Kecil sangat marah karena perubahan kecil, misalnya rute jalan atau letak barang yang berbeda?', flagOn: 'Ya', minMonths: 18, concern: 'Sangat marah karena perubahan kecil' },
  { id: 'as_echo', group: 'perilaku', text: 'Apakah si Kecil sering mengulang kata atau kalimat yang sama berulang-ulang tanpa tujuan berkomunikasi?', flagOn: 'Ya', minMonths: 24, concern: 'Sering mengulang kata atau kalimat tanpa tujuan berkomunikasi' },
  { id: 'as_interest', group: 'perilaku', text: 'Apakah si Kecil punya minat yang sangat kuat pada satu hal tertentu dan sulit dialihkan?', flagOn: 'Ya', minMonths: 24, concern: 'Minat sangat kuat pada satu hal dan sulit dialihkan' },
  { id: 'as_regress', group: 'sosial', text: 'Apakah si Kecil kehilangan kemampuan bicara atau bersosialisasi yang sebelumnya sudah dimiliki?', flagOn: 'Ya', minMonths: 12, strong: true, concern: 'Kehilangan kemampuan bicara atau bersosialisasi yang sudah dimiliki' },
];
