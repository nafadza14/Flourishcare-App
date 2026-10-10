import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChartColumn, MessageCircleHeart, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Segmented from '../components/ui/Segmented';
import Sheet from '../components/ui/Sheet';
import GrowthChartSvg, { GrowthLegend } from '../components/ui/GrowthChartSvg';
import AddMeasurementSheet from '../components/sheets/AddMeasurementSheet';
import { Button, Card, EmptyState, Skeleton, StatusPill, type Tone } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import type { Child, GrowthRecord } from '../types';
import { useStore } from '../lib/store';
import { useNav } from '../lib/nav';
import { useChildData } from '../lib/useChildData';
import { getWeightStatus, latestRecord } from '../lib/growth';
import { ageInMonthsDecimal, firstName, formatDate, formatNumber, parseDate } from '../lib/format';
import { apiFetch } from '../api';
import { emitDataChanged } from '../lib/events';
import { listContainer, listItem } from '../lib/motion';

function toneOf(t: 'success' | 'warning' | 'danger' | 'neutral'): Tone {
  return t;
}

/** Status card + chart. Reused by the child profile segment. */
export function GrowthOverview({ child, records, loading }: { child: Child; records: GrowthRecord[]; loading: boolean }) {
  const nav = useNav();
  const status = getWeightStatus(child, records);
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-[22px]" />
        <Skeleton className="h-72 rounded-[22px]" />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] text-mute">Status berat badan</span>
          <StatusPill tone={toneOf(status.tone)}>{status.short}</StatusPill>
        </div>
        <div className="text-[19px] leading-snug mt-2">{status.title}</div>
        <p className="text-[15px] text-mute leading-relaxed mt-1">{status.description}</p>
        {(status.tone === 'warning' || status.tone === 'danger') && (
          <Button size="sm" variant="soft" icon={MessageCircleHeart} className="mt-3" onClick={() => nav.push({ name: 'qa' })}>
            Tanya ahli soal ini
          </Button>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[19px] leading-tight">Grafik berat badan</div>
            <div className="text-[14px] text-mute mt-0.5">Kurva WHO usia 0 sampai 24 bulan</div>
          </div>
        </div>
        {records.length ? (
          <>
            <GrowthChartSvg child={child} records={records} />
            <div className="mt-4">
              <GrowthLegend childName={child.name} />
            </div>
          </>
        ) : (
          <EmptyState icon={ChartColumn} title="Grafik masih kosong" body="Tambahkan pengukuran pertama untuk melihat kurva pertumbuhan." className="py-6" />
        )}
      </Card>
    </div>
  );
}

/** Measurement log list */
export function GrowthLog({ child, records, onSelect }: { child: Child; records: GrowthRecord[]; onSelect: (r: GrowthRecord) => void }) {
  const desc = records.slice().reverse();
  if (!desc.length) {
    return <EmptyState icon={ChartColumn} title="Belum ada riwayat" body={`Catat berat, tinggi, dan lingkar kepala ${child.name} secara rutin.`} />;
  }
  return (
    <motion.div className="space-y-2.5" variants={listContainer} initial="hidden" animate="show">
      {desc.map((r, i) => {
        const prev = desc[i + 1];
        const delta = prev ? r.weightKg - prev.weightKg : null;
        return (
          <motion.button
            key={r.id}
            variants={listItem}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(r)}
            className="w-full text-left bg-white rounded-[22px] border border-line shadow-card p-4 flex items-center gap-3.5"
          >
            <span className="w-12 h-12 rounded-[16px] bg-fill flex flex-col items-center justify-center leading-none shrink-0">
              <span className="text-[17px] tabular">{parseDate(r.date).getDate()}</span>
              <span className="text-[11px] text-mute uppercase mt-0.5">{parseDate(r.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[17px] tabular">
                {formatNumber(r.weightKg, 2)} kg <span className="text-mute">·</span> {formatNumber(r.heightCm)} cm
              </span>
              <span className="block text-[14px] text-mute mt-0.5 truncate">
                Usia {formatNumber(ageInMonthsDecimal(child.birthDate, r.date))} bln · LK {formatNumber(r.headCircumferenceCm)} cm
              </span>
            </span>
            {delta !== null && (
              <span
                className={`flex items-center gap-1 text-[14px] tabular shrink-0 ${delta >= 0 ? 'text-semantic-success' : 'text-semantic-danger'}`}
              >
                {delta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {delta >= 0 ? '+' : ''}
                {formatNumber(delta, 2)}
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export function RecordSheet({ record, child, onClose }: { record: GrowthRecord | null; child: Child; onClose: () => void }) {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const remove = async () => {
    if (!record) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/growth/${record.id}?childId=${encodeURIComponent(record.childId)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      emitDataChanged('growth');
      toast({ title: 'Pengukuran dihapus', tone: 'info' });
      onClose();
    } catch {
      toast({ title: 'Gagal menghapus', body: 'Coba lagi sebentar lagi.', tone: 'warning' });
    } finally {
      setDeleting(false);
      setConfirm(false);
    }
  };

  return (
    <Sheet open={!!record} onClose={() => { setConfirm(false); onClose(); }} title={record ? formatDate(record.date, 'long') : ''} subtitle={record ? `Usia ${formatNumber(ageInMonthsDecimal(child.birthDate, record.date))} bulan` : ''}>
      {record && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Berat', value: `${formatNumber(record.weightKg, 2)} kg` },
              { label: 'Tinggi', value: `${formatNumber(record.heightCm)} cm` },
              { label: 'L. kepala', value: `${formatNumber(record.headCircumferenceCm)} cm` },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-[18px] border border-line p-3 text-center">
                <div className="text-[13px] text-mute">{s.label}</div>
                <div className="text-[17px] mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>
          {record.notes && (
            <div className="bg-white rounded-[18px] border border-line p-4 text-[15px] text-ink-2 leading-relaxed">{record.notes}</div>
          )}
          {confirm ? (
            <div className="space-y-2">
              <p className="text-[15px] text-ink-2 text-center">Hapus pengukuran ini dari riwayat?</p>
              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="secondary" onClick={() => setConfirm(false)}>
                  Batal
                </Button>
                <Button variant="danger" loading={deleting} onClick={remove}>
                  Hapus
                </Button>
              </div>
            </div>
          ) : (
            <Button block variant="danger" icon={Trash2} onClick={() => setConfirm(true)}>
              Hapus pengukuran
            </Button>
          )}
        </div>
      )}
    </Sheet>
  );
}

export default function GrowthScreen({ onBack }: { onBack?: () => void }) {
  const { activeChild } = useStore();
  const { data, loading } = useChildData(activeChild?.id);
  const [tab, setTab] = useState<'chart' | 'log'>('chart');
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<GrowthRecord | null>(null);

  if (!activeChild) return null;

  return (
    <Screen
      title="Pertumbuhan"
      subtitle={`Berat dan tinggi ${firstName(activeChild.name)}`}
      onBack={onBack}
      titleAccessory={
        <Button size="sm" icon={Plus} onClick={() => setAdding(true)}>
          Catat
        </Button>
      }
    >
      <div className="px-5">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'chart', label: 'Grafik' },
            { value: 'log', label: `Riwayat (${data.growth.length})` },
          ]}
        />
      </div>
      <div className="px-5 mt-4">
        {tab === 'chart' ? (
          <GrowthOverview child={activeChild} records={data.growth} loading={loading} />
        ) : (
          <GrowthLog child={activeChild} records={data.growth} onSelect={setSelected} />
        )}
      </div>
      <p className="px-6 mt-5 text-[13px] text-mute leading-relaxed">
        Grafik ini membantu pemantauan di rumah dan bukan pengganti pemeriksaan dokter. Bila ragu, diskusikan hasilnya dengan tenaga kesehatan.
      </p>

      <AddMeasurementSheet open={adding} onClose={() => setAdding(false)} child={activeChild} last={latestRecord(data.growth)} />
      <RecordSheet record={selected} child={activeChild} onClose={() => setSelected(null)} />
    </Screen>
  );
}
