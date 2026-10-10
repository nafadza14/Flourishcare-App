import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Brain,
  Building2,
  CalendarCheck,
  Check,
  ClipboardList,
  CreditCard,
  House,
  Info,
  Landmark,
  Mail,
  MessageCircleHeart,
  Phone,
  QrCode,
  ShieldCheck,
  Star,
  User,
  Wallet,
} from 'lucide-react';
import Screen from '../components/ui/Screen';
import Sheet from '../components/ui/Sheet';
import Segmented from '../components/ui/Segmented';
import Switch from '../components/ui/Switch';
import Confetti from '../components/ui/Confetti';
import { Field, OptionCard, TextArea } from '../components/ui/Field';
import { Button, Card, Notice } from '../components/ui/primitives';
import { PhotoAvatar, KidAvatar } from '../components/ui/Avatar';
import { useToast } from '../components/ui/Toast';
import type { Booking } from '../types';
import { useStore } from '../lib/store';
import { useNav } from '../lib/nav';
import {
  calculatePrice,
  isTherapyCategory,
  PACKAGE_SIZES,
  pricePerSession,
  SERVICE_CATEGORIES,
  subServiceName,
  subServicesFor,
  type PackageSize,
  type ServiceCategory,
} from '../data/pricing';
import { useExperts } from '../lib/experts';
import { ageLabel, firstName, formatDate, rupiah, toISODate } from '../lib/format';
import { sendJSON } from '../api';
import { emitDataChanged } from '../lib/events';
import { haptic } from '../lib/haptics';
import { cx } from '../lib/cx';

const CATEGORY_ICON: Record<ServiceCategory, typeof Building2> = {
  onsite: Building2,
  home_visit: House,
  psikolog: MessageCircleHeart,
  psikotes: Brain,
};

const TIME_SLOTS = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30'];

const PAYMENT_METHODS = [
  { key: 'bca', label: 'BCA Virtual Account', group: 'Transfer bank', icon: Landmark },
  { key: 'mandiri', label: 'Mandiri Virtual Account', group: 'Transfer bank', icon: Landmark },
  { key: 'bni', label: 'BNI Virtual Account', group: 'Transfer bank', icon: Landmark },
  { key: 'qris', label: 'QRIS', group: 'Scan', icon: QrCode },
  { key: 'gopay', label: 'GoPay', group: 'E-wallet', icon: Wallet },
  { key: 'ovo', label: 'OVO', group: 'E-wallet', icon: Wallet },
  { key: 'dana', label: 'DANA', group: 'E-wallet', icon: Wallet },
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function isWeekendDay(d: Date) {
  return d.getDay() === 0 || d.getDay() === 6;
}

type StepKey = 'service' | 'type' | 'package' | 'schedule' | 'client' | 'payment';

export default function BookingScreen({
  onBack,
  initialCategory,
  initialSubCode,
  initialTherapistId,
}: {
  onBack?: () => void;
  initialCategory?: ServiceCategory;
  initialSubCode?: string;
  initialTherapistId?: string;
}) {
  const { activeChild, profile } = useStore();
  const nav = useNav();
  const toast = useToast();

  const [category, setCategory] = useState<ServiceCategory>(initialCategory ?? 'onsite');
  const [subCode, setSubCode] = useState<string>(initialSubCode ?? '');
  const [atHome, setAtHome] = useState(false);
  const [packageSize, setPackageSize] = useState<PackageSize>(8);
  const [weekend, setWeekend] = useState(false);
  const experts = useExperts();
  const [therapistId, setTherapistId] = useState<string>(
    () => initialTherapistId ?? (initialSubCode ? experts.find((e) => e.services.includes(initialSubCode))?.id ?? '' : ''),
  );
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [parentName, setParentName] = useState(profile?.fullName ?? '');
  const [phone, setPhone] = useState(profile?.phoneWhatsapp ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [address, setAddress] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [payMethod, setPayMethod] = useState('qris');
  const [payDp, setPayDp] = useState(false);
  const [stepIndex, setStepIndex] = useState(initialCategory ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);

  const therapy = isTherapyCategory(category);
  const steps: StepKey[] = therapy ? ['service', 'type', 'package', 'schedule', 'client', 'payment'] : ['service', 'type', 'schedule', 'client', 'payment'];
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const isHomeVisit = category === 'home_visit' || (!therapy && atHome);

  const subServices = subServicesFor(category);
  const therapists = useMemo(() => {
    const fit = experts.filter((e) => !subCode || e.services.includes(subCode));
    return fit.length ? fit : experts;
  }, [experts, subCode]);
  const therapist = experts.find((e) => e.id === therapistId);

  const total = subCode ? calculatePrice({ category, subCode, packageSessions: packageSize, weekend, atHome }) : 0;
  const due = payDp ? Math.round(total / 2) : total;

  const days = useMemo(() => {
    const list: Date[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 21; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      list.push(d);
    }
    return list;
  }, []);

  const dayEnabled = (d: Date) => {
    if (!therapy) return d.getDay() !== 0; // psikolog and psikotes: Monday to Saturday
    return weekend ? isWeekendDay(d) : !isWeekendDay(d);
  };

  const slotFull = (slot: string) => !!date && hash(`${date}-${therapistId}-${slot}`) % 4 === 0;

  // Clear a field's error as soon as the parent fixes it
  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[key];
      return nextErrors;
    });
  useEffect(() => clearError('sub'), [subCode]);
  useEffect(() => clearError('therapist'), [therapistId]);
  useEffect(() => clearError('date'), [date]);
  useEffect(() => clearError('time'), [time]);
  useEffect(() => clearError('parentName'), [parentName]);
  useEffect(() => clearError('phone'), [phone]);
  useEffect(() => clearError('email'), [email]);
  useEffect(() => clearError('address'), [address]);

  if (!activeChild) return null;

  const go = (delta: number) => {
    setDir(delta);
    setErrors({});
    setStepIndex((i) => Math.max(0, Math.min(steps.length - 1, i + delta)));
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 'type' && !subCode) e.sub = 'Pilih jenis layanan dulu.';
    if (step === 'schedule') {
      if (!therapistId) e.therapist = 'Pilih terapis atau psikolog.';
      if (!date) e.date = 'Pilih tanggal kunjungan.';
      if (!time) e.time = 'Pilih jam kunjungan.';
    }
    if (step === 'client') {
      if (parentName.trim().length < 3) e.parentName = 'Isi nama orang tua atau wali.';
      if (!/^(\+62|62|0)8\d{7,12}$/.test(phone.replace(/[\s-]/g, ''))) e.phone = 'Gunakan nomor WhatsApp aktif, contoh 081234567890.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Format email belum benar.';
      if (isHomeVisit && address.trim().length < 10) e.address = 'Tulis alamat lengkap untuk home visit.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) {
      haptic('warning');
      return;
    }
    if (step === 'payment') {
      setPayOpen(true);
      return;
    }
    go(1);
  };

  const handleBack = () => {
    if (done) return onBack?.();
    if (stepIndex > 0) return go(-1);
    onBack?.();
  };

  const pay = async () => {
    if (!therapist || !subCode) return;
    setPaying(true);
    try {
      const packageName = therapy
        ? `Paket ${packageSize} sesi · ${weekend ? 'Weekend' : 'Weekdays'}${payDp ? ' · DP 50%' : ''}`
        : `Sesi tunggal · ${atHome ? 'Home visit' : 'Di klinik'}${payDp ? ' · DP 50%' : ''}`;
      const created = await sendJSON<Booking>('/api/bookings', {
        childId: activeChild.id,
        serviceType: category,
        subService: subServiceName(category, subCode),
        subCode,
        packageSessions: therapy ? packageSize : undefined,
        isWeekend: weekend,
        atHome,
        packageName,
        therapistId: therapist.id,
        therapistName: therapist.name,
        scheduledAt: `${date}T${time}:00`,
        address: isHomeVisit ? address.trim() : undefined,
        paymentMethod: payMethod,
        notes: conditionNotes.trim(),
      });
      const paid = await sendJSON<Booking>(`/api/bookings/${created.id}/pay`, { method: payMethod });
      emitDataChanged('bookings');
      setPayOpen(false);
      setDone(paid);
      haptic('success');
      window.setTimeout(() => {
        toast({
          app: 'WhatsApp',
          tone: 'whatsapp',
          title: 'FlourishCare',
          body: `Halo ${firstName(parentName)}, booking ${paid.subService} untuk ${activeChild.name} terkonfirmasi. Kode ${paid.bookingCode}.`,
          duration: 6000,
        });
      }, 900);
    } catch (err: any) {
      toast({ title: 'Pembayaran gagal', body: err.message || 'Coba lagi sebentar lagi.', tone: 'warning' });
    } finally {
      setPaying(false);
    }
  };

  /* ------------------------------ Success ------------------------------ */
  if (done) {
    return (
      <Screen title="Booking berhasil" largeTitle={false} onBack={handleBack}>
        <div className="px-5 pt-4 flex flex-col items-center text-center">
          <div className="relative">
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              className="w-24 h-24 rounded-full bg-orange-gradient shadow-orange flex items-center justify-center"
            >
              <svg width="44" height="44" viewBox="0 0 44 44">
                <motion.path
                  d="M11 23l7.5 7.5L33 15"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.25, duration: 0.45 }}
                />
              </svg>
            </motion.div>
            <Confetti count={34} />
          </div>
          <h1 className="text-[28px] leading-tight tracking-[-0.02em] font-normal mt-6">Booking terkonfirmasi</h1>
          <p className="text-[16px] text-mute mt-2 max-w-[300px]">Konfirmasi dan pengingat H-1 serta 2 jam sebelum sesi dikirim lewat WhatsApp dan email.</p>
          <div className="mt-5 h-11 px-5 rounded-full bg-white border border-line shadow-card flex items-center gap-2 text-[17px]">
            <span className="text-mute">Kode</span>
            <span className="tabular tracking-wide">{done.bookingCode}</span>
          </div>
        </div>
        <Card className="mx-5 mt-6 p-4 space-y-3.5">
          <Row label="Layanan" value={done.subService} />
          <Row label="Paket" value={done.packageName ?? '-'} />
          <Row label="Terapis" value={done.therapistName ?? '-'} />
          <Row label="Jadwal" value={`${formatDate(done.scheduledAt, 'long')}, ${time}`} />
          <Row label="Dibayar" value={rupiah(payDp ? Math.round(done.amount / 2) : done.amount)} />
          {payDp && <Row label="Sisa saat sesi" value={rupiah(done.amount - Math.round(done.amount / 2))} />}
        </Card>
        <div className="px-5 mt-5 grid gap-2.5">
          <Button size="lg" block icon={CalendarCheck} onClick={() => nav.replaceTop({ name: 'bookings' })}>
            Lihat jadwal saya
          </Button>
          <Button size="lg" block variant="secondary" onClick={() => nav.popToRoot()}>
            Kembali ke beranda
          </Button>
        </div>
      </Screen>
    );
  }

  /* ------------------------------ Steps ------------------------------ */
  const stepTitle: Record<StepKey, string> = {
    service: 'Pilih layanan',
    type: 'Pilih jenis',
    package: 'Pilih paket',
    schedule: 'Terapis dan jadwal',
    client: 'Data klien',
    payment: 'Konfirmasi',
  };

  return (
    <Screen
      title="Booking Klinik"
      subtitle={`Untuk ${activeChild.name}`}
      onBack={handleBack}
      footer={
        <div className="flex items-center gap-3">
          {step !== 'service' && subCode && (
            <div className="min-w-0">
              <div className="text-[13px] text-mute">{step === 'payment' ? 'Dibayar sekarang' : 'Total'}</div>
              <div className="text-[19px] tabular">{rupiah(step === 'payment' ? due : total)}</div>
            </div>
          )}
          <Button size="lg" className="flex-1" onClick={next} icon={step === 'payment' ? ShieldCheck : undefined}>
            {step === 'payment' ? 'Bayar sekarang' : 'Lanjut'}
          </Button>
        </div>
      }
    >
      {/* Progress */}
      <div className="px-5">
        <div className="flex items-center justify-between text-[15px]">
          <span className="text-ink">{stepTitle[step]}</span>
          <span className="text-mute tabular">
            Langkah {stepIndex + 1} dari {steps.length}
          </span>
        </div>
        <div className="flex gap-1.5 mt-2.5">
          {steps.map((s, i) => (
            <motion.span
              key={s}
              className="h-1.5 flex-1 rounded-full"
              initial={false}
              animate={{ backgroundColor: i <= stepIndex ? '#F29935' : '#F0E7DE' }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      <div className="relative mt-5 overflow-hidden">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? 70 : -70, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? -70 : 70, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1] }}
            className="px-5"
          >
            {step === 'service' && (
              <div className="space-y-2.5" role="radiogroup" aria-label="Tipe layanan">
                {SERVICE_CATEGORIES.map((c) => (
                  <OptionCard
                    key={c.key}
                    selected={category === c.key}
                    onSelect={() => {
                      setCategory(c.key);
                      setSubCode('');
                      setTherapistId('');
                      setAtHome(false);
                      setTime('');
                      setDate('');
                    }}
                    icon={CATEGORY_ICON[c.key]}
                    title={c.title}
                    description={c.description}
                  />
                ))}
              </div>
            )}

            {step === 'type' && (
              <div className="space-y-2.5" role="radiogroup" aria-label="Jenis layanan">
                {subServices.map((s) => {
                  const unit = calculatePrice({ category, subCode: s.code, packageSessions: 4, weekend: false, atHome });
                  return (
                    <OptionCard
                      key={s.code}
                      selected={subCode === s.code}
                      onSelect={() => {
                        setSubCode(s.code);
                        const fit = experts.filter((e) => e.services.includes(s.code));
                        if (!fit.some((e) => e.id === therapistId)) setTherapistId(fit[0]?.id ?? '');
                        setTime('');
                      }}
                      title={s.name}
                      description={
                        <>
                          {s.description}
                          <span className="block text-ink-2 mt-1.5 tabular">
                            {therapy ? `Mulai ${rupiah(Math.round(unit / 4))} per sesi` : `${rupiah(unit)} per kunjungan`}
                          </span>
                        </>
                      }
                    />
                  );
                })}
                {errors.sub && <p className="text-[14px] text-semantic-danger pl-1">{errors.sub}</p>}
                {!therapy && (
                  <div className="flex items-center gap-3 bg-white rounded-[22px] border border-line shadow-card p-4">
                    <House className="w-5 h-5 text-ink-2" strokeWidth={1.7} />
                    <div className="flex-1">
                      <div className="text-[16px]">Di rumah (home visit)</div>
                      <div className="text-[14px] text-mute">Tarif 2x, radius hingga 10 km</div>
                    </div>
                    <Switch checked={atHome} onChange={setAtHome} label="Home visit" />
                  </div>
                )}
                {therapy && (
                  <Notice tone="orange" icon={Info}>
                    Terapi diawali asesmen atau surat hasil pemeriksaan dari dokter, psikolog, atau layanan sebelumnya.
                  </Notice>
                )}
                <button onClick={() => nav.push({ name: 'qa' })} className="w-full text-center text-[15px] text-brand-orange-deep py-3">
                  Belum yakin? Tanya ahli dulu
                </button>
              </div>
            )}

            {step === 'package' && (
              <div className="space-y-3">
                <Segmented
                  value={weekend ? 'weekend' : 'weekday'}
                  onChange={(v) => {
                    setWeekend(v === 'weekend');
                    setDate('');
                    setTime('');
                  }}
                  options={[
                    { value: 'weekday', label: 'Weekdays' },
                    { value: 'weekend', label: 'Weekend' },
                  ]}
                />
                <div className="space-y-2.5" role="radiogroup" aria-label="Paket sesi">
                  {PACKAGE_SIZES.map((size) => {
                    const price = calculatePrice({ category, subCode, packageSessions: size, weekend });
                    const per = pricePerSession({ category, subCode, packageSessions: size, weekend });
                    return (
                      <OptionCard
                        key={size}
                        selected={packageSize === size}
                        onSelect={() => setPackageSize(size)}
                        title={`${size} sesi`}
                        badge={
                          size === 8 ? (
                            <span className="h-6 px-2.5 rounded-full bg-brand-orange-soft text-brand-orange-deep text-[12px] inline-flex items-center gap-1">
                              <Star className="w-3 h-3" fill="currentColor" /> Paling populer
                            </span>
                          ) : size === 16 ? (
                            <span className="h-6 px-2.5 rounded-full bg-semantic-success-soft text-semantic-success text-[12px] inline-flex items-center">Terhemat</span>
                          ) : undefined
                        }
                        description={
                          <span className="tabular">
                            {rupiah(price)} · {rupiah(per)} per sesi
                          </span>
                        }
                      />
                    );
                  })}
                </div>
                <p className="text-[14px] text-mute px-1 leading-relaxed">
                  Durasi 60 menit per sesi: 50 menit terapi dan 10 menit laporan ke orang tua. Evaluasi besar setiap 16 sesi, gratis untuk evaluasi pertama.
                </p>
              </div>
            )}

            {step === 'schedule' && (
              <div className="space-y-5">
                <div>
                  <div className="text-[14px] text-mute mb-2 pl-1">{therapy ? 'Terapis' : 'Psikolog'}</div>
                  <div className="space-y-2.5">
                    {therapists.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => {
                          setTherapistId(e.id);
                          setTime('');
                        }}
                        className={cx(
                          'w-full text-left rounded-[22px] p-3.5 flex items-center gap-3.5 border transition-all active:scale-[0.985]',
                          therapistId === e.id ? 'bg-brand-orange-tint border-brand-orange' : 'bg-white border-line shadow-card',
                        )}
                        aria-pressed={therapistId === e.id}
                      >
                        <PhotoAvatar src={e.photoUrl} name={e.name} size={52} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-[16px] truncate">{e.name}</span>
                          <span className="block text-[14px] text-mute truncate">{e.role}</span>
                          <span className="block text-[13px] text-ink-2 mt-0.5 truncate">{e.specialties.slice(0, 3).join(' · ')}</span>
                        </span>
                        {therapistId === e.id && (
                          <span className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center">
                            <Check className="w-4 h-4" strokeWidth={2.6} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.therapist && <p className="text-[14px] text-semantic-danger mt-1.5 pl-1">{errors.therapist}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[14px] text-mute">Tanggal</span>
                    {therapy && <span className="text-[13px] text-mute">{weekend ? 'Weekend rate' : 'Senin sampai Jumat'}</span>}
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
                    {days.map((d) => {
                      const iso = toISODate(d);
                      const enabled = dayEnabled(d);
                      const selected = date === iso;
                      return (
                        <button
                          key={iso}
                          type="button"
                          disabled={!enabled}
                          onClick={() => {
                            setDate(iso);
                            setTime('');
                          }}
                          aria-pressed={selected}
                          className={cx(
                            'w-[60px] h-[76px] shrink-0 rounded-[20px] flex flex-col items-center justify-center border transition-all',
                            selected
                              ? 'bg-orange-gradient text-white border-transparent shadow-orange'
                              : enabled
                                ? 'bg-white border-line shadow-card text-ink'
                                : 'bg-fill border-transparent text-faint',
                          )}
                        >
                          <span className={cx('text-[12px]', selected ? 'text-white/85' : 'text-mute')}>
                            {d.toLocaleDateString('id-ID', { weekday: 'short' })}
                          </span>
                          <span className="text-[21px] tabular leading-tight">{d.getDate()}</span>
                          <span className={cx('text-[11px]', selected ? 'text-white/85' : 'text-mute')}>{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.date && <p className="text-[14px] text-semantic-danger mt-1.5 pl-1">{errors.date}</p>}
                </div>

                <div>
                  <div className="text-[14px] text-mute mb-2 pl-1">Jam</div>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const full = slotFull(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={full || !date}
                          onClick={() => setTime(slot)}
                          aria-pressed={time === slot}
                          aria-label={full ? `${slot}, penuh` : slot}
                          className={cx(
                            'h-12 rounded-[16px] border text-[16px] tabular transition-all',
                            time === slot
                              ? 'bg-ink text-white border-ink'
                              : full
                                ? 'bg-fill text-faint border-transparent line-through'
                                : !date
                                  ? 'bg-fill text-faint border-transparent'
                                  : 'bg-white border-line shadow-card active:scale-[0.97]',
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {!date && <p className="text-[14px] text-mute mt-2 pl-1">Pilih tanggal untuk melihat jam yang tersedia.</p>}
                  {errors.time && date && <p className="text-[14px] text-semantic-danger mt-1.5 pl-1">{errors.time}</p>}
                </div>
              </div>
            )}

            {step === 'client' && (
              <div className="space-y-4">
                <Card className="p-4 flex items-center gap-3.5">
                  <KidAvatar gender={activeChild.gender} size={48} />
                  <div className="min-w-0">
                    <div className="text-[17px]">{activeChild.name}</div>
                    <div className="text-[14px] text-mute">
                      {activeChild.gender === 'P' ? 'Perempuan' : 'Laki-laki'} · {ageLabel(activeChild.birthDate)} · lahir {formatDate(activeChild.birthDate)}
                    </div>
                  </div>
                </Card>
                <Field label="Nama orang tua atau wali" icon={User} value={parentName} onChange={(e) => setParentName(e.target.value)} error={errors.parentName} autoComplete="name" />
                <Field label="Nomor WhatsApp" icon={Phone} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} placeholder="081234567890" autoComplete="tel" />
                <Field label="Email" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" />
                {isHomeVisit && (
                  <TextArea label="Alamat home visit" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} error={errors.address} placeholder="Nama jalan, nomor rumah, kelurahan, kota" />
                )}
                <TextArea
                  label="Kondisi atau diagnosa (opsional)"
                  rows={3}
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="Misalnya hasil pemeriksaan sebelumnya"
                />
              </div>
            )}

            {step === 'payment' && therapist && (
              <div className="space-y-4">
                <Card className="p-4 space-y-3.5">
                  <Row label="Layanan" value={subServiceName(category, subCode)} />
                  <Row label="Tipe" value={SERVICE_CATEGORIES.find((c) => c.key === category)?.title ?? ''} />
                  {therapy && <Row label="Paket" value={`${packageSize} sesi, ${weekend ? 'weekend' : 'weekdays'}`} />}
                  {!therapy && <Row label="Lokasi" value={atHome ? 'Home visit' : 'Di klinik'} />}
                  <Row label="Terapis" value={therapist.name} />
                  <Row label="Jadwal" value={`${formatDate(date, 'long')}, ${time}`} />
                  {isHomeVisit && <Row label="Alamat" value={address} />}
                  <div className="h-px bg-line" />
                  <Row label="Total" value={rupiah(total)} strong />
                </Card>

                <div className="flex items-center gap-3 bg-white rounded-[22px] border border-line shadow-card p-4">
                  <CreditCard className="w-5 h-5 text-ink-2" strokeWidth={1.7} />
                  <div className="flex-1">
                    <div className="text-[16px]">Bayar DP 50%</div>
                    <div className="text-[14px] text-mute">Pelunasan {rupiah(total - Math.round(total / 2))} saat sesi</div>
                  </div>
                  <Switch checked={payDp} onChange={setPayDp} label="Bayar DP 50%" />
                </div>

                <div>
                  <div className="text-[14px] text-mute mb-2 pl-1">Metode pembayaran</div>
                  <div className="bg-white rounded-[22px] border border-line shadow-card divide-y divide-line overflow-hidden" role="radiogroup" aria-label="Metode pembayaran">
                    {PAYMENT_METHODS.map((m) => {
                      const Icon = m.icon;
                      const selected = payMethod === m.key;
                      return (
                        <button
                          key={m.key}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setPayMethod(m.key)}
                          className="w-full flex items-center gap-3 px-4 min-h-[58px] text-left"
                        >
                          <span className="w-9 h-9 rounded-[11px] bg-fill text-ink-2 flex items-center justify-center">
                            <Icon className="w-[18px] h-[18px]" strokeWidth={1.7} />
                          </span>
                          <span className="flex-1">
                            <span className="block text-[16px]">{m.label}</span>
                            <span className="block text-[13px] text-mute">{m.group}</span>
                          </span>
                          <span
                            className={cx(
                              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                              selected ? 'border-brand-orange bg-brand-orange' : 'border-line-2',
                            )}
                          >
                            {selected && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-[13px] text-mute px-1 leading-relaxed flex gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  Pembayaran diproses aman melalui Midtrans. Reschedule mandiri bisa dilakukan hingga H-1.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <PaymentSheet open={payOpen} onClose={() => !paying && setPayOpen(false)} method={payMethod} amount={due} paying={paying} onConfirm={pay} />
    </Screen>
  );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[15px]">
      <span className="text-mute shrink-0">{label}</span>
      <span className={cx('text-right', strong ? 'text-[19px] tabular' : 'text-ink')}>{value}</span>
    </div>
  );
}

function PaymentSheet({
  open,
  onClose,
  method,
  amount,
  paying,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  method: string;
  amount: number;
  paying: boolean;
  onConfirm: () => void;
}) {
  const info = PAYMENT_METHODS.find((m) => m.key === method);
  const va = useMemo(() => `8808 ${String(Date.now()).slice(-4)} ${String(Math.floor(1000 + Math.random() * 8999))} ${String(Date.now()).slice(-8, -4)}`, [open]);
  const qrCells = useMemo(() => Array.from({ length: 121 }, (_, i) => hash(`qr${i}${amount}`) % 3 !== 0), [amount]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Selesaikan pembayaran"
      subtitle="Midtrans, mode sandbox untuk uji coba"
      footer={
        <Button block size="lg" loading={paying} onClick={onConfirm} icon={Check}>
          Saya sudah bayar
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        <Card className="p-4 flex items-center justify-between">
          <span className="text-[15px] text-mute">Total tagihan</span>
          <span className="text-[24px] tabular">{rupiah(amount)}</span>
        </Card>
        {method === 'qris' ? (
          <Card className="p-5 flex flex-col items-center">
            <div className="w-48 h-48 p-3 bg-white rounded-[18px] border border-line grid grid-cols-11 gap-[2px]" aria-label="Kode QRIS contoh">
              {qrCells.map((on, i) => (
                <span key={i} className={cx('rounded-[2px]', on ? 'bg-ink' : 'bg-transparent')} />
              ))}
            </div>
            <p className="text-[15px] text-mute text-center mt-3">Pindai dengan aplikasi bank atau e-wallet yang mendukung QRIS.</p>
          </Card>
        ) : method === 'bca' || method === 'mandiri' || method === 'bni' ? (
          <Card className="p-4">
            <div className="text-[14px] text-mute">{info?.label}</div>
            <div className="text-[24px] tabular tracking-wide mt-1">{va}</div>
            <p className="text-[14px] text-mute mt-2 leading-relaxed">Transfer melalui m-banking atau ATM sesuai nominal di atas. Pembayaran terverifikasi otomatis.</p>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="text-[16px]">{info?.label}</div>
            <p className="text-[14px] text-mute mt-1 leading-relaxed">Anda akan diarahkan ke aplikasi {info?.label} untuk menyetujui pembayaran.</p>
          </Card>
        )}
        <Notice tone="neutral" icon={ClipboardList}>
          Ini simulasi sandbox. Tidak ada dana yang terpotong.
        </Notice>
      </div>
    </Sheet>
  );
}

