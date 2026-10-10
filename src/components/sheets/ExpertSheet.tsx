import React from 'react';
import { CalendarCheck, MessageCircleHeart } from 'lucide-react';
import Sheet from '../ui/Sheet';
import { Button } from '../ui/primitives';
import type { ClinicalExpert } from '../../data/team';
import { CLINIC_LOCATION } from '../../data/team';
import { useNav } from '../../lib/nav';
import CoverImage from '../ui/CoverImage';

/** Profile of one FlourishCare psychologist or therapist (data from www.flourishcare.id/team). */
export default function ExpertSheet({ expert, onClose }: { expert: ClinicalExpert | null; onClose: () => void }) {
  const nav = useNav();
  return (
    <Sheet open={!!expert} onClose={onClose} title={expert?.name} subtitle={expert ? `${expert.role} · ${CLINIC_LOCATION}` : undefined}>
      {expert && (
        <div className="space-y-4 pt-1">
          <div className="rounded-[24px] overflow-hidden h-56 bg-brand-orange-soft">
            {expert.photoUrl ? (
              <CoverImage src={expert.photoUrl} alt={`Foto ${expert.name}`} className="w-full h-full" imgClassName="object-[50%_20%]" markClassName="w-16 h-16" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[linear-gradient(140deg,#FFF4E6_0%,#FBE2C8_100%)]">
                <span className="text-[64px] text-brand-orange-deep/80 tracking-[-0.02em]">{expert.shortName.slice(0, 1)}</span>
              </div>
            )}
          </div>
          {expert.bio && <p className="text-[16px] text-ink-2 leading-relaxed">{expert.bio}</p>}
          {expert.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {expert.specialties.map((s) => (
                <span key={s} className="h-8 px-3 rounded-full bg-brand-orange-tint border border-brand-orange/25 text-[14px] text-brand-orange-deep flex items-center">
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              variant="secondary"
              icon={MessageCircleHeart}
              onClick={() => {
                onClose();
                window.setTimeout(() => nav.push({ name: 'qa' }), 200);
              }}
            >
              Tanya ahli
            </Button>
            <Button
              icon={CalendarCheck}
              onClick={() => {
                onClose();
                nav.push({ name: 'booking', therapistId: expert.id });
              }}
            >
              Booking
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
