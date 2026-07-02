import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Baby, Calendar, ArrowRight, Activity, HelpCircle } from 'lucide-react';
import { Child } from '../types';
import FlourishCareLogo from './FlourishCareLogo';

interface OnboardingProps {
  onComplete: (child: Child) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [concern, setConcern] = useState('umum');
  const [isPremature, setIsPremature] = useState(false);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextStep = () => {
    if (step === 1 && !name.trim()) {
      setError('Tolong masukkan nama si Kecil ya, Bun.');
      return;
    }
    if (step === 2 && !birthDate) {
      setError('Tolong isi tanggal lahir si Kecil untuk perhitungan usia tumbuh kembang.');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const notesCombined = [
        concern !== 'umum' ? `Kekhawatiran utama: ${getConcernLabel(concern)}.` : '',
        medicalNotes.trim()
      ].filter(Boolean).join(' ');

      const childPayload = {
        name,
        birthDate,
        gender,
        isPremature,
        medicalNotes: notesCombined
      };

      let newChild: any = null;
      try {
        const response = await fetch('/api/children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(childPayload),
        });

        if (response.ok) {
          newChild = await response.json();
        } else {
          console.warn('API POST /api/children returned non-OK status. Using local fallback.');
        }
      } catch (fetchErr) {
        console.warn('API POST /api/children failed. Using local fallback.', fetchErr);
      }

      // If API failed, create fallback child object
      if (!newChild) {
        newChild = {
          id: 'c_local_' + Date.now(),
          parentId: 'u_amanda',
          name: name || 'Si Kecil',
          birthDate: birthDate || new Date().toISOString().split('T')[0],
          gender: gender || 'L',
          isPremature: isPremature || false,
          medicalNotes: notesCombined,
          createdAt: new Date().toISOString()
        };

        // Persist to localStorage
        try {
          const currentLocal = JSON.parse(localStorage.getItem('fc_local_children') || '[]');
          currentLocal.push(newChild);
          localStorage.setItem('fc_local_children', JSON.stringify(currentLocal));
        } catch (storageErr) {
          console.warn('Failed to save fallback child to localStorage:', storageErr);
        }
      }

      onComplete(newChild);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  const getConcernLabel = (val: string) => {
    switch (val) {
      case 'speech': return 'Keterlambatan Bicara (Speech Delay)';
      case 'sensori': return 'Sensitif Suara/Tekstur (Sensori Integrasi)';
      case 'behavior': return 'Tantrum berlebih / Perilaku Terbuka';
      case 'growth': return 'Kekhawatiran Tinggi/Berat Badan';
      default: return 'Pemantauan Rutin Umum';
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center px-4 py-8 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-amber-100/40 p-6 border border-orange-100/50">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-20 h-20 bg-white border border-orange-100 rounded-3xl flex items-center justify-center mb-3 p-2 shadow-sm">
            <FlourishCareLogo className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-brown font-display tracking-tight">Flourishcare App</h1>
          <p className="text-sm text-brand-brown/70 mt-1">Rumah Tumbuh Kembang di Genggamanmu</p>
        </div>

        {/* Form Wizard Progress */}
        <div className="flex items-center justify-between mb-8 px-2">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? 'bg-brand-orange text-white' : 'bg-orange-50 text-brand-brown/40 border border-orange-100'
              }`}>
                {s}
              </div>
              {s < 4 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${
                  step > s ? 'bg-brand-orange' : 'bg-orange-100'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-semantic-danger border border-red-100 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Name & Gender */}
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-brand-brown font-display">Halo Ayah & Bunda!</h2>
                <p className="text-sm text-brand-brown/70 mt-1">Siapa nama panggilan buah hati tersayang yang ingin dipantau?</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-brown mb-2 flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-brand-orange" /> Nama Panggilan Anak
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Aiden"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent bg-orange-50/10 font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-brown mb-2">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setGender('L')}
                    className={`py-3 rounded-xl font-bold border flex items-center justify-center gap-2 ${
                      gender === 'L' 
                        ? 'border-brand-orange bg-orange-50 text-brand-orange ring-1 ring-brand-orange' 
                        : 'border-orange-100 bg-white text-brand-brown hover:bg-orange-50/20'
                    }`}
                  >
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('P')}
                    className={`py-3 rounded-xl font-bold border flex items-center justify-center gap-2 ${
                      gender === 'P' 
                        ? 'border-brand-orange bg-orange-50 text-brand-orange ring-1 ring-brand-orange' 
                        : 'border-orange-100 bg-white text-brand-brown hover:bg-orange-50/20'
                    }`}
                  >
                    Perempuan
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-brand-orange text-white py-3.5 rounded-xl font-bold hover:bg-brand-orange/95 shadow-md shadow-orange-200 flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                Lanjutkan <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Birthdate & Premature Status */}
          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-brand-brown font-display">Kapan lahirnya {name}?</h2>
                <p className="text-sm text-brand-brown/70 mt-1">Kami memerlukan tanggal lahir untuk menghitung parameter medis (milestone & persentil pertumbuhan WHO).</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-brown mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-orange" /> Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => { setBirthDate(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent bg-orange-50/10 font-semibold text-brand-brown"
                />
              </div>

              <div className="p-4 bg-orange-50/40 rounded-xl border border-orange-100">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="premature"
                    checked={isPremature}
                    onChange={(e) => setIsPremature(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-brand-orange border-orange-200 rounded"
                  />
                  <div>
                    <label htmlFor="premature" className="block text-sm font-bold text-brand-brown cursor-pointer">
                      Si Kecil lahir prematur?
                    </label>
                    <p className="text-xs text-brand-brown/60 mt-0.5">
                      Centang jika lahir di bawah usia kehamilan 37 minggu. Kami akan otomatis menghitung usia koreksi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="py-3 border border-orange-100 text-brand-brown rounded-xl font-bold hover:bg-orange-50/20"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="col-span-2 bg-brand-orange text-white py-3 rounded-xl font-bold hover:bg-brand-orange/95 flex items-center justify-center gap-2 shadow-md shadow-orange-100"
                >
                  Lanjutkan <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Concerns / Red Flags Focus */}
          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-brand-brown font-display">Concern Utama Anda</h2>
                <p className="text-sm text-brand-brown/70 mt-1">Kami akan mengutamakan panduan dan rekomendasi skrining sesuai kecemasan Bunda saat ini.</p>
              </div>

              {[
                { val: 'umum', title: 'Pemantauan Umum Rutin', desc: 'Ingin memantau perkembangan berat, tinggi, dan vaksinasi biasa.' },
                { val: 'speech', title: 'Keterlambatan Bicara (Speech Delay)', desc: 'Belum merespon panggilan, kosakata minim, atau pasif bersuara.' },
                { val: 'sensori', title: 'Sensori & Perilaku Sensitif', desc: 'Sangat takut suara keras, jijik tekstur, atau pemilih makan.' },
                { val: 'behavior', title: 'Tantrum & Regulasi Emosi', desc: 'Mudah mengamuk, sulit ditenangkan, atau suka melempar barang.' },
                { val: 'growth', title: 'Pertumbuhan Fisik & Nutrisi', desc: 'Khawatir berat badan seret atau tinggi badan kurang.' }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setConcern(item.val)}
                  className={`w-full p-3.5 rounded-xl text-left border flex items-start gap-3 transition-all ${
                    concern === item.val
                      ? 'border-brand-orange bg-orange-50/30 ring-1 ring-brand-orange'
                      : 'border-orange-100 bg-white hover:bg-orange-50/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    concern === item.val ? 'border-brand-orange' : 'border-orange-200'
                  }`}>
                    {concern === item.val && <div className="w-2.5 h-2.5 bg-brand-orange rounded-full" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brand-brown">{item.title}</h4>
                    <p className="text-xs text-brand-brown/60 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              ))}

              <div className="grid grid-cols-3 gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="py-3 border border-orange-100 text-brand-brown rounded-xl font-bold hover:bg-orange-50/20"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="col-span-2 bg-brand-orange text-white py-3 rounded-xl font-bold hover:bg-brand-orange/95 flex items-center justify-center gap-2 shadow-md shadow-orange-100"
                >
                  Lanjutkan <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Medical History & Finalization */}
          {step === 4 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-brand-brown font-display">Catatan Medis Tambahan</h2>
                <p className="text-sm text-brand-brown/70 mt-1">Selesai! Tuliskan jika si Kecil memiliki alergi, riwayat kejang, lahir caesar, atau catatan lain (opsional).</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-brown mb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-brand-orange" /> Riwayat / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Riwayat bilirubin tinggi saat lahir atau alergi susu sapi..."
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent bg-orange-50/10 font-medium text-brand-brown text-sm"
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <Sparkles className="w-6 h-6 text-brand-yellow shrink-0 animate-bounce" />
                <p className="text-xs text-brand-brown/85 leading-relaxed">
                  <strong>Personalisasi Siap:</strong> Kami akan langsung memfilter instrumen KPSP Kemenkes, M-CHAT-R, resep stimulasi harian, dan rekomendasi artikel klinis yang cocok bagi {name}!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleBackStep}
                  className="py-3 border border-orange-100 text-brand-brown rounded-xl font-bold hover:bg-orange-50/20"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="col-span-2 bg-brand-orange text-white py-3 rounded-xl font-bold hover:bg-brand-orange/95 flex items-center justify-center gap-2 shadow-md shadow-orange-200"
                >
                  {loading ? 'Menyiapkan...' : 'Bangun Profil Anak!'}
                </button>
              </div>
            </motion.div>
          )}
        </form>

      </div>
    </div>
  );
}
