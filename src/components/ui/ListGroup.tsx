import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cx } from '../../lib/cx';
import { haptic } from '../../lib/haptics';

/** iOS inset grouped list */
export function ListGroup({ title, footer, children, className }: { title?: string; footer?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx('px-5', className)}>
      {title && <h3 className="text-[14px] text-mute uppercase tracking-[0.06em] px-1 mb-2 font-normal">{title}</h3>}
      <div className="bg-white rounded-[22px] border border-line shadow-card overflow-hidden divide-y divide-line">{children}</div>
      {footer && <p className="text-[13px] text-mute px-1 mt-2 leading-relaxed">{footer}</p>}
    </section>
  );
}

const iconTones: Record<string, string> = {
  orange: 'bg-brand-orange-soft text-brand-orange-deep',
  green: 'bg-semantic-success-soft text-semantic-success',
  amber: 'bg-semantic-warning-soft text-[#9A6A12]',
  red: 'bg-semantic-danger-soft text-semantic-danger',
  gray: 'bg-fill text-ink-2',
  brown: 'bg-[#F5ECE7] text-brand-brown',
};

interface ListRowProps {
  icon?: LucideIcon;
  iconTone?: keyof typeof iconTones;
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  value?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  chevron?: boolean;
  destructive?: boolean;
  className?: string;
}

export function ListRow({ icon: Icon, iconTone = 'orange', leading, title, subtitle, value, trailing, onClick, chevron, destructive, className }: ListRowProps) {
  const body = (
    <>
      {leading}
      {!leading && Icon && (
        <span className={cx('w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0', iconTones[iconTone])}>
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className={cx('block text-[17px] leading-snug truncate', destructive ? 'text-semantic-danger' : 'text-ink')}>{title}</span>
        {subtitle && <span className="block text-[14px] text-mute leading-snug mt-0.5">{subtitle}</span>}
      </span>
      {value && <span className="text-[15px] text-mute shrink-0">{value}</span>}
      {trailing}
      {(chevron ?? !!onClick) && !trailing && <ChevronRight className="w-[18px] h-[18px] text-faint shrink-0" strokeWidth={2} />}
    </>
  );

  if (onClick) {
    return (
      <motion.button
        whileTap={{ backgroundColor: '#FBF6F1' }}
        onClick={() => {
          haptic('light');
          onClick();
        }}
        className={cx('w-full text-left flex items-center gap-3 px-4 min-h-[60px] py-3', className)}
      >
        {body}
      </motion.button>
    );
  }
  return <div className={cx('flex items-center gap-3 px-4 min-h-[60px] py-3', className)}>{body}</div>;
}
