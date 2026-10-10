import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import ChildAvatar from './ChildAvatar';
import ChildSwitcherSheet from '../sheets/ChildSwitcherSheet';
import { useStore } from '../../lib/store';
import { ageLabel, firstName } from '../../lib/format';
import { profileAgeLabel } from '../../lib/pregnancy';
import { haptic } from '../../lib/haptics';

/** Compact "who am I looking at" switcher shown at the top of the pillar screens */
export default function ChildChip({ className }: { className?: string }) {
  const { activeChild } = useStore();
  const [open, setOpen] = useState(false);
  if (!activeChild) return null;
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          haptic('light');
          setOpen(true);
        }}
        className={`flex items-center gap-2.5 bg-white rounded-full border border-line shadow-card pl-1.5 pr-3.5 py-1.5 max-w-full ${className ?? ''}`}
        aria-label={`Ganti profil, saat ini ${activeChild.name}`}
      >
        <ChildAvatar child={activeChild} size={36} />
        <span className="min-w-0 text-left">
          <span className="block text-[15px] leading-tight truncate">{firstName(activeChild.name)}</span>
          <span className="block text-[12.5px] text-mute leading-tight truncate">{profileAgeLabel(activeChild, ageLabel)}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-mute shrink-0" strokeWidth={2} />
      </motion.button>
      <ChildSwitcherSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
