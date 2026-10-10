import React from 'react';
import { motion } from 'motion/react';
import { Baby, Check, Plus } from 'lucide-react';
import Sheet from '../ui/Sheet';
import ChildAvatar from '../child/ChildAvatar';
import { profileAgeLabel } from '../../lib/pregnancy';
import { useStore } from '../../lib/store';
import { useNav } from '../../lib/nav';
import { ageLabel } from '../../lib/format';
import { haptic } from '../../lib/haptics';

export default function ChildSwitcherSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { children, activeChild, setActiveChild } = useStore();
  const nav = useNav();

  return (
    <Sheet open={open} onClose={onClose} title="Pilih profil" subtitle="Data di aplikasi mengikuti profil yang dipilih.">
      <div className="space-y-2.5 pt-1">
        {children.map((c) => {
          const active = c.id === activeChild?.id;
          return (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                haptic('light');
                setActiveChild(c.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 p-3.5 rounded-[22px] border text-left transition-colors ${
                active ? 'bg-brand-orange-tint border-brand-orange' : 'bg-white border-line shadow-card'
              }`}
            >
              <ChildAvatar child={c} size={52} />
              <span className="flex-1 min-w-0">
                <span className="block text-[18px] text-ink truncate">{c.name}</span>
                <span className="block text-[14px] text-mute">{profileAgeLabel(c, ageLabel)}</span>
              </span>
              {active && (
                <span className="w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center">
                  <Check className="w-4 h-4" strokeWidth={2.6} />
                </span>
              )}
            </motion.button>
          );
        })}
        {children.length < 5 && (
          <div className="grid grid-cols-2 gap-2.5">
            {([
              { mode: 'child' as const, label: 'Tambah anak', icon: Plus },
              { mode: 'pregnancy' as const, label: 'Sedang hamil', icon: Baby },
            ]).map((opt) => (
              <motion.button
                key={opt.mode}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  window.setTimeout(() => nav.push({ name: 'onboarding', mode: opt.mode }), 180);
                }}
                className="flex items-center gap-2.5 p-3.5 rounded-[22px] border border-dashed border-line-2 text-left text-ink-2"
              >
                <span className="w-10 h-10 rounded-full bg-fill flex items-center justify-center shrink-0">
                  <opt.icon className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <span className="text-[16px] leading-tight">{opt.label}</span>
              </motion.button>
            ))}
          </div>
        )}
        {children.length >= 5 && <p className="text-[14px] text-mute text-center px-4">Maksimal 5 profil dalam satu akun.</p>}
      </div>
    </Sheet>
  );
}
