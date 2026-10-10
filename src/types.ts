export interface UserProfile {
  id: string;
  fullName: string;
  phoneWhatsapp: string;
  email: string;
  city: string;
  role: 'parent' | 'caregiver';
  createdAt: string;
  /** Clinic staff (psychologist or therapist) can answer Tanya Ahli questions */
  isStaff?: boolean;
  /** Photo from Google sign-in, when available */
  avatarUrl?: string;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  /** Date of birth. For a pregnancy profile this holds the due date (HPL) until the baby is born. */
  birthDate: string;
  /** HPL (hari perkiraan lahir) for a pregnancy profile */
  expectedDueDate?: string;
  gender: 'L' | 'P'; // Laki-laki / Perempuan
  /** Signed URL of the profile photo (short lived) */
  photoUrl?: string;
  isPremature: boolean;
  medicalNotes?: string;
  createdAt: string;
  /** Still in the womb: the app shows the pregnancy tracker instead of child features */
  isUnborn?: boolean;
  /** HPHT (hari pertama haid terakhir), when known */
  lmpDate?: string;
  /** Gestational age at birth in weeks, used for corrected age */
  gestationalWeeks?: number;
  allergies?: string;
  bloodType?: string;
  /** Server only: storage path of the photo */
  photoPath?: string;
}

export interface GrowthRecord {
  id: string;
  childId: string;
  date: string;
  weightKg: number;
  heightCm: number;
  headCircumferenceCm: number;
  notes?: string;
  createdAt: string;
}

export type MilestoneDomain = 'motorik_kasar' | 'motorik_halus' | 'bahasa' | 'sosial_emosional';

export interface MilestoneReference {
  id: string;
  domain: MilestoneDomain;
  ageMonthMin: number;
  ageMonthMax: number;
  description: string;
  exampleVideoUrl?: string;
}

export interface ChildMilestone {
  id: string;
  childId: string;
  milestoneId: string;
  achieved: boolean;
  achievedDate?: string;
  createdAt: string;
}

export interface ImmunizationReference {
  id: string;
  vaccineName: string;
  recommendedAgeMonth: number;
  description: string;
}

export interface ChildImmunization {
  id: string;
  childId: string;
  immunizationId: string;
  givenDate?: string;
  proofPhotoUrl?: string;
  createdAt: string;
}

export type ScreeningType = 'kpsp' | 'tdd' | 'speech_delay' | 'autism_signs' | 'sensory' | 'gpph' | 'mchat_r';

export interface Screening {
  id: string;
  childId: string;
  type: ScreeningType;
  ageMonthAtTest: number;
  answers: Record<string, 'Ya' | 'Tidak' | boolean | string | number>;
  score: number;
  result: 'normal' | 'meragukan' | 'penyimpangan' | 'risiko_rendah' | 'risiko_sedang' | 'risiko_tinggi';
  recommendation: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  ageRange: string;
  body: string; // HTML or Markdown
  coverImageUrl?: string;
  authorName: string;
  authorCredential: string;
  reviewedBy?: string;
  publishedAt: string;
  seoMeta?: {
    title: string;
    description: string;
  };
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  category: string;
  ageRange: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  authorName: string;
  publishedAt: string;
}

export interface Activity {
  id: string;
  title: string;
  domain: string;
  ageMonthMin: number;
  ageMonthMax: number;
  steps: string[];
  videoUrl?: string;
  rationale: string;
  relatedScreeningResult?: string;
}

export interface ChildActivity {
  id: string;
  childId: string;
  activityId: string;
  completed: boolean;
  completedDate?: string;
}

export interface Question {
  id: string;
  parentId: string;
  childId?: string;
  questionText: string;
  status: 'pending' | 'answered' | 'published';
  answerText?: string;
  answeredBy?: string;
  isPublic: boolean;
  category?: string;
  createdAt: string;
  answeredAt?: string;
}

export type BookingServiceType = 'onsite' | 'home_visit' | 'psikolog' | 'psikotes' | 'teleconsultation';
export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  parentId: string;
  childId: string;
  serviceType: BookingServiceType;
  subService: string;
  packageName?: string;
  therapistId?: string;
  therapistName?: string;
  scheduledAt: string;
  status: BookingStatus;
  amount: number;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  midtransOrderId: string;
  bookingCode: string;
  createdAt: string;
  /** Optional booking details captured by the 6-step flow */
  address?: string;
  paymentMethod?: string;
}

export interface Notification {
  id: string;
  parentId: string;
  type: 'immunization' | 'milestone' | 'screening' | 'booking' | 'q_and_a' | 'weekly_digest' | 'system';
  title: string;
  body: string;
  deepLink?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  id: string;
  parentId: string;
  pushEnabled: boolean;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  weeklyDigest: boolean;
  immunizationReminder: boolean;
  milestoneReminder: boolean;
}

export type BabyLogKind = 'feed' | 'sleep' | 'diaper' | 'pump' | 'kick';

export interface BabyLog {
  id: string;
  childId: string;
  kind: BabyLogKind;
  /** feed: breast_left | breast_right | bottle_asi | bottle_formula | solid; diaper: wet | dirty | both; pump: left | right | both */
  detail?: string;
  startedAt: string;
  /** Empty while a timer is running */
  endedAt?: string | null;
  amountMl?: number | null;
  count?: number | null;
  note?: string;
  createdAt: string;
}

export interface MediaItem {
  path: string;
  type: 'image' | 'video';
  /** Signed URL, filled in by the server when listing */
  url?: string;
  width?: number;
  height?: number;
}

export type JournalCategory = 'momen_pertama' | 'makan' | 'tidur' | 'emosi' | 'kesehatan' | 'hari_spesial' | 'catatan';

export interface JournalEntry {
  id: string;
  childId: string;
  date: string;
  category: JournalCategory;
  title?: string;
  body?: string;
  media: MediaItem[];
  createdAt: string;
}
