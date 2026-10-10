import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Database } from 'lucide-react';
import Sheet from '../ui/Sheet';
import { Button, StatusPill } from '../ui/primitives';
import FlourishCareLogo from '../FlourishCareLogo';
import { SCHEMA_SQL } from '../../data/schemaSql';
import { getJSON } from '../../api';

interface DbStatus {
  connected: boolean;
  tablesReady?: boolean;
  secretKey?: boolean;
  error?: string;
  hint?: string;
}

export const APP_VERSION = '1.4.0';

/** About the app. The database panel is only shown to clinic staff (setup help). */
export default function AboutSheet({ open, onClose, showAdmin = false }: { open: boolean; onClose: () => void; showAdmin?: boolean }) {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !showAdmin) return;
    setStatus(null);
    getJSON<DbStatus>('/api/supabase-status', { connected: false, error: 'Server tidak merespons' }).then(setStatus);
  }, [open, showAdmin]);

  const ready = !!status?.tablesReady && !!status?.secretKey;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SCHEMA_SQL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setShowSql(true);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Tentang FlourishCare">
      <div className="space-y-4 pt-1">
        <div className="flex flex-col items-center text-center py-2">
          <motion.div initial={{ scale: 0.8, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
            <FlourishCareLogo className="w-20 h-20" animated />
          </motion.div>
          <div className="text-[22px] mt-2">FlourishCare</div>
          <div className="text-[14px] text-mute">Aplikasi tumbuh kembang anak · versi {APP_VERSION}</div>
        </div>
        <p className="text-[16px] text-ink-2 leading-relaxed">
          FlourishCare membantu Ayah Bunda memantau pertumbuhan, milestone, imunisasi, dan skrining dini si Kecil. Saat butuh bantuan lebih, psikolog dan terapis FlourishCare di Klinik Mitra Diani, Jakarta Timur, siap mendampingi.
        </p>

        {showAdmin && (
        <div className="bg-white rounded-[20px] border border-line p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-[16px]">
              <Database className="w-[18px] h-[18px] text-ink-2" strokeWidth={1.7} />
              Database (khusus tim)
            </span>
            {status === null ? (
              <StatusPill>Memeriksa</StatusPill>
            ) : ready ? (
              <StatusPill tone="success">Tersimpan permanen</StatusPill>
            ) : (
              <StatusPill tone="warning">Perlu pengaturan</StatusPill>
            )}
          </div>
          <p className="text-[14px] text-mute leading-relaxed mt-2">
            {status === null
              ? 'Memeriksa koneksi Supabase...'
              : ready
                ? 'Data aplikasi tersimpan di Supabase dan dilindungi Row Level Security.'
                : status.hint || 'Data belum tersimpan permanen. Jalankan skema SQL di Supabase SQL Editor dan isi SUPABASE_SECRET_KEY di Vercel.'}
          </p>
          {status && !ready && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="soft" icon={copied ? Check : Copy} onClick={copy}>
                {copied ? 'Tersalin' : 'Salin skema SQL'}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowSql((v) => !v)}>
                {showSql ? 'Sembunyikan' : 'Lihat'}
              </Button>
            </div>
          )}
          <AnimatePresence initial={false}>
            {showSql && (
              <motion.pre
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 220, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 overflow-auto rounded-[14px] bg-ink text-white/85 text-[11px] leading-relaxed p-3 font-mono selectable whitespace-pre"
              >
                {SCHEMA_SQL}
              </motion.pre>
            )}
          </AnimatePresence>
        </div>
        )}
        <p className="text-[13px] text-mute text-center leading-relaxed">Aplikasi resmi klinik FlourishCare. Konten bersifat edukatif dan bukan pengganti pemeriksaan langsung.</p>
      </div>
    </Sheet>
  );
}
