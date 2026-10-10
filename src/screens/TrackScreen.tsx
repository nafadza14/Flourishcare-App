import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BookHeart, ChartColumn, ChevronRight, Footprints, HeartPulse, Plus, Syringe, type LucideIcon } from 'lucide-react';
import Screen from '../components/ui/Screen';
import ChildChip from '../components/child/ChildChip';
import PregnancyView from '../components/pregnancy/PregnancyView';
import BabyQuickCard from '../components/babylog/BabyQuick';
import ProgressRing from '../components/ui/ProgressRing';
import { Card, Skeleton, StatusPill, type Tone } from '../components/ui/primitives';
import { useStore } from '../lib/store';
import { useNav, type Route } from '../lib/nav';
import { useChildData } from '../lib/useChildData';
import { useBabyLogs, TRACKER_MAX_MONTHS } from '../lib/babylog';
import { useJournal, categoryInfo } from '../lib/journal';
import { getGrowthStatus, latestRecord } from '../lib/growth';
import { checkpointForAge, checkpointShortLabel, devAgeMonths, lateMilestones, progressAt } from '../lib/milestones';
import { buildVaccineSchedule, nextVaccine, vaccineTiming } from '../lib/vaccines';
import { ageInMonths, firstName, formatDate } from '../lib/format';
import { listContainer, listItem } from '../lib/motion';
import { haptic } from '../lib/haptics';
import { cx } from '../lib/cx';

function Tile({ icon: Icon, title, status, tone, onClick, children, accessory }: { icon: LucideIcon; title: string; status?: string; tone?: Tone; onClick: () => void; children?: React.ReactNode; accessory?: React.ReactNode }) {
  return (
    <motion.div variants={listItem}>
      <Card className="overflow-hidden">
        <motion.button
          whileTap={{ backgroundColor: '#FBF6F1' }}
          onClick={() => {
            haptic('light');
            onClick();
          }}
          className="w-full text-left p-4"
        >
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-brand-orange-soft text-brand-orange-deep flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" strokeWidth={1.8} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[17px] leading-tight">{title}</div>
              {status && <div className="text-[14px] text-mute mt-0.5 leading-snug">{status}</div>}
            </div>
            {accessory}
            {tone && !accessory && <span className={cx('w-2.5 h-2.5 rounded-full shrink-0', tone === 'success' ? 'bg-semantic-success' : tone === 'warning' ? 'bg-semantic-warning' : tone === 'danger' ? 'bg-semantic-danger' : 'bg-faint')} />}
            <ChevronRight className="w-5 h-5 text-faint shrink-0" />
          </div>
          {children}
        </motion.button>
      </Card>
    </motion.div>
  );
}

export default function TrackScreen({ onBack }: { onBack?: () => void }) {
  const { activeChild } = useStore();
  const nav = useNav();
  const unborn = !!activeChild?.isUnborn;
  const { data, loading } = useChildData(activeChild?.id, !!activeChild && !unborn);
  const age = activeChild && !unborn ? ageInMonths(activeChild.birthDate) : 0;
  const showTracker = !!activeChild && !unborn && age < TRACKER_MAX_MONTHS;
  const { logs } = useBabyLogs(activeChild?.id, showTracker);
  const { entries } = useJournal(!unborn ? activeChild?.id : undefined);

  const derived = useMemo(() => {
    if (!activeChild || unborn) return null;
    const growth = getGrowthStatus(activeChild, data.growth);
    const latest = latestRecord(data.growth);
    const dev = devAgeMonths(activeChild);
    const checkpoint = checkpointForAge(dev);
    const progress = progressAt(data.milestones, checkpoint);
    const late = lateMilestones(data.milestones, dev);
    const schedule = buildVaccineSchedule(activeChild.birthDate, data.immunizations);
    const next = nextVaccine(schedule);
    const catchup = schedule.filter((v) => v.state === 'catchup');
    return { growth, latest, checkpoint, progress, late, next, catchup };
  }, [activeChild, unborn, data]);

  if (!activeChild) return null;
  const name = firstName(activeChild.name);
  const go = (route: Route) => nav.push(route);

  return (
    <Screen title="Pantau" subtitle={unborn ? 'Kehamilan minggu demi minggu' : 'Tumbuh kembang harian'} onBack={onBack} withTabBar={!onBack}>
      <div className="px-5 flex items-center justify-between gap-3">
        <ChildChip />
      </div>

      {unborn ? (
        <div className="mt-5" style={{ paddingBottom: onBack ? 'calc(var(--sab) + 24px)' : undefined }}>
          <PregnancyView child={activeChild} />
        </div>
      ) : (
        <motion.div className="px-5 mt-5 space-y-3" variants={listContainer} initial="hidden" animate="show">
          {showTracker && (
            <motion.div variants={listItem}>
              <BabyQuickCard child={activeChild} logs={logs} onOpen={() => go({ name: 'babylog' })} />
            </motion.div>
          )}

          {loading || !derived ? (
            <>
              <Skeleton className="h-28 rounded-[22px]" />
              <Skeleton className="h-24 rounded-[22px]" />
              <Skeleton className="h-24 rounded-[22px]" />
            </>
          ) : (
            <>
              <Tile
                icon={ChartColumn}
                title="Pertumbuhan"
                status={derived.latest ? `Terakhir diukur ${formatDate(derived.latest.date)}` : `Catat berat dan panjang ${name}`}
                onClick={() => go({ name: 'growth' })}
                accessory={<StatusPill tone={derived.growth.tone as Tone}>{derived.growth.short}</StatusPill>}
              >
                {derived.growth.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pl-14">
                    {derived.growth.chips.slice(0, 4).map((c) => (
                      <span
                        key={c.indicator}
                        className={cx(
                          'h-7 px-2.5 rounded-full text-[12.5px] inline-flex items-center gap-1',
                          c.category.tone === 'success' ? 'bg-semantic-success-soft text-semantic-success' : c.category.tone === 'warning' ? 'bg-semantic-warning-soft text-[#9A6A12]' : 'bg-semantic-danger-soft text-semantic-danger',
                        )}
                      >
                        <b className="font-medium">{c.short}</b> {c.category.label.toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}
              </Tile>

              <Tile
                icon={Footprints}
                title="Milestone"
                status={
                  data.milestones.length === 0
                    ? `Centang kemampuan yang sudah bisa ${name}`
                    : derived.late.length
                    ? `${derived.late.length} kemampuan usia ${checkpointShortLabel(derived.late[0].ageMonths)} belum dicentang`
                    : `${derived.progress.done} dari ${derived.progress.total} untuk usia ${derived.checkpoint.label.toLowerCase()}`
                }
                onClick={() => go({ name: 'milestone' })}
                accessory={
                  <ProgressRing value={derived.progress.ratio} size={42} stroke={4} label={`${derived.progress.done} dari ${derived.progress.total}`}>
                    <span className="text-[11px] tabular">{Math.round(derived.progress.ratio * 100)}%</span>
                  </ProgressRing>
                }
              />

              <Tile
                icon={Syringe}
                title="Imunisasi"
                status={
                  data.immunizations.length === 0 && derived.catchup.length
                    ? 'Lengkapi riwayat dari buku KIA'
                    : derived.catchup.length
                      ? `${derived.catchup.length} vaksin perlu dikejar`
                      : derived.next
                        ? `${derived.next.ref.vaccineName.replace(/\s*\(.*\)/, '')}, ${vaccineTiming(derived.next).toLowerCase()}`
                        : 'Semua vaksin dasar lengkap'
                }
                tone={derived.catchup.length ? 'warning' : 'success'}
                onClick={() => go({ name: 'vaccine' })}
              />

              <Tile
                icon={BookHeart}
                title="Jurnal dan album"
                status={entries.length ? `${entries.length} catatan, terakhir ${formatDate(entries[0].date)}` : `Simpan momen pertama ${name}`}
                onClick={() => go({ name: 'journal' })}
                accessory={
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      go({ name: 'journal', compose: true });
                    }}
                    className="h-8 px-3 rounded-full bg-brand-orange-soft text-brand-orange-deep text-[13.5px] inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tulis
                  </span>
                }
              >
                {entries.some((e) => e.media.some((m) => m.url && m.type === 'image')) && (
                  <div className="flex gap-1.5 mt-3 pl-14">
                    {entries
                      .flatMap((e) => e.media.filter((m) => m.url && m.type === 'image'))
                      .slice(0, 4)
                      .map((m) => (
                        <img key={m.path} src={m.url} alt="" loading="lazy" className="w-14 h-14 rounded-[12px] object-cover bg-fill" />
                      ))}
                  </div>
                )}
                {entries[0] && !entries[0].media.length && (
                  <div className="mt-2 pl-14 text-[13.5px] text-ink-2 line-clamp-1">
                    {categoryInfo(entries[0].category).label}: {entries[0].title || entries[0].body}
                  </div>
                )}
              </Tile>

              <Tile
                icon={HeartPulse}
                title="Profil dan riwayat kesehatan"
                status={[activeChild.allergies ? `Alergi: ${activeChild.allergies}` : null, activeChild.gestationalWeeks && activeChild.gestationalWeeks < 37 ? `Lahir ${activeChild.gestationalWeeks} minggu` : null, activeChild.bloodType ? `Gol. darah ${activeChild.bloodType}` : null].filter(Boolean).join(' · ') || 'Alergi, riwayat lahir, dan catatan kesehatan'}
                onClick={() => go({ name: 'child' })}
              />
            </>
          )}
          <div style={{ height: onBack ? 'calc(var(--sab) + 12px)' : 0 }} />
        </motion.div>
      )}
    </Screen>
  );
}
