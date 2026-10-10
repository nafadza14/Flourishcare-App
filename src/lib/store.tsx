import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Child, Notification, UserProfile } from '../types';
import { apiFetch, clearLegacyToken, getJSON, hasLegacyToken } from '../api';
import { useDataChanged } from './events';
import { consumeAuthRedirect, hasStoredSession, signOutSupabase, storedSessionUserId } from './supabase';
import { useToast } from '../components/ui/Toast';
import { firstName } from './format';

interface AppStore {
  booting: boolean;
  profile: UserProfile | null;
  isAuthed: boolean;
  children: Child[];
  activeChild: Child | null;
  setActiveChild: (id: string) => void;
  refreshChildren: (selectId?: string, opts?: { skipMigration?: boolean }) => Promise<Child[]>;
  /** 'error' when the child list could not be loaded (never treat that as "no children") */
  childrenStatus: 'idle' | 'ok' | 'error';
  refreshProfile: () => Promise<void>;
  setProfile: (p: UserProfile) => void;
  /** Load the app profile for the current Supabase session (after any sign-in). */
  establishSession: (opts?: { background?: boolean }) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  /** True after opening a password reset link: the app asks for a new password. */
  recoveryMode: boolean;
  setRecoveryMode: (v: boolean) => void;
  unreadCount: number;
  refreshNotifications: () => Promise<Notification[]>;
  parentVariant: 'bunda' | 'ayah' | 'wali';
}

const StoreContext = createContext<AppStore | null>(null);

export function useStore(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** The auth redirect (?code=...) must be consumed exactly once, even when effects run twice in development. */
let bootRedirect: ReturnType<typeof consumeAuthRedirect> | null = null;
function consumeRedirectOnce() {
  if (!bootRedirect) bootRedirect = consumeAuthRedirect();
  return bootRedirect;
}

/**
 * Last known profile and children, kept on this device so a returning parent sees the app
 * immediately while fresh data loads in the background.
 */
const BOOT_CACHE_KEY = 'fc_boot_cache_v1';
interface BootCache {
  uid: string;
  profile: UserProfile;
  children: Child[];
  savedAt: number;
}
function readBootCache(): BootCache | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(BOOT_CACHE_KEY) || 'null');
    return parsed && parsed.uid && parsed.profile && Array.isArray(parsed.children) ? parsed : null;
  } catch {
    return null;
  }
}
function writeBootCache(cache: BootCache) {
  try {
    localStorage.setItem(BOOT_CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* storage full or blocked: the app still works, it just boots from the server */
  }
}
function clearBootCache() {
  try {
    localStorage.removeItem(BOOT_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

const LOCAL_CHILDREN_KEY = 'fc_local_children';
const ACTIVE_CHILD_KEY = 'fc_active_child';
const SUBROLE_KEY = 'fc_subrole';

function readLocalChildren(): Child[] {
  try {
    const raw = localStorage.getItem(LOCAL_CHILDREN_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children: content }: { children: React.ReactNode }) {
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [childList, setChildList] = useState<Child[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_CHILD_KEY));
  const [booting, setBooting] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [parentVariant, setParentVariant] = useState<'bunda' | 'ayah' | 'wali'>(
    () => (localStorage.getItem(SUBROLE_KEY) as 'bunda' | 'ayah' | 'wali') || 'bunda',
  );
  const profileRef = useRef<UserProfile | null>(null);
  profileRef.current = profile;

  const [childrenStatus, setChildrenStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  const childListRef = useRef<Child[]>([]);
  childListRef.current = childList;

  const refreshChildren = useCallback(async (selectId?: string, opts?: { skipMigration?: boolean }) => {
    let remote: Child[];
    try {
      const res = await apiFetch('/api/children');
      if (!res.ok) throw new Error(`status ${res.status}`);
      remote = (await res.json()) as Child[];
    } catch {
      // Keep showing what we already have (from this session or the device cache)
      if (childListRef.current.length === 0) setChildrenStatus('error');
      return childListRef.current;
    }

    // Older builds kept a child on this device when saving failed: move it to the account now
    const pending = opts?.skipMigration ? [] : readLocalChildren();
    if (pending.length) {
      for (const lc of pending) {
        try {
          const res = await apiFetch('/api/children', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: lc.name, birthDate: lc.birthDate, gender: lc.gender, isPremature: lc.isPremature, medicalNotes: lc.medicalNotes }),
          });
          if (res.ok) {
            remote.push((await res.json()) as Child);
            removeLocalChild(lc.id);
          }
        } catch {
          /* try again next time */
        }
      }
    }

    const merged = [...remote];
    setChildrenStatus('ok');
    setChildList(merged);
    setActiveId((current) => {
      const wanted = selectId ?? current;
      const exists = merged.find((c) => c.id === wanted);
      const next = exists ? exists.id : merged[0]?.id ?? null;
      if (next) localStorage.setItem(ACTIVE_CHILD_KEY, next);
      return next;
    });
    return merged;
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await apiFetch('/api/profile');
      if (res.ok) setProfile(await res.json());
    } catch {
      /* keep previous */
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    const list = await getJSON<Notification[]>('/api/notifications', []);
    setUnreadCount(list.filter((n) => !n.read).length);
    return list;
  }, []);

  const resetState = useCallback(() => {
    localStorage.removeItem(ACTIVE_CHILD_KEY);
    setChildrenStatus('idle');
    setProfile(null);
    setChildList([]);
    setActiveId(null);
    setUnreadCount(0);
  }, []);

  const logout = useCallback(async () => {
    clearLegacyToken();
    clearBootCache();
    resetState();
    await signOutSupabase();
  }, [resetState]);

  const establishSession = useCallback(
    async (opts?: { background?: boolean }): Promise<UserProfile | null> => {
      const supabaseSession = hasStoredSession();
      if (!supabaseSession && !hasLegacyToken()) {
        setProfile(null);
        return null;
      }
      try {
        // Account and children load at the same time instead of one after the other
        const sessionReq = supabaseSession ? apiFetch('/api/auth/session', { method: 'POST' }) : apiFetch('/api/profile');
        const childrenReq = refreshChildren(undefined, { skipMigration: true });
        const res = await sessionReq;
        if (res.status === 401) {
          await childrenReq.catch(() => undefined);
          await logout();
          return null;
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || '');
        const user = (supabaseSession ? data.user : data) as UserProfile;
        const sub = localStorage.getItem(SUBROLE_KEY) as 'bunda' | 'ayah' | 'wali' | null;
        if (sub) setParentVariant(sub);
        await childrenReq;
        // Rare: a child saved only on this device by an older version
        if (readLocalChildren().length) await refreshChildren();
        setProfile(user);
        refreshNotifications();
        return user;
      } catch (err: any) {
        toast(
          opts?.background
            ? {
                title: 'Menampilkan data terakhir',
                body: 'Koneksi ke server sedang lambat. Data terbaru dimuat otomatis saat tersambung.',
                tone: 'info',
              }
            : {
                title: 'Belum bisa memuat akun',
                body: err?.message || 'Server FlourishCare belum merespons. Coba buka ulang aplikasi sebentar lagi.',
                tone: 'warning',
              },
        );
        return null;
      }
    },
    [logout, refreshChildren, refreshNotifications, toast],
  );

  // Boot: finish a Google sign-in, email confirmation, or password reset, then load the session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const url = new URL(window.location.href);
      const returningFromAuth = url.searchParams.has('auth') || url.searchParams.has('code') || url.searchParams.has('error_description') || url.hash.includes('error_description');
      const cachedUid = storedSessionUserId();
      const cache = readBootCache();
      if (!returningFromAuth && cachedUid && cache && cache.uid === cachedUid) {
        // Returning parent: show the app right away, refresh quietly in the background
        setProfile(cache.profile);
        setChildList(cache.children);
        setChildrenStatus('ok');
        setActiveId((current) => (cache.children.some((c) => c.id === current) ? current : cache.children[0]?.id ?? null));
        setBooting(false);
        await establishSession({ background: true });
        return;
      }
      if (cache && cache.uid !== cachedUid) clearBootCache();

      const ret = await consumeRedirectOnce();
      if (cancelled) return;
      if (ret.kind === 'error') {
        toast(
          ret.flow === 'confirm'
            ? { title: 'Email terverifikasi', body: ret.message }
            : { title: 'Belum berhasil masuk', body: ret.message, tone: 'warning' },
        );
      }
      const user = await establishSession();
      if (cancelled) return;
      if (ret.kind === 'session' && user) {
        if (ret.flow === 'recovery') {
          setRecoveryMode(true);
        } else {
          toast({ title: `Halo, ${firstName(user.fullName)}`, body: ret.flow === 'confirm' ? 'Email terverifikasi. Akun sudah aktif, selamat datang.' : 'Berhasil masuk dengan Google.' });
        }
      }
      setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The server rejected the session (expired or revoked)
  useEffect(() => {
    const onUnauthorized = () => {
      if (!profileRef.current) return;
      logout();
      toast({ title: 'Sesi berakhir', body: 'Silakan masuk lagi untuk melanjutkan.', tone: 'info' });
    };
    window.addEventListener('fc:unauthorized', onUnauthorized);
    return () => window.removeEventListener('fc:unauthorized', onUnauthorized);
  }, [logout, toast]);

  useDataChanged(
    (scope) => {
      if (!profileRef.current) return;
      if (scope === 'children') refreshChildren();
      if (scope === 'profile') refreshProfile();
      if (scope === 'notifications' || scope === 'bookings' || scope === 'questions' || scope === 'screenings') {
        // server creates notifications for these events
        window.setTimeout(() => refreshNotifications(), 300);
      }
    },
    [refreshChildren, refreshProfile, refreshNotifications],
  );

  useEffect(() => {
    if (!profile || childrenStatus !== 'ok' || !profile.id) return;
    writeBootCache({ uid: profile.id, profile, children: childList, savedAt: Date.now() });
  }, [profile, childList, childrenStatus]);

  const setActiveChild = useCallback((id: string) => {
    localStorage.setItem(ACTIVE_CHILD_KEY, id);
    setActiveId(id);
  }, []);

  const activeChild = useMemo(() => childList.find((c) => c.id === activeId) ?? childList[0] ?? null, [childList, activeId]);

  const value: AppStore = {
    booting,
    profile,
    isAuthed: !!profile,
    children: childList,
    activeChild,
    setActiveChild,
    refreshChildren,
    childrenStatus,
    refreshProfile,
    setProfile,
    establishSession,
    logout,
    recoveryMode,
    setRecoveryMode,
    unreadCount,
    refreshNotifications,
    parentVariant,
  };

  return <StoreContext.Provider value={value}>{content}</StoreContext.Provider>;
}

export function saveSubRole(sub: 'bunda' | 'ayah' | 'wali') {
  try {
    localStorage.setItem(SUBROLE_KEY, sub);
  } catch {
    /* ignore */
  }
}

export function saveLocalChild(child: Child) {
  try {
    const list = readLocalChildren();
    list.push(child);
    localStorage.setItem(LOCAL_CHILDREN_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function removeLocalChild(id: string) {
  try {
    const list = readLocalChildren().filter((c) => c.id !== id);
    localStorage.setItem(LOCAL_CHILDREN_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}
