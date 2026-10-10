import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChartColumn, Info, MessageCircleHeart, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Sheet from '../components/ui/Sheet';
import GrowthChartSvg, { GrowthLegend, WINDOWS, indicatorsFor, windowForAge, type ChartWindow } from '../components/ui/GrowthChartSvg';
import AddMeasurementSheet from '../components/sheets/AddMeasurementSheet';
import UnbornGate from '../components/child/UnbornGate';
import { Button, Card, Chip, EmptyState, Skeleton, StatusPill, type Tone } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import type { Child, GrowthRecord } from '../types';
import { useStore } from '../lib/store';
import { useNav } from '../lib/nav';
import { useChildData } from '../lib/useChildData';
import {
  assessRecord,
  getGrowthStatus,
  growthAgeMonths,
  indicatorInfo,
  latestRecord,
  percentileLabel,
  sortRecords,
  type GrowthTone,
  type Indicator,
  type IndicatorResult,
} from '../lib/growth';
import { ageInMonthsDecimal, daysBetween, firstName, formatDate, formatNumber, parseDate } from '../lib/format';
import { apiFetch } from '../api';
import { emitDataChanged } from '../lib/events';
import { listContainer, listItem } from '../lib/motion';
import { cx } from '../lib/cx';

const toneOf = (t: GrowthTone): Tone => t;

const TONE_DOT: Record<GrowthTone, string> = {
  success: 'bg-semantic-success',
  warning: 'bg-semantic-warning',
  danger: 'bg-semantic-danger',
  neutral: 'bg-faint',
};

/** One line per indicator: short name, value, position, category */
export function IndicatorRow({ r }: { r: IndicatorResult }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className={cx('w-2.5 h-2.5 rounded-full shrink-0', TONE_DOT[r.category.tone])} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] leading-tight">
          <span className="text-ink">{r.short}</span>
          <span className="text-mute"> · {r.label}</span>
        </div>
        <div className="text-[13.5px] text-mute mt-0.5 tabular">
          {r.standard === 'WHO' ? `z ${formatNumber(r.z, 1)} (${percentileLabel(r.percentile)})` : percentileLabel(r.percentile)}
        </div>
      </div>
      <StatusPill tone={toneOf(r.category.tone)}>{r.category.label}</StatusPill>
    </div>
  );
}

/** Status card + chart. Reused by the child profile segment and Pantau. */
export function GrowthOverview({ child, records, loading, compact }: { child: Child; records: GrowthRecord[]; loading: boolean; compact?: boolean }) {
  const nav = useNav();
  const status = getGrowthStatus(child, records);
  const latest = latestRecord(records);
  const age = latest ? growthAgeMonths(child, latest.date).age : ageInMonthsDecimal(child.birthDate, new Date());
  const [win, setWin] = useState<ChartWindow>(windowForAge(age));
  const options = indicatorsFor(win);
  const [indicator, setIndicator] = useState<Indicator>(options[0]);
  const shown = options.includes(indicator) ? indicator : options[0];
  const windowStandard = WINDOWS.find((w) => w.key === win)!.standard;
  const availableWindows = WINDOWS.filter((w) => w.from <= Math.max(age, 0) || w.key === win);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 rounded-[22px]" />
        <Skeleton className="h-72 rounded-[22px]" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] text-mute">Status pertumbuhan</span>
          <StatusPill tone={toneOf(status.tone)}>{status.short}</StatusPill>
        </div>
        <div className="text-[19px] leading-snug mt-2">{status.title}</div>
        <p className="text-[15px] text-mute leading-relaxed mt-1">{status.description}</p>
        {status.chips.length > 0 && (
          <div className="mt-2 divide-y divide-line">
            {status.chips.map((r) => (
              <IndicatorRow key={r.indicator} r={r} />
            ))}
          </div>
        )}
        {status.trend && (
          <div
            className={cx(
              'mt-3 rounded-[14px] px-3 py-2.5 text-[14px] leading-snug flex gap-2',
              status.trend.tone === 'success' ? 'bg-semantic-success-soft text-ink-2' : status.trend.tone === 'warning' ? 'bg-semantic-warning-soft text-ink-2' : 'bg-semantic-danger-soft text-ink-2',
            )}
          >
            {status.trend.tone === 'success' ? <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-semantic-success" /> : <TrendingDown className="w-4 h-4 shrink-0 mt-0.5 text-semantic-danger" />}
            {status.trend.text}
          </div>
        )}
        {status.assessment?.corrected && (
          <p className="text-[13px] text-mute mt-3 flex gap-1.5">
            <Info className="w-4 h-4 shrink-0 mt-px" /> Memakai usia koreksi karena {firstName(child.name)} lahir prematur ({child.gestationalWeeks} minggu).
          </p>
        )}
        {(status.tone === 'warning' || status.tone === 'danger') && (
          <Button size="sm" variant="soft" icon={MessageCircleHeart} className="mt-3" onClick={() => nav.push({ name: 'qa' })}>
            Tanya ahli soal ini
          </Button>
        )}
      </Card>

      {!compact && (
        <Card className="p-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {availableWindows.map((w) => (
              <Chip key={w.key} selected={w.key === win} onClick={() => setWin(w.key)}>
                {w.label}
              </Chip>
            ))}
          </div>
          <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {options.map((k) => (
              <button
                key={k}
                onClick={() => setIndicator(k)}
                className={cx(
                  'h-8 px-3 rounded-full text-[14px] shrink-0 border transition-colors',
                  k === shown ? 'bg-brand-orange-soft border-brand-orange/40 text-brand-orange-deep' : 'bg-white border-line text-ink-2',
                )}
              >
                {indicatorInfo(k, WINDOWS.find((w) => w.key === win)!.from).short}
              </button>
            ))}
          </div>
          <div className="text-[17px] leading-tight mt-3">{indicatorInfo(shown, WINDOWS.find((w) => w.key === win)!.from).label}</div>
          <div className="text-[13px] text-mute mt-0.5 mb-2">
            {windowStandard === 'WHO' ? 'Standar WHO 2006, kategori Permenkes No. 2 Tahun 2020' : 'Standar CDC 2000, dipakai IDAI untuk usia di atas 5 tahun'}
          </div>
          {records.length ? (
            <>
              <GrowthChartSvg child={child} records={records} indicator={shown} win={win} />
              <div className="mt-3">
                <GrowthLegend childName={firstName(child.name)} standard={windowStandard} />
              </div>
            </>
          ) : (
            <EmptyState icon={ChartColumn} title="Grafik masih kosong" body="Tambahkan pengukuran pertama untuk melihat posisinya di kurva." className="py-6" />
          )}
        </Card>
      )}
    </div>
  );
}

/** Change since the previous measurement */
function Comparison({ records }: { records: GrowthRecord[] }) {
  const sorted = sortRecords(records);
  if (sorted.length < 2) return null;
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const days = daysBetween(parseDate(prev.date), parseDate(last.date));
  const rows = [
    { label: 'Berat', d: last.weightKg - prev.weightKg, unit: 'kg', digits: 2 },
    { label: 'Panjang/tinggi', d: last.heightCm - prev.heightCm, unit: 'cm', digits: 1 },
    ...(last.headCircumferenceCm > 0 && prev.headCircumferenceCm > 0 ? [{ label: 'L. kepala', d: last.headCircumferenceCm - prev.headCircumferenceCm, unit: 'cm', digits: 1 }] : []),
  ];
  return (
    <Card className="p-4">
      <div className="text-[14px] text-mute">Dibanding pengukuran sebelumnya ({days} hari lalu)</div>
      <div className="grid grid-cols-3 gap-2 mt-2.5">
        {rows.map((r) => (
          <div key={r.label} className="rounded-[16px] bg-fill p-3">
            <div className="text-[12.5px] text-mute">{r.label}</div>
            <div className={cx('text-[17px] tabular mt-0.5', r.d < 0 ? 'text-semantic-danger' : 'text-ink')}>
              {r.d >= 0 ? '+' : ''}
              {formatNumber(r.d, r.digits)} {r.unit}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Measurement log list */
export function GrowthLog({ child, records, onSelect }: { child: Child; records: GrowthRecord[]; onSelect: (r: GrowthRecord) => void }) {
  const desc = sortRecords(records).reverse();
  if (!desc.length) {
    return <EmptyState icon={ChartColumn} title="Belum ada riwayat" body={`Catat berat, panjang atau tinggi, dan lingkar kepala ${child.name} setiap bulan.`} />;
  }
  return (
    <motion.div className="space-y-2.5" variants={listContainer} initial="hidden" animate="show">
      {desc.map((r) => {
        const a = assessRecord(child, r);
        const worst = a.results.some((x) => x.category.tone === 'danger') ? 'danger' : a.results.some((x) => x.category.tone === 'warning') ? 'warning' : a.results.length ? 'success' : 'neutral';
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
                Usia {formatNumber(a.age)} bln{r.headCircumferenceCm > 0 ? ` · LK ${formatNumber(r.headCircumferenceCm)} cm` : ''}
              </span>
            </span>
            <span className={cx('w-2.5 h-2.5 rounded-full shrink-0', TONE_DOT[worst as GrowthTone])} aria-label="Status pengukuran" />
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
  const assessment = useMemo(() => (record ? assessRecord(child, record) : null), [record, child]);

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
    <Sheet
      open={!!record}
      onClose={() => {
        setConfirm(false);
        onClose();
      }}
      title={record ? formatDate(record.date, 'long') : ''}
      subtitle={assessment ? `Usia ${formatNumber(assessment.age)} bulan${assessment.corrected ? ' (usia koreksi)' : ''}` : ''}
    >
      {record && assessment && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Berat', value: `${formatNumber(record.weightKg, 2)} kg` },
              { label: 'Panjang/tinggi', value: `${formatNumber(record.heightCm)} cm` },
              { label: 'L. kepala', value: record.headCircumferenceCm > 0 ? `${formatNumber(record.headCircumferenceCm)} cm` : '-' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-[18px] border border-line p-3 text-center">
                <div className="text-[12.5px] text-mute">{s.label}</div>
                <div className="text-[16px] mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>
          {assessment.results.length > 0 && (
            <Card className="px-4 py-1 divide-y divide-line">
              {assessment.results.map((r) => (
                <IndicatorRow key={r.indicator} r={r} />
              ))}
            </Card>
          )}
          {record.notes && <div className="bg-white rounded-[18px] border border-line p-4 text-[15px] text-ink-2 leading-relaxed">{record.notes}</div>}
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
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<GrowthRecord | null>(null);

  if (!activeChild) return null;
  if (activeChild.isUnborn) {
    return (
      <Screen title="Pertumbuhan" onBack={onBack}>
        <UnbornGate name={activeChild.name} />
      </Screen>
    );
  }

  return (
    <Screen
      title="Pertumbuhan"
      subtitle={`Berat, panjang, dan lingkar kepala ${firstName(activeChild.name)}`}
      onBack={onBack}
      titleAccessory={
        <Button size="sm" icon={Plus} onClick={() => setAdding(true)}>
          Catat
        </Button>
      }
    >
      <div className="px-5 space-y-3">
        <GrowthOverview child={activeChild} records={data.growth} loading={loading} />
        {!loading && <Comparison records={data.growth} />}
      </div>
      <div className="px-5 mt-6">
        <h2 className="text-[21px] font-normal mb-3">Riwayat pengukuran</h2>
        {loading ? <Skeleton className="h-20 rounded-[22px]" /> : <GrowthLog child={activeChild} records={data.growth} onSelect={setSelected} />}
      </div>
      <p className="px-6 mt-5 text-[13px] text-mute leading-relaxed">
        Grafik ini membantu pemantauan di rumah dan bukan pengganti pemeriksaan dokter. Bila ragu, diskusikan hasilnya dengan tenaga kesehatan.
      </p>

      <AddMeasurementSheet open={adding} onClose={() => setAdding(false)} child={activeChild} last={latestRecord(data.growth)} />
      <RecordSheet record={selected} child={activeChild} onClose={() => setSelected(null)} />
    </Screen>
  );
}
