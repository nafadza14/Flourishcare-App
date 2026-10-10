/** Supabase schema used by server.ts (tables prefixed app_). Shown in Tentang FlourishCare for setup. */
export const SCHEMA_SQL = `CREATE TABLE IF NOT EXISTS app_profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_whatsapp TEXT,
  email TEXT,
  city TEXT,
  role TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_profiles (id, full_name, phone_whatsapp, email, city, role)
VALUES ('u_amanda', 'Amanda Kartika', '+628123456789', 'amanda.kartika@flourishcare.id', 'Jakarta Selatan', 'parent')
ON CONFLICT (id) DO NOTHING;

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

INSERT INTO app_children (id, parent_id, name, birth_date, gender, is_premature, medical_notes)
VALUES ('c_aiden', 'u_amanda', 'Aiden Syahputra', '2025-10-15', 'L', false, 'Alergi dingin ringan, perlu stimulasi motorik kasar lebih sering.')
ON CONFLICT (id) DO NOTHING;

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

INSERT INTO app_growth_records (id, child_id, date, weight_kg, height_cm, head_circumference_cm, notes)
VALUES 
  ('g_1', 'c_aiden', '2025-11-15', 3.8, 52, 36.5, 'Berat lahir normal, grafik KMS di area hijau.'),
  ('g_2', 'c_aiden', '2025-12-15', 4.5, 55, 38, 'Pertumbuhan linear sangat baik, mulai belajar tersenyum.'),
  ('g_3', 'c_aiden', '2026-01-15', 5.2, 58, 39.5, 'Kontrol leher semakin tegak.'),
  ('g_4', 'c_aiden', '2026-02-15', 6.0, 61, 41, 'Berat badan optimal.'),
  ('g_5', 'c_aiden', '2026-03-15', 6.8, 63.5, 42, 'Refleks motorik aktif.'),
  ('g_6', 'c_aiden', '2026-04-15', 7.4, 65.2, 43, 'Siap masuk tahap stimulasi merangkak.'),
  ('g_7', 'c_aiden', '2026-05-15', 8.1, 67, 44, 'Grafik tumbuh kembang stabil.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_child_milestones (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  achieved BOOLEAN DEFAULT TRUE,
  achieved_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_child_milestones (id, child_id, milestone_id, achieved, achieved_date)
VALUES 
  ('cm_1', 'c_aiden', 'motorik_halus_3', true, '2026-01-10'),
  ('cm_2', 'c_aiden', 'sosial_3', true, '2026-01-14')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS app_child_immunizations (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES app_children(id) ON DELETE CASCADE,
  immunization_id TEXT NOT NULL,
  given_date TEXT,
  proof_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_child_immunizations (id, child_id, immunization_id, given_date)
VALUES 
  ('ci_1', 'c_aiden', 'bcg_1', '2025-11-20'),
  ('ci_2', 'c_aiden', 'polio_1', '2025-11-20'),
  ('ci_3', 'c_aiden', 'dpt_1', '2025-12-15')
ON CONFLICT (id) DO NOTHING;

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

INSERT INTO app_screenings (id, child_id, type, age_month_at_test, answers, score, result, recommendation)
VALUES ('s_1', 'c_aiden', 'kpsp', 6, '{"q1":true,"q2":true,"q3":true,"q4":true,"q5":true,"q6":false,"q7":true,"q8":true,"q9":true,"q10":false}', 8, 'meragukan', 'Bunda disarankan melatih stimulasi motorik kasar secara berkala selama 2 minggu, lalu ulangi KPSP.')
ON CONFLICT (id) DO NOTHING;

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

INSERT INTO app_questions (id, parent_id, child_id, question_text, status, answer_text, answered_by, is_public, created_at, answered_at)
VALUES 
  ('q_seed_1', 'u_amanda', 'c_aiden', 'Bagaimana cara menstimulasi bayi 6 bulan yang belum bisa tengkurap sendiri secara lancar?', 'answered', 'Halo Ibu Amanda. Pada usia 6 bulan, stimulasi tummy-time terarah sangat penting. Sediakan matras datar, letakkan mainan berbunyi di depannya untuk menarik perhatian agar mendongak & menggerakkan badan. Anda juga bisa membantu mendorong bokongnya perlahan untuk mencontohkan gerakan berguling. Lakukan 3-5 kali sehari saat si kecil segar.', 'Ira Amanda, M.Psi., Psikolog', true, '2026-06-25T10:00:00Z', '2026-06-25T10:15:00Z'),
  ('q_seed_2', 'u_amanda', NULL, 'Anak umur 2 tahun sering tantrum kalau keinginannya tidak dituruti. Apakah ini normal?', 'answered', 'Halo Bunda. Sangat normal! Usia 2 tahun adalah fase eksplorasi tinggi ("terrible twos"). Saat tantrum, pastikan lingkungan aman, sejajarkan tinggi mata Anda, tenangkan diri Anda dulu, dan tawarkan pelukan empati ("Bunda tahu kamu kecewa"). Jangan mendebat saat ia emosi tinggi.', 'Ira Amanda, M.Psi., Psikolog', true, '2026-06-28T14:30:00Z', '2026-06-28T14:45:00Z')
ON CONFLICT (id) DO NOTHING;

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

INSERT INTO app_bookings (id, parent_id, child_id, service_type, sub_service, package_name, therapist_id, therapist_name, scheduled_at, status, amount, payment_status, booking_code)
VALUES ('b_seed_1', 'u_amanda', 'c_aiden', 'onsite', 'Asesmen Tumbuh Kembang Psikolog', 'Sesi Tunggal (Evaluasi/Asesmen)', 'exp_ira', 'Ira Amanda, M.Psi., Psikolog', '2026-07-05T10:00', 'pending', 300000.00, 'unpaid', 'FC-PS-8924')
ON CONFLICT (id) DO NOTHING;

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

INSERT INTO app_notifications (id, parent_id, type, title, body, deep_link, read)
VALUES 
  ('n_seed_1', 'u_amanda', 'system', 'Selamat Datang di FlourishCare!', 'Kami siap menemani perjalanan tumbuh kembang si Kecil secara optimal & berbasis bukti klinis.', 'home', false),
  ('n_seed_2', 'u_amanda', 'screening', 'Hasil Skrining Aiden Selesai', 'Skrining KPSP 6 Bulan menunjukkan hasil "Meragukan". Lihat tips stimulasi dari terapis kami.', 'screenings', false)
ON CONFLICT (id) DO NOTHING;

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

INSERT INTO app_preferences (parent_id, push_enabled, whatsapp_enabled, email_enabled, weekly_digest, immunization_reminder, milestone_reminder)
VALUES ('u_amanda', true, true, true, true, true, true)
ON CONFLICT (parent_id) DO NOTHING;`;
