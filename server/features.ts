import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Pantau features that live in their own tables: kids journal (with photos and short videos
 * in Supabase Storage) and the baby tracker (feeding, sleep, diaper, pumping, kick counts).
 */

export const MEDIA_BUCKET = 'app-media';
const SIGN_SECONDS = 60 * 60 * 24;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const JOURNAL_CATEGORIES = ['momen_pertama', 'makan', 'tidur', 'emosi', 'kesehatan', 'hari_spesial', 'catatan'];
const LOG_KINDS = ['feed', 'sleep', 'diaper', 'pump', 'kick'];

export class MigrationNeededError extends Error {}

/** PostgREST errors for a missing table or column: the SQL migration has not been run yet */
export function isMissingSchemaError(err: any): boolean {
  if (!err) return false;
  const code = String(err.code || '');
  const msg = String(err.message || err).toLowerCase();
  return (
    code === 'PGRST204' ||
    code === 'PGRST205' ||
    code === '42703' ||
    code === '42P01' ||
    msg.includes('could not find the') ||
    (msg.includes('column') && msg.includes('does not exist')) ||
    (msg.includes('relation') && msg.includes('does not exist'))
  );
}

export interface FeatureDeps {
  app: Express;
  supabase: SupabaseClient;
  strictDb: boolean;
  uid: (prefix: string) => string;
  getUserId: (req: Request) => string;
  guardChild: (req: Request, res: Response, childId: unknown) => Promise<boolean>;
  failIfStrict: (err: any) => void;
}

interface MediaItem {
  path: string;
  type: 'image' | 'video';
  url?: string;
  width?: number;
  height?: number;
}

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

let bucketReady: Promise<void> | null = null;

function ensureBucket(supabase: SupabaseClient): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { error } = await supabase.storage.getBucket(MEDIA_BUCKET);
      if (!error) return;
      const { error: createError } = await supabase.storage.createBucket(MEDIA_BUCKET, { public: false, fileSizeLimit: MAX_VIDEO_BYTES });
      if (createError && !/already exists|duplicate/i.test(createError.message)) throw createError;
    })().catch((err) => {
      bucketReady = null;
      throw err;
    });
  }
  return bucketReady;
}

/** Short-lived URLs for private files, in one request */
export async function signPaths(supabase: SupabaseClient, paths: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return {};
  try {
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrls(unique, SIGN_SECONDS);
    if (error || !data) return {};
    const out: Record<string, string> = {};
    for (const row of data as { path: string | null; signedUrl: string | null }[]) if (row.path && row.signedUrl) out[row.path] = row.signedUrl;
    return out;
  } catch {
    return {};
  }
}

function extFor(contentType: string): string {
  return (
    { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm' } as Record<string, string>
  )[contentType] || 'bin';
}

/** Photo paths are stored as "storage:<path>" in app_children.photo_url */
export const STORAGE_PREFIX = 'storage:';

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

export function registerFeatureRoutes(deps: FeatureDeps) {
  const { app, supabase, uid, getUserId, guardChild, failIfStrict, strictDb } = deps;

  // Memory fallback for local development without the tables
  const mem = { journal: [] as any[], logs: [] as any[] };

  async function db<T>(op: () => Promise<{ data: any; error: any }>, fallback: () => T): Promise<T | any> {
    try {
      const { data, error } = await op();
      if (error) throw error;
      return data;
    } catch (err: any) {
      if (isMissingSchemaError(err) && strictDb) throw new MigrationNeededError(err.message || String(err));
      failIfStrict(err);
      return fallback();
    }
  }

  const ownsPath = (req: Request, childId: string, path: string) => path.startsWith(`${getUserId(req)}/${childId}/`);

  /* ---------------- Media upload ---------------- */

  app.post('/api/media/upload-url', async (req: Request, res: Response) => {
    const { childId, purpose, contentType, size } = req.body || {};
    if (!(await guardChild(req, res, childId))) return;
    const type = String(contentType || '');
    const isImage = IMAGE_TYPES.includes(type);
    const isVideo = VIDEO_TYPES.includes(type);
    if (!isImage && !isVideo) return res.status(400).json({ error: 'bad_type', message: 'Format file belum didukung. Gunakan foto JPG/PNG atau video MP4.' });
    const bytes = Number(size) || 0;
    if (bytes > (isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES)) {
      return res.status(400).json({ error: 'too_large', message: isImage ? 'Foto terlalu besar (maksimal 10 MB).' : 'Video terlalu besar (maksimal 50 MB, sekitar 1 menit).' });
    }
    const folder = purpose === 'avatar' ? 'avatar' : 'journal';
    const path = `${getUserId(req)}/${childId}/${folder}/${uid('m_')}.${extFor(type)}`;
    try {
      await ensureBucket(supabase);
      const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
      if (error || !data) throw error || new Error('no upload url');
      res.json({ path, uploadUrl: data.signedUrl, token: data.token, type: isImage ? 'image' : 'video' });
    } catch (err: any) {
      console.error('Media upload url failed:', err?.message || err);
      res.status(503).json({ error: 'storage_unavailable', message: 'Penyimpanan foto sedang tidak tersedia. Coba lagi sebentar lagi.' });
    }
  });

  /* ---------------- Journal ---------------- */

  const mapEntry = (r: any) => ({
    id: r.id,
    childId: r.child_id,
    date: r.date,
    category: r.category,
    title: r.title || '',
    body: r.body || '',
    media: Array.isArray(r.media) ? r.media : [],
    createdAt: r.created_at,
  });

  async function withSignedMedia(entries: any[]) {
    const urls = await signPaths(supabase, entries.flatMap((e) => (e.media || []).map((m: MediaItem) => m.path)));
    return entries.map((e) => ({ ...e, media: (e.media || []).map((m: MediaItem) => ({ ...m, url: urls[m.path] })) }));
  }

  function cleanMedia(req: Request, childId: string, media: unknown): MediaItem[] {
    if (!Array.isArray(media)) return [];
    return media
      .filter((m: any) => m && typeof m.path === 'string' && ownsPath(req, childId, m.path) && (m.type === 'image' || m.type === 'video'))
      .slice(0, 6)
      .map((m: any) => ({ path: m.path, type: m.type, width: Number(m.width) || undefined, height: Number(m.height) || undefined }));
  }

  function validEntry(body: any): string | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body?.date || ''))) return 'Tanggal belum diisi.';
    if (!JOURNAL_CATEGORIES.includes(body?.category)) return 'Pilih jenis catatan.';
    const text = `${body?.title || ''}${body?.body || ''}`.trim();
    if (!text && !(Array.isArray(body?.media) && body.media.length)) return 'Tulis catatan atau tambahkan foto.';
    return null;
  }

  app.get('/api/journal/:childId', async (req: Request, res: Response) => {
    const { childId } = req.params;
    if (!(await guardChild(req, res, childId))) return;
    const rows = await db(
      () => supabase.from('app_journal_entries').select('*').eq('child_id', childId).order('date', { ascending: false }).limit(300) as any,
      () => mem.journal.filter((r) => r.child_id === childId),
    );
    const list = (rows || []).map(mapEntry).sort((a: any, b: any) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    res.json(await withSignedMedia(list));
  });

  app.post('/api/journal', async (req: Request, res: Response) => {
    const { childId } = req.body || {};
    if (!(await guardChild(req, res, childId))) return;
    const invalid = validEntry(req.body);
    if (invalid) return res.status(400).json({ error: 'invalid', message: invalid });
    const row = {
      id: uid('j_'),
      child_id: childId,
      date: req.body.date,
      category: req.body.category,
      title: String(req.body.title || '').trim().slice(0, 120),
      body: String(req.body.body || '').trim().slice(0, 4000),
      media: cleanMedia(req, childId, req.body.media),
      created_at: new Date().toISOString(),
    };
    await db(() => supabase.from('app_journal_entries').insert(row) as any, () => mem.journal.push(row));
    const [entry] = await withSignedMedia([mapEntry(row)]);
    res.status(201).json(entry);
  });

  app.put('/api/journal/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { childId } = req.body || {};
    if (!(await guardChild(req, res, childId))) return;
    const invalid = validEntry(req.body);
    if (invalid) return res.status(400).json({ error: 'invalid', message: invalid });
    const existing = await db(
      () => supabase.from('app_journal_entries').select('*').eq('id', id).eq('child_id', childId) as any,
      () => mem.journal.filter((r) => r.id === id && r.child_id === childId),
    );
    const before = existing?.[0];
    if (!before) return res.status(404).json({ error: 'not_found', message: 'Catatan tidak ditemukan.' });
    const patch = {
      date: req.body.date,
      category: req.body.category,
      title: String(req.body.title || '').trim().slice(0, 120),
      body: String(req.body.body || '').trim().slice(0, 4000),
      media: cleanMedia(req, childId, req.body.media),
    };
    await db(
      () => supabase.from('app_journal_entries').update(patch).eq('id', id).eq('child_id', childId) as any,
      () => Object.assign(mem.journal.find((r) => r.id === id) || {}, patch),
    );
    const removed = (before.media || []).map((m: MediaItem) => m.path).filter((p: string) => !patch.media.some((m) => m.path === p));
    if (removed.length) supabase.storage.from(MEDIA_BUCKET).remove(removed).catch(() => undefined);
    const [entry] = await withSignedMedia([mapEntry({ ...before, ...patch })]);
    res.json(entry);
  });

  app.delete('/api/journal/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const childId = String(req.query.childId || '');
    if (!(await guardChild(req, res, childId))) return;
    const existing = await db(
      () => supabase.from('app_journal_entries').select('*').eq('id', id).eq('child_id', childId) as any,
      () => mem.journal.filter((r) => r.id === id && r.child_id === childId),
    );
    const before = existing?.[0];
    if (!before) return res.status(404).json({ error: 'not_found', message: 'Catatan tidak ditemukan.' });
    await db(
      () => supabase.from('app_journal_entries').delete().eq('id', id).eq('child_id', childId) as any,
      () => (mem.journal = mem.journal.filter((r) => r.id !== id)),
    );
    const paths = (before.media || []).map((m: MediaItem) => m.path);
    if (paths.length) supabase.storage.from(MEDIA_BUCKET).remove(paths).catch(() => undefined);
    res.json({ success: true });
  });

  /* ---------------- Baby tracker ---------------- */

  const mapLog = (r: any) => ({
    id: r.id,
    childId: r.child_id,
    kind: r.kind,
    detail: r.detail || undefined,
    startedAt: r.started_at,
    endedAt: r.ended_at || null,
    amountMl: r.amount_ml ?? null,
    count: r.count ?? null,
    note: r.note || '',
    createdAt: r.created_at,
  });

  const iso = (v: unknown) => {
    const d = new Date(String(v || ''));
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  };

  app.get('/api/baby-logs/:childId', async (req: Request, res: Response) => {
    const { childId } = req.params;
    if (!(await guardChild(req, res, childId))) return;
    const days = Math.min(31, Math.max(1, Number(req.query.days) || 7));
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const rows = await db(
      () => supabase.from('app_baby_logs').select('*').eq('child_id', childId).gte('started_at', since).order('started_at', { ascending: false }).limit(1000) as any,
      () => mem.logs.filter((r) => r.child_id === childId && r.started_at >= since),
    );
    // A timer left running from before the window still matters
    const running = await db(
      () => supabase.from('app_baby_logs').select('*').eq('child_id', childId).is('ended_at', null).limit(5) as any,
      () => mem.logs.filter((r) => r.child_id === childId && !r.ended_at),
    );
    const byId = new Map<string, any>();
    for (const r of [...(rows || []), ...(running || [])]) byId.set(r.id, r);
    res.json([...byId.values()].map(mapLog).sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
  });

  app.post('/api/baby-logs', async (req: Request, res: Response) => {
    const b = req.body || {};
    if (!(await guardChild(req, res, b.childId))) return;
    if (!LOG_KINDS.includes(b.kind)) return res.status(400).json({ error: 'invalid', message: 'Jenis catatan tidak dikenal.' });
    const startedAt = iso(b.startedAt) || new Date().toISOString();
    const endedAt = b.endedAt === null ? null : iso(b.endedAt);
    if (endedAt && endedAt < startedAt) return res.status(400).json({ error: 'invalid', message: 'Waktu selesai harus setelah waktu mulai.' });
    const row = {
      id: uid('bl_'),
      child_id: b.childId,
      kind: b.kind,
      detail: b.detail ? String(b.detail).slice(0, 40) : null,
      started_at: startedAt,
      ended_at: endedAt,
      amount_ml: Number.isFinite(Number(b.amountMl)) && b.amountMl !== null && b.amountMl !== '' ? Math.round(Number(b.amountMl)) : null,
      count: Number.isFinite(Number(b.count)) && b.count !== null ? Math.round(Number(b.count)) : null,
      note: b.note ? String(b.note).slice(0, 500) : null,
      created_at: new Date().toISOString(),
    };
    await db(() => supabase.from('app_baby_logs').insert(row) as any, () => mem.logs.push(row));
    res.status(201).json(mapLog(row));
  });

  app.put('/api/baby-logs/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const b = req.body || {};
    if (!(await guardChild(req, res, b.childId))) return;
    const patch: Record<string, unknown> = {};
    if ('endedAt' in b) patch.ended_at = b.endedAt === null ? null : iso(b.endedAt);
    if ('startedAt' in b) patch.started_at = iso(b.startedAt);
    if ('detail' in b) patch.detail = b.detail ? String(b.detail).slice(0, 40) : null;
    if ('amountMl' in b) patch.amount_ml = b.amountMl === null || b.amountMl === '' ? null : Math.round(Number(b.amountMl));
    if ('count' in b) patch.count = b.count === null ? null : Math.round(Number(b.count));
    if ('note' in b) patch.note = b.note ? String(b.note).slice(0, 500) : null;
    const existing = await db(
      () => supabase.from('app_baby_logs').select('*').eq('id', id).eq('child_id', b.childId) as any,
      () => mem.logs.filter((r) => r.id === id && r.child_id === b.childId),
    );
    const before = existing?.[0];
    if (!before) return res.status(404).json({ error: 'not_found', message: 'Catatan tidak ditemukan.' });
    const after = { ...before, ...patch };
    if (after.ended_at && after.started_at && after.ended_at < after.started_at) return res.status(400).json({ error: 'invalid', message: 'Waktu selesai harus setelah waktu mulai.' });
    await db(
      () => supabase.from('app_baby_logs').update(patch).eq('id', id).eq('child_id', b.childId) as any,
      () => Object.assign(mem.logs.find((r) => r.id === id) || {}, patch),
    );
    res.json(mapLog(after));
  });

  app.delete('/api/baby-logs/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const childId = String(req.query.childId || '');
    if (!(await guardChild(req, res, childId))) return;
    await db(
      () => supabase.from('app_baby_logs').delete().eq('id', id).eq('child_id', childId) as any,
      () => (mem.logs = mem.logs.filter((r) => !(r.id === id && r.child_id === childId))),
    );
    res.json({ success: true });
  });
}
