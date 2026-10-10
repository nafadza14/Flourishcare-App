import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BookHeart, Calendar, ImagePlus, Loader2, Pencil, Play, Plus, Share2, Trash2, X } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Sheet from '../components/ui/Sheet';
import Segmented from '../components/ui/Segmented';
import { Field, TextArea } from '../components/ui/Field';
import { Button, Card, Chip, EmptyState, Skeleton } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import UnbornGate from '../components/child/UnbornGate';
import type { Child, JournalCategory, JournalEntry, MediaItem } from '../types';
import { useStore } from '../lib/store';
import { FIRST_MOMENTS, JOURNAL_CATEGORIES, categoryInfo, shareText, useJournal } from '../lib/journal';
import { prepareFile, uploadPrepared } from '../lib/media';
import { apiFetch, sendJSON } from '../api';
import { emitDataChanged } from '../lib/events';
import { ageLabel, firstName, formatDate, parseDate, todayISO } from '../lib/format';
import { listContainer, listItem } from '../lib/motion';
import { haptic } from '../lib/haptics';
import { cx } from '../lib/cx';

const MAX_MEDIA = 6;

function MediaThumb({ m, className, onClick }: { m: MediaItem; className?: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cx('relative overflow-hidden bg-fill', className)} aria-label={m.type === 'video' ? 'Putar video' : 'Lihat foto'}>
      {m.url ? (
        m.type === 'video' ? (
          <video src={m.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
        ) : (
          <img src={m.url} alt="" loading="lazy" className="w-full h-full object-cover" draggable={false} />
        )
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-mute">
          <ImagePlus className="w-5 h-5" />
        </span>
      )}
      {m.type === 'video' && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center">
            <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
          </span>
        </span>
      )}
    </button>
  );
}

function MediaGrid({ media, onOpen }: { media: MediaItem[]; onOpen: (i: number) => void }) {
  if (!media.length) return null;
  const n = media.length;
  return (
    <div className={cx('grid gap-1.5 mt-3 rounded-[16px] overflow-hidden', n === 1 ? 'grid-cols-1' : n === 2 || n === 4 ? 'grid-cols-2' : 'grid-cols-3')}>
      {media.slice(0, 6).map((m, i) => (
        <MediaThumb key={m.path} m={m} onClick={() => onOpen(i)} className={cx(n === 1 ? 'aspect-[4/3]' : 'aspect-square', 'w-full')} />
      ))}
    </div>
  );
}

async function shareEntry(child: Child, e: JournalEntry, toast: ReturnType<typeof useToast>) {
  const text = shareText(child.name, e, formatDate(e.date, 'long'));
  try {
    const first = e.media.find((m) => m.type === 'image' && m.url);
    if (first && navigator.canShare) {
      const blob = await fetch(first.url!).then((r) => r.blob());
      const file = new File([blob], `${firstName(child.name)}-${e.date}.jpg`, { type: blob.type || 'image/jpeg' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ title: `Jurnal ${child.name}`, text, files: [file] });
        return;
      }
    }
    if (navigator.share) {
      await navigator.share({ title: `Jurnal ${child.name}`, text });
      return;
    }
    await navigator.clipboard.writeText(text);
    toast({ title: 'Teks disalin', body: 'Tempel di WhatsApp untuk dikirim ke terapis atau keluarga.' });
  } catch (err: any) {
    if (err?.name === 'AbortError') return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Teks disalin', body: 'Tempel di WhatsApp untuk dikirim ke terapis atau keluarga.' });
    } catch {
      toast({ title: 'Belum bisa membagikan', tone: 'warning' });
    }
  }
}

/* ---------------- Compose ---------------- */

interface UploadSlot {
  key: string;
  media?: MediaItem;
  preview?: string;
  type: 'image' | 'video';
  status: 'uploading' | 'done' | 'error';
}

function ComposeSheet({ open, onClose, child, entry, preset }: { open: boolean; onClose: () => void; child: Child; entry: JournalEntry | null; preset?: { category: JournalCategory; title: string } | null }) {
  const toast = useToast();
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState<JournalCategory>('catatan');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [slots, setSlots] = useState<UploadSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError('');
    if (entry) {
      setDate(entry.date);
      setCategory(entry.category);
      setTitle(entry.title || '');
      setBody(entry.body || '');
      setSlots(entry.media.map((m) => ({ key: m.path, media: m, preview: m.url, type: m.type, status: 'done' })));
    } else {
      setDate(todayISO());
      setCategory(preset?.category ?? 'catatan');
      setTitle(preset?.title ?? '');
      setBody('');
      setSlots([]);
    }
  }, [open, entry, preset]);

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_MEDIA - slots.length;
    const list = Array.from(files).slice(0, room);
    if (files.length > room) toast({ title: `Maksimal ${MAX_MEDIA} foto atau video`, tone: 'info' });
    for (const file of list) {
      const key = `${file.name}-${Math.random().toString(36).slice(2)}`;
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setSlots((s) => [...s, { key, type, status: 'uploading' }]);
      try {
        const prepared = await prepareFile(file);
        setSlots((s) => s.map((x) => (x.key === key ? { ...x, preview: prepared.previewUrl } : x)));
        const media = await uploadPrepared(child.id, prepared, 'journal');
        setSlots((s) => s.map((x) => (x.key === key ? { ...x, media, status: 'done' } : x)));
      } catch (err: any) {
        setSlots((s) => s.filter((x) => x.key !== key));
        toast({ title: 'Unggah gagal', body: err?.message || 'Coba lagi.', tone: 'warning' });
      }
    }
  };

  const uploading = slots.some((s) => s.status === 'uploading');

  const save = async () => {
    if (uploading) return;
    const media = slots.filter((s) => s.media).map((s) => ({ path: s.media!.path, type: s.media!.type, width: s.media!.width, height: s.media!.height }));
    if (!title.trim() && !body.trim() && !media.length) return setError('Tulis catatan atau tambahkan foto.');
    if (!date || date > todayISO()) return setError('Tanggal tidak boleh melewati hari ini.');
    setSaving(true);
    setError('');
    try {
      const payload = { childId: child.id, date, category, title: title.trim(), body: body.trim(), media };
      if (entry) await sendJSON(`/api/journal/${entry.id}`, payload, 'PUT');
      else await sendJSON('/api/journal', payload);
      emitDataChanged('journal');
      haptic('success');
      toast({ title: entry ? 'Catatan diperbarui' : 'Momen tersimpan', body: entry ? undefined : `Tersimpan di jurnal ${firstName(child.name)}.` });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Belum tersimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="large"
      title={entry ? 'Ubah catatan' : 'Tulis momen'}
      subtitle={`Jurnal ${firstName(child.name)}`}
      footer={
        <Button block size="lg" loading={saving} disabled={uploading} onClick={save}>
          {uploading ? 'Menunggu unggahan selesai' : 'Simpan'}
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {JOURNAL_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={cx('h-9 px-3.5 rounded-full text-[14.5px] border shrink-0 inline-flex items-center gap-1.5', category === c.key ? 'bg-brand-orange-soft border-brand-orange/40 text-brand-orange-deep' : 'bg-white border-line text-ink-2')}
            >
              <c.icon className="w-4 h-4" strokeWidth={1.8} />
              {c.label}
            </button>
          ))}
        </div>
        <Field label="Tanggal" type="date" icon={Calendar} max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
        <Field label="Judul (opsional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Kata pertama, 'mama'" />
        <TextArea label="Cerita hari ini" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Apa yang terjadi, bagaimana reaksinya, apa yang membuatnya senang atau rewel" />
        <div>
          <div className="text-[14px] text-mute mb-2">Foto atau video singkat (maks. {MAX_MEDIA}, video sampai 1 menit)</div>
          <div className="grid grid-cols-3 gap-2">
            {slots.map((s) => (
              <div key={s.key} className="relative aspect-square rounded-[14px] overflow-hidden bg-fill">
                {s.preview ? (
                  s.type === 'video' ? <video src={s.preview} muted playsInline className="w-full h-full object-cover" /> : <img src={s.preview} alt="" className="w-full h-full object-cover" />
                ) : null}
                {s.status === 'uploading' && (
                  <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </span>
                )}
                {s.status === 'done' && (
                  <button type="button" onClick={() => setSlots((x) => x.filter((y) => y.key !== s.key))} className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/55 text-white flex items-center justify-center" aria-label="Hapus media">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {slots.length < MAX_MEDIA && (
              <button type="button" onClick={() => fileRef.current?.click()} className="aspect-square rounded-[14px] border border-dashed border-line-2 flex flex-col items-center justify-center text-ink-2 gap-1">
                <ImagePlus className="w-6 h-6" strokeWidth={1.6} />
                <span className="text-[13px]">Tambah</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              pick(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
        {error && <p className="text-[14px] text-semantic-danger">{error}</p>}
      </div>
    </Sheet>
  );
}

/* ---------------- Viewer ---------------- */

function MediaViewer({ items, index, onClose }: { items: MediaItem[]; index: number | null; onClose: () => void }) {
  const m = index !== null ? items[index] : null;
  return (
    <Sheet open={!!m} onClose={onClose} size="large" title="">
      {m && (
        <div className="pt-1">
          {m.type === 'video' ? (
            <video src={m.url} controls playsInline autoPlay className="w-full rounded-[18px] bg-black max-h-[70vh]" />
          ) : (
            <img src={m.url} alt="" className="w-full rounded-[18px] object-contain max-h-[70vh] bg-fill" />
          )}
        </div>
      )}
    </Sheet>
  );
}

function EntrySheet({ entry, child, onClose, onEdit }: { entry: JournalEntry | null; child: Child; onClose: () => void; onEdit: () => void }) {
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  useEffect(() => setConfirm(false), [entry]);
  if (!entry) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;
  const cat = categoryInfo(entry.category);

  const remove = async () => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/journal/${entry.id}?childId=${encodeURIComponent(child.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      emitDataChanged('journal');
      toast({ title: 'Catatan dihapus', tone: 'info' });
      onClose();
    } catch {
      toast({ title: 'Gagal menghapus', tone: 'warning' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={!!entry} onClose={onClose} size="large" title={entry.title || cat.label} subtitle={`${formatDate(entry.date, 'long')} · ${ageLabel(child.birthDate, parseDate(entry.date))}`}>
        <div className="pt-1">
          <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[13px]" style={{ background: `${cat.color}1f`, color: cat.color }}>
            <cat.icon className="w-3.5 h-3.5" /> {cat.label}
          </span>
          {entry.body && <p className="text-[16px] text-ink-2 leading-relaxed mt-3 whitespace-pre-line">{entry.body}</p>}
          <MediaGrid media={entry.media} onOpen={setViewer} />
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <Button variant="secondary" icon={Share2} onClick={() => shareEntry(child, entry, toast)}>
              Bagikan
            </Button>
            <Button variant="secondary" icon={Pencil} onClick={onEdit}>
              Ubah
            </Button>
          </div>
          <p className="text-[13px] text-mute mt-3 leading-relaxed">Bagikan catatan ini ke terapis atau psikolog sebelum konsultasi agar mereka memahami keseharian {firstName(child.name)}.</p>
          {confirm ? (
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <Button variant="secondary" onClick={() => setConfirm(false)}>
                Batal
              </Button>
              <Button variant="danger" loading={deleting} onClick={remove}>
                Hapus
              </Button>
            </div>
          ) : (
            <Button block variant="danger" icon={Trash2} className="mt-4" onClick={() => setConfirm(true)}>
              Hapus catatan
            </Button>
          )}
        </div>
      </Sheet>
      <MediaViewer items={entry.media} index={viewer} onClose={() => setViewer(null)} />
    </>
  );
}

/* ---------------- Screen ---------------- */

export default function JournalScreen({ onBack, compose }: { onBack?: () => void; compose?: boolean }) {
  const { activeChild } = useStore();
  const { entries, loading } = useJournal(activeChild?.id);
  const [view, setView] = useState<'journal' | 'album'>('journal');
  const [filter, setFilter] = useState<JournalCategory | 'all'>('all');
  const [composeOpen, setComposeOpen] = useState(!!compose);
  const [preset, setPreset] = useState<{ category: JournalCategory; title: string } | null>(null);
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [albumIndex, setAlbumIndex] = useState<number | null>(null);

  const allMedia = useMemo(() => entries.flatMap((e) => e.media.filter((m) => m.url)), [entries]);
  const shown = filter === 'all' ? entries : entries.filter((e) => e.category === filter);
  const months = useMemo(() => {
    const out: { key: string; label: string; items: JournalEntry[] }[] = [];
    for (const e of shown) {
      const d = parseDate(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      let g = out.find((x) => x.key === key);
      if (!g) out.push((g = { key, label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }), items: [] }));
      g.items.push(e);
    }
    return out;
  }, [shown]);

  if (!activeChild) return null;
  if (activeChild.isUnborn) {
    return (
      <Screen title="Jurnal dan album" onBack={onBack}>
        <UnbornGate name={activeChild.name} />
      </Screen>
    );
  }
  const name = firstName(activeChild.name);

  const openCompose = (p?: { category: JournalCategory; title: string }) => {
    setEditing(null);
    setPreset(p ?? null);
    setComposeOpen(true);
  };

  return (
    <Screen
      title="Jurnal dan album"
      subtitle={`Cerita dan momen ${name}`}
      onBack={onBack}
      titleAccessory={
        <Button size="sm" icon={Plus} onClick={() => openCompose()}>
          Tulis
        </Button>
      }
    >
      <div className="px-5">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'journal', label: `Jurnal (${entries.length})` },
            { value: 'album', label: `Album (${allMedia.length})` },
          ]}
        />
      </div>

      {view === 'journal' && (
        <>
          <div className="px-5 mt-5">
            <div className="text-[15px] text-ink mb-2">Catat momen pertama</div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
              {FIRST_MOMENTS.map((t) => (
                <motion.button
                  key={t}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => openCompose({ category: 'momen_pertama', title: t })}
                  className="shrink-0 h-10 px-4 rounded-full bg-white border border-line shadow-card text-[14.5px] text-ink-2"
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 mt-4 pb-1">
            <Chip selected={filter === 'all'} onClick={() => setFilter('all')}>
              Semua
            </Chip>
            {JOURNAL_CATEGORIES.map((c) => (
              <Chip key={c.key} selected={filter === c.key} onClick={() => setFilter(c.key)}>
                {c.label}
              </Chip>
            ))}
          </div>
          <div className="px-5 mt-4 space-y-5">
            {loading ? (
              <Skeleton className="h-40 rounded-[22px]" />
            ) : !months.length ? (
              <EmptyState
                icon={BookHeart}
                title="Jurnal masih kosong"
                body={`Simpan kata pertama, makanan favorit, atau hari spesial ${name}. Catatan ini juga berguna saat konsultasi dengan terapis.`}
                action={
                  <Button icon={Plus} onClick={() => openCompose()}>
                    Tulis momen pertama
                  </Button>
                }
              />
            ) : (
              months.map((m) => (
                <div key={m.key}>
                  <div className="text-[14px] text-mute mb-2 px-1 capitalize">{m.label}</div>
                  <motion.div className="space-y-2.5" variants={listContainer} initial="hidden" animate="show">
                    {m.items.map((e) => {
                      const cat = categoryInfo(e.category);
                      return (
                        <motion.div key={e.id} variants={listItem}>
                          <Card className="p-4">
                            <button onClick={() => setSelected(e)} className="w-full text-left">
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[13px]" style={{ color: cat.color }}>
                                  <cat.icon className="w-3.5 h-3.5" /> {cat.label}
                                </span>
                                <span className="text-[13px] text-mute">{formatDate(e.date)}</span>
                              </div>
                              {e.title && <div className="text-[17px] leading-snug mt-1.5">{e.title}</div>}
                              {e.body && <p className="text-[15px] text-ink-2 leading-relaxed mt-1 line-clamp-3">{e.body}</p>}
                            </button>
                            <MediaGrid media={e.media} onOpen={() => setSelected(e)} />
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {view === 'album' && (
        <div className="px-5 mt-5">
          {loading ? (
            <Skeleton className="h-60 rounded-[22px]" />
          ) : !allMedia.length ? (
            <EmptyState icon={ImagePlus} title="Album masih kosong" body="Foto dan video dari jurnal akan terkumpul di sini." action={<Button icon={Plus} onClick={() => openCompose()}>Tambah foto</Button>} />
          ) : (
            <div className="grid grid-cols-3 gap-1.5 rounded-[18px] overflow-hidden">
              {allMedia.map((m, i) => (
                <MediaThumb key={m.path} m={m} onClick={() => setAlbumIndex(i)} className="aspect-square w-full" />
              ))}
            </div>
          )}
        </div>
      )}

      <ComposeSheet open={composeOpen} onClose={() => setComposeOpen(false)} child={activeChild} entry={editing} preset={preset} />
      <EntrySheet
        entry={selected}
        child={activeChild}
        onClose={() => setSelected(null)}
        onEdit={() => {
          setEditing(selected);
          setSelected(null);
          window.setTimeout(() => setComposeOpen(true), 220);
        }}
      />
      <MediaViewer items={allMedia} index={albumIndex} onClose={() => setAlbumIndex(null)} />
    </Screen>
  );
}
