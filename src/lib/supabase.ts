import type { Session, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Auth for the parent app. Same project as www.flourishcare.id and
 * book.flourishcare.id, so one account (Google or email) works everywhere.
 * The client library is loaded on demand to keep the first paint light.
 */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://vtquhqdfyirccxdzmpyr.supabase.co').replace(/\/$/, '');
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_rV4ay28GgXdI3TgnY3jkJA_YIVVJAKS';

const STORAGE_KEY = 'fc-app-auth';
const INTENT_KEY = 'fc_auth_intent';
const FLOW_KEY = 'fc_auth_flow';

let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storageKey: STORAGE_KEY,
        },
      }),
    );
  }
  return clientPromise;
}

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string | null) {
  try {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

/** True when a Supabase session was saved in this browser (avoids loading the library for guests). */
export function hasStoredSession(): boolean {
  return !!safeGet(localStorage, STORAGE_KEY);
}

/** User id of the session saved on this device, read without loading the Supabase library. */
export function storedSessionUserId(): string | null {
  try {
    const raw = safeGet(localStorage, STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const id = parsed?.user?.id ?? parsed?.currentSession?.user?.id;
    return typeof id === 'string' ? id : null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  if (!hasStoredSession() && !clientPromise) return null;
  const sb = await getSupabase();
  const { data } = await sb.auth.getSession();
  return data.session ?? null;
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return (await getSession())?.access_token ?? null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Where to go after signing in (survives the Google redirect)          */
/* ------------------------------------------------------------------ */

export function saveAuthIntent(intent: unknown) {
  safeSet(sessionStorage, INTENT_KEY, intent ? JSON.stringify(intent) : null);
}

export function takeAuthIntent<T>(): T | null {
  const raw = safeGet(sessionStorage, INTENT_KEY);
  safeSet(sessionStorage, INTENT_KEY, null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Sign-in methods                                                      */
/* ------------------------------------------------------------------ */

function appUrl(flow: 'oauth' | 'confirm' | 'recovery') {
  return `${window.location.origin}/?auth=${flow}`;
}

export async function signInWithGoogle(): Promise<void> {
  const sb = await getSupabase();
  safeSet(sessionStorage, FLOW_KEY, 'oauth');
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: appUrl('oauth'), queryParams: { prompt: 'select_account' } },
  });
  if (error) throw new Error(authErrorMessage(error));
}

export async function signInWithEmail(email: string, password: string): Promise<Session> {
  const sb = await getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error || !data.session) throw new Error(authErrorMessage(error));
  return data.session;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  city?: string;
  subRole?: string;
}

/** Same metadata format as book.flourishcare.id (WhatsApp stored as 62...). */
function toIntlPhone(raw?: string): string | undefined {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('62')) return digits;
  return '62' + digits;
}

export async function signUpWithEmail(input: SignUpInput): Promise<{ session: Session | null }> {
  const sb = await getSupabase();
  const { data, error } = await sb.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      emailRedirectTo: appUrl('confirm'),
      data: {
        full_name: input.fullName.trim(),
        whatsapp: toIntlPhone(input.phone),
        city: input.city?.trim() || undefined,
        sub_role: input.subRole,
      },
    },
  });
  if (error) throw new Error(authErrorMessage(error));
  // Supabase hides existing emails behind an empty identities list
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('Email sudah terdaftar. Silakan masuk, atau pakai Lupa kata sandi.');
  }
  return { session: data.session ?? null };
}

export async function sendPasswordReset(email: string): Promise<void> {
  const sb = await getSupabase();
  const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: appUrl('recovery') });
  if (error) throw new Error(authErrorMessage(error));
}

export async function updatePassword(password: string): Promise<void> {
  const sb = await getSupabase();
  const { error } = await sb.auth.updateUser({ password });
  if (error) throw new Error(authErrorMessage(error));
}

export async function signOutSupabase(): Promise<void> {
  if (!hasStoredSession() && !clientPromise) return;
  try {
    const sb = await getSupabase();
    await sb.auth.signOut({ scope: 'local' });
  } catch {
    /* already signed out */
  }
  safeSet(localStorage, STORAGE_KEY, null);
}

/* ------------------------------------------------------------------ */
/* Returning from Google, an email confirmation, or a password reset    */
/* ------------------------------------------------------------------ */

export type AuthReturn =
  | { kind: 'none' }
  | { kind: 'session'; flow: 'oauth' | 'confirm' | 'recovery' }
  | { kind: 'error'; flow: 'oauth' | 'confirm' | 'recovery'; message: string };

export async function consumeAuthRedirect(): Promise<AuthReturn> {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
  const flowParam = params.get('auth');
  const code = params.get('code');
  const errorDescription = params.get('error_description') || hash.get('error_description');
  if (!flowParam && !code && !errorDescription) return { kind: 'none' };

  const flow = (flowParam === 'recovery' || flowParam === 'confirm' ? flowParam : 'oauth') as 'oauth' | 'confirm' | 'recovery';
  // Clean the address bar right away (keeps the navigation state)
  window.history.replaceState(window.history.state, '', url.pathname);
  safeSet(sessionStorage, FLOW_KEY, null);

  if (errorDescription) return { kind: 'error', flow, message: authErrorMessage({ message: errorDescription }) };
  if (!code) return { kind: 'none' };

  try {
    const sb = await getSupabase();
    const { data, error } = await sb.auth.exchangeCodeForSession(code);
    if (error || !data.session) throw error || new Error('no session');
    return { kind: 'session', flow };
  } catch (err: any) {
    if (flow === 'confirm') {
      return { kind: 'error', flow, message: 'Email sudah terverifikasi. Silakan masuk dengan email dan kata sandi yang tadi dibuat.' };
    }
    return { kind: 'error', flow, message: authErrorMessage(err) };
  }
}

/* ------------------------------------------------------------------ */
/* Friendly Indonesian error messages                                   */
/* ------------------------------------------------------------------ */

export function authErrorMessage(err: { message?: string; status?: number; code?: string } | null | undefined): string {
  const raw = `${err?.code || ''} ${err?.message || ''}`.toLowerCase();
  if (!raw.trim()) return 'Gagal masuk. Coba lagi sebentar lagi.';
  if (raw.includes('invalid login') || raw.includes('invalid_credentials')) return 'Email atau kata sandi salah.';
  if (raw.includes('email not confirmed') || raw.includes('email_not_confirmed')) return 'Email belum diverifikasi. Buka tautan yang kami kirim ke email Anda.';
  if (raw.includes('already registered') || raw.includes('user_already_exists')) return 'Email sudah terdaftar. Silakan masuk.';
  if (raw.includes('password should be') || raw.includes('weak_password')) return 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.';
  if (raw.includes('rate limit') || raw.includes('over_email_send_rate_limit') || raw.includes('too many')) return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
  if (raw.includes('provider is not enabled') || raw.includes('unsupported provider')) return 'Masuk dengan Google belum diaktifkan. Hubungi admin FlourishCare.';
  if (raw.includes('access_denied') || raw.includes('denied')) return 'Masuk dengan Google dibatalkan.';
  if (raw.includes('code verifier') || raw.includes('flow_state') || raw.includes('pkce')) return 'Sesi masuk kedaluwarsa. Silakan coba masuk lagi dari perangkat yang sama.';
  if (raw.includes('same_password') || raw.includes('should be different')) return 'Kata sandi baru harus berbeda dari yang lama.';
  if (raw.includes('fetch') || raw.includes('network')) return 'Tidak dapat terhubung. Periksa koneksi internet, lalu coba lagi.';
  return 'Gagal masuk. Coba lagi sebentar lagi.';
}
