import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { ArrowUpRight, ChevronRight, type LucideIcon } from 'lucide-react';
import { cx } from '../../lib/cx';
import { haptic } from '../../lib/haptics';

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  block?: boolean;
  children?: React.ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-orange-gradient text-white shadow-orange',
  secondary: 'bg-white text-ink border border-line-2 shadow-card',
  soft: 'bg-brand-orange-soft text-brand-orange-deep',
  ghost: 'bg-transparent text-brand-orange-deep',
  danger: 'bg-semantic-danger-soft text-semantic-danger',
  dark: 'bg-ink text-white',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[15px] gap-1.5',
  md: 'h-12 px-5 text-[16px] gap-2',
  lg: 'h-14 px-6 text-[17px] gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading,
  block,
  className,
  children,
  disabled,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      disabled={disabled || loading}
      onClick={(e) => {
        haptic('light');
        onClick?.(e);
      }}
      className={cx(
        'inline-flex items-center justify-center rounded-full font-medium select-none whitespace-nowrap transition-opacity',
        variantClass[variant],
        sizeClass[size],
        block && 'w-full',
        (disabled || loading) && 'opacity-45 shadow-none',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="w-[18px] h-[18px] rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />
      ) : (
        Icon && <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]'} strokeWidth={2} />
      )}
      {children && <span>{children}</span>}
      {!loading && IconRight && <IconRight className={size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]'} strokeWidth={2} />}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* IconButton: white circle like the reference nav buttons              */
/* ------------------------------------------------------------------ */

interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: LucideIcon;
  label: string;
  badge?: boolean;
  tone?: 'white' | 'glass' | 'plain' | 'orange';
  size?: number;
}

export function IconButton({ icon: Icon, label, badge, tone = 'white', size = 44, className, onClick, ...rest }: IconButtonProps) {
  const toneClass = {
    white: 'bg-white shadow-card border border-line text-ink',
    glass: 'glass-white shadow-card text-ink',
    plain: 'bg-transparent text-ink',
    orange: 'bg-orange-gradient text-white shadow-orange',
  }[tone];
  return (
    <motion.button
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 600, damping: 28 }}
      onClick={(e) => {
        haptic('light');
        onClick?.(e);
      }}
      style={{ width: size, height: size }}
      className={cx('relative shrink-0 rounded-full flex items-center justify-center', toneClass, className)}
      {...rest}
    >
      <Icon className="w-[20px] h-[20px]" strokeWidth={1.8} />
      {badge && (
        <span className="absolute top-[9px] right-[10px] w-[9px] h-[9px] rounded-full bg-brand-orange ring-2 ring-white anim-pulse-dot" />
      )}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('bg-card rounded-[22px] border border-line shadow-card', className)} {...rest}>
      {children}
    </div>
  );
}

export function PressableCard({ className, children, onClick, ...rest }: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      whileTap={{ scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 520, damping: 30 }}
      onClick={(e) => {
        haptic('light');
        onClick?.(e);
      }}
      className={cx('text-left bg-card rounded-[22px] border border-line shadow-card w-full', className)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Arrow badge used on reference cards                                 */
/* ------------------------------------------------------------------ */

export function ArrowCorner({ className, light }: { className?: string; light?: boolean }) {
  return <ArrowUpRight className={cx('w-[22px] h-[22px] shrink-0', light ? 'text-white' : 'text-ink', className)} strokeWidth={1.6} />;
}

/* ------------------------------------------------------------------ */
/* Chip / pill                                                         */
/* ------------------------------------------------------------------ */

interface ChipProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  selected?: boolean;
  children: React.ReactNode;
  icon?: LucideIcon;
  count?: number;
}

export function Chip({ selected, children, icon: Icon, count, className, onClick, ...rest }: ChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        haptic('light');
        onClick?.(e);
      }}
      aria-pressed={selected}
      className={cx(
        'h-9 px-4 rounded-full text-[15px] inline-flex items-center gap-1.5 shrink-0 border transition-colors duration-200 whitespace-nowrap',
        selected ? 'bg-ink text-white border-ink' : 'bg-white text-ink-2 border-line-2',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon className="w-4 h-4" strokeWidth={1.8} />}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span className={cx('text-[13px] tabular', selected ? 'text-white/70' : 'text-mute')}>({count})</span>
      )}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Status pill                                                         */
/* ------------------------------------------------------------------ */

export type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'orange';

const toneClasses: Record<Tone, { bg: string; text: string; dot: string }> = {
  success: { bg: 'bg-semantic-success-soft', text: 'text-semantic-success', dot: 'bg-semantic-success' },
  warning: { bg: 'bg-semantic-warning-soft', text: 'text-[#9A6A12]', dot: 'bg-semantic-warning' },
  danger: { bg: 'bg-semantic-danger-soft', text: 'text-semantic-danger', dot: 'bg-semantic-danger' },
  neutral: { bg: 'bg-fill', text: 'text-ink-2', dot: 'bg-faint' },
  orange: { bg: 'bg-brand-orange-soft', text: 'text-brand-orange-deep', dot: 'bg-brand-orange' },
};

export function StatusPill({ tone = 'neutral', children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  const t = toneClasses[tone];
  return (
    <span className={cx('inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[13px] font-medium whitespace-nowrap', t.bg, t.text, className)}>
      <span className={cx('w-1.5 h-1.5 rounded-full', t.dot)} aria-hidden />
      {children}
    </span>
  );
}

export function toneDotClass(tone: Tone) {
  return toneClasses[tone].dot;
}

/* ------------------------------------------------------------------ */
/* Section header                                                      */
/* ------------------------------------------------------------------ */

export function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cx('flex items-end justify-between gap-3 px-5 mb-3', className)}>
      <div className="min-w-0">
        <h2 className="text-[21px] leading-tight tracking-[-0.01em] font-normal">{title}</h2>
        {subtitle && <p className="text-[15px] text-mute mt-0.5">{subtitle}</p>}
      </div>
      {action && onAction && (
        <button onClick={onAction} className="text-[15px] text-brand-orange-deep font-medium shrink-0 inline-flex items-center gap-0.5">
          {action}
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Icon bubble                                                         */
/* ------------------------------------------------------------------ */

export function IconBubble({
  icon: Icon,
  tone = 'fill',
  size = 44,
  className,
}: {
  icon: LucideIcon;
  tone?: 'fill' | 'white' | 'orange' | 'success' | 'warning' | 'danger' | 'line';
  size?: number;
  className?: string;
}) {
  const toneClass = {
    fill: 'bg-fill text-ink',
    white: 'bg-white text-ink shadow-card',
    orange: 'bg-brand-orange-soft text-brand-orange-deep',
    success: 'bg-semantic-success-soft text-semantic-success',
    warning: 'bg-semantic-warning-soft text-[#9A6A12]',
    danger: 'bg-semantic-danger-soft text-semantic-danger',
    line: 'bg-white border border-line text-ink',
  }[tone];
  return (
    <span style={{ width: size, height: size }} className={cx('shrink-0 rounded-full flex items-center justify-center', toneClass, className)}>
      <Icon style={{ width: size * 0.45, height: size * 0.45 }} strokeWidth={1.8} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Stat item (icon square + label + value), reference child card       */
/* ------------------------------------------------------------------ */

export function StatItem({ icon: Icon, label, value, className }: { icon: LucideIcon; label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-center gap-2 min-w-0', className)}>
      <span className="w-9 h-9 shrink-0 rounded-[11px] bg-white border border-line flex items-center justify-center text-ink-2">
        <Icon className="w-[17px] h-[17px]" strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <div className="text-[12.5px] text-mute leading-tight whitespace-nowrap">{label}</div>
        <div className="text-[17px] text-ink leading-snug whitespace-nowrap tabular">{value}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state & skeleton                                              */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex flex-col items-center text-center px-8 py-10', className)}>
      <span className="w-16 h-16 rounded-full bg-brand-orange-soft text-brand-orange-deep flex items-center justify-center mb-4 anim-float">
        <Icon className="w-7 h-7" strokeWidth={1.6} />
      </span>
      <h3 className="text-[19px] font-normal">{title}</h3>
      {body && <p className="text-[15px] text-mute mt-1.5 leading-relaxed max-w-[280px]">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton', className)} aria-hidden />;
}

export function Divider({ className }: { className?: string }) {
  return <div className={cx('h-px bg-line', className)} />;
}

/* ------------------------------------------------------------------ */
/* Inline notice                                                       */
/* ------------------------------------------------------------------ */

export function Notice({
  tone = 'neutral',
  icon: Icon,
  title,
  children,
  className,
}: {
  tone?: Tone;
  icon?: LucideIcon;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const t = toneClasses[tone];
  return (
    <div className={cx('rounded-[18px] p-4 flex gap-3', t.bg, className)}>
      {Icon && <Icon className={cx('w-5 h-5 shrink-0 mt-0.5', t.text)} strokeWidth={1.8} />}
      <div className="min-w-0 text-[15px] leading-relaxed text-ink-2">
        {title && <div className={cx('font-medium mb-0.5', t.text)}>{title}</div>}
        {children}
      </div>
    </div>
  );
}
