import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle, 
  Award, 
  Printer, 
  ChevronRight, 
  ArrowLeft, 
  Play, 
  BriefcaseMedical, 
  AlertTriangle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Child, Screening, ScreeningType } from '../types';

interface ScreeningHubProps {
  child: Child;
  onNavigateToBooking: (serviceType: string, therapistId?: string) => void;
}

// ----------------------------------------------------
// QUESTIONNAIRES SEED DATA (Authentic KPSP & M-CHAT-R)
// ----------------------------------------------------

const KPSP_18_MONTHS = [
  { id: 'k_18_1', text: 'Tanpa dibantu, dapatkah anak bertepuk tangan atau melambaikan tangan "da-da" saat berpisah?' },
  { id: 'k_18_2', text: 'Dapatkah anak meletakkan satu balok/kubus di atas balok lain tanpa menjatuhkannya (menyusun menara 2 balok)?' },
  { id: 'k_18_3', text: 'Apakah anak sering menirukan kata-kata baru yang Bunda ucapkan (minimal mencoba menirukan suara)?' },
  { id: 'k_18_4', text: 'Dapatkah anak menunjuk minimal satu anggota badannya (seperti mata, hidung, mulut) saat Bunda bertanya?' },
  { id: 'k_18_5', text: 'Apakah anak dapat berjalan tegak ke depan tanpa dibantu atau merambat pada furnitur?' },
  { id: 'k_18_6', text: 'Dapatkah anak menggelindingkan bola ke arah Bunda ketika diajak bermain bersama di lantai?' },
  { id: 'k_18_7', text: 'Dapatkah anak minum dari gelas sendiri tanpa menumpahkan sebagian besar isinya?' },
  { id: 'k_18_8', text: 'Dapatkah anak menunjuk ke atas dengan jari telunjuknya saat melihat burung terbang atau cicak di plafon?' },
  { id: 'k_18_9', text: 'Apakah anak suka bermain pura-pura atau meniru aktivitas rumah tangga (misal menyapu, menyuapi boneka)?' },
  { id: 'k_18_10', text: 'Dapatkah anak mengucapkan minimal 3-5 kata tunggal yang bermakna (misal "mimi", "mam", "bobo")?' }
];

const M_CHAT_R_ITEMS = [
  { id: 'm_1', text: 'Jika Anda menunjuk sesuatu di ruangan, apakah anak Anda melihat ke arah yang Anda tunjuk?', scoreOn: 'Tidak' },
  { id: 'm_2', text: 'Pernahkah Anda bertanya-tanya apakah anak Anda mengalami gangguan pendengaran (tuli)?', scoreOn: 'Ya' },
  { id: 'm_3', text: 'Apakah anak Anda bermain pura-pura atau roleplay (misal berpura-pura minum dari gelas kosong, memasak)?', scoreOn: 'Tidak' },
  { id: 'm_4', text: 'Apakah anak Anda suka memanjat benda-benda (misal memanjat kursi, furnitur, tangga bermain)?', scoreOn: 'Tidak' },
  { id: 'm_5', text: 'Apakah anak Anda membuat gerakan jari-jari yang aneh di dekat matanya (seperti mengepakkan jemari)?', scoreOn: 'Ya' },
  { id: 'm_6', text: 'Apakah anak Anda tertarik pada anak-anak lain dan mencoba berteman atau bermain bersama mereka?', scoreOn: 'Tidak' },
  { id: 'm_7', text: 'Apakah anak Anda menunjuk dengan satu jari untuk menunjukkan sesuatu yang menarik (misal pesawat di langit)?', scoreOn: 'Tidak' },
  { id: 'm_8', text: 'Apakah anak Anda menunjuk dengan satu jari untuk meminta sesuatu (misal mainan yang tidak terjangkau)?', scoreOn: 'Tidak' },
  { id: 'm_9', text: 'Apakah anak Anda membawa benda kepada Anda untuk menunjukkan sesuatu yang menarik bagi dirinya?', scoreOn: 'Tidak' },
  { id: 'm_10', text: 'Apakah anak Anda merespons seketika ketika namanya dipanggil (misal menoleh, menatap atau tersenyum)?', scoreOn: 'Tidak' },
  { id: 'm_11', text: 'Ketika Anda tersenyum pada anak Anda, apakah ia tersenyum kembali pada Anda?', scoreOn: 'Tidak' },
  { id: 'm_12', text: 'Apakah anak Anda merasa terganggu secara berlebihan oleh suara-suara bising harian (seperti blender, vakum)?', scoreOn: 'Ya' },
  { id: 'm_13', text: 'Apakah anak Anda bisa berjalan tegak tanpa dipapah?', scoreOn: 'Tidak' },
  { id: 'm_14', text: 'Apakah anak Anda menatap mata Anda secara langsung (kontak mata) saat Anda berbicara atau bermain dengannya?', scoreOn: 'Tidak' },
  { id: 'm_15', text: 'Apakah anak Anda mencoba meniru apa yang Anda lakukan (misal melambaikan tangan, tepuk tangan)?', scoreOn: 'Tidak' },
  { id: 'm_16', text: 'Jika Anda memutar kepala untuk melihat sesuatu, apakah anak Anda ikut memutar kepala untuk melihat objek itu?', scoreOn: 'Tidak' },
  { id: 'm_17', text: 'Apakah anak Anda berusaha membuat Anda melihat ke arah dirinya (misal berteriak, menarik baju)?', scoreOn: 'Tidak' },
  { id: 'm_18', text: 'Apakah anak Anda memahami apa yang Anda katakan (misal instruksi sederhana "ambil sepatu")?', scoreOn: 'Tidak' },
  { id: 'm_19', text: 'Jika terjadi suara keras tiba-tiba, apakah anak Anda menoleh untuk melihat apa yang terjadi?', scoreOn: 'Tidak' },
  { id: 'm_20', text: 'Apakah anak Anda menyukai aktivitas bergerak yang dinamis (seperti diayun, ditimang-timang)?', scoreOn: 'Tidak' }
];

const SPEECH_DELAY_ITEMS = [
  { id: 's_1', text: 'Apakah anak Anda secara konsisten mengoceh menggunakan konsonan ganda (babbling, seperti bababa, dadada, mamama)?' },
  { id: 's_2', text: 'Apakah anak Anda menoleh atau mencari sumber suara secara spontan saat dipanggil namanya?' },
  { id: 's_3', text: 'Apakah anak Anda menirukan bunyi atau intonasi suara orang dewasa di sekitarnya?' },
  { id: 's_4', text: 'Apakah anak Anda mengerti minimal 10-15 instruksi verbal sederhana tanpa disertai bahasa isyarat/tangan?' },
  { id: 's_5', text: 'Apakah anak Anda menunjuk benda yang ia inginkan menggunakan telunjuk untuk mengomunikasikannya?' },
  { id: 's_6', text: 'Apakah anak Anda sudah bisa menggabungkan minimal 2 kata tunggal menjadi kalimat permintaan (misal: "Mimi susu", "Mau mam")?' }
];

export default function ScreeningHub({ child, onNavigateToBooking }: ScreeningHubProps) {
  const [screeningsHistory, setScreeningsHistory] = useState<Screening[]>([]);
  const [activeScreeningType, setActiveScreeningType] = useState<ScreeningType | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'Ya' | 'Tidak'>>({});
  const [viewReport, setViewReport] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScreeningHistory();
  }, [child.id]);

  const fetchScreeningHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/screenings/${child.id}`);
      if (response.ok) {
        const data = await response.json();
        setScreeningsHistory(data);
      }
    } catch (err) {
      console.error('Failed to load screening history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScreening = (type: ScreeningType) => {
    setActiveScreeningType(type);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setViewReport(null);
  };

  const handleAnswer = (val: 'Ya' | 'Tidak') => {
    const questions = getQuestions();
    const currentQ = questions[currentQuestionIdx];
    
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }));

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Calculate and finalize score!
      finalizeScreening({ ...answers, [currentQ.id]: val });
    }
  };

  const getQuestions = () => {
    if (activeScreeningType === 'kpsp') return KPSP_18_MONTHS;
    if (activeScreeningType === 'mchat_r') return M_CHAT_R_ITEMS;
    return SPEECH_DELAY_ITEMS;
  };

  const finalizeScreening = async (finalAnswers: Record<string, 'Ya' | 'Tidak'>) => {
    const questions = getQuestions();
    let score = 0;
    let result: Screening['result'] = 'normal';
    let recommendation = '';

    if (activeScreeningType === 'kpsp') {
      // KPSP scoring: Count "Ya"
      score = Object.values(finalAnswers).filter(ans => ans === 'Ya').length;
      if (score >= 9) {
        result = 'normal';
        recommendation = `Perkembangan Aiden dinilai sesuai (Normal). Lanjutkan stimulasi rutin harian sesuai panduan aktivitas FlourishCare dan ulangi pengisian KPSP Kemenkes 3 bulan lagi saat Aiden menginjak usia 21 bulan.`;
      } else if (score >= 7) {
        result = 'meragukan';
        recommendation = `Hasil KPSP menunjukkan perkembangan Aiden Meragukan (Kuning). Disarankan melakukan stimulasi terarah secara intensif selama 2 minggu di rumah pada aspek yang belum tercapai, kemudian lakukan skrining ulang. Jika hasil tetap meragukan, jadwalkan janji temu dengan psikolog anak FlourishCare.`;
      } else {
        result = 'penyimpangan';
        recommendation = `Hasil KPSP menunjukkan indikasi Penyimpangan Tumbuh Kembang (Merah). Hal ini memerlukan pemeriksaan klinis menyeluruh oleh psikolog anak senior atau dokter spesialis anak tumbuh kembang (pediatris) sesegera mungkin untuk intervensi dini.`;
      }
    } else if (activeScreeningType === 'mchat_r') {
      // M-CHAT-R scoring: Count responses that match 'scoreOn' risk trigger
      score = M_CHAT_R_ITEMS.filter(item => finalAnswers[item.id] === item.scoreOn).length;
      if (score <= 2) {
        result = 'risiko_rendah';
        recommendation = `Risiko ASD (Autisme) dinilai Rendah. Tidak diperlukan tindakan lanjutan kecuali terdapat kekhawatiran perilaku lain dari orang tua. Tetap pantau milestone sosial emosional secara berkala.`;
      } else if (score <= 7) {
        result = 'risiko_sedang';
        recommendation = `Risiko ASD dinilai Sedang. Direkomendasikan melakukan follow-up interview klinis terfokus dengan psikolog anak FlourishCare untuk memverifikasi item risiko sedang dan menyusun program stimulasi taktil/sensori yang terfokus.`;
      } else {
        result = 'risiko_tinggi';
        recommendation = `Risiko ASD terdeteksi Tinggi (Red Flag). Disarankan untuk segera menjadwalkan Asesmen Diagnostik Autisme komprehensif (ADOS/CARS) dengan Psikolog Klinis Anak di Klinik FlourishCare Tebet guna merencanakan terapi wicara dan okupasi intervensi dini yang terintegrasi.`;
      }
    } else {
      // Speech Delay screening: Count "Ya" (Normal indicators)
      score = Object.values(finalAnswers).filter(ans => ans === 'Ya').length;
      if (score >= 5) {
        result = 'normal';
        recommendation = `Kemampuan bahasa dan komunikasi Aiden berada pada rentang Normal. Teruskan stimulasi verbal aktif, hindari paparan gadget, dan biasakan membacakan buku dongeng interaktif sebelum tidur.`;
      } else {
        result = 'risiko_tinggi'; // Red Flag Speech delay
        recommendation = `Terdeteksi risiko Keterlambatan Bicara (Speech Delay - Red Flag). Dikarenakan Aiden belum merespons suara secara konsisten atau kosakata masih sangat terbatas, kami menyarankan Bunda untuk segera menjadwalkan evaluasi klinis dengan Terapis Wicara (Speech Therapist) FlourishCare untuk intervensi verbal yang terukur.`;
      }
    }

    try {
      const response = await fetch('/api/screenings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: child.id,
          type: activeScreeningType,
          ageMonthAtTest: 18,
          answers: finalAnswers,
          score,
          result,
          recommendation
        })
      });

      if (response.ok) {
        const newScreening = await response.json();
        setViewReport(newScreening);
        setActiveScreeningType(null);
        fetchScreeningHistory();
      }
    } catch (err) {
      console.error('Failed to submit screening:', err);
    }
  };

  const getScreeningTitle = (type: ScreeningType) => {
    if (type === 'kpsp') return 'KPSP Kemenkes RI (Deteksi Dini Perkembangan)';
    if (type === 'mchat_r') return 'M-CHAT-R (Skrining Risiko Autisme)';
    return 'Skrining Keterlambatan Bicara (Speech Delay)';
  };

  const getResultBadgeStyle = (result: Screening['result']) => {
    if (result === 'normal' || result === 'risiko_rendah') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (result === 'meragukan' || result === 'risiko_sedang') {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
      return 'bg-red-50 text-red-800 border-red-200';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-orange-100/60 shadow-md p-6 font-sans print:border-none print:shadow-none print:p-0">
      
      {/* 1. REPORT PRINT VIEW SCREEN (F08) */}
      {viewReport ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-orange-100 pb-4 print:hidden">
            <button
              onClick={() => setViewReport(null)}
              className="text-xs font-bold text-brand-brown/70 hover:text-brand-orange flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Layanan Skrining
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-brand-orange text-white hover:bg-brand-orange/95 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-orange-100"
            >
              <Printer className="w-4 h-4" /> Cetak Laporan / Simpan PDF
            </button>
          </div>

          {/* Printable branded PDF Report card */}
          <div className="p-6 md:p-8 bg-amber-50/20 border border-orange-100 rounded-3xl space-y-6 print:border-none print:bg-white print:p-0">
            
            {/* Report Header Logo Branding */}
            <div className="flex items-center justify-between border-b-2 border-brand-orange/40 pb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold text-lg font-display">FC</div>
                <div>
                  <h1 className="text-xl font-black text-brand-brown font-display">FlourishCare</h1>
                  <p className="text-[10px] text-brand-brown/60 tracking-wider font-extrabold">Klinik Tumbuh Kembang & Intervensi Dini Terpadu</p>
                </div>
              </div>
              <div className="text-right text-xs text-brand-brown/60 font-semibold leading-relaxed">
                <div>LAPORAN HASIL SKRINING MANDIRI</div>
                <div className="font-extrabold text-brand-brown">KODE: FCS-{viewReport.id.substring(2,8).toUpperCase()}</div>
              </div>
            </div>

            {/* Child Profile Metadata Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50 text-xs font-bold text-brand-brown">
              <div>
                <span className="text-[9px] text-brand-brown/50 block">NAMA ANAK</span>
                <span className="text-sm font-black text-brand-brown">{child.name}</span>
              </div>
              <div>
                <span className="text-[9px] text-brand-brown/50 block">USIA KOREKSI</span>
                <span className="text-sm font-black text-brand-brown">{viewReport.ageMonthAtTest} Bulan</span>
              </div>
              <div>
                <span className="text-[9px] text-brand-brown/50 block">TANGGAL SKRINING</span>
                <span className="text-sm font-black text-brand-brown">
                  {new Date(viewReport.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-brand-brown/50 block">INSTRUMEN UJI</span>
                <span className="text-sm font-black text-brand-orange">{viewReport.type}</span>
              </div>
            </div>

            {/* Screening Clinical Results Zone */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BriefcaseMedical className="w-5 h-5 text-brand-orange" />
                <h3 className="font-extrabold text-sm text-brand-brown tracking-wider">
                  Hasil Evaluasi Diagnostik Sementara
                </h3>
              </div>

              <div className={`p-5 rounded-2xl border-2 flex items-start gap-4 ${getResultBadgeStyle(viewReport.result)}`}>
                {viewReport.result.includes('normal') || viewReport.result.includes('rendah') ? (
                  <CheckCircle className="w-7 h-7 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-7 h-7 shrink-0 text-amber-600 mt-0.5" />
                )}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold tracking-wider opacity-60">KESIMPULAN METRIK (SKOR: {viewReport.score})</div>
                  <h4 className="text-lg font-black font-display">
                    {viewReport.result.replace('_', ' ')}
                  </h4>
                  <p className="text-xs leading-relaxed font-semibold opacity-95">
                    {viewReport.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Answer Logs Checklist */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-xs text-brand-brown tracking-wider">
                Rincian Tanggapan Butir Soal ({Object.keys(viewReport.answers).length} Item)
              </h3>
              <div className="border border-orange-100 rounded-2xl overflow-hidden bg-white divide-y divide-orange-50/50">
                {getQuestions().map((q, idx) => {
                  const ans = viewReport.answers[q.id];
                  return (
                    <div key={q.id} className="p-3.5 flex items-start justify-between gap-4 text-xs font-semibold text-brand-brown/85">
                      <div className="flex gap-2.5">
                        <span className="text-brand-brown/40 font-bold">{idx + 1}.</span>
                        <p className="leading-relaxed max-w-xl">{q.text}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg font-black text-[10px] ${
                        ans === 'Ya' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-semantic-danger'
                      }`}>
                        {ans}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clinician Disclaimer Signature */}
            <div className="pt-6 border-t border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-6 text-[11px] text-brand-brown/65 leading-relaxed font-semibold">
              <div className="max-w-md">
                <p className="font-extrabold text-brand-brown mb-1">⚠️ DISCLAIMER KLINIS PENTING</p>
                Laporan ini adalah instrumen skrining edukatif mandiri berbasis pedoman KPSP Kemenkes RI dan M-CHAT-R untuk deteksi dini tumbuh kembang anak di rumah. Laporan ini <strong>BUKAN merupakan diagnosis medis, psikologis, atau psikiatrik resmi</strong>. Diagnosis formal hanya dapat diterbitkan oleh Dokter Spesialis Anak, Psikolog Anak, atau Terapis berlisensi melalui evaluasi klinis langsung.
              </div>
              <div className="text-center md:text-right shrink-0">
                <p className="mb-8">Tim Expert FlourishCare,</p>
                <div className="underline font-black text-brand-brown text-xs font-display">Ira Amanda, M.Psi., Psikolog</div>
                <p className="text-[10px] text-brand-brown/50">Psikolog Klinis Anak Senior (SIPP: 1982-12-09)</p>
              </div>
            </div>

          </div>

          {/* Action Call to Action when non-normal (F05 red-flag escalates to active Booking) */}
          {(!viewReport.result.includes('normal') && !viewReport.result.includes('rendah')) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl border border-red-200/50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm print:hidden"
            >
              <div className="space-y-1.5 text-center md:text-left">
                <h4 className="font-black text-brand-brown text-base">Butuh Evaluasi Langsung & Terapi Cepat?</h4>
                <p className="text-xs text-brand-brown/75 leading-relaxed max-w-xl font-medium">
                  Hasil skrining Aiden menunjukkan indikasi {viewReport.result.replace('_', ' ')}. Jangan tunda intervensi dini. Jadwalkan sesi konsultasi psikolog atau evaluasi terapi okupasi/wicara di Klinik Tebet atau Home Visit sekarang.
                </p>
              </div>
              <button
                onClick={() => {
                  const targetTherapist = viewReport.type === 'mchat_r' ? 'exp_siti' : 'exp_ira';
                  onNavigateToBooking(viewReport.type === 'mchat_r' ? 'psikolog' : 'onsite', targetTherapist);
                }}
                className="bg-brand-orange text-white hover:bg-brand-orange/95 px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 shadow-md shadow-orange-100"
              >
                Booking Jadwal Klinik Sekarang <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

        </div>
      ) : activeScreeningType ? (
        
        // 2. ACTIVE QUESTIONNAIRE STEP WIZARD
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-orange-50 pb-4">
            <button
              onClick={() => setActiveScreeningType(null)}
              className="text-xs font-bold text-brand-brown/70 hover:text-brand-orange flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Batalkan Skrining
            </button>
            <span className="text-xs font-black text-brand-orange bg-orange-50 px-3 py-1 rounded-xl">
              Pertanyaan {currentQuestionIdx + 1} dari {getQuestions().length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-orange-50 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-brand-orange h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIdx + 1) / getQuestions().length) * 100}%` }}
            />
          </div>

          {/* Active Question Panel */}
          <div className="py-8 text-center space-y-8 max-w-xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-brand-brown font-display leading-snug">
              {getQuestions()[currentQuestionIdx].text}
            </h3>

            {/* Answer Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => handleAnswer('Ya')}
                className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-extrabold text-base shadow-md shadow-emerald-100 cursor-pointer"
              >
                Ya / Sesuai
              </button>
              <button
                onClick={() => handleAnswer('Tidak')}
                className="px-10 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-extrabold text-base shadow-md shadow-red-100 cursor-pointer"
              >
                Tidak / Belum
              </button>
            </div>
          </div>

          <div className="p-4 bg-orange-50/25 rounded-2xl border border-orange-100 text-xs text-brand-brown/70 leading-relaxed text-center">
            Pilihlah <strong>"Ya"</strong> jika si Kecil dapat melakukan secara konsisten dalam 2 minggu terakhir, dan <strong>"Tidak"</strong> jika si Kecil jarang, belum pernah, atau sulit melakukannya.
          </div>
        </div>
      ) : (
        
        // 3. MAIN DASHBOARD: HISTORIES & INSTRUMENTS SELECT
        <div className="space-y-8">
          
          {/* Instruments Catalog */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs text-brand-brown tracking-wider">
              Pilih Instrumen Skrining Klinis (Gratis)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  type: 'kpsp' as ScreeningType,
                  title: 'KPSP Kemenkes RI',
                  desc: 'Kuesioner Pra Skrining Perkembangan resmi Kemenkes untuk memantau motorik kasar/halus, bicara & sosialisasi anak.',
                  target: '0 - 6 Tahun (Ulangi tiap 3 bln)',
                  badge: 'Standar KIA'
                },
                {
                  type: 'mchat_r' as ScreeningType,
                  title: 'M-CHAT-R (Risiko Autisme)',
                  desc: '20 instrumen checklist tervalidasi global untuk deteksi dini risiko Autisme (ASD) dan intervensi sensori anak.',
                  target: 'Usia 16 - 30 Bulan',
                  badge: 'Pediatrik Global'
                },
                {
                  type: 'speech_delay' as ScreeningType,
                  title: 'Skrining Keterlambatan Bicara',
                  desc: 'Ceklis terfokus untuk menilai kelancaran verbal, atensi pendengaran, merespon kata, dan risiko speech delay.',
                  target: 'Usia 6 Bulan - 5 Tahun',
                  badge: 'Fokus Wicara'
                }
              ].map((inst) => (
                <div 
                  key={inst.type}
                  className="p-5 rounded-2xl border border-orange-100 hover:border-brand-orange bg-orange-50/5 hover:bg-white flex flex-col justify-between gap-5 transition-all shadow-xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-brand-orange bg-orange-100/50 px-2 py-0.5 rounded">
                        {inst.badge}
                      </span>
                      <span className="text-[10px] text-brand-brown/50 font-bold">{inst.target}</span>
                    </div>
                    <h4 className="font-extrabold text-base text-brand-brown">{inst.title}</h4>
                    <p className="text-xs text-brand-brown/70 leading-relaxed">{inst.desc}</p>
                  </div>
                  
                  <button
                    onClick={() => handleStartScreening(inst.type)}
                    className="w-full bg-brand-orange text-white hover:bg-brand-orange/95 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-orange-100"
                  >
                    Mulai Skrining <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* History Screenings Taken */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs text-brand-brown tracking-wider">
              Riwayat Hasil Skrining ({screeningsHistory.length})
            </h3>

            {loading ? (
              <div className="py-6 text-center text-xs text-brand-brown/40">Memuat riwayat...</div>
            ) : screeningsHistory.length === 0 ? (
              <div className="p-8 border border-dashed border-orange-100 bg-orange-50/10 rounded-2xl text-center space-y-2">
                <FileText className="w-8 h-8 text-orange-200 mx-auto" />
                <h4 className="font-bold text-xs text-brand-brown">Belum Ada Riwayat Skrining</h4>
                <p className="text-xs text-brand-brown/50">Lakukan tes skrining pertama Anda di atas untuk melihat laporan riwayat medis di sini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {screeningsHistory.map((s) => (
                  <div 
                    key={s.id}
                    className="p-4 rounded-2xl border border-orange-100 bg-white flex items-center justify-between gap-4 hover:border-brand-orange transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-orange-50 text-brand-orange text-[10px] font-black rounded">
                          {s.type}
                        </span>
                        <h4 className="font-black text-sm text-brand-brown">{getScreeningTitle(s.type)}</h4>
                      </div>
                      <p className="text-xs text-brand-brown/50 font-semibold">
                        Tanggal Tes: {new Date(s.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; Usia: {s.ageMonthAtTest} Bln &bull; Skor: {s.score}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border ${getResultBadgeStyle(s.result)}`}>
                        {s.result.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => setViewReport(s)}
                        className="p-2 border border-orange-100 hover:border-brand-orange rounded-xl text-brand-orange text-xs font-bold hover:bg-orange-50/10 flex items-center gap-1 cursor-pointer"
                      >
                        Lihat Laporan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
