-- FlourishCare parent app: tables
CREATE TABLE IF NOT EXISTS app_profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_whatsapp TEXT,
  email TEXT,
  city TEXT,
  role TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_children (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  expected_due_date TEXT,
  gender TEXT,
  photo_url TEXT,
  is_premature BOOLEAN DEFAULT FALSE,
  medical_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_growth_records (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  weight_kg NUMERIC(5,2) NOT NULL,
  height_cm NUMERIC(5,2) NOT NULL,
  head_circumference_cm NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_child_milestones (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  achieved BOOLEAN DEFAULT TRUE,
  achieved_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_child_immunizations (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  immunization_id TEXT NOT NULL,
  given_date TEXT,
  proof_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_screenings (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  age_month_at_test INTEGER NOT NULL,
  answers JSONB,
  score INTEGER,
  result TEXT,
  recommendation TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_questions (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  child_id TEXT,
  question_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  answer_text TEXT,
  answered_by TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);
ALTER TABLE app_questions ADD COLUMN IF NOT EXISTS category TEXT;

CREATE TABLE IF NOT EXISTS app_bookings (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  sub_service TEXT NOT NULL,
  package_name TEXT,
  therapist_id TEXT,
  therapist_name TEXT,
  scheduled_at TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'unpaid',
  midtrans_order_id TEXT,
  booking_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_bookings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE app_bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;

CREATE TABLE IF NOT EXISTS app_notifications (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES app_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  deep_link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_preferences (
  parent_id TEXT PRIMARY KEY REFERENCES app_profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  immunization_reminder BOOLEAN DEFAULT TRUE,
  milestone_reminder BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS app_children_parent_idx ON app_children(parent_id);
CREATE INDEX IF NOT EXISTS app_growth_child_idx ON app_growth_records(child_id);
CREATE INDEX IF NOT EXISTS app_milestones_child_idx ON app_child_milestones(child_id);
CREATE INDEX IF NOT EXISTS app_immunizations_child_idx ON app_child_immunizations(child_id);
CREATE INDEX IF NOT EXISTS app_screenings_child_idx ON app_screenings(child_id);
CREATE INDEX IF NOT EXISTS app_questions_parent_idx ON app_questions(parent_id);
CREATE INDEX IF NOT EXISTS app_bookings_parent_idx ON app_bookings(parent_id);
CREATE INDEX IF NOT EXISTS app_notifications_parent_idx ON app_notifications(parent_id);

-- Child health data stays private: no public access, only the server (secret key) can read or write
ALTER TABLE app_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_child_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_child_immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_preferences ENABLE ROW LEVEL SECURITY;


-- v1.6: Pantau dan Skrining

-- Profil anak: kehamilan, riwayat lahir, alergi, golongan darah
ALTER TABLE app_children ADD COLUMN IF NOT EXISTS is_unborn BOOLEAN DEFAULT FALSE;
ALTER TABLE app_children ADD COLUMN IF NOT EXISTS lmp_date TEXT;
ALTER TABLE app_children ADD COLUMN IF NOT EXISTS gestational_weeks INTEGER;
ALTER TABLE app_children ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE app_children ADD COLUMN IF NOT EXISTS blood_type TEXT;

-- Jurnal dan album foto
CREATE TABLE IF NOT EXISTS app_journal_entries (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT,
  body TEXT,
  media JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catatan harian bayi: menyusu, tidur, popok, pompa ASI, gerakan janin
CREATE TABLE IF NOT EXISTS app_baby_logs (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  detail TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  amount_ml INTEGER,
  count INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS app_journal_child_idx ON app_journal_entries(child_id, date DESC);
CREATE INDEX IF NOT EXISTS app_baby_logs_child_idx ON app_baby_logs(child_id, started_at DESC);

ALTER TABLE app_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_baby_logs ENABLE ROW LEVEL SECURITY;
