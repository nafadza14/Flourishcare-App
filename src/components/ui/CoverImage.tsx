import React, { useState } from 'react';
import { cx } from '../../lib/cx';
import FlourishCareLogo from '../FlourishCareLogo';

interface CoverImageProps {
  src?: string;
  alt?: string;
  className?: string;
  /** Size of the brand mark shown while loading or when the image fails */
  markClassName?: string;
  imgClassName?: string;
}

/**
 * Image with a warm branded placeholder: fades in when loaded,
 * keeps the placeholder when the network or the source fails.
 */
export default function CoverImage({ src, alt = '', className, markClassName = 'w-10 h-10', imgClassName }: CoverImageProps) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(src ? 'loading' : 'error');
  return (
    <span className={cx('relative block overflow-hidden', className)}>
      <span
        aria-hidden
        className={cx(
          'absolute inset-0 flex items-center justify-center bg-[linear-gradient(140deg,#FFF4E6_0%,#FBE2C8_100%)] transition-opacity duration-500',
          state === 'ok' ? 'opacity-0' : 'opacity-100',
        )}
      >
        <FlourishCareLogo variant="full" className={cx(markClassName, 'opacity-60')} />
      </span>
      {state !== 'error' && src && (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          className={cx(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
            state === 'ok' ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
    </span>
  );
}
