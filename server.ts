import dotenv from 'dotenv';
// Load environment variables before any other imports/initializations
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { 
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
} from './src/types';

// Initialize Supabase Client safely with provided details
const rawSupabaseUrl = process.env.SUPABASE_URL || 'https://vtquhqdfyirccxdzmpyr.supabase.co';
// Clean raw URL: strip trailing /rest/v1 or /rest/v1/ suffix if present
const SUPABASE_URL = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_rV4ay28GgXdI3TgnY3jkJA_YIVVJAKS';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
app.use(express.json());

const PORT = 3000;

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
      answerText: 'Halo Ibu Amanda. Pada usia 18 bulan, idealnya anak sudah menguasai minimal 6-10 kata tunggal bermakna secara konsisten dan responsif menoleh seketika saat dipanggil namanya. Jika Aiden masih jarang menoleh, perlu dipastikan apakah ada masalah pendengaran atau hambatan atensi/sensori taktil/auditori. Sebaiknya perhatikan juga koordinasi kontak matanya. Kami menyarankan untuk melakukan skrining keterlambatan bicara terfokus di aplikasi ini, dan jika ada indikasi red-flag, jadwalkan janji temu dengan Terapis Wicara atau Terapis Okupasi FlourishCare di klinik Tebet untuk pemeriksaan langsung yang komprehensif. Semangat mendampingi tumbuh kembang Aiden ya bu!',
      answeredBy: 'Ira Amanda, M.Psi., Psikolog',
      isPublic: true,
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
      therapistId: 'exp_rian',
      therapistName: 'Rian Hidayat, A.Md.OT',
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
      body: 'Pembayaran untuk booking Terapi Okupasi (Sensori Integrasi) Aiden di Klinik Tebet pada 10 Juli 2026 pukul 10:00 WIB telah diverifikasi.',
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

  function getUserId(req: Request): string {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    return 'u_amanda'; // fallback
  }

  async function getProfile(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabase.from('app_profiles').select('*').eq('id', userId).single();
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
    
    const memProf = userProfiles.find(p => p.id === userId);
    if (memProf) return memProf;
    
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
    let existing = userProfiles.find(p => p.id === userId);
    if (existing) {
      Object.assign(existing, update);
    } else {
      existing = {
        id: userId,
        fullName: update.fullName || 'Ayah / Bunda',
        phoneWhatsapp: update.phoneWhatsapp || '',
        email: update.email || '',
        city: update.city || '',
        role: update.role || 'parent',
        createdAt: new Date().toISOString()
      };
      userProfiles.push(existing);
    }

    try {
      await supabase.from('app_profiles').upsert({
        id: userId,
        full_name: existing.fullName,
        phone_whatsapp: existing.phoneWhatsapp,
        email: existing.email,
        city: existing.city,
        role: existing.role,
      });
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
      await supabase.from('app_children').upsert({
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
      await supabase.from('app_children').delete().eq('id', childId);
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
      await supabase.from('app_growth_records').insert({
        id: record.id,
        child_id: record.childId,
        date: record.date,
        weight_kg: record.weightKg,
        height_cm: record.heightCm,
        head_circumference_cm: record.headCircumferenceCm,
        notes: record.notes,
        created_at: record.createdAt
      });
    } catch (err: any) {
      console.warn('Supabase saveGrowthRecord failed, updated memory only:', err.message || err);
    }
  }

  async function deleteGrowthRecord(id: string): Promise<void> {
    growthRecords = growthRecords.filter(g => g.id !== id);
    try {
      await supabase.from('app_growth_records').delete().eq('id', id);
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
      await supabase.from('app_child_milestones').upsert({
        id: m.id,
        child_id: m.childId,
        milestone_id: m.milestoneId,
        achieved: m.achieved,
        achieved_date: m.achievedDate,
        created_at: m.createdAt
      });
    } catch (err: any) {
      console.warn('Supabase saveChildMilestone failed, updated memory only:', err.message || err);
    }
  }

  async function deleteChildMilestone(childId: string, milestoneId: string): Promise<void> {
    childMilestones = childMilestones.filter(item => !(item.childId === childId && item.milestoneId === milestoneId));
    try {
      await supabase.from('app_child_milestones').delete().eq('child_id', childId).eq('milestone_id', milestoneId);
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
      await supabase.from('app_child_immunizations').upsert({
        id: i.id,
        child_id: i.childId,
        immunization_id: i.immunizationId,
        given_date: i.givenDate,
        proof_photo_url: i.proofPhotoUrl,
        created_at: i.createdAt
      });
    } catch (err: any) {
      console.warn('Supabase saveChildImmunization failed, updated memory only:', err.message || err);
    }
  }

  async function deleteChildImmunization(childId: string, immunizationId: string): Promise<void> {
    childImmunizations = childImmunizations.filter(item => !(item.childId === childId && item.immunizationId === immunizationId));
    try {
      await supabase.from('app_child_immunizations').delete().eq('child_id', childId).eq('immunization_id', immunizationId);
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
      await supabase.from('app_screenings').insert({
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
      await supabase.from('app_questions').upsert({
        id: q.id,
        parent_id: q.parentId,
        child_id: q.childId,
        question_text: q.questionText,
        status: q.status,
        answer_text: q.answerText,
        answered_by: q.answeredBy,
        is_public: q.isPublic,
        created_at: q.createdAt,
        answered_at: q.answeredAt
      });
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
      await supabase.from('app_bookings').upsert({
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
        created_at: b.createdAt
      });
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
      await supabase.from('app_notifications').insert({
        id: n.id,
        parent_id: n.parentId,
        type: n.type,
        title: n.title,
        body: n.body,
        deep_link: n.deepLink,
        read: n.read,
        created_at: n.createdAt
      });
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
      await supabase.from('app_notifications').update({ read: true }).eq('parent_id', userId);
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
      await supabase.from('app_preferences').upsert({
        parent_id: userId,
        push_enabled: existing.pushEnabled,
        whatsapp_enabled: existing.whatsappEnabled,
        email_enabled: existing.emailEnabled,
        weekly_digest: existing.weeklyDigest,
        immunization_reminder: existing.immunizationReminder,
        milestone_reminder: existing.milestoneReminder
      });
    } catch (err: any) {
      console.warn('Supabase savePreferences failed, updated memory only:', err.message || err);
    }
    return existing;
  }

  // ==========================================
  // REST API ENDPOINTS
  // ==========================================

  // Supabase Connection Health Status
  app.get('/api/supabase-status', async (req: Request, res: Response) => {
    try {
      console.log('DEBUG: Current SUPABASE_URL in server.ts:', SUPABASE_URL);
      console.log('DEBUG: Current SUPABASE_KEY prefix in server.ts:', SUPABASE_KEY ? SUPABASE_KEY.substring(0, 10) + '...' : 'undefined');
      
      const { error } = await supabase.from('app_profiles').select('id').limit(1);
      if (error) {
        return res.json({
          connected: false,
          error: error.message,
          url: SUPABASE_URL,
          keyLength: SUPABASE_KEY ? SUPABASE_KEY.length : 0,
          keyPrefix: SUPABASE_KEY ? SUPABASE_KEY.substring(0, 5) : '',
          hint: 'Tabel app_profiles belum ada. Silakan salin & jalankan skrip SQL skema di Supabase SQL Editor Anda.'
        });
      }
      res.json({
        connected: true,
        url: SUPABASE_URL,
        project: 'vtquhqdfyirccxdzmpyr',
        info: 'Supabase terhubung dengan sukses secara real-time!'
      });
    } catch (err: any) {
      res.json({
        connected: false,
        error: err.message || 'Network/Connection error',
        url: SUPABASE_URL,
        hint: 'Periksa variabel lingkungan Supabase Anda.'
      });
    }
  });

  // Auth / Profile Endpoints
  app.post('/api/auth/register', async (req: Request, res: Response) => {
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
        await supabase.from('app_profiles').upsert({
          id: userId,
          full_name: newProfile.fullName,
          phone_whatsapp: newProfile.phoneWhatsapp,
          email: newProfile.email,
          city: newProfile.city,
          role: newProfile.role,
        });
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
        id: 'n_welcome_' + Date.now(),
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

  app.get('/api/profile', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const prof = await getProfile(userId);
    res.json(prof);
  });

  app.put('/api/profile', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const prof = await updateProfile(userId, req.body);
    res.json(prof);
  });

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
        id: 'c_' + Date.now(),
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
        id: 'c_fallback_' + Date.now(),
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
      const updated = { ...list[index], ...req.body };
      await saveChild(updated);
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Child not found' });
    }
  });

  app.delete('/api/children/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    await deleteChild(id);
    res.json({ success: true });
  });

  // Growth Records Endpoints
  app.get('/api/growth/:childId', async (req: Request, res: Response) => {
    const { childId } = req.params;
    const records = await getGrowthRecords(childId);
    res.json(records);
  });

  app.post('/api/growth', async (req: Request, res: Response) => {
    const record: GrowthRecord = {
      id: 'g_' + Date.now(),
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
    await deleteGrowthRecord(id);
    res.json({ success: true });
  });

  // Milestone Progress Endpoints
  app.get('/api/milestones/:childId', async (req: Request, res: Response) => {
    const { childId } = req.params;
    const list = await getChildMilestones(childId);
    res.json(list);
  });

  app.post('/api/milestones/toggle', async (req: Request, res: Response) => {
    const { childId, milestoneId, achieved } = req.body;
    
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
        id: 'cm_' + Date.now(),
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
    const list = await getChildImmunizations(childId);
    res.json(list);
  });

  app.post('/api/immunization/toggle', async (req: Request, res: Response) => {
    const { childId, immunizationId, givenDate, proofPhotoUrl } = req.body;

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
        id: 'ci_' + Date.now(),
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
    const list = await getScreenings(childId);
    res.json(list);
  });

  app.post('/api/screenings', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const activeProf = await getProfile(userId);
    const screening: Screening = {
      id: 's_' + Date.now(),
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
      const newNotif: Notification = {
        id: 'n_' + Date.now(),
        parentId: activeProf.id,
        type: 'screening',
        title: `Peringatan Skrining: ${screening.type.toUpperCase()}`,
        body: `Hasil skrining ${screening.type.toUpperCase()} Aiden menunjukkan indikasi ${screening.result.replace('_', ' ')}. Silakan tinjau rekomendasi terapi & konsultasi psikolog kami.`,
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
    // Return all public questions plus active user's questions
    const filtered = list.filter(q => q.isPublic || q.parentId === activeProf.id);
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
        message: 'Anda telah mencapai batas 3 pertanyaan gratis bulan ini. Pilihan konsultasi langsung di klinik FlourishCare selalu terbuka untuk Anda!' 
      });
    }

    const newQuestion: Question = {
      id: 'q_' + Date.now(),
      parentId,
      childId: req.body.childId || null,
      questionText: req.body.questionText,
      status: 'pending',
      isPublic: req.body.isPublic ?? true,
      createdAt: new Date().toISOString()
    };
    await saveQuestion(newQuestion);

    // Trigger AI Answer Generation asynchronously on behalf of the expert clinic
    setTimeout(async () => {
      try {
        let expertAnswer = '';
        if (ai) {
          const prompt = `Anda adalah tim expert FlourishCare, sebuah klinik tumbuh kembang anak terkemuka di Indonesia yang diisi oleh psikolog klinis anak dan terapis profesional (Okupasi, Wicara, Sensori Integrasi). 
Pertanyaan dari Orang Tua (Ibu/Ayah): "${newQuestion.questionText}"

Tugas Anda adalah menulis jawaban yang:
1. SANGAT ramah, empatik, hangat, menenangkan namun profesional secara medis.
2. Berikan analisis awal berbasis keilmuan tumbuh kembang (psikologi anak/pediatrik) namun ingatkan bahwa ini adalah deteksi dini, BUKAN diagnosis medis final.
3. Sebutkan domain perkembangan yang terpengaruh (misal: sensori integrasi, bahasa, motorik kasar).
4. Berikan 2-3 tips stimulasi praktis yang bisa dilakukan orang tua di rumah secara mandiri.
5. Arahkan dengan lembut di bagian akhir untuk melakukan booking konsultasi dengan psikolog atau terapis okupasi/wicara FlourishCare untuk pemeriksaan diagnostik komprehensif.

Gunakan bahasa Indonesia yang santun, runtut, dan terstruktur rapi dengan paragraf-paragraf yang enak dibaca.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
              systemInstruction: 'Anda adalah Ira Amanda, M.Psi., Psikolog Klinis Anak Senior di Klinik FlourishCare. Berikan jawaban konsultasi tumbuh kembang anak yang kredibel, menyejukkan hati orang tua, informatif, dan mengarahkan untuk deteksi dini yang tepat.',
              temperature: 0.7
            }
          });

          expertAnswer = response.text || '';
        }

        // Fallback if AI fails or key is missing
        if (!expertAnswer) {
          expertAnswer = `Halo Bapak/Ibu. Terima kasih atas pertanyaan yang dikirimkan. Keluhan ini menunjukkan adanya kebutuhan stimulasi yang terarah pada domain yang dikhawatirkan. Di rumah, Anda dapat meluangkan waktu 15-30 menit per hari tanpa gawai untuk mengajak anak berbicara tatap muka secara ekspresif atau melatih sensorinya dengan Sensory Play sederhana. Kami sangat menyarankan agar Bapak/Ibu segera menjadwalkan konsultasi evaluasi tumbuh kembang tatap muka dengan psikolog anak atau terapis kami di Klinik FlourishCare untuk diagnosis yang komprehensif dan terapi penunjang yang tepat.`;
        }

        // Update question in database
        const qList = await getQuestions();
        const qIndex = qList.findIndex(q => q.id === newQuestion.id);
        if (qIndex !== -1) {
          const updatedQ = {
            ...qList[qIndex],
            status: 'answered' as const,
            answerText: expertAnswer,
            answeredBy: 'Ira Amanda, M.Psi., Psikolog',
            answeredAt: new Date().toISOString()
          };
          await saveQuestion(updatedQ);

          // Add in-app notification
          const newNotif: Notification = {
            id: 'n_' + Date.now(),
            parentId: activeProf.id,
            type: 'q_and_a',
            title: 'Tanya Ahli Terjawab!',
            body: `Pertanyaan Anda mengenai tumbuh kembang anak telah dijawab oleh Ira Amanda, M.Psi., Psikolog.`,
            deepLink: 'experts',
            read: false,
            createdAt: new Date().toISOString()
          };
          await addNotification(newNotif);
        }
      } catch (err) {
        console.error('Failed to generate expert response with Gemini:', err);
      }
    }, 4000); // 4 seconds delay to simulate real expert reviewing

    res.status(201).json(newQuestion);
  });

  app.post('/api/questions/answer-ai', async (req: Request, res: Response) => {
    const { questionId } = req.body;
    const qList = await getQuestions();
    const q = qList.find(item => item.id === questionId);
    if (!q) {
      return res.status(404).json({ error: 'Question not found' });
    }

    try {
      let draftText = '';
      if (ai) {
        const prompt = `Anda adalah asisten AI dari Ira Amanda, M.Psi., Psikolog Anak di Klinik FlourishCare.
Tuliskan draf jawaban klinis untuk pertanyaan orang tua berikut:
"${q.questionText}"

Draf jawaban harus sangat hangat, empatik, kredibel secara medis/psikologis, memuat 2 tips stimulasi mandiri di rumah, dan merekomendasikan konsultasi langsung ke terapis/psikolog di Klinik Tebet atau Telekonsultasi jika dibutuhkan.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            temperature: 0.6
          }
        });
        draftText = response.text || '';
      }

      if (!draftText) {
        draftText = `Halo Bunda, terima kasih atas pertanyaannya. Menanggapi kondisi si Kecil, hal tersebut wajar namun perlu dilatih secara aktif. Di rumah, silakan lakukan stimulasi bicara tatap muka selama 15 menit tanpa screen-time, serta latih otot wicaranya dengan meniup balon atau sedotan. Bila keluhan berlanjut dalam 2 minggu, kami sarankan konsultasi tatap muka bersama Psikolog Anak atau Terapis Wicara kami di Klinik FlourishCare Tebet.`;
      }

      res.json({ draftText });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to draft AI response', details: err.message });
    }
  });

  app.post('/api/questions/:id/answer', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { expertId, answerText } = req.body;
    const userId = getUserId(req);
    const activeProf = await getProfile(userId);
    const qList = await getQuestions();
    const index = qList.findIndex(q => q.id === id);
    if (index !== -1) {
      const updatedQ = {
        ...qList[index],
        status: 'answered' as const,
        answerText,
        answeredBy: expertId === 'exp_ira' ? 'Ira Amanda, M.Psi., Psikolog' : 'Rian Hidayat, A.Md.OT',
        answeredAt: new Date().toISOString()
      };
      await saveQuestion(updatedQ);

      // Notify
      const newNotif: Notification = {
        id: 'n_' + Date.now(),
        parentId: activeProf.id,
        type: 'q_and_a',
        title: 'Tanya Ahli Terjawab!',
        body: `Pertanyaan Anda telah dijawab langsung oleh psikolog anak kami.`,
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
    const code = 'FC-' + req.body.serviceType.toUpperCase().substring(0,2) + '-' + Math.floor(1000 + Math.random() * 9000);
    const amountMap: Record<string, number> = {
      'onsite': 250000,
      'home_visit': 350000,
      'psikolog': 300000,
      'psikotes': 450000,
      'teleconsultation': 150000
    };

    const newBooking: Booking = {
      id: 'b_' + Date.now(),
      parentId: userId,
      childId: req.body.childId,
      serviceType: req.body.serviceType,
      subService: req.body.subService,
      packageName: req.body.packageName || 'Sesi Tunggal (Evaluasi/Asesmen)',
      therapistId: req.body.therapistId || null,
      therapistName: req.body.therapistName || 'Terapis Jadwal Terbaik',
      scheduledAt: req.body.scheduledAt,
      status: 'pending',
      amount: amountMap[req.body.serviceType] || 250000,
      paymentStatus: 'unpaid',
      midtransOrderId: 'FC-' + Date.now(),
      bookingCode: code,
      createdAt: new Date().toISOString()
    };

    await saveBooking(newBooking);

    // Create a pending booking notification
    const newNotif: Notification = {
      id: 'n_' + Date.now(),
      parentId: userId,
      type: 'booking',
      title: 'Booking Berhasil Dibuat',
      body: `Booking ${newBooking.subService} untuk anak Anda telah dibuat. Selesaikan pembayaran DP/Lunas untuk konfirmasi jadwal. Kode: ${newBooking.bookingCode}`,
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
        id: 'n_' + Date.now(),
        parentId: userId,
        type: 'booking',
        title: 'Pembayaran Dikonfirmasi!',
        body: `Pembayaran Rp ${updated.amount.toLocaleString('id-ID')} untuk booking ${updated.subService} telah diverifikasi. Sampai jumpa di klinik!`,
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
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
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
