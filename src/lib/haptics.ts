/**
 * Light haptic feedback. Uses the Vibration API where available (Android).
 * iOS Safari ignores it, so this never blocks or errors.
 */
export function haptic(kind: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  try {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const pattern: Record<string, number | number[]> = {
      light: 6,
      medium: 12,
      success: [8, 40, 14],
      warning: [16, 50, 16],
    };
    navigator.vibrate(pattern[kind]);
  } catch {
    /* no-op */
  }
}
