import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, MapPin, Phone, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import FlourishCareLogo from './FlourishCareLogo';
import { UserProfile as Profile } from '../types';

interface AuthProps {
  onAuthSuccess: (user: Profile, token: string) => void;
  inline?: boolean;
  onBack?: () => void;
}

export default function Auth({ onAuthSuccess, inline = false, onBack }: AuthProps) {
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
            subRole
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

  const formContent = (
    <div className={`flex flex-col bg-[#FFFDF0] ${inline ? 'p-1' : 'px-6 py-8'}`}>
      
      {/* Optional inline Back Button */}
      {inline && onBack && (
        <button 
          type="button"
          onClick={onBack}
          className="self-start mb-5 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100/60 text-brand-orange text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Kembali ke Beranda</span>
        </button>
      )}

      {/* Top Logo and Tagline */}
      <div className="flex flex-col items-center text-center mt-2 mb-6">
        <div className="scale-100 mb-2">
          <FlourishCareLogo />
        </div>
        <p className="text-[9px] text-brand-orange font-black tracking-widest uppercase">
          Tumbuh Kembang Optimal Si Kecil
        </p>
        <h2 className="text-lg font-black text-brand-brown tracking-tight mt-1">
          {isSignUp ? 'Daftar Akun Baru' : 'Masuk ke Aplikasi'}
        </h2>
        <p className="text-[10px] text-brand-brown/60 font-semibold mt-1 px-4 leading-relaxed">
          {isSignUp 
            ? 'Pantau grafik tumbuh kembang, milestone, dan skrining KPSP mandiri untuk buah hati Anda.' 
            : 'Masuk kembali untuk mendampingi tumbuh kembang dan resep stimulasi harian buah hati Anda.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 text-[10px] p-3 rounded-xl font-semibold leading-relaxed"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {isSignUp && (
          <>
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[8px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
                Nama Lengkap Ayah / Bunda / Wali
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown/40">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Amanda Kartika"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-orange-100/60 rounded-xl py-2.5 pl-9 pr-3 text-[11px] font-bold text-brand-brown placeholder-brand-brown/30 focus:outline-none focus:border-brand-orange/80 transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Role / Panggilan */}
            <div className="space-y-1">
              <label className="block text-[8px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
                Panggilan / Peran Anda
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setRole('parent');
                    setSubRole('bunda');
                  }}
                  className={`py-1.5 rounded-xl text-[10px] font-black border transition-all ${
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
                  className={`py-1.5 rounded-xl text-[10px] font-black border transition-all ${
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
                  className={`py-1.5 rounded-xl text-[10px] font-black border transition-all ${
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
            <div className="space-y-1">
              <label className="block text-[8px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
                Kota Domisili
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown/40">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jakarta Selatan"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-orange-100/60 rounded-xl py-2.5 pl-9 pr-3 text-[11px] font-bold text-brand-brown placeholder-brand-brown/30 focus:outline-none focus:border-brand-orange/80 transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Whatsapp */}
            <div className="space-y-1">
              <label className="block text-[8px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
                Nomor WhatsApp Aktif
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown/40">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={phoneWhatsapp}
                  onChange={(e) => setPhoneWhatsapp(e.target.value)}
                  className="w-full bg-white border border-orange-100/60 rounded-xl py-2.5 pl-9 pr-3 text-[11px] font-bold text-brand-brown placeholder-brand-brown/30 focus:outline-none focus:border-brand-orange/80 transition-colors shadow-sm"
                />
              </div>
              <p className="text-[8px] text-brand-brown/40 font-bold leading-normal pl-1">
                * Digunakan untuk mengirim reminder tumbuh kembang secara berkala.
              </p>
            </div>
          </>
        )}

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-[8px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
            Alamat Email
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown/40">
              <Mail className="w-3.5 h-3.5" />
            </span>
            <input
              type="email"
              required
              placeholder="Contoh: bunda@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-orange-100/60 rounded-xl py-2.5 pl-9 pr-3 text-[11px] font-bold text-brand-brown placeholder-brand-brown/30 focus:outline-none focus:border-brand-orange/80 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-[8px] font-black text-brand-brown/70 tracking-wider uppercase pl-1">
            Kata Sandi (Password)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown/40">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-orange-100/60 rounded-xl py-2.5 pl-9 pr-3 text-[11px] font-bold text-brand-brown placeholder-brand-brown/30 focus:outline-none focus:border-brand-orange/80 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-orange hover:bg-brand-orange/95 text-white py-3 rounded-xl text-xs font-extrabold shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-[0.98] mt-4 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{isSignUp ? 'Daftar Akun Baru' : 'Masuk Aplikasi'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Toggle link */}
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          className="text-[11px] font-bold text-brand-orange hover:underline focus:outline-none"
        >
          {isSignUp 
            ? 'Sudah punya akun? Masuk di sini' 
            : 'Belum punya akun? Daftar gratis sekarang'}
        </button>
      </div>

      {/* Footer branding */}
      <div className="mt-8 pt-4 pb-2 text-center text-[8px] text-brand-brown/35 font-bold tracking-wide flex flex-col items-center gap-1 border-t border-orange-100/30">
        <div className="flex items-center gap-1 text-brand-orange">
          <ShieldCheck className="w-3 h-3" />
          <span>Sertifikasi Klinik & Dokter Spesialis</span>
        </div>
        <span>FlourishCare • Lindungi Masa Depan Buah Hati</span>
      </div>

    </div>
  );

  if (inline) {
    return formContent;
  }

  return (
    <div className="min-h-screen bg-[#FDF7F2] md:bg-[#EEDCC5]/30 md:py-8 flex justify-center items-center overflow-x-hidden font-sans">
      
      {/* SMARTPHONE DEVICE BEZEL CONTAINER */}
      <div className="w-full h-[100dvh] md:max-w-[420px] md:h-[860px] md:rounded-[48px] shadow-cocoa-floating bg-[#FFFDF0] md:border-[12px] md:border-white text-brand-brown flex flex-col relative overflow-hidden md:my-auto">
        
        {/* TOP STATUS BAR ACCENT */}
        <div className="bg-[#F29935] h-3 z-50 shrink-0"></div>

        {/* MAIN BODY SCROLLABLE */}
        <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col bg-[#FFFDF0] p-6">
          {formContent}
        </div>

      </div>
    </div>
  );
}
