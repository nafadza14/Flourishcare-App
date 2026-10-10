import { useEffect } from 'react';

/** Tiny event bus so screens can tell the dashboard that data changed. */
const EVENT = 'fc:data-changed';

export type DataScope = 'stimulasi' | 'growth' | 'milestones' | 'immunization' | 'screenings' | 'questions' | 'bookings' | 'notifications' | 'children' | 'profile';

export function emitDataChanged(scope: DataScope) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: scope }));
}

export function useDataChanged(handler: (scope: DataScope) => void, deps: unknown[] = []) {
  useEffect(() => {
    const listener = (e: Event) => handler((e as CustomEvent<DataScope>).detail);
    window.addEventListener(EVENT, listener);
    return () => window.removeEventListener(EVENT, listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
