import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, Baby, Calendar, ChartColumn, ChevronLeft, ClipboardCheck, Ear, Footprints, HeartHandshake, MessageCircle, Scale, Sparkles, X } from 'lucide-react';
import { Field, OptionCard, TextArea } from '../components/ui/Field';
import { Button, IconButton } from '../components/ui/primitives';
import Switch from '../components/ui/Switch';
import Confetti from '../components/ui/Confetti';
import { KidAvatar, ParentAvatar } from '../components/ui/Avatar';
import FlourishCareLogo from '../components/FlourishCareLogo';
import { useToast } from '../components/ui/Toast';
import type { Child } from '../types';
import { useStore } from '../lib/store';
import { apiFetch } from '../api';
import { emitDataChanged } from '../lib/events';
import { firstName, todayISO } from '../lib/format';
import { haptic } from '../lib/haptics';
import { cx } from '../lib/cx';

const CONCERNS = [
  { val: 'umum', title: 'Pemantauan rutin', desc: 'Berat, tinggi, milestone, dan imunisasi.', icon: Activity, label: 'Pemantauan rutin umum' },
  { val: 'speech', title: 'Bicara dan bahasa', desc: 'Kosakata minim atau kurang merespons panggilan.', icon: MessageCircle, label: 'Keterlambatan bicara' },
  { val: 'sensori', title: 'Sensori dan perilaku', desc: 'Sangat sensitif suara, tekstur, atau pilih-pilih makan.', icon: Ear, label: 'Sensori dan perilaku sensitif' },
  { val: 'behavior', title: 'Emosi dan tantrum', desc: 'Mudah mengamuk dan sulit ditenangkan.', icon: HeartHandshake, label: 'Tantrum dan regulasi emosi' },
  { val: 'growth', title: 'Pertumbuhan fisik', desc: 'Khawatir berat atau tinggi badan kurang.', icon: Scale, label: 'Pertumbuhan fisik dan nutrisi' },
];

interface Props {
  /** First-run flow shows a welcome step and cannot be dismissed */
  firstRun?: boolean;
  onDone: (child: Child) => void;
  onCancel?: () => void;
}

export default function OnboardingScreen({ firstRun, onDone, onCancel }: Props) {
  const { profile, refreshChildren, parentVariant } = useStore();
  const toast = useToast();
  const steps = firstRun ? ['welcome', 'name', 'birth', 'concern', 'notes'] : ['name', 'birth', 'concern', 'notes'];
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [birthDate, setBirthDate] = useState('');
  const [premature, setPremature] = useState(false);
  const [concern, setConcern] = useState('umum');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const step = steps[index];

  const go = (delta: number) => {
    setDir(delta);
    setError('');
    setIndex((i) => Math.max(0, Math.min(steps.length - 1, i + delta)));
  };

  const next = async () => {
    if (step === 'name' && name.trim().length < 2) {
      haptic('warning');
      return setError('Tulis nama panggilan si Kecil dulu ya.');
    }
    if (step === 'birth') {
      if (!birthDate) return setError('Isi tanggal lahir untuk menghitung usia dan milestone.');
      if (birthDate > todayISO()) return setError('Tanggal lahir tidak boleh melewati hari ini.');
    }
    if (step !== 'notes') return go(1);

    setSaving(true);
    const concernItem = CONCERNS.find((c) => c.val === concern);
    const combined = [concern !== 'umum' && concernItem ? `Fokus utama: ${concernItem.label}.` : '', notes.trim()].filter(Boolean).join(' ');
    const payload = { name: name.trim(), birthDate, gender, isPremature: premature, medicalNotes: combined };
    let child: Child | null = null;
    try {
      const res = await apiFetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Profil belum tersimpan. Periksa koneksi lalu coba lagi.');
      child = data as Child;
    } catch (err: any) {
      // Never keep the child only on this device: it would vanish on the next login
      haptic('warning');
      setError(err?.message || 'Profil belum tersimpan. Periksa koneksi lalu coba lagi.');
      setSaving(false);
      return;
    }
    await refreshChildren(child.id);
    emitDataChanged('children');
    setCelebrate(true);
    haptic('success');
    toast({ title: `Profil ${child.name} siap`, body: 'Semua fitur kini disesuaikan dengan usianya.' });
    window.setTimeout(() => onDone(child as Child), 900);
    setSaving(false);
  };

  const canGoBack = index > 0;

  return (
    <div className="absolute inset-0 bg-canvas-gradient flex flex-col">
      {/* Top bar */}
      <div className="px-4 flex items-center justify-between h-[52px] shrink-0" style={{ marginTop: 'var(--sat)' }}>
        <div className="w-11">{canGoBack && <IconButton icon={ChevronLeft} label="Kembali" onClick={() => go(-1)} />}</div>
        {step !== 'welcome' && (
          <div className="flex gap-1.5" aria-label={`Langkah ${index + (firstRun ? 0 : 1)} dari ${firstRun ? steps.length - 1 : steps.length}`}>
            {steps
              .filter((s) => s !== 'welcome')
              .map((s) => {
                const i = steps.indexOf(s);
                return (
                  <motion.span
                    key={s}
                    className="h-1.5 rounded-full"
                    initial={false}
                    animate={{ width: i === index ? 26 : 8, backgroundColor: i <= index ? '#F29935' : '#E7DCD1' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                );
              })}
          </div>
        )}
        <div className="w-11 flex justify-end">{onCancel && <IconButton icon={X} label="Tutup" onClick={onCancel} />}</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
            className="px-6 pt-4 pb-6"
          >
            {step === 'welcome' && (
              <div className="flex flex-col items-center text-center pt-6">
                <div className="relative">
                  <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
                    <FlourishCareLogo className="w-28 h-28" animated />
                  </motion.div>
                  <motion.div className="absolute -right-6 bottom-0" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <ParentAvatar variant={parentVariant} size={54} className="ring-4 ring-canvas rounded-full" />
                  </motion.div>
                </div>
                <h1 className="text-[32px] leading-[1.12] tracking-[-0.025em] font-normal mt-8">Halo, {firstName(profile?.fullName)}</h1>
                <p className="text-[17px] text-mute mt-3 leading-relaxed max-w-[310px]">
                  Ceritakan sedikit tentang si Kecil. Kami akan menyesuaikan milestone, jadwal imunisasi, dan skrining dengan usianya.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3 w-full">
                  {([
                    ['Grafik WHO', ChartColumn],
                    ['Milestone', Footprints],
                    ['Skrining', ClipboardCheck],
                  ] as const).map(([t, Icon], i) => (
                    <motion.div
                      key={t}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.08 }}
                      className="bg-white rounded-[20px] border border-line shadow-card py-4 text-[14px] text-ink-2"
                    >
                      <Icon className="w-5 h-5 mx-auto text-brand-orange mb-1.5" strokeWidth={1.7} />
                      {t}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {step === 'name' && (
              <div>
                <h1 className="text-[30px] leading-[1.15] tracking-[-0.02em] font-normal">Siapa nama si Kecil?</h1>
                <p className="text-[16px] text-mute mt-2">Nama panggilan saja sudah cukup.</p>
                <Field
                  className="mt-6"
                  label="Nama panggilan"
                  icon={Baby}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="Contoh: Aiden"
                  autoFocus
                  error={error}
                  onKeyDown={(e) => e.key === 'Enter' && next()}
                />
                <div className="text-[14px] text-mute mt-6 mb-2 pl-1">Jenis kelamin</div>
                <div className="grid grid-cols-2 gap-3">
                  {(['L', 'P'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      aria-pressed={gender === g}
                      className={cx(
                        'rounded-[24px] border p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97]',
                        gender === g ? 'bg-brand-orange-tint border-brand-orange shadow-[0_0_0_3px_rgba(242,153,53,0.14)]' : 'bg-white border-line shadow-card',
                      )}
                    >
                      <motion.div animate={{ scale: gender === g ? 1.06 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
                        <KidAvatar gender={g} size={84} />
                      </motion.div>
                      <span className="text-[17px]">{g === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'birth' && (
              <div>
                <h1 className="text-[30px] leading-[1.15] tracking-[-0.02em] font-normal">Kapan {name.trim() || 'si Kecil'} lahir?</h1>
                <p className="text-[16px] text-mute mt-2">Tanggal lahir dipakai untuk menghitung usia, kurva WHO, dan jadwal imunisasi.</p>
                <Field
                  className="mt-6"
                  label="Tanggal lahir"
                  type="date"
                  icon={Calendar}
                  max={todayISO()}
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    setError('');
                  }}
                  error={error}
                />
                <div className="mt-4 flex items-center gap-3 bg-white rounded-[20px] border border-line shadow-card p-4">
                  <div className="flex-1">
                    <div className="text-[16px]">Lahir prematur</div>
                    <div className="text-[14px] text-mute leading-snug">Lahir sebelum usia kehamilan 37 minggu</div>
                  </div>
                  <Switch checked={premature} onChange={setPremature} label="Lahir prematur" />
                </div>
              </div>
            )}

            {step === 'concern' && (
              <div>
                <h1 className="text-[30px] leading-[1.15] tracking-[-0.02em] font-normal">Apa yang paling ingin dipantau?</h1>
                <p className="text-[16px] text-mute mt-2">Kami akan menyorot panduan dan skrining yang paling relevan.</p>
                <div className="space-y-2.5 mt-6" role="radiogroup" aria-label="Fokus pemantauan">
                  {CONCERNS.map((c) => (
                    <OptionCard key={c.val} selected={concern === c.val} onSelect={() => setConcern(c.val)} icon={c.icon} title={c.title} description={c.desc} />
                  ))}
                </div>
              </div>
            )}

            {step === 'notes' && (
              <div className="relative">
                <h1 className="text-[30px] leading-[1.15] tracking-[-0.02em] font-normal">Ada catatan kesehatan?</h1>
                <p className="text-[16px] text-mute mt-2">Opsional. Misalnya alergi, riwayat lahir, atau kondisi khusus.</p>
                <TextArea className="mt-6" label="Catatan" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contoh: alergi susu sapi, lahir caesar" />
                <div className="mt-4 rounded-[20px] bg-brand-orange-tint p-4 flex gap-3 text-[15px] text-ink-2 leading-relaxed">
                  <Sparkles className="w-5 h-5 text-brand-orange-deep shrink-0 mt-0.5" strokeWidth={1.8} />
                  Setelah ini, milestone, misi stimulasi, dan rekomendasi skrining langsung disesuaikan untuk {name.trim() || 'si Kecil'}.
                </div>
                {celebrate && (
                  <div className="absolute inset-x-0 top-24 h-0">
                    <Confetti count={36} />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pt-3 shrink-0" style={{ paddingBottom: 'calc(var(--sab) + 10px)' }}>
        {error && step !== 'name' && step !== 'birth' && <p className="text-[14px] text-semantic-danger mb-2">{error}</p>}
        <Button block size="lg" loading={saving} onClick={next}>
          {step === 'welcome' ? 'Tambah profil si Kecil' : step === 'notes' ? 'Simpan profil' : 'Lanjut'}
        </Button>
      </div>
    </div>
  );
}
