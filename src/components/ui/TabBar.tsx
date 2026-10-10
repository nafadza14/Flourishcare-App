import React from 'react';
import { motion } from 'motion/react';
import { ClipboardCheck, House, Sprout, User, type LucideIcon } from 'lucide-react';
import { cx } from '../../lib/cx';
import { haptic } from '../../lib/haptics';
import type { TabKey } from '../../lib/nav';

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'home', label: 'Beranda', icon: House },
  { key: 'track', label: 'Pantau', icon: Sprout },
  { key: 'screen', label: 'Skrining', icon: ClipboardCheck },
  { key: 'account', label: 'Akun', icon: User },
];

/**
 * Floating pill tab bar. The active tab expands into an orange pill with its name,
 * so the pillars (Pantau, Skrining) are recognisable without a label row.
 */
export default function TabBar({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav
      className="absolute inset-x-0 z-40 flex justify-center pointer-events-none"
      style={{ bottom: 'calc(var(--sab) + 6px)' }}
      aria-label="Navigasi utama"
    >
      <motion.div layout className="pointer-events-auto glass-white rounded-full shadow-float border border-white/80 p-[6px] flex items-center gap-1">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const Icon = tab.icon;
          return (
            <motion.button
              layout
              key={tab.key}
              onClick={() => {
                if (!isActive) haptic('light');
                onChange(tab.key);
              }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              transition={{ type: 'spring', stiffness: 520, damping: 38 }}
              className={cx('relative h-[54px] rounded-full flex items-center justify-center', isActive ? 'px-[18px] gap-2' : 'w-[54px]')}
            >
              {isActive && (
                <motion.span
                  layoutId="tab-active"
                  className="absolute inset-0 rounded-full bg-orange-gradient shadow-orange"
                  transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                />
              )}
              <motion.span layout="position" className="relative z-10 flex items-center">
                <Icon
                  className={cx('w-[23px] h-[23px] transition-colors duration-200', isActive ? 'text-white' : 'text-ink-2')}
                  strokeWidth={isActive ? 2 : 1.6}
                />
              </motion.span>
              {isActive && (
                <motion.span
                  layout="position"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06, duration: 0.2 }}
                  className="relative z-10 text-[15px] font-medium text-white whitespace-nowrap"
                >
                  {tab.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </nav>
  );
}
