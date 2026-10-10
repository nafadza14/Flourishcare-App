import { useEffect, useReducer, useState } from 'react';

/**
 * Add-to-home-screen support.
 *  - Android Chrome, Edge, Samsung Internet: the browser shows its own install prompt
 *    ("Tambahkan ke layar utama" / "Instal aplikasi"). We keep the event so the "Pasang"
 *    buttons can open the same browser dialog later, and only show our own card on a
 *    later visit when the parent ignored the browser's prompt.
 *  - iPhone and iPad: there is no install API, so we show the steps (Bagikan > Tambah ke Layar Utama).
 *  - In-app browsers (Instagram, Facebook, TikTok): installing is impossible there,
 *    so we ask the parent to open the link in Safari or Chrome first.
 *  - Computers: a QR code to open the app on the phone.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

/** What the banner can offer right now */
export type InstallMode = 'native' | 'ios' | 'android-manual' | 'in-app' | 'none';
/** Which instructions the guide sheet shows */
export type GuideMode = 'ios' | 'android-manual' | 'in-app' | 'desktop';

/** When the browser first offered its own install prompt on this device */
const NATIVE_SEEN_KEY = 'fc_native_install_seen';
/** Days the browser's own prompt gets before our card offers the same thing */
const NATIVE_GRACE_DAYS = 3;

function nativePromptOfferedBefore(days: number): boolean {
  try {
    const at = Number(localStorage.getItem(NATIVE_SEEN_KEY));
    return !!at && Date.now() - at > days * 86400000;
  } catch {
    return false;
  }
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installedThisVisit = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  // Registered when this module loads (imported from main.tsx), so an early event is never missed
  window.addEventListener('beforeinstallprompt', (e) => {
    // No preventDefault(): the browser shows its own install prompt automatically.
    deferredPrompt = e as BeforeInstallPromptEvent;
    try {
      if (!localStorage.getItem(NATIVE_SEEN_KEY)) localStorage.setItem(NATIVE_SEEN_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installedThisVisit = true;
    emit();
    window.dispatchEvent(new CustomEvent('fc:app-installed'));
  });
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = (q: string) => (typeof window.matchMedia === 'function' ? window.matchMedia(q).matches : false);
  return (
    mq('(display-mode: standalone)') ||
    mq('(display-mode: fullscreen)') ||
    mq('(display-mode: minimal-ui)') ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export interface DeviceInfo {
  ios: boolean;
  android: boolean;
  mobile: boolean;
  inApp: boolean;
  /** Name of the in-app browser, for the copy ("Instagram") */
  inAppName: string | null;
  iosBrowser: 'safari' | 'chrome' | 'firefox' | 'edge' | 'other' | null;
  /** Android browser that normally fires beforeinstallprompt (Chrome, Edge, Opera, Brave) */
  androidChromium: boolean;
  ipad: boolean;
}

const IN_APP: [RegExp, string][] = [
  [/Instagram/i, 'Instagram'],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, 'Facebook'],
  [/TikTok|musical_ly|BytedanceWebview|ByteLocale/i, 'TikTok'],
  [/\bLine\//i, 'LINE'],
  [/Twitter/i, 'X'],
  [/LinkedInApp/i, 'LinkedIn'],
  [/Snapchat/i, 'Snapchat'],
  [/Pinterest/i, 'Pinterest'],
  [/Telegram/i, 'Telegram'],
];

let cachedDevice: DeviceInfo | null = null;

export function getDevice(): DeviceInfo {
  if (cachedDevice) return cachedDevice;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const ipad = /iPad/.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const ios = /iPhone|iPod/.test(ua) || ipad;
  const android = /Android/i.test(ua);
  const inAppHit = IN_APP.find(([re]) => re.test(ua));
  const androidWebView = android && /; wv\)/.test(ua);
  const inApp = (ios || android) && (!!inAppHit || androidWebView);
  const iosBrowser: DeviceInfo['iosBrowser'] = !ios
    ? null
    : /CriOS/.test(ua)
      ? 'chrome'
      : /FxiOS/.test(ua)
        ? 'firefox'
        : /EdgiOS/.test(ua)
          ? 'edge'
          : /Safari\//.test(ua) && !/(OPiOS|YaBrowser|DuckDuckGo|GSA\/)/.test(ua)
            ? 'safari'
            : 'other';
  const androidChromium =
    android && /Chrome\/\d+/.test(ua) && !/SamsungBrowser|MiuiBrowser|XiaoMi|UCBrowser|HeyTap|VivoBrowser|HuaweiBrowser|Firefox|YaBrowser|Puffin|; wv\)/i.test(ua);
  cachedDevice = {
    ios,
    android,
    mobile: ios || android,
    inApp,
    inAppName: inAppHit ? inAppHit[1] : null,
    iosBrowser,
    androidChromium,
    ipad,
  };
  return cachedDevice;
}

/* ---------------- "Nanti saja": do not nag ---------------- */

const SNOOZE_KEY = 'fc_install_snooze';
const SNOOZE_DAYS = [3, 7, 30];

function readSnooze(): { until: number; count: number } {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY);
    if (!raw) return { until: 0, count: 0 };
    const parsed = JSON.parse(raw);
    return { until: Number(parsed.until) || 0, count: Number(parsed.count) || 0 };
  } catch {
    return { until: 0, count: 0 };
  }
}

export function isSnoozed(): boolean {
  return readSnooze().until > Date.now();
}

/** Hide the banner for a while; each dismissal waits longer (3, 7, then 30 days). */
export function snoozeInstall() {
  const { count } = readSnooze();
  const days = SNOOZE_DAYS[Math.min(count, SNOOZE_DAYS.length - 1)];
  try {
    localStorage.setItem(SNOOZE_KEY, JSON.stringify({ until: Date.now() + days * 86400000, count: count + 1 }));
  } catch {
    /* private mode: the banner simply shows again next visit */
  }
}

/* ---------------- Hook ---------------- */

export function useInstall() {
  const [, rerender] = useReducer((x: number) => x + 1, 0);
  const [standalone, setStandalone] = useState(isStandalone);
  const [relatedInstalled, setRelatedInstalled] = useState(false);
  const device = getDevice();

  useEffect(() => {
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(display-mode: standalone)');
    const onChange = () => setStandalone(isStandalone());
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Chrome on Android can tell us the app is already on the home screen
  useEffect(() => {
    const nav = navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> };
    if (typeof nav.getInstalledRelatedApps !== 'function') return;
    nav
      .getInstalledRelatedApps()
      .then((apps) => {
        if (Array.isArray(apps) && apps.length > 0) setRelatedInstalled(true);
      })
      .catch(() => undefined);
  }, []);

  const installed = standalone || installedThisVisit || relatedInstalled;
  const canPrompt = !!deferredPrompt;

  let mode: InstallMode = 'none';
  if (!installed) {
    if (device.inApp) mode = 'in-app';
    // The browser shows its own install prompt first; our card is only a reminder on a later visit
    else if (canPrompt && device.mobile) mode = nativePromptOfferedBefore(NATIVE_GRACE_DAYS) ? 'native' : 'none';
    else if (device.ios) mode = 'ios';
    // Chrome on Android always fires the event when the app can be installed.
    // No event usually means it is already installed, so stay quiet.
    else if (device.android && !device.androidChromium) mode = 'android-manual';
  }

  const guideMode: GuideMode = device.inApp ? 'in-app' : device.ios ? 'ios' : device.android ? 'android-manual' : 'desktop';

  async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    const evt = deferredPrompt;
    if (!evt) return 'unavailable';
    try {
      await evt.prompt();
      const choice = await evt.userChoice;
      // The saved event can only be used once
      deferredPrompt = null;
      emit();
      return choice.outcome;
    } catch {
      deferredPrompt = null;
      emit();
      return 'unavailable';
    }
  }

  return { device, installed, standalone, canPrompt, mode, guideMode, promptInstall };
}

export const APP_URL = 'https://app.flourishcare.id';
