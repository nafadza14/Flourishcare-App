import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * PhoneShell renders the app full screen on phones, and inside an iPhone-style
 * device frame (with Dynamic Island and status bar) on tablets and desktops.
 * It also provides the portal root so sheets and toasts stay inside the device.
 */

const PortalContext = createContext<HTMLElement | null>(null);

export function usePortalRoot() {
  return useContext(PortalContext);
}

function useClock() {
  const [time, setTime] = useState(() => formatClock(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setTime(formatClock(new Date())), 15000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

function formatClock(d: Date) {
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function StatusBar() {
  const time = useClock();
  return (
    <div className="hidden md:flex absolute top-0 inset-x-0 h-[50px] z-[70] items-center justify-between px-[34px] pointer-events-none select-none text-ink" aria-hidden>
      <span className="text-[16px] font-semibold tabular w-[60px] text-center pt-[3px]">{time}</span>
      <span className="absolute left-1/2 -translate-x-1/2 top-[11px] w-[122px] h-[35px] rounded-full bg-black" />
      <span className="flex items-center gap-[6px] pt-[3px]">
        {/* Signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* Wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.6c2.2 0 4.2.85 5.7 2.25l1.1-1.15A9.6 9.6 0 0 0 8 1 9.6 9.6 0 0 0 1.2 3.7l1.1 1.15A8 8 0 0 1 8 2.6Z" />
          <path d="M8 5.8c1.35 0 2.6.52 3.5 1.38l1.12-1.15A6.6 6.6 0 0 0 8 4.2a6.6 6.6 0 0 0-4.62 1.83L4.5 7.18A5 5 0 0 1 8 5.8Z" />
          <path d="M8 9a1.8 1.8 0 0 1 1.3.55L8 11 6.7 9.55A1.8 1.8 0 0 1 8 9Z" />
        </svg>
        {/* Battery */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" opacity="0.38" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

const FRAME_HEIGHT = 874;

/** Shrink the desktop device frame so it always fits the window height. */
function useFrameZoom() {
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const fit = () => {
      if (window.innerWidth < 768) return setZoom(1);
      setZoom(Math.min(1, Math.max(0.6, (window.innerHeight - 48) / FRAME_HEIGHT)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return zoom;
}

export default function PhoneShell({ children }: { children: React.ReactNode }) {
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const zoom = useFrameZoom();

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center md:py-6 bg-peach md:bg-[radial-gradient(120%_80%_at_50%_0%,#FDEBD8_0%,#FBE2C8_55%,#F6D3B1_100%)]">
      <div
        className="phone relative w-full h-[100dvh] md:w-[402px] md:h-[874px] md:rounded-[66px] md:p-[11px] md:bg-[linear-gradient(160deg,#FFFFFF_0%,#F3EEE9_60%,#E9E2DB_100%)] md:shadow-[0_40px_80px_-20px_rgba(120,70,30,0.35),0_0_0_1px_rgba(120,70,30,0.08)]"
        style={zoom < 1 ? { zoom } : undefined}
      >
        <div className="relative w-full h-full overflow-hidden bg-canvas md:rounded-[56px] isolate">
          <StatusBar />
          <PortalContext.Provider value={portalEl}>{children}</PortalContext.Provider>
          <div ref={setPortalEl} className="absolute inset-0 z-[80] pointer-events-none" />
          {/* Home indicator inside the frame */}
          <div className="hidden md:block absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[136px] h-[5px] rounded-full bg-ink/85 z-[90] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
