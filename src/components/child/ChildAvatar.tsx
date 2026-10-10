import React, { useState } from 'react';
import { Baby } from 'lucide-react';
import type { Child } from '../../types';
import { KidAvatar } from '../ui/Avatar';
import { cx } from '../../lib/cx';

/** Child photo when uploaded, the illustrated avatar otherwise, a soft bump icon for a pregnancy. */
export default function ChildAvatar({ child, size = 48, className, bg = true }: { child: Child; size?: number; className?: string; bg?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (child.photoUrl && !failed) {
    return (
      <img
        src={child.photoUrl}
        alt={`Foto ${child.name}`}
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
        className={cx('shrink-0 rounded-full object-cover bg-fill', className)}
        draggable={false}
      />
    );
  }
  if (child.isUnborn) {
    return (
      <span
        style={{ width: size, height: size }}
        className={cx('shrink-0 rounded-full flex items-center justify-center bg-[radial-gradient(circle_at_35%_30%,#FFF4E6_0%,#FFE0BF_100%)] text-brand-orange-deep', className)}
        role="img"
        aria-label="Profil kehamilan"
      >
        <Baby style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={1.6} />
      </span>
    );
  }
  return <KidAvatar gender={child.gender} size={size} bg={bg} className={className} />;
}
