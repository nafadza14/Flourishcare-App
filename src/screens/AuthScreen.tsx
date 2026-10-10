import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, MailCheck, MapPin, Phone, ShieldCheck, User } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Segmented from '../components/ui/Segmented';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/primitives';
import { ParentAvatar } from '../components/ui/Avatar';
import FlourishCareLogo from '../components/FlourishCareLogo';
import { useToast } from '../components/ui/Toast';
import { useStore, saveSubRole } from '../lib/store';
import { useNav, type Route, type TabKey } from '../lib/nav';
import { firstName } from '../lib/format';
import { cx } from '../lib/cx';
import { haptic } from '../lib/haptics';
import { saveAuthIntent, sendPasswordReset, signInWithEmail, signInWithGoogle, signUpWithEmail, takeAuthIntent } from '../lib/supabase';

type SubRole = 'bunda' | 'ayah' | 'wali';

/** Official multi-colour Google "G" used on Sign in with Google buttons. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [sentTo, setSentTo] = useState<{ email: string; kind: 'confirm' | 'reset' } | null>(null);

  const emailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const validate = () => {
    const e: Record<string, string> = {};
    if (!emailValid()) e.email = 'Masukkan email yang valid.';
    if (mode === 'register') {
      if (password.length < 8) e.password = 'Kata sandi minimal 8 karakter.';
      if (fullName.trim().length < 3) e.fullName = 'Isi nama lengkap dulu, ya.';
      if (phone && !/^(\+62|62|0)8\d{7,12}$/.test(phone.replace(/[\s-]/g, ''))) e.phone = 'Contoh format: 081234567890.';
    } else if (!password) {
      e.password = 'Masukkan kata sandi.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const finishSignIn = async () => {
    const user = await store.establishSession();
    if (!user) throw new Error('Akun berhasil masuk, tetapi data belum bisa dimuat. Coba lagi sebentar lagi.');
    takeAuthIntent();
    nav.completeAuth({ redirect, redirectTab });
    toast({ title: `Halo, ${firstName(user.fullName)}`, body: mode === 'register' ? 'Akun berhasil dibuat.' : 'Selamat datang kembali.' });
  };

  const submit = async () => {
    if (!validate()) {
      haptic('warning');
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      if (mode === 'register') {
        saveSubRole(subRole);
        const { session } = await signUpWithEmail({ email, password, fullName, phone, city, subRole });
        if (!session) {
          setSentTo({ email: email.trim(), kind: 'confirm' });
          return;
        }
      } else {
        await signInWithEmail(email, password);
      }
      await finishSignIn();
    } catch (err: any) {
      haptic('warning');
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setGoogleLoading(true);
    setErrors({});
    try {
      saveAuthIntent({ redirect, redirectTab });
      await signInWithGoogle(); // the page leaves for Google here
    } catch (err: any) {
      saveAuthIntent(null);
      setErrors({ form: err.message });
      setGoogleLoading(false);
    }
  };

  const forgot = async () => {
    if (!emailValid()) {
      setErrors({ email: 'Isi email akun dulu, lalu ketuk Lupa kata sandi.' });
      return;
    }
    setResetLoading(true);
    setErrors({});
    try {
      await sendPasswordReset(email);
      setSentTo({ email: email.trim(), kind: 'reset' });
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setResetLoading(false);
    }
  };

  if (sentTo) {
    return (
      <Screen title={sentTo.kind === 'confirm' ? 'Verifikasi email' : 'Atur ulang kata sandi'} largeTitle={false} onBack={onBack}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-6 pt-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="w-20 h-20 rounded-[26px] bg-brand-orange-soft text-brand-orange-deep flex items-center justify-center"
          >
            <MailCheck className="w-10 h-10" strokeWidth={1.6} />
          </motion.div>
          <h1 className="text-[28px] leading-tight tracking-[-0.02em] font-normal mt-6">Cek kotak masuk email</h1>
          <p className="text-[16px] text-mute mt-2 max-w-[310px] leading-relaxed">
            {sentTo.kind === 'confirm'
              ? 'Kami mengirim tautan verifikasi ke'
              : 'Kami mengirim tautan untuk membuat kata sandi baru ke'}{' '}
            <span className="text-ink">{sentTo.email}</span>. Buka tautan itu dari perangkat ini.
          </p>
          <p className="text-[14px] text-mute mt-4">Tidak ada di kotak masuk? Periksa folder Spam atau Promosi.</p>
          <Button
            className="mt-8"
            variant="secondary"
            onClick={() => {
              setSentTo(null);
              setMode('login');
              setPassword('');
            }}
          >
            Kembali ke halaman masuk
          </Button>
        </motion.div>
      </Screen>
    );
  }

  return (
    <Screen
      title={mode === 'login' ? 'Masuk' : 'Daftar'}
      largeTitle={false}
      onBack={onBack}
      footer={
        <Button block size="lg" loading={loading} onClick={submit}>
          {mode === 'login' ? 'Masuk' : 'Buat akun'}
        </Button>
      }
    >
      <div className="px-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center pt-2">
          <FlourishCareLogo variant="full" className="h-20 w-auto" animated />
          <h1 className="text-[30px] leading-tight tracking-[-0.02em] font-normal mt-5">{mode === 'login' ? 'Selamat datang kembali' : 'Buat akun gratis'}</h1>
          <p className="text-[16px] text-mute mt-1.5 max-w-[300px]">
            {mode === 'login' ? 'Lanjutkan memantau tumbuh kembang si Kecil.' : 'Pantau si Kecil bersama psikolog dan terapis anak FlourishCare.'}
          </p>
        </motion.div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={google}
          disabled={googleLoading}
          className="mt-6 w-full h-[54px] rounded-full bg-white border border-line-2 shadow-card flex items-center justify-center gap-3 text-[16px] text-ink disabled:opacity-70"
        >
          {googleLoading ? (
            <span className="w-5 h-5 rounded-full border-2 border-line-2 border-t-brand-orange animate-spin" aria-hidden />
          ) : (
            <GoogleMark className="w-5 h-5" />
          )}
          {googleLoading ? 'Membuka Google...' : mode === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}
        </motion.button>

        <div className="flex items-center gap-3 my-5" aria-hidden>
          <span className="flex-1 h-px bg-line-2" />
          <span className="text-[13px] text-mute">atau dengan email</span>
          <span className="flex-1 h-px bg-line-2" />
        </div>

        <Segmented
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
                        <span className="text-[15px]">{r === 'wali' ? 'Wali' : r === 'ayah' ? 'Ayah' : 'Bunda'}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Nama lengkap" icon={User} value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} placeholder="Nama lengkap" autoComplete="name" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="WhatsApp" icon={Phone} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} placeholder="0812..." autoComplete="tel" />
                  <Field label="Kota" icon={MapPin} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Jakarta" autoComplete="address-level2" />
                </div>
              </>
            )}
            <Field label="Email" icon={Mail} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="nama@email.com" autoComplete="email" />
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
            {mode === 'login' && (
              <div className="flex justify-end -mt-1">
                <button type="button" onClick={forgot} disabled={resetLoading} className="h-9 px-1 text-[15px] text-brand-orange-deep disabled:opacity-60">
                  {resetLoading ? 'Mengirim...' : 'Lupa kata sandi?'}
                </button>
              </div>
            )}
            {errors.form && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[15px] text-semantic-danger bg-semantic-danger-soft rounded-[16px] px-4 py-3" role="alert">
                {errors.form}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="text-[13px] text-mute text-center mt-6 leading-relaxed px-2">
          Satu akun untuk aplikasi ini, flourishcare.id, dan book.flourishcare.id.
        </p>
        <div className="flex items-center justify-center gap-1.5 text-[13px] text-mute mt-2">
          <ShieldCheck className="w-4 h-4" />
          Data anak dijaga sesuai UU Perlindungan Data Pribadi
        </div>
      </div>
    </Screen>
  );
}
