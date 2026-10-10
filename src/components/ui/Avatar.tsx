import React, { useId, useState } from 'react';
import { cx } from '../../lib/cx';
import FlourishCareLogo from '../FlourishCareLogo';

/**
 * Original illustrated avatars with soft 3D shading, drawn in SVG.
 * Eyes blink gently; respects reduced motion via CSS.
 */

interface KidAvatarProps {
  gender?: 'L' | 'P';
  size?: number;
  bg?: boolean;
  className?: string;
}

export function KidAvatar({ gender = 'L', size = 48, bg = true, className }: KidAvatarProps) {
  const uid = useId().replace(/:/g, '');
  const skin = `skin-${uid}`;
  const hair = `hair-${uid}`;
  const shirt = `shirt-${uid}`;
  const bgId = `bg-${uid}`;
  const shine = `shine-${uid}`;
  const isGirl = gender === 'P';

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={cx('shrink-0', className)} role="img" aria-label={isGirl ? 'Avatar anak perempuan' : 'Avatar anak laki-laki'}>
      <defs>
        <radialGradient id={bgId} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFF4E6" />
          <stop offset="100%" stopColor="#FFE2C2" />
        </radialGradient>
        <radialGradient id={skin} cx="42%" cy="38%" r="68%">
          <stop offset="0%" stopColor="#FFE3CC" />
          <stop offset="70%" stopColor="#F7C39E" />
          <stop offset="100%" stopColor="#E9A57E" />
        </radialGradient>
        <linearGradient id={hair} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A5434" />
          <stop offset="100%" stopColor="#53301C" />
        </linearGradient>
        <linearGradient id={shirt} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isGirl ? '#FFD1DC' : '#FFFFFF'} />
          <stop offset="100%" stopColor={isGirl ? '#F6B3C4' : '#F1E6DC'} />
        </linearGradient>
        <radialGradient id={shine} cx="35%" cy="25%" r="40%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {bg && <circle cx="60" cy="60" r="60" fill={`url(#${bgId})`} />}

      {/* Shirt */}
      <path d="M26 120c2-17 16-27 34-27s32 10 34 27Z" fill={`url(#${shirt})`} />
      <path d="M50 94c3 5 7 7 10 7s7-2 10-7" fill="none" stroke={isGirl ? '#E98AA3' : '#F29935'} strokeWidth="3" strokeLinecap="round" />
      {/* Neck */}
      <path d="M52 86h16v9c-5 4-11 4-16 0Z" fill="#E9A57E" />

      {/* Girl back hair */}
      {isGirl && (
        <>
          <circle cx="27" cy="44" r="12" fill={`url(#${hair})`} />
          <circle cx="93" cy="44" r="12" fill={`url(#${hair})`} />
          <circle cx="33" cy="52" r="4" fill="#F29935" />
          <circle cx="87" cy="52" r="4" fill="#F29935" />
        </>
      )}

      {/* Ears */}
      <circle cx="29" cy="64" r="8" fill="#F2B48C" />
      <circle cx="91" cy="64" r="8" fill="#F2B48C" />
      <circle cx="29" cy="64" r="4" fill="#E9A57E" />
      <circle cx="91" cy="64" r="4" fill="#E9A57E" />

      {/* Head */}
      <ellipse cx="60" cy="61" rx="31" ry="30" fill={`url(#${skin})`} />
      <ellipse cx="60" cy="61" rx="31" ry="30" fill={`url(#${shine})`} />

      {/* Hair */}
      {isGirl ? (
        <path d="M29 60c-2-20 12-33 31-33s33 13 31 33c-5-7-12-12-18-13 1 4-1 8-4 9-2-5-7-9-12-10-3 6-10 10-16 10-4 0-8 2-12 4Z" fill={`url(#${hair})`} />
      ) : (
        <path d="M29 62c-3-21 11-35 31-35 16 0 27 8 30 20 1 5 1 10 1 15-4-8-9-12-14-14-2 5-7 7-12 7 2-3 2-6 1-8-5 5-13 8-22 8-6 0-11 2-15 7Z M55 27c1-5 6-8 10-6-3 1-5 3-6 6Z" fill={`url(#${hair})`} />
      )}

      {/* Brows */}
      <path d="M43 56q5-3 10 0" stroke="#5B341F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M67 56q5-3 10 0" stroke="#5B341F" strokeWidth="2.4" fill="none" strokeLinecap="round" />

      {/* Eyes */}
      <g className="anim-blink">
        <ellipse cx="48.5" cy="65" rx="4" ry="5" fill="#2B1D16" />
        <ellipse cx="71.5" cy="65" rx="4" ry="5" fill="#2B1D16" />
        <circle cx="50" cy="63" r="1.4" fill="#FFFFFF" />
        <circle cx="73" cy="63" r="1.4" fill="#FFFFFF" />
      </g>

      {/* Cheeks */}
      <ellipse cx="41" cy="75" rx="6" ry="3.6" fill="#F58E78" opacity="0.4" />
      <ellipse cx="79" cy="75" rx="6" ry="3.6" fill="#F58E78" opacity="0.4" />

      {/* Nose & smile */}
      <path d="M58 71q2 2 4 0" stroke="#D4875F" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M52 78q8 8 16 0q-8 3-16 0Z" fill="#8A3B2A" stroke="#8A3B2A" strokeWidth="2" strokeLinejoin="round" />
      <path d="M55 80q5 3 10 0" stroke="#F58E78" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

interface ParentAvatarProps {
  variant?: 'bunda' | 'ayah' | 'wali';
  size?: number;
  className?: string;
}

export function ParentAvatar({ variant = 'bunda', size = 44, className }: ParentAvatarProps) {
  const uid = useId().replace(/:/g, '');
  const skin = `pskin-${uid}`;
  const hair = `phair-${uid}`;
  const bgId = `pbg-${uid}`;
  const isAyah = variant === 'ayah';

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={cx('shrink-0', className)} role="img" aria-label="Avatar orang tua">
      <defs>
        <radialGradient id={bgId} cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFE9D2" />
          <stop offset="100%" stopColor="#FBD3A8" />
        </radialGradient>
        <radialGradient id={skin} cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#FFDCC2" />
          <stop offset="75%" stopColor="#EDB58F" />
          <stop offset="100%" stopColor="#DC9A72" />
        </radialGradient>
        <linearGradient id={hair} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A2C1D" />
          <stop offset="100%" stopColor="#2A1810" />
        </linearGradient>
        <clipPath id={`clip-${uid}`}>
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${uid})`}>
        <circle cx="60" cy="60" r="60" fill={`url(#${bgId})`} />
        {!isAyah && <path d="M24 74c-6-30 8-52 36-52s42 22 36 52c-4 18-12 30-12 30H36s-8-12-12-30Z" fill={`url(#${hair})`} />}
        <path d="M18 128c3-20 20-31 42-31s39 11 42 31Z" fill={isAyah ? '#5C8FB8' : '#F29935'} />
        <path d="M52 86h16v12c-5 4-11 4-16 0Z" fill="#DC9A72" />
        <ellipse cx="60" cy="60" rx="25" ry="28" fill={`url(#${skin})`} />
        {isAyah ? (
          <path d="M35 56c-2-17 9-28 25-28s27 11 25 28c-3-6-8-10-14-11-6 4-15 5-24 4-5 1-9 4-12 7Z" fill={`url(#${hair})`} />
        ) : (
          <>
            <circle cx="60" cy="24" r="11" fill={`url(#${hair})`} />
            <path d="M35 58c-1-17 10-28 25-28s26 11 25 28c-6-9-14-14-25-14-6 6-14 10-25 14Z" fill={`url(#${hair})`} />
          </>
        )}
        {/* Glasses */}
        <g fill="none" stroke="#3A2A22" strokeWidth="2">
          <circle cx="50" cy="62" r="7" />
          <circle cx="70" cy="62" r="7" />
          <path d="M57 62h6" />
        </g>
        <g className="anim-blink">
          <circle cx="50" cy="62" r="2.4" fill="#2B1D16" />
          <circle cx="70" cy="62" r="2.4" fill="#2B1D16" />
        </g>
        <ellipse cx="44" cy="73" rx="4.5" ry="2.6" fill="#F58E78" opacity="0.35" />
        <ellipse cx="76" cy="73" rx="4.5" ry="2.6" fill="#F58E78" opacity="0.35" />
        <path d="M53 76q7 6 14 0" stroke="#8A3B2A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Photo avatar with graceful initials fallback (for experts) */
export function PhotoAvatar({ src, name, size = 48, className, rounded }: { src?: string; name: string; size?: number; className?: string; rounded?: boolean }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .replace(/,.*$/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <span
      style={{ width: size, height: size }}
      className={cx('shrink-0 overflow-hidden bg-brand-orange-soft text-brand-orange-deep flex items-center justify-center', rounded ? 'rounded-[18px]' : 'rounded-full', className)}
    >
      {src && !failed ? (
        <img src={src} alt={name} referrerPolicy="no-referrer" onError={() => setFailed(true)} className="w-full h-full object-cover object-[50%_22%]" loading="lazy" />
      ) : (
        <span style={{ fontSize: size * 0.36 }} className="font-medium">{initials}</span>
      )}
    </span>
  );
}

/** Avatar for content signed by the clinic team as a whole */
export function TeamAvatar({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cx('shrink-0 rounded-full bg-white border border-line flex items-center justify-center', className)}
      aria-hidden
    >
      <FlourishCareLogo className="w-[72%] h-[72%]" />
    </span>
  );
}
