import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, ShieldCheck, User } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Segmented from '../components/ui/Segmented';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/primitives';
import { ParentAvatar } from '../components/ui/Avatar';
import FlourishCareLogo from '../components/FlourishCareLogo';
import { useToast } from '../components/ui/Toast';
import type { UserProfile } from '../types';
import { useStore, saveSubRole } from '../lib/store';
import { useNav, type Route, type TabKey } from '../lib/nav';
import { firstName } from '../lib/format';
import { cx } from '../lib/cx';

const DEMO = { email: 'flourishcare.id@gmail.com', password: 'password123' };

type SubRole = 'bunda' | 'ayah' | 'wali';

export default function AuthScreen({
  onBack,
  mode: initialMode = 'login',
  redirect,
  redirectTab,
}: {
  onBack?: () => void;
  mode?: 'login' | 'register';
  redirect?: Route;
  redirectTab?: TabKey;
}) {
  const store = useStore();
  const nav = useNav();
  const toast = useToast();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [subRole, setSubRole] = useState<SubRole>('bunda');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Masukkan email yang valid.';
    if (password.length < (mode === 'register' ? 8 : 1)) e.password = mode === 'register' ? 'Kata sandi minimal 8 karakter.' : 'Masukkan kata sandi.';
    if (mode === 'register') {
      if (fullName.trim().length < 3) e.fullName = 'Isi nama lengkap Anda.';
      if (phone && !/^(\+62|62|0)8\d{7,12}$/.test(phone.replace(/[\s-]/g, ''))) e.phone = 'Contoh format: 081234567890.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (override?: { email: string; password: string }) => {
    if (!override && !validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const body =
        mode === 'register' && !override
          ? { email: email.trim(), password, fullName: fullName.trim(), phoneWhatsapp: phone.trim(), city: city.trim(), role: subRole === 'wali' ? 'caregiver' : 'parent', subRole }
          : { email: (override?.email ?? email).trim(), password: override?.password ?? password };
      const res = await fetch(mode === 'register' && !override ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Gagal terhubung. Coba lagi.');
      if (mode === 'register' && !override) saveSubRole(subRole);
      nav.completeAuth({ redirect, redirectTab });
      store.login(data.user as UserProfile, data.token);
      toast({ title: `Halo, ${firstName((data.user as UserProfile).fullName)}`, body: mode === 'register' ? 'Akun berhasil dibuat.' : 'Selamat datang kembali.' });
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      title={mode === 'login' ? 'Masuk' : 'Daftar'}
      largeTitle={false}
      onBack={onBack}
      footer={
        <Button block size="lg" loading={loading} onClick={() => submit()}>
          {mode === 'login' ? 'Masuk' : 'Buat akun'}
        </Button>
      }
    >
      <div className="px-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center pt-2">
          <div className="w-20 h-20 rounded-[26px] bg-white shadow-raised border border-line flex items-center justify-center">
            <FlourishCareLogo className="w-14 h-14" animated />
          </div>
          <h1 className="text-[30px] leading-tight tracking-[-0.02em] font-normal mt-5">{mode === 'login' ? 'Selamat datang kembali' : 'Buat akun gratis'}</h1>
          <p className="text-[16px] text-mute mt-1.5 max-w-[300px]">
            {mode === 'login' ? 'Lanjutkan perjalanan tumbuh kembang si Kecil.' : 'Pantau tumbuh kembang si Kecil bersama para ahli FlourishCare.'}
          </p>
        </motion.div>

        <Segmented
          className="mt-6"
          value={mode}
          onChange={(m) => {
            setMode(m);
            setErrors({});
          }}
          options={[
            { value: 'login', label: 'Masuk' },
            { value: 'register', label: 'Daftar' },
          ]}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'register' ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'register' ? -24 : 24 }}
            transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            className="space-y-4 mt-5"
          >
            {mode === 'register' && (
              <>
                <div>
                  <div className="text-[14px] text-mute mb-2 pl-1">Saya adalah</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bunda', 'ayah', 'wali'] as SubRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSubRole(r)}
                        aria-pressed={subRole === r}
                        className={cx(
                          'rounded-[20px] border py-3 flex flex-col items-center gap-1.5 transition-all active:scale-95',
                          subRole === r ? 'bg-brand-orange-tint border-brand-orange' : 'bg-white border-line shadow-card',
                        )}
                      >
                        <ParentAvatar variant={r} size={44} />
                        <span className="text-[15px] capitalize">{r === 'wali' ? 'Wali' : r === 'ayah' ? 'Ayah' : 'Bunda'}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Nama lengkap" icon={User} value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} placeholder="Amanda Kartika" autoComplete="name" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="WhatsApp" icon={Phone} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} placeholder="0812..." autoComplete="tel" />
                  <Field label="Kota" icon={MapPin} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Jakarta" autoComplete="address-level2" />
                </div>
              </>
            )}
            <Field label="Email" icon={Mail} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="bunda@email.com" autoComplete="email" />
            <Field
              label="Kata sandi"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder={mode === 'register' ? 'Minimal 8 karakter' : 'Kata sandi'}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              trailing={
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} className="text-mute">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />
            {errors.form && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[15px] text-semantic-danger bg-semantic-danger-soft rounded-[16px] px-4 py-3">
                {errors.form}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {mode === 'login' && (
          <div className="mt-5 rounded-[20px] bg-brand-orange-tint border border-brand-orange/25 p-4">
            <div className="text-[15px]">Ingin mencoba dulu?</div>
            <p className="text-[14px] text-mute mt-0.5">Masuk dengan akun demo yang sudah berisi data contoh si Kecil bernama Aiden.</p>
            <Button
              size="sm"
              variant="soft"
              className="mt-3"
              onClick={() => {
                setEmail(DEMO.email);
                setPassword(DEMO.password);
                submit(DEMO);
              }}
            >
              Coba akun demo
            </Button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[13px] text-mute mt-6">
          <ShieldCheck className="w-4 h-4" />
          Data anak dijaga sesuai UU Perlindungan Data Pribadi
        </div>
      </div>
    </Screen>
  );
}

