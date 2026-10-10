import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Child, Notification, UserProfile } from '../types';
import { apiFetch, clearLegacyToken, getJSON, hasLegacyToken } from '../api';
import { useDataChanged } from './events';
import { consumeAuthRedirect, hasStoredSession, signOutSupabase } from './supabase';
import { useToast } from '../components/ui/Toast';
import { firstName } from './format';

interface AppStore {
  booting: boolean;
  profile: UserProfile | null;
  isAuthed: boolean;
  children: Child[];
  activeChild: Child | null;
  setActiveChild: (id: string) => void;
  refreshChildren: (selectId?: string) => Promise<Child[]>;
  /** 'error' when the child list could not be loaded (never treat that as "no children") */
  childrenStatus: 'idle' | 'ok' | 'error';
  refreshProfile: () => Promise<void>;
  setProfile: (p: UserProfile) => void;
  /** Load the app profile for the current Supabase session (after any sign-in). */
  establishSession: () => Promise<UserProfile | null>;
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

  const refreshChildren = useCallback(async (selectId?: string) => {
    let remote: Child[];
    try {
      const res = await apiFetch('/api/children');
      if (!res.ok) throw new Error(`status ${res.status}`);
      remote = (await res.json()) as Child[];
    } catch {
      setChildrenStatus('error');
      return [];
    }

    // Older builds kept a child on this device when saving failed: move it to the account now
    const pending = readLocalChildren();
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
    resetState();
    await signOutSupabase();
  }, [resetState]);

  const establishSession = useCallback(async (): Promise<UserProfile | null> => {
    const supabaseSession = hasStoredSession();
    if (!supabaseSession && !hasLegacyToken()) {
      setProfile(null);
      return null;
    }
    try {
      const res = supabaseSession ? await apiFetch('/api/auth/session', { method: 'POST' }) : await apiFetch('/api/profile');
      if (res.status === 401) {
        await logout();
        return null;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || '');
      const user = (supabaseSession ? data.user : data) as UserProfile;
      const sub = localStorage.getItem(SUBROLE_KEY) as 'bunda' | 'ayah' | 'wali' | null;
      if (sub) setParentVariant(sub);
      await refreshChildren();
      setProfile(user);
      refreshNotifications();
      return user;
    } catch (err: any) {
      toast({
        title: 'Belum bisa memuat akun',
        body: err?.message || 'Server FlourishCare belum merespons. Coba buka ulang aplikasi sebentar lagi.',
        tone: 'warning',
      });
      return null;
    }
  }, [logout, refreshChildren, refreshNotifications, toast]);

  // Boot: finish a Google sign-in, email confirmation, or password reset, then load the session
  useEffect(() => {
    let cancelled = false;
    (async () => {
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
