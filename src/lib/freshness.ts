/**
 * Installed apps (and phones that keep a tab in memory) resume the page that was
 * loaded hours or days ago, so a new release (new logo, fixes) would not show until
 * the app is fully closed. When the app comes back to the foreground, check whether a
 * newer build is live and reload quietly, but never while the parent is typing or a
 * sheet is open.
 */
const ENTRY_RE = /src="(\/assets\/index-[^"]+\.js)"/;
const MIN_HIDDEN_MS = 30_000;

function currentEntry(): string | null {
  const el = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/index-"]');
  return el ? new URL(el.src, location.origin).pathname : null;
}

async function liveEntry(): Promise<string | null> {
  const res = await fetch('/', { cache: 'no-store', credentials: 'same-origin' });
  if (!res.ok) return null;
  const match = (await res.text()).match(ENTRY_RE);
  return match ? match[1] : null;
}

function busy(): boolean {
  if (document.querySelector('[role="dialog"]')) return true;
  const el = document.activeElement as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

export function watchForUpdates() {
  const running = currentEntry();
  if (!running) return; // development server
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now();
      return;
    }
    if (!hiddenAt || Date.now() - hiddenAt < MIN_HIDDEN_MS || busy()) return;
    try {
      const live = await liveEntry();
      if (live && live !== running && !busy()) location.reload();
    } catch {
      /* offline: keep the running version */
    }
  });
}
