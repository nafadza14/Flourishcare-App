import React from 'react';
import { motion } from 'motion/react';
import { House, Smile, Syringe, User, type LucideIcon } from 'lucide-react';
import { cx } from '../../lib/cx';
import { haptic } from '../../lib/haptics';
import type { TabKey } from '../../lib/nav';

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'home', label: 'Beranda', icon: House },
  { key: 'child', label: 'Si Kecil', icon: Smile },
  { key: 'vaccine', label: 'Imunisasi', icon: Syringe },
  { key: 'account', label: 'Akun', icon: User },
];

/** Floating pill tab bar from the reference: active tab sits in an orange circle. */
export default function TabBar({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav
      className="absolute inset-x-0 z-40 flex justify-center pointer-events-none"
      style={{ bottom: 'calc(var(--sab) + 6px)' }}
      aria-label="Navigasi utama"
    >
      <div className="pointer-events-auto glass-white rounded-full shadow-float border border-white/80 p-[7px] flex items-center gap-1.5">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (!isActive) haptic('light');
                onChange(tab.key);
              }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative w-[58px] h-[58px] rounded-full flex items-center justify-center"
            >
              {isActive && (
                <motion.span
                  layoutId="tab-active"
                  className="absolute inset-0 rounded-full bg-orange-gradient shadow-orange"
                  transition={{ type: 'spring', stiffness: 520, damping: 36 }}
                />
              )}
              <motion.span
                className="relative z-10"
                animate={{ scale: isActive ? 1.06 : 1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 24 }}
              >
                <Icon
                  className={cx('w-[24px] h-[24px] transition-colors duration-200', isActive ? 'text-white' : 'text-ink-2')}
                  strokeWidth={isActive ? 2 : 1.6}
                />
              </motion.span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
