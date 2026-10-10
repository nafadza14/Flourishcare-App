import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Child, GrowthRecord } from '../../types';
import { standardsFor, standardAt, STANDARD_MAX_MONTH } from '../../lib/growth';
import { ageInMonthsDecimal, formatDate, formatNumber } from '../../lib/format';

interface Pt {
  x: number;
  y: number;
}

/** Catmull-Rom spline to cubic Bezier path (smooth reference curves) */
function smoothPath(points: Pt[]): string {
  if (points.length < 2) return '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const t = 0.18;
    const c1 = { x: p1.x + (p2.x - p0.x) * t, y: p1.y + (p2.y - p0.y) * t };
    const c2 = { x: p2.x - (p3.x - p1.x) * t, y: p2.y - (p3.y - p1.y) * t };
    d += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
  }
  return d;
}

function bandPath(upper: Pt[], lower: Pt[]): string {
  const top = smoothPath(upper);
  const reversed = lower.slice().reverse();
  const bottom = smoothPath(reversed).replace(/^M/, 'L');
  return `${top} ${bottom} Z`;
}

interface Props {
  child: Child;
  records: GrowthRecord[];
  height?: number;
}

const PAD = { left: 34, right: 14, top: 12, bottom: 30 };

export default function GrowthChartSvg({ child, records, height = 230 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.round(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const standards = standardsFor(child);
  const points = useMemo(
    () =>
      records
        .map((r) => ({ age: ageInMonthsDecimal(child.birthDate, r.date), weight: r.weightKg, record: r }))
        .filter((p) => Number.isFinite(p.weight) && p.weight > 0)
        .sort((a, b) => a.age - b.age),
    [records, child.birthDate],
  );

  const maxAge = Math.max(STANDARD_MAX_MONTH, ...points.map((p) => Math.ceil(p.age / 6) * 6));
  const allY = [...standards.flatMap((s) => [s.p3, s.p97]), ...points.map((p) => p.weight)];
  const yMin = Math.max(0, Math.floor(Math.min(...allY) - 0.5));
  const yMax = Math.ceil(Math.max(...allY) + 0.5);

  const innerW = Math.max(10, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;
  const sx = (age: number) => PAD.left + (age / maxAge) * innerW;
  const sy = (kg: number) => PAD.top + innerH - ((kg - yMin) / (yMax - yMin)) * innerH;

  const yStep = yMax - yMin > 12 ? 4 : yMax - yMin > 6 ? 2 : 1;
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(v);
  const xTicks: number[] = [];
  for (let v = 0; v <= maxAge; v += 6) xTicks.push(v);

  const outer = bandPath(
    standards.map((s) => ({ x: sx(s.ageMonth), y: sy(s.p97) })),
    standards.map((s) => ({ x: sx(s.ageMonth), y: sy(s.p3) })),
  );
  const inner = bandPath(
    standards.map((s) => ({ x: sx(s.ageMonth), y: sy(s.p85) })),
    standards.map((s) => ({ x: sx(s.ageMonth), y: sy(s.p15) })),
  );
  const median = smoothPath(standards.map((s) => ({ x: sx(s.ageMonth), y: sy(s.median) })));
  const childLine = points.length > 1 ? smoothPath(points.map((p) => ({ x: sx(p.age), y: sy(p.weight) }))) : '';
  const latest = points[points.length - 1];

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!points.length) return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    let best = 0;
    let bestDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(sx(p.age) - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setHover(best);
  };

  const active = hover !== null ? points[hover] : null;
  const activeStd = active ? standardAt(standards, active.age) : null;

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <svg
        width={width}
        height={height}
        className="block touch-pan-y"
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Grafik berat badan ${child.name} terhadap kurva WHO`}
      >
        {/* grid */}
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={PAD.left} x2={width - PAD.right} y1={sy(v)} y2={sy(v)} stroke="#F0E7DE" strokeWidth={1} />
            <text x={PAD.left - 8} y={sy(v) + 4} textAnchor="end" className="tabular" fontSize="11" fill="#8E837B">
              {v}
            </text>
          </g>
        ))}
        {xTicks.map((v) => (
          <text key={`x${v}`} x={sx(v)} y={height - 10} textAnchor="middle" className="tabular" fontSize="11" fill="#8E837B">
            {v}
          </text>
        ))}

        {/* bands */}
        <motion.path d={outer} fill="#FBDADA" fillOpacity={0.75} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
        <motion.path d={inner} fill="#F29935" fillOpacity={0.2} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} />
        <path d={median} fill="none" stroke="#A0938A" strokeWidth={1.5} strokeDasharray="4 4" />

        {/* current age marker */}
        {latest && (
          <line x1={sx(latest.age)} x2={sx(latest.age)} y1={PAD.top} y2={PAD.top + innerH} stroke="#E5801F" strokeOpacity={0.35} strokeWidth={1} />
        )}

        {/* child line */}
        {childLine && (
          <motion.path
            key={childLine}
            d={childLine}
            fill="none"
            stroke="#E5801F"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: [0.32, 0.72, 0, 1], delay: 0.15 }}
          />
        )}
        {points.map((p, i) => {
          const isLatest = i === points.length - 1;
          return (
            <motion.circle
              key={p.record.id}
              cx={sx(p.age)}
              cy={sy(p.weight)}
              r={isLatest || hover === i ? 6 : 4.5}
              fill="#E5801F"
              stroke="#FFFFFF"
              strokeWidth={2}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.07, type: 'spring', stiffness: 500, damping: 22 }}
              style={{ transformOrigin: `${sx(p.age)}px ${sy(p.weight)}px` }}
            />
          );
        })}

        {/* crosshair */}
        {active && (
          <line x1={sx(active.age)} x2={sx(active.age)} y1={PAD.top} y2={PAD.top + innerH} stroke="#231B16" strokeOpacity={0.25} strokeWidth={1} />
        )}
      </svg>

      <div className="absolute left-1 top-0 text-[11px] text-mute -translate-y-0.5">kg</div>
      <div className="text-center text-[12px] text-mute -mt-1">Usia (bulan)</div>

      <AnimatePresence>
        {active && (
          <motion.div
            key={active.record.id}
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute top-1 pointer-events-none bg-ink text-white rounded-[14px] px-3 py-2 text-[13px] shadow-float"
            style={{ left: Math.min(Math.max(sx(active.age) - 70, 4), width - 150), width: 146 }}
          >
            <div className="text-white/60">{formatDate(active.record.date)}</div>
            <div className="text-[16px] font-medium tabular">{formatNumber(active.weight, 2)} kg</div>
            <div className="text-white/70">
              Usia {formatNumber(active.age, 1)} bln
              {activeStd ? ` · median ${formatNumber(activeStd.median, 1)}` : ''}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GrowthLegend({ childName }: { childName: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[14px] text-ink-2">
      <div className="flex items-center gap-2">
        <span className="w-6 h-3.5 rounded-[5px] bg-[#F29935]/25" />
        Zona normal
      </div>
      <div className="flex items-center gap-2">
        <span className="w-6 h-[3px] rounded-full bg-brand-orange-deep relative">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-orange-deep ring-2 ring-white" />
        </span>
        Berat {childName}
      </div>
      <div className="flex items-center gap-2">
        <span className="w-6 h-3.5 rounded-[5px] bg-[#FBDADA]" />
        Batas ekstrem
      </div>
      <div className="flex items-center gap-2">
        <svg width="24" height="4" aria-hidden>
          <line x1="0" y1="2" x2="24" y2="2" stroke="#A0938A" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>
        Median WHO
      </div>
    </div>
  );
}
