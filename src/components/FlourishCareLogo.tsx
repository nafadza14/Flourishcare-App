import React from 'react';
import { cx } from '../lib/cx';

/**
 * Official FlourishCare logo (files in public/brand, cropped from the brand PNG, never redrawn).
 *  - mark: the sun only (default)
 *  - full: sun with the FlourishCare wordmark
 *  - wordmark: the FlourishCare lettering only
 */
export const LOGO_SRC = {
  mark: '/brand/logo-mark.png',
  full: '/brand/logo.png',
  wordmark: '/brand/logo-wordmark.png',
} as const;

/** Home screen icon (bump ?v= when the icon files change, so phones fetch the new one) */
export const APP_ICON_SRC = '/icons/icon-192.png?v=3';

interface FlourishCareLogoProps {
  className?: string;
  variant?: keyof typeof LOGO_SRC;
  /** Gentle breathing motion (respects reduced motion) */
  animated?: boolean;
  alt?: string;
}

export const FlourishCareLogo: React.FC<FlourishCareLogoProps> = ({ className = 'w-10 h-10', variant = 'mark', animated = false, alt = 'FlourishCare' }) => (
  <img
    src={LOGO_SRC[variant]}
    alt={alt}
    draggable={false}
    decoding="async"
    className={cx('object-contain select-none pointer-events-none', animated && 'anim-breathe', className)}
  />
);

export default FlourishCareLogo;
