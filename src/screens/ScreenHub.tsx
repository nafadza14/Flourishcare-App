import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BadgeCheck, Brain, CalendarCheck, ChevronRight, ClipboardCheck, Info, Sparkles } from 'lucide-react';
import Screen from '../components/ui/Screen';
import ChildChip from '../components/child/ChildChip';
import { Button, Card, EmptyState, Skeleton, StatusPill } from '../components/ui/primitives';
import { ScreeningHistory, SCREENING_ICONS } from './ScreeningScreen';
import type { Screening, ScreeningType } from '../types';
import { useStore } from '../lib/store';
import { useNav } from '../lib/nav';
import { useChildData } from '../lib/useChildData';
import { GROUPS, INSTRUMENTS, MCHAT_CLINIC, formFor, instrumentInfo, kpspAgeMonths, nextKpspAge, resultLabel, resultTone, suggestions } from '../lib/screening';
import { ageInMonths, firstName, formatDate } from '../lib/format';
import { listContainer, listItem } from '../lib/motion';
import { haptic } from '../lib/haptics';
import { cx } from '../lib/cx';

function ageRangeLabel(min: number, max: number) {
  const f = (m: number) => (m < 24 ? `${m} bulan` : `${Math.round(m / 12)} tahun`);
  if (min === 0) return `Usia sampai ${f(max)}`;
  return `Usia ${f(min)} sampai ${f(max)}`;
}

function lastOf(screenings: Screening[], type: ScreeningType) {
  return screenings.find((s) => s.type === type);
}

export default function ScreenHub({ onBack }: { onBack?: () => void }) {
  const { activeChild } = useStore();
  const nav = useNav();
  const { data, loading } = useChildData(activeChild?.id, !!activeChild && !activeChild.isUnborn);
  const age = activeChild ? ageInMonths(activeChild.birthDate) : 0;
  const due = useMemo(() => (activeChild ? suggestions(activeChild, data.screenings) : []), [activeChild, data.screenings]);

  if (!activeChild) return null;
  const name = firstName(activeChild.name);

  const open = (type: ScreeningType) => {
    haptic('light');
    nav.push({ name: 'screening', start: type });
  };

  if (activeChild.isUnborn) {
    return (
      <Screen title="Skrining" subtitle="Deteksi dini tumbuh kembang" onBack={onBack} withTabBar={!onBack}>
        <div className="px-5">
          <ChildChip />
        </div>
        <div className="px-5 mt-5">
          <EmptyState
            icon={ClipboardCheck}
            title="Skrining dimulai setelah si Kecil lahir"
            body="Mulai usia 0 bulan ada Tes Daya Dengar, lalu KPSP di usia 3 bulan. Kami akan mengingatkan sesuai usianya."
            action={
              <Button variant="soft" onClick={() => nav.setTab('track')}>
                Pantau kehamilan
              </Button>
            }
          />
        </div>
      </Screen>
    );
  }

  const kAge = kpspAgeMonths(activeChild);
  const nextK = nextKpspAge(kAge);

  return (
    <Screen title="Skrining" subtitle="Deteksi dini sesuai usia, hasil langsung dengan laporan PDF" onBack={onBack} withTabBar={!onBack}>
      <div className="px-5">
        <ChildChip />
      </div>

      {/* Recommended now */}
      <div className="px-5 mt-6">
        <h2 className="text-[21px] font-normal leading-tight">Disarankan untuk {name}</h2>
        <p className="text-[15px] text-mute mt-0.5">Sesuai usia {age < 24 ? `${age} bulan` : `${Math.floor(age / 12)} tahun ${age % 12 ? `${age % 12} bulan` : ''}`.trim()}</p>
      </div>
      <div className="px-5 mt-3">
        {loading ? (
          <Skeleton className="h-32 rounded-[24px]" />
        ) : due.length ? (
          <motion.div className="space-y-2.5" variants={listContainer} initial="hidden" animate="show">
            {due.map((d, i) => {
              const info = instrumentInfo(d.type);
              const Icon = SCREENING_ICONS[d.type];
              const form = formFor(d.type, activeChild).form;
              const hero = i === 0;
              return (
                <motion.button
                  key={d.type}
                  variants={listItem}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => open(d.type)}
                  className={cx(
                    'w-full text-left rounded-[24px] p-4 flex items-center gap-3.5 relative overflow-hidden',
                    hero ? 'bg-orange-gradient text-white shadow-orange' : 'bg-white border border-line shadow-card',
                  )}
                >
                  {hero && <span className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" aria-hidden />}
                  <span className={cx('w-12 h-12 rounded-full flex items-center justify-center shrink-0', hero ? 'bg-white text-brand-orange-deep' : 'bg-brand-orange-soft text-brand-orange-deep')}>
                    <Icon className="w-[22px] h-[22px]" strokeWidth={1.8} />
                  </span>
                  <span className="flex-1 min-w-0 relative">
                    <span className="block text-[17.5px] leading-tight">{form?.title ?? info.title}</span>
                    <span className={cx('block text-[14px] mt-0.5', hero ? 'text-white/85' : 'text-mute')}>
                      {d.reason} · {info.minutes} menit
                    </span>
                  </span>
                  {d.due && (
                    <span className={cx('text-[12px] px-2.5 h-6 rounded-full inline-flex items-center shrink-0 relative', hero ? 'bg-white/20 text-white' : 'bg-brand-orange-soft text-brand-orange-deep')}>
                      Jadwal
                    </span>
                  )}
                  <ChevronRight className={cx('w-5 h-5 shrink-0 relative', hero ? 'text-white/80' : 'text-faint')} />
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <Card className="p-4 flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-semantic-success-soft text-semantic-success flex items-center justify-center shrink-0">
              <BadgeCheck className="w-5 h-5" />
            </span>
            <div className="text-[15px] text-ink-2 leading-snug">
              Skrining terjadwal untuk usia ini sudah dilakukan.{nextK ? ` KPSP berikutnya di usia ${nextK} bulan.` : ''}
            </div>
          </Card>
        )}
      </div>

      {/* M-CHAT-R/F window: done with a psychologist */}
      {age >= MCHAT_CLINIC.minMonths && age <= MCHAT_CLINIC.maxMonths && (
        <div className="px-5 mt-3">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-full bg-fill text-ink-2 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <div className="text-[16.5px] leading-tight">Skrining autisme M-CHAT-R/F</div>
                <p className="text-[14.5px] text-mute leading-relaxed mt-1">
                  Usia 16 sampai 30 bulan adalah waktu yang dianjurkan. M-CHAT-R/F lengkap dengan wawancara lanjutan dilakukan bersama psikolog FlourishCare.
                </p>
                <Button size="sm" variant="soft" icon={CalendarCheck} className="mt-3" onClick={() => nav.push({ name: 'booking', category: MCHAT_CLINIC.booking.category, subCode: MCHAT_CLINIC.booking.subCode })}>
                  {MCHAT_CLINIC.booking.label}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* All tools by group */}
      <div className="mt-7 bg-white rounded-t-[32px] pt-6 hairline-t" style={{ paddingBottom: onBack ? 'calc(var(--sab) + 32px)' : 'calc(var(--sab) + 112px)' }}>
        {GROUPS.map((g) => {
          const tools = INSTRUMENTS.filter((i) => i.group === g.key);
          if (!tools.length) return null;
          return (
            <div key={g.key} className="mb-6">
              <div className="px-5 mb-2.5">
                <h3 className="text-[19px] font-normal leading-tight">{g.title}</h3>
                <p className="text-[14px] text-mute mt-0.5">{g.subtitle}</p>
              </div>
              <div className="px-5 space-y-2.5">
                {tools.map((inst) => {
                  const Icon = SCREENING_ICONS[inst.type];
                  const avail = formFor(inst.type, activeChild);
                  const inRange = age >= inst.minMonths && age <= inst.maxMonths;
                  const last = lastOf(data.screenings, inst.type);
                  return (
                    <motion.button
                      key={inst.type}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => open(inst.type)}
                      className={cx('w-full text-left rounded-[22px] border p-4 flex items-start gap-3.5', inRange ? 'bg-white border-line shadow-card' : 'bg-fill/60 border-transparent')}
                    >
                      <span className={cx('w-11 h-11 rounded-full flex items-center justify-center shrink-0', inRange ? 'bg-brand-orange-soft text-brand-orange-deep' : 'bg-white text-mute')}>
                        <Icon className="w-5 h-5" strokeWidth={1.8} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={cx('block text-[16.5px] leading-tight', !inRange && 'text-ink-2')}>{inst.title}</span>
                        <span className="block text-[13.5px] text-mute mt-0.5">
                          {ageRangeLabel(inst.minMonths, inst.maxMonths)} · {inst.basis}
                        </span>
                        {last ? (
                          <span className="mt-2 flex items-center gap-2 flex-wrap">
                            <StatusPill tone={resultTone(last.result)}>{resultLabel(last.result, last.type)}</StatusPill>
                            <span className="text-[13px] text-mute">{formatDate(last.createdAt)}</span>
                          </span>
                        ) : !avail.form && inRange && avail.reason ? (
                          <span className="block text-[13px] text-[#9A6A12] mt-1.5 leading-snug">{avail.reason}</span>
                        ) : null}
                      </span>
                      <ChevronRight className="w-5 h-5 text-faint shrink-0 mt-2.5" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="px-5 mt-2">
          <h3 className="text-[19px] font-normal mb-3">Riwayat dan laporan PDF</h3>
          {loading ? (
            <Skeleton className="h-20 rounded-[22px]" />
          ) : (
            <ScreeningHistory screenings={data.screenings} onOpen={(s) => nav.push({ name: 'screening', reportId: s.id })} />
          )}
        </div>
        <div className="px-5 mt-5">
          <div className="rounded-[18px] bg-fill p-4 flex gap-3 text-[13.5px] text-ink-2 leading-relaxed">
            <Info className="w-[18px] h-[18px] text-mute shrink-0 mt-0.5" />
            <span>
              Hasil skrining bukan diagnosis. Gunakan sebagai bahan diskusi bersama dokter anak, psikolog, atau terapis. Setiap hasil bisa diunduh sebagai PDF.
            </span>
          </div>
        </div>
        <div className="px-5 mt-3 flex items-center justify-center gap-1.5 text-[13px] text-mute">
          <Sparkles className="w-3.5 h-3.5" /> KPSP dan GPPH mengikuti Buku Bagan SDIDTK Kemenkes 2022
        </div>
      </div>
    </Screen>
  );
}
