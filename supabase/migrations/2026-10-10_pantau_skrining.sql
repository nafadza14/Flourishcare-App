-- FlourishCare parent app: Pantau dan Skrining (v1.6)
-- Aman dijalankan berulang kali.

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
