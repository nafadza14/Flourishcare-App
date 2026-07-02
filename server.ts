import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
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

async function startServer() {
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
  // REST API ENDPOINTS
  // ==========================================

  // Auth / Profile Endpoints
  app.get('/api/profile', (req: Request, res: Response) => {
    res.json(activeProfile);
  });

  app.put('/api/profile', (req: Request, res: Response) => {
    activeProfile = { ...activeProfile, ...req.body };
    res.json(activeProfile);
  });

  // Children Endpoints
  app.get('/api/children', (req: Request, res: Response) => {
    res.json(children);
  });

  app.post('/api/children', (req: Request, res: Response) => {
    const newChild: Child = {
      id: 'c_' + Date.now(),
      parentId: activeProfile.id,
      name: req.body.name,
      birthDate: req.body.birthDate,
      gender: req.body.gender,
      isPremature: req.body.isPremature || false,
      medicalNotes: req.body.medicalNotes || '',
      expectedDueDate: req.body.expectedDueDate,
      createdAt: new Date().toISOString()
    };
    children.push(newChild);
    res.status(201).json(newChild);
  });

  app.put('/api/children/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = children.findIndex(c => c.id === id);
    if (index !== -1) {
      children[index] = { ...children[index], ...req.body };
      res.json(children[index]);
    } else {
      res.status(404).json({ error: 'Child not found' });
    }
  });

  app.delete('/api/children/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    children = children.filter(c => c.id !== id);
    growthRecords = growthRecords.filter(g => g.childId !== id);
    childMilestones = childMilestones.filter(m => m.childId !== id);
    childImmunizations = childImmunizations.filter(i => i.childId !== id);
    screenings = screenings.filter(s => s.childId !== id);
    res.json({ success: true });
  });

  // Growth Records Endpoints
  app.get('/api/growth/:childId', (req: Request, res: Response) => {
    const { childId } = req.params;
    const records = growthRecords.filter(g => g.childId === childId).sort((a,b) => a.date.localeCompare(b.date));
    res.json(records);
  });

  app.post('/api/growth', (req: Request, res: Response) => {
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
    growthRecords.push(record);
    res.status(201).json(record);
  });

  app.delete('/api/growth/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    growthRecords = growthRecords.filter(g => g.id !== id);
    res.json({ success: true });
  });

  // Milestone Progress Endpoints
  app.get('/api/milestones/:childId', (req: Request, res: Response) => {
    const { childId } = req.params;
    res.json(childMilestones.filter(m => m.childId === childId));
  });

  app.post('/api/milestones/toggle', (req: Request, res: Response) => {
    const { childId, milestoneId, achieved } = req.body;
    
    const existingIndex = childMilestones.findIndex(
      m => m.childId === childId && m.milestoneId === milestoneId
    );

    if (existingIndex !== -1) {
      if (!achieved) {
        // Remove item
        childMilestones.splice(existingIndex, 1);
        res.json({ achieved: false });
      } else {
        childMilestones[existingIndex].achievedDate = new Date().toISOString().split('T')[0];
        res.json(childMilestones[existingIndex]);
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
      childMilestones.push(newCheck);
      res.status(201).json(newCheck);
    } else {
      res.json({ achieved: false });
    }
  });

  // Immunization Endpoints
  app.get('/api/immunization/:childId', (req: Request, res: Response) => {
    const { childId } = req.params;
    res.json(childImmunizations.filter(i => i.childId === childId));
  });

  app.post('/api/immunization/toggle', (req: Request, res: Response) => {
    const { childId, immunizationId, givenDate, proofPhotoUrl } = req.body;

    const existingIndex = childImmunizations.findIndex(
      i => i.childId === childId && i.immunizationId === immunizationId
    );

    if (existingIndex !== -1) {
      if (!givenDate) {
        // Untoggle / delete vaccine date
        childImmunizations.splice(existingIndex, 1);
        res.json({ given: false });
      } else {
        childImmunizations[existingIndex].givenDate = givenDate;
        childImmunizations[existingIndex].proofPhotoUrl = proofPhotoUrl || childImmunizations[existingIndex].proofPhotoUrl;
        res.json(childImmunizations[existingIndex]);
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
      childImmunizations.push(newImm);
      res.status(201).json(newImm);
    } else {
      res.json({ given: false });
    }
  });

  // Clinical Screenings Endpoints
  app.get('/api/screenings/:childId', (req: Request, res: Response) => {
    const { childId } = req.params;
    res.json(screenings.filter(s => s.childId === childId).sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
  });

  app.post('/api/screenings', (req: Request, res: Response) => {
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
    screenings.push(screening);

    // Create a notification for red flag or alert
    if (screening.result.includes('risiko_tinggi') || screening.result === 'penyimpangan' || screening.result === 'risiko_sedang' || screening.result === 'meragukan') {
      notifications.unshift({
        id: 'n_' + Date.now(),
        parentId: activeProfile.id,
        type: 'screening',
        title: `Peringatan Skrining: ${screening.type.toUpperCase()}`,
        body: `Hasil skrining ${screening.type.toUpperCase()} Aiden menunjukkan indikasi ${screening.result.replace('_', ' ')}. Silakan tinjau rekomendasi terapi & konsultasi psikolog kami.`,
        deepLink: 'screenings',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    res.status(201).json(screening);
  });

  // Q&A / Tanya Ahli Endpoints
  app.get('/api/questions', (req: Request, res: Response) => {
    // Return all public questions plus active user's questions
    const list = questions.filter(q => q.isPublic || q.parentId === activeProfile.id);
    res.json(list.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
  });

  app.post('/api/questions', async (req: Request, res: Response) => {
    const parentId = activeProfile.id;
    
    // Enforce Monthly Q&A limit (max 3 questions per month per user)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0,0,0,0);
    const monthlyCount = questions.filter(
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
    questions.push(newQuestion);

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
        const qIndex = questions.findIndex(q => q.id === newQuestion.id);
        if (qIndex !== -1) {
          questions[qIndex].status = 'answered';
          questions[qIndex].answerText = expertAnswer;
          questions[qIndex].answeredBy = 'Ira Amanda, M.Psi., Psikolog';
          questions[qIndex].answeredAt = new Date().toISOString();

          // Add in-app notification
          notifications.unshift({
            id: 'n_' + Date.now(),
            parentId: activeProfile.id,
            type: 'q_and_a',
            title: 'Tanya Ahli Terjawab!',
            body: `Pertanyaan Anda mengenai tumbuh kembang anak telah dijawab oleh Ira Amanda, M.Psi., Psikolog.`,
            deepLink: 'experts',
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Failed to generate expert response with Gemini:', err);
      }
    }, 4000); // 4 seconds delay to simulate real expert reviewing

    res.status(201).json(newQuestion);
  });

  app.post('/api/questions/answer-ai', async (req: Request, res: Response) => {
    const { questionId } = req.body;
    const q = questions.find(item => item.id === questionId);
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

  app.post('/api/questions/:id/answer', (req: Request, res: Response) => {
    const { id } = req.params;
    const { expertId, answerText } = req.body;
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
      questions[index].status = 'answered';
      questions[index].answerText = answerText;
      questions[index].answeredBy = expertId === 'exp_ira' ? 'Ira Amanda, M.Psi., Psikolog' : 'Rian Hidayat, A.Md.OT';
      questions[index].answeredAt = new Date().toISOString();

      // Notify
      notifications.unshift({
        id: 'n_' + Date.now(),
        parentId: activeProfile.id,
        type: 'q_and_a',
        title: 'Tanya Ahli Terjawab!',
        body: `Pertanyaan Anda telah dijawab langsung oleh psikolog anak kami.`,
        deepLink: 'experts',
        read: false,
        createdAt: new Date().toISOString()
      });

      res.json(questions[index]);
    } else {
      res.status(404).json({ error: 'Question not found' });
    }
  });

  // Clinical Bookings Endpoints
  app.get('/api/bookings', (req: Request, res: Response) => {
    res.json(bookings.filter(b => b.parentId === activeProfile.id).sort((a,b) => b.scheduledAt.localeCompare(a.scheduledAt)));
  });

  app.post('/api/bookings', (req: Request, res: Response) => {
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
      parentId: activeProfile.id,
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

    bookings.unshift(newBooking);

    // Create a pending booking notification
    notifications.unshift({
      id: 'n_' + Date.now(),
      parentId: activeProfile.id,
      type: 'booking',
      title: 'Booking Berhasil Dibuat',
      body: `Booking ${newBooking.subService} untuk anak Anda telah dibuat. Selesaikan pembayaran DP/Lunas untuk konfirmasi jadwal. Kode: ${newBooking.bookingCode}`,
      deepLink: 'bookings',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(newBooking);
  });

  app.post('/api/bookings/:id/pay', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index].status = 'paid';
      bookings[index].paymentStatus = 'paid';
      
      // Notify payment successful
      notifications.unshift({
        id: 'n_' + Date.now(),
        parentId: activeProfile.id,
        type: 'booking',
        title: 'Pembayaran Dikonfirmasi!',
        body: `Pembayaran Rp ${bookings[index].amount.toLocaleString('id-ID')} untuk booking ${bookings[index].subService} telah diverifikasi. Sampai jumpa di klinik!`,
        deepLink: 'bookings',
        read: false,
        createdAt: new Date().toISOString()
      });

      res.json(bookings[index]);
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  });

  app.post('/api/bookings/:id/cancel', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index].status = 'cancelled';
      res.json(bookings[index]);
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  });

  // Notifications Endpoints
  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json(notifications.filter(n => n.parentId === activeProfile.id));
  });

  app.post('/api/notifications/read-all', (req: Request, res: Response) => {
    notifications.forEach(n => {
      if (n.parentId === activeProfile.id) {
        n.read = true;
      }
    });
    res.json({ success: true });
  });

  // Preferences Endpoints
  app.get('/api/preferences', (req: Request, res: Response) => {
    res.json(notificationPreferences);
  });

  app.put('/api/preferences', (req: Request, res: Response) => {
    notificationPreferences = { ...notificationPreferences, ...req.body };
    res.json(notificationPreferences);
  });


  // ==========================================
  // VITE DEVELOPMENT OR PRODUCTION MIDDLEWARE
  // ==========================================
  
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

startServer().catch((err) => {
  console.error('Failed to start fullstack FlourishCare server:', err);
});
