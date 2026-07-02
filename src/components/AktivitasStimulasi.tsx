import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, Trophy, Clock, Heart, Award, Flame } from 'lucide-react';
import { Child, Activity } from '../types';
import { ACTIVITIES_SEED } from '../data/seedData';

interface AktivitasStimulasiProps {
  child: Child;
}

export default function AktivitasStimulasi({ child }: AktivitasStimulasiProps) {
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [streak, setStreak] = useState(4); // Seed with standard 4 days streak
  const [loading, setLoading] = useState(false);

  const calculateAgeInMonths = (birthDateStr: string): number => {
    const birth = new Date(birthDateStr);
    const now = new Date(); // assume current time 2026-07-01
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.4375);
  };

  const ageInMonths = calculateAgeInMonths(child.birthDate);

  // Filter activities based on child's age category
  const getRelevantActivities = (): Activity[] => {
    return ACTIVITIES_SEED.filter((act) => {
      return ageInMonths >= act.ageMonthMin && ageInMonths <= act.ageMonthMax;
    });
  };

  const activeActivities = getRelevantActivities();

  const handleToggleActivity = (activityId: string) => {
    if (completedActivities.includes(activityId)) {
      setCompletedActivities(prev => prev.filter(id => id !== activityId));
    } else {
      setCompletedActivities(prev => [...prev, activityId]);
      // Increment streak if all activities of the day are done (simulation)
      if (completedActivities.length + 1 === activeActivities.length) {
        setStreak(prev => prev + 1);
      }
    }
  };

  return (
    <div className="w-full font-sans space-y-4">
      
      {/* Mini info badge with streak */}
      <div className="bg-orange-50/50 border border-orange-100/30 rounded-2xl p-3 flex gap-2.5 items-center justify-between shadow-xs">
        <div className="flex gap-2 items-start min-w-0">
          <Sparkles className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold text-brand-brown/80 leading-relaxed min-w-0">
            Resep Stimulasi {child.name} di usia <strong className="text-brand-orange">{ageInMonths} Bulan</strong>. Bermain rutin melatih sinapsis otak anak.
          </p>
        </div>
        
        {/* Compact Streak Badge */}
        <div className="flex items-center gap-1 bg-orange-100/60 px-2 py-0.5 rounded-lg border border-orange-200/50 shrink-0">
          <Flame className="w-3.5 h-3.5 text-brand-orange fill-brand-orange animate-pulse" />
          <span className="text-[9px] font-black text-brand-brown">{streak} Hari</span>
        </div>
      </div>

      {/* Main Content Layout (Simple Stack for maximum width readability) */}
      <div className="flex flex-col gap-4">
        
        {/* Today's Tasks List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[9px] text-brand-brown/50 font-black tracking-wider">MISI BERMAIN HARI INI</span>
            <span className="text-[9px] text-brand-brown/60 font-black">
              PROGRES: <strong className="text-brand-orange">{completedActivities.length} / {activeActivities.length}</strong> Selesai
            </span>
          </div>

          <div className="space-y-3">
            {activeActivities.length === 0 ? (
              <div className="py-8 text-center text-[10px] text-brand-brown/40 border border-dashed rounded-xl">
                Belum ada resep stimulasi spesifik untuk kategori usia ini.
              </div>
            ) : (
              activeActivities.map((act) => {
                const isDone = completedActivities.includes(act.id);
                return (
                  <div 
                    key={act.id}
                    className={`p-3.5 rounded-2xl border flex gap-3 transition-all ${
                      isDone 
                        ? 'border-emerald-100 bg-emerald-50/15' 
                        : 'border-orange-100/20 bg-white shadow-cocoa-resting/10'
                    }`}
                  >
                    {/* Check Action Button */}
                    <button
                      onClick={() => handleToggleActivity(act.id)}
                      className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all ${
                        isDone 
                          ? 'border-semantic-success bg-semantic-success text-white' 
                          : 'border-orange-200 hover:border-brand-orange bg-white'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3 h-3 text-white fill-emerald-600 stroke-none" />}
                    </button>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-orange-100/40 text-brand-orange text-[8px] font-black rounded border border-orange-100/30 uppercase tracking-wider">
                          {act.domain.replace('_', ' ')}
                        </span>
                        <div className="text-[8px] text-brand-brown/50 font-black flex items-center gap-0.5 uppercase tracking-wider">
                          <Clock className="w-3 h-3 text-brand-brown/40" /> 15-20 Menit
                        </div>
                      </div>

                      <h4 className={`text-[12px] font-extrabold text-brand-brown ${isDone ? 'line-through opacity-50' : ''}`}>
                        {act.title}
                      </h4>

                      <div className={`space-y-1 ${isDone ? 'opacity-55' : ''}`}>
                        <div className="text-[8.5px] font-black text-brand-brown/40 tracking-wider">LANGKAH BERMAIN:</div>
                        <ol className="list-decimal list-inside text-[10px] text-brand-brown/75 space-y-0.5 pl-0.5 font-bold leading-relaxed">
                          {act.steps.map((step, idx) => (
                            <li key={idx} className="leading-snug">{step}</li>
                          ))}
                        </ol>
                      </div>

                      {/* Expected outcome */}
                      <div className="p-2 bg-orange-50/35 rounded-xl border border-orange-100/10 text-[9.5px] text-brand-brown/75 leading-relaxed font-semibold">
                        <strong className="text-brand-orange">Tujuan:</strong> {act.rationale}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Rewards & Tips Stack */}
        <div className="space-y-3">
          
          {/* Milestone trophy progress */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-orange-100/40 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-100/80 text-brand-orange rounded-full flex items-center justify-center">
                <Trophy className="w-4 h-4 fill-brand-orange" />
              </div>
              <h4 className="font-extrabold text-brand-brown text-[11px]">Badge Level: Bunda Hebat!</h4>
            </div>
            
            <p className="text-[9.5px] text-brand-brown/70 leading-relaxed font-bold">
              Selesaikan misi stimulasi <strong>3 hari berturut-turut</strong> lagi untuk mengklaim badge penghargaan digital baru dari Dokter Anak FlourishCare.
            </p>
            
            {/* progress line */}
            <div className="w-full bg-orange-200/40 h-1.5 rounded-full overflow-hidden">
              <div className="bg-brand-orange h-full" style={{ width: '75%' }} />
            </div>
          </div>

          {/* Quick Doctor Tip Card */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100/40 text-emerald-800 flex gap-2.5 items-start">
            <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-[10px]">Pesan Klinis Dokter Anak</h4>
              <p className="text-[9px] text-brand-brown/80 leading-relaxed font-bold">
                "Melakukan stimulasi otot motorik kasar 10-15 menit sehari di rumah jauh lebih bermakna bagi pembentukan sinapsis otak anak dibanding sesi terapi 2 jam yang hanya dilakukan seminggu sekali."
              </p>
              <div className="text-[8.5px] text-brand-brown/50 font-bold italic pt-0.5">- Dr. Siti Nuraini, Sp.A</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
