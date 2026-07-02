import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Video, HelpCircle, ArrowRight, Sparkles, ShieldAlert, Award, AlertCircle } from 'lucide-react';
import { Child, ChildMilestone, MilestoneReference, MilestoneDomain } from '../types';
import { MILESTONES_SEED } from '../data/seedData';

interface MilestoneTrackerProps {
  child: Child;
  onNavigateToScreening: () => void;
}

export default function MilestoneTracker({ child, onNavigateToScreening }: MilestoneTrackerProps) {
  const [achievedMilestones, setAchievedMilestones] = useState<ChildMilestone[]>([]);
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Calculate child's current age in months
  const calculateAgeInMonths = (birthDateStr: string): number => {
    const birth = new Date(birthDateStr);
    const now = new Date(); // assume current time 2026-07-01
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.4375);
  };

  const ageInMonths = calculateAgeInMonths(child.birthDate);

  // 2. Set default active age range tab based on child's current age
  useEffect(() => {
    let range = '03';
    if (ageInMonths <= 3) range = '03';
    else if (ageInMonths <= 6) range = '46';
    else if (ageInMonths <= 9) range = '79';
    else if (ageInMonths <= 12) range = '1012';
    else if (ageInMonths <= 18) range = '1318';
    else if (ageInMonths <= 24) range = '1924';
    else if (ageInMonths <= 36) range = '2436';
    else if (ageInMonths <= 60) range = '3660';
    else range = '6084';
    
    setSelectedAgeRange(range);
    fetchChildMilestones();
  }, [child.id]);

  const fetchChildMilestones = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/milestones/${child.id}`);
      if (response.ok) {
        const data = await response.json();
        setAchievedMilestones(data);
      }
    } catch (err) {
      console.error('Failed to load child milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Match seed milestones based on selected tab range
  const getFilteredMilestones = (): MilestoneReference[] => {
    return MILESTONES_SEED.filter((ref) => {
      switch (selectedAgeRange) {
        case '03': return ref.ageMonthMin === 0 && ref.ageMonthMax === 3;
        case '46': return ref.ageMonthMin === 4 && ref.ageMonthMax === 6;
        case '79': return ref.ageMonthMin === 7 && ref.ageMonthMax === 9;
        case '1012': return ref.ageMonthMin === 10 && ref.ageMonthMax === 12;
        case '1318': return ref.ageMonthMin === 13 && ref.ageMonthMax === 18;
        case '1924': return ref.ageMonthMin === 19 && ref.ageMonthMax === 24;
        case '2436': return ref.ageMonthMin === 25 && ref.ageMonthMax === 36;
        case '3660': return ref.ageMonthMin === 37 && ref.ageMonthMax === 60;
        case '6084': return ref.ageMonthMin === 61 && ref.ageMonthMax === 84;
        default: return false;
      }
    });
  };

  const currentMilestones = getFilteredMilestones();

  // 4. Toggle milestone check state
  const handleToggleMilestone = async (milestoneId: string, currentChecked: boolean) => {
    try {
      const response = await fetch('/api/milestones/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: child.id,
          milestoneId,
          achieved: !currentChecked
        })
      });

      if (response.ok) {
        fetchChildMilestones();
      }
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
    }
  };

  const isAchieved = (milestoneId: string): boolean => {
    return achievedMilestones.some(m => m.milestoneId === milestoneId && m.achieved);
  };

  // Determine if there is any critical alert (Aiden is 18m, if any 13-18m language milestone is unchecked)
  const isLanguageAtRisk = () => {
    if (ageInMonths >= 15 && selectedAgeRange === '1318') {
      const langItems = currentMilestones.filter(m => m.domain === 'bahasa');
      const uncheckedLang = langItems.filter(m => !isAchieved(m.id));
      return uncheckedLang.length > 0;
    }
    return false;
  };

  const isRiskAlert = isLanguageAtRisk();

  const getDomainLabel = (domain: MilestoneDomain) => {
    switch (domain) {
      case 'motorik_kasar': return 'Motorik Kasar';
      case 'motorik_halus': return 'Motorik Halus';
      case 'bahasa': return 'Bicara dan Bahasa';
      case 'sosial_emosional': return 'Sosial Emosional';
    }
  };

  const getDomainColor = (domain: MilestoneDomain) => {
    switch (domain) {
      case 'motorik_kasar': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'motorik_halus': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'bahasa': return 'bg-orange-50 text-brand-orange border-orange-100';
      case 'sosial_emosional': return 'bg-emerald-50 text-semantic-success border-emerald-100';
    }
  };

  return (
    <div className="w-full font-sans space-y-4">
      
      {/* Mini info badge */}
      <div className="bg-orange-50/50 border border-orange-100/30 rounded-2xl p-3 flex gap-2.5 items-start">
        <Award className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold text-brand-brown/80 leading-relaxed">
          Ceklis pencapaian tumbuh kembang {child.name} berdasarkan usia koreksi saat ini: <strong className="text-brand-orange">{ageInMonths} Bulan</strong>. Ceklis semua pencapaian yang sudah dikuasai.
        </p>
      </div>

      {/* Age Category Filter Tabs */}
      <div className="flex overflow-x-auto gap-1.5 pb-2 scrollbar-none">
        {[
          { key: '03', label: '0-3 Bln' },
          { key: '46', label: '4-6 Bln' },
          { key: '79', label: '7-9 Bln' },
          { key: '1012', label: '10-12 Bln' },
          { key: '1318', label: '13-18 Bln' },
          { key: '1924', label: '19-24 Bln' },
          { key: '2436', label: '2-3 Thn' },
          { key: '3660', label: '3-5 Thn' },
          { key: '6084', label: '5-7 Thn' }
        ].map((tab) => {
          const isCurrentAge = (
            (tab.key === '03' && ageInMonths <= 3) ||
            (tab.key === '46' && ageInMonths > 3 && ageInMonths <= 6) ||
            (tab.key === '79' && ageInMonths > 6 && ageInMonths <= 9) ||
            (tab.key === '1012' && ageInMonths > 9 && ageInMonths <= 12) ||
            (tab.key === '1318' && ageInMonths > 12 && ageInMonths <= 18) ||
            (tab.key === '1924' && ageInMonths > 18 && ageInMonths <= 24) ||
            (tab.key === '2436' && ageInMonths > 24 && ageInMonths <= 36) ||
            (tab.key === '3660' && ageInMonths > 36 && ageInMonths <= 60) ||
            (tab.key === '6084' && ageInMonths > 60)
          );
          
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedAgeRange(tab.key)}
              className={`px-2.5 py-1.5 text-[9px] font-black rounded-lg whitespace-nowrap border cursor-pointer transition-colors ${
                selectedAgeRange === tab.key
                  ? 'bg-brand-orange text-white border-brand-orange shadow-xs'
                  : isCurrentAge
                    ? 'bg-orange-50 text-brand-orange border-orange-200 ring-1 ring-orange-200'
                    : 'bg-white text-brand-brown/60 border-orange-100/60 hover:bg-orange-50/10'
              }`}
            >
              {tab.label} {isCurrentAge && '★'}
            </button>
          );
        })}
      </div>

      {/* Main List & Active Video / Alert */}
      <div className="flex flex-col gap-4">
        
        {/* Active Video Player */}
        {activeVideoUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-brown text-white p-3 rounded-2xl space-y-2 shadow-md border border-orange-900/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-orange-200 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 animate-pulse" /> Video Contoh Stimulasi
              </span>
              <button 
                onClick={() => setActiveVideoUrl(null)}
                className="text-[9px] font-black bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded"
              >
                Tutup
              </button>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10">
              <iframe
                title="Tutorial Video"
                width="100%"
                height="100%"
                src={activeVideoUrl}
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>
        )}

        {/* Milestones Checklists (Vertical stack always for full reading width) */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[9px] text-brand-brown/50 font-black tracking-wider">CEKLIS TUGAS TUMBUH KEMBANG</span>
          </div>

          {loading ? (
            <div className="py-6 text-center text-[10px] text-brand-brown/40 font-bold">Memuat ceklis...</div>
          ) : currentMilestones.length === 0 ? (
            <div className="py-6 text-center text-[10px] text-brand-brown/40 border border-dashed rounded-xl">
              Belum ada data referensi milestone untuk kategori ini.
            </div>
          ) : (
            currentMilestones.map((ref) => {
              const checked = isAchieved(ref.id);
              return (
                <div 
                  key={ref.id}
                  className={`p-3 rounded-2xl border flex gap-3 transition-all ${
                    checked 
                      ? 'border-emerald-100 bg-emerald-50/15' 
                      : 'border-orange-100/20 bg-white shadow-cocoa-resting/10'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <button
                    onClick={() => handleToggleMilestone(ref.id, checked)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer ${
                      checked 
                        ? 'border-semantic-success bg-semantic-success text-white' 
                        : 'border-orange-200 hover:border-brand-orange bg-white'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 stroke-[4px]" />}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Domain Badge */}
                    <span className={`inline-block px-1.5 py-0.5 text-[8px] font-black rounded border uppercase tracking-wider ${getDomainColor(ref.domain)}`}>
                      {getDomainLabel(ref.domain)}
                    </span>
                    <p className={`text-[10.5px] font-bold leading-normal text-brand-brown ${checked ? 'line-through opacity-50' : ''}`}>
                      {ref.description}
                    </p>

                    {/* Tutorial Video Link */}
                    {ref.exampleVideoUrl && (
                      <button
                        onClick={() => setActiveVideoUrl(ref.exampleVideoUrl || null)}
                        className="text-[9px] font-black text-brand-orange hover:opacity-80 flex items-center gap-0.5 cursor-pointer pt-0.5"
                      >
                        <Video className="w-3 h-3" /> Lihat Video Contoh &rarr;
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Smart Interactive Alerts */}
        <div className="space-y-3">
          
          {/* Critical Alert Card */}
          {isRiskAlert ? (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-red-50/80 border border-red-100 text-semantic-danger space-y-2 shadow-xs"
            >
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-semantic-danger shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-[11px] text-red-800">Alert Tumbuh Kembang: Kontak Bahasa</h4>
                  <p className="text-[10px] text-brand-brown/85 leading-relaxed mt-0.5">
                    {child.name} saat ini berusia {ageInMonths} Bulan, namun tugas <strong>Bicara dan Bahasa</strong> belum ditandai tercapai.
                  </p>
                </div>
              </div>
              <div className="p-2 bg-white/90 rounded-xl border border-red-50 text-[9px] text-brand-brown leading-relaxed font-semibold">
                <strong>Rekomendasi Ahli:</strong> Keadaan ini berisiko mengarah ke <em>Speech Delay</em>. Kami menyarankan Bunda segera menjalankan instrumen <strong>Skrining KPSP Mandiri</strong>.
              </div>
              <button
                onClick={onNavigateToScreening}
                className="w-full bg-semantic-danger text-white hover:bg-red-700 py-2 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                Mulai Skrining KPSP Sekarang <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>
          ) : (
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/40 text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-spin" />
                <h4 className="font-bold text-[11px] text-emerald-900">Status Perkembangan Optimal</h4>
              </div>
              <p className="text-[10px] text-brand-brown/80 leading-relaxed font-semibold">
                Secara umum {child.name} telah melengkapi tugas sensorik, motorik halus, dan sosialisasi di usianya. Tetap lakukan stimulus harian secara rutin!
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
