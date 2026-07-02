import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, MapPin, Phone, ShieldCheck, ArrowRight, Activity, Heart, ArrowLeft } from 'lucide-react';
import FlourishCareLogo from './FlourishCareLogo';
import { UserProfile as Profile } from '../types';

interface AuthProps {
  onAuthSuccess: (user: Profile, token: string) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'parent' | 'caregiver'>('parent');
  const [subRole, setSubRole] = useState<'bunda' | 'ayah' | 'lainnya'>('bunda');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp 
        ? { 
            email, 
            password, 
            fullName, 
            phoneWhatsapp, 
            city, 
            role, 
            subRole // stored inside user profile if needed, or mapped to parent role
          }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem');
      }

      // Save token & call parent callback
      localStorage.setItem('auth_token', data.token);
      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung dengan server');
    } finally {
      setLoading(false);
    }
  };

  // Demo shortcut login
  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'flourishcare.id@gmail.com',
          password: 'password123'
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      localStorage.setItem('auth_token', data.token);
      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Gagal login demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] md:bg-[#EEDCC5]/30 md:py-8 flex justify-center items-center overflow-x-hidden font-sans">
      
      {/* SMARTPHONE DEVICE BEZEL CONTAINER */}
      <div className="w-full h-[100dvh] md:max-w-[420px] md:h-[860px] md:rounded-[48px] shadow-cocoa-floating bg-[#FFFDF0] md:border-[12px] md:border-white text-brand-brown flex flex-col relative overflow-hidden md:my-auto">
        
        {/* TOP STATUS BAR ACCENT */}
        <div className="bg-[#F29935] h-3 z-50 shrink-0"></div>

        {/* MAIN BODY SCROLLABLE */}
        <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col bg-[#FFFDF0] px-6 py-8">
          
          {/* Top Logo and Tagline */}
          <div className="flex flex-col items-center text-center mt-4 mb-8">
            <div className="scale-110 mb-3">
              <FlourishCareLogo />
            </div>
            <p className="text-[10px] text-brand-orange font-black tracking-widest uppercase">
              Tumbuh Kembang Optimal Si Kecil
            </p>
            <h2 className="text-xl font-black text-brand-brown tracking-tight mt-1">
              {isSignUp ? 'Daftar Akun Baru' : 'Masuk ke Aplikasi'}
            </h2>
            <p className="text-xs text-brand-brown/60 font-medium mt-1 px-4">
              {isSignUp 
                ? 'Pantau grafik tumbuh kembang, milestone, dan skrining KPSP mandiri untuk buah hati Anda.' 
                : 'Masuk kembali untuk mendampingi tumbuh kembang dan resep stimulasi harian buah hati Anda.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl font-semibold leading-relaxed"
              >
                ⚠️ {error}
              </motion.div>
            )}

            {isSignUp && (
              <>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
                    Nama Lengkap Ayah / Bunda
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown/40">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Amanda Kartika"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-orange-100/60 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-brand-brown placeholder-brand-brown/30 focus:outline-none focus:border-brand-orange/80 transition-colors shadow-sm shadow-orange-100/10"
                    />
                  </div>
                </div>

                {/* Role / Panggilan */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
                    Panggilan / Peran Anda
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRole('parent');
                        setSubRole('bunda');
                      }}
                      className={`py-2 rounded-2xl text-xs font-black border transition-all ${
                        role === 'parent' && subRole === 'bunda'
                          ? 'bg-orange-50 border-brand-orange text-brand-orange'
                          : 'bg-white border-orange-100/60 text-brand-brown/50'
                      }`}
                    >
                      👩 Bunda
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRole('parent');
                        setSubRole('ayah');
                      }}
                      className={`py-2 rounded-2xl text-xs font-black border transition-all ${
                        role === 'parent' && subRole === 'ayah'
                          ? 'bg-orange-50 border-brand-orange text-brand-orange'
                          : 'bg-white border-orange-100/60 text-brand-brown/50'
                      }`}
                    >
                      👨 Ayah
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRole('caregiver');
                        setSubRole('lainnya');
                      }}
                      className={`py-2 rounded-2xl text-xs font-black border transition-all ${
                        role === 'caregiver'
                          ? 'bg-orange-50 border-brand-orange text-brand-orange'
                          : 'bg-white border-orange-100/60 text-brand-brown/50'
                      }`}
                    >
                      ❤️ Wali / Nanny
                    </button>
                  </div>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
                    Kota Domisili
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown/40">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Jakarta Selatan"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-orange-100/60 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-brand-brown placeholder-brand-brown/30 focus:outline-none focus:border-brand-orange/80 transition-colors shadow-sm shadow-orange-100/10"
                    />
                  </div>
                </div>

                {/* Whatsapp */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
                    Nomor WhatsApp Aktif
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown/40">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={phoneWhatsapp}
                      onChange={(e) => setPhoneWhatsapp(e.target.value)}
                      className="w-full bg-white border border-orange-100/60 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-brand-brown placeholder-brand-brown/30 focus:outline-none focus:border-brand-orange/80 transition-colors shadow-sm shadow-orange-100/10"
                    />
                  </div>
                  <p className="text-[9px] text-brand-brown/40 font-bold leading-normal pl-1">
                    * Digunakan untuk mengirim reminder imunisasi & tips perkembangan gratis.
                  </p>
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
                Alamat Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown/40">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="Contoh: bunda@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-orange-100/60 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-brand-brown placeholder-brand-brown/30 focus:outline-none focus:border-brand-orange/80 transition-colors shadow-sm shadow-orange-100/10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown/40">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-orange-100/60 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-brand-brown placeholder-brand-brown/30 focus:outline-none focus:border-brand-orange/80 transition-colors shadow-sm shadow-orange-100/10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange hover:bg-brand-orange/95 text-white py-3.5 rounded-2xl text-xs font-extrabold shadow-sm shadow-orange-100 cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-[0.98] mt-6 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Daftar Akun' : 'Masuk Aplikasi'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle link */}
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs font-bold text-brand-orange hover:underline focus:outline-none"
            >
              {isSignUp 
                ? 'Sudah punya akun? Masuk di sini' 
                : 'Belum punya akun? Daftar gratis sekarang'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-orange-100/50"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-brand-brown/35">
              <span className="bg-[#FFFDF0] px-3">Coba Akun Demo</span>
            </div>
          </div>

          {/* Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-orange-50 hover:bg-orange-100/60 border border-brand-orange/10 text-brand-orange py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Masuk sebagai Bunda Amanda (Demo)</span>
            <Activity className="w-3.5 h-3.5" />
          </button>

          {/* Footer branding */}
          <div className="mt-auto pt-8 pb-4 text-center text-[9px] text-brand-brown/35 font-bold tracking-wide flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-brand-orange">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sertifikasi Klinik & Dokter Spesialis</span>
            </div>
            <span>FlourishCare v1.2.0 • Lindungi Masa Depan Buah Hati</span>
          </div>

        </div>

      </div>
    </div>
  );
}
