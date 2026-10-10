import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CircleCheck, Info, MessageCircle, TriangleAlert, type LucideIcon } from 'lucide-react';
import { usePortalRoot } from './PhoneShell';
import { haptic } from '../../lib/haptics';
import { cx } from '../../lib/cx';

type ToastTone = 'success' | 'info' | 'warning' | 'whatsapp';

interface ToastInput {
  title: string;
  body?: string;
  tone?: ToastTone;
  duration?: number;
  app?: string;
}

interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const toneIcon: Record<ToastTone, { icon: LucideIcon; className: string }> = {
  success: { icon: CircleCheck, className: 'bg-semantic-success text-white' },
  info: { icon: Info, className: 'bg-brand-orange text-white' },
  warning: { icon: TriangleAlert, className: 'bg-semantic-warning text-white' },
  whatsapp: { icon: MessageCircle, className: 'bg-[#25D366] text-white' },
};

function ToastViewport({ toast, onDismiss }: { toast: ToastItem | null; onDismiss: () => void }) {
  const root = usePortalRoot();
  if (!root) return null;
  return createPortal(
    <div className="absolute inset-x-0 top-0 px-3 pointer-events-none" style={{ paddingTop: 'calc(var(--sat) + 4px)' }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto glass-white rounded-[22px] shadow-float p-3.5 flex gap-3 items-start cursor-grab"
            initial={{ y: -140, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -140, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.6, bottom: 0.1 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -30) onDismiss();
            }}
            onClick={onDismiss}
          >
            {(() => {
              const t = toneIcon[toast.tone ?? 'success'];
              const Icon = t.icon;
              return (
                <span className={cx('w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0', t.className)}>
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </span>
              );
            })()}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] text-mute uppercase tracking-[0.04em]">{toast.app ?? 'FlourishCare'}</span>
                <span className="text-[13px] text-faint">sekarang</span>
              </div>
              <div className="text-[16px] font-medium text-ink leading-snug mt-0.5">{toast.title}</div>
              {toast.body && <div className="text-[15px] text-ink-2 leading-snug mt-0.5 line-clamp-3">{toast.body}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    root,
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timer = useRef<number | null>(null);
  const counter = useRef(0);

  const dismiss = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback((t: ToastInput) => {
    if (timer.current) window.clearTimeout(timer.current);
    counter.current += 1;
    setToast({ ...t, id: counter.current });
    haptic(t.tone === 'warning' ? 'warning' : 'success');
    timer.current = window.setTimeout(() => setToast(null), t.duration ?? 4200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <ToastViewport toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
