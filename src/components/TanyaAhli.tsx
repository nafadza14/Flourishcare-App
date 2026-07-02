import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  ShieldCheck, 
  HelpCircle, 
  Lock, 
  Cpu, 
  FileEdit, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { Child, Question } from '../types';
import { CLINICAL_EXPERTS } from '../data/seedData';

interface TanyaAhliProps {
  child: Child;
}

export default function TanyaAhli({ child }: TanyaAhliProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'ask' | 'public'>('ask');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ask Question Form States
  const [newQuestionText, setNewQuestionText] = useState('');
  const [category, setCategory] = useState('wicara');
  const [isAnonym, setIsAnonym] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState(3);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin Answering States
  const [selectedAdminQuestion, setSelectedAdminQuestion] = useState<Question | null>(null);
  const [adminAnswerText, setAdminAnswerText] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [child.id]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);

        // Count questions asked by this child this month to compute quota
        const childQuestions = data.filter((q: Question) => q.childId === child.id);
        setQuotaRemaining(Math.max(0, 3 - childQuestions.length));
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestionText.trim().length < 15) {
      setError('Mohon tulis pertanyaan Bunda minimal 15 karakter agar spesifik.');
      return;
    }

    if (quotaRemaining <= 0) {
      setError('Maaf Bun, kuota tanya ahli gratis Anda bulan ini (3 kali) sudah habis.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: child.id,
          title: `Tanya seputar ${category}`,
          content: newQuestionText,
          category,
          isPublic: !isAnonym
        })
      });

      if (response.ok) {
        setNewQuestionText('');
        setSuccess('Pertanyaan berhasil dikirim ke antrean Ahli! Dokter atau Psikolog kami akan segera menjawab.');
        fetchQuestions();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Gagal mengirim pertanyaan.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin submits manual answer to a parent question
  const handleSubmitAdminAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminQuestion || !adminAnswerText.trim()) return;

    try {
      const response = await fetch(`/api/questions/${selectedAdminQuestion.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: 'exp_ira', // Ira Amanda as responder
          answerText: adminAnswerText
        })
      });

      if (response.ok) {
        setSelectedAdminQuestion(null);
        setAdminAnswerText('');
        fetchQuestions();
      }
    } catch (err) {
      console.error('Failed to post answer:', err);
    }
  };

  // AI Assistance drafting using server-side Gemini 3.5-flash
  const handleDraftWithGemini = async () => {
    if (!selectedAdminQuestion) return;
    setIsGeneratingAi(true);
    setAdminAnswerText('Menganalisis pertanyaan klinis & menyusun rekomendasi...');
    try {
      const response = await fetch('/api/questions/answer-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: selectedAdminQuestion.id })
      });

      if (response.ok) {
        const data = await response.json();
        setAdminAnswerText(data.draftText);
      } else {
        throw new Error('Gagal memanggil asisten Gemini.');
      }
    } catch (err: any) {
      setAdminAnswerText('Maaf, asisten medis AI sedang sibuk. Silakan tulis manual.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Filter questions for display
  const personalQuestions = questions.filter(q => q.childId === child.id);
  const publicQuestions = questions.filter(q => q.isPublic && q.status !== 'pending');
  const unansweredQuestions = questions.filter(q => q.status === 'pending');

  const getExpertInfo = (id: string) => {
    return CLINICAL_EXPERTS.find(e => e.id === id);
  };

  return (
    <div className="w-full font-sans space-y-4">
      
      {/* Compact Header Panel with Admin Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-orange-50/50 border border-orange-100/30 rounded-2xl p-3 shadow-xs">
        <div className="flex gap-2 items-start min-w-0">
          <MessageSquare className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold text-brand-brown/80 leading-relaxed min-w-0">
            Tanya Ahli: Konsultasikan tumbuh kembang si Kecil secara langsung dengan Psikolog & Dokter Anak.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAdminMode(!isAdminMode);
            setSelectedAdminQuestion(null);
            setAdminAnswerText('');
          }}
          className={`px-2 py-1 text-[9px] font-black rounded-lg border shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
            isAdminMode 
              ? 'bg-brand-brown text-white border-brand-brown shadow-xs' 
              : 'bg-white text-brand-orange border-orange-200 hover:bg-orange-50/20'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> {isAdminMode ? 'Mode Ibu (Keluar)' : 'Panel Ahli (Admin)'}
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MODE 1: LICENSED CLINICIAN ANSWER PANEL (ADMIN ROLE)              */}
      {/* ----------------------------------------------------------------- */}
      {isAdminMode ? (
        <div className="flex flex-col gap-4">
          
          {/* Unanswered Questions List */}
          <div className="space-y-2">
            <h3 className="font-black text-[9px] text-brand-brown/50 uppercase tracking-wider px-0.5">
              ANTREAN PERTANYAAN BELUM DIJAWAB ({unansweredQuestions.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
              {unansweredQuestions.length === 0 ? (
                <div className="col-span-2 p-5 bg-orange-50/20 border border-dashed rounded-xl text-center text-[10px] text-brand-brown/40 font-bold">
                  Tidak ada pertanyaan antrean saat ini, Dokter!
                </div>
              ) : (
                unansweredQuestions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      setSelectedAdminQuestion(q);
                      setAdminAnswerText('');
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedAdminQuestion?.id === q.id
                        ? 'border-brand-orange bg-orange-50/10'
                        : 'border-orange-100/40 hover:border-brand-orange bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] bg-orange-100 text-brand-orange font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {q.category}
                      </span>
                      <span className="text-[8px] text-brand-brown/40 font-bold">18m anak</span>
                    </div>
                    <p className="text-[10px] font-bold text-brand-brown line-clamp-2 leading-relaxed">
                      {q.questionText}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editor with Gemini AI Draft Generation */}
          <div className="space-y-3">
            {selectedAdminQuestion ? (
              <form onSubmit={handleSubmitAdminAnswer} className="space-y-3 bg-orange-50/15 p-3.5 rounded-2xl border border-orange-100/40">
                <div className="space-y-1">
                  <span className="text-[8.5px] text-brand-brown/40 font-black uppercase tracking-wider">MENJAWAB PERTANYAAN:</span>
                  <div className="p-2.5 bg-white rounded-xl border border-orange-100/20 text-[10px] font-bold text-brand-brown/80 leading-relaxed italic">
                    "{selectedAdminQuestion.questionText}"
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black text-brand-brown uppercase tracking-wider">Rancangan Jawaban Ahli</label>
                    
                    {/* Gemini Assist Draft CTA */}
                    <button
                      type="button"
                      disabled={isGeneratingAi}
                      onClick={handleDraftWithGemini}
                      className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded text-[8.5px] font-black flex items-center gap-0.5 cursor-pointer"
                    >
                      <Cpu className="w-3 h-3 animate-pulse" /> {isGeneratingAi ? 'Menyusun draf...' : 'Draf AI (Gemini)'}
                    </button>
                  </div>

                  <textarea
                    rows={5}
                    required
                    value={adminAnswerText}
                    onChange={(e) => setAdminAnswerText(e.target.value)}
                    placeholder="Tuliskan jawaban klinis di sini..."
                    className="w-full px-3 py-2 border border-orange-100/30 bg-white rounded-xl text-[10.5px] font-bold text-brand-brown focus:outline-none focus:ring-1 focus:ring-brand-orange leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedAdminQuestion(null)}
                    className="px-3 py-1.5 border border-orange-100 text-[10px] font-black text-brand-brown rounded-lg hover:bg-orange-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-brand-orange text-white hover:bg-brand-orange/95 text-[10px] font-black rounded-lg cursor-pointer"
                  >
                    Kirim Jawaban Ahli
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5 border border-dashed border-orange-200 bg-orange-50/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5">
                <ShieldCheck className="w-8 h-8 text-brand-orange/60" />
                <h4 className="font-extrabold text-[11px] text-brand-brown uppercase tracking-wider">Dashboard Klinik Ahli</h4>
                <p className="text-[10px] text-brand-brown/50 max-w-sm leading-relaxed font-bold">
                  Pilih salah satu pertanyaan antrean dari wali murid di atas untuk merespons. Gunakan tombol asisten draft medis Gemini AI untuk otomatis menyusun draf rujukan ilmiah.
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        // -----------------------------------------------------------------
        // MODE 2: CLIENT-SIDE PARENT ASKING PANEL                          //
        // -----------------------------------------------------------------
        <div className="flex flex-col gap-4">
          
          {/* Ask Question & Quota Panel */}
          <div className="bg-orange-50/25 rounded-2xl border border-orange-100/30 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-[11px] text-brand-brown tracking-wider uppercase flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-brand-orange" /> Ajukan Konsultasi Baru
              </h3>
              
              {/* Quota counter indicator */}
              <div className="flex items-center gap-1.5 text-[9px] font-bold">
                <span className="text-brand-brown/50">KUOTA GRATIS:</span>
                <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${
                  quotaRemaining > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-semantic-danger'
                }`}>
                  {quotaRemaining} / 3 Tersisa
                </span>
              </div>
            </div>

            {error && (
              <div className="p-2 bg-red-50 text-[10px] font-bold text-semantic-danger border border-red-100/50 rounded-lg flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
              </div>
            )}

            {success && (
              <div className="p-2 bg-emerald-50 text-[10px] font-bold text-semantic-success border border-emerald-100/50 rounded-lg flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {success}
              </div>
            )}

            <form onSubmit={handleAskQuestion} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-brand-brown uppercase tracking-wider mb-1">Kategori Kendala</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[10px] border border-orange-100 rounded-lg bg-white font-bold text-brand-brown focus:outline-none"
                  >
                    <option value="bicara">Keterlambatan Bicara (Speech Delay)</option>
                    <option value="nutrisi">Nutrisi dan GTM (Sulit Makan)</option>
                    <option value="sensori">Sensori dan Tantrum Berlebih</option>
                    <option value="motorik">Keterlambatan Gerak Motorik</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 pt-4 md:pt-0">
                  <input
                    type="checkbox"
                    id="anonym"
                    checked={isAnonym}
                    onChange={(e) => setIsAnonym(e.target.checked)}
                    className="w-3.5 h-3.5 accent-brand-orange border-orange-200"
                  />
                  <label htmlFor="anonym" className="text-[10px] font-bold text-brand-brown cursor-pointer">
                    Samarkan nama anak saya di FAQ publik (Anonim)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-brand-brown uppercase tracking-wider mb-1">Detail Pertanyaan Bunda</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Aiden (18 bln) belum bisa mengucapkan kata panggil papa mama secara sadar. Apakah ini termasuk red flag speech delay?"
                  value={newQuestionText}
                  onChange={(e) => { setNewQuestionText(e.target.value); setError(''); }}
                  className="w-full px-3 py-2 text-[10.5px] border border-orange-100 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-orange font-semibold text-brand-brown leading-relaxed"
                />
                <span className="text-[8.5px] text-brand-brown/40 block mt-0.5">Minimal 15 karakter. Jelaskan kendala tumbuh kembang spesifik anak Anda harian.</span>
              </div>

              <button
                type="submit"
                disabled={loading || quotaRemaining <= 0}
                className="w-full bg-brand-orange hover:bg-brand-orange/95 text-white py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3 h-3" /> Kirim Pertanyaan Bunda
              </button>
            </form>
          </div>

          {/* Q&A Histories & Public FAQ Tabs */}
          <div className="space-y-3">
            <div className="flex bg-orange-50/50 p-1 rounded-xl w-fit border border-orange-100/20">
              <button
                onClick={() => setActiveTab('ask')}
                className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase transition-all ${
                  activeTab === 'ask' ? 'bg-white text-brand-orange shadow-xs' : 'text-brand-brown/50'
                }`}
              >
                Pertanyaanku ({personalQuestions.length})
              </button>
              <button
                onClick={() => setActiveTab('public')}
                className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase transition-all ${
                  activeTab === 'public' ? 'bg-white text-brand-orange shadow-xs' : 'text-brand-brown/50'
                }`}
              >
                FAQ Publik Terjawab ({publicQuestions.length})
              </button>
            </div>

            {/* Display list based on active sub-tab */}
            {activeTab === 'ask' ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {personalQuestions.length === 0 ? (
                  <div className="py-8 border border-dashed border-orange-100/40 rounded-2xl text-center space-y-1 text-brand-brown/40">
                    <MessageSquare className="w-6 h-6 text-orange-200 mx-auto" />
                    <h4 className="font-bold text-[10px]">Belum Ada Pertanyaan Terkirim</h4>
                    <p className="text-[9px] text-brand-brown/50 font-semibold">Tulis detail keluhan Bunda di kolom di atas untuk berkonsultasi!</p>
                  </div>
                ) : (
                  personalQuestions.map((q) => (
                    <div key={q.id} className="p-3 bg-white border border-orange-100/30 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 bg-orange-50 text-brand-orange text-[8px] font-black rounded uppercase tracking-wider">
                          {q.category}
                        </span>
                        {q.status !== 'pending' ? (
                          <span className="text-[8px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 font-black uppercase tracking-wider">
                            ✓ Dijawab Ahli
                          </span>
                        ) : (
                          <span className="text-[8px] text-brand-brown/40 font-black uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3 text-brand-orange animate-pulse" /> Antrean
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-[8.5px] text-brand-brown/40 font-black uppercase tracking-wider">Pertanyaan Bunda:</div>
                        <p className="text-[10px] font-bold text-brand-brown leading-relaxed">
                          "{q.questionText}"
                        </p>
                      </div>

                      {q.status !== 'pending' && q.answerText && (
                        <div className="p-2.5 bg-emerald-50/15 rounded-xl border border-emerald-100/30 space-y-1">
                          <div className="flex items-center gap-1 text-[9px] font-black text-emerald-900">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> JAWABAN RESMI {q.expertId ? getExpertInfo(q.expertId)?.name.toUpperCase() : 'TIM EXPERT'}:
                          </div>
                          <p className="text-[10px] font-semibold text-brand-brown leading-relaxed whitespace-pre-line">
                            {q.answerText}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Public Anonymized FAQ Catalogue
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {publicQuestions.map((q) => (
                  <div key={q.id} className="p-3 bg-orange-50/5 border border-orange-100/20 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 bg-orange-100/40 text-brand-orange text-[8px] font-black rounded uppercase tracking-wider">
                        FAQ {q.category}
                      </span>
                      <span className="text-[8px] text-brand-brown/40 font-black uppercase tracking-wider">Anonim Ibu Wali</span>
                    </div>

                    <p className="text-[10px] font-bold text-brand-brown leading-relaxed">
                      "Ibu bertanya: {q.questionText}"
                    </p>

                    <div className="p-2.5 bg-white rounded-xl border border-orange-100/20 space-y-1">
                      <div className="flex items-center gap-1 text-[8.5px] font-black text-brand-orange uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" /> Tanggapan Ahli:
                      </div>
                      <p className="text-[10px] font-bold text-brand-brown/70 leading-relaxed whitespace-pre-line">
                        {q.answerText}
                      </p>
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
