import React, { useEffect, useState } from 'react';
import { openExternalBooking, USE_EXTERNAL_BOOKING } from '../lib/booking';
import { motion } from 'motion/react';
import { ArrowUpRight, Baby, Bell, BellRing, CalendarCheck, Check, HeartHandshake, Info, LogOut, Mail, MapPin, MessageCircle, MessageCircleHeart, Pencil, Phone, Plus, Smartphone, Syringe, Footprints, User } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Sheet from '../components/ui/Sheet';
import Switch from '../components/ui/Switch';
import { Field } from '../components/ui/Field';
import { Button, Card } from '../components/ui/primitives';
import { ListGroup, ListRow } from '../components/ui/ListGroup';
import { ParentAvatar } from '../components/ui/Avatar';
import ChildAvatar from '../components/child/ChildAvatar';
import { profileAgeLabel } from '../lib/pregnancy';
import { useToast } from '../components/ui/Toast';
import AboutSheet, { APP_VERSION } from '../components/sheets/AboutSheet';
import InstallGuideSheet from '../components/sheets/InstallGuideSheet';
import { useInstall } from '../lib/install';
import type { NotificationPreferences, UserProfile } from '../types';
import { useStore } from '../lib/store';
import { useNav } from '../lib/nav';
import { getJSON, sendJSON } from '../api';
import { emitDataChanged } from '../lib/events';
import { ageLabel } from '../lib/format';

const PREF_ROWS: { key: keyof NotificationPreferences; title: string; subtitle: string; icon: typeof Bell }[] = [
  { key: 'pushEnabled', title: 'Notifikasi push', subtitle: 'Di perangkat ini', icon: Smartphone },
  { key: 'whatsappEnabled', title: 'WhatsApp', subtitle: 'Pengingat dan konfirmasi booking', icon: MessageCircle },
  { key: 'emailEnabled', title: 'Email', subtitle: 'Ringkasan dan invoice', icon: Mail },
  { key: 'weeklyDigest', title: 'Ringkasan mingguan', subtitle: 'Setiap Senin pagi', icon: BellRing },
  { key: 'immunizationReminder', title: 'Pengingat imunisasi', subtitle: 'H-7 dan H-1 jadwal vaksin', icon: Syringe },
  { key: 'milestoneReminder', title: 'Pengingat milestone', subtitle: 'Saat memasuki usia baru', icon: Footprints },
];

function EditProfileSheet({ open, onClose, profile }: { open: boolean; onClose: () => void; profile: UserProfile }) {
  const toast = useToast();
  const { setProfile } = useStore();
  const [name, setName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phoneWhatsapp);
  const [city, setCity] = useState(profile.city);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(profile.fullName);
      setPhone(profile.phoneWhatsapp);
      setCity(profile.city);
      setError('');
    }
  }, [open, profile]);

  const save = async () => {
    if (name.trim().length < 3) return setError('Isi nama lengkap minimal 3 huruf.');
    setSaving(true);
    try {
      const updated = await sendJSON<UserProfile>('/api/profile', { fullName: name.trim(), phoneWhatsapp: phone.trim(), city: city.trim() }, 'PUT');
      setProfile(updated);
      emitDataChanged('profile');
      toast({ title: 'Profil tersimpan' });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Ubah profil"
      footer={
        <Button block size="lg" loading={saving} onClick={save}>
          Simpan
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        <Field label="Nama lengkap" icon={User} value={name} onChange={(e) => setName(e.target.value)} error={error} autoComplete="name" />
        <Field label="Nomor WhatsApp" icon={Phone} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
        <Field label="Kota" icon={MapPin} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
      </div>
    </Sheet>
  );
}

export default function AccountScreen() {
  const { profile, children, activeChild, setActiveChild, logout, unreadCount, parentVariant } = useStore();
  const nav = useNav();
  const toast = useToast();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const install = useInstall();

  useEffect(() => {
    getJSON<NotificationPreferences | null>('/api/preferences', null).then(setPrefs);
  }, [profile?.id]);

  if (!profile) return null;

  const updatePref = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    const prev = prefs;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      await sendJSON('/api/preferences', next, 'PUT');
    } catch {
      setPrefs(prev);
      toast({ title: 'Gagal menyimpan pengaturan', tone: 'warning' });
    }
  };

  return (
    <Screen title="Akun" withTabBar>
      <div className="px-5">
        <Card className="p-5 flex items-center gap-4">
          <ParentAvatar variant={parentVariant} size={66} />
          <div className="flex-1 min-w-0">
            <div className="text-[21px] leading-tight truncate">{profile.fullName}</div>
            <div className="text-[14px] text-mute truncate mt-0.5">{profile.email || 'Email belum diisi'}</div>
            <div className="text-[14px] text-mute truncate">{[profile.phoneWhatsapp, profile.city].filter(Boolean).join(' · ') || 'Lengkapi nomor dan kota'}</div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            aria-label="Ubah profil"
            className="w-10 h-10 rounded-full bg-fill text-ink-2 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
          >
            <Pencil className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>
        </Card>
      </div>

      <ListGroup title="Anak dan kehamilan" className="mt-7">
        {children.map((c) => (
          <ListRow
            key={c.id}
            leading={<ChildAvatar child={c} size={40} />}
            title={c.name}
            subtitle={profileAgeLabel(c, ageLabel)}
            trailing={
              c.id === activeChild?.id ? (
                <span className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
              ) : (
                <span className="text-[14px] text-brand-orange-deep">Pilih</span>
              )
            }
            onClick={() => {
              setActiveChild(c.id);
              toast({ title: `${c.name} dipilih`, body: 'Data di aplikasi kini mengikuti si Kecil ini.', tone: 'info', duration: 2400 });
            }}
          />
        ))}
        {children.length < 5 ? (
          <>
            <ListRow icon={Plus} iconTone="gray" title="Tambah anak" onClick={() => nav.push({ name: 'onboarding', mode: 'child' })} />
            <ListRow icon={HeartHandshake} iconTone="gray" title="Sedang hamil" subtitle="Pantau kehamilan minggu demi minggu" onClick={() => nav.push({ name: 'onboarding', mode: 'pregnancy' })} />
          </>
        ) : (
          <ListRow icon={Baby} iconTone="gray" title="Maksimal 5 profil" subtitle="Hapus profil lama untuk menambah yang baru" />
        )}
      </ListGroup>

      <ListGroup title="Aktivitas" className="mt-7">
        {USE_EXTERNAL_BOOKING ? (
          <ListRow
            icon={CalendarCheck}
            title="Booking klinik"
            subtitle="Terapi dan konsultasi di book.flourishcare.id"
            trailing={<ArrowUpRight className="w-[18px] h-[18px] text-faint shrink-0" strokeWidth={2} />}
            onClick={openExternalBooking}
          />
        ) : (
          <ListRow icon={CalendarCheck} title="Jadwal klinik" subtitle="Booking terapi dan konsultasi" onClick={() => nav.push({ name: 'bookings' })} />
        )}
        <ListRow icon={Bell} title="Notifikasi" value={unreadCount ? `${unreadCount} baru` : undefined} onClick={() => nav.push({ name: 'notifications' })} />
        <ListRow icon={MessageCircleHeart} title="Tanya ahli" onClick={() => nav.push({ name: 'qa' })} />
      </ListGroup>

      <ListGroup title="Pengaturan notifikasi" className="mt-7" footer="Pengingat dikirim sesuai pilihan Ayah Bunda.">
        {PREF_ROWS.map((row) => (
          <ListRow
            key={row.key}
            icon={row.icon}
            iconTone="gray"
            title={row.title}
            subtitle={row.subtitle}
            trailing={
              <Switch
                checked={!!prefs?.[row.key]}
                disabled={!prefs}
                onChange={(v) => updatePref(row.key, v)}
                label={row.title}
              />
            }
          />
        ))}
      </ListGroup>

      <ListGroup title="Lainnya" className="mt-7">
        {!install.installed && (
          <ListRow
            icon={Smartphone}
            title={install.device.mobile ? 'Pasang di layar utama' : 'Pakai di HP'}
            subtitle={install.device.mobile ? 'Buka FlourishCare sekali ketuk' : 'Scan kode QR dengan kamera HP'}
            onClick={async () => {
              if (install.device.mobile && install.canPrompt) {
                const outcome = await install.promptInstall();
                if (outcome !== 'unavailable') return;
              }
              setInstallOpen(true);
            }}
          />
        )}
        <ListRow icon={Info} iconTone="gray" title="Tentang FlourishCare" onClick={() => setAboutOpen(true)} />
        <ListRow icon={LogOut} iconTone="red" title="Keluar" destructive chevron={false} onClick={() => setLogoutOpen(true)} />
      </ListGroup>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[13px] text-mute mt-6">
        FlourishCare versi {APP_VERSION}
      </motion.p>

      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} profile={profile} />
      <InstallGuideSheet open={installOpen} onClose={() => setInstallOpen(false)} />
      <AboutSheet open={aboutOpen} onClose={() => setAboutOpen(false)} showAdmin={!!profile?.isStaff} />
      <Sheet open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Keluar dari akun?" subtitle="Data si Kecil tetap tersimpan dan muncul lagi saat Ayah Bunda masuk kembali.">
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <Button variant="secondary" onClick={() => setLogoutOpen(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            icon={LogOut}
            onClick={() => {
              setLogoutOpen(false);
              window.setTimeout(logout, 250);
            }}
          >
            Keluar
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}
