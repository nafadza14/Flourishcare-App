import React, { useMemo } from 'react';
import { motion } from 'motion/react';

const COLORS = ['#F29935', '#F5BB3E', '#E5801F', '#FFD9A8', '#4F9A68', '#EE8FA6'];

/** One-shot celebratory burst. Mount with a new key to replay. */
export default function Confetti({ count = 26, className }: { count?: number; className?: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const distance = 90 + Math.random() * 90;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 40,
          rotate: Math.random() * 360,
          color: COLORS[i % COLORS.length],
          size: 6 + Math.random() * 6,
          round: Math.random() > 0.5,
          delay: Math.random() * 0.08,
        };
      }),
    [count],
  );

  return (
    <div className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible ${className ?? ''}`} aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute"
          style={{
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : 2,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 120], opacity: [1, 1, 0], rotate: p.rotate, scale: 1 }}
          transition={{ duration: 1.5, delay: p.delay, ease: [0.22, 0.61, 0.36, 1], times: [0, 0.45, 1] }}
        />
      ))}
    </div>
  );
}
