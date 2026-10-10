import React from 'react';
import { motion } from 'motion/react';
import { Check, Plus } from 'lucide-react';
import Sheet from '../ui/Sheet';
import { KidAvatar } from '../ui/Avatar';
import { useStore } from '../../lib/store';
import { useNav } from '../../lib/nav';
import { ageLabel } from '../../lib/format';
import { haptic } from '../../lib/haptics';

export default function ChildSwitcherSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { children, activeChild, setActiveChild } = useStore();
  const nav = useNav();

  return (
    <Sheet open={open} onClose={onClose} title="Pilih si Kecil" subtitle="Data di aplikasi mengikuti anak yang dipilih.">
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
              <KidAvatar gender={c.gender} size={52} />
              <span className="flex-1 min-w-0">
                <span className="block text-[18px] text-ink truncate">{c.name}</span>
                <span className="block text-[14px] text-mute">{ageLabel(c.birthDate)}</span>
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
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onClose();
              window.setTimeout(() => nav.push({ name: 'onboarding' }), 180);
            }}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-[22px] border border-dashed border-line-2 text-left text-ink-2"
          >
            <span className="w-[52px] h-[52px] rounded-full bg-fill flex items-center justify-center">
              <Plus className="w-6 h-6" strokeWidth={1.8} />
            </span>
            <span className="text-[17px]">Tambah anak</span>
          </motion.button>
        )}
      </div>
    </Sheet>
  );
}
