import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { openExternalBooking, USE_EXTERNAL_BOOKING } from './booking';
import type { ScreeningType } from '../types';
import type { ServiceCategory } from '../data/pricing';

export type TabKey = 'home' | 'child' | 'vaccine' | 'account';

export type Route =
  | { name: 'child' }
  | { name: 'vaccine' }
  | { name: 'growth' }
  | { name: 'milestone' }
  | { name: 'screening'; start?: ScreeningType; reportId?: string }
  | { name: 'stimulasi' }
  | { name: 'qa' }
  | { name: 'library' }
  | { name: 'article'; id: string }
  | { name: 'booking'; category?: ServiceCategory; subCode?: string; therapistId?: string }
  | { name: 'bookings' }
  | { name: 'notifications' }
  | { name: 'onboarding' }
  | { name: 'auth'; mode?: 'login' | 'register'; redirect?: Route; redirectTab?: TabKey };

export interface StackEntry {
  key: string;
  route: Route;
}

interface NavContextValue {
  tab: TabKey;
  stack: StackEntry[];
  setTab: (tab: TabKey) => void;
  push: (route: Route) => void;
  pop: () => void;
  popToRoot: () => void;
  replaceTop: (route: Route) => void;
  /** Called by the auth screen; navigation resumes once the session is active */
  completeAuth: (intent?: { redirect?: Route; redirectTab?: TabKey }) => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used inside NavProvider');
  return ctx;
}

const PUBLIC_ROUTES: Route['name'][] = ['library', 'article', 'auth'];
const PUBLIC_TABS: TabKey[] = ['home'];

let keySeed = 0;
const nextKey = () => `r${++keySeed}`;

interface NavProviderProps {
  isAuthed: boolean;
  children: React.ReactNode;
}

/**
 * Navigation stack with iOS semantics:
 * tabs are roots, routes are pushed on top, browser/Android back pops.
 */
export function NavProvider({ isAuthed, children }: NavProviderProps) {
  const [tab, setTabState] = useState<TabKey>('home');
  const [stack, setStack] = useState<StackEntry[]>([]);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  useEffect(() => {
    try {
      window.history.replaceState({ fcDepth: 0 }, '');
    } catch {
      /* ignore */
    }
    const onPop = (e: PopStateEvent) => {
      const depth = typeof e.state?.fcDepth === 'number' ? e.state.fcDepth : 0;
      setStack((s) => (s.length > depth ? s.slice(0, depth) : s));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const pushRaw = useCallback((route: Route) => {
    // Side effects stay outside the state updater (StrictMode runs updaters twice).
    const next = [...stackRef.current, { key: nextKey(), route }];
    stackRef.current = next;
    try {
      window.history.pushState({ fcDepth: next.length }, '');
    } catch {
      /* ignore */
    }
    setStack(next);
  }, []);

  const push = useCallback(
    (route: Route) => {
      // Booking happens on book.flourishcare.id for now (in-app flow kept for later)
      if (route.name === 'booking' && USE_EXTERNAL_BOOKING) {
        openExternalBooking();
        return;
      }
      if (!isAuthed && !PUBLIC_ROUTES.includes(route.name)) {
        pushRaw({ name: 'auth', redirect: route });
        return;
      }
      pushRaw(route);
    },
    [isAuthed, pushRaw],
  );

  const pop = useCallback(() => {
    const depth = stackRef.current.length;
    if (depth === 0) return;
    if (window.history.state?.fcDepth === depth) {
      window.history.back();
    } else {
      setStack((s) => s.slice(0, -1));
    }
  }, []);

  const popToRoot = useCallback(() => {
    const depth = stackRef.current.length;
    if (depth === 0) return;
    setStack([]);
    if (window.history.state?.fcDepth === depth) {
      window.history.go(-depth);
    }
  }, []);

  const replaceTop = useCallback((route: Route) => {
    setStack((s) => {
      if (!s.length) return [{ key: nextKey(), route }];
      return [...s.slice(0, -1), { key: nextKey(), route }];
    });
  }, []);

  const setTab = useCallback(
    (next: TabKey) => {
      if (!isAuthed && !PUBLIC_TABS.includes(next)) {
        pushRaw({ name: 'auth', redirectTab: next });
        return;
      }
      setTabState(next);
      if (stackRef.current.length) popToRoot();
    },
    [isAuthed, popToRoot, pushRaw],
  );

  const pendingAuth = useRef<{ redirect?: Route; redirectTab?: TabKey } | null>(null);
  const [authTick, setAuthTick] = useState(0);
  const completeAuth = useCallback((intent?: { redirect?: Route; redirectTab?: TabKey }) => {
    pendingAuth.current = intent ?? {};
    setAuthTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!isAuthed || !pendingAuth.current) return;
    const intent = pendingAuth.current;
    pendingAuth.current = null;
    if (intent.redirectTab) {
      setTabState(intent.redirectTab);
      popToRoot();
    } else if (intent.redirect) {
      replaceTop(intent.redirect);
    } else {
      pop();
    }
  }, [isAuthed, authTick, pop, popToRoot, replaceTop]);

  // Logging out returns to the public home
  useEffect(() => {
    if (!isAuthed) {
      setTabState('home');
    }
  }, [isAuthed]);

  const value = useMemo(
    () => ({ tab, stack, setTab, push, pop, popToRoot, replaceTop, completeAuth }),
    [tab, stack, setTab, push, pop, popToRoot, replaceTop, completeAuth],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
