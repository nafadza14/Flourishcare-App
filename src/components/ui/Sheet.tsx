import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { X } from 'lucide-react';
import { usePortalRoot } from './PhoneShell';
import { sheetSpring } from '../../lib/motion';
import { cx } from '../../lib/cx';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** 'auto' hugs content, 'large' fills most of the screen */
  size?: 'auto' | 'large';
  className?: string;
  /** Hide the close (x) button */
  hideClose?: boolean;
}

/** iOS-style bottom sheet with drag-to-dismiss, rendered inside the phone frame. */
export default function Sheet({ open, onClose, title, subtitle, children, footer, size = 'auto', className, hideClose }: SheetProps) {
  const root = usePortalRoot();
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const content = (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 pointer-events-auto" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            className="absolute inset-0 bg-[rgba(35,27,22,0.32)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            className={cx(
              'absolute inset-x-0 bottom-0 bg-canvas rounded-t-[30px] shadow-float flex flex-col',
              size === 'large' ? 'h-[92%]' : 'max-h-[92%]',
              className,
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={sheetSpring}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
          >
            <div
              className="pt-2.5 pb-1 cursor-grab active:cursor-grabbing shrink-0"
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="mx-auto w-10 h-[5px] rounded-full bg-line-2" />
              {(title || !hideClose) && (
                <div className="flex items-start justify-between gap-3 px-5 pt-3 pb-2">
                  <div className="min-w-0">
                    {title && <h2 className="text-[22px] leading-tight tracking-[-0.01em] font-normal">{title}</h2>}
                    {subtitle && <p className="text-[15px] text-mute mt-1">{subtitle}</p>}
                  </div>
                  {!hideClose && (
                    <button
                      onClick={onClose}
                      onPointerDown={(e) => e.stopPropagation()}
                      aria-label="Tutup"
                      className="w-8 h-8 shrink-0 rounded-full bg-fill text-ink-2 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" strokeWidth={2.2} />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar px-5 pb-4">{children}</div>
            {footer && (
              <div className="px-5 pt-3 hairline-t bg-canvas" style={{ paddingBottom: 'calc(var(--sab) + 8px)' }}>
                {footer}
              </div>
            )}
            {!footer && <div style={{ height: 'var(--sab)' }} />}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!root) return null;
  return createPortal(content, root);
}
