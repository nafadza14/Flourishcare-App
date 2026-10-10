import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Baby, ChevronRight, Droplets, Milk, Moon, Square } from 'lucide-react';
import Sheet from '../ui/Sheet';
import { Field } from '../ui/Field';
import { Button, Card } from '../ui/primitives';
import { useToast } from '../ui/Toast';
import type { BabyLog, Child } from '../../types';
import { DIAPER_DETAILS, FEED_DETAILS, addLog, detailLabel, durationLabel, minutesBetween, summarize, updateLog } from '../../lib/babylog';
import { ageInMonths, formatTime, timeAgo } from '../../lib/format';
import { haptic } from '../../lib/haptics';
import { cx } from '../../lib/cx';

/** Re-render every 30 seconds so running timers stay fresh */
export function useTick(active: boolean, ms = 30000) {
  const [, setT] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setT((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [active, ms]);
}

export function FeedSheet({ open, onClose, child, suggestSide }: { open: boolean; onClose: () => void; child: Child; suggestSide: 'kiri' | 'kanan' | null }) {
  const toast = useToast();
  const [ml, setMl] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const age = ageInMonths(child.birthDate);
  useEffect(() => {
    if (open) setMl('');
  }, [open]);

  const start = async (detail: string) => {
    setBusy(detail);
    try {
      await addLog(child.id, { kind: 'feed', detail, endedAt: null });
      haptic('success');
      onClose();
    } catch (err: any) {
      toast({ title: 'Belum tersimpan', body: err?.message, tone: 'warning' });
    } finally {
      setBusy(null);
    }
  };

  const logBottle = async (detail: string) => {
    const amount = Number(ml.replace(',', '.'));
    if (detail !== 'solid' && !(amount > 0 && amount <= 400)) return toast({ title: 'Isi jumlah susu', body: 'Antara 1 sampai 400 ml.', tone: 'warning' });
    setBusy(detail);
    try {
      const now = new Date().toISOString();
      await addLog(child.id, { kind: 'feed', detail, startedAt: now, endedAt: now, amountMl: detail === 'solid' ? null : amount });
      haptic('success');
      toast({ title: 'Tercatat', body: detail === 'solid' ? 'MPASI tercatat.' : `${amount} ml ${detail === 'bottle_asi' ? 'ASIP' : 'susu formula'}.` });
      onClose();
    } catch (err: any) {
      toast({ title: 'Belum tersimpan', body: err?.message, tone: 'warning' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Menyusu" subtitle={suggestSide ? `Disarankan mulai dari payudara ${suggestSide}.` : 'Pilih cara minum si Kecil.'}>
      <div className="space-y-4 pt-1">
        <div>
          <div className="text-[14px] text-mute mb-2">ASI langsung (pakai timer)</div>
          <div className="grid grid-cols-2 gap-2.5">
            {FEED_DETAILS.filter((d) => d.timer).map((d) => {
              const suggested = (d.key === 'breast_left' && suggestSide === 'kiri') || (d.key === 'breast_right' && suggestSide === 'kanan');
              return (
                <Button key={d.key} size="lg" variant={suggested ? 'primary' : 'secondary'} loading={busy === d.key} onClick={() => start(d.key)}>
                  {d.label}
                </Button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-[14px] text-mute mb-2">Botol</div>
          <Field label="Jumlah" inputMode="numeric" suffix="ml" value={ml} onChange={(e) => setMl(e.target.value.replace(/[^0-9]/g, ''))} placeholder="90" />
          <div className="grid grid-cols-2 gap-2.5 mt-2.5">
            <Button variant="secondary" loading={busy === 'bottle_asi'} onClick={() => logBottle('bottle_asi')}>
              Catat ASIP
            </Button>
            <Button variant="secondary" loading={busy === 'bottle_formula'} onClick={() => logBottle('bottle_formula')}>
              Catat formula
            </Button>
          </div>
        </div>
        {age >= 6 && (
          <Button block variant="soft" loading={busy === 'solid'} onClick={() => logBottle('solid')}>
            Catat makan MPASI
          </Button>
        )}
      </div>
    </Sheet>
  );
}

export function DiaperSheet({ open, onClose, child }: { open: boolean; onClose: () => void; child: Child }) {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const log = async (detail: string) => {
    setBusy(detail);
    try {
      const now = new Date().toISOString();
      await addLog(child.id, { kind: 'diaper', detail, startedAt: now, endedAt: now });
      haptic('success');
      onClose();
    } catch (err: any) {
      toast({ title: 'Belum tersimpan', body: err?.message, tone: 'warning' });
    } finally {
      setBusy(null);
    }
  };
  return (
    <Sheet open={open} onClose={onClose} title="Ganti popok" subtitle="Satu ketuk, langsung tercatat.">
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {DIAPER_DETAILS.map((d) => (
          <Button key={d.key} size="lg" variant="secondary" loading={busy === d.key} onClick={() => log(d.key)} className="!px-2 !text-[15px]">
            {d.label}
          </Button>
        ))}
      </div>
    </Sheet>
  );
}

/** A running feed or sleep timer with a stop button */
export function RunningTimer({ log, child }: { log: BabyLog; child: Child }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  useTick(true, 15000);
  const stop = async () => {
    setBusy(true);
    try {
      await updateLog(child.id, log.id, { endedAt: new Date().toISOString() });
      haptic('success');
    } catch (err: any) {
      toast({ title: 'Belum tersimpan', body: err?.message, tone: 'warning' });
    } finally {
      setBusy(false);
    }
  };
  const Icon = log.kind === 'sleep' ? Moon : Milk;
  return (
    <div className="flex items-center gap-3 rounded-[18px] bg-brand-orange-tint border border-brand-orange/30 px-3.5 py-3">
      <span className="relative w-9 h-9 rounded-full bg-white text-brand-orange-deep flex items-center justify-center shrink-0">
        <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-orange anim-pulse-dot" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] leading-tight">{detailLabel(log)} sedang berjalan</div>
        <div className="text-[13.5px] text-mute tabular">
          Mulai {formatTime(log.startedAt)} · {durationLabel(minutesBetween(log.startedAt))}
        </div>
      </div>
      <Button size="sm" icon={Square} loading={busy} onClick={stop}>
        Selesai
      </Button>
    </div>
  );
}

/** Card with three quick buttons and today's summary (0 to 24 months) */
export default function BabyQuickCard({ child, logs, onOpen, compact }: { child: Child; logs: BabyLog[]; onOpen: () => void; compact?: boolean }) {
  const toast = useToast();
  const s = summarize(logs);
  const [feedOpen, setFeedOpen] = useState(false);
  const [diaperOpen, setDiaperOpen] = useState(false);
  const [sleepBusy, setSleepBusy] = useState(false);
  useTick(!!(s.runningFeed || s.runningSleep));

  const toggleSleep = async () => {
    setSleepBusy(true);
    try {
      if (s.runningSleep) await updateLog(child.id, s.runningSleep.id, { endedAt: new Date().toISOString() });
      else await addLog(child.id, { kind: 'sleep', endedAt: null });
      haptic('success');
    } catch (err: any) {
      toast({ title: 'Belum tersimpan', body: err?.message, tone: 'warning' });
    } finally {
      setSleepBusy(false);
    }
  };

  const buttons = [
    {
      key: 'feed',
      label: s.runningFeed ? durationLabel(minutesBetween(s.runningFeed.startedAt)) : 'Menyusu',
      sub: s.runningFeed ? detailLabel(s.runningFeed) : s.lastFeed ? timeAgo(s.lastFeed.startedAt) : 'Belum ada',
      icon: Milk,
      active: !!s.runningFeed,
      onClick: () => (s.runningFeed ? updateLog(child.id, s.runningFeed.id, { endedAt: new Date().toISOString() }).then(() => haptic('success')) : setFeedOpen(true)),
    },
    {
      key: 'sleep',
      label: s.runningSleep ? durationLabel(minutesBetween(s.runningSleep.startedAt)) : 'Tidur',
      sub: s.runningSleep ? 'Ketuk saat bangun' : `${durationLabel(s.sleepMinutes)} hari ini`,
      icon: Moon,
      active: !!s.runningSleep,
      onClick: toggleSleep,
    },
    {
      key: 'diaper',
      label: 'Popok',
      sub: `${s.wet} pipis · ${s.dirty} pup`,
      icon: Droplets,
      active: false,
      onClick: () => setDiaperOpen(true),
    },
  ];

  return (
    <Card className="p-4">
      {!compact && (
      <button onClick={onOpen} className="w-full flex items-center justify-between gap-2 text-left mb-3">
        <div className="flex items-center gap-2">
          <Baby className="w-[18px] h-[18px] text-brand-orange-deep" strokeWidth={1.8} />
          <span className="text-[17px]">Catatan harian</span>
        </div>
        <span className="flex items-center gap-0.5 text-[14px] text-brand-orange-deep">
          Lihat semua <ChevronRight className="w-4 h-4" />
        </span>
      </button>
      )}
      <div className="grid grid-cols-3 gap-2">
        {buttons.map((b) => (
          <motion.button
            key={b.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              haptic('light');
              b.onClick();
            }}
            disabled={b.key === 'sleep' && sleepBusy}
            className={cx(
              'rounded-[18px] p-3 text-left flex flex-col gap-2 min-h-[92px] border transition-colors',
              b.active ? 'bg-orange-gradient text-white border-transparent shadow-orange' : 'bg-white border-line',
            )}
            aria-label={b.active ? `Hentikan ${b.key === 'sleep' ? 'tidur' : 'menyusu'}` : `Catat ${b.label}`}
          >
            <span className={cx('w-8 h-8 rounded-full flex items-center justify-center', b.active ? 'bg-white/25 text-white' : 'bg-brand-orange-soft text-brand-orange-deep')}>
              <b.icon className="w-4 h-4" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-[15px] leading-tight tabular">{b.label}</span>
              <span className={cx('block text-[12.5px] leading-tight mt-0.5', b.active ? 'text-white/85' : 'text-mute')}>{b.sub}</span>
            </span>
          </motion.button>
        ))}
      </div>
      {!compact && s.lastFeed && !s.runningFeed && (
        <p className="text-[13.5px] text-mute mt-3">
          Terakhir minum {timeAgo(s.lastFeed.startedAt).toLowerCase()} ({detailLabel(s.lastFeed).toLowerCase()})
          {s.nextSide ? `, berikutnya mulai dari ${s.nextSide}` : ''}. Hari ini {s.feeds} kali{s.feedMl ? `, ${s.feedMl} ml` : ''}.
        </p>
      )}
      <FeedSheet open={feedOpen} onClose={() => setFeedOpen(false)} child={child} suggestSide={s.nextSide} />
      <DiaperSheet open={diaperOpen} onClose={() => setDiaperOpen(false)} child={child} />
    </Card>
  );
}
