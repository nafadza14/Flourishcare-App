import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MonitorDown, X } from 'lucide-react';
import { Button } from './ui/primitives';
import { useToast } from './ui/Toast';
import InstallGuideSheet from './sheets/InstallGuideSheet';
import FlourishCareLogo, { APP_ICON_SRC } from './FlourishCareLogo';
import { isSnoozed, snoozeInstall, useInstall } from '../lib/install';
import { softSpring } from '../lib/motion';

/** Delay after the app is ready, so the banner never covers the first impression */
const SHOW_DELAY_MS = 1800;

/**
 * Floating card above the tab bar: "Pasang FlourishCare di HP".
 * Android Chrome installs in one tap; iPhone gets the Bagikan > Tambah ke Layar Utama steps.
 */
export default function InstallBanner({ enabled }: { enabled: boolean }) {
  const { mode, device, promptInstall } = useInstall();
  const toast = useToast();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(isSnoozed);
  const [guideOpen, setGuideOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!enabled || ready) return;
    const t = window.setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [enabled, ready]);

  useEffect(() => {
    const onInstalled = () => {
      setDismissed(true);
      toast({ title: 'FlourishCare sudah terpasang', body: 'Buka dari layar utama HP kapan saja, cukup sekali ketuk.' });
    };
    window.addEventListener('fc:app-installed', onInstalled);
    return () => window.removeEventListener('fc:app-installed', onInstalled);
  }, [toast]);

  const later = () => {
    snoozeInstall();
    setDismissed(true);
  };

  const install = async () => {
    if (mode === 'native') {
      setBusy(true);
      const outcome = await promptInstall();
      setBusy(false);
      if (outcome === 'accepted') setDismissed(true);
      else if (outcome === 'dismissed') later();
      else setGuideOpen(true);
      return;
    }
    setGuideOpen(true);
  };

  const show = enabled && ready && !dismissed && mode !== 'none';
  const inApp = mode === 'in-app';
  const where = device.ipad ? 'iPad' : 'HP';
  const title = inApp ? `Buka di ${device.ios ? 'Safari' : 'Chrome'}` : `Pasang FlourishCare di ${where}`;
  const body = inApp ? `Agar FlourishCare bisa dipasang di ${where} Ayah Bunda.` : 'Buka sekali ketuk dari layar utama. Ringan dan gratis.';

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            className="absolute inset-x-3 z-[45]"
            style={{ bottom: 'calc(var(--sab) + 6px + 72px + 12px)' }}
            initial={{ y: 28, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
            transition={softSpring}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 40 || info.velocity.y > 500) later();
            }}
            role="region"
            aria-label="Pasang aplikasi FlourishCare"
          >
            <div className="relative glass-white rounded-[24px] shadow-float border border-white/80 p-3 flex items-center gap-3">
              <img src={APP_ICON_SRC} alt="" className="w-12 h-12 rounded-[13px] shadow-[0_2px_8px_rgba(35,27,22,0.14)] shrink-0" draggable={false} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-medium text-ink leading-tight">{title}</div>
                <div className="text-[13.5px] text-mute leading-snug mt-0.5">{body}</div>
              </div>
              <Button size="sm" loading={busy} onClick={install} className="shrink-0">
                {inApp ? 'Caranya' : 'Pasang'}
              </Button>
              <button
                type="button"
                onClick={later}
                aria-label="Nanti saja"
                className="absolute -top-2 -right-1.5 w-7 h-7 rounded-full bg-white border border-line shadow-card text-ink-2 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.4} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <InstallGuideSheet
        open={guideOpen}
        onClose={() => {
          setGuideOpen(false);
          later();
        }}
      />
    </>
  );
}

/** Beside the phone frame on computers: scan to open the app on the phone. */
export function DesktopInstallPanel() {
  const { device, standalone, canPrompt, promptInstall } = useInstall();
  if (device.mobile || standalone) return null;
  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="w-[300px] rounded-[32px] bg-white/75 backdrop-blur-xl border border-white shadow-[0_24px_60px_-24px_rgba(120,70,30,0.35)] p-7 text-center"
      aria-label="Pakai FlourishCare di HP"
    >
      <FlourishCareLogo variant="full" className="w-36 h-auto mx-auto" />
      <h2 className="text-[23px] leading-tight tracking-[-0.02em] font-normal text-ink mt-4">Pakai di HP Ayah Bunda</h2>
      <p className="text-[15px] text-mute leading-relaxed mt-2">Scan dengan kamera HP, lalu pasang di layar utama. Gratis, tanpa unduh dari toko aplikasi.</p>
      <div className="mt-5 mx-auto w-[188px] h-[188px] rounded-[22px] bg-white border border-line p-3">
        <img src="/brand/qr-app.svg" alt="Kode QR untuk membuka app.flourishcare.id" className="w-full h-full" draggable={false} />
      </div>
      <div className="text-[14px] text-mute mt-3 tracking-[0.01em]">app.flourishcare.id</div>
      {canPrompt && (
        <button
          type="button"
          onClick={() => void promptInstall()}
          className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-[15px] text-brand-orange-deep bg-brand-orange-soft"
        >
          <MonitorDown className="w-4 h-4" strokeWidth={2} />
          Pasang di komputer ini
        </button>
      )}
    </motion.aside>
  );
}
