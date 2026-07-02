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

import { Child, UserProfile as Profile, GrowthRecord } from './types';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [latestGrowth, setLatestGrowth] = useState<GrowthRecord | null>(null);
  
  // Mobile App Tab Navigation
  // 'home' is the central mobile dashboard, and others are sub-pages
  const [activeTab, setActiveTab] = useState<string>('home');
  const [loading, setLoading] = useState(true);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  
  // For deep navigation triggers between tabs
  const [preSelectedService, setPreSelectedService] = useState('onsite');
  const [preSelectedTherapist, setPreSelectedTherapist] = useState('exp_ira');

  // Realistic Native Clock State
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    fetchInitialData();
    
    // Update Clock every minute to look completely like a real native phone
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, '0');
      let minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const profRes = await fetch('/api/profile');
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
      }

      // 2. Fetch Children List
      const childRes = await fetch('/api/children');
      if (childRes.ok) {
        const childrenData = await childRes.json();
        setChildren(childrenData);
        if (childrenData.length > 0) {
          setActiveChild(childrenData[0]);
          fetchLatestGrowth(childrenData[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestGrowth = async (childId: string) => {
    try {
      const growthRes = await fetch(`/api/growth/${childId}`);
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

  // If no children logged, force the beautiful onboarding questionnaire flow
  if (children.length === 0 || !activeChild) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const ageInMonths = calculateAgeInMonths(activeChild.birthDate);

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
      default: return 'FlourishCare';
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
                            FlourishCare
                          </h1>
                          <p className="text-[9px] text-brand-yellow font-extrabold tracking-widest leading-none">Rumah Tumbuh Kembang</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <span className="block text-[10px] text-orange-100/90 font-semibold leading-tight">Halo Bunda</span>
                          <span className="block text-xs font-extrabold text-[#FFFDE9] leading-none">{profile?.fullName.split(' ')[0] || 'Amanda'}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full border border-white/25 bg-white/10 shrink-0 flex items-center justify-center">
                          <User className="w-4.5 h-4.5 text-brand-yellow" />
                        </div>
                      </div>
                    </div>

                    {/* Horizontal Children Profiles Switcher Inside Cocoa Header */}
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

                    {/* Integrated Signature Growth Arc inside Cocoa Card */}
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
                          onClick={() => setActiveTab('growth')}
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
                          onClick={() => setActiveTab('milestone')}
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
                          onClick={() => setActiveTab('vaccine')}
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
                          onClick={() => setActiveTab('screening')}
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
                          onClick={() => setActiveTab('stimulasi')}
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
                          onClick={() => setActiveTab('qa')}
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
                          onClick={() => setActiveTab('library')}
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
                          onClick={() => setActiveTab('booking')}
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
                            <p className="text-[8px] text-brand-brown/45 font-bold line-clamp-1 mt-1">FlourishCare ID</p>
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
                        FlourishCare &copy; 2026. Sesuai Panduan Klinis Tumbuh Kembang Indonesia.
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
                        FlourishCare &bull; {activeChild.name}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Render of Active Component Tab inside the App Bezel */}
                  <div className="flex-1 px-4 py-5 bg-[#FFFDF0]">
                    {activeTab === 'growth' && (
                      <GrowthChart child={activeChild} onRefreshStats={() => fetchLatestGrowth(activeChild.id)} />
                    )}
                    {activeTab === 'milestone' && (
                      <MilestoneTracker child={activeChild} onNavigateToScreening={() => setActiveTab('screening')} />
                    )}
                    {activeTab === 'vaccine' && (
                      <ImmunizationScheduler child={activeChild} />
                    )}
                    {activeTab === 'screening' && (
                      <ScreeningHub child={activeChild} onNavigateToBooking={handleNavigateToBooking} />
                    )}
                    {activeTab === 'stimulasi' && (
                      <AktivitasStimulasi child={activeChild} />
                    )}
                    {activeTab === 'qa' && (
                      <TanyaAhli child={activeChild} />
                    )}
                    {activeTab === 'library' && (
                      <ContentLibrary />
                    )}
                    {activeTab === 'booking' && (
                      <BookingHub 
                        child={activeChild} 
                        preSelectedService={preSelectedService} 
                        preSelectedTherapistId={preSelectedTherapist} 
                      />
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
            onClick={() => setActiveTab('home')}
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
            onClick={() => setActiveTab('milestone')}
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
            onClick={() => setActiveTab('stimulasi')}
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
            onClick={() => setActiveTab('qa')}
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
            onClick={() => setActiveTab('booking')}
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
              onClick={() => setShowAboutDialog(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FFFDF0] rounded-[32px] border border-orange-100 p-6 w-full max-w-[340px] shadow-cocoa-floating space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white border border-orange-100/50 rounded-2xl flex items-center justify-center p-1.5 shadow-xs shrink-0">
                    <FlourishCareLogo className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-brand-brown">Tentang FlourishCare</h3>
                    <p className="text-[9px] text-brand-orange font-black tracking-wider">Tumbuh Kembang Optimal</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-brand-brown/85 font-semibold leading-relaxed">
                  <p>
                    FlourishCare adalah aplikasi pendamping tumbuh kembang anak berbasis klinis, dirancang khusus untuk mempermudah Ayah & Bunda memantau milestones, skrining mandiri, resep stimulasi harian, hingga konsultasi langsung dengan dokter spesialis anak & psikolog anak secara terintegrasi.
                  </p>
                  <p className="text-[10px] text-brand-brown/50 border-t border-orange-100/40 pt-2.5">
                    &bull; Mitra Resmi Layanan Tumbuh Kembang Klinik FlourishCare<br />
                    &bull; Versi Aplikasi: v1.2.0 (Clinical Release)
                  </p>
                </div>

                <button
                  onClick={() => setShowAboutDialog(false)}
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
