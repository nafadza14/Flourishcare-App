import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeftRight, Baby, CircleDashed, ClipboardCheck, EllipsisVertical, Footprints, Mars, NotebookPen, Pencil, Plus, Ruler, Scale, Trash2, Venus } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Segmented from '../components/ui/Segmented';
import Sheet from '../components/ui/Sheet';
import { KidAvatar } from '../components/ui/Avatar';
import { Button, Card, IconButton, Skeleton } from '../components/ui/primitives';
import { ListGroup, ListRow } from '../components/ui/ListGroup';
import { useToast } from '../components/ui/Toast';
import EditChildSheet from '../components/sheets/EditChildSheet';
import ChildSwitcherSheet from '../components/sheets/ChildSwitcherSheet';
import AddMeasurementSheet from '../components/sheets/AddMeasurementSheet';
import { GrowthLog, GrowthOverview, RecordSheet } from './GrowthScreen';
import { MilestoneSummary } from './MilestoneScreen';
import { ScreeningHistory } from './ScreeningScreen';
import type { GrowthRecord } from '../types';
import { useStore, removeLocalChild } from '../lib/store';
import { useNav } from '../lib/nav';
import { useChildData } from '../lib/useChildData';
import { ageInMonths, ageLabel, firstName, formatDate, formatNumber } from '../lib/format';
import { latestRecord } from '../lib/growth';
import { lateMilestones } from '../lib/milestones';
import { apiFetch } from '../api';

type Seg = 'growth' | 'milestone' | 'screening' | 'notes';

function BigStat({ icon: Icon, label, value }: { icon: typeof Scale; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-9 h-9 shrink-0 rounded-[11px] bg-white border border-line shadow-card flex items-center justify-center text-ink-2">
        <Icon className="w-[17px] h-[17px]" strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <div className="text-[12.5px] text-mute leading-tight whitespace-nowrap">{label}</div>
        <div className="text-[17px] leading-snug whitespace-nowrap tabular">{value}</div>
      </div>
    </div>
  );
}

export default function ChildProfileScreen({ onBack }: { onBack?: () => void }) {
  const { activeChild, children, refreshChildren } = useStore();
  const nav = useNav();
  const toast = useToast();
  const { data, loading } = useChildData(activeChild?.id);
  const [seg, setSeg] = useState<Seg>('growth');
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [record, setRecord] = useState<GrowthRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!activeChild) return null;
  const latest = latestRecord(data.growth);
  const age = ageInMonths(activeChild.birthDate);
  const late = lateMilestones(data.milestones, age);

  const removeChild = async () => {
    setDeleting(true);
    try {
      if (activeChild.id.startsWith('c_local_')) removeLocalChild(activeChild.id);
      else await apiFetch(`/api/children/${activeChild.id}`, { method: 'DELETE' });
      toast({ title: 'Profil dihapus', body: `Data ${activeChild.name} sudah dihapus.`, tone: 'info' });
      setConfirmDelete(false);
      setMenuOpen(false);
      await refreshChildren();
      if (onBack) onBack();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Screen
      title={`Profil ${firstName(activeChild.name)}`}
      subtitle={ageLabel(activeChild.birthDate)}
      onBack={onBack}
      withTabBar={!onBack}
      bottomSpacer={false}
      right={<IconButton icon={EllipsisVertical} label="Lainnya" onClick={() => setMenuOpen(true)} />}
      titleAccessory={
        <Button size="sm" icon={Pencil} onClick={() => setEditOpen(true)}>
          Perbarui
        </Button>
      }
    >
      {/* Hero */}
      <div className="px-5 flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="anim-float shrink-0"
        >
          <KidAvatar gender={activeChild.gender} size={112} bg={false} />
        </motion.div>
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-4 flex-1 min-w-0">
          {loading ? (
            <>
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
            </>
          ) : (
            <>
              <BigStat icon={activeChild.gender === 'P' ? Venus : Mars} label="Gender" value={activeChild.gender === 'P' ? 'Putri' : 'Putra'} />
              <BigStat icon={CircleDashed} label="Kepala" value={latest ? `${formatNumber(latest.headCircumferenceCm)} cm` : '-'} />
              <BigStat icon={Scale} label="Berat" value={latest ? `${formatNumber(latest.weightKg)} kg` : '-'} />
              <BigStat icon={Ruler} label="Tinggi" value={latest ? `${formatNumber(latest.heightCm)} cm` : '-'} />
            </>
          )}
        </div>
      </div>

      {/* Bottom sheet area */}
      <div className="mt-7 bg-white rounded-t-[32px] hairline-t shadow-[0_-8px_30px_rgba(91,58,30,0.05)] min-h-[60vh]" style={{ paddingBottom: onBack ? 'calc(var(--sab) + 32px)' : 'calc(var(--sab) + 112px)' }}>
        <div className="mx-auto w-10 h-[5px] rounded-full bg-line-2 mt-2.5" />
        <div className="px-5 pt-4">
          <Segmented
            size="sm"
            value={seg}
            onChange={setSeg}
            options={[
              { value: 'growth', label: 'Tumbuh' },
              { value: 'milestone', label: 'Milestone' },
              { value: 'screening', label: 'Skrining' },
              { value: 'notes', label: 'Catatan' },
            ]}
          />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={seg}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="px-5 mt-4"
          >
            {seg === 'growth' && (
              <div className="space-y-4">
                <GrowthOverview child={activeChild} records={data.growth} loading={loading} />
                <div className="flex items-center justify-between pt-2">
                  <h3 className="text-[19px] font-normal">Riwayat pengukuran</h3>
                  <Button size="sm" variant="soft" icon={Plus} onClick={() => setAdding(true)}>
                    Catat
                  </Button>
                </div>
                <GrowthLog child={activeChild} records={data.growth.slice(-3)} onSelect={setRecord} />
                {data.growth.length > 3 && (
                  <Button block variant="secondary" onClick={() => nav.push({ name: 'growth' })}>
                    Lihat semua ({data.growth.length})
                  </Button>
                )}
              </div>
            )}

            {seg === 'milestone' && (
              <div className="space-y-4">
                {late.length > 0 && (
                  <div className="rounded-[20px] bg-brand-orange-tint border border-brand-orange/30 p-4 text-[15px] text-ink-2">
                    {late.length} milestone usia sebelumnya belum tercapai. Buka ceklis untuk memperbarui atau mulai skrining.
                  </div>
                )}
                <MilestoneSummary milestones={data.milestones} age={age} />
                <Button block icon={Footprints} onClick={() => nav.push({ name: 'milestone' })}>
                  Buka ceklis milestone
                </Button>
              </div>
            )}

            {seg === 'screening' && (
              <div className="space-y-4">
                <ScreeningHistory screenings={data.screenings} onOpen={(s) => nav.push({ name: 'screening', reportId: s.id })} />
                <Button block icon={ClipboardCheck} onClick={() => nav.push({ name: 'screening' })}>
                  Mulai skrining baru
                </Button>
              </div>
            )}

            {seg === 'notes' && (
              <div className="space-y-3">
                <ListGroup className="!px-0">
                  <ListRow icon={Baby} title="Tanggal lahir" value={formatDate(activeChild.birthDate)} />
                  <ListRow icon={CircleDashed} iconTone="gray" title="Lahir prematur" value={activeChild.isPremature ? 'Ya' : 'Tidak'} />
                </ListGroup>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-[14px] text-mute">
                    <NotebookPen className="w-4 h-4" /> Catatan kesehatan
                  </div>
                  <p className="text-[16px] leading-relaxed text-ink-2 mt-2 whitespace-pre-line">
                    {activeChild.medicalNotes?.trim() || 'Belum ada catatan. Tambahkan alergi, riwayat lahir, atau hal penting lain.'}
                  </p>
                  <Button size="sm" variant="soft" icon={Pencil} className="mt-3" onClick={() => setEditOpen(true)}>
                    Ubah catatan
                  </Button>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <EditChildSheet open={editOpen} onClose={() => setEditOpen(false)} child={activeChild} />
      <ChildSwitcherSheet open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
      <AddMeasurementSheet open={adding} onClose={() => setAdding(false)} child={activeChild} last={latest} />
      <RecordSheet record={record} child={activeChild} onClose={() => setRecord(null)} />

      <Sheet
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          setConfirmDelete(false);
        }}
        title={activeChild.name}
      >
        {confirmDelete ? (
          <div className="space-y-3 pt-1">
            <p className="text-[16px] text-ink-2 leading-relaxed">
              Semua data pertumbuhan, milestone, imunisasi, dan skrining {activeChild.name} akan dihapus permanen.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                Batal
              </Button>
              <Button variant="danger" loading={deleting} onClick={removeChild}>
                Hapus
              </Button>
            </div>
          </div>
        ) : (
          <ListGroup className="!px-0 pt-1">
            {children.length > 1 && (
              <ListRow
                icon={ArrowLeftRight}
                title="Ganti anak"
                onClick={() => {
                  setMenuOpen(false);
                  window.setTimeout(() => setSwitcherOpen(true), 200);
                }}
              />
            )}
            <ListRow
              icon={Plus}
              title="Tambah anak"
              onClick={() => {
                setMenuOpen(false);
                window.setTimeout(() => nav.push({ name: 'onboarding' }), 200);
              }}
            />
            <ListRow icon={Trash2} iconTone="red" title="Hapus profil anak" destructive onClick={() => setConfirmDelete(true)} chevron={false} />
          </ListGroup>
        )}
      </Sheet>
    </Screen>
  );
}
