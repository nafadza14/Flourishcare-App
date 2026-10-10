import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Clock, Droplets, Info, Milk, Moon, Plus, Trash2, TriangleAlert } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Sheet from '../components/ui/Sheet';
import Segmented from '../components/ui/Segmented';
import { Field, TextArea } from '../components/ui/Field';
import { Button, Card, EmptyState, Skeleton } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import BabyQuickCard, { RunningTimer, useTick } from '../components/babylog/BabyQuick';
import UnbornGate from '../components/child/UnbornGate';
import type { BabyLog, BabyLogKind, Child } from '../types';
import { useStore } from '../lib/store';
import { DIAPER_DETAILS, FEED_DETAILS, addLog, deleteLog, detailLabel, durationLabel, minutesBetween, summarize, updateLog, useBabyLogs } from '../lib/babylog';
import { CALL_DOCTOR, DIAPER_NORMS, FEEDING_NORMS, SLEEP_NORMS, BABY_DISCLAIMER } from '../data/babyNorms';
import { ageInMonths, firstName, formatDate, formatTime } from '../lib/format';
import { listContainer, listItem } from '../lib/motion';
import { cx } from '../lib/cx';

const KIND_ICON: Record<BabyLogKind, typeof Milk> = { feed: Milk, sleep: Moon, diaper: Droplets, pump: Milk, kick: Milk };

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayTitle(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (dayKey(d.toISOString()) === dayKey(today.toISOString())) return 'Hari ini';
  if (dayKey(d.toISOString()) === dayKey(y.toISOString())) return 'Kemarin';
  return formatDate(d, 'day');
}

/** Add a past entry, or edit an existing one */
function LogSheet({ open, onClose, child, log }: { open: boolean; onClose: () => void; child: Child; log: BabyLog | null }) {
  const toast = useToast();
  const [kind, setKind] = useState<BabyLogKind>('feed');
  const [detail, setDetail] = useState('breast_left');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [ml, setMl] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setConfirmDelete(false);
    setError('');
    if (log) {
      setKind(log.kind);
      setDetail(log.detail || '');
      setStart(toLocalInput(log.startedAt));
      setEnd(log.endedAt ? toLocalInput(log.endedAt) : '');
      setMl(log.amountMl ? String(log.amountMl) : '');
      setNote(log.note || '');
    } else {
      const now = new Date();
      const before = new Date(now.getTime() - 30 * 60000);
      setKind('feed');
      setDetail('breast_left');
      setStart(toLocalInput(before.toISOString()));
      setEnd(toLocalInput(now.toISOString()));
      setMl('');
      setNote('');
    }
  }, [open, log]);

  const timed = kind === 'sleep' || (kind === 'feed' && detail.startsWith('breast_'));
  const withMl = kind === 'feed' && detail.startsWith('bottle_');
  const details = kind === 'feed' ? FEED_DETAILS : kind === 'diaper' ? DIAPER_DETAILS : [];

  const save = async () => {
    const s = fromLocalInput(start);
    const e = timed ? fromLocalInput(end) : s;
    if (!s) return setError('Isi waktu mulai.');
    if (timed && e && e < s) return setError('Waktu selesai harus setelah waktu mulai.');
    if (s > new Date().toISOString()) return setError('Waktu tidak boleh di masa depan.');
    setSaving(true);
    setError('');
    const payload = { kind, detail: kind === 'sleep' ? undefined : detail, startedAt: s, endedAt: timed ? e : s, amountMl: withMl ? Number(ml) || null : null, note: note.trim() };
    try {
      if (log) await updateLog(child.id, log.id, payload as Partial<BabyLog>);
      else await addLog(child.id, payload);
      toast({ title: log ? 'Catatan diperbarui' : 'Catatan tersimpan' });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Belum tersimpan.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!log) return;
    setSaving(true);
    try {
      await deleteLog(child.id, log.id);
      toast({ title: 'Catatan dihapus', tone: 'info' });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={log ? 'Ubah catatan' : 'Tambah catatan'}
      subtitle={log ? detailLabel(log) : 'Untuk kegiatan yang lupa dicatat.'}
      footer={
        confirmDelete ? (
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Batal
            </Button>
            <Button variant="danger" loading={saving} onClick={remove}>
              Hapus
            </Button>
          </div>
        ) : (
          <Button block size="lg" loading={saving} onClick={save}>
            Simpan
          </Button>
        )
      }
    >
      <div className="space-y-4 pt-1">
        {!log && (
          <Segmented
            value={kind}
            onChange={(k) => {
              setKind(k);
              setDetail(k === 'feed' ? 'breast_left' : k === 'diaper' ? 'wet' : '');
            }}
            options={[
              { value: 'feed', label: 'Menyusu' },
              { value: 'sleep', label: 'Tidur' },
              { value: 'diaper', label: 'Popok' },
            ]}
          />
        )}
        {details.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {details.map((d) => (
              <button
                key={d.key}
                onClick={() => setDetail(d.key)}
                className={cx('h-9 px-3.5 rounded-full text-[14.5px] border', detail === d.key ? 'bg-brand-orange-soft border-brand-orange/40 text-brand-orange-deep' : 'bg-white border-line text-ink-2')}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
        <div className={cx('grid gap-3', timed ? 'grid-cols-1' : 'grid-cols-1')}>
          <Field label={timed ? 'Mulai' : 'Waktu'} type="datetime-local" icon={Clock} value={start} onChange={(e) => setStart(e.target.value)} />
          {timed && <Field label="Selesai" type="datetime-local" icon={Clock} value={end} onChange={(e) => setEnd(e.target.value)} hint={log && !log.endedAt ? 'Kosongkan bila masih berjalan.' : undefined} />}
        </div>
        {withMl && <Field label="Jumlah" inputMode="numeric" suffix="ml" value={ml} onChange={(e) => setMl(e.target.value.replace(/[^0-9]/g, ''))} />}
        <TextArea label="Catatan (opsional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Misalnya rewel, muntah sedikit" />
        {error && <p className="text-[14px] text-semantic-danger">{error}</p>}
        {log && !confirmDelete && (
          <Button block variant="danger" icon={Trash2} onClick={() => setConfirmDelete(true)}>
            Hapus catatan
          </Button>
        )}
      </div>
    </Sheet>
  );
}

function Norms({ age }: { age: number }) {
  const [open, setOpen] = useState(false);
  const sleep = SLEEP_NORMS.perDay[age < 4 ? 0 : age < 12 ? 1 : 2];
  return (
    <Card className="overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-4 text-left" aria-expanded={open}>
        <Info className="w-5 h-5 text-brand-orange-deep" strokeWidth={1.8} />
        <span className="flex-1 text-[16px]">Berapa yang wajar di usia ini?</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="w-5 h-5 text-mute" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 text-[14.5px] text-ink-2 leading-relaxed">
              <p>
                <b className="font-medium text-ink">Menyusu:</b> {age < 2 ? `${FEEDING_NORMS.perDay} per hari. ${FEEDING_NORMS.newborn}` : age < 6 ? 'ASI eksklusif sesuai keinginan bayi, siang dan malam.' : FEEDING_NORMS.mpasi.find((m, i) => (age < 9 ? i === 0 : age < 12 ? i === 1 : i === 2))?.meals + ', ASI tetap dilanjutkan.'}
              </p>
              <p>
                <b className="font-medium text-ink">Tidur:</b> {sleep.recommended} per 24 jam ({sleep.age}). {SLEEP_NORMS.safeSleep}
              </p>
              {age < 2 && (
                <p>
                  <b className="font-medium text-ink">Popok:</b> {DIAPER_NORMS.firstWeek.map((d) => `${d.day}: ${d.wet}`).join('. ')}.
                </p>
              )}
              <div className="rounded-[14px] bg-semantic-danger-soft p-3">
                <div className="flex items-center gap-1.5 text-semantic-danger font-medium">
                  <TriangleAlert className="w-4 h-4" /> Hubungi tenaga kesehatan bila
                </div>
                <ul className="mt-1.5 space-y-1">
                  {CALL_DOCTOR.slice(0, 5).map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-semantic-danger mt-2 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[13px] text-mute">{BABY_DISCLAIMER}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function BabyLogScreen({ onBack }: { onBack?: () => void }) {
  const { activeChild } = useStore();
  const { logs, loading } = useBabyLogs(activeChild?.id, !!activeChild);
  const [range, setRange] = useState<'today' | 'week'>('today');
  const [editing, setEditing] = useState<BabyLog | null>(null);
  const [adding, setAdding] = useState(false);
  const summary = useMemo(() => summarize(logs), [logs]);
  useTick(!!(summary.runningFeed || summary.runningSleep));

  if (!activeChild) return null;
  if (activeChild.isUnborn) {
    return (
      <Screen title="Catatan harian" onBack={onBack}>
        <UnbornGate name={activeChild.name} />
      </Screen>
    );
  }
  const age = ageInMonths(activeChild.birthDate);
  const careLogs = logs.filter((l) => l.kind !== 'kick');
  const todayKey = dayKey(new Date().toISOString());
  const shown = range === 'today' ? careLogs.filter((l) => dayKey(l.startedAt) === todayKey || !l.endedAt) : careLogs;
  const groups: { key: string; title: string; items: BabyLog[] }[] = [];
  for (const l of shown) {
    const k = dayKey(l.startedAt);
    let g = groups.find((x) => x.key === k);
    if (!g) groups.push((g = { key: k, title: dayTitle(l.startedAt), items: [] }));
    g.items.push(l);
  }

  return (
    <Screen
      title="Catatan harian"
      subtitle={`Menyusu, tidur, dan popok ${firstName(activeChild.name)}`}
      onBack={onBack}
      titleAccessory={
        <Button size="sm" icon={Plus} onClick={() => setAdding(true)}>
          Tambah
        </Button>
      }
    >
      <div className="px-5 space-y-3">
        {summary.runningFeed && <RunningTimer log={summary.runningFeed} child={activeChild} />}
        {summary.runningSleep && <RunningTimer log={summary.runningSleep} child={activeChild} />}
        <BabyQuickCard child={activeChild} logs={logs} onOpen={() => undefined} compact />
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Menyusu', value: `${summary.feeds} kali`, sub: summary.feedMl ? `${summary.feedMl} ml botol` : summary.nextSide ? `Berikutnya ${summary.nextSide}` : 'hari ini' },
            { label: 'Tidur', value: durationLabel(summary.sleepMinutes), sub: 'hari ini' },
            { label: 'Popok', value: `${summary.wet + summary.dirty}`, sub: `${summary.wet} pipis · ${summary.dirty} pup` },
          ].map((t) => (
            <Card key={t.label} className="p-3">
              <div className="text-[12.5px] text-mute">{t.label}</div>
              <div className="text-[18px] tabular leading-tight mt-0.5">{t.value}</div>
              <div className="text-[12px] text-mute mt-0.5 leading-tight">{t.sub}</div>
            </Card>
          ))}
        </div>
        <Norms age={age} />
      </div>

      <div className="px-5 mt-6">
        <Segmented
          value={range}
          onChange={setRange}
          options={[
            { value: 'today', label: 'Hari ini' },
            { value: 'week', label: '7 hari' },
          ]}
        />
      </div>
      <div className="px-5 mt-4 space-y-5">
        {loading ? (
          <Skeleton className="h-40 rounded-[22px]" />
        ) : !groups.length ? (
          <EmptyState icon={Milk} title="Belum ada catatan" body="Ketuk Menyusu, Tidur, atau Popok di atas. Cukup satu ketukan." className="py-6" />
        ) : (
          groups.map((g) => (
            <div key={g.key}>
              <div className="text-[14px] text-mute mb-2 px-1">{g.title}</div>
              <motion.div className="bg-white rounded-[22px] border border-line shadow-card divide-y divide-line overflow-hidden" variants={listContainer} initial="hidden" animate="show">
                {g.items.map((l) => {
                  const Icon = KIND_ICON[l.kind];
                  const mins = l.endedAt && l.endedAt !== l.startedAt ? minutesBetween(l.startedAt, l.endedAt) : null;
                  return (
                    <motion.button key={l.id} variants={listItem} onClick={() => setEditing(l)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                      <span className="w-9 h-9 rounded-full bg-fill text-ink-2 flex items-center justify-center shrink-0">
                        <Icon className="w-[17px] h-[17px]" strokeWidth={1.8} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[15.5px] leading-tight">{detailLabel(l)}</span>
                        <span className="block text-[13px] text-mute mt-0.5 truncate">
                          {formatTime(l.startedAt)}
                          {l.endedAt && l.endedAt !== l.startedAt ? ` sampai ${formatTime(l.endedAt)}` : !l.endedAt ? ' · sedang berjalan' : ''}
                          {l.note ? ` · ${l.note}` : ''}
                        </span>
                      </span>
                      <span className="text-[14px] tabular text-ink-2 shrink-0">{l.amountMl ? `${l.amountMl} ml` : mins !== null ? durationLabel(mins) : ''}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>
          ))
        )}
      </div>

      <LogSheet open={adding || !!editing} onClose={() => { setAdding(false); setEditing(null); }} child={activeChild} log={editing} />
    </Screen>
  );
}
