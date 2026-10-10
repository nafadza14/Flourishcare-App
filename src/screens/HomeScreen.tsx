import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Baby,
  BookHeart,
  BookOpen,
  CalendarCheck,
  HeartPulse,
  Milk,
  ChartColumn,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Footprints,
  Mars,
  MessageCircleHeart,
  Puzzle,
  Ruler,
  Scale,
  Sparkles,
  Syringe,
  Venus,
  type LucideIcon,
} from 'lucide-react';
import Screen from '../components/ui/Screen';
import { ArrowCorner, Button, Card, IconButton, Skeleton, StatItem } from '../components/ui/primitives';
import { KidAvatar, ParentAvatar, PhotoAvatar, TeamAvatar } from '../components/ui/Avatar';
import ExpertSheet from '../components/sheets/ExpertSheet';
import { useExperts } from '../lib/experts';
import type { ClinicalExpert } from '../data/team';
import ChildSwitcherSheet from '../components/sheets/ChildSwitcherSheet';
import FlourishCareLogo from '../components/FlourishCareLogo';
import { useStore } from '../lib/store';
import { useNav, type Route } from '../lib/nav';
import { useChildData } from '../lib/useChildData';
import { ageInMonths, ageLabel, firstName, formatDate, formatNumber } from '../lib/format';
import { getGrowthStatus, latestRecord } from '../lib/growth';
import { checkpointForAge, checkpointShortLabel, devAgeMonths, lateMilestones, progressAt } from '../lib/milestones';
import { instrumentInfo, suggestions } from '../lib/screening';
import ChildAvatar from '../components/child/ChildAvatar';
import BabyQuickCard from '../components/babylog/BabyQuick';
import { useBabyLogs, TRACKER_MAX_MONTHS } from '../lib/babylog';
import { countdownLabel, gestationLabel, pregnancyStatus } from '../lib/pregnancy';
import type { Child } from '../types';
import { buildVaccineSchedule, nextVaccine, vaccineTiming } from '../lib/vaccines';
import { resultLabel } from '../lib/screening';
import type { TabKey } from '../lib/nav';
import { activitiesForAge, getCompleted } from '../lib/stimulasi';
import { tipOfTheDay } from '../lib/tips';
import { ARTICLES_SEED } from '../data/seedData';
import { listContainer, listItem } from '../lib/motion';
import { cx } from '../lib/cx';
import { haptic } from '../lib/haptics';

interface Feature {
  key: string;
  title: string;
  status: string;
  icon: LucideIcon;
  route?: Route;
  tab?: TabKey;
  hero?: boolean;
}

function FeatureCard({ feature, onOpen }: { feature: Feature; onOpen: () => void }) {
  const Icon = feature.icon;
  return (
    <motion.button
      variants={listItem}
      whileTap={{ scale: 0.965 }}
      transition={{ type: 'spring', stiffness: 520, damping: 30 }}
      onClick={() => {
        haptic('light');
        onOpen();
      }}
      className={cx(
        'relative text-left rounded-[24px] p-4 h-[168px] flex flex-col justify-between overflow-hidden',
        feature.hero ? 'bg-orange-gradient text-white shadow-orange' : 'bg-white border border-line shadow-card',
      )}
    >
      {feature.hero && <span className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" aria-hidden />}
      <span
        className={cx(
          'w-[46px] h-[46px] rounded-full flex items-center justify-center',
          feature.hero ? 'bg-white text-brand-orange-deep shadow-card' : 'bg-fill text-ink',
        )}
      >
        <Icon className="w-[21px] h-[21px]" strokeWidth={1.8} />
      </span>
      <span className="relative">
        <span className={cx('block text-[18px] leading-tight', feature.hero ? 'text-white' : 'text-ink')}>{feature.title}</span>
        <span className={cx('block text-[14px] mt-1 leading-snug line-clamp-2', feature.hero ? 'text-white/85' : 'text-mute')}>{feature.status}</span>
      </span>
    </motion.button>
  );
}

const GUEST_FEATURES: Feature[] = [
  { key: 'vaccine', title: 'Jadwal Imunisasi', status: 'Sesuai jadwal IDAI', icon: Syringe, route: { name: 'vaccine' }, hero: true },
  { key: 'growth', title: 'Pertumbuhan', status: 'Grafik standar WHO', icon: ChartColumn, route: { name: 'growth' } },
  { key: 'milestone', title: 'Milestone', status: 'Ceklis sesuai usia', icon: Footprints, route: { name: 'milestone' } },
  { key: 'screening', title: 'Skrining Dini', status: 'KPSP, bicara, autisme, sensori', icon: ClipboardCheck, tab: 'screen' },
  { key: 'pregnancy', title: 'Kehamilan', status: 'HPL dan janin tiap minggu', icon: Baby, tab: 'track' },
  { key: 'journal', title: 'Jurnal & Album', status: 'Simpan momen pertama', icon: BookHeart, route: { name: 'journal' } },
  { key: 'stimulasi', title: 'Stimulasi', status: 'Ide main tiap hari', icon: Puzzle, route: { name: 'stimulasi' } },
  { key: 'qa', title: 'Tanya Ahli', status: 'Dijawab psikolog & terapis', icon: MessageCircleHeart, route: { name: 'qa' } },
  { key: 'library', title: 'Edukasi', status: 'Bacaan dari tim ahli', icon: BookOpen, route: { name: 'library' } },
  { key: 'booking', title: 'Booking Klinik', status: 'Terapi & konsultasi', icon: CalendarCheck, route: { name: 'booking' } },
];

/** Real FlourishCare team (www.flourishcare.id/team), tap for profile. */
function TeamSection() {
  const experts = useExperts();
  const [open, setOpen] = useState<ClinicalExpert | null>(null);
  if (!experts.length) return null;
  return (
    <div className="mt-7">
      <div className="px-5 mb-3">
        <h2 className="text-[22px] font-normal leading-tight">Tim ahli kami</h2>
        <p className="text-[15px] text-mute mt-0.5">Psikolog dan terapis anak bersertifikat STR</p>
      </div>
      <motion.div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1" variants={listContainer} initial="hidden" animate="show">
        {experts.map((e) => (
          <motion.button
            key={e.id}
            variants={listItem}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              haptic('light');
              setOpen(e);
            }}
            className="w-[168px] shrink-0 text-left bg-white rounded-[24px] border border-line shadow-card p-3"
          >
            <PhotoAvatar src={e.photoUrl} name={e.name} size={64} rounded />
            <div className="text-[16px] leading-snug mt-3 line-clamp-2 min-h-[42px]">{e.name.split(',')[0]}</div>
            <div className="text-[13px] text-brand-orange-deep mt-0.5">{e.role}</div>
            <div className="text-[12.5px] text-mute mt-1.5 line-clamp-2 leading-snug">{e.specialties.slice(0, 2).join(' · ')}</div>
          </motion.button>
        ))}
      </motion.div>
      <ExpertSheet expert={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function TipCard() {
  const tip = tipOfTheDay();
  return (
    <Card className="mx-5 p-5 relative overflow-hidden">
      <span className="absolute -right-6 -bottom-8 w-28 h-28 rounded-full bg-brand-orange-soft" aria-hidden />
      <div className="relative flex items-center gap-2 text-[14px] text-brand-orange-deep">
        <Sparkles className="w-4 h-4" strokeWidth={1.8} />
        Tips hari ini
      </div>
      <p className="relative text-[17px] leading-relaxed text-ink mt-2.5">{tip.text}</p>
      <div className="relative flex items-center gap-2.5 mt-4">
        <TeamAvatar size={34} />
        <div className="min-w-0">
          <div className="text-[15px] text-ink truncate">{tip.author}</div>
          <div className="text-[13px] text-mute">{tip.role}</div>
        </div>
      </div>
    </Card>
  );
}

/** Clinic staff signed in without a child profile: shortcut to the question queue. */
function StaffHome() {
  const nav = useNav();
  const { profile } = useStore();
  return (
    <Screen title="Beranda" hideNav largeTitle={false} withTabBar bottomSpacer={false}>
      <div className="px-5 pt-3 flex items-center gap-2.5">
        <FlourishCareLogo variant="full" className="h-10 w-auto" />
        <div>
          <div className="text-[19px] leading-tight">Hai, {firstName(profile?.fullName)}</div>
          <div className="text-[13px] text-mute">Mode tim FlourishCare</div>
        </div>
      </div>
      <div className="px-5 mt-6">
        <div className="rounded-[26px] bg-orange-gradient text-white p-5 shadow-orange relative overflow-hidden">
          <span className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" aria-hidden />
          <div className="relative text-[14px] text-white/85">Tanya Ahli</div>
          <div className="relative text-[24px] leading-tight mt-1">Jawab pertanyaan orang tua</div>
          <p className="relative text-[15px] text-white/85 mt-1.5">Jawaban akan tampil atas nama Anda dan dikirim sebagai notifikasi.</p>
          <Button variant="secondary" className="relative mt-4" icon={MessageCircleHeart} onClick={() => nav.push({ name: 'qa' })}>
            Buka antrean
          </Button>
        </div>
      </div>
      <TeamSection />
      <div className="px-5 mt-6 text-[14px] text-mute leading-relaxed" style={{ paddingBottom: 'calc(var(--sab) + 120px)' }}>
        Ingin memantau anak sendiri? Tambahkan profil anak dari menu Akun.
      </div>
    </Screen>
  );
}

function GuestHome() {
  const nav = useNav();
  return (
    <Screen title="Beranda" hideNav largeTitle={false} withTabBar bottomSpacer={false}>
      <div className="px-5 pt-3 flex items-center justify-between">
        <FlourishCareLogo variant="full" className="h-[52px] w-auto" alt="FlourishCare" />
        <Button size="sm" variant="secondary" onClick={() => nav.push({ name: 'auth', mode: 'login' })}>
          Masuk
        </Button>
      </div>

      <h1 className="px-5 mt-7 text-[32px] leading-[1.12] tracking-[-0.025em] font-normal">
        Setiap anak berhak tumbuh sepenuhnya <span className="anim-wiggle">🌱</span>
      </h1>
      <p className="px-5 mt-2 text-[17px] text-mute leading-snug">Pantau kehamilan, pertumbuhan, milestone, imunisasi, dan skrining si Kecil dalam satu aplikasi, didampingi psikolog dan terapis anak FlourishCare.</p>

      <div className="mx-5 mt-6 rounded-[28px] bg-orange-gradient text-white p-5 shadow-orange relative overflow-hidden">
        <span className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-white/10" aria-hidden />
        <div className="absolute right-3 bottom-3 anim-float">
          <KidAvatar size={96} bg={false} />
        </div>
        <div className="relative max-w-[62%]">
          <div className="text-[14px] text-white/85">Gratis untuk Ayah Bunda</div>
          <div className="text-[22px] leading-tight mt-1">Yuk, mulai pantau tumbuh kembang si Kecil</div>
          <Button
            size="sm"
            variant="secondary"
            className="mt-4 !text-brand-orange-deep !border-white"
            onClick={() => nav.push({ name: 'auth', mode: 'register' })}
          >
            Daftar gratis
          </Button>
        </div>
      </div>

      <div className="mt-7 bg-white rounded-t-[32px] pt-6 hairline-t min-h-[60%]" style={{ paddingBottom: 'calc(var(--sab) + 112px)' }}>
        <div className="px-5 mb-4">
          <h2 className="text-[22px] font-normal leading-tight">Fitur</h2>
          <p className="text-[15px] text-mute mt-0.5">Lengkap untuk tumbuh kembang si Kecil</p>
        </div>
        <motion.div className="grid grid-cols-2 gap-3 px-5" variants={listContainer} initial="hidden" animate="show">
          {GUEST_FEATURES.map((f) => (
            <FeatureCard key={f.key} feature={f} onOpen={() => (f.tab ? nav.setTab(f.tab) : f.route && nav.push(f.route))} />
          ))}
        </motion.div>
        <TeamSection />

        <div className="mt-6">
          <TipCard />
        </div>
      </div>
    </Screen>
  );
}

/** Home for a pregnancy profile */
function PregnancyHome({ child }: { child: Child }) {
  const nav = useNav();
  const { profile, unreadCount, parentVariant } = useStore();
  const s = pregnancyStatus(child);
  const features: Feature[] = [
    { key: 'track', title: 'Pantau Kehamilan', status: `Minggu ke-${s.weeks}, ${countdownLabel(s.daysToHpl)}`, icon: Baby, tab: 'track', hero: true },
    { key: 'qa', title: 'Tanya Ahli', status: 'Dijawab psikolog & terapis', icon: MessageCircleHeart, route: { name: 'qa' } },
    { key: 'library', title: 'Edukasi', status: 'Bacaan dari tim ahli', icon: BookOpen, route: { name: 'library' } },
    { key: 'booking', title: 'Booking Klinik', status: 'Konsultasi & kelas', icon: CalendarCheck, route: { name: 'booking' } },
  ];
  return (
    <Screen title="Beranda" hideNav largeTitle={false} withTabBar bottomSpacer={false}>
      <div className="px-5 pt-3 flex items-center justify-between gap-3">
        <button className="flex items-center gap-3 min-w-0 text-left" onClick={() => nav.setTab('account')}>
          <ParentAvatar variant={parentVariant} size={46} />
          <span className="min-w-0">
            <span className="block text-[17px] leading-tight truncate">Hai, {firstName(profile?.fullName)}</span>
            <span className="block text-[14px] text-mute mt-0.5 truncate">{formatDate(new Date(), 'day')}</span>
          </span>
        </button>
        <IconButton icon={Bell} label="Notifikasi" badge={unreadCount > 0} onClick={() => nav.push({ name: 'notifications' })} />
      </div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-5 mt-6 text-[32px] leading-[1.12] tracking-[-0.025em] font-normal">
        Si Kecil kini sebesar {s.week.size} <span className="anim-wiggle">🌱</span>
      </motion.h1>
      <Card className="mx-5 mt-5 overflow-hidden">
        <motion.button whileTap={{ backgroundColor: '#FBF6F1' }} onClick={() => nav.setTab('track')} className="w-full flex items-center gap-3 p-4 text-left">
          <ChildAvatar child={child} size={52} />
          <span className="flex-1 min-w-0">
            <span className="block text-[19px] leading-tight truncate">{child.name}</span>
            <span className="block text-[14px] text-mute mt-0.5">Hamil {gestationLabel(s)} · HPL {formatDate(s.hpl)}</span>
          </span>
          <ArrowCorner />
        </motion.button>
        <div className="mx-4 mb-4 h-2 rounded-full bg-fill overflow-hidden">
          <motion.div className="h-full bg-orange-gradient rounded-full" initial={{ width: 0 }} animate={{ width: `${s.progress * 100}%` }} transition={{ duration: 0.9 }} />
        </div>
      </Card>
      <div className="mt-7 bg-white rounded-t-[32px] pt-6 hairline-t" style={{ paddingBottom: 'calc(var(--sab) + 112px)' }}>
        <div className="px-5 mb-4">
          <h2 className="text-[22px] font-normal leading-tight">Fitur</h2>
          <p className="text-[15px] text-mute mt-0.5">Menemani Bunda sampai si Kecil lahir</p>
        </div>
        <motion.div className="grid grid-cols-2 gap-3 px-5" variants={listContainer} initial="hidden" animate="show">
          {features.map((f) => (
            <FeatureCard key={f.key} feature={f} onOpen={() => (f.tab ? nav.setTab(f.tab) : f.route && nav.push(f.route))} />
          ))}
        </motion.div>
        <TeamSection />
        <div className="mt-6">
          <TipCard />
        </div>
      </div>
    </Screen>
  );
}

export default function HomeScreen() {
  const store = useStore();
  const nav = useNav();
  const { profile, activeChild, children, unreadCount, parentVariant } = store;
  const unborn = !!activeChild?.isUnborn;
  const { data, loading } = useChildData(activeChild?.id, store.isAuthed && !unborn);
  const childAge = activeChild && !unborn ? ageInMonths(activeChild.birthDate) : 99;
  const { logs } = useBabyLogs(activeChild?.id, store.isAuthed && !unborn && childAge < TRACKER_MAX_MONTHS);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const derived = useMemo(() => {
    if (!activeChild || activeChild.isUnborn) return null;
    const age = ageInMonths(activeChild.birthDate);
    const growthStatus = getGrowthStatus(activeChild, data.growth);
    const latest = latestRecord(data.growth);
    const dev = devAgeMonths(activeChild);
    const progress = progressAt(data.milestones, checkpointForAge(dev));
    const late = lateMilestones(data.milestones, dev);
    const dueScreenings = suggestions(activeChild, data.screenings).filter((x) => x.due);
    const schedule = buildVaccineSchedule(activeChild.birthDate, data.immunizations);
    const next = nextVaccine(schedule);
    const catchup = schedule.filter((v) => v.state === 'catchup');
    const lastScreening = data.screenings[0];
    const activities = activitiesForAge(age);
    const doneToday = getCompleted(activeChild.id).filter((id) => activities.some((a) => a.id === id)).length;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const myQuestions = data.questions.filter((q) => q.parentId === profile?.id);
    const usedQuota = myQuestions.filter((q) => new Date(q.createdAt) >= monthStart).length;
    const pending = myQuestions.some((q) => q.status === 'pending');
    const upcoming = data.bookings
      .filter((b) => b.status !== 'cancelled' && new Date(b.scheduledAt) >= new Date(new Date().toDateString()))
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
    return { age, growthStatus, latest, progress, late, schedule, next, catchup, lastScreening, activities, doneToday, usedQuota, pending, upcoming, dueScreenings };
  }, [activeChild, data, profile?.id]);

  if (!store.isAuthed) return <GuestHome />;
  if (!activeChild && profile?.isStaff) return <StaffHome />;
  if (activeChild?.isUnborn) return <PregnancyHome child={activeChild} />;
  if (!activeChild || !derived) return null;

  const name = activeChild.name;
  const { age, growthStatus, latest, progress, late, next, catchup, lastScreening, activities, doneToday, usedQuota, pending, upcoming, dueScreenings } = derived;

  const first = firstName(name);
  let headline: React.ReactNode;
  if (growthStatus.level === 'empty') {
    headline = (
      <>
        Yuk, mulai pantau tumbuh kembang {first} <span className="anim-wiggle">🌱</span>
      </>
    );
  } else if (growthStatus.tone === 'success') {
    headline = (
      <>
        {first} tumbuh baik minggu ini <span className="anim-wiggle">🎉</span>
      </>
    );
  } else if (growthStatus.level === 'out_of_range' || growthStatus.level === 'concern') {
    headline = (
      <>
        Semangat menemani {first} tumbuh minggu ini <span className="anim-wiggle">🌱</span>
      </>
    );
  } else {
    headline = (
      <>
        Yuk, cek berat badan {first} minggu ini <span className="anim-wiggle">🌱</span>
      </>
    );
  }

  // A brand-new profile has nothing recorded yet: invite to fill history instead of flagging it as late.
  const noVaccineRecords = data.immunizations.length === 0;
  const noMilestoneRecords = data.milestones.length === 0;
  const attention: { text: string; route: Route }[] = [];
  if (!loading && noVaccineRecords && catchup.length) attention.push({ text: `Lengkapi riwayat imunisasi ${first} dari buku KIA`, route: { name: 'vaccine' } });
  else if (catchup.length) attention.push({ text: `${catchup.length} imunisasi perlu dikejar`, route: { name: 'vaccine' } });
  if (!loading && noMilestoneRecords && late.length) attention.push({ text: `Isi ceklis milestone ${first} sesuai usianya`, route: { name: 'milestone' } });
  else if (late.length) attention.push({ text: `${late.length} milestone usia ${checkpointShortLabel(late[0].ageMonths)} belum dicentang`, route: { name: 'milestone' } });
  if (growthStatus.tone === 'warning' || growthStatus.tone === 'danger') attention.push({ text: growthStatus.title, route: { name: 'growth' } });
  if (lastScreening && !['normal', 'risiko_rendah'].includes(lastScreening.result)) {
    attention.push({ text: `Hasil ${instrumentInfo(lastScreening.type).short} terakhir: ${resultLabel(lastScreening.result, lastScreening.type).toLowerCase()}`, route: { name: 'screening', reportId: lastScreening.id } });
  }
  if (!loading && dueScreenings.length) {
    attention.unshift({ text: `${dueScreenings[0].reason} sudah waktunya`, route: { name: 'screening', start: dueScreenings[0].type } });
  }

  const features: Feature[] = [
    {
      key: 'vaccine',
      title: 'Jadwal Imunisasi',
      status: noVaccineRecords && catchup.length
        ? 'Lengkapi riwayat dari buku KIA'
        : catchup.length
        ? `${catchup.length} vaksin perlu dikejar`
        : next
          ? `${next.ref.vaccineName.replace(/\s*\(.*\)/, '')}, ${vaccineTiming(next).toLowerCase()}`
          : 'Semua vaksin lengkap',
      icon: Syringe,
      route: { name: 'vaccine' },
      hero: true,
    },
    { key: 'growth', title: 'Pertumbuhan', status: growthStatus.short, icon: ChartColumn, route: { name: 'growth' } },
    {
      key: 'milestone',
      title: 'Milestone',
      status: noMilestoneRecords ? 'Mulai isi ceklis' : late.length ? `${late.length} belum dicentang` : `${progress.done} dari ${progress.total} tercapai`,
      icon: Footprints,
      route: { name: 'milestone' },
    },
    {
      key: 'screening',
      title: 'Skrining Dini',
      status: dueScreenings.length ? `${dueScreenings.length} skrining sudah waktunya` : lastScreening ? `Terakhir: ${resultLabel(lastScreening.result, lastScreening.type).toLowerCase()}` : 'Sesuai usia si Kecil',
      icon: ClipboardCheck,
      tab: 'screen',
    },
    { key: 'journal', title: 'Jurnal & Album', status: 'Simpan momen dan foto', icon: BookHeart, route: { name: 'journal' } },
    age < TRACKER_MAX_MONTHS
      ? { key: 'babylog', title: 'Catatan Harian', status: 'Menyusu, tidur, popok', icon: Milk, route: { name: 'babylog' } }
      : { key: 'child', title: 'Profil Kesehatan', status: 'Alergi dan riwayat', icon: HeartPulse, route: { name: 'child' } },
    {
      key: 'stimulasi',
      title: 'Stimulasi',
      status: doneToday >= activities.length ? 'Misi hari ini selesai' : `${doneToday} dari ${activities.length} misi hari ini`,
      icon: Puzzle,
      route: { name: 'stimulasi' },
    },
    {
      key: 'qa',
      title: 'Tanya Ahli',
      status: pending ? 'Ahli sedang menjawab' : `${Math.max(0, 3 - usedQuota)} pertanyaan gratis bulan ini`,
      icon: MessageCircleHeart,
      route: { name: 'qa' },
    },
    { key: 'library', title: 'Edukasi', status: `${ARTICLES_SEED.length} artikel dari para ahli`, icon: BookOpen, route: { name: 'library' } },
    {
      key: 'booking',
      title: 'Booking Klinik',
      status: upcoming ? `Jadwal ${formatDate(upcoming.scheduledAt)}` : 'Terapi & konsultasi',
      icon: CalendarCheck,
      route: upcoming ? { name: 'bookings' } : { name: 'booking' },
    },
  ];

  return (
    <Screen title="Beranda" hideNav largeTitle={false} withTabBar bottomSpacer={false}>
      {/* Greeting row */}
      <div className="px-5 pt-3 flex items-center justify-between gap-3">
        <button className="flex items-center gap-3 min-w-0 text-left" onClick={() => nav.setTab('account')}>
          <ParentAvatar variant={parentVariant} size={46} />
          <span className="min-w-0">
            <span className="block text-[17px] leading-tight truncate">
              Hai, {firstName(profile?.fullName)}
            </span>
            <span className="block text-[14px] text-mute mt-0.5 truncate">
              {formatDate(new Date(), 'day')}
            </span>
          </span>
        </button>
        <IconButton icon={Bell} label="Notifikasi" badge={unreadCount > 0} onClick={() => nav.push({ name: 'notifications' })} />
      </div>

      {/* Headline */}
      <motion.h1
        key={String(growthStatus.level) + name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        className="px-5 mt-6 text-[32px] leading-[1.12] tracking-[-0.025em] font-normal"
      >
        {headline}
      </motion.h1>

      {/* Child card */}
      <Card className="mx-5 mt-5 overflow-hidden">
        <motion.button
          whileTap={{ backgroundColor: '#FBF6F1' }}
          onClick={() => nav.push({ name: 'child' })}
          className="w-full flex items-center gap-3 p-4 text-left"
          aria-label={`Buka profil ${name}`}
        >
          <ChildAvatar child={activeChild} size={52} />
          <span className="flex-1 min-w-0">
            <span className="block text-[19px] leading-tight truncate">{name}</span>
            <span className="block text-[14px] text-mute mt-0.5">{ageLabel(activeChild.birthDate)}</span>
          </span>
          <ArrowCorner />
        </motion.button>
        <div className="mx-4 h-px bg-line" />
        <div className="grid grid-cols-3 gap-2 p-4">
          {loading ? (
            <>
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </>
          ) : (
            <>
              <StatItem icon={activeChild.gender === 'P' ? Venus : Mars} label="Gender" value={activeChild.gender === 'P' ? 'Putri' : 'Putra'} />
              <StatItem icon={Scale} label="Berat" value={latest ? `${formatNumber(latest.weightKg)} kg` : '-'} />
              <StatItem icon={Ruler} label="Tinggi" value={latest ? `${formatNumber(latest.heightCm)} cm` : '-'} />
            </>
          )}
        </div>
        {children.length > 1 && (
          <button
            onClick={() => setSwitcherOpen(true)}
            className="w-full flex items-center justify-center gap-1 py-2.5 text-[14px] text-brand-orange-deep bg-brand-orange-tint hairline-t"
          >
            Ganti profil ({children.length})
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </Card>

      {/* Quick daily tracker for babies */}
      {age < TRACKER_MAX_MONTHS && (
        <div className="mx-5 mt-3">
          <BabyQuickCard child={activeChild} logs={logs} onOpen={() => nav.push({ name: 'babylog' })} />
        </div>
      )}

      {/* Attention list */}
      {!loading && attention.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-5 mt-3">
          <Card className="overflow-hidden divide-y divide-line">
            {attention.slice(0, 3).map((a) => (
              <motion.button
                key={a.text}
                whileTap={{ backgroundColor: '#FBF6F1' }}
                onClick={() => nav.push(a.route)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="w-2 h-2 rounded-full bg-brand-orange anim-pulse-dot shrink-0" />
                <span className="flex-1 text-[15px] text-ink-2">{a.text}</span>
                <ChevronRight className="w-4 h-4 text-faint" strokeWidth={2} />
              </motion.button>
            ))}
          </Card>
        </motion.div>
      )}

      {/* Features sheet */}
      <div className="mt-7 bg-white rounded-t-[32px] pt-6 hairline-t" style={{ paddingBottom: 'calc(var(--sab) + 112px)' }}>
        <div className="px-5 mb-4">
          <h2 className="text-[22px] font-normal leading-tight">Fitur</h2>
          <p className="text-[15px] text-mute mt-0.5">Setiap langkah kecil itu berarti</p>
        </div>
        <motion.div className="grid grid-cols-2 gap-3 px-5" variants={listContainer} initial="hidden" animate="show">
          {features.map((f) => (
            <FeatureCard key={f.key} feature={f} onOpen={() => (f.tab ? nav.setTab(f.tab) : f.route && nav.push(f.route))} />
          ))}
        </motion.div>

        {upcoming && (
          <Card className="mx-5 mt-6 p-4 flex items-center gap-3.5">
            <span className="w-12 h-12 rounded-[16px] bg-brand-orange-soft text-brand-orange-deep flex flex-col items-center justify-center leading-none">
              <span className="text-[18px] tabular">{new Date(upcoming.scheduledAt).getDate()}</span>
              <span className="text-[11px] uppercase mt-0.5">
                {new Date(upcoming.scheduledAt).toLocaleDateString('id-ID', { month: 'short' })}
              </span>
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-mute">Jadwal klinik berikutnya</div>
              <div className="text-[17px] truncate">{upcoming.subService}</div>
              <div className="text-[14px] text-mute truncate">{upcoming.therapistName}</div>
            </div>
            <Button size="sm" variant="soft" onClick={() => nav.push({ name: 'bookings' })}>
              Detail
            </Button>
          </Card>
        )}

        <TeamSection />

        <div className="mt-6">
          <TipCard />
        </div>
      </div>

      <ChildSwitcherSheet open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </Screen>
  );
}
