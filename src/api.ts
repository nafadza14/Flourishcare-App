import { getAccessToken } from './lib/supabase';

/**
 * API helpers for FlourishCare.
 * apiFetch attaches the Supabase access token (refreshed automatically) to every /api/* request.
 * A 401 means the session is gone: the store listens for `fc:unauthorized` and signs out.
 */

/** Old builds stored the raw user id here. Only the local dev server still accepts it. */
const LEGACY_TOKEN_KEY = 'auth_token';

function legacyToken(): string | null {
  try {
    return localStorage.getItem(LEGACY_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString();
  const isApi = url.startsWith('/api/');
  let sentToken = false;

  if (isApi) {
    const token = (await getAccessToken()) || legacyToken();
    if (token) {
      init = init || {};
      const headers = new Headers(init.headers);
      if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
      init.headers = headers;
      sentToken = true;
    }
  }

  const res = await fetch(input, init);
  if (isApi && sentToken && res.status === 401) {
    window.dispatchEvent(new CustomEvent('fc:unauthorized'));
  }
  return res;
}

/** GET JSON with graceful fallback. */
export async function getJSON<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await apiFetch(url);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

/** POST/PUT JSON and throw a readable error when the server refuses. */
export async function sendJSON<T>(url: string, body: unknown, method: 'POST' | 'PUT' | 'DELETE' = 'POST'): Promise<T> {
  const res = await apiFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'DELETE' ? undefined : JSON.stringify(body ?? {}),
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || 'Permintaan gagal. Coba lagi sebentar lagi.';
    throw new Error(message);
  }
  return data as T;
}

export function clearLegacyToken() {
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function hasLegacyToken(): boolean {
  return !!legacyToken();
}
