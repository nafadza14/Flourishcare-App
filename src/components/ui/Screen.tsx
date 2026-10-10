import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { cx } from '../../lib/cx';
import { IconButton } from './primitives';

interface ScreenProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Show iOS large title that collapses into the nav bar on scroll */
  largeTitle?: boolean;
  onBack?: () => void;
  /** Right side of the nav bar (icon buttons) */
  right?: React.ReactNode;
  /** Element aligned to the large title row, like the "+ Tambah" pill */
  titleAccessory?: React.ReactNode;
  /** Custom header replacing the large title block */
  header?: React.ReactNode;
  /** Sticky bottom area (primary CTA) */
  footer?: React.ReactNode;
  /** Reserve space for the floating tab bar */
  withTabBar?: boolean;
  /** Hide the nav bar entirely (custom header screens) */
  hideNav?: boolean;
  /** Add bottom breathing room (disable when content draws its own) */
  bottomSpacer?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export default function Screen({
  title,
  subtitle,
  largeTitle = true,
  onBack,
  right,
  titleAccessory,
  header,
  footer,
  withTabBar,
  hideNav,
  bottomSpacer = true,
  className,
  contentClassName,
  children,
  scrollRef,
}: ScreenProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const ref = scrollRef ?? innerRef;
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(!largeTitle);
  const ticking = useRef(false);

  const onScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      const top = ref.current?.scrollTop ?? 0;
      setScrolled(top > 4);
      if (largeTitle) setCompact(top > 46);
      ticking.current = false;
    });
  }, [largeTitle, ref]);

  const showNav = !hideNav;
  const navHeight = 52;
  const bottomSpace = withTabBar ? 'calc(var(--sab) + 112px)' : footer ? 'calc(var(--sab) + 108px)' : 'calc(var(--sab) + 28px)';

  return (
    <div className={cx('absolute inset-0 flex flex-col bg-canvas-gradient', className)}>
      {!showNav && (
        <div
          aria-hidden
          className={cx(
            'absolute top-0 inset-x-0 z-30 pointer-events-none transition-opacity duration-300 glass hairline-b',
            scrolled ? 'opacity-100' : 'opacity-0',
          )}
          style={{ height: 'var(--sat)' }}
        />
      )}
      {showNav && (
        <div
          className={cx(
            'absolute top-0 inset-x-0 z-30 transition-[background-color,box-shadow,backdrop-filter] duration-300',
            scrolled ? 'glass hairline-b' : 'bg-transparent',
          )}
          style={{ paddingTop: 'var(--sat)' }}
        >
          <div className="h-[52px] px-4 flex items-center gap-2">
            <div className="w-[96px] flex items-center">
              {onBack && <IconButton icon={ChevronLeft} label="Kembali" onClick={onBack} tone={scrolled ? 'plain' : 'white'} />}
            </div>
            <motion.div
              initial={false}
              animate={{ opacity: compact ? 1 : 0, y: compact ? 0 : 8 }}
              transition={{ duration: 0.22 }}
              className="flex-1 min-w-0 text-center text-[17px] font-medium text-ink truncate"
              aria-hidden={!compact}
            >
              {title}
            </motion.div>
            <div className="w-[96px] flex items-center justify-end gap-2">{right}</div>
          </div>
        </div>
      )}

      <div
        ref={ref}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar"
        style={{ paddingTop: showNav ? `calc(var(--sat) + ${navHeight}px)` : 'var(--sat)' }}
      >
        {header}
        {!header && largeTitle && (
          <div className="px-5 pt-1 pb-5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[32px] leading-[1.12] tracking-[-0.025em] font-normal text-ink">{title}</h1>
              {subtitle && <div className="mt-1.5 text-[17px] text-mute leading-snug">{subtitle}</div>}
            </div>
            {titleAccessory && <div className="shrink-0 pb-1">{titleAccessory}</div>}
          </div>
        )}
        <div className={contentClassName}>{children}</div>
        {bottomSpacer && <div style={{ height: bottomSpace }} />}
      </div>

      {footer && (
        <div className="absolute bottom-0 inset-x-0 z-30 px-5 pt-3 glass hairline-t" style={{ paddingBottom: 'calc(var(--sab) + 10px)' }}>
          {footer}
        </div>
      )}
    </div>
  );
}
