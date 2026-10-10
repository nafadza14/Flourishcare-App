import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  BookOpen,
  CalendarCheck,
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
import { KidAvatar, ParentAvatar, PhotoAvatar } from '../components/ui/Avatar';
import ChildSwitcherSheet from '../components/sheets/ChildSwitcherSheet';
import FlourishCareLogo from '../components/FlourishCareLogo';
import { useStore } from '../lib/store';
import { useNav, type Route } from '../lib/nav';
import { useChildData } from '../lib/useChildData';
import { ageInMonths, ageLabel, firstName, formatDate, formatNumber } from '../lib/format';
import { getWeightStatus, latestRecord } from '../lib/growth';
import { lateMilestones, rangeForAge, rangeProgress } from '../lib/milestones';
import { buildVaccineSchedule, nextVaccine, vaccineTiming } from '../lib/vaccines';
import { resultLabel } from '../lib/screening';
import { activitiesForAge, getCompleted } from '../lib/stimulasi';
import { tipOfTheDay } from '../lib/tips';
import { ARTICLES_SEED, CLINICAL_EXPERTS } from '../data/seedData';
import { listContainer, listItem } from '../lib/motion';
import { cx } from '../lib/cx';
import { haptic } from '../lib/haptics';

interface Feature {
  key: string;
  title: string;
  status: string;
  icon: LucideIcon;
  route: Route;
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
  { key: 'vaccine', title: 'Jadwal Imunisasi', status: 'Pengingat sesuai IDAI', icon: Syringe, route: { name: 'vaccine' }, hero: true },
  { key: 'growth', title: 'Pertumbuhan', status: 'Kurva WHO otomatis', icon: ChartColumn, route: { name: 'growth' } },
  { key: 'milestone', title: 'Milestone', status: 'Ceklis per usia', icon: Footprints, route: { name: 'milestone' } },
  { key: 'screening', title: 'Skrining Dini', status: 'KPSP dan M-CHAT-R', icon: ClipboardCheck, route: { name: 'screening' } },
  { key: 'stimulasi', title: 'Stimulasi', status: 'Misi bermain harian', icon: Puzzle, route: { name: 'stimulasi' } },
  { key: 'qa', title: 'Tanya Ahli', status: 'Dijawab dalam 24 jam', icon: MessageCircleHeart, route: { name: 'qa' } },
  { key: 'library', title: 'Edukasi', status: 'Artikel dari para ahli', icon: BookOpen, route: { name: 'library' } },
  { key: 'booking', title: 'Booking Klinik', status: 'Terapi dan konsultasi', icon: CalendarCheck, route: { name: 'booking' } },
];

function TipCard() {
  const tip = tipOfTheDay();
  const expert = CLINICAL_EXPERTS.find((e) => tip.author.startsWith(e.name.split(',')[0]));
  return (
    <Card className="mx-5 p-5 relative overflow-hidden">
      <span className="absolute -right-6 -bottom-8 w-28 h-28 rounded-full bg-brand-orange-soft" aria-hidden />
      <div className="relative flex items-center gap-2 text-[14px] text-brand-orange-deep">
        <Sparkles className="w-4 h-4" strokeWidth={1.8} />
        Tips hari ini
      </div>
      <p className="relative text-[17px] leading-relaxed text-ink mt-2.5">{tip.text}</p>
      <div className="relative flex items-center gap-2.5 mt-4">
        <PhotoAvatar src={expert?.photoUrl} name={tip.author} size={34} />
        <div className="min-w-0">
          <div className="text-[15px] text-ink truncate">{tip.author}</div>
          <div className="text-[13px] text-mute">{tip.role} FlourishCare</div>
        </div>
      </div>
    </Card>
  );
}

function GuestHome() {
  const nav = useNav();
  return (
    <Screen title="Beranda" hideNav largeTitle={false} withTabBar bottomSpacer={false}>
      <div className="px-5 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FlourishCareLogo className="w-11 h-11" animated />
          <div>
            <div className="text-[19px] leading-tight">FlourishCare</div>
            <div className="text-[13px] text-mute">Rumah tumbuh kembang</div>
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => nav.push({ name: 'auth', mode: 'login' })}>
          Masuk
        </Button>
      </div>

      <h1 className="px-5 mt-7 text-[32px] leading-[1.12] tracking-[-0.025em] font-normal">
        Rumah tumbuh kembang di genggaman <span className="anim-wiggle">🌱</span>
      </h1>
      <p className="px-5 mt-2 text-[17px] text-mute leading-snug">Pantau, pahami, dan dampingi si Kecil bersama psikolog dan terapis FlourishCare.</p>

      <div className="mx-5 mt-6 rounded-[28px] bg-orange-gradient text-white p-5 shadow-orange relative overflow-hidden">
        <span className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-white/10" aria-hidden />
        <div className="absolute right-3 bottom-3 anim-float">
          <KidAvatar size={96} bg={false} />
        </div>
        <div className="relative max-w-[62%]">
          <div className="text-[14px] text-white/85">Gratis untuk orang tua</div>
          <div className="text-[22px] leading-tight mt-1">Mulai catat perjalanan si Kecil hari ini</div>
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
          <p className="text-[15px] text-mute mt-0.5">Setiap langkah kecil itu berarti</p>
        </div>
        <motion.div className="grid grid-cols-2 gap-3 px-5" variants={listContainer} initial="hidden" animate="show">
          {GUEST_FEATURES.map((f) => (
            <FeatureCard key={f.key} feature={f} onOpen={() => nav.push(f.route)} />
          ))}
        </motion.div>
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
  const { data, loading } = useChildData(activeChild?.id, store.isAuthed);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const derived = useMemo(() => {
    if (!activeChild) return null;
    const age = ageInMonths(activeChild.birthDate);
    const growthStatus = getWeightStatus(activeChild, data.growth);
    const latest = latestRecord(data.growth);
    const range = rangeForAge(age);
    const progress = rangeProgress(data.milestones, range);
    const late = lateMilestones(data.milestones, age);
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
    return { age, growthStatus, latest, progress, late, schedule, next, catchup, lastScreening, activities, doneToday, usedQuota, pending, upcoming };
  }, [activeChild, data, profile?.id]);

  if (!store.isAuthed) return <GuestHome />;
  if (!activeChild || !derived) return null;

  const name = activeChild.name;
  const { growthStatus, latest, progress, late, next, catchup, lastScreening, activities, doneToday, usedQuota, pending, upcoming } = derived;

  const first = firstName(name);
  let headline: React.ReactNode;
  if (growthStatus.level === 'empty') {
    headline = (
      <>
        Yuk mulai pantau tumbuh kembang {first} <span className="anim-wiggle">🌱</span>
      </>
    );
  } else if (growthStatus.tone === 'success') {
    headline = (
      <>
        {first} tumbuh baik minggu ini <span className="anim-wiggle">🎉</span>
      </>
    );
  } else if (growthStatus.level === 'out_of_range') {
    headline = (
      <>
        Semangat menemani {first} tumbuh minggu ini <span className="anim-wiggle">🌱</span>
      </>
    );
  } else {
    headline = (
      <>
        Yuk pantau berat badan {first} minggu ini <span className="anim-wiggle">🌱</span>
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
  else if (late.length) attention.push({ text: `${late.length} milestone usia sebelumnya belum tercapai`, route: { name: 'milestone' } });
  if (growthStatus.tone === 'warning' || growthStatus.tone === 'danger') attention.push({ text: growthStatus.title, route: { name: 'growth' } });
  if (lastScreening && !['normal', 'risiko_rendah'].includes(lastScreening.result)) {
    attention.push({ text: `Hasil skrining terakhir: ${resultLabel(lastScreening.result).toLowerCase()}`, route: { name: 'screening' } });
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
      status: noMilestoneRecords ? 'Mulai isi ceklis' : late.length ? `${late.length} belum tercapai` : `${progress.done} dari ${progress.total} tercapai`,
      icon: Footprints,
      route: { name: 'milestone' },
    },
    {
      key: 'screening',
      title: 'Skrining Dini',
      status: lastScreening ? `Terakhir: ${resultLabel(lastScreening.result).toLowerCase()}` : 'Belum pernah skrining',
      icon: ClipboardCheck,
      route: { name: 'screening' },
    },
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
      status: upcoming ? `Jadwal ${formatDate(upcoming.scheduledAt)}` : 'Terapi dan konsultasi',
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
          <KidAvatar gender={activeChild.gender} size={52} />
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
            Ganti anak ({children.length})
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </Card>

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
            <FeatureCard key={f.key} feature={f} onOpen={() => nav.push(f.route)} />
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

        <div className="mt-6">
          <TipCard />
        </div>
      </div>

      <ChildSwitcherSheet open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </Screen>
  );
}
