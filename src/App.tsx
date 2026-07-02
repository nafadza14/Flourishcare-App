import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Baby, 
  LineChart, 
  Award, 
  Calendar, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  Sparkles, 
  ChevronDown, 
  User, 
  Bell, 
  Activity,
  LogOut,
  Home,
  ArrowLeft,
  Wifi,
  Battery,
  Signal,
  ChevronRight,
  CheckCircle,
  Flame,
  Clock,
  Menu,
  Footprints,
  Puzzle,
  CalendarCheck,
  Info
} from 'lucide-react';

import Onboarding from './components/Onboarding';
import GrowthChart from './components/GrowthChart';
import MilestoneTracker from './components/MilestoneTracker';
import ImmunizationScheduler from './components/ImmunizationScheduler';
import ScreeningHub from './components/ScreeningHub';
import ContentLibrary from './components/ContentLibrary';
import AktivitasStimulasi from './components/AktivitasStimulasi';
import TanyaAhli from './components/TanyaAhli';
import BookingHub from './components/BookingHub';
import FlourishCareLogo from './components/FlourishCareLogo';
import Auth from './components/Auth';

import { Child, UserProfile as Profile, GrowthRecord } from './types';
import { apiFetch } from './api';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [profile, setProfile] = useState<Profile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [latestGrowth, setLatestGrowth] = useState<GrowthRecord | null>(null);
  
  // Mobile App Tab Navigation
  // 'home' is the central mobile dashboard, and others are sub-pages
  const [activeTab, setActiveTab] = useState<string>('home');
  const [authRedirectTab, setAuthRedirectTab] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  
  // Supabase Integration & Connection Health
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    url?: string;
    project?: string;
    error?: string;
    hint?: string;
  } | null>(null);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // For deep navigation triggers between tabs
  const [preSelectedService, setPreSelectedService] = useState('onsite');
  const [preSelectedTherapist, setPreSelectedTherapist] = useState('exp_ira');

  // Realistic Native Clock State
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    if (token) {
      fetchInitialData();
    } else {
      setLoading(false);
    }
    
    // Update Clock every minute to look completely like a real native phone
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, '0');
      let minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => {
      clearInterval(interval);
    };
  }, [token]);

  const handleAuthSuccess = (user: Profile, authToken: string) => {
    setProfile(user);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    if (authRedirectTab) {
      setActiveTab(authRedirectTab);
      setAuthRedirectTab(null);
    } else {
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setProfile(null);
    setToken(null);
    setChildren([]);
    setActiveChild(null);
    setLatestGrowth(null);
    setActiveTab('home');
  };

  const handleTabClick = (tab: string) => {
    const isPublicTab = tab === 'home' || tab === 'library';
    if (!token || !profile) {
      if (isPublicTab) {
        setActiveTab(tab);
      } else {
        setAuthRedirectTab(tab);
        setActiveTab('auth');
      }
    } else {
      setActiveTab(tab);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch Supabase status
      try {
        const sRes = await apiFetch('/api/supabase-status');
        if (sRes.ok) {
          const sData = await sRes.json();
          setSupabaseStatus(sData);
        }
      } catch (e) {
        console.warn('Failed to fetch Supabase status:', e);
      }

      // 1. Fetch Profile
      const profRes = await apiFetch('/api/profile');
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
      }

      // 2. Fetch Children List
      const childRes = await apiFetch('/api/children');
      let childrenData: Child[] = [];
      if (childRes.ok) {
        childrenData = await childRes.json();
      }

      // Merge with localStorage fallback
      try {
        const localChildrenStr = localStorage.getItem('fc_local_children');
        if (localChildrenStr) {
          const localChildren = JSON.parse(localChildrenStr);
          if (Array.isArray(localChildren)) {
            localChildren.forEach((lc: Child) => {
              if (!childrenData.some(c => c.id === lc.id)) {
                childrenData.push(lc);
              }
            });
          }
        }
      } catch (localErr) {
        console.warn('Failed to load local children:', localErr);
      }

      setChildren(childrenData);
      if (childrenData.length > 0) {
        setActiveChild(childrenData[0]);
        fetchLatestGrowth(childrenData[0].id);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestGrowth = async (childId: string) => {
    try {
      const growthRes = await apiFetch(`/api/growth/${childId}`);
      if (growthRes.ok) {
        const records = await growthRes.json();
        if (records.length > 0) {
          setLatestGrowth(records[records.length - 1]);
        } else {
          setLatestGrowth(null);
        }
      }
    } catch (err) {
      console.error('Failed to load child stats:', err);
    }
  };

  const handleOnboardingComplete = (newChild: Child) => {
    setChildren(prev => [...prev, newChild]);
    setActiveChild(newChild);
    fetchLatestGrowth(newChild.id);
    setActiveTab('home');
  };

  const handleSwitchChild = (child: Child) => {
    setActiveChild(child);
    fetchLatestGrowth(child.id);
  };

  const handleNavigateToBooking = (serviceType: string, therapistId?: string) => {
    setPreSelectedService(serviceType);
    if (therapistId) setPreSelectedTherapist(therapistId);
    setActiveTab('booking');
  };

  const calculateAgeInMonths = (birthDateStr: string): number => {
    const birth = new Date(birthDateStr);
    const now = new Date(); // assume current time 2026-07-01
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.4375);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF0] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-brand-brown/70">Menyiapkan Rumah Tumbuh Kembang...</p>
      </div>
    );
  }

  // If user is authenticated but no children logged, force the beautiful onboarding questionnaire flow
  const needsOnboarding = token && profile && (children.length === 0 || !activeChild);

  if (needsOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const ageInMonths = activeChild ? calculateAgeInMonths(activeChild.birthDate) : 0;

  // Helper to determine active subpage title
  const getSubPageTitle = (tab: string): string => {
    switch (tab) {
      case 'growth': return 'Grafik Tumbuh Kembang';
      case 'milestone': return 'Milestone Tracker';
      case 'vaccine': return 'Jadwal Imunisasi';
      case 'screening': return 'Skrining Dini (KPSP)';
      case 'stimulasi': return 'Resep Stimulasi';
      case 'qa': return 'Tanya Ahli';
      case 'library': return 'Edukasi Ahli';
      case 'booking': return 'Booking Klinik';
      default: return 'Flourishcare App';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] md:bg-[#EEDCC5]/30 md:py-8 flex justify-center items-center overflow-x-hidden">
      
      {/* 
        SMARTPHONE MOCK CONTAINER
        Renders as full screen on mobile, and a beautifully rounded, modern device bezel on desktop.
      */}
      <div className="w-full h-[100dvh] md:max-w-[420px] md:h-[860px] md:rounded-[48px] shadow-cocoa-floating bg-[#FFFDF0] md:border-[12px] md:border-white text-brand-brown font-sans flex flex-col relative overflow-hidden md:my-auto">
        
        {/* A. SIMULATED STATUS BAR (DESKTOP / IOS STYLING) - Hapus Clock, Signal, Wifi, Battery */}
        <div className="bg-[#F29935] h-3 z-50 shrink-0 select-none"></div>

        {/* B. MAIN INTERACTIVE CONTENT AREA (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto pb-28 scrollbar-none flex flex-col bg-[#FFFDF0]">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex-1 flex flex-col"
            >
              
              {/* === TAB 1: NATIVE MOBILE DASHBOARD (HOME / BERANDA) === */}
              {activeTab === 'home' && (
                <div className="flex-1 flex flex-col">
                  
                  {/* SOLID ORANGE HEADER BLOCK - Matches Reference Design Structure */}
                  <div className="bg-[#F29935] text-[#FFFDE9] px-5 pt-4 pb-8 rounded-b-[40px] shadow-cocoa-resting space-y-5">
                    
                    {/* Welcome Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-cocoa-resting/5 shrink-0">
                          <FlourishCareLogo className="w-8 h-8" />
                        </div>
                        <div>
                          <h1 className="text-base font-extrabold tracking-tight font-display text-white leading-tight">
                            Flourishcare App
                          </h1>
                          <p className="text-[9px] text-brand-yellow font-extrabold tracking-widest leading-none">Rumah Tumbuh Kembang</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {profile ? (
                          <>
                            <div className="text-right">
                              <span className="block text-[10px] text-orange-100/90 font-semibold leading-tight">
                                Halo {profile.role === 'caregiver' ? 'Wali' : 'Ayah/Bunda'}
                              </span>
                              <span className="block text-xs font-extrabold text-[#FFFDE9] leading-none">
                                {profile.fullName.split(' ')[0]}
                              </span>
                            </div>
                            <button
                              onClick={handleLogout}
                              className="w-9 h-9 rounded-full border border-white/25 bg-white/10 shrink-0 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer active:scale-95"
                              title="Keluar / Ganti Akun"
                            >
                              <LogOut className="w-4.5 h-4.5 text-brand-yellow" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setAuthRedirectTab('home');
                              setActiveTab('auth');
                            }}
                            className="px-3 py-1.5 bg-[#FFFDF0] hover:bg-orange-50 text-brand-orange text-[10px] font-black rounded-xl shadow-cocoa-resting/10 active:scale-95 transition-all cursor-pointer shrink-0"
                          >
                            Masuk / Daftar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Horizontal Children Profiles Switcher Inside Cocoa Header */}
                    {profile && children.length > 0 && activeChild && (
                      <div className="space-y-1.5 pt-1">
                        <span className="block text-[8px] text-orange-100/90 font-black tracking-widest">PILIH ANAK</span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {children.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => handleSwitchChild(c)}
                              className={`px-3.5 py-2 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer transition-all ${
                                activeChild.id === c.id
                                  ? 'bg-white text-brand-orange font-extrabold shadow-cocoa-resting scale-102'
                                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'
                              }`}
                            >
                              <Baby className="w-3.5 h-3.5" />
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Integrated Signature Growth Arc inside Cocoa Card */}
                    {profile && activeChild ? (
                      <div className="bg-white rounded-[28px] p-5 flex items-center justify-between gap-4 mt-1 border border-orange-100/30 shadow-cocoa-raised text-brand-brown">
                        <div className="space-y-3 flex-1">
                          <div>
                            <span className="text-[9px] font-black tracking-widest text-brand-orange uppercase">Anak Tercinta</span>
                            <h3 className="font-extrabold text-lg leading-tight text-brand-brown font-display mt-0.5">{activeChild.name}</h3>
                            <p className="text-xs font-bold text-brand-brown/70 mt-0.5">{ageInMonths} Bulan ({activeChild.gender === 'L' ? 'Laki-laki' : 'Perempuan'})</p>
                          </div>

                          {/* Flat horizontal metrics grid */}
                          <div className="grid grid-cols-3 gap-1 bg-[#FFF9EE] rounded-2xl p-2.5 text-center text-[10px] font-bold text-brand-brown border border-orange-100/10">
                            <div>
                              <div className="text-[7px] text-brand-brown/50 font-black tracking-wider mb-0.5">Berat</div>
                              <div className="text-xs font-black text-brand-orange">{latestGrowth ? `${latestGrowth.weightKg} kg` : '-'}</div>
                            </div>
                            <div className="border-x border-orange-100/35">
                              <div className="text-[7px] text-brand-brown/50 font-black tracking-wider mb-0.5">Tinggi</div>
                              <div className="text-xs font-black text-brand-orange">{latestGrowth ? `${latestGrowth.heightCm} cm` : '-'}</div>
                            </div>
                            <div>
                              <div className="text-[7px] text-brand-brown/50 font-black tracking-wider mb-0.5">L.Kepala</div>
                              <div className="text-xs font-black text-brand-orange">{latestGrowth ? `${latestGrowth.headCircumferenceCm} cm` : '-'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Growth Arc SVG inside header - Signature visual Moment */}
                        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center bg-[#FFF9EE] rounded-full p-1.5 border border-orange-100/20">
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            {/* Outer Track Arc */}
                            <circle
                              cx="48"
                              cy="48"
                              r="36"
                              className="stroke-orange-100 fill-none"
                              strokeWidth="5"
                              strokeDasharray="226"
                              strokeDashoffset="56" /* Represents half-circle arcs */
                            />
                            {/* Inner Active Sunrise Arc */}
                            <circle
                              cx="48"
                              cy="48"
                              r="36"
                              className="stroke-brand-orange fill-none"
                              strokeWidth="5.5"
                              strokeDasharray="226"
                              strokeDashoffset="100" /* Represents simulated completed progress percentage */
                              strokeLinecap="round"
                            />
                          </svg>
                          
                          {/* Display Center text */}
                          <div className="text-center z-10 flex flex-col justify-center items-center">
                            <span className="text-xs font-black text-brand-orange">85%</span>
                            <span className="text-[8px] tracking-widest text-brand-brown/65 font-bold leading-none mt-0.5">Milestone</span>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="bg-white rounded-[28px] p-5 flex flex-col gap-3.5 mt-1 border border-orange-100/30 shadow-cocoa-raised text-brand-brown">
                        <div>
                          <span className="text-[8px] font-black tracking-widest text-brand-orange uppercase">Selamat Datang</span>
                          <h3 className="font-extrabold text-base leading-tight text-brand-brown font-display mt-0.5">Pantau Tumbuh Kembang Buah Hati Anda</h3>
                          <p className="text-[10px] font-semibold text-brand-brown/70 leading-relaxed mt-1">
                            Dapatkan akses ke grafik CDC/WHO secara presisi, milestone motorik, skrining KPSP mandiri, serta resep stimulasi harian dari psikolog & dokter spesialis.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setAuthRedirectTab('home');
                            setActiveTab('auth');
                          }}
                          className="w-full bg-brand-orange hover:bg-brand-orange/95 text-white py-2.5 rounded-xl text-xs font-extrabold shadow-sm shadow-orange-100/30 cursor-pointer text-center active:scale-98 transition-all"
                        >
                          Mulai Sekarang (Gratis)
                        </button>
                      </div>
                    )}

                  </div>

                  {/* FLOATING CARD CONTENT SECTION - Inspired by Reference */}
                  <div className="p-4 space-y-5">

                    {/* BENTO ACTION GRID (9 CORE APP FEATURES in 3x3 GRID) */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] text-brand-brown/50 font-black tracking-wider">LAYANAN UTAMA</span>
                        <span className="text-[9px] text-brand-orange bg-orange-100/50 px-2 py-0.5 rounded-full font-extrabold">9 Layanan Aktif</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        
                        {/* 1. Growth */}
                        <button
                          onClick={() => handleTabClick('growth')}
                          className="bg-white hover:bg-orange-50/20 p-2.5 rounded-2xl text-left border border-orange-100/10 shadow-cocoa-resting flex flex-col justify-between h-[96px] cursor-pointer transition-all hover:scale-101"
                        >
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center shadow-cocoa-resting/5">
                            <LineChart className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[10px] text-brand-brown leading-none">Grafik Tumbuh</h4>
                            <p className="text-[8px] text-brand-brown/45 font-bold line-clamp-1 mt-1">WHO & CDC</p>
                          </div>
                        </button>
 
                        {/* 2. Milestones */}
                        <button
                          onClick={() => handleTabClick('milestone')}
                          className="bg-white hover:bg-orange-50/20 p-2.5 rounded-2xl text-left border border-orange-100/10 shadow-cocoa-resting flex flex-col justify-between h-[96px] cursor-pointer transition-all hover:scale-101"
                        >
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center shadow-cocoa-resting/5">
                            <Footprints className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[10px] text-brand-brown leading-none">Milestones</h4>
                            <p className="text-[8px] text-brand-brown/45 font-bold line-clamp-1 mt-1">Cek Motorik</p>
                          </div>
                        </button>
 
                        {/* 3. Vaccine */}
                        <button
                          onClick={() => handleTabClick('vaccine')}
                          className="bg-white hover:bg-orange-50/20 p-2.5 rounded-2xl text-left border border-orange-100/10 shadow-cocoa-resting flex flex-col justify-between h-[96px] cursor-pointer transition-all hover:scale-101"
                        >
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center shadow-cocoa-resting/5">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[10px] text-brand-brown leading-none">Jadwal Imun</h4>
                            <p className="text-[8px] text-brand-brown/45 font-bold line-clamp-1 mt-1">IDAI & Kemenkes</p>
                          </div>
                        </button>
 
                        {/* 4. Screening */}
                        <button
                          onClick={() => handleTabClick('screening')}
                          className="bg-white hover:bg-orange-50/20 p-2.5 rounded-2xl text-left border border-orange-100/10 shadow-cocoa-resting flex flex-col justify-between h-[96px] cursor-pointer transition-all hover:scale-101"
                        >
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center shadow-cocoa-resting/5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[10px] text-brand-brown leading-none">Skrining Dini</h4>
                            <p className="text-[8px] text-brand-brown/45 font-bold line-clamp-1 mt-1">KPSP Mandiri</p>
                          </div>
                        </button>
 
                        {/* 5. Stimulasi */}
                        <button
                          onClick={() => handleTabClick('stimulasi')}
                          className="bg-white hover:bg-orange-50/20 p-2.5 rounded-2xl text-left border border-orange-100/10 shadow-cocoa-resting flex flex-col justify-between h-[96px] cursor-pointer transition-all hover:scale-101"
                        >
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center shadow-cocoa-resting/5">
                            <Puzzle className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[10px] text-brand-brown leading-none">Stimulasi</h4>
                            <p className="text-[8px] text-brand-brown/45 font-bold line-clamp-1 mt-1">Main & Belajar</p>
                          </div>
                        </button>
 
                        {/* 6. Tanya Ahli */}
                        <button
                          onClick={() => handleTabClick('qa')}
                          className="bg-white hover:bg-orange-50/20 p-2.5 rounded-2xl text-left border border-orange-100/10 shadow-cocoa-resting flex flex-col justify-between h-[96px] cursor-pointer transition-all hover:scale-101"
                        >
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center shadow-cocoa-resting/5">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[10px] text-brand-brown leading-none">Tanya Ahli</h4>
                            <p className="text-[8px] text-brand-brown/45 font-bold line-clamp-1 mt-1">Konsul Dokter</p>
                          </div>
                        </button>
 
                        {/* 7. Library */}
                        <button
                          onClick={() => handleTabClick('library')}
                          className="bg-white hover:bg-orange-50/20 p-2.5 rounded-2xl text-left border border-orange-100/10 shadow-cocoa-resting flex flex-col justify-between h-[96px] cursor-pointer transition-all hover:scale-101"
                        >
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center shadow-cocoa-resting/5">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[10px] text-brand-brown leading-none">Edukasi Ahli</h4>
                            <p className="text-[8px] text-brand-brown/45 font-bold line-clamp-1 mt-1">Artikel Medis</p>
                          </div>
                        </button>
 
                        {/* 8. Booking */}
                        <button
                          onClick={() => handleTabClick('booking')}
                          className="bg-white hover:bg-orange-50/20 p-2.5 rounded-2xl text-left border border-orange-100/10 shadow-cocoa-resting flex flex-col justify-between h-[96px] cursor-pointer transition-all hover:scale-101"
                        >
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center shadow-cocoa-resting/5">
                            <CalendarCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[10px] text-brand-brown leading-none">Booking</h4>
                            <p className="text-[8px] text-brand-brown/45 font-bold line-clamp-1 mt-1">Klinik & Terapi</p>
                          </div>
                        </button>

                        {/* 9. Tentang Kami */}
                        <button
                          onClick={() => setShowAboutDialog(true)}
                          className="bg-white hover:bg-orange-50/20 p-2.5 rounded-2xl text-left border border-orange-100/10 shadow-cocoa-resting flex flex-col justify-between h-[96px] cursor-pointer transition-all hover:scale-101"
                        >
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center shadow-cocoa-resting/5">
                            <Info className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[10px] text-brand-brown leading-none">Tentang Kami</h4>
                            <p className="text-[8px] text-brand-brown/45 font-bold line-clamp-1 mt-1">Flourishcare App</p>
                          </div>
                        </button>

                      </div>
                    </div>

                    {/* Warm Parent Tips Banner */}
                    <div className="bg-emerald-50/60 p-4.5 rounded-[28px] border border-emerald-100/40 text-xs space-y-2 shadow-cocoa-resting">
                      <div className="flex items-center gap-1.5 font-extrabold text-emerald-800">
                        <Sparkles className="w-4.5 h-4.5 text-emerald-600 fill-emerald-100" />
                        <span>Tips Hari Ini dari Psikolog Ira</span>
                      </div>
                      <p className="text-brand-brown/85 leading-relaxed font-semibold">
                        "Jangan lupa beri si Kecil pujian yang spesifik saat ia berhasil menumpuk 3 balok mainan ya Bun! Hal ini melatih kemandirian & rasa percaya diri anak sejak dini."
                      </p>
                    </div>

                    {/* Clinical Guidelines Footnote */}
                    <div className="py-2 text-center">
                      <p className="text-[9px] text-brand-brown/35 font-bold tracking-wider">
                        Flourishcare App &copy; 2026. Sesuai Panduan Klinis Tumbuh Kembang Indonesia.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* === NESTED VIEWS: SUB-PAGES WITH UNIFORM BACK BUTTONS === */}
              {activeTab !== 'home' && (
                <div className="flex-1 flex flex-col">
                  
                  {/* Uniform Mobile App Subpage Navigation Header */}
                  <div className="px-4 py-3.5 bg-white/95 backdrop-blur-md border-b border-orange-100/10 flex items-center gap-3.5 sticky top-0 z-30 shrink-0 select-none shadow-cocoa-resting">
                    <button 
                      onClick={() => setActiveTab('home')}
                      className="w-9 h-9 rounded-full bg-orange-50 hover:bg-orange-100/60 flex items-center justify-center text-brand-orange cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    <div>
                      <h2 className="text-sm font-black text-brand-brown font-display leading-tight">
                        {getSubPageTitle(activeTab)}
                      </h2>
                      <p className="text-[9px] text-brand-brown/45 font-bold tracking-wider">
                        FlourishCare &bull; {activeChild?.name || 'Tumbuh Kembang'}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Render of Active Component Tab inside the App Bezel */}
                  <div className="flex-1 px-4 py-5 bg-[#FFFDF0]">
                    {activeTab === 'growth' && activeChild && (
                      <GrowthChart child={activeChild} onRefreshStats={() => fetchLatestGrowth(activeChild.id)} />
                    )}
                    {activeTab === 'milestone' && activeChild && (
                      <MilestoneTracker child={activeChild} onNavigateToScreening={() => setActiveTab('screening')} />
                    )}
                    {activeTab === 'vaccine' && activeChild && (
                      <ImmunizationScheduler child={activeChild} />
                    )}
                    {activeTab === 'screening' && activeChild && (
                      <ScreeningHub child={activeChild} onNavigateToBooking={handleNavigateToBooking} />
                    )}
                    {activeTab === 'stimulasi' && activeChild && (
                      <AktivitasStimulasi child={activeChild} />
                    )}
                    {activeTab === 'qa' && activeChild && (
                      <TanyaAhli child={activeChild} />
                    )}
                    {activeTab === 'library' && (
                      <ContentLibrary />
                    )}
                    {activeTab === 'booking' && activeChild && (
                      <BookingHub 
                        child={activeChild} 
                        preSelectedService={preSelectedService} 
                        preSelectedTherapistId={preSelectedTherapist} 
                      />
                    )}
                    {activeTab === 'auth' && (
                      <Auth inline={true} onAuthSuccess={handleAuthSuccess} onBack={() => setActiveTab('home')} />
                    )}
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>

        {/* C. FLOATING NATIVE PILL BOTTOM TAB BAR - FamilyGo inspired high fidelity navigation */}
        <div className="absolute bottom-5 left-4 right-4 h-[68px] bg-white/95 backdrop-blur-md border border-orange-100/20 rounded-[28px] shadow-cocoa-floating flex items-center justify-around px-2.5 z-40 select-none">
          
          {/* TAB 1: Home */}
          <button
            onClick={() => handleTabClick('home')}
            className="flex flex-col items-center justify-center w-12 h-full cursor-pointer transition-all relative"
          >
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-brand-orange stroke-[2.5]' : 'text-[#7A4C3D]/45'}`} />
            <span className={`text-[8px] mt-1 font-black leading-none ${activeTab === 'home' ? 'text-brand-orange' : 'text-[#7A4C3D]/50'}`}>Home</span>
            {activeTab === 'home' && (
              <motion.div layoutId="activeDot" className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-orange" />
            )}
          </button>

          {/* TAB 2: Milestones */}
          <button
            onClick={() => handleTabClick('milestone')}
            className="flex flex-col items-center justify-center w-12 h-full cursor-pointer transition-all relative"
          >
            <Footprints className={`w-5 h-5 ${(activeTab === 'milestone' || activeTab === 'screening') ? 'text-brand-orange stroke-[2.5]' : 'text-[#7A4C3D]/45'}`} />
            <span className={`text-[8px] mt-1 font-black leading-none ${(activeTab === 'milestone' || activeTab === 'screening') ? 'text-brand-orange' : 'text-[#7A4C3D]/50'}`}>Milestones</span>
            {(activeTab === 'milestone' || activeTab === 'screening') && (
              <motion.div layoutId="activeDot" className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-orange" />
            )}
          </button>

          {/* TAB 3: Stimulasi */}
          <button
            onClick={() => handleTabClick('stimulasi')}
            className="flex flex-col items-center justify-center w-12 h-full cursor-pointer transition-all relative"
          >
            <Puzzle className={`w-5 h-5 ${activeTab === 'stimulasi' ? 'text-brand-orange stroke-[2.5]' : 'text-[#7A4C3D]/45'}`} />
            <span className={`text-[8px] mt-1 font-black leading-none ${activeTab === 'stimulasi' ? 'text-brand-orange' : 'text-[#7A4C3D]/50'}`}>Stimulasi</span>
            {activeTab === 'stimulasi' && (
              <motion.div layoutId="activeDot" className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-orange" />
            )}
          </button>

          {/* TAB 4: Tanya Ahli */}
          <button
            onClick={() => handleTabClick('qa')}
            className="flex flex-col items-center justify-center w-12 h-full cursor-pointer transition-all relative"
          >
            <MessageSquare className={`w-5 h-5 ${(activeTab === 'qa' || activeTab === 'library') ? 'text-brand-orange stroke-[2.5]' : 'text-[#7A4C3D]/45'}`} />
            <span className={`text-[8px] mt-1 font-black leading-none ${(activeTab === 'qa' || activeTab === 'library') ? 'text-brand-orange' : 'text-[#7A4C3D]/50'}`}>Tanya Ahli</span>
            {(activeTab === 'qa' || activeTab === 'library') && (
              <motion.div layoutId="activeDot" className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-orange" />
            )}
          </button>

          {/* TAB 5: Booking */}
          <button
            onClick={() => handleTabClick('booking')}
            className="flex flex-col items-center justify-center w-12 h-full cursor-pointer transition-all relative"
          >
            <CalendarCheck className={`w-5 h-5 ${activeTab === 'booking' ? 'text-brand-orange stroke-[2.5]' : 'text-[#7A4C3D]/45'}`} />
            <span className={`text-[8px] mt-1 font-black leading-none ${activeTab === 'booking' ? 'text-brand-orange' : 'text-[#7A4C3D]/50'}`}>Booking</span>
            {activeTab === 'booking' && (
              <motion.div layoutId="activeDot" className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-orange" />
            )}
          </button>

        </div>

        {/* D. CLINICAL ABOUT US POPUP DIALOG */}
        <AnimatePresence>
          {showAboutDialog && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAboutDialog(false);
                setShowSql(false);
              }}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FFFDF0] rounded-[32px] border border-orange-100 p-5 w-full max-w-[350px] shadow-cocoa-floating space-y-4 max-h-[85%] overflow-y-auto scrollbar-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white border border-orange-100/50 rounded-2xl flex items-center justify-center p-1.5 shadow-xs shrink-0">
                    <FlourishCareLogo className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-brand-brown">Tentang Flourishcare App</h3>
                    <p className="text-[9px] text-brand-orange font-black tracking-wider">Tumbuh Kembang Optimal</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-brand-brown/85 font-semibold leading-relaxed">
                  <p>
                    Flourishcare App adalah aplikasi pendamping tumbuh kembang anak berbasis klinis, dirancang khusus untuk mempermudah Ayah & Bunda memantau milestones, skrining mandiri, resep stimulasi harian, hingga konsultasi langsung dengan dokter spesialis anak & psikolog anak secara terintegrasi.
                  </p>
                  <p className="text-[10px] text-brand-brown/50 border-t border-orange-100/40 pt-2.5">
                    &bull; Mitra Resmi Layanan Tumbuh Kembang Klinik FlourishCare<br />
                    &bull; Versi Aplikasi: v1.2.0 (Clinical Release)
                  </p>
                </div>

                {/* SUPABASE CONNECTION STATUS DRAWER */}
                <div className="border-t border-orange-100/40 pt-3 space-y-2">
                  <h4 className="font-extrabold text-xs text-brand-brown flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Status Supabase Database</span>
                  </h4>

                  {supabaseStatus ? (
                    <div className={`p-3 rounded-2xl text-[11px] font-semibold space-y-1 ${supabaseStatus.connected ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'}`}>
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span className={`w-2 h-2 rounded-full ${supabaseStatus.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        <span>{supabaseStatus.connected ? 'Terhubung & Aktif!' : 'Menunggu Setup Tabel'}</span>
                      </div>
                      <p className="opacity-90">
                        {supabaseStatus.connected 
                          ? 'Data tersimpan langsung secara real-time di Supabase Cloud!' 
                          : 'Koneksi API valid, silakan jalankan skrip SQL skema di Supabase SQL Editor Anda untuk mengaktifkan tabel.'}
                      </p>
                      <p className="text-[9px] opacity-75 font-mono">
                        Project ID: vtquhqdfyirccxdzmpyr
                      </p>

                      {!supabaseStatus.connected && (
                        <div className="pt-1.5">
                          <button
                            onClick={() => {
                              setShowSql(!showSql);
                            }}
                            className="text-[10px] font-bold text-amber-700 underline cursor-pointer hover:text-amber-800 block text-left"
                          >
                            {showSql ? 'Sembunyikan Skrip SQL Schema' : 'Tampilkan Skrip SQL Schema'}
                          </button>

                          {showSql && (
                            <div className="mt-2 space-y-1.5">
                              <pre className="p-2 bg-amber-900/10 rounded-lg text-[8px] font-mono overflow-x-auto max-h-[120px] select-all leading-normal whitespace-pre">
{`-- Salin skrip ini ke SQL Editor Supabase Anda:

CREATE TABLE IF NOT EXISTS app_profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_whatsapp TEXT,
  email TEXT,
  city TEXT,
  role TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_profiles (id, full_name, phone_whatsapp, email, city, role)
VALUES ('u_amanda', 'Amanda Kartika', '+628123456789', 'amanda.kartika@flourishcare.id', 'Jakarta Selatan', 'parent')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_children (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  expected_due_date TEXT,
  gender TEXT,
  photo_url TEXT,
  is_premature BOOLEAN DEFAULT FALSE,
  medical_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_children (id, parent_id, name, birth_date, gender, is_premature, medical_notes)
VALUES ('c_aiden', 'u_amanda', 'Aiden Syahputra', '2025-10-15', 'L', false, 'Alergi dingin ringan, perlu stimulasi motorik kasar lebih sering.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_growth_records (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  weight_kg NUMERIC(5,2) NOT NULL,
  height_cm NUMERIC(5,2) NOT NULL,
  head_circumference_cm NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_growth_records (id, child_id, date, weight_kg, height_cm, head_circumference_cm, notes)
VALUES 
  ('g_1', 'c_aiden', '2025-11-15', 3.8, 52, 36.5, 'Berat lahir normal, grafik KMS di area hijau.'),
  ('g_2', 'c_aiden', '2025-12-15', 4.5, 55, 38, 'Pertumbuhan linear sangat baik, mulai belajar tersenyum.'),
  ('g_3', 'c_aiden', '2026-01-15', 5.2, 58, 39.5, 'Kontrol leher semakin tegak.'),
  ('g_4', 'c_aiden', '2026-02-15', 6.0, 61, 41, 'Berat badan optimal.'),
  ('g_5', 'c_aiden', '2026-03-15', 6.8, 63.5, 42, 'Refleks motorik aktif.'),
  ('g_6', 'c_aiden', '2026-04-15', 7.4, 65.2, 43, 'Siap masuk tahap stimulasi merangkak.'),
  ('g_7', 'c_aiden', '2026-05-15', 8.1, 67, 44, 'Grafik tumbuh kembang stabil.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_child_milestones (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  achieved BOOLEAN DEFAULT TRUE,
  achieved_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_child_milestones (id, child_id, milestone_id, achieved, achieved_date)
VALUES 
  ('cm_1', 'c_aiden', 'motorik_halus_3', true, '2026-01-10'),
  ('cm_2', 'c_aiden', 'sosial_3', true, '2026-01-14')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_child_immunizations (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  immunization_id TEXT NOT NULL,
  given_date TEXT,
  proof_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_child_immunizations (id, child_id, immunization_id, given_date)
VALUES 
  ('ci_1', 'c_aiden', 'bcg_1', '2025-11-20'),
  ('ci_2', 'c_aiden', 'polio_1', '2025-11-20'),
  ('ci_3', 'c_aiden', 'dpt_1', '2025-12-15')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_screenings (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  age_month_at_test INTEGER NOT NULL,
  answers JSONB,
  score INTEGER,
  result TEXT,
  recommendation TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_screenings (id, child_id, type, age_month_at_test, answers, score, result, recommendation)
VALUES ('s_1', 'c_aiden', 'kpsp', 6, '{"q1":true,"q2":true,"q3":true,"q4":true,"q5":true,"q6":false,"q7":true,"q8":true,"q9":true,"q10":false}', 8, 'meragukan', 'Bunda disarankan melatih stimulasi motorik kasar secara berkala selama 2 minggu, lalu ulangi KPSP.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_questions (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  child_id TEXT,
  question_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  answer_text TEXT,
  answered_by TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);

INSERT INTO app_questions (id, parent_id, child_id, question_text, status, answer_text, answered_by, is_public, created_at, answered_at)
VALUES 
  ('q_seed_1', 'u_amanda', 'c_aiden', 'Bagaimana cara menstimulasi bayi 6 bulan yang belum bisa tengkurap sendiri secara lancar?', 'answered', 'Halo Ibu Amanda. Pada usia 6 bulan, stimulasi tummy-time terarah sangat penting. Sediakan matras datar, letakkan mainan berbunyi di depannya untuk menarik perhatian agar mendongak & menggerakkan badan. Anda juga bisa membantu mendorong bokongnya perlahan untuk mencontohkan gerakan berguling. Lakukan 3-5 kali sehari saat si kecil segar.', 'Ira Amanda, M.Psi., Psikolog', true, '2026-06-25T10:00:00Z', '2026-06-25T10:15:00Z'),
  ('q_seed_2', 'u_amanda', NULL, 'Anak umur 2 tahun sering tantrum kalau keinginannya tidak dituruti. Apakah ini normal?', 'answered', 'Halo Bunda. Sangat normal! Usia 2 tahun adalah fase eksplorasi tinggi ("terrible twos"). Saat tantrum, pastikan lingkungan aman, sejajarkan tinggi mata Anda, tenangkan diri Anda dulu, dan tawarkan pelukan empati ("Bunda tahu kamu kecewa"). Jangan mendebat saat ia emosi tinggi.', 'Ira Amanda, M.Psi., Psikolog', true, '2026-06-28T14:30:00Z', '2026-06-28T14:45:00Z')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_bookings (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  sub_service TEXT NOT NULL,
  package_name TEXT,
  therapist_id TEXT,
  therapist_name TEXT,
  scheduled_at TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'unpaid',
  midtrans_order_id TEXT,
  booking_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_bookings (id, parent_id, child_id, service_type, sub_service, package_name, therapist_id, therapist_name, scheduled_at, status, amount, payment_status, booking_code)
VALUES ('b_seed_1', 'u_amanda', 'c_aiden', 'onsite', 'Asesmen Tumbuh Kembang Psikolog', 'Sesi Tunggal (Evaluasi/Asesmen)', 'exp_ira', 'Ira Amanda, M.Psi., Psikolog', '2026-07-05T10:00', 'pending', 300000.00, 'unpaid', 'FC-PS-8924')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_notifications (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  deep_link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_notifications (id, parent_id, type, title, body, deep_link, read)
VALUES 
  ('n_seed_1', 'u_amanda', 'system', 'Selamat Datang di FlourishCare!', 'Kami siap menemani perjalanan tumbuh kembang si Kecil secara optimal & berbasis bukti klinis.', 'home', false),
  ('n_seed_2', 'u_amanda', 'screening', 'Hasil Skrining Aiden Selesai', 'Skrining KPSP 6 Bulan menunjukkan hasil "Meragukan". Lihat tips stimulasi dari terapis kami.', 'screenings', false)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_preferences (
  parent_id TEXT PRIMARY KEY REFERENCES app_profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  immunization_reminder BOOLEAN DEFAULT TRUE,
  milestone_reminder BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_preferences (parent_id, push_enabled, whatsapp_enabled, email_enabled, weekly_digest, immunization_reminder, milestone_reminder)
VALUES ('u_amanda', true, true, true, true, true, true)
ON CONFLICT (parent_id) DO NOTHING;`}
                              </pre>

                              <button
                                onClick={() => {
                                  const sqlText = `CREATE TABLE IF NOT EXISTS app_profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_whatsapp TEXT,
  email TEXT,
  city TEXT,
  role TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_profiles (id, full_name, phone_whatsapp, email, city, role)
VALUES ('u_amanda', 'Amanda Kartika', '+628123456789', 'amanda.kartika@flourishcare.id', 'Jakarta Selatan', 'parent')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_children (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  expected_due_date TEXT,
  gender TEXT,
  photo_url TEXT,
  is_premature BOOLEAN DEFAULT FALSE,
  medical_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_children (id, parent_id, name, birth_date, gender, is_premature, medical_notes)
VALUES ('c_aiden', 'u_amanda', 'Aiden Syahputra', '2025-10-15', 'L', false, 'Alergi dingin ringan, perlu stimulasi motorik kasar lebih sering.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_growth_records (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  weight_kg NUMERIC(5,2) NOT NULL,
  height_cm NUMERIC(5,2) NOT NULL,
  head_circumference_cm NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_growth_records (id, child_id, date, weight_kg, height_cm, head_circumference_cm, notes)
VALUES 
  ('g_1', 'c_aiden', '2025-11-15', 3.8, 52, 36.5, 'Berat lahir normal, grafik KMS di area hijau.'),
  ('g_2', 'c_aiden', '2025-12-15', 4.5, 55, 38, 'Pertumbuhan linear sangat baik, mulai belajar tersenyum.'),
  ('g_3', 'c_aiden', '2026-01-15', 5.2, 58, 39.5, 'Kontrol leher semakin tegak.'),
  ('g_4', 'c_aiden', '2026-02-15', 6.0, 61, 41, 'Berat badan optimal.'),
  ('g_5', 'c_aiden', '2026-03-15', 6.8, 63.5, 42, 'Refleks motorik aktif.'),
  ('g_6', 'c_aiden', '2026-04-15', 7.4, 65.2, 43, 'Siap masuk tahap stimulasi merangkak.'),
  ('g_7', 'c_aiden', '2026-05-15', 8.1, 67, 44, 'Grafik tumbuh kembang stabil.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_child_milestones (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  achieved BOOLEAN DEFAULT TRUE,
  achieved_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_child_milestones (id, child_id, milestone_id, achieved, achieved_date)
VALUES 
  ('cm_1', 'c_aiden', 'motorik_halus_3', true, '2026-01-10'),
  ('cm_2', 'c_aiden', 'sosial_3', true, '2026-01-14')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_child_immunizations (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  immunization_id TEXT NOT NULL,
  given_date TEXT,
  proof_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_child_immunizations (id, child_id, immunization_id, given_date)
VALUES 
  ('ci_1', 'c_aiden', 'bcg_1', '2025-11-20'),
  ('ci_2', 'c_aiden', 'polio_1', '2025-11-20'),
  ('ci_3', 'c_aiden', 'dpt_1', '2025-12-15')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_screenings (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  age_month_at_test INTEGER NOT NULL,
  answers JSONB,
  score INTEGER,
  result TEXT,
  recommendation TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_screenings (id, child_id, type, age_month_at_test, answers, score, result, recommendation)
VALUES ('s_1', 'c_aiden', 'kpsp', 6, '{"q1":true,"q2":true,"q3":true,"q4":true,"q5":true,"q6":false,"q7":true,"q8":true,"q9":true,"q10":false}', 8, 'meragukan', 'Bunda disarankan melatih stimulasi motorik kasar secara berkala selama 2 minggu, lalu ulangi KPSP.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_questions (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  child_id TEXT,
  question_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  answer_text TEXT,
  answered_by TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);

INSERT INTO app_questions (id, parent_id, child_id, question_text, status, answer_text, answered_by, is_public, created_at, answered_at)
VALUES 
  ('q_seed_1', 'u_amanda', 'c_aiden', 'Bagaimana cara menstimulasi bayi 6 bulan yang belum bisa tengkurap sendiri secara lancar?', 'answered', 'Halo Ibu Amanda. Pada usia 6 bulan, stimulasi tummy-time terarah sangat penting. Sediakan matras datar, letakkan mainan berbunyi di depannya untuk menarik perhatian agar mendongak & menggerakkan badan. Anda juga bisa membantu mendorong bokongnya perlahan untuk mencontohkan gerakan berguling. Lakukan 3-5 kali sehari saat si kecil segar.', 'Ira Amanda, M.Psi., Psikolog', true, '2026-06-25T10:00:00Z', '2026-06-25T10:15:00Z'),
  ('q_seed_2', 'u_amanda', NULL, 'Anak umur 2 tahun sering tantrum kalau keinginannya tidak dituruti. Apakah ini normal?', 'answered', 'Halo Bunda. Sangat normal! Usia 2 tahun adalah fase eksplorasi tinggi ("terrible twos"). Saat tantrum, pastikan lingkungan aman, sejajarkan tinggi mata Anda, tenangkan diri Anda dulu, dan tawarkan pelukan empati ("Bunda tahu kamu kecewa"). Jangan mendebat saat ia emosi tinggi.', 'Ira Amanda, M.Psi., Psikolog', true, '2026-06-28T14:30:00Z', '2026-06-28T14:45:00Z')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_bookings (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  sub_service TEXT NOT NULL,
  package_name TEXT,
  therapist_id TEXT,
  therapist_name TEXT,
  scheduled_at TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'unpaid',
  midtrans_order_id TEXT,
  booking_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_bookings (id, parent_id, child_id, service_type, sub_service, package_name, therapist_id, therapist_name, scheduled_at, status, amount, payment_status, booking_code)
VALUES ('b_seed_1', 'u_amanda', 'c_aiden', 'onsite', 'Asesmen Tumbuh Kembang Psikolog', 'Sesi Tunggal (Evaluasi/Asesmen)', 'exp_ira', 'Ira Amanda, M.Psi., Psikolog', '2026-07-05T10:00', 'pending', 300000.00, 'unpaid', 'FC-PS-8924')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_notifications (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  deep_link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_notifications (id, parent_id, type, title, body, deep_link, read)
VALUES 
  ('n_seed_1', 'u_amanda', 'system', 'Selamat Datang di FlourishCare!', 'Kami siap menemani perjalanan tumbuh kembang si Kecil secara optimal & berbasis bukti klinis.', 'home', false),
  ('n_seed_2', 'u_amanda', 'screening', 'Hasil Skrining Aiden Selesai', 'Skrining KPSP 6 Bulan menunjukkan hasil "Meragukan". Lihat tips stimulasi dari terapis kami.', 'screenings', false)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_preferences (
  parent_id TEXT PRIMARY KEY REFERENCES app_profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  immunization_reminder BOOLEAN DEFAULT TRUE,
  milestone_reminder BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_preferences (parent_id, push_enabled, whatsapp_enabled, email_enabled, weekly_digest, immunization_reminder, milestone_reminder)
VALUES ('u_amanda', true, true, true, true, true, true)
ON CONFLICT (parent_id) DO NOTHING;`;
                                  navigator.clipboard.writeText(sqlText);
                                  setCopiedSql(true);
                                  setTimeout(() => setCopiedSql(false), 2000);
                                }}
                                className="mt-1.5 w-full bg-amber-600 hover:bg-amber-700 text-white py-1 rounded-lg text-[9px] font-bold cursor-pointer text-center"
                              >
                                {copiedSql ? '✓ Berhasil Disalin!' : 'Salin Skrip SQL Schema'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-gray-50 text-gray-600 text-[11px] font-semibold flex items-center gap-1.5 border border-gray-200">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                      <span>Memeriksa status database...</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowAboutDialog(false);
                    setShowSql(false);
                  }}
                  className="w-full bg-brand-orange hover:bg-brand-orange/95 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm shadow-orange-100 cursor-pointer text-center"
                >
                  Tutup Informasi
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
