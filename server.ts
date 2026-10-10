import dotenv from 'dotenv';
// Load environment variables before any other imports/initializations
dotenv.config();

import express, { type Request, type Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import type {
  UserProfile, 
  Child, 
  GrowthRecord, 
  ChildMilestone, 
  ChildImmunization, 
  Screening, 
  Question, 
  Booking, 
  Notification, 
  NotificationPreferences 
} from './src/types.js';
import { calculatePrice, isTherapyCategory, type ServiceCategory, type PackageSize } from './src/data/pricing.js';
import { FALLBACK_TEAM, mapStaffProfile, TEAM_SIGNATURE, CLINIC_LOCATION, type ClinicalExpert, type StaffProfileRow } from './src/data/team.js';

/** Keep AI and server copy free of em dashes (house style). */
function stripEmDash(text: string): string {
  return (text || '')
    .replace(/\s*\u2014\s*/g, ', ')
    .replace(/\s+\u2013\s+/g, ', ')
    .replace(/,\s*,/g, ',');
}

/** Collision-safe ids for records created in quick succession. */
function uid(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// Initialize Supabase Client safely with provided details
const rawSupabaseUrl = process.env.SUPABASE_URL || 'https://vtquhqdfyirccxdzmpyr.supabase.co';
// Clean raw URL: strip trailing /rest/v1 or /rest/v1/ suffix if present
const SUPABASE_URL = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
/** Publishable (anon) key: safe in the browser, used to verify user sessions. */
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_rV4ay28GgXdI3TgnY3jkJA_YIVVJAKS';
/**
 * Secret (service role) key: server only, never shipped to the browser.
 * The app tables have Row Level Security enabled, so data access needs this key.
 */
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/** Development helpers. Both stay off in production (Vercel). */
const DEMO_SEED = process.env.DEMO_SEED === 'true';
const ALLOW_LEGACY_TOKENS = process.env.ALLOW_LEGACY_TOKENS === 'true';
/** When true, questions get an instant AI reply labelled as such. Default: wait for a real expert. */
const QA_AUTO_ANSWER = process.env.QA_AUTO_ANSWER === 'true';

/**
 * Circuit breaker around Supabase network calls. When the database host is
 * unreachable, every request would otherwise wait for the network timeout
 * before falling back to memory. After one network failure we skip Supabase
 * for a short window so the app stays fast, then try again.
 */
const SUPABASE_TIMEOUT_MS = 8000;
const SUPABASE_RETRY_AFTER_MS = 30000;
let supabaseOfflineUntil = 0;
const supabaseFetch: typeof fetch = async (input, init) => {
  if (Date.now() < supabaseOfflineUntil) {
    // Named AbortError so the Supabase client fails fast instead of retrying with backoff.
    const offline = new Error('Supabase offline, using memory until the retry window passes');
    offline.name = 'AbortError';
    throw offline;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: init?.signal ?? controller.signal });
  } catch (err) {
    supabaseOfflineUntil = Date.now() + SUPABASE_RETRY_AFTER_MS;
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

const serverAuthOptions = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };
/** Data client: secret key when configured (bypasses RLS), otherwise the publishable key. */
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY || SUPABASE_KEY, { auth: serverAuthOptions, global: { fetch: supabaseFetch } });
/** Auth client: verifies the access tokens that the app sends. */
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: serverAuthOptions, global: { fetch: supabaseFetch } });
/** Client acting as the signed-in user (for RPCs protected by RLS such as get_my_profile). */
function supabaseAsUser(accessToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: serverAuthOptions,
    global: { fetch: supabaseFetch, headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

function isTableMissingError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const code = err.code || '';
  return code === '42P01' || msg.includes('could not find the table') || msg.includes('relation') || msg.includes('does not exist');
}

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn('GEMINI_API_KEY environment variable is not defined. Tanya Ahli fallback answers will be active.');
}

const app = express();
app.use(express.json({ limit: '3mb' }));

const PORT = Number(process.env.PORT) || 3000;

  // ==========================================
  // IN-MEMORY PERSISTENT STORE (PRE-SEEDED)
  // ==========================================
  
  // 1. Logged-in Parent Profile
  let activeProfile: UserProfile = {
    id: 'u_amanda',
    fullName: 'Amanda Kartika',
    phoneWhatsapp: '081234567890',
    email: 'flourishcare.id@gmail.com',
    city: 'Jakarta Selatan',
    role: 'parent',
    createdAt: new Date().toISOString()
  };

  // 2. Pre-seeded child: Aiden, 18 months old
  // Aiden's DOB: 18 months ago from July 1, 2026 -> Jan 1, 2025
  let children: Child[] = [
    {
      id: 'c_aiden',
      parentId: 'u_amanda',
      name: 'Aiden Rayyan',
      birthDate: '2025-01-01',
      gender: 'L',
      isPremature: false,
      medicalNotes: 'Lahir cukup bulan secara sectio. Ada kekhawatiran berbicara (belum lancar menunjuk barang).',
      createdAt: new Date().toISOString()
    }
  ];

  // 3. Growth Records for Aiden
  let growthRecords: GrowthRecord[] = [
    { id: 'g_1', childId: 'c_aiden', date: '2025-01-01', weightKg: 3.2, heightCm: 50, headCircumferenceCm: 34, notes: 'Pengukuran lahir', createdAt: '2025-01-01T12:00:00Z' },
    { id: 'g_2', childId: 'c_aiden', date: '2025-04-01', weightKg: 6.1, heightCm: 61, headCircumferenceCm: 40, notes: 'Kontrol 3 bulan', createdAt: '2025-04-01T12:00:00Z' },
    { id: 'g_3', childId: 'c_aiden', date: '2025-07-01', weightKg: 8.0, heightCm: 68, headCircumferenceCm: 43, notes: 'Kontrol 6 bulan', createdAt: '2025-07-01T12:00:00Z' },
    { id: 'g_4', childId: 'c_aiden', date: '2025-10-01', weightKg: 9.2, heightCm: 73, headCircumferenceCm: 45, notes: 'Kontrol 9 bulan', createdAt: '2025-10-01T12:00:00Z' },
    { id: 'g_5', childId: 'c_aiden', date: '2026-01-01', weightKg: 10.5, heightCm: 78, headCircumferenceCm: 46.5, notes: 'Ulang tahun ke-1', createdAt: '2026-01-01T12:00:00Z' },
    { id: 'g_6', childId: 'c_aiden', date: '2026-04-01', weightKg: 11.2, heightCm: 81.5, headCircumferenceCm: 47.5, notes: 'Kontrol 15 bulan', createdAt: '2026-04-01T12:00:00Z' },
    { id: 'g_7', childId: 'c_aiden', date: '2026-07-01', weightKg: 11.8, heightCm: 84, headCircumferenceCm: 48, notes: 'Hari ini (18 bulan)', createdAt: '2026-07-01T12:00:00Z' }
  ];

  // 4. Milestone statuses for Aiden
  let childMilestones: ChildMilestone[] = [
    { id: 'cm_1', childId: 'c_aiden', milestoneId: 'm_03_mk_1', achieved: true, achievedDate: '2025-03-10', createdAt: '2025-03-10T12:00:00Z' },
    { id: 'cm_2', childId: 'c_aiden', milestoneId: 'm_03_mh_1', achieved: true, achievedDate: '2025-03-15', createdAt: '2025-03-15T12:00:00Z' },
    { id: 'cm_3', childId: 'c_aiden', milestoneId: 'm_03_b_1', achieved: true, achievedDate: '2025-02-28', createdAt: '2025-02-28T12:00:00Z' },
    { id: 'cm_4', childId: 'c_aiden', milestoneId: 'm_03_se_1', achieved: true, achievedDate: '2025-03-02', createdAt: '2025-03-02T12:00:00Z' },
    { id: 'cm_5', childId: 'c_aiden', milestoneId: 'm_46_mk_1', achieved: true, achievedDate: '2025-06-05', createdAt: '2025-06-05T12:00:00Z' },
    { id: 'cm_6', childId: 'c_aiden', milestoneId: 'm_46_mh_1', achieved: true, achievedDate: '2025-05-20', createdAt: '2025-05-20T12:00:00Z' },
    { id: 'cm_7', childId: 'c_aiden', milestoneId: 'm_46_b_1', achieved: true, achievedDate: '2025-06-12', createdAt: '2025-06-12T12:00:00Z' },
    { id: 'cm_8', childId: 'c_aiden', milestoneId: 'm_46_se_1', achieved: true, achievedDate: '2025-05-18', createdAt: '2025-05-18T12:00:00Z' },
    { id: 'cm_9', childId: 'c_aiden', milestoneId: 'm_79_mk_1', achieved: true, achievedDate: '2025-09-01', createdAt: '2025-09-01T12:00:00Z' },
    { id: 'cm_10', childId: 'c_aiden', milestoneId: 'm_79_mh_1', achieved: true, achievedDate: '2025-08-15', createdAt: '2025-08-15T12:00:00Z' },
    { id: 'cm_11', childId: 'c_aiden', milestoneId: 'm_79_b_1', achieved: true, achievedDate: '2025-09-10', createdAt: '2025-09-10T12:00:00Z' },
    { id: 'cm_12', childId: 'c_aiden', milestoneId: 'm_79_se_1', achieved: true, achievedDate: '2025-08-20', createdAt: '2025-08-20T12:00:00Z' },
    { id: 'cm_13', childId: 'c_aiden', milestoneId: 'm_1012_mk_1', achieved: true, achievedDate: '2025-11-20', createdAt: '2025-11-20T12:00:00Z' },
    { id: 'cm_14', childId: 'c_aiden', milestoneId: 'm_1012_mh_1', achieved: true, achievedDate: '2025-12-05', createdAt: '2025-12-05T12:00:00Z' },
    { id: 'cm_15', childId: 'c_aiden', milestoneId: 'm_1012_b_1', achieved: true, achievedDate: '2025-12-15', createdAt: '2025-12-15T12:00:00Z' },
    { id: 'cm_16', childId: 'c_aiden', milestoneId: 'm_1012_se_1', achieved: true, achievedDate: '2025-11-10', createdAt: '2025-11-10T12:00:00Z' },
    { id: 'cm_17', childId: 'c_aiden', milestoneId: 'm_1318_mk_1', achieved: true, achievedDate: '2026-04-10', createdAt: '2026-04-10T12:00:00Z' },
    { id: 'cm_18', childId: 'c_aiden', milestoneId: 'm_1318_mh_1', achieved: true, achievedDate: '2026-05-02', createdAt: '2026-05-02T12:00:00Z' },
    // Aiden has language milestone 13-18 bln unchecked to create a developmental red flag / alert!
    { id: 'cm_20', childId: 'c_aiden', milestoneId: 'm_1318_se_1', achieved: true, achievedDate: '2026-03-25', createdAt: '2026-03-25T12:00:00Z' }
  ];

  // 5. Pre-seeded vaccinations completed for Aiden
  let childImmunizations: ChildImmunization[] = [
    { id: 'ci_1', childId: 'c_aiden', immunizationId: 'v_hb_0', givenDate: '2025-01-01', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-01-01T12:00:00Z' },
    { id: 'ci_2', childId: 'c_aiden', immunizationId: 'v_bcg', givenDate: '2025-02-05', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-02-05T12:00:00Z' },
    { id: 'ci_3', childId: 'c_aiden', immunizationId: 'v_polio_1', givenDate: '2025-02-05', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-02-05T12:00:00Z' },
    { id: 'ci_4', childId: 'c_aiden', immunizationId: 'v_dpt_1', givenDate: '2025-03-02', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-03-02T12:00:00Z' },
    { id: 'ci_5', childId: 'c_aiden', immunizationId: 'v_polio_2', givenDate: '2025-03-02', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-03-02T12:00:00Z' },
    { id: 'ci_6', childId: 'c_aiden', immunizationId: 'v_pcv_1', givenDate: '2025-03-02', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-03-02T12:00:00Z' },
    { id: 'ci_7', childId: 'c_aiden', immunizationId: 'v_rotavirus_1', givenDate: '2025-03-02', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-03-02T12:00:00Z' },
    { id: 'ci_8', childId: 'c_aiden', immunizationId: 'v_dpt_2', givenDate: '2025-04-05', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-04-05T12:00:00Z' },
    { id: 'ci_9', childId: 'c_aiden', immunizationId: 'v_polio_3', givenDate: '2025-04-05', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-04-05T12:00:00Z' },
    { id: 'ci_10', childId: 'c_aiden', immunizationId: 'v_pcv_2', givenDate: '2025-04-05', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-04-05T12:00:00Z' },
    { id: 'ci_11', childId: 'c_aiden', immunizationId: 'v_rotavirus_2', givenDate: '2025-04-05', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-04-05T12:00:00Z' },
    { id: 'ci_12', childId: 'c_aiden', immunizationId: 'v_dpt_3', givenDate: '2025-05-10', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-05-10T12:00:00Z' },
    { id: 'ci_13', childId: 'c_aiden', immunizationId: 'v_polio_4', givenDate: '2025-05-10', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-05-10T12:00:00Z' },
    { id: 'ci_14', childId: 'c_aiden', immunizationId: 'v_mr_1', givenDate: '2025-10-10', proofPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200', createdAt: '2025-10-10T12:00:00Z' }
  ];

  // 6. Pre-seeded clinical screenings for Aiden
  let screenings: Screening[] = [
    {
      id: 's_1',
      childId: 'c_aiden',
      type: 'kpsp',
      ageMonthAtTest: 18,
      answers: {
        'k_18_1': 'Ya', 'k_18_2': 'Ya', 'k_18_3': 'Ya', 'k_18_4': 'Ya', 
        'k_18_5': 'Ya', 'k_18_6': 'Ya', 'k_18_7': 'Tidak', 'k_18_8': 'Ya', 
        'k_18_9': 'Ya', 'k_18_10': 'Ya'
      },
      score: 9,
      result: 'normal',
      recommendation: 'Perkembangan Aiden sesuai dengan umurnya. Lanjutkan stimulasi rutin di rumah dan pantau perkembangan 3 bulan lagi (pada usia 21 bulan).',
      createdAt: '2026-06-15T10:30:00Z'
    }
  ];

  // 7. Tanya Ahli Q&A questions
  let questions: Question[] = [
    {
      id: 'q_1',
      parentId: 'u_amanda',
      childId: 'c_aiden',
      questionText: 'Anak saya usia 18 bulan, tapi kalau dipanggil namanya kadang menoleh kadang tidak, dan belum banyak kata yang keluar secara jelas selain "mam" dan "na". Apakah ini tanda speech delay atau butuh pemeriksaan sensori integrasi?',
      status: 'answered',
      answerText: 'Halo Ibu Amanda. Pada usia 18 bulan, idealnya anak sudah menguasai minimal 6-10 kata tunggal bermakna secara konsisten dan responsif menoleh seketika saat dipanggil namanya. Jika Aiden masih jarang menoleh, perlu dipastikan apakah ada masalah pendengaran atau hambatan atensi/sensori taktil/auditori. Sebaiknya perhatikan juga koordinasi kontak matanya. Kami menyarankan untuk melakukan skrining keterlambatan bicara terfokus di aplikasi ini, dan jika ada indikasi red-flag, jadwalkan janji temu dengan terapis FlourishCare di Klinik Mitra Diani untuk pemeriksaan langsung yang komprehensif. Semangat mendampingi tumbuh kembang Aiden ya bu!',
      answeredBy: 'Tim FlourishCare',
      isPublic: false,
      createdAt: '2026-06-10T15:00:00Z',
      answeredAt: '2026-06-11T09:30:00Z'
    }
  ];

  // 8. Bookings at FlourishCare Clinics
  let bookings: Booking[] = [
    {
      id: 'b_1',
      parentId: 'u_amanda',
      childId: 'c_aiden',
      serviceType: 'onsite',
      subService: 'Terapi Okupasi (Sensori Integrasi)',
      packageName: 'Sesi Tunggal (1 Jam Evaluasi)',
      therapistId: 'putri-solihah',
      therapistName: 'Putri Solihah, Terapis Anak',
      scheduledAt: '2026-07-10T10:00:00.000Z',
      status: 'paid',
      amount: 250000,
      paymentStatus: 'paid',
      midtransOrderId: 'FC-1720519200',
      bookingCode: 'FC-OT-1892',
      createdAt: '2026-06-29T11:20:00Z'
    }
  ];

  // 9. In-app notifications inbox
  let notifications: Notification[] = [
    {
      id: 'n_1',
      parentId: 'u_amanda',
      type: 'booking',
      title: 'Pembayaran Berhasil!',
      body: 'Pembayaran untuk booking Terapi Okupasi (Sensori Integrasi) Aiden di Klinik Mitra Diani pada 10 Juli 2026 pukul 10:00 WIB telah diverifikasi.',
      deepLink: 'bookings',
      read: true,
      createdAt: '2026-06-29T11:25:00Z'
    },
    {
      id: 'n_2',
      parentId: 'u_amanda',
      type: 'milestone',
      title: 'Aiden memasuki Usia 18 Bulan',
      body: 'Waktunya melengkapi ceklis milestone perkembangan 18 bulan Aiden untuk memastikan kemampuan bahasa & sosial-emosionalnya berkembang optimal.',
      deepLink: 'milestones',
      read: false,
      createdAt: '2026-07-01T08:00:00Z'
    }
  ];

  // 10. Notification Preferences
  let notificationPreferences: NotificationPreferences = {
    id: 'np_amanda',
    parentId: 'u_amanda',
    pushEnabled: true,
    whatsappEnabled: true,
    emailEnabled: true,
    weeklyDigest: true,
    immunizationReminder: true,
    milestoneReminder: true
  };

  // ==========================================
  // SUPABASE DATABASE DATA-ACCESS WRAPPERS
  // ==========================================

  // Memory stores for multi-user support
  interface UserAccount {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    phoneWhatsapp: string;
    city: string;
    role: 'parent' | 'caregiver';
    createdAt: string;
  }

  let userAccounts: UserAccount[] = [
    {
      id: 'u_amanda',
      email: 'flourishcare.id@gmail.com',
      passwordHash: 'password123',
      fullName: 'Amanda Kartika',
      phoneWhatsapp: '081234567890',
      city: 'Jakarta Selatan',
      role: 'parent',
      createdAt: '2026-06-01T00:00:00.000Z'
    }
  ];

  let userProfiles: UserProfile[] = [
    {
      id: 'u_amanda',
      fullName: 'Amanda Kartika',
      phoneWhatsapp: '081234567890',
      email: 'flourishcare.id@gmail.com',
      city: 'Jakarta Selatan',
      role: 'parent',
      createdAt: '2026-06-01T00:00:00.000Z'
    }
  ];

  let notificationPreferencesList: NotificationPreferences[] = [
    {
      id: 'np_amanda',
      parentId: 'u_amanda',
      pushEnabled: true,
      whatsappEnabled: true,
      emailEnabled: true,
      weeklyDigest: true,
      immunizationReminder: true,
      milestoneReminder: true
    }
  ];

  // Demo data exists only for local development (DEMO_SEED=true). Production starts empty.
  if (!DEMO_SEED) {
    children = [];
    growthRecords = [];
    childMilestones = [];
    childImmunizations = [];
    screenings = [];
    questions = [];
    bookings = [];
    notifications = [];
    userAccounts = [];
    userProfiles = [];
    notificationPreferencesList = [];
  }

  // ==========================================
  // AUTHENTICATION (Supabase Auth, shared with www and book.flourishcare.id)
  // ==========================================

  interface AuthUser {
    id: string;
    email: string;
    meta: Record<string, any>;
    accessToken: string;
    legacy?: boolean;
  }

  class AuthUnavailableError extends Error {}

  const tokenCache = new Map<string, { user: AuthUser; until: number }>();

  function jwtExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
      return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  /** Verify a Supabase access token. Throws AuthUnavailableError when Supabase cannot be reached. */
  async function verifyAccessToken(token: string): Promise<AuthUser | null> {
    const cached = tokenCache.get(token);
    if (cached && cached.until > Date.now()) return cached.user;

    if (token.split('.').length === 3) {
      const exp = jwtExpiry(token);
      if (exp && exp < Date.now()) return null;
      const { data, error } = await supabaseAuth.auth.getUser(token);
      if (error || !data?.user) {
        const status = (error as any)?.status;
        if (!status || status >= 500 || error?.name === 'AuthRetryableFetchError') throw new AuthUnavailableError('auth unavailable');
        return null;
      }
      const user: AuthUser = {
        id: data.user.id,
        email: (data.user.email || '').toLowerCase(),
        meta: { ...(data.user.user_metadata || {}) },
        accessToken: token,
      };
      if (tokenCache.size > 1000) tokenCache.clear();
      tokenCache.set(token, { user, until: Math.min(exp ?? Infinity, Date.now() + 5 * 60 * 1000) });
      return user;
    }

    // Old style tokens (the raw user id) are only accepted in local development.
    if (ALLOW_LEGACY_TOKENS && (userAccounts.some((a) => a.id === token) || userProfiles.some((p) => p.id === token))) {
      const account = userAccounts.find((a) => a.id === token);
      return { id: token, email: account?.email || '', meta: {}, accessToken: token, legacy: true };
    }
    return null;
  }

  const PUBLIC_API = [/^\/api\/supabase-status/, /^\/api\/experts/, /^\/api\/health/, /^\/api\/auth\/(login|register|logout)/];

  app.use('/api', async (req: Request, res: Response, next) => {
    const url = req.originalUrl.split('?')[0];
    const isPublic = PUBLIC_API.some((re) => re.test(url));
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) {
      if (isPublic) return next();
      return res.status(401).json({ error: 'unauthorized', message: 'Silakan masuk terlebih dahulu.' });
    }
    try {
      const user = await verifyAccessToken(token);
      if (user) {
        (req as any).authUser = user;
        return next();
      }
      if (isPublic) return next();
      return res.status(401).json({ error: 'unauthorized', message: 'Sesi berakhir. Silakan masuk lagi.' });
    } catch (err) {
      if (isPublic) return next();
      return res.status(503).json({ error: 'auth_unavailable', message: 'Layanan sedang sibuk. Coba lagi sebentar lagi.' });
    }
  });

  function getAuthUser(req: Request): AuthUser | null {
    return ((req as any).authUser as AuthUser) || null;
  }

  function getUserId(req: Request): string {
    return getAuthUser(req)?.id || '';
  }

  /** Staff status comes from the clinic dashboard (RPC get_my_profile), cached per user. */
  const staffCache = new Map<string, { isStaff: boolean; name?: string; until: number }>();

  async function getStaffInfo(user: AuthUser | null): Promise<{ isStaff: boolean; name?: string }> {
    if (!user) return { isStaff: false };
    if (user.legacy) return { isStaff: DEMO_SEED && user.id === 'u_amanda', name: TEAM_SIGNATURE };
    const cached = staffCache.get(user.id);
    if (cached && cached.until > Date.now()) return cached;
    let info: { isStaff: boolean; name?: string } = { isStaff: false };
    try {
      const { data, error } = await supabaseAsUser(user.accessToken).rpc('get_my_profile');
      const row = Array.isArray(data) ? data[0] : data;
      if (!error && row && row.is_staff === true) {
        const experts = await getExperts();
        const linked = experts.find((e) => e.profileId === user.id);
        info = { isStaff: true, name: linked?.name || row.full_name || row.name || TEAM_SIGNATURE };
      }
    } catch {
      /* not staff, or dashboard RPC unavailable */
    }
    staffCache.set(user.id, { ...info, until: Date.now() + 10 * 60 * 1000 });
    return info;
  }

  /** The child must belong to the signed-in parent (staff may read for answering questions). */
  async function ownsChild(userId: string, childId: string | undefined | null): Promise<boolean> {
    if (!userId || !childId) return false;
    const kids = await getChildren(userId);
    return kids.some((c) => c.id === childId);
  }

  // ==========================================
  // CLINICAL TEAM (staff_profiles, same source as www.flourishcare.id/team)
  // ==========================================

  let expertsCache: { list: ClinicalExpert[]; until: number; source: 'supabase' | 'fallback' } | null = null;

  async function getExperts(): Promise<ClinicalExpert[]> {
    if (expertsCache && expertsCache.until > Date.now()) return expertsCache.list;
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      if (Array.isArray(data) && data.length) {
        expertsCache = { list: (data as StaffProfileRow[]).map(mapStaffProfile), until: Date.now() + 10 * 60 * 1000, source: 'supabase' };
        return expertsCache.list;
      }
    } catch (err: any) {
      console.warn('staff_profiles unavailable, using website fallback:', err?.message || err);
    }
    expertsCache = { list: FALLBACK_TEAM, until: Date.now() + 60 * 1000, source: 'fallback' };
    return expertsCache.list;
  }

  /** Profile lookup without side effects: null when the user has no app profile yet. */
  async function findProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from('app_profiles').select('*').eq('id', userId).maybeSingle();
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`Profile "${userId}" not found in Supabase.`);
        } else {
          throw error;
        }
      }
      if (data) {
        return {
          id: data.id,
          fullName: data.full_name,
          phoneWhatsapp: data.phone_whatsapp || '',
          email: data.email || '',
          city: data.city || '',
          role: data.role as 'parent' | 'caregiver',
          createdAt: data.created_at
        };
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.log('Supabase table app_profiles is not setup yet, using local memory storage.');
      } else {
        console.warn('Supabase getProfile failed, using memory fallback:', err.message || err);
      }
    }
    
    return userProfiles.find(p => p.id === userId) ?? null;
  }

  async function getProfile(userId: string): Promise<UserProfile> {
    const found = await findProfile(userId);
    if (found) return found;

    // Create lazy default profile
    const newProf: UserProfile = {
      id: userId,
      fullName: 'Ayah / Bunda',
      phoneWhatsapp: '',
      email: '',
      city: '',
      role: 'parent',
      createdAt: new Date().toISOString()
    };
    userProfiles.push(newProf);
    return newProf;
  }

  async function updateProfile(userId: string, update: Partial<UserProfile>): Promise<UserProfile> {
    // Merge onto the stored profile so a partial update never wipes other fields
    const current = (await findProfile(userId)) ?? {
      id: userId,
      fullName: 'Ayah / Bunda',
      phoneWhatsapp: '',
      email: '',
      city: '',
      role: 'parent' as const,
      createdAt: new Date().toISOString()
    };
    const clean: Partial<UserProfile> = {};
    if (typeof update.fullName === 'string' && update.fullName.trim()) clean.fullName = update.fullName.trim().slice(0, 120);
    if (typeof update.phoneWhatsapp === 'string') clean.phoneWhatsapp = update.phoneWhatsapp.trim().slice(0, 20);
    if (typeof update.email === 'string') clean.email = update.email.trim().toLowerCase().slice(0, 160);
    if (typeof update.city === 'string') clean.city = update.city.trim().slice(0, 80);
    if (update.role === 'parent' || update.role === 'caregiver') clean.role = update.role;
    const existing: UserProfile = { ...current, ...clean, id: userId };

    const memIndex = userProfiles.findIndex(p => p.id === userId);
    if (memIndex === -1) userProfiles.push(existing);
    else userProfiles[memIndex] = existing;

    try {
      const { error } = await supabase.from('app_profiles').upsert({
        id: userId,
        full_name: existing.fullName,
        phone_whatsapp: existing.phoneWhatsapp,
        email: existing.email,
        city: existing.city,
        role: existing.role,
      });
      if (error) throw error;
    } catch (err: any) {
      console.warn('Supabase updateProfile failed, updated memory only:', err.message || err);
    }
    return existing;
  }

  async function getChildren(userId: string): Promise<Child[]> {
    try {
      const { data, error } = await supabase.from('app_children').select('*').eq('parent_id', userId);
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          parentId: item.parent_id,
          name: item.name,
          birthDate: item.birth_date,
          expectedDueDate: item.expected_due_date,
          gender: item.gender as 'L' | 'P',
          photoUrl: item.photo_url,
          isPremature: item.is_premature,
          medicalNotes: item.medical_notes,
          createdAt: item.created_at
        }));
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.log('Supabase table app_children is not setup yet, using local memory storage.');
      } else {
        console.warn('Supabase getChildren failed, using memory fallback:', err.message || err);
      }
    }
    return children.filter(c => c.parentId === userId);
  }

  async function saveChild(child: Child): Promise<void> {
    const existingIndex = children.findIndex(c => c.id === child.id);
    if (existingIndex !== -1) {
      children[existingIndex] = child;
    } else {
      children.push(child);
    }
    try {
      const { error: dbError } = await supabase.from('app_children').upsert({
        id: child.id,
        parent_id: child.parentId,
        name: child.name,
        birth_date: child.birthDate,
        expected_due_date: child.expectedDueDate,
        gender: child.gender,
        photo_url: child.photoUrl,
        is_premature: child.isPremature,
        medical_notes: child.medicalNotes,
        created_at: child.createdAt
      });
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase saveChild failed, updated memory only:', err.message || err);
    }
  }

  async function deleteChild(childId: string): Promise<void> {
    children = children.filter(c => c.id !== childId);
    growthRecords = growthRecords.filter(g => g.childId !== childId);
    childMilestones = childMilestones.filter(m => m.childId !== childId);
    childImmunizations = childImmunizations.filter(i => i.childId !== childId);
    screenings = screenings.filter(s => s.childId !== childId);

    try {
      const { error: dbError } = await supabase.from('app_children').delete().eq('id', childId);
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase deleteChild failed, updated memory only:', err.message || err);
    }
  }

  async function getGrowthRecords(childId: string): Promise<GrowthRecord[]> {
    try {
      const { data, error } = await supabase.from('app_growth_records').select('*').eq('child_id', childId);
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          childId: item.child_id,
          date: item.date,
          weightKg: Number(item.weight_kg),
          heightCm: Number(item.height_cm),
          headCircumferenceCm: Number(item.head_circumference_cm),
          notes: item.notes,
          createdAt: item.created_at
        })).sort((a,b) => a.date.localeCompare(b.date));
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.log('Supabase table app_growth_records is not setup yet, using local memory storage.');
      } else {
        console.warn('Supabase getGrowthRecords failed, using memory fallback:', err.message || err);
      }
    }
    return growthRecords.filter(g => g.childId === childId).sort((a,b) => a.date.localeCompare(b.date));
  }

  async function saveGrowthRecord(record: GrowthRecord): Promise<void> {
    growthRecords.push(record);
    try {
      const { error: dbError } = await supabase.from('app_growth_records').insert({
        id: record.id,
        child_id: record.childId,
        date: record.date,
        weight_kg: record.weightKg,
        height_cm: record.heightCm,
        head_circumference_cm: record.headCircumferenceCm,
        notes: record.notes,
        created_at: record.createdAt
      });
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase saveGrowthRecord failed, updated memory only:', err.message || err);
    }
  }

  async function deleteGrowthRecord(id: string): Promise<void> {
    growthRecords = growthRecords.filter(g => g.id !== id);
    try {
      const { error: dbError } = await supabase.from('app_growth_records').delete().eq('id', id);
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase deleteGrowthRecord failed, updated memory only:', err.message || err);
    }
  }

  async function getChildMilestones(childId: string): Promise<ChildMilestone[]> {
    try {
      const { data, error } = await supabase.from('app_child_milestones').select('*').eq('child_id', childId);
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          childId: item.child_id,
          milestoneId: item.milestone_id,
          achieved: item.achieved,
          achievedDate: item.achieved_date,
          createdAt: item.created_at
        }));
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.log('Supabase table app_child_milestones is not setup yet, using local memory storage.');
      } else {
        console.warn('Supabase getChildMilestones failed, using memory fallback:', err.message || err);
      }
    }
    return childMilestones.filter(m => m.childId === childId);
  }

  async function saveChildMilestone(m: ChildMilestone): Promise<void> {
    const existingIdx = childMilestones.findIndex(item => item.childId === m.childId && item.milestoneId === m.milestoneId);
    if (existingIdx !== -1) {
      childMilestones[existingIdx] = m;
    } else {
      childMilestones.push(m);
    }
    try {
      const { error: dbError } = await supabase.from('app_child_milestones').upsert({
        id: m.id,
        child_id: m.childId,
        milestone_id: m.milestoneId,
        achieved: m.achieved,
        achieved_date: m.achievedDate,
        created_at: m.createdAt
      });
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase saveChildMilestone failed, updated memory only:', err.message || err);
    }
  }

  async function deleteChildMilestone(childId: string, milestoneId: string): Promise<void> {
    childMilestones = childMilestones.filter(item => !(item.childId === childId && item.milestoneId === milestoneId));
    try {
      const { error: dbError } = await supabase.from('app_child_milestones').delete().eq('child_id', childId).eq('milestone_id', milestoneId);
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase deleteChildMilestone failed, updated memory only:', err.message || err);
    }
  }

  async function getChildImmunizations(childId: string): Promise<ChildImmunization[]> {
    try {
      const { data, error } = await supabase.from('app_child_immunizations').select('*').eq('child_id', childId);
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          childId: item.child_id,
          immunizationId: item.immunization_id,
          givenDate: item.given_date,
          proofPhotoUrl: item.proof_photo_url,
          createdAt: item.created_at
        }));
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.log('Supabase table app_child_immunizations is not setup yet, using local memory storage.');
      } else {
        console.warn('Supabase getChildImmunizations failed, using memory fallback:', err.message || err);
      }
    }
    return childImmunizations.filter(i => i.childId === childId);
  }

  async function saveChildImmunization(i: ChildImmunization): Promise<void> {
    const existingIdx = childImmunizations.findIndex(item => item.childId === i.childId && item.immunizationId === i.immunizationId);
    if (existingIdx !== -1) {
      childImmunizations[existingIdx] = i;
    } else {
      childImmunizations.push(i);
    }
    try {
      const { error: dbError } = await supabase.from('app_child_immunizations').upsert({
        id: i.id,
        child_id: i.childId,
        immunization_id: i.immunizationId,
        given_date: i.givenDate,
        proof_photo_url: i.proofPhotoUrl,
        created_at: i.createdAt
      });
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase saveChildImmunization failed, updated memory only:', err.message || err);
    }
  }

  async function deleteChildImmunization(childId: string, immunizationId: string): Promise<void> {
    childImmunizations = childImmunizations.filter(item => !(item.childId === childId && item.immunizationId === immunizationId));
    try {
      const { error: dbError } = await supabase.from('app_child_immunizations').delete().eq('child_id', childId).eq('immunization_id', immunizationId);
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase deleteChildImmunization failed, updated memory only:', err.message || err);
    }
  }

  async function getScreenings(childId: string): Promise<Screening[]> {
    try {
      const { data, error } = await supabase.from('app_screenings').select('*').eq('child_id', childId);
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          childId: item.child_id,
          type: item.type as any,
          ageMonthAtTest: item.age_month_at_test,
          answers: item.answers,
          score: item.score,
          result: item.result as any,
          recommendation: item.recommendation || '',
          pdfUrl: item.pdf_url,
          createdAt: item.created_at
        })).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.log('Supabase table app_screenings is not setup yet, using local memory storage.');
      } else {
        console.warn('Supabase getScreenings failed, using memory fallback:', err.message || err);
      }
    }
    return screenings.filter(s => s.childId === childId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }

  async function saveScreening(s: Screening): Promise<void> {
    screenings.push(s);
    try {
      const { error: dbError } = await supabase.from('app_screenings').insert({
        id: s.id,
        child_id: s.childId,
        type: s.type,
        age_month_at_test: s.ageMonthAtTest,
        answers: s.answers,
        score: s.score,
        result: s.result,
        recommendation: s.recommendation,
        pdf_url: s.pdfUrl,
        created_at: s.createdAt
      });
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase saveScreening failed, updated memory only:', err.message || err);
    }
  }

  async function getQuestions(): Promise<Question[]> {
    try {
      const { data, error } = await supabase.from('app_questions').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          parentId: item.parent_id,
          childId: item.child_id,
          questionText: item.question_text,
          status: item.status as any,
          answerText: item.answer_text,
          answeredBy: item.answered_by,
          isPublic: item.is_public,
          category: item.category ?? undefined,
          createdAt: item.created_at,
          answeredAt: item.answered_at
        })).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.log('Supabase table app_questions is not setup yet, using local memory storage.');
      } else {
        console.warn('Supabase getQuestions failed, using memory fallback:', err.message || err);
      }
    }
    return questions.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }

  async function saveQuestion(q: Question): Promise<void> {
    const existingIdx = questions.findIndex(item => item.id === q.id);
    if (existingIdx !== -1) {
      questions[existingIdx] = q;
    } else {
      questions.push(q);
    }
    try {
      const { error: dbError } = await supabase.from('app_questions').upsert({
        id: q.id,
        parent_id: q.parentId,
        child_id: q.childId,
        question_text: q.questionText,
        status: q.status,
        answer_text: q.answerText,
        answered_by: q.answeredBy,
        is_public: q.isPublic,
        category: q.category ?? null,
        created_at: q.createdAt,
        answered_at: q.answeredAt
      });
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase saveQuestion failed, updated memory only:', err.message || err);
    }
  }

  async function getBookings(userId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase.from('app_bookings').select('*').eq('parent_id', userId);
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          parentId: item.parent_id,
          childId: item.child_id,
          serviceType: item.service_type as any,
          subService: item.sub_service,
          packageName: item.package_name,
          therapistId: item.therapist_id,
          therapistName: item.therapist_name,
          scheduledAt: item.scheduled_at,
          status: item.status as any,
          amount: Number(item.amount),
          paymentStatus: item.payment_status as any,
          midtransOrderId: item.midtrans_order_id,
          bookingCode: item.booking_code,
          address: item.address ?? undefined,
          paymentMethod: item.payment_method ?? undefined,
          createdAt: item.created_at
        })).sort((a,b) => b.scheduledAt.localeCompare(a.scheduledAt));
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.log('Supabase table app_bookings is not setup yet, using local memory storage.');
      } else {
        console.warn('Supabase getBookings failed, using memory fallback:', err.message || err);
      }
    }
    return bookings.filter(b => b.parentId === userId).sort((a,b) => b.scheduledAt.localeCompare(a.scheduledAt));
  }

  async function saveBooking(b: Booking): Promise<void> {
    const existingIdx = bookings.findIndex(item => item.id === b.id);
    if (existingIdx !== -1) {
      bookings[existingIdx] = b;
    } else {
      bookings.push(b);
    }
    try {
      const { error: dbError } = await supabase.from('app_bookings').upsert({
        id: b.id,
        parent_id: b.parentId,
        child_id: b.childId,
        service_type: b.serviceType,
        sub_service: b.subService,
        package_name: b.packageName,
        therapist_id: b.therapistId,
        therapist_name: b.therapistName,
        scheduled_at: b.scheduledAt,
        status: b.status,
        amount: b.amount,
        payment_status: b.paymentStatus,
        midtrans_order_id: b.midtransOrderId,
        booking_code: b.bookingCode,
        address: b.address ?? null,
        payment_method: b.paymentMethod ?? null,
        created_at: b.createdAt
      });
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase saveBooking failed, updated memory only:', err.message || err);
    }
  }

  async function getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase.from('app_notifications').select('*').eq('parent_id', userId);
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          parentId: item.parent_id,
          type: item.type as any,
          title: item.title,
          body: item.body,
          deepLink: item.deep_link,
          read: item.read,
          createdAt: item.created_at
        })).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.log('Supabase table app_notifications is not setup yet, using local memory storage.');
      } else {
        console.warn('Supabase getNotifications failed, using memory fallback:', err.message || err);
      }
    }
    return notifications.filter(n => n.parentId === userId);
  }

  async function addNotification(n: Notification): Promise<void> {
    notifications.unshift(n);
    try {
      const { error: dbError } = await supabase.from('app_notifications').insert({
        id: n.id,
        parent_id: n.parentId,
        type: n.type,
        title: n.title,
        body: n.body,
        deep_link: n.deepLink,
        read: n.read,
        created_at: n.createdAt
      });
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase addNotification failed, updated memory only:', err.message || err);
    }
  }

  async function markAllNotificationsRead(userId: string): Promise<void> {
    notifications.forEach(n => {
      if (n.parentId === userId) {
        n.read = true;
      }
    });
    try {
      const { error: dbError } = await supabase.from('app_notifications').update({ read: true }).eq('parent_id', userId);
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase markAllNotificationsRead failed, updated memory only:', err.message || err);
    }
  }

  async function getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase.from('app_preferences').select('*').eq('parent_id', userId).single();
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Preferences not found in Supabase. Checking memory...');
        } else {
          throw error;
        }
      }
      if (data) {
        return {
          id: data.id || 'np_' + userId,
          parentId: data.parent_id,
          pushEnabled: data.push_enabled,
          whatsappEnabled: data.whatsapp_enabled,
          emailEnabled: data.email_enabled,
          weeklyDigest: data.weekly_digest,
          immunizationReminder: data.immunization_reminder,
          milestoneReminder: data.milestone_reminder
        };
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        console.log('Supabase table app_preferences is not setup yet, using local memory storage.');
      } else {
        console.warn('Supabase getPreferences failed, using memory fallback:', err.message || err);
      }
    }

    const memPref = notificationPreferencesList.find(p => p.parentId === userId);
    if (memPref) return memPref;

    const newPref: NotificationPreferences = {
      id: 'np_' + userId,
      parentId: userId,
      pushEnabled: true,
      whatsappEnabled: true,
      emailEnabled: true,
      weeklyDigest: true,
      immunizationReminder: true,
      milestoneReminder: true
    };
    notificationPreferencesList.push(newPref);
    return newPref;
  }

  async function savePreferences(userId: string, prefs: NotificationPreferences): Promise<NotificationPreferences> {
    let existing = notificationPreferencesList.find(p => p.parentId === userId);
    if (existing) {
      Object.assign(existing, prefs);
    } else {
      existing = { ...prefs, parentId: userId, id: 'np_' + userId };
      notificationPreferencesList.push(existing);
    }

    try {
      const { error: dbError } = await supabase.from('app_preferences').upsert({
        parent_id: userId,
        push_enabled: existing.pushEnabled,
        whatsapp_enabled: existing.whatsappEnabled,
        email_enabled: existing.emailEnabled,
        weekly_digest: existing.weeklyDigest,
        immunization_reminder: existing.immunizationReminder,
        milestone_reminder: existing.milestoneReminder
      });
      if (dbError) throw dbError;
    } catch (err: any) {
      console.warn('Supabase savePreferences failed, updated memory only:', err.message || err);
    }
    return existing;
  }

  // ==========================================
  // REST API ENDPOINTS
  // ==========================================

  // Supabase Connection Health Status (no secrets in the response)
  app.get('/api/supabase-status', async (_req: Request, res: Response) => {
    const base = { project: SUPABASE_URL.replace(/^https?:\/\//, '').split('.')[0], secretKey: !!SUPABASE_SECRET_KEY };
    try {
      const { error } = await supabase.from('app_profiles').select('id').limit(1);
      if (error) {
        const missing = isTableMissingError(error);
        return res.json({
          ...base,
          connected: !missing ? false : true,
          tablesReady: false,
          error: error.message,
          hint: missing
            ? 'Tabel aplikasi belum ada. Jalankan skema SQL (menu Akun, Tentang FlourishCare) di Supabase SQL Editor.'
            : SUPABASE_SECRET_KEY
              ? 'Periksa SUPABASE_SECRET_KEY di Vercel.'
              : 'Tambahkan SUPABASE_SECRET_KEY di Vercel agar server bisa membaca tabel yang dilindungi RLS.',
        });
      }
      res.json({ ...base, connected: true, tablesReady: true, info: 'Supabase terhubung. Data tersimpan permanen.' });
    } catch (err: any) {
      res.json({ ...base, connected: false, tablesReady: false, error: err.message || 'Network/Connection error', hint: 'Periksa koneksi dan variabel lingkungan Supabase.' });
    }
  });

  // Auth / Profile Endpoints
  // Legacy email/password endpoints (memory only). Production uses Supabase Auth from the app.
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    if (!ALLOW_LEGACY_TOKENS) {
      return res.status(410).json({ error: 'gone', message: 'Muat ulang aplikasi untuk menggunakan halaman masuk terbaru.' });
    }
    try {
      const { email, password, fullName, phoneWhatsapp, city, role } = req.body;
      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Data registrasi tidak lengkap' });
      }

      // Check if email already registered
      const cleanEmail = email.toLowerCase().trim();
      const existing = userAccounts.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'Email sudah terdaftar. Silakan masuk.' });
      }

      const userId = 'u_' + Date.now();
      const newAccount: UserAccount = {
        id: userId,
        email: cleanEmail,
        passwordHash: password,
        fullName,
        phoneWhatsapp: phoneWhatsapp || '',
        city: city || '',
        role: role || 'parent',
        createdAt: new Date().toISOString()
      };

      userAccounts.push(newAccount);

      // Create matching user profile
      const newProfile: UserProfile = {
        id: userId,
        fullName: newAccount.fullName,
        phoneWhatsapp: newAccount.phoneWhatsapp,
        email: newAccount.email,
        city: newAccount.city,
        role: newAccount.role,
        createdAt: newAccount.createdAt
      };
      userProfiles.push(newProfile);

      // Save to Supabase if connected
      try {
        const { error: dbError } = await supabase.from('app_profiles').upsert({
          id: userId,
          full_name: newProfile.fullName,
          phone_whatsapp: newProfile.phoneWhatsapp,
          email: newProfile.email,
          city: newProfile.city,
          role: newProfile.role,
        });
        if (dbError) throw dbError;
      } catch (sbErr) {
        console.warn('Could not save registered profile to Supabase, using local memory storage only.');
      }

      // Seed automatic initial notification preference
      const newPref: NotificationPreferences = {
        id: 'np_' + userId,
        parentId: userId,
        pushEnabled: true,
        whatsappEnabled: true,
        emailEnabled: true,
        weeklyDigest: true,
        immunizationReminder: true,
        milestoneReminder: true
      };
      notificationPreferencesList.push(newPref);

      // Seed automatic welcome notification
      const welcomeNotification: Notification = {
        id: uid('n_welcome_'),
        parentId: userId,
        type: 'weekly_digest',
        title: `Selamat Datang, ${fullName.split(' ')[0]}!`,
        body: `Terima kasih telah bergabung di FlourishCare. Mari bersama-sama mendampingi tumbuh kembang si kecil secara optimal dengan skrining klinis dan resep stimulasi terpercaya.`,
        deepLink: 'home',
        read: false,
        createdAt: new Date().toISOString()
      };
      notifications.unshift(welcomeNotification);

      res.status(201).json({
        success: true,
        user: newProfile,
        token: userId
      });
    } catch (err: any) {
      console.error('Error during registration:', err);
      res.status(500).json({ error: 'Terjadi kesalahan sistem saat registrasi' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    if (!ALLOW_LEGACY_TOKENS) {
      return res.status(410).json({ error: 'gone', message: 'Muat ulang aplikasi untuk menggunakan halaman masuk terbaru.' });
    }
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email dan password harus diisi' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const account = userAccounts.find(u => u.email.toLowerCase() === cleanEmail && u.passwordHash === password);
      if (!account) {
        return res.status(401).json({ error: 'Email atau password salah' });
      }

      const prof = await getProfile(account.id);

      res.json({
        success: true,
        user: prof,
        token: account.id
      });
    } catch (err: any) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'Terjadi kesalahan sistem saat masuk' });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.json({ success: true });
  });

  function localPhone(raw: unknown): string {
    const digits = String(raw || '').replace(/[^0-9+]/g, '');
    if (digits.startsWith('+62')) return '0' + digits.slice(3);
    if (digits.startsWith('62')) return '0' + digits.slice(2);
    return digits;
  }

  /**
   * Called by the app right after Supabase sign-in (Google or email).
   * Creates the app profile on first visit and returns it with staff status.
   */
  app.post('/api/auth/session', async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Silakan masuk terlebih dahulu.' });
    const meta = user.meta || {};
    const providerName = String(meta.full_name || meta.name || '').trim();
    const phone = localPhone(meta.whatsapp || meta.phone || '');
    const existing = await findProfile(user.id);
    let profile: UserProfile;
    let isNew = false;

    if (!existing) {
      isNew = true;
      profile = await updateProfile(user.id, {
        fullName: providerName || user.email.split('@')[0] || 'Ayah / Bunda',
        email: user.email,
        phoneWhatsapp: phone,
        city: String(meta.city || ''),
        role: meta.sub_role === 'wali' ? 'caregiver' : 'parent',
      });
      await addNotification({
        id: uid('n_welcome_'),
        parentId: user.id,
        type: 'weekly_digest',
        title: `Selamat datang, ${profile.fullName.split(' ')[0]}`,
        body: 'Terima kasih sudah bergabung di FlourishCare. Mulai dengan menambahkan profil si Kecil, lalu pantau pertumbuhan, milestone, dan imunisasinya di satu tempat.',
        deepLink: 'home',
        read: false,
        createdAt: new Date().toISOString()
      });
    } else {
      const patch: Partial<UserProfile> = {};
      if (!existing.email && user.email) patch.email = user.email;
      if (!existing.phoneWhatsapp && phone) patch.phoneWhatsapp = phone;
      if ((!existing.fullName || existing.fullName === 'Ayah / Bunda') && providerName) patch.fullName = providerName;
      profile = Object.keys(patch).length ? await updateProfile(user.id, patch) : existing;
    }

    const staff = await getStaffInfo(user);
    res.json({
      user: { ...profile, isStaff: staff.isStaff, avatarUrl: meta.avatar_url || meta.picture || undefined },
      isNew,
    });
  });

  app.get('/api/profile', async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const prof = await getProfile(getUserId(req));
    const staff = await getStaffInfo(user);
    res.json({ ...prof, isStaff: staff.isStaff, avatarUrl: user?.meta?.avatar_url || user?.meta?.picture || undefined });
  });

  app.put('/api/profile', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { email: _ignoredEmail, role: _ignoredRole, id: _ignoredId, ...editable } = req.body || {};
    const prof = await updateProfile(userId, editable);
    res.json(prof);
  });

  app.get('/api/experts', async (_req: Request, res: Response) => {
    const list = await getExperts();
    res.set('Cache-Control', 'public, max-age=300');
    res.json(list);
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  /** Sends 404 and returns false when the child is not one of the signed-in parent's children. */
  async function guardChild(req: Request, res: Response, childId: unknown): Promise<boolean> {
    if (typeof childId === 'string' && (await ownsChild(getUserId(req), childId))) return true;
    res.status(404).json({ error: 'not_found', message: 'Profil anak tidak ditemukan.' });
    return false;
  }

  // Children Endpoints
  app.get('/api/children', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const list = await getChildren(userId);
    res.json(list);
  });

  app.post('/api/children', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    try {
      const newChild: Child = {
        id: uid('c_'),
        parentId: userId,
        name: req.body.name || 'Si Kecil',
        birthDate: req.body.birthDate || new Date().toISOString().split('T')[0],
        gender: req.body.gender || 'L',
        isPremature: req.body.isPremature || false,
        medicalNotes: req.body.medicalNotes || '',
        expectedDueDate: req.body.expectedDueDate,
        createdAt: new Date().toISOString()
      };
      await saveChild(newChild);
      res.status(201).json(newChild);
    } catch (err: any) {
      console.error('Crash in POST /api/children:', err);
      const fallbackChild: Child = {
        id: uid('c_fallback_'),
        parentId: userId,
        name: req.body.name || 'Si Kecil',
        birthDate: req.body.birthDate || new Date().toISOString().split('T')[0],
        gender: req.body.gender || 'L',
        isPremature: req.body.isPremature || false,
        medicalNotes: req.body.medicalNotes || '',
        createdAt: new Date().toISOString()
      };
      children.push(fallbackChild);
      res.status(201).json(fallbackChild);
    }
  });

  app.put('/api/children/:id', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { id } = req.params;
    const list = await getChildren(userId);
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      const { id: _id, parentId: _parentId, createdAt: _createdAt, ...changes } = req.body || {};
      const updated = { ...list[index], ...changes };
      await saveChild(updated);
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Child not found' });
    }
  });

  app.delete('/api/children/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!(await guardChild(req, res, id))) return;
    await deleteChild(id);
    res.json({ success: true });
  });

  // Growth Records Endpoints
  app.get('/api/growth/:childId', async (req: Request, res: Response) => {
    const { childId } = req.params;
    if (!(await guardChild(req, res, childId))) return;
    const records = await getGrowthRecords(childId);
    res.json(records);
  });

  app.post('/api/growth', async (req: Request, res: Response) => {
    if (!(await guardChild(req, res, req.body?.childId))) return;
    const record: GrowthRecord = {
      id: uid('g_'),
      childId: req.body.childId,
      date: req.body.date,
      weightKg: Number(req.body.weightKg),
      heightCm: Number(req.body.heightCm),
      headCircumferenceCm: Number(req.body.headCircumferenceCm),
      notes: req.body.notes || '',
      createdAt: new Date().toISOString()
    };
    await saveGrowthRecord(record);
    res.status(201).json(record);
  });

  app.delete('/api/growth/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const childId = String(req.query.childId || '');
    if (!(await guardChild(req, res, childId))) return;
    const records = await getGrowthRecords(childId);
    if (!records.some(r => r.id === id)) {
      return res.status(404).json({ error: 'not_found', message: 'Data pengukuran tidak ditemukan.' });
    }
    await deleteGrowthRecord(id);
    res.json({ success: true });
  });

  // Milestone Progress Endpoints
  app.get('/api/milestones/:childId', async (req: Request, res: Response) => {
    const { childId } = req.params;
    if (!(await guardChild(req, res, childId))) return;
    const list = await getChildMilestones(childId);
    res.json(list);
  });

  app.post('/api/milestones/toggle', async (req: Request, res: Response) => {
    const { childId, milestoneId, achieved } = req.body;
    if (!(await guardChild(req, res, childId))) return;
    
    const list = await getChildMilestones(childId);
    const existingIndex = list.findIndex(
      m => m.childId === childId && m.milestoneId === milestoneId
    );

    if (existingIndex !== -1) {
      if (!achieved) {
        await deleteChildMilestone(childId, milestoneId);
        res.json({ achieved: false });
      } else {
        const updated = {
          ...list[existingIndex],
          achievedDate: new Date().toISOString().split('T')[0]
        };
        await saveChildMilestone(updated);
        res.json(updated);
      }
    } else if (achieved) {
      const newCheck: ChildMilestone = {
        id: uid('cm_'),
        childId,
        milestoneId,
        achieved: true,
        achievedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      await saveChildMilestone(newCheck);
      res.status(201).json(newCheck);
    } else {
      res.json({ achieved: false });
    }
  });

  // Immunization Endpoints
  app.get('/api/immunization/:childId', async (req: Request, res: Response) => {
    const { childId } = req.params;
    if (!(await guardChild(req, res, childId))) return;
    const list = await getChildImmunizations(childId);
    res.json(list);
  });

  app.post('/api/immunization/toggle', async (req: Request, res: Response) => {
    const { childId, immunizationId, givenDate, proofPhotoUrl } = req.body;
    if (!(await guardChild(req, res, childId))) return;

    const list = await getChildImmunizations(childId);
    const existingIndex = list.findIndex(
      i => i.childId === childId && i.immunizationId === immunizationId
    );

    if (existingIndex !== -1) {
      if (!givenDate) {
        await deleteChildImmunization(childId, immunizationId);
        res.json({ given: false });
      } else {
        const updated = {
          ...list[existingIndex],
          givenDate,
          proofPhotoUrl: proofPhotoUrl || list[existingIndex].proofPhotoUrl
        };
        await saveChildImmunization(updated);
        res.json(updated);
      }
    } else if (givenDate) {
      const newImm: ChildImmunization = {
        id: uid('ci_'),
        childId,
        immunizationId,
        givenDate,
        proofPhotoUrl: proofPhotoUrl || '',
        createdAt: new Date().toISOString()
      };
      await saveChildImmunization(newImm);
      res.status(201).json(newImm);
    } else {
      res.json({ given: false });
    }
  });

  // Clinical Screenings Endpoints
  app.get('/api/screenings/:childId', async (req: Request, res: Response) => {
    const { childId } = req.params;
    if (!(await guardChild(req, res, childId))) return;
    const list = await getScreenings(childId);
    res.json(list);
  });

  app.post('/api/screenings', async (req: Request, res: Response) => {
    if (!(await guardChild(req, res, req.body?.childId))) return;
    const userId = getUserId(req);
    const activeProf = await getProfile(userId);
    const screening: Screening = {
      id: uid('s_'),
      childId: req.body.childId,
      type: req.body.type,
      ageMonthAtTest: Number(req.body.ageMonthAtTest),
      answers: req.body.answers,
      score: Number(req.body.score),
      result: req.body.result,
      recommendation: req.body.recommendation,
      pdfUrl: req.body.pdfUrl,
      createdAt: new Date().toISOString()
    };
    await saveScreening(screening);

    // Create a notification for red flag or alert
    if (screening.result.includes('risiko_tinggi') || screening.result === 'penyimpangan' || screening.result === 'risiko_sedang' || screening.result === 'meragukan') {
      const kids = await getChildren(activeProf.id);
      const childName = kids.find(c => c.id === screening.childId)?.name || 'si Kecil';
      const typeLabel = screening.type === 'mchat_r' ? 'M-CHAT-R' : screening.type === 'speech_delay' ? 'bicara' : 'KPSP';
      const newNotif: Notification = {
        id: uid('n_'),
        parentId: activeProf.id,
        type: 'screening',
        title: `Hasil skrining ${typeLabel} ${childName}`,
        body: `Hasil skrining menunjukkan ${screening.result.replace('_', ' ')}. Lihat rekomendasi dan pilihan konsultasi bersama psikolog kami.`,
        deepLink: 'screenings',
        read: false,
        createdAt: new Date().toISOString()
      };
      await addNotification(newNotif);
    }

    res.status(201).json(screening);
  });

  // Q&A / Tanya Ahli Endpoints
  app.get('/api/questions', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const activeProf = await getProfile(userId);
    const list = await getQuestions();
    const staff = await getStaffInfo(getAuthUser(req));
    // Staff see every question so they can answer; parents see public answered questions plus their own
    const filtered = staff.isStaff
      ? list
      : list.filter(q => q.parentId === activeProf.id || (q.isPublic && q.status === 'answered'));
    res.json(filtered.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
  });

  app.post('/api/questions', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const activeProf = await getProfile(userId);
    const parentId = activeProf.id;
    
    // Enforce Monthly Q&A limit (max 3 questions per month per user)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0,0,0,0);
    
    const list = await getQuestions();
    const monthlyCount = list.filter(
      q => q.parentId === parentId && new Date(q.createdAt) >= currentMonthStart
    ).length;

    if (monthlyCount >= 3) {
      return res.status(400).json({ 
        error: 'Limit Tercapai', 
        message: 'Kuota 3 pertanyaan gratis bulan ini sudah terpakai. Konsultasi langsung di klinik FlourishCare tetap bisa dipesan kapan saja.' 
      });
    }

    const questionText = String(req.body.questionText ?? req.body.content ?? '').trim();
    if (questionText.length < 15) {
      return res.status(400).json({ error: 'Pertanyaan terlalu singkat', message: 'Tulis minimal 15 karakter agar ahli bisa memahami kondisinya.' });
    }

    const childId = req.body.childId || null;
    if (childId && !(await ownsChild(parentId, childId))) {
      return res.status(404).json({ error: 'not_found', message: 'Profil anak tidak ditemukan.' });
    }

    const newQuestion: Question = {
      id: uid('q_'),
      parentId,
      childId,
      questionText: questionText.slice(0, 1000),
      status: 'pending',
      isPublic: req.body.isPublic ?? true,
      category: typeof req.body.category === 'string' ? req.body.category : undefined,
      createdAt: new Date().toISOString()
    };
    await saveQuestion(newQuestion);

    // Questions are answered by FlourishCare psychologists and therapists from the expert view.
    // Optional (QA_AUTO_ANSWER=true): an instant AI reply, clearly labelled as AI, never signed with a person's name.
    if (QA_AUTO_ANSWER) {
      try {
        const draft = await draftExpertAnswer(newQuestion.questionText);
        const answered: Question = {
          ...newQuestion,
          status: 'answered',
          answerText: draft,
          answeredBy: 'Asisten FlourishCare (AI)',
          answeredAt: new Date().toISOString()
        };
        await saveQuestion(answered);
        await addNotification({
          id: uid('n_'),
          parentId,
          type: 'q_and_a',
          title: 'Jawaban awal tersedia',
          body: 'Asisten FlourishCare sudah memberi jawaban awal. Psikolog dan terapis kami tetap siap membantu lewat konsultasi.',
          deepLink: 'experts',
          read: false,
          createdAt: new Date().toISOString()
        });
        return res.status(201).json(answered);
      } catch (err) {
        console.error('Auto answer failed, question stays pending:', err);
      }
    }

    res.status(201).json(newQuestion);
  });

  /** AI draft used by staff (or the optional auto reply). Never signed with a person's name. */
  async function draftExpertAnswer(questionText: string): Promise<string> {
    let draftText = '';
    if (ai) {
      const prompt = `Anda membantu tim psikolog anak dan terapis FlourishCare (${CLINIC_LOCATION}) menyusun draf jawaban untuk orang tua.
Pertanyaan orang tua: "${questionText}"

Tulis jawaban yang hangat, empatik, dan berbasis ilmu tumbuh kembang anak. Jelaskan bahwa ini bukan diagnosis, sebutkan domain perkembangan yang relevan, beri 2 sampai 3 tips stimulasi yang bisa dilakukan di rumah, lalu sarankan konsultasi dengan psikolog atau terapis FlourishCare bila keluhan berlanjut.
Gunakan bahasa Indonesia yang santun dan paragraf yang rapi. Jangan menyebut nama orang dan jangan gunakan tanda em dash atau tanda pisah panjang.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: { temperature: 0.6 }
      });
      draftText = stripEmDash(response.text || '');
    }
    if (!draftText) {
      draftText = 'Halo Ayah dan Bunda, terima kasih sudah bercerita. Setiap anak berkembang dengan ritmenya sendiri, namun kekhawatiran ini layak diperhatikan. Di rumah, luangkan 15 sampai 30 menit setiap hari tanpa gawai untuk bermain dan mengobrol tatap muka, ikuti minat si Kecil, dan beri jeda agar ia sempat merespons. Catat perubahan yang Ayah dan Bunda lihat selama dua minggu. Bila kekhawatiran berlanjut, psikolog dan terapis FlourishCare siap membantu melalui asesmen langsung.';
    }
    return draftText;
  }

  app.post('/api/questions/answer-ai', async (req: Request, res: Response) => {
    const staff = await getStaffInfo(getAuthUser(req));
    if (!staff.isStaff) return res.status(403).json({ error: 'forbidden', message: 'Fitur ini khusus untuk tim ahli FlourishCare.' });
    const { questionId } = req.body;
    const qList = await getQuestions();
    const q = qList.find(item => item.id === questionId);
    if (!q) {
      return res.status(404).json({ error: 'Question not found' });
    }

    try {
      const draftText = await draftExpertAnswer(q.questionText);
      res.json({ draftText });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to draft AI response', details: err.message });
    }
  });

  app.post('/api/questions/:id/answer', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { answerText } = req.body;
    const staff = await getStaffInfo(getAuthUser(req));
    if (!staff.isStaff) return res.status(403).json({ error: 'forbidden', message: 'Fitur ini khusus untuk tim ahli FlourishCare.' });
    const cleanAnswer = stripEmDash(String(answerText || '')).trim();
    if (cleanAnswer.length < 10) return res.status(400).json({ error: 'too_short', message: 'Jawaban terlalu singkat.' });
    const qList = await getQuestions();
    const index = qList.findIndex(q => q.id === id);
    if (index !== -1) {
      const updatedQ = {
        ...qList[index],
        status: 'answered' as const,
        answerText: cleanAnswer,
        answeredBy: staff.name || TEAM_SIGNATURE,
        answeredAt: new Date().toISOString()
      };
      await saveQuestion(updatedQ);

      // Notify
      const newNotif: Notification = {
        id: uid('n_'),
        parentId: updatedQ.parentId,
        type: 'q_and_a',
        title: 'Tanya Ahli terjawab',
        body: `Pertanyaan Anda sudah dijawab oleh ${updatedQ.answeredBy}.`,
        deepLink: 'experts',
        read: false,
        createdAt: new Date().toISOString()
      };
      await addNotification(newNotif);

      res.json(updatedQ);
    } else {
      res.status(404).json({ error: 'Question not found' });
    }
  });

  // Clinical Bookings Endpoints
  app.get('/api/bookings', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const list = await getBookings(userId);
    res.json(list);
  });

  app.post('/api/bookings', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const body = req.body || {};
    const legacyMap: Record<string, ServiceCategory> = { telekonsultasi: 'psikolog', teleconsultation: 'psikolog', home: 'home_visit' };
    const category = (legacyMap[body.serviceType] || body.serviceType || 'onsite') as ServiceCategory;
    if (!['onsite', 'home_visit', 'psikolog', 'psikotes'].includes(category)) {
      return res.status(400).json({ error: 'Tipe layanan tidak dikenal.' });
    }
    if (!body.childId || !body.scheduledAt) {
      return res.status(400).json({ error: 'Data booking belum lengkap.' });
    }
    if (!(await guardChild(req, res, body.childId))) return;
    if (category === 'home_visit' && !String(body.address || '').trim()) {
      return res.status(400).json({ error: 'Alamat wajib diisi untuk home visit.' });
    }

    const defaultCode = isTherapyCategory(category) ? 'SI' : category === 'psikotes' ? 'IQ' : 'KONSUL';
    // Amount is always computed on the server from the shared price list
    const amount = calculatePrice({
      category,
      subCode: String(body.subCode || defaultCode),
      packageSessions: Number(body.packageSessions) as PackageSize,
      weekend: !!body.isWeekend,
      atHome: !!body.atHome,
    });
    const prefix = { onsite: 'ON', home_visit: 'HV', psikolog: 'PS', psikotes: 'PT' }[category];
    const code = `FC-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: uid('b_'),
      parentId: userId,
      childId: body.childId,
      serviceType: category as any,
      subService: body.subService || 'Layanan FlourishCare',
      packageName: body.packageName || 'Sesi tunggal',
      therapistId: body.therapistId || undefined,
      therapistName: body.therapistName || 'Terapis FlourishCare',
      scheduledAt: body.scheduledAt,
      status: 'pending',
      amount,
      paymentStatus: 'unpaid',
      midtransOrderId: 'FC-' + Date.now(),
      bookingCode: code,
      createdAt: new Date().toISOString(),
      address: body.address ? String(body.address).slice(0, 300) : undefined,
      paymentMethod: body.paymentMethod ? String(body.paymentMethod) : undefined,
    };

    await saveBooking(newBooking);

    const newNotif: Notification = {
      id: uid('n_'),
      parentId: userId,
      type: 'booking',
      title: 'Booking dibuat',
      body: `Booking ${newBooking.subService} berhasil dibuat dengan kode ${newBooking.bookingCode}. Selesaikan pembayaran untuk mengonfirmasi jadwal.`,
      deepLink: 'bookings',
      read: false,
      createdAt: new Date().toISOString()
    };
    await addNotification(newNotif);

    res.status(201).json(newBooking);
  });

  app.post('/api/bookings/:id/pay', async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = getUserId(req);
    const list = await getBookings(userId);
    const index = list.findIndex(b => b.id === id);
    if (index !== -1) {
      const updated = {
        ...list[index],
        status: 'paid' as const,
        paymentStatus: 'paid' as const
      };
      await saveBooking(updated);
      
      // Notify payment successful
      const newNotif: Notification = {
        id: uid('n_'),
        parentId: userId,
        type: 'booking',
        title: 'Pembayaran dikonfirmasi',
        body: `Pembayaran untuk booking ${updated.subService} (${updated.bookingCode}) sudah diverifikasi. Sampai jumpa di sesi nanti.`,
        deepLink: 'bookings',
        read: false,
        createdAt: new Date().toISOString()
      };
      await addNotification(newNotif);

      res.json(updated);
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  });

  app.post('/api/bookings/:id/cancel', async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = getUserId(req);
    const list = await getBookings(userId);
    const index = list.findIndex(b => b.id === id);
    if (index !== -1) {
      const updated = {
        ...list[index],
        status: 'cancelled' as const
      };
      await saveBooking(updated);
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  });

  // Notifications Endpoints
  app.get('/api/notifications', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const list = await getNotifications(userId);
    res.json(list);
  });

  app.post('/api/notifications/read-all', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    await markAllNotificationsRead(userId);
    res.json({ success: true });
  });

  // Preferences Endpoints
  app.get('/api/preferences', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const prefs = await getPreferences(userId);
    res.json(prefs);
  });

  app.put('/api/preferences', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const prefs = await savePreferences(userId, req.body);
    res.json(prefs);
  });


  // ==========================================
  // VITE DEVELOPMENT OR PRODUCTION MIDDLEWARE
  // ==========================================
  
  async function startLocalServer() {
    // The bundled build (dist/server.cjs) always serves the compiled app, even without NODE_ENV set
    const isProduction = process.env.NODE_ENV === 'production' || (process.argv[1] || '').endsWith('server.cjs');
    if (!isProduction) {
      // Loaded only in development so serverless builds never pull in Vite
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      // Hashed build assets never change, cache them for a year
      app.use('/assets', express.static(path.join(distPath, 'assets'), { immutable: true, maxAge: '1y' }));
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`FlourishCare server running on http://localhost:${PORT}`);
    });
  }

  if (!process.env.VERCEL) {
    startLocalServer().catch((err) => {
      console.error('Failed to start fullstack FlourishCare server:', err);
    });
  }

  export { app };
