/* Generated from research data (scratchpad/gen/gen.py). Edit the generator, not this file. */
export interface TddItem { id: string; section: 'ekspresif' | 'reseptif' | 'visual'; text: string; mode: string }
export interface TddForm { fromMonths: number; toMonths: number; label: string; items: TddItem[] }

export const TDD_SOURCE = 'Kemenkes RI, Tes Daya Dengar (TDD), Buku Bagan SDIDTK revisi 2022';
export const TDD_FORMS: TddForm[] = [
 {
  "fromMonths": 0,
  "toMonths": 3,
  "label": "Umur kurang atau sampai 3 bulan",
  "items": [
   {
    "id": "tdd3_eks1",
    "section": "ekspresif",
    "text": "Apakah bayi dapat mengatakan “Aaaaa”, “Ooooo”?",
    "mode": "tanya"
   },
   {
    "id": "tdd3_eks2",
    "section": "ekspresif",
    "text": "Apakah bayi menatap wajah dan tampak mendengarkan Anda, lalu berbicara saat Anda diam?",
    "mode": "tanya"
   },
   {
    "id": "tdd3_eks3",
    "section": "ekspresif",
    "text": "Apakah Anda dapat seolah-olah berbicara dengan bayi Anda?",
    "mode": "tanya"
   },
   {
    "id": "tdd3_res1",
    "section": "reseptif",
    "text": "Apakah bayi kaget bila mendengar suara (mengejapkan mata, napas lebih cepat)?",
    "mode": "tanya"
   },
   {
    "id": "tdd3_res2",
    "section": "reseptif",
    "text": "Apakah bayi kelihatan menoleh bila Anda berbicara di sebelahnya?",
    "mode": "tanya"
   },
   {
    "id": "tdd3_vis1",
    "section": "visual",
    "text": "Apakah bayi Anda dapat tersenyum?",
    "mode": "tanya"
   },
   {
    "id": "tdd3_vis2",
    "section": "visual",
    "text": "Apakah bayi Anda kenal dengan Anda, seperti tersenyum lebih cepat pada Anda dibandingkan orang lain?",
    "mode": "tanya"
   }
  ]
 },
 {
  "fromMonths": 3,
  "toMonths": 6,
  "label": "Umur lebih dari 3 bulan sampai 6 bulan",
  "items": [
   {
    "id": "tdd6_eks1",
    "section": "ekspresif",
    "text": "Apakah bayi Anda dapat tertawa keras?",
    "mode": "tanya"
   },
   {
    "id": "tdd6_eks2",
    "section": "ekspresif",
    "text": "Apakah bayi dapat bermain menggelembungkan mulut seperti meniup balon?",
    "mode": "tanya"
   },
   {
    "id": "tdd6_res1",
    "section": "reseptif",
    "text": "Apakah bayi memberi respons tertentu, seperti menjadi lebih riang bila Anda datang?",
    "mode": "tanya"
   },
   {
    "id": "tdd6_res2",
    "section": "reseptif",
    "text": "Pemeriksa duduk menghadap bayi yang dipangku orang tuanya, bunyikan bel disamping tanpa terlihat bayi, apakah bayi itu menoleh ke samping?",
    "mode": "periksa"
   },
   {
    "id": "tdd6_vis1",
    "section": "visual",
    "text": "Pemeriksa menatap mata bayi sekitar 45 cm, lalu gunakan mainan untuk menarik pandangan bayi ke kiri, kanan, atas, dan bawah. Apakah bayi dapat mengikutinya?",
    "mode": "periksa"
   },
   {
    "id": "tdd6_vis2",
    "section": "visual",
    "text": "Apakah bayi berkedip bila pemeriksa melakukan gerakan menusuk mata, lalu berhenti sekitar 3 cm tanpa menyentuh mata?",
    "mode": "periksa"
   }
  ]
 },
 {
  "fromMonths": 6,
  "toMonths": 12,
  "label": "Umur lebih dari 6 bulan sampai 12 bulan",
  "items": [
   {
    "id": "tdd12_eks1",
    "section": "ekspresif",
    "text": "Apakah bayi dapat membuat suara berulang seperti ‘mamamama’, ‘babababa’?",
    "mode": "tanya"
   },
   {
    "id": "tdd12_eks2",
    "section": "ekspresif",
    "text": "Apakah bayi dapat memanggil mama atau papa, walaupun tidak untuk memanggil orang tuanya?",
    "mode": "tanya"
   },
   {
    "id": "tdd12_res1",
    "section": "reseptif",
    "text": "Pemeriksa duduk mengahadap bayi yang dipangku orang tuanya, bunyikan bel disamping bawah tanpa terlihat bayi, apakah bayi langsung menoleh ke samping bawah?",
    "mode": "periksa"
   },
   {
    "id": "tdd12_res2",
    "section": "reseptif",
    "text": "Apakah anak mengikuti perintah tanpa dibantu gerakan badan, seperti “Stop, berikan mainanmu”?",
    "mode": "tanya"
   },
   {
    "id": "tdd12_vis1",
    "section": "visual",
    "text": "Apakah bayi mengikuti perintah dengan dibantu gerakan badan, seperti “Stop, berikan mainanmu”?",
    "mode": "tanya"
   },
   {
    "id": "tdd12_vis2",
    "section": "visual",
    "text": "Apakah bayi secara spontan memulai permainan dengan gerakan tubuh, seperti ‘Pok Ame-Ame’ atau ‘Cilukba’?",
    "mode": "tanya"
   }
  ]
 }
];
