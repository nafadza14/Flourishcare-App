import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ClipboardCheck, Footprints, Hand, MessageCircle, Smile } from 'lucide-react';
import Screen from '../components/ui/Screen';
import ProgressRing from '../components/ui/ProgressRing';
import Confetti from '../components/ui/Confetti';
import { Button, Card, Chip, Skeleton } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import type { ChildMilestone, MilestoneDomain } from '../types';
import { useStore } from '../lib/store';
import { useNav } from '../lib/nav';
import { useChildData } from '../lib/useChildData';
import { AGE_RANGES, domainLabel, isAchieved, lateMilestones, milestonesInRange, rangeForAge, rangeProgress, domainProgress } from '../lib/milestones';
import { ageInMonths, ageLabel, firstName, formatDate, todayISO } from '../lib/format';
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

export default function MilestoneScreen({ onBack }: { onBack?: () => void }) {
  const { activeChild } = useStore();
  const nav = useNav();
  const toast = useToast();
  const { data, loading } = useChildData(activeChild?.id);
  const [local, setLocal] = useState<ChildMilestone[]>([]);
  const age = activeChild ? ageInMonths(activeChild.birthDate) : 0;
  const currentRange = rangeForAge(age);
  const [rangeKey, setRangeKey] = useState(currentRange.key);
  const [burst, setBurst] = useState(0);
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => setLocal(data.milestones), [data.milestones]);
  useEffect(() => setRangeKey(currentRange.key), [activeChild?.id, currentRange.key]);

  useEffect(() => {
    const el = chipsRef.current?.querySelector<HTMLElement>(`[data-key="${currentRange.key}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [currentRange.key, loading]);

  const range = AGE_RANGES.find((r) => r.key === rangeKey) ?? currentRange;
  const items = useMemo(() => milestonesInRange(range), [range]);
  const progress = rangeProgress(local, range);
  const late = lateMilestones(local, age);
  const lateHasLanguage = late.some((m) => m.domain === 'bahasa');

  if (!activeChild) return null;

  const toggle = async (milestoneId: string) => {
    const was = isAchieved(local, milestoneId);
    haptic(was ? 'light' : 'success');
    const optimistic = was
      ? local.filter((m) => m.milestoneId !== milestoneId)
      : [...local, { id: `tmp_${milestoneId}`, childId: activeChild.id, milestoneId, achieved: true, achievedDate: todayISO(), createdAt: new Date().toISOString() }];
    setLocal(optimistic);
    const after = rangeProgress(optimistic, range);
    if (!was && after.done === after.total && after.total > 0) {
      setBurst((b) => b + 1);
      toast({ title: 'Semua milestone tercapai', body: `${activeChild.name} menuntaskan milestone usia ${range.label}.` });
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
            <div className="text-[14px] text-mute">Rentang {range.label}</div>
            {loading ? (
              <Skeleton className="h-6 w-32 mt-1" />
            ) : (
              <div className="text-[20px] leading-tight mt-0.5">
                {progress.done} dari {progress.total} tercapai
              </div>
            )}
            <div className="text-[14px] text-mute mt-1">{range.key === currentRange.key ? 'Rentang usia saat ini' : 'Rentang usia lain'}</div>
          </div>
        </Card>
      </div>

      {/* Late alert */}
      {!loading && late.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-5 mt-3">
          <div className="rounded-[22px] bg-brand-orange-tint border border-brand-orange/30 p-4">
            <div className="text-[17px] leading-snug">
              {late.length} milestone usia sebelumnya belum tercapai
            </div>
            <ul className="mt-2 space-y-1.5">
              {late.slice(0, 3).map((m) => (
                <li key={m.id} className="text-[15px] text-ink-2 leading-snug flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 shrink-0" />
                  <span>
                    <span className="text-mute">{domainLabel(m.domain)}:</span> {m.description}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[14px] text-mute mt-2 leading-relaxed">
              Bila sudah bisa, cukup centang. Bila belum, skrining singkat membantu memastikan perlu tidaknya bantuan ahli.
            </p>
            <Button
              size="sm"
              icon={ClipboardCheck}
              className="mt-3"
              onClick={() => nav.push({ name: 'screening', start: lateHasLanguage ? 'speech_delay' : 'kpsp' })}
            >
              {lateHasLanguage ? 'Mulai skrining bicara' : 'Mulai skrining KPSP'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Range chips */}
      <div ref={chipsRef} className="flex gap-2 overflow-x-auto no-scrollbar px-5 mt-5 pb-1">
        {AGE_RANGES.map((r) => (
          <Chip key={r.key} data-key={r.key} selected={r.key === rangeKey} onClick={() => setRangeKey(r.key)}>
            <span className="inline-flex items-center gap-1.5">
              {r.key === currentRange.key && <span className={cx('w-1.5 h-1.5 rounded-full', r.key === rangeKey ? 'bg-brand-yellow' : 'bg-brand-orange')} />}
              {r.label}
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
          <motion.div key={rangeKey} className="space-y-2.5" variants={listContainer} initial="hidden" animate="show">
            {items.map((m) => {
              const checked = isAchieved(local, m.id);
              const record = local.find((x) => x.milestoneId === m.id);
              const Icon = DOMAIN_ICON[m.domain];
              return (
                <motion.div
                  key={m.id}
                  variants={listItem}
                  layout
                  className={cx(
                    'rounded-[22px] border p-4 flex gap-3.5 items-start transition-colors duration-300',
                    checked ? 'bg-semantic-success-soft/60 border-semantic-success/20' : 'bg-white border-line shadow-card',
                  )}
                >
                  <CheckCircle checked={checked} onToggle={() => toggle(m.id)} label={m.description} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[13px] text-mute">
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                      {domainLabel(m.domain)}
                    </div>
                    <p className={cx('text-[16px] leading-snug mt-1', checked ? 'text-ink-2' : 'text-ink')}>{m.description}</p>
                    {checked && record?.achievedDate && (
                      <div className="text-[13px] text-semantic-success mt-1.5">Tercapai {formatDate(record.achievedDate)}</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <div className="px-5 mt-6">
        <div className="text-[14px] text-mute mb-2 px-1">Ringkasan per aspek</div>
        <MilestoneSummary milestones={local} age={age} />
      </div>

      <p className="px-6 mt-5 text-[13px] text-mute leading-relaxed">
        Setiap anak berkembang dengan kecepatannya sendiri. Ceklis ini membantu pemantauan, bukan diagnosis.
      </p>
    </Screen>
  );
}

