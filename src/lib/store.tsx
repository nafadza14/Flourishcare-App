import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Child, Notification, UserProfile } from '../types';
import { apiFetch, getJSON } from '../api';
import { useDataChanged } from './events';

interface AppStore {
  booting: boolean;
  token: string | null;
  profile: UserProfile | null;
  isAuthed: boolean;
  children: Child[];
  activeChild: Child | null;
  setActiveChild: (id: string) => void;
  refreshChildren: (selectId?: string) => Promise<Child[]>;
  refreshProfile: () => Promise<void>;
  setProfile: (p: UserProfile) => void;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [childList, setChildList] = useState<Child[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_CHILD_KEY));
  const [booting, setBooting] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [parentVariant, setParentVariant] = useState<'bunda' | 'ayah' | 'wali'>(
    () => (localStorage.getItem(SUBROLE_KEY) as 'bunda' | 'ayah' | 'wali') || 'bunda',
  );

  const refreshChildren = useCallback(async (selectId?: string) => {
    const remote = await getJSON<Child[]>('/api/children', []);
    const merged = [...remote];
    readLocalChildren().forEach((lc) => {
      if (!merged.some((c) => c.id === lc.id)) merged.push(lc);
    });
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setBooting(false);
        return;
      }
      setBooting(true);
      await Promise.all([refreshProfile(), refreshChildren(), refreshNotifications()]);
      if (!cancelled) setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, refreshProfile, refreshChildren, refreshNotifications]);

  useDataChanged(
    (scope) => {
      if (!token) return;
      if (scope === 'children') refreshChildren();
      if (scope === 'profile') refreshProfile();
      if (scope === 'notifications' || scope === 'bookings' || scope === 'questions' || scope === 'screenings') {
        // server creates notifications for these events
        window.setTimeout(() => refreshNotifications(), 300);
      }
    },
    [token, refreshChildren, refreshProfile, refreshNotifications],
  );

  const login = useCallback((user: UserProfile, newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    const sub = localStorage.getItem(SUBROLE_KEY) as 'bunda' | 'ayah' | 'wali' | null;
    if (sub) setParentVariant(sub);
    setProfile(user);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem(ACTIVE_CHILD_KEY);
    setToken(null);
    setProfile(null);
    setChildList([]);
    setActiveId(null);
    setUnreadCount(0);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
  }, []);

  const setActiveChild = useCallback((id: string) => {
    localStorage.setItem(ACTIVE_CHILD_KEY, id);
    setActiveId(id);
  }, []);

  const activeChild = useMemo(() => childList.find((c) => c.id === activeId) ?? childList[0] ?? null, [childList, activeId]);

  const value: AppStore = {
    booting,
    token,
    profile,
    isAuthed: !!token && !!profile,
    children: childList,
    activeChild,
    setActiveChild,
    refreshChildren,
    refreshProfile,
    setProfile,
    login,
    logout,
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
