import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpenCheck, Calendar, Camera, Check, ChevronRight, CircleCheck, Clock, EllipsisVertical, Plus, Printer, Search, Syringe, Undo2, X } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Sheet from '../components/ui/Sheet';
import { Field } from '../components/ui/Field';
import { ArrowCorner, Button, Card, Chip, EmptyState, IconButton, Skeleton, StatusPill, type Tone } from '../components/ui/primitives';
import { ListGroup, ListRow } from '../components/ui/ListGroup';
import { useToast } from '../components/ui/Toast';
import { useStore } from '../lib/store';
import { useChildData } from '../lib/useChildData';
import UnbornGate from '../components/child/UnbornGate';
import { buildVaccineSchedule, nextVaccine, VACCINE_STATE_LABEL, vaccineTiming, ageLabelForVaccine, type VaccineItem, type VaccineState } from '../lib/vaccines';
import { ageLabel, firstName, formatDate, toISODate, todayISO } from '../lib/format';
import { sendJSON } from '../api';
import { emitDataChanged } from '../lib/events';
import { escapeHtml, imageToDataUrl, printDocument, printHeader } from '../lib/print';
import { listContainer, listItem } from '../lib/motion';
import { cx } from '../lib/cx';

const STATE_TONE: Record<VaccineState, Tone> = {
  done: 'success',
  catchup: 'danger',
  due: 'orange',
  upcoming: 'neutral',
};

type Filter = 'all' | 'pending' | 'done';

function VaccineIcon({ state }: { state: VaccineState }) {
  const cls = {
    done: 'bg-semantic-success-soft text-semantic-success',
    catchup: 'bg-semantic-danger-soft text-semantic-danger',
    due: 'bg-brand-orange-soft text-brand-orange-deep',
    upcoming: 'bg-fill text-ink-2',
  }[state];
  return (
    <span className={cx('w-12 h-12 rounded-full flex items-center justify-center shrink-0', cls)}>
      {state === 'done' ? <Check className="w-5 h-5" strokeWidth={2.2} /> : <Syringe className="w-5 h-5" strokeWidth={1.8} />}
    </span>
  );
}

function VaccineSheet({ item, childId, childName, onClose }: { item: VaccineItem | null; childId: string; childName: string; onClose: () => void }) {
  const toast = useToast();
  const [date, setDate] = useState(todayISO());
  const [photo, setPhoto] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (item) {
      setDate(todayISO());
      setPhoto('');
      setError('');
    }
  }, [item]);

  if (!item) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;

  const save = async (given: boolean) => {
    setSaving(true);
    setError('');
    try {
      await sendJSON('/api/immunization/toggle', {
        childId,
        immunizationId: item.ref.id,
        givenDate: given ? date : undefined,
        proofPhotoUrl: given ? photo || undefined : undefined,
      });
      emitDataChanged('immunization');
      toast(
        given
          ? { title: `${item.ref.vaccineName} tercatat`, body: `Riwayat imunisasi ${childName} sudah diperbarui.` }
          : { title: 'Catatan dibatalkan', body: `${item.ref.vaccineName} kembali ke daftar jadwal.`, tone: 'info' },
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const onPickPhoto = async (file?: File) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      setError('Ukuran foto maksimal 12 MB.');
      return;
    }
    try {
      setPhoto(await imageToDataUrl(file));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const done = item.state === 'done';

  return (
    <Sheet
      open={!!item}
      onClose={onClose}
      title={item.ref.vaccineName}
      subtitle={ageLabelForVaccine(item.ref.recommendedAgeMonth)}
      footer={
        done ? (
          <Button block size="lg" variant="secondary" icon={Undo2} loading={saving} onClick={() => save(false)}>
            Batalkan catatan
          </Button>
        ) : (
          <Button block size="lg" icon={CircleCheck} loading={saving} onClick={() => save(true)} disabled={!date || date > todayISO()}>
            Tandai sudah diberikan
          </Button>
        )
      }
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-2">
          <StatusPill tone={STATE_TONE[item.state]}>{VACCINE_STATE_LABEL[item.state]}</StatusPill>
          {!done && <span className="text-[14px] text-mute">{vaccineTiming(item)}</span>}
        </div>
        <p className="text-[16px] text-ink-2 leading-relaxed">{item.ref.description}</p>

        <ListGroup className="!px-0">
          <ListRow icon={Calendar} iconTone="orange" title="Jadwal ideal" value={formatDate(item.dueDate)} />
          {done && item.record?.givenDate && <ListRow icon={CircleCheck} iconTone="green" title="Diberikan" value={formatDate(item.record.givenDate)} />}
        </ListGroup>

        {done && item.record?.proofPhotoUrl && (
          <div>
            <div className="text-[14px] text-mute mb-2 pl-1">Foto buku KIA</div>
            <img src={item.record.proofPhotoUrl} alt="Bukti imunisasi" className="w-full max-h-56 object-cover rounded-[18px] border border-line" referrerPolicy="no-referrer" />
          </div>
        )}

        {!done && (
          <>
            <Field label="Tanggal diberikan" type="date" icon={Calendar} value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
            <div>
              <div className="text-[14px] text-mute mb-1.5 pl-1">Foto buku KIA (opsional)</div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPickPhoto(e.target.files?.[0])} />
              {photo ? (
                <div className="relative">
                  <img src={photo} alt="Pratinjau foto KIA" className="w-full max-h-56 object-cover rounded-[18px] border border-line" />
                  <button
                    onClick={() => setPhoto('')}
                    aria-label="Hapus foto"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full glass-white flex items-center justify-center shadow-card"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-24 rounded-[18px] border border-dashed border-line-2 bg-white flex flex-col items-center justify-center gap-1.5 text-ink-2 active:scale-[0.99] transition-transform"
                >
                  <Camera className="w-6 h-6" strokeWidth={1.6} />
                  <span className="text-[15px]">Ambil atau pilih foto</span>
                </button>
              )}
            </div>
          </>
        )}
        {error && <p className="text-[14px] text-semantic-danger">{error}</p>}
      </div>
    </Sheet>
  );
}

/** Log several doses at once (typical first visit: copying the KIA book). */
function PickerSheet({
  open,
  onClose,
  schedule,
  childId,
  childName,
  onOpenOne,
}: {
  open: boolean;
  onClose: () => void;
  schedule: VaccineItem[];
  childId: string;
  childName: string;
  onOpenOne: (item: VaccineItem) => void;
}) {
  const toast = useToast();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const today = todayISO();
  const pending = schedule.filter((v) => v.state !== 'done');
  const pastDue = pending.filter((v) => toISODate(v.dueDate) <= today);

  useEffect(() => {
    if (open) setPicked(new Set());
  }, [open]);

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allPastPicked = pastDue.length > 0 && pastDue.every((v) => picked.has(v.ref.id));

  const save = async () => {
    setSaving(true);
    try {
      const items = pending.filter((v) => picked.has(v.ref.id));
      for (const v of items) {
        await sendJSON('/api/immunization/toggle', {
          childId,
          immunizationId: v.ref.id,
          givenDate: toISODate(v.dueDate) < today ? toISODate(v.dueDate) : today,
        });
      }
      emitDataChanged('immunization');
      toast({ title: `${items.length} vaksin tercatat`, body: `Riwayat imunisasi ${childName} sudah diperbarui.` });
      onClose();
    } catch (err: any) {
      toast({ title: 'Gagal menyimpan', body: err.message || 'Coba lagi sebentar lagi.', tone: 'warning' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Catat imunisasi"
      subtitle="Pilih vaksin yang sudah diberikan sesuai buku KIA."
      footer={
        pending.length > 0 ? (
          <div>
            <Button block size="lg" icon={CircleCheck} loading={saving} disabled={picked.size === 0} onClick={save}>
              {picked.size ? `Tandai ${picked.size} vaksin` : 'Pilih vaksin dulu'}
            </Button>
            <p className="text-[13px] text-mute text-center mt-2">Tanggal diisi sesuai jadwal ideal. Ketuk panah untuk mengatur tanggal atau foto.</p>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-2 pt-1">
        {pending.length === 0 && <EmptyState icon={CircleCheck} title="Semua sudah tercatat" body="Tidak ada vaksin yang tersisa di jadwal." className="py-6" />}
        {pastDue.length > 1 && (
          <button
            type="button"
            onClick={() => setPicked(allPastPicked ? new Set() : new Set(pastDue.map((v) => v.ref.id)))}
            className="h-9 px-1 text-[15px] text-brand-orange-deep"
          >
            {allPastPicked ? 'Batalkan pilihan' : `Pilih semua yang sudah lewat jadwal (${pastDue.length})`}
          </button>
        )}
        {pending.map((v) => {
          const on = picked.has(v.ref.id);
          return (
            <div
              key={v.ref.id}
              className={cx(
                'flex items-center rounded-[18px] border transition-colors',
                on ? 'bg-brand-orange-tint border-brand-orange/50' : 'bg-white border-line',
              )}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(v.ref.id)}
                className="flex-1 min-w-0 flex items-center gap-3 pl-4 py-3 text-left"
              >
                <span
                  className={cx(
                    'w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                    on ? 'bg-brand-orange border-brand-orange text-white' : 'border-line-2 bg-white',
                  )}
                >
                  {on && <Check className="w-4 h-4" strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[16px] leading-snug">{v.ref.vaccineName}</span>
                  <span className="block text-[13.5px] text-mute">
                    {ageLabelForVaccine(v.ref.recommendedAgeMonth)} · {VACCINE_STATE_LABEL[v.state]}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onOpenOne(v)}
                aria-label={`Atur tanggal dan foto ${v.ref.vaccineName}`}
                className="w-12 self-stretch flex items-center justify-center text-faint"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}

export default function VaccineScreen({ onBack }: { onBack?: () => void }) {
  const { activeChild } = useStore();
  const { data, loading } = useChildData(activeChild?.id, !activeChild?.isUnborn);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<VaccineItem | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const schedule = useMemo(
    () => (activeChild && !activeChild.isUnborn ? buildVaccineSchedule(activeChild.birthDate, data.immunizations) : []),
    [activeChild, data.immunizations],
  );

  if (!activeChild) return null;
  if (activeChild.isUnborn) {
    return (
      <Screen title="Imunisasi" onBack={onBack}>
        <UnbornGate name={activeChild.name} />
      </Screen>
    );
  }

  const next = nextVaccine(schedule);
  const doneCount = schedule.filter((v) => v.state === 'done').length;
  const pendingCount = schedule.length - doneCount;
  const filtered = schedule
    .filter((v) => (filter === 'all' ? true : filter === 'done' ? v.state === 'done' : v.state !== 'done'))
    .filter((v) => v.ref.vaccineName.toLowerCase().includes(query.trim().toLowerCase()) || v.ref.description.toLowerCase().includes(query.trim().toLowerCase()));

  const print = () => {
    setMenuOpen(false);
    const rows = schedule
      .map((v) => {
        const cls = v.state === 'done' ? 'ok' : v.state === 'catchup' ? 'bad' : 'warn';
        return `<tr><td>${escapeHtml(v.ref.vaccineName)}</td><td>${escapeHtml(ageLabelForVaccine(v.ref.recommendedAgeMonth))}</td><td>${formatDate(v.dueDate)}</td><td>${
          v.record?.givenDate ? formatDate(v.record.givenDate) : '-'
        }</td><td><span class="pill ${cls}">${VACCINE_STATE_LABEL[v.state]}</span></td></tr>`;
      })
      .join('');
    printDocument(
      `Kartu Imunisasi ${activeChild.name}`,
      `${printHeader('Kartu imunisasi digital')}
      <div class="meta"><div><span class="muted">Nama anak</span><b>${escapeHtml(activeChild.name)}</b></div><div><span class="muted">Tanggal lahir</span><b>${formatDate(
        activeChild.birthDate,
      )}</b></div><div><span class="muted">Usia</span><b>${ageLabel(activeChild.birthDate)}</b></div><div><span class="muted">Selesai</span><b>${doneCount} dari ${
        schedule.length
      } dosis</b></div></div>
      <h2>Riwayat dan jadwal imunisasi</h2>
      <table><thead><tr><th>Vaksin</th><th>Usia anjuran</th><th>Jadwal ideal</th><th>Diberikan</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="note">Jadwal mengacu pada rekomendasi imunisasi anak IDAI dan Kemenkes. Konfirmasi jadwal akhir bersama dokter atau bidan Anda.</div>`,
    );
  };

  return (
    <Screen
      title="Imunisasi"
      subtitle={`Jadwal IDAI untuk ${firstName(activeChild.name)}`}
      onBack={onBack}
      withTabBar={!onBack}
      right={<IconButton icon={EllipsisVertical} label="Lainnya" onClick={() => setMenuOpen(true)} />}
      titleAccessory={
        <Button size="sm" icon={Plus} onClick={() => setPickerOpen(true)}>
          Catat
        </Button>
      }
    >
      {/* First visit: nothing recorded yet */}
      {!loading && data.immunizations.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-5 mb-3">
          <div className="rounded-[22px] bg-brand-orange-tint border border-brand-orange/30 p-4 flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-full bg-white text-brand-orange-deep flex items-center justify-center shrink-0 shadow-card">
              <BookOpenCheck className="w-5 h-5" strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <div className="text-[16px]">Mulai dari buku KIA</div>
              <p className="text-[14px] text-ink-2 leading-snug mt-0.5">
                Tandai vaksin yang sudah diterima {firstName(activeChild.name)}. Status di bawah akan menyesuaikan otomatis.
              </p>
              <Button size="sm" variant="soft" icon={Plus} className="mt-3" onClick={() => setPickerOpen(true)}>
                Catat riwayat
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upcoming card */}
      <div className="px-5">
        {loading ? (
          <Skeleton className="h-[172px] rounded-[24px]" />
        ) : next ? (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(next)}
            className="w-full text-left rounded-[24px] overflow-hidden border border-brand-orange/40 bg-white shadow-raised"
          >
            <div className="bg-orange-gradient text-white px-5 py-3 flex items-center justify-between text-[16px]">
              <span>{next.state === 'catchup' ? 'Perlu dikejar' : 'Berikutnya'}</span>
              <span className="text-white/90">
                {doneCount} dari {schedule.length} selesai
              </span>
            </div>
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[24px] leading-tight tracking-[-0.01em]">{next.ref.vaccineName.replace(/\s*\(.*\)/, '')}</div>
                  <div className="text-[16px] text-ink-2 mt-1 line-clamp-2">{next.ref.description}</div>
                </div>
                <ArrowCorner />
              </div>
              <div className="flex items-center justify-between gap-3 mt-4 text-[15px] text-ink-2">
                <span className="flex items-center gap-2">
                  <Calendar className="w-[18px] h-[18px] text-mute" strokeWidth={1.7} />
                  {formatDate(next.dueDate, 'long')}
                </span>
                <span className="flex items-center gap-1.5 text-mute">
                  <Clock className="w-[18px] h-[18px]" strokeWidth={1.7} />
                  {vaccineTiming(next)}
                </span>
              </div>
            </div>
          </motion.button>
        ) : (
          <Card className="p-5 flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-semantic-success-soft text-semantic-success flex items-center justify-center">
              <CircleCheck className="w-6 h-6" />
            </span>
            <div>
              <div className="text-[19px]">Imunisasi dasar lengkap</div>
              <div className="text-[15px] text-mute">Semua {schedule.length} dosis sudah tercatat.</div>
            </div>
          </Card>
        )}
      </div>

      {/* Search */}
      <div className="px-5 mt-5">
        <label className="flex items-center gap-3 h-[52px] px-4 rounded-[18px] bg-white border border-line shadow-card focus-within:border-brand-orange transition-colors">
          <Search className="w-5 h-5 text-mute" strokeWidth={1.7} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama vaksin..."
            className="flex-1 bg-transparent text-[17px] placeholder:text-faint"
            aria-label="Cari vaksin"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Hapus pencarian" className="w-6 h-6 rounded-full bg-fill flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </label>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-5 mt-3 overflow-x-auto no-scrollbar">
        <Chip selected={filter === 'all'} onClick={() => setFilter('all')} count={schedule.length}>
          Semua
        </Chip>
        <Chip selected={filter === 'pending'} onClick={() => setFilter('pending')} count={pendingCount}>
          Belum
        </Chip>
        <Chip selected={filter === 'done'} onClick={() => setFilter('done')} count={doneCount}>
          Selesai
        </Chip>
      </div>

      {/* List */}
      <div className="px-5 mt-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[84px] rounded-[22px]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Search} title="Vaksin tidak ditemukan" body="Coba kata kunci lain atau ubah filter." />
        ) : (
          <motion.div key={filter + query} className="space-y-3" variants={listContainer} initial="hidden" animate="show">
            {filtered.map((v) => (
              <motion.button
                key={v.ref.id}
                variants={listItem}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(v)}
                className="w-full text-left bg-white rounded-[22px] border border-line shadow-card p-4 flex items-center gap-3.5"
              >
                <VaccineIcon state={v.state} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[17px] leading-snug">{v.ref.vaccineName}</span>
                  <span className="block text-[14px] text-mute mt-0.5 truncate">
                    {v.state === 'done' && v.record?.givenDate
                      ? `Diberikan ${formatDate(v.record.givenDate)}`
                      : `${ageLabelForVaccine(v.ref.recommendedAgeMonth)} · ${VACCINE_STATE_LABEL[v.state]}`}
                  </span>
                </span>
                <ArrowCorner className="!w-5 !h-5 text-mute" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      <p className="px-6 mt-5 text-[13px] text-mute leading-relaxed">
        Jadwal mengacu pada rekomendasi imunisasi IDAI dan Kemenkes. Konfirmasi jadwal akhir bersama dokter atau bidan.
      </p>

      <VaccineSheet item={selected} childId={activeChild.id} childName={activeChild.name} onClose={() => setSelected(null)} />

      <PickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        schedule={schedule}
        childId={activeChild.id}
        childName={firstName(activeChild.name)}
        onOpenOne={(v) => {
          setPickerOpen(false);
          window.setTimeout(() => setSelected(v), 220);
        }}
      />

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Lainnya">
        <ListGroup className="!px-0 pt-1">
          <ListRow icon={Printer} title="Cetak kartu imunisasi" subtitle="Simpan sebagai PDF untuk sekolah atau dokter" onClick={print} />
        </ListGroup>
      </Sheet>

    </Screen>
  );
}
