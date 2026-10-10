import React, { useId } from 'react';
import { motion } from 'motion/react';
import { cx } from '../../lib/cx';
import { haptic } from '../../lib/haptics';

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: NoInfer<T>) => void;
  options: { value: NoInfer<T>; label: React.ReactNode }[];
  className?: string;
  size?: 'md' | 'sm';
}

/** iOS segmented control with a sliding white thumb. */
export default function Segmented<T extends string>({ value, onChange, options, className, size = 'md' }: SegmentedProps<T>) {
  const id = useId();
  return (
    <div
      role="tablist"
      className={cx('relative flex p-1 rounded-full bg-fill border border-line', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (!active) haptic('light');
              onChange(opt.value);
            }}
            className={cx(
              'relative flex-1 rounded-full whitespace-nowrap transition-colors duration-200',
              size === 'md' ? 'h-10 text-[15px] px-2' : 'h-8 text-[14px] px-2',
              active ? 'text-ink' : 'text-mute',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-white shadow-card border border-line"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
