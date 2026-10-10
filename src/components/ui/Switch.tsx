import React from 'react';
import { motion } from 'motion/react';
import { cx } from '../../lib/cx';
import { haptic } from '../../lib/haptics';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** iOS toggle switch, brand orange when on. */
export default function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        haptic('light');
        onChange(!checked);
      }}
      className={cx(
        'relative w-[51px] h-[31px] rounded-full p-[2px] shrink-0 transition-colors duration-300 flex',
        checked ? 'bg-brand-orange justify-end' : 'bg-[#E6DED6] justify-start',
        disabled && 'opacity-50',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 35 }}
        className="w-[27px] h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.12)]"
      />
    </button>
  );
}
