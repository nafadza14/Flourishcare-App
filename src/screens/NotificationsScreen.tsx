import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, CalendarCheck, CheckCheck, ClipboardCheck, Footprints, MessageCircleHeart, Sparkles, Syringe } from 'lucide-react';
import Screen from '../components/ui/Screen';
import { EmptyState, Skeleton } from '../components/ui/primitives';
import type { Notification } from '../types';
import { useStore } from '../lib/store';
import { useNav, type Route } from '../lib/nav';
import { sendJSON } from '../api';
import { stripEmDash, timeAgo } from '../lib/format';
import { listContainer, listItem } from '../lib/motion';
import { cx } from '../lib/cx';

const TYPE_ICON: Record<string, typeof Bell> = {
  booking: CalendarCheck,
  milestone: Footprints,
  screening: ClipboardCheck,
  q_and_a: MessageCircleHeart,
  immunization: Syringe,
  weekly_digest: Sparkles,
  system: Sparkles,
};

function routeFor(link?: string): Route | null {
  switch (link) {
    case 'bookings':
      return { name: 'bookings' };
    case 'milestones':
      return { name: 'milestone' };
    case 'screenings':
      return { name: 'screening' };
    case 'experts':
      return { name: 'qa' };
    case 'vaccine':
    case 'immunization':
      return { name: 'vaccine' };
    default:
      return null;
  }
}

export default function NotificationsScreen({ onBack }: { onBack?: () => void }) {
  const { refreshNotifications } = useStore();
  const nav = useNav();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshNotifications().then((list) => {
      setItems(list.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
  }, [refreshNotifications]);

  const markAll = async () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    try {
      await sendJSON('/api/notifications/read-all', {});
    } finally {
      refreshNotifications();
    }
  };

  const unread = items.filter((n) => !n.read);
  const read = items.filter((n) => n.read);

  const renderGroup = (title: string, list: Notification[]) =>
    list.length > 0 && (
      <div className="mt-2">
        <h3 className="text-[14px] text-mute uppercase tracking-[0.06em] px-6 mb-2 font-normal">{title}</h3>
        <motion.div className="px-5 space-y-2.5" variants={listContainer} initial="hidden" animate="show">
          {list.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? Bell;
            const route = routeFor(n.deepLink);
            return (
              <motion.button
                key={n.id}
                variants={listItem}
                whileTap={route ? { scale: 0.98 } : undefined}
                onClick={() => route && nav.push(route)}
                className={cx(
                  'w-full text-left rounded-[22px] border p-4 flex gap-3.5',
                  n.read ? 'bg-white/70 border-line' : 'bg-white border-line shadow-card',
                )}
              >
                <span className={cx('w-11 h-11 rounded-full flex items-center justify-center shrink-0', n.read ? 'bg-fill text-ink-2' : 'bg-brand-orange-soft text-brand-orange-deep')}>
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[16px] leading-snug">{stripEmDash(n.title)}</span>
                    {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-brand-orange mt-1.5 shrink-0" />}
                  </span>
                  <span className="block text-[15px] text-ink-2 leading-snug mt-1">{stripEmDash(n.body)}</span>
                  <span className="block text-[13px] text-mute mt-1.5">{timeAgo(n.createdAt)}</span>
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    );

  return (
    <Screen
      title="Notifikasi"
      subtitle={unread.length ? `${unread.length} belum dibaca` : 'Semua sudah dibaca'}
      onBack={onBack}
      titleAccessory={
        unread.length > 0 && (
          <button onClick={markAll} className="h-9 px-4 rounded-full bg-white border border-line-2 shadow-card text-[15px] flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4" /> Tandai dibaca
          </button>
        )
      }
    >
      {loading ? (
        <div className="px-5 space-y-2.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-[22px]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="Belum ada notifikasi" body="Pengingat imunisasi, jawaban ahli, dan jadwal klinik akan muncul di sini." />
      ) : (
        <>
          {renderGroup('Baru', unread)}
          <div className="h-4" />
          {renderGroup('Sebelumnya', read)}
        </>
      )}
    </Screen>
  );
}
