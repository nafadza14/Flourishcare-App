import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Baby, CalendarHeart, ChevronDown, Footprints, HeartPulse, Lightbulb, Sparkles, Stethoscope, TriangleAlert } from 'lucide-react';
import Sheet from '../ui/Sheet';
import { Field } from '../ui/Field';
import { Button, Card } from '../ui/primitives';
import { useToast } from '../ui/Toast';
import Confetti from '../ui/Confetti';
import { KidAvatar } from '../ui/Avatar';
import type { Child } from '../../types';
import { ANC_SCHEDULE, DANGER_SIGNS, KICK_COUNT_GUIDE } from '../../data/pregnancy';
import { BORN_CTA_WEEK, KICK_START_WEEK, countdownLabel, gestationLabel, pregnancyStatus } from '../../lib/pregnancy';
import { addLog, durationLabel, minutesBetween, useBabyLogs } from '../../lib/babylog';
import { sendJSON } from '../../api';
import { emitDataChanged } from '../../lib/events';
import { daysBetween, firstName, formatDate, formatTime, parseDate, todayISO } from '../../lib/format';
import { useStore } from '../../lib/store';
import { haptic } from '../../lib/haptics';
import { cx } from '../../lib/cx';

function Expand({ title, icon: Icon, tone = 'neutral', children, defaultOpen = false }: { title: string; icon: typeof Baby; tone?: 'neutral' | 'danger'; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-4 text-left" aria-expanded={open}>
        <span className={cx('w-10 h-10 rounded-full flex items-center justify-center shrink-0', tone === 'danger' ? 'bg-semantic-danger-soft text-semantic-danger' : 'bg-brand-orange-soft text-brand-orange-deep')}>
          <Icon className="w-5 h-5" strokeWidth={1.8} />
        </span>
        <span className="flex-1 text-[16.5px]">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="w-5 h-5 text-mute" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ---------------- Kick counter ---------------- */

function KickCounterSheet({ open, onClose, child }: { open: boolean; onClose: () => void; child: Child }) {
  const toast = useToast();
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setStartedAt(null);
      setCount(0);
    }
  }, [open]);
  useEffect(() => {
    if (!startedAt) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [startedAt]);

  const elapsed = startedAt ? Math.floor((now - new Date(startedAt).getTime()) / 1000) : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const overTwoHours = elapsed >= 7200 && count < 10;

  const tap = () => {
    haptic('light');
    if (!startedAt) setStartedAt(new Date().toISOString());
    setCount((c) => c + 1);
  };

  const save = async () => {
    if (!startedAt || !count) return onClose();
    setSaving(true);
    try {
      await addLog(child.id, { kind: 'kick', startedAt, endedAt: new Date().toISOString(), count });
      toast({ title: 'Hitungan tersimpan', body: `${count} gerakan dalam ${durationLabel(Math.max(1, Math.round(elapsed / 60)))}.` });
      onClose();
    } catch (err: any) {
      toast({ title: 'Belum tersimpan', body: err?.message || 'Coba lagi sebentar lagi.', tone: 'warning' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Hitung gerakan janin"
      subtitle="Ketuk setiap kali janin bergerak: tendangan, dorongan, atau gulingan."
      footer={
        <Button block size="lg" loading={saving} onClick={save} disabled={!count}>
          Selesai dan simpan
        </Button>
      }
    >
      <div className="flex flex-col items-center pt-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={tap}
          className="w-44 h-44 rounded-full bg-orange-gradient text-white shadow-orange flex flex-col items-center justify-center"
          aria-label="Tambah satu gerakan"
        >
          <span className="text-[56px] leading-none tabular">{count}</span>
          <span className="text-[15px] text-white/85 mt-1">{count >= 10 ? 'Target tercapai' : 'Ketuk di sini'}</span>
        </motion.button>
        <div className="text-[15px] text-mute mt-4 tabular">{startedAt ? `Waktu berjalan ${mm}:${ss}` : 'Waktu mulai saat ketukan pertama'}</div>
        <div className="w-full mt-4">
          {count >= 10 ? (
            <p className="text-[15px] text-ink-2 bg-semantic-success-soft rounded-[16px] px-4 py-3 leading-relaxed">10 gerakan tercapai. Tanda yang menenangkan.</p>
          ) : overTwoHours ? (
            <p className="text-[15px] text-ink-2 bg-semantic-danger-soft rounded-[16px] px-4 py-3 leading-relaxed">
              Sudah 2 jam dan belum mencapai 10 gerakan. Segera periksa ke bidan, Puskesmas, atau rumah sakit, jangan menunggu besok.
            </p>
          ) : (
            <p className="text-[14.5px] text-mute leading-relaxed">{KICK_COUNT_GUIDE}</p>
          )}
        </div>
      </div>
    </Sheet>
  );
}

/* ---------------- Born ---------------- */

export function BornSheet({ open, onClose, child }: { open: boolean; onClose: () => void; child: Child }) {
  const toast = useToast();
  const { refreshChildren } = useStore();
  const status = pregnancyStatus(child);
  const [name, setName] = useState(child.name);
  const [birthDate, setBirthDate] = useState(todayISO());
  const [gender, setGender] = useState<'L' | 'P'>(child.gender);
  const [weeks, setWeeks] = useState(String(Math.min(42, Math.max(24, status.weeks))));
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [head, setHead] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(child.name === 'Calon Bayi' || child.name === 'Dedek' ? '' : child.name);
    setBirthDate(todayISO());
    setError('');
    setCelebrate(false);
  }, [open, child.name]);

  // Gestational age at birth follows the birth date when HPHT is known
  useEffect(() => {
    if (!open || !birthDate) return;
    const d = daysBetween(parseDate(status.hpht), parseDate(birthDate));
    if (d > 150 && d < 320) setWeeks(String(Math.floor(d / 7)));
  }, [birthDate, open, status.hpht]);

  const parse = (v: string) => Number(v.replace(',', '.'));

  const save = async () => {
    const w = parse(weight);
    const l = parse(length);
    const hc = parse(head);
    const gw = Number(weeks);
    if (name.trim().length < 2) return setError('Tulis nama panggilan si Kecil.');
    if (!birthDate || birthDate > todayISO()) return setError('Tanggal lahir tidak boleh melewati hari ini.');
    if (!(gw >= 22 && gw <= 44)) return setError('Usia kehamilan saat lahir antara 22 sampai 44 minggu.');
    if (weight && !(w >= 0.4 && w <= 6)) return setError('Berat lahir antara 0,4 sampai 6 kg.');
    if (length && !(l >= 25 && l <= 65)) return setError('Panjang lahir antara 25 sampai 65 cm.');
    setSaving(true);
    setError('');
    try {
      await sendJSON(`/api/children/${child.id}`, { isUnborn: false, name: name.trim(), birthDate, gender, gestationalWeeks: gw, isPremature: gw < 37 }, 'PUT');
      if (w && l) {
        await sendJSON('/api/growth', { childId: child.id, date: birthDate, weightKg: w, heightCm: l, headCircumferenceCm: hc || null, notes: 'Pengukuran lahir' });
      }
      await refreshChildren(child.id);
      emitDataChanged('children');
      emitDataChanged('growth');
      setCelebrate(true);
      haptic('success');
      toast({ title: `Selamat datang, ${firstName(name)}!`, body: 'Profil sudah berubah menjadi profil si Kecil. Semua fitur kini mengikuti usianya.' });
      window.setTimeout(onClose, 900);
    } catch (err: any) {
      setError(err?.message || 'Belum tersimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Si Kecil sudah lahir"
      subtitle="Selamat, Bunda! Isi data kelahiran untuk mulai memantau tumbuh kembangnya."
      footer={
        <Button block size="lg" loading={saving} onClick={save}>
          Simpan data kelahiran
        </Button>
      }
    >
      <div className="space-y-4 pt-1 relative">
        {celebrate && (
          <div className="absolute inset-x-0 top-10 h-0">
            <Confetti count={36} />
          </div>
        )}
        <Field label="Nama panggilan" icon={Baby} value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Aiden" />
        <div className="grid grid-cols-2 gap-3">
          {(['L', 'P'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              aria-pressed={gender === g}
              className={cx('rounded-[20px] border p-3 flex items-center gap-2.5', gender === g ? 'bg-brand-orange-tint border-brand-orange' : 'bg-white border-line')}
            >
              <KidAvatar gender={g} size={40} />
              <span className="text-[16px]">{g === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
            </button>
          ))}
        </div>
        <Field label="Tanggal lahir" type="date" icon={CalendarHeart} max={todayISO()} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Usia kehamilan" inputMode="numeric" suffix="minggu" value={weeks} onChange={(e) => setWeeks(e.target.value.replace(/[^0-9]/g, ''))} />
          <Field label="Berat lahir" inputMode="decimal" suffix="kg" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="3,1" />
          <Field label="Panjang lahir" inputMode="decimal" suffix="cm" value={length} onChange={(e) => setLength(e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="49" />
          <Field label="Lingkar kepala" inputMode="decimal" suffix="cm" value={head} onChange={(e) => setHead(e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="34" />
        </div>
        <p className="text-[13.5px] text-mute leading-relaxed">Data lahir dari buku KIA menjadi titik pertama di grafik pertumbuhan. Usia kehamilan di bawah 37 minggu dicatat sebagai prematur, dan grafik memakai usia koreksi.</p>
        {error && <p className="text-[14px] text-semantic-danger">{error}</p>}
      </div>
    </Sheet>
  );
}

/* ---------------- Main view ---------------- */

export default function PregnancyView({ child }: { child: Child }) {
  const status = useMemo(() => pregnancyStatus(child), [child]);
  const { logs } = useBabyLogs(child.id);
  const [kickOpen, setKickOpen] = useState(false);
  const [bornOpen, setBornOpen] = useState(false);
  const kicks = logs.filter((l) => l.kind === 'kick').slice(0, 3);
  const w = status.week;
  const bubble = Math.max(18, Math.min(120, 18 + status.weeks * 2.6));

  return (
    <div className="px-5 space-y-3">
      {/* Week hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] bg-orange-gradient text-white p-5 shadow-orange relative overflow-hidden">
        <span className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/10" aria-hidden />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[14px] text-white/85">Trimester {status.trimester}</div>
            <div className="flex items-baseline gap-2 mt-1 whitespace-nowrap">
              <span className="text-[18px] text-white/90">Minggu ke</span>
              <span className="text-[54px] leading-none tracking-[-0.03em] tabular">{status.weeks}</span>
            </div>
            <div className="text-[15px] text-white/85 mt-1">{gestationLabel(status)}</div>
          </div>
          <div className="w-[120px] h-[120px] shrink-0 flex items-center justify-center">
            <motion.div
              className="rounded-full bg-white/25 border border-white/40 flex items-center justify-center"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1, width: bubble, height: bubble }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            >
              <Baby className="text-white" style={{ width: bubble * 0.5, height: bubble * 0.5 }} strokeWidth={1.5} />
            </motion.div>
          </div>
        </div>
        <div className="relative mt-4">
          <div className="h-2 rounded-full bg-white/25 overflow-hidden">
            <motion.div className="h-full bg-white rounded-full" initial={{ width: 0 }} animate={{ width: `${status.progress * 100}%` }} transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }} />
          </div>
          <div className="flex justify-between text-[13px] text-white/85 mt-1.5">
            <span>{countdownLabel(status.daysToHpl)}</span>
            <span>HPL {formatDate(status.hpl)}</span>
          </div>
        </div>
      </motion.div>

      {/* Size */}
      <Card className="p-4">
        <div className="text-[14px] text-mute">Janin minggu ini kira-kira sebesar</div>
        <div className="text-[22px] leading-tight mt-1 capitalize">{w.size}</div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-[16px] bg-fill p-3">
            <div className="text-[12.5px] text-mute">Panjang</div>
            <div className="text-[15px] leading-snug mt-0.5">{w.length}</div>
          </div>
          <div className="rounded-[16px] bg-fill p-3">
            <div className="text-[12.5px] text-mute">Berat</div>
            <div className="text-[15px] leading-snug mt-0.5">{w.weight}</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div>
          <div className="flex items-center gap-2 text-[15px] text-brand-orange-deep">
            <Sparkles className="w-4 h-4" /> Perkembangan janin
          </div>
          <p className="text-[15.5px] text-ink-2 leading-relaxed mt-1">{w.development}</p>
        </div>
        <div className="h-px bg-line" />
        <div>
          <div className="flex items-center gap-2 text-[15px] text-brand-orange-deep">
            <HeartPulse className="w-4 h-4" /> Tubuh Bunda
          </div>
          <p className="text-[15.5px] text-ink-2 leading-relaxed mt-1">{w.mom}</p>
        </div>
        <div className="h-px bg-line" />
        <div className="flex gap-2 bg-brand-orange-tint rounded-[16px] p-3">
          <Lightbulb className="w-[18px] h-[18px] text-brand-orange-deep shrink-0 mt-0.5" strokeWidth={1.8} />
          <p className="text-[15px] text-ink-2 leading-relaxed">{w.tip}</p>
        </div>
      </Card>

      {/* Kick counter */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-brand-orange-soft text-brand-orange-deep flex items-center justify-center shrink-0">
            <Footprints className="w-5 h-5" strokeWidth={1.8} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[16.5px] leading-tight">Hitung gerakan janin</div>
            <div className="text-[14px] text-mute mt-0.5">{status.weeks >= KICK_START_WEEK ? 'Target 10 gerakan dalam 2 jam' : `Dianjurkan mulai usia ${KICK_START_WEEK} minggu`}</div>
          </div>
          <Button size="sm" variant={status.weeks >= KICK_START_WEEK ? 'primary' : 'secondary'} onClick={() => setKickOpen(true)}>
            Mulai
          </Button>
        </div>
        {kicks.length > 0 && (
          <div className="mt-3 divide-y divide-line">
            {kicks.map((k) => (
              <div key={k.id} className="py-2 flex items-center justify-between text-[14.5px]">
                <span className="text-ink-2">
                  {formatDate(k.startedAt)} · {formatTime(k.startedAt)}
                </span>
                <span className="tabular text-ink">
                  {k.count} gerakan · {durationLabel(minutesBetween(k.startedAt, k.endedAt))}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Expand title="Jadwal periksa kehamilan" icon={Stethoscope}>
        <p className="text-[15px] text-ink-2 leading-relaxed">{ANC_SCHEDULE.summary}</p>
        {ANC_SCHEDULE.ttd && <p className="text-[15px] text-ink-2 leading-relaxed mt-2">{ANC_SCHEDULE.ttd}</p>}
      </Expand>

      <Expand title="Tanda bahaya kehamilan" icon={TriangleAlert} tone="danger" defaultOpen={status.weeks >= 28}>
        <p className="text-[14.5px] text-mute leading-relaxed">{DANGER_SIGNS.intro}</p>
        <ul className="mt-2 space-y-1.5">
          {DANGER_SIGNS.urgent.map((t) => (
            <li key={t} className="text-[15px] text-ink-2 leading-snug flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-danger mt-2 shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </Expand>

      <Card className={cx('p-4', status.weeks >= BORN_CTA_WEEK && 'border-brand-orange')}>
        <div className="flex items-center gap-3">
          <KidAvatar gender={child.gender} size={46} />
          <div className="flex-1 min-w-0">
            <div className="text-[16.5px] leading-tight">Si Kecil sudah lahir?</div>
            <div className="text-[14px] text-mute mt-0.5">Ubah profil ini menjadi profil anak, riwayat tetap tersimpan.</div>
          </div>
        </div>
        <Button block variant={status.weeks >= BORN_CTA_WEEK ? 'primary' : 'secondary'} className="mt-3" onClick={() => setBornOpen(true)}>
          Isi data kelahiran
        </Button>
      </Card>

      <p className="text-[12.5px] text-mute leading-relaxed px-1">
        Usia kehamilan dihitung dari HPHT (HPL dikurangi 280 hari bila HPHT tidak diisi). USG trimester pertama adalah cara paling akurat; ikuti perhitungan dokter atau bidan bila berbeda.
      </p>

      <KickCounterSheet open={kickOpen} onClose={() => setKickOpen(false)} child={child} />
      <BornSheet open={bornOpen} onClose={() => setBornOpen(false)} child={child} />
    </div>
  );
}
