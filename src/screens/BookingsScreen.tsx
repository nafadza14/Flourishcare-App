import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarCheck, CalendarX2, CreditCard, Plus } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Sheet from '../components/ui/Sheet';
import Segmented from '../components/ui/Segmented';
import { Button, Card, EmptyState, Skeleton, StatusPill, type Tone } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import type { Booking } from '../types';
import { useNav } from '../lib/nav';
import { getJSON, sendJSON } from '../api';
import { emitDataChanged, useDataChanged } from '../lib/events';
import { formatDate, formatTime, rupiah } from '../lib/format';
import { categoryTitle } from '../data/pricing';
import { listContainer, listItem } from '../lib/motion';
import { useStore } from '../lib/store';

function statusOf(b: Booking): { label: string; tone: Tone } {
  if (b.status === 'cancelled') return { label: 'Dibatalkan', tone: 'neutral' };
  if (b.status === 'completed') return { label: 'Selesai', tone: 'success' };
  if (b.paymentStatus === 'paid') return { label: 'Terkonfirmasi', tone: 'success' };
  return { label: 'Menunggu pembayaran', tone: 'warning' };
}

function scheduleLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${formatDate(d, 'long')}, ${formatTime(d)}`;
}

export default function BookingsScreen({ onBack }: { onBack?: () => void }) {
  const nav = useNav();
  const toast = useToast();
  const { children } = useStore();
  const [list, setList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [busy, setBusy] = useState<'' | 'pay' | 'cancel'>('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = async () => {
    setList(await getJSON<Booking[]>('/api/bookings', []));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);
  useDataChanged((scope) => scope === 'bookings' && load(), []);

  const startOfToday = new Date(new Date().toDateString()).getTime();
  const upcoming = useMemo(
    () => list.filter((b) => b.status !== 'cancelled' && new Date(b.scheduledAt).getTime() >= startOfToday).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [list, startOfToday],
  );
  const past = useMemo(
    () => list.filter((b) => !upcoming.includes(b)).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)),
    [list, upcoming],
  );
  const shown = tab === 'upcoming' ? upcoming : past;

  const payNow = async (b: Booking) => {
    setBusy('pay');
    try {
      const paid = await sendJSON<Booking>(`/api/bookings/${b.id}/pay`, {});
      emitDataChanged('bookings');
      setSelected(paid);
      toast({ title: 'Pembayaran berhasil', body: `Booking ${paid.bookingCode} terkonfirmasi.` });
    } catch (err: any) {
      toast({ title: 'Pembayaran gagal', body: err.message, tone: 'warning' });
    } finally {
      setBusy('');
    }
  };

  const cancel = async (b: Booking) => {
    setBusy('cancel');
    try {
      await sendJSON(`/api/bookings/${b.id}/cancel`, {});
      emitDataChanged('bookings');
      setConfirmCancel(false);
      setSelected(null);
      toast({ title: 'Booking dibatalkan', body: 'Tim kami akan menghubungi Ayah Bunda untuk proses selanjutnya.', tone: 'info' });
    } catch (err: any) {
      toast({ title: 'Gagal membatalkan', body: err.message, tone: 'warning' });
    } finally {
      setBusy('');
    }
  };

  const childName = (id: string) => children.find((c) => c.id === id)?.name ?? 'Si Kecil';

  return (
    <Screen
      title="Jadwal Klinik"
      subtitle="Booking terapi dan konsultasi"
      onBack={onBack}
      titleAccessory={
        <Button size="sm" icon={Plus} onClick={() => nav.push({ name: 'booking' })}>
          Baru
        </Button>
      }
    >
      <div className="px-5">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'upcoming', label: `Akan datang (${upcoming.length})` },
            { value: 'past', label: `Riwayat (${past.length})` },
          ]}
        />
      </div>
      <div className="px-5 mt-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 rounded-[22px]" />
            <Skeleton className="h-28 rounded-[22px]" />
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={tab === 'upcoming' ? CalendarCheck : CalendarX2}
            title={tab === 'upcoming' ? 'Belum ada jadwal' : 'Riwayat masih kosong'}
            body={tab === 'upcoming' ? 'Pesan sesi terapi atau konsultasi untuk si Kecil.' : 'Sesi yang sudah lewat atau dibatalkan tampil di sini.'}
            action={
              tab === 'upcoming' ? (
                <Button icon={Plus} onClick={() => nav.push({ name: 'booking' })}>
                  Booking sekarang
                </Button>
              ) : undefined
            }
          />
        ) : (
          <motion.div key={tab} className="space-y-3" variants={listContainer} initial="hidden" animate="show">
            {shown.map((b) => {
              const st = statusOf(b);
              const d = new Date(b.scheduledAt);
              return (
                <motion.button
                  key={b.id}
                  variants={listItem}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(b)}
                  className="w-full text-left bg-white rounded-[22px] border border-line shadow-card p-4 flex gap-3.5"
                >
                  <span className="w-14 h-16 rounded-[18px] bg-brand-orange-soft text-brand-orange-deep flex flex-col items-center justify-center leading-none shrink-0">
                    <span className="text-[12px] uppercase">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                    <span className="text-[24px] tabular mt-1">{d.getDate()}</span>
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[17px] leading-snug truncate">{b.subService}</span>
                    <span className="block text-[14px] text-mute truncate mt-0.5">
                      {formatTime(d)} · {b.therapistName}
                    </span>
                    <span className="block mt-2">
                      <StatusPill tone={st.tone}>{st.label}</StatusPill>
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>

      <Sheet
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setConfirmCancel(false);
        }}
        title={selected?.subService}
        subtitle={selected ? `Kode ${selected.bookingCode}` : undefined}
      >
        {selected && (
          <div className="space-y-4 pt-1">
            <StatusPill tone={statusOf(selected).tone}>{statusOf(selected).label}</StatusPill>
            <Card className="p-4 space-y-3 text-[15px]">
              {[
                ['Untuk', childName(selected.childId)],
                ['Tipe', categoryTitle(selected.serviceType)],
                ['Paket', selected.packageName ?? '-'],
                ['Terapis', selected.therapistName ?? '-'],
                ['Jadwal', scheduleLabel(selected.scheduledAt)],
                ['Total', rupiah(selected.amount)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-mute shrink-0">{k}</span>
                  <span className="text-right">{v}</span>
                </div>
              ))}
            </Card>
            {selected.status !== 'cancelled' && selected.paymentStatus !== 'paid' && (
              <Button block size="lg" icon={CreditCard} loading={busy === 'pay'} onClick={() => payNow(selected)}>
                Bayar sekarang
              </Button>
            )}
            {selected.status !== 'cancelled' && new Date(selected.scheduledAt).getTime() >= startOfToday && (
              confirmCancel ? (
                <div className="space-y-2">
                  <p className="text-[15px] text-ink-2 text-center">Yakin batalkan booking ini?</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
                      Tidak
                    </Button>
                    <Button variant="danger" loading={busy === 'cancel'} onClick={() => cancel(selected)}>
                      Batalkan
                    </Button>
                  </div>
                </div>
              ) : (
                <Button block variant="danger" onClick={() => setConfirmCancel(true)}>
                  Batalkan booking
                </Button>
              )
            )}
            <p className="text-[13px] text-mute text-center leading-relaxed">Pengingat dikirim lewat WhatsApp H-1 dan 2 jam sebelum sesi.</p>
          </div>
        )}
      </Sheet>
    </Screen>
  );
}
