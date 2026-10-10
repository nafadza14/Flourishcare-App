import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ClipboardCheck, Footprints, Hand, Lightbulb, MessageCircle, Smile, TriangleAlert } from 'lucide-react';
import Screen from '../components/ui/Screen';
import ProgressRing from '../components/ui/ProgressRing';
import Confetti from '../components/ui/Confetti';
import { Button, Card, Chip, Skeleton } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import type { ChildMilestone, MilestoneDomain } from '../types';
import { useStore } from '../lib/store';
import { useNav } from '../lib/nav';
import { useChildData } from '../lib/useChildData';
import { CHECKPOINTS, checkpointForAge, checkpointShortLabel, devAgeMonths, domainLabel, domainProgress, isAchieved, lateMilestones, progressAt, type CdcMilestone } from '../lib/milestones';
import { ACT_EARLY_GENERAL, MILESTONE_ATTRIBUTION } from '../data/milestonesCdc';
import UnbornGate from '../components/child/UnbornGate';
import { ageLabel, firstName, formatDate, todayISO } from '../lib/format';
import { sendJSON } from '../api';
import { emitDataChanged } from '../lib/events';
import { haptic } from '../lib/haptics';
import { listContainer, listItem } from '../lib/motion';
import { cx } from '../lib/cx';

const DOMAIN_ICON: Record<MilestoneDomain, typeof Footprints> = {
  motorik_kasar: Footprints,
  motorik_halus: Hand,
  bahasa: MessageCircle,
  sosial_emosional: Smile,
};

function CheckCircle({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <motion.button
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      whileTap={{ scale: 0.85 }}
      onClick={onToggle}
      className={cx(
        'w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-300',
        checked ? 'bg-semantic-success border-semantic-success' : 'bg-white border-line-2',
      )}
    >
      <AnimatePresence>
        {checked && (
          <motion.svg key="c" width="16" height="16" viewBox="0 0 16 16" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}>
            <motion.path
              d="M3.5 8.5l3 3 6-7"
              fill="none"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/** Domain progress summary, reused in the child profile */
export function MilestoneSummary({ milestones, age }: { milestones: ChildMilestone[]; age: number }) {
  const domains = domainProgress(milestones, age);
  return (
    <div className="grid grid-cols-2 gap-3">
      {domains.map((d) => {
        const Icon = DOMAIN_ICON[d.key];
        return (
          <Card key={d.key} className="p-4 flex items-center gap-3">
            <ProgressRing value={d.ratio} size={52} stroke={5} label={`${d.label} ${d.done} dari ${d.total}`}>
              <Icon className="w-5 h-5 text-ink-2" strokeWidth={1.7} />
            </ProgressRing>
            <div className="min-w-0">
              <div className="text-[15px] leading-tight">{d.short}</div>
              <div className="text-[14px] text-mute tabular">
                {d.done}/{d.total}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/** One milestone with its "seperti apa contohnya" explanation */
function MilestoneRow({ m, checked, achievedDate, onToggle }: { m: CdcMilestone; checked: boolean; achievedDate?: string; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  const Icon = DOMAIN_ICON[m.domain];
  return (
    <motion.div
      variants={listItem}
      layout
      className={cx(
        'rounded-[22px] border p-4 transition-colors duration-300',
        checked ? 'bg-semantic-success-soft/60 border-semantic-success/20' : 'bg-white border-line shadow-card',
      )}
    >
      <div className="flex gap-3.5 items-start">
        <CheckCircle checked={checked} onToggle={onToggle} label={m.text} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[13px] text-mute">
            <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
            {domainLabel(m.domain)}
          </div>
          <p className={cx('text-[16px] leading-snug mt-1', checked ? 'text-ink-2' : 'text-ink')}>{m.text}</p>
          {checked && achievedDate && <div className="text-[13px] text-semantic-success mt-1.5">Tercapai {formatDate(achievedDate)}</div>}
          <button onClick={() => setOpen((v) => !v)} className="mt-2 inline-flex items-center gap-1 text-[14px] text-brand-orange-deep" aria-expanded={open}>
            Seperti apa contohnya?
            <motion.span animate={{ rotate: open ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="text-[15px] text-ink-2 leading-relaxed mt-2">{m.example}</p>
                {m.tip && (
                  <p className="text-[14.5px] text-ink-2 leading-relaxed mt-2 flex gap-2 bg-brand-orange-tint rounded-[14px] px-3 py-2.5">
                    <Lightbulb className="w-4 h-4 text-brand-orange-deep shrink-0 mt-0.5" strokeWidth={1.8} />
                    <span>
                      <span className="text-brand-orange-deep">Stimulasi:</span> {m.tip}
                    </span>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function MilestoneScreen({ onBack }: { onBack?: () => void }) {
  const { activeChild } = useStore();
  const nav = useNav();
  const toast = useToast();
  const { data, loading } = useChildData(activeChild?.id, !activeChild?.isUnborn);
  const [local, setLocal] = useState<ChildMilestone[]>([]);
  const age = activeChild ? devAgeMonths(activeChild) : 0;
  const current = checkpointForAge(age);
  const [checkpointAge, setCheckpointAge] = useState(current.ageMonths);
  const [burst, setBurst] = useState(0);
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => setLocal(data.milestones), [data.milestones]);
  useEffect(() => setCheckpointAge(current.ageMonths), [activeChild?.id, current.ageMonths]);

  useEffect(() => {
    const el = chipsRef.current?.querySelector<HTMLElement>(`[data-key="${current.ageMonths}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [current.ageMonths, loading]);

  const checkpoint = CHECKPOINTS.find((c) => c.ageMonths === checkpointAge) ?? current;
  const progress = progressAt(local, checkpoint);
  const fresh = local.length === 0;
  const late = fresh ? [] : lateMilestones(local, age);
  const lateHasLanguage = late.some((m) => m.domain === 'bahasa');
  const showActEarly = checkpoint.ageMonths <= current.ageMonths && progress.done < progress.total;

  if (!activeChild) return null;
  if (activeChild.isUnborn) {
    return (
      <Screen title="Milestone" onBack={onBack}>
        <UnbornGate name={activeChild.name} />
      </Screen>
    );
  }

  const toggle = async (milestoneId: string) => {
    const was = isAchieved(local, milestoneId);
    haptic(was ? 'light' : 'success');
    const optimistic = was
      ? local.filter((m) => m.milestoneId !== milestoneId)
      : [...local, { id: `tmp_${milestoneId}`, childId: activeChild.id, milestoneId, achieved: true, achievedDate: todayISO(), createdAt: new Date().toISOString() }];
    setLocal(optimistic);
    const after = progressAt(optimistic, checkpoint);
    if (!was && after.done === after.total && after.total > 0) {
      setBurst((b) => b + 1);
      toast({ title: 'Semua milestone tercapai', body: `${activeChild.name} menuntaskan milestone usia ${checkpoint.label.toLowerCase()}.` });
    }
    try {
      await sendJSON('/api/milestones/toggle', { childId: activeChild.id, milestoneId, achieved: !was });
      emitDataChanged('milestones');
    } catch {
      setLocal(local);
      toast({ title: 'Gagal menyimpan', body: 'Periksa koneksi lalu coba lagi.', tone: 'warning' });
    }
  };

  return (
    <Screen title="Milestone" subtitle={`Usia ${firstName(activeChild.name)} saat ini ${ageLabel(activeChild.birthDate)}`} onBack={onBack}>
      {/* Summary */}
      <div className="px-5">
        <Card className="p-5 flex items-center gap-4 relative overflow-visible">
          <div className="relative">
            <ProgressRing value={loading ? 0 : progress.ratio} size={84} stroke={8} label={`${progress.done} dari ${progress.total} tercapai`}>
              <span className="text-[22px] tabular">{loading ? '' : `${Math.round(progress.ratio * 100)}%`}</span>
            </ProgressRing>
            {burst > 0 && <Confetti key={burst} />}
          </div>
          <div className="min-w-0">
            <div className="text-[14px] text-mute">Usia {checkpoint.label.toLowerCase()}</div>
            {loading ? (
              <Skeleton className="h-6 w-32 mt-1" />
            ) : (
              <div className="text-[20px] leading-tight mt-0.5">
                {progress.done} dari {progress.total} tercapai
              </div>
            )}
            <div className="text-[14px] text-mute mt-1">
              {checkpoint.ageMonths === current.ageMonths ? 'Tahap usia saat ini' : checkpoint.ageMonths > current.ageMonths ? 'Tahap berikutnya' : 'Tahap sebelumnya'}
            </div>
          </div>
        </Card>
      </div>

      {/* Brand-new profile: invite, do not flag */}
      {!loading && fresh && (
        <div className="px-5 mt-3">
          <div className="rounded-[22px] bg-white border border-line p-4">
            <div className="text-[17px] leading-snug">Mulai dari tahap usia {firstName(activeChild.name)} sekarang</div>
            <p className="text-[14.5px] text-mute mt-1 leading-relaxed">
              Centang kemampuan yang sudah bisa dilakukan. Tahap usia sebelumnya bisa dilengkapi kapan saja lewat pilihan usia di bawah.
            </p>
          </div>
        </div>
      )}

      {/* Late alert: gentle, with a clear next step */}
      {!loading && late.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-5 mt-3">
          <div className="rounded-[22px] bg-brand-orange-tint border border-brand-orange/30 p-4">
            <div className="text-[17px] leading-snug">{late.length} kemampuan usia {checkpointShortLabel(late[0].ageMonths)} belum dicentang</div>
            <ul className="mt-2 space-y-1.5">
              {late.slice(0, 3).map((m) => (
                <li key={m.id} className="text-[15px] text-ink-2 leading-snug flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 shrink-0" />
                  <span>
                    <span className="text-mute">{checkpointShortLabel(m.ageMonths)}:</span> {m.text}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[14px] text-mute mt-2 leading-relaxed">
              Bila sudah bisa, cukup centang. Bila memang belum, tidak perlu panik: skrining singkat membantu memastikan perlu tidaknya bantuan ahli.
            </p>
            <Button size="sm" icon={ClipboardCheck} className="mt-3" onClick={() => nav.push({ name: 'screening', start: lateHasLanguage ? 'speech_delay' : 'kpsp' })}>
              {lateHasLanguage ? 'Cek kemampuan bicara' : 'Mulai skrining KPSP'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Checkpoint chips */}
      <div ref={chipsRef} className="flex gap-2 overflow-x-auto no-scrollbar px-5 mt-5 pb-1">
        {CHECKPOINTS.map((c) => (
          <Chip key={c.ageMonths} data-key={c.ageMonths} selected={c.ageMonths === checkpointAge} onClick={() => setCheckpointAge(c.ageMonths)}>
            <span className="inline-flex items-center gap-1.5">
              {c.ageMonths === current.ageMonths && <span className={cx('w-1.5 h-1.5 rounded-full', c.ageMonths === checkpointAge ? 'bg-brand-yellow' : 'bg-brand-orange')} />}
              {checkpointShortLabel(c.ageMonths)}
            </span>
          </Chip>
        ))}
      </div>

      {/* List */}
      <div className="px-5 mt-4">
        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-[22px]" />
            ))}
          </div>
        ) : (
          <motion.div key={checkpointAge} className="space-y-2.5" variants={listContainer} initial="hidden" animate="show">
            {checkpoint.items.map((m) => (
              <MilestoneRow
                key={m.id}
                m={m}
                checked={isAchieved(local, m.id)}
                achievedDate={local.find((x) => x.milestoneId === m.id)?.achievedDate}
                onToggle={() => toggle(m.id)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Act early */}
      {!loading && showActEarly && checkpoint.actEarly.length > 0 && (
        <div className="px-5 mt-5">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-[16px]">
              <TriangleAlert className="w-[18px] h-[18px] text-semantic-warning" strokeWidth={1.8} />
              Kapan perlu bicara dengan ahli
            </div>
            <ul className="mt-2 space-y-1.5">
              {checkpoint.actEarly.map((t) => (
                <li key={t} className="text-[15px] text-ink-2 leading-snug flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-semantic-warning mt-2 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-[14px] text-mute mt-2 leading-relaxed">{ACT_EARLY_GENERAL}</p>
          </Card>
        </div>
      )}

      <div className="px-5 mt-6">
        <div className="text-[14px] text-mute mb-2 px-1">Ringkasan per aspek sampai usia saat ini</div>
        <MilestoneSummary milestones={local} age={age} />
      </div>

      <p className="px-6 mt-5 text-[13px] text-mute leading-relaxed">
        Setiap anak berkembang dengan kecepatannya sendiri. Ceklis ini membantu pemantauan, bukan diagnosis. {MILESTONE_ATTRIBUTION}
      </p>
    </Screen>
  );
}
