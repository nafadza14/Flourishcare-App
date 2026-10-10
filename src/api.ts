/**
 * API helpers for FlourishCare.
 * apiFetch adds the Bearer token from localStorage to every /api/* request.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('auth_token');
  const cleanInput = typeof input === 'string' ? input : input.toString();

  if (token && cleanInput.startsWith('/api/')) {
    init = init || {};
    const headers = new Headers(init.headers);
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    init.headers = headers;
  }

  return fetch(input, init);
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
