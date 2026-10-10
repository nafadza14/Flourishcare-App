import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Clock, Flame, Target } from 'lucide-react';
import Screen from '../components/ui/Screen';
import ProgressRing from '../components/ui/ProgressRing';
import Confetti from '../components/ui/Confetti';
import { Card } from '../components/ui/primitives';
import { TeamAvatar } from '../components/ui/Avatar';
import { useToast } from '../components/ui/Toast';
import { useStore } from '../lib/store';
import { ageInMonths } from '../lib/format';
import { activitiesForAge, getCompleted, getStreak, setCompleted } from '../lib/stimulasi';
import { tipOfTheDay } from '../lib/tips';
import { emitDataChanged } from '../lib/events';
import { haptic } from '../lib/haptics';
import { listContainer, listItem } from '../lib/motion';
import { cx } from '../lib/cx';
import UnbornGate from '../components/child/UnbornGate';

export default function StimulasiScreen({ onBack }: { onBack?: () => void }) {
  const { activeChild } = useStore();
  const toast = useToast();
  const [done, setDone] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (!activeChild) return;
    setDone(getCompleted(activeChild.id));
    setStreak(getStreak(activeChild.id));
  }, [activeChild?.id]);

  if (!activeChild) return null;
  if (activeChild.isUnborn) {
    return (
      <Screen title="Stimulasi" onBack={onBack}>
        <UnbornGate name={activeChild.name} />
      </Screen>
    );
  }
  const age = ageInMonths(activeChild.birthDate);
  const activities = activitiesForAge(age);
  const doneCount = activities.filter((a) => done.includes(a.id)).length;
  const tip = tipOfTheDay();

  const toggle = (id: string) => {
    const isDone = done.includes(id);
    const next = isDone ? done.filter((x) => x !== id) : [...done, id];
    haptic(isDone ? 'light' : 'success');
    setDone(next);
    setCompleted(activeChild.id, next);
    setStreak(getStreak(activeChild.id));
    emitDataChanged('stimulasi');
    const nextCount = activities.filter((a) => next.includes(a.id)).length;
    if (!isDone && nextCount === activities.length) {
      setBurst((b) => b + 1);
      toast({ title: 'Misi hari ini selesai', body: `Hebat! ${activeChild.name} sudah bermain dan belajar hari ini.` });
    }
  };

  return (
    <Screen title="Stimulasi" subtitle={`Misi bermain hari ini untuk ${activeChild.name}`} onBack={onBack}>
      <div className="px-5">
        <div className="rounded-[26px] bg-orange-gradient text-white p-5 shadow-orange relative overflow-hidden">
          <span className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" aria-hidden />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <ProgressRing value={activities.length ? doneCount / activities.length : 0} size={78} stroke={7} color="#FFFFFF" track="rgba(255,255,255,0.28)">
                <span className="text-[20px] tabular">
                  {doneCount}/{activities.length}
                </span>
              </ProgressRing>
              {burst > 0 && <Confetti key={burst} />}
            </div>
            <div className="min-w-0">
              <div className="text-[14px] text-white/85">Progres hari ini</div>
              <div className="text-[21px] leading-tight mt-0.5">
                {doneCount === activities.length ? 'Semua misi selesai' : `${activities.length - doneCount} misi lagi`}
              </div>
              <div className="inline-flex items-center gap-1.5 mt-2 h-7 px-3 rounded-full bg-white/20 text-[14px]">
                <Flame className="w-4 h-4" strokeWidth={2} />
                {streak > 0 ? `${streak} hari berturut-turut` : 'Mulai streak hari ini'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div className="px-5 mt-5 space-y-3" variants={listContainer} initial="hidden" animate="show">
        {activities.map((a) => {
          const isDone = done.includes(a.id);
          const expanded = open === a.id;
          return (
            <motion.div key={a.id} variants={listItem} layout>
              <Card className={cx('overflow-hidden transition-colors duration-300', isDone && 'bg-semantic-success-soft/50 border-semantic-success/20')}>
                <div className="flex items-start gap-3.5 p-4">
                  <motion.button
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={`Tandai ${a.title} selesai`}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggle(a.id)}
                    className={cx(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-300 mt-0.5',
                      isDone ? 'bg-semantic-success border-semantic-success text-white' : 'bg-white border-line-2',
                    )}
                  >
                    <AnimatePresence>
                      {isDone && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 600, damping: 20 }}>
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  <button className="flex-1 min-w-0 text-left" onClick={() => setOpen(expanded ? null : a.id)} aria-expanded={expanded}>
                    <div className="text-[13px] text-mute">{a.domain}</div>
                    <div className={cx('text-[18px] leading-snug mt-0.5', isDone && 'text-ink-2')}>{a.title}</div>
                    <div className="flex items-center gap-3 text-[14px] text-mute mt-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> 15 menit
                      </span>
                      <span className="flex items-center gap-1 text-brand-orange-deep">
                        {expanded ? 'Tutup' : 'Lihat langkah'}
                        <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
                          <ChevronDown className="w-4 h-4" />
                        </motion.span>
                      </span>
                    </div>
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <ol className="space-y-2.5">
                          {a.steps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-[15px] text-ink-2 leading-relaxed">
                              <span className="w-6 h-6 rounded-full bg-fill text-[13px] text-ink flex items-center justify-center shrink-0 tabular mt-0.5">{i + 1}</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        <div className="mt-3 rounded-[16px] bg-brand-orange-tint p-3.5 flex gap-2.5 text-[15px] text-ink-2 leading-relaxed">
                          <Target className="w-5 h-5 text-brand-orange-deep shrink-0 mt-0.5" strokeWidth={1.8} />
                          <span>{a.rationale}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <Card className="mx-5 mt-5 p-5">
        <div className="text-[14px] text-brand-orange-deep">Pesan dari ahli</div>
        <p className="text-[16px] leading-relaxed text-ink mt-2">{tip.text}</p>
        <div className="flex items-center gap-2.5 mt-4">
          <TeamAvatar size={34} />
          <div>
            <div className="text-[15px]">{tip.author}</div>
            <div className="text-[13px] text-mute">{tip.role} FlourishCare</div>
          </div>
        </div>
      </Card>
    </Screen>
  );
}
