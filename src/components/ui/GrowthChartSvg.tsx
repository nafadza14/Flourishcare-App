import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Child, GrowthRecord } from '../../types';
import {
  assessRecord,
  bmi,
  growthAgeMonths,
  indicatorInfo,
  percentileLabel,
  referenceCurve,
  zoneBoundaries,
  zScore,
  zToPercentile,
  type GrowthStandard,
  type GrowthTone,
  type Indicator,
} from '../../lib/growth';
import { formatDate, formatNumber } from '../../lib/format';

export type ChartWindow = 'w0_24' | 'w24_60' | 'w60_96';

export const WINDOWS: { key: ChartWindow; label: string; from: number; to: number; standard: GrowthStandard; phase: 'length' | 'height' }[] = [
  { key: 'w0_24', label: '0-2 th', from: 0, to: 24, standard: 'WHO', phase: 'length' },
  { key: 'w24_60', label: '2-5 th', from: 24, to: 60, standard: 'WHO', phase: 'height' },
  { key: 'w60_96', label: '5-8 th', from: 60, to: 96, standard: 'CDC', phase: 'height' },
];

export function windowForAge(age: number): ChartWindow {
  return age < 24 ? 'w0_24' : age <= 60 ? 'w24_60' : 'w60_96';
}

/** Indicators that have a reference for this window */
export function indicatorsFor(win: ChartWindow): Indicator[] {
  return win === 'w60_96' ? ['bfa', 'lhfa', 'wfa'] : ['wflh', 'lhfa', 'wfa', 'hcfa', 'bfa'];
}

interface Pt {
  x: number;
  y: number;
}

function linePath(points: Pt[]): string {
  return points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

const ZONE_FILL: Record<GrowthTone, string> = {
  success: '#DCEFE2',
  warning: '#FBEBC8',
  danger: '#FBDADA',
  neutral: '#F0E7DE',
};

interface Props {
  child: Child;
  records: GrowthRecord[];
  indicator: Indicator;
  win: ChartWindow;
  height?: number;
}

const PAD = { left: 34, right: 30, top: 12, bottom: 30 };

export default function GrowthChartSvg({ child, records, indicator, win, height = 250 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [hover, setHover] = useState<number | null>(null);
  const w = WINDOWS.find((x) => x.key === win)!;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw) setWidth(Math.round(cw));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const byLength = indicator === 'wflh';
  const xRange: [number, number] = byLength ? (w.phase === 'length' ? [45, 110] : [65, 120]) : [w.from, w.to];

  const points = useMemo(() => {
    return records
      .map((r) => {
        const { age } = growthAgeMonths(child, r.date);
        const value = indicator === 'wfa' || indicator === 'wflh' ? r.weightKg : indicator === 'lhfa' ? r.heightCm : indicator === 'hcfa' ? r.headCircumferenceCm : r.weightKg && r.heightCm ? bmi(r.weightKg, r.heightCm) : 0;
        const x = byLength ? r.heightCm : age;
        return { record: r, age, x, value };
      })
      .filter((p) => p.value > 0 && p.x >= xRange[0] - 0.01 && p.x <= xRange[1] + 0.01 && p.age >= w.from - 0.01 && p.age <= w.to + 0.01)
      .sort((a, b) => a.x - b.x);
  }, [records, child, indicator, byLength, xRange, w.from, w.to]);

  const xs = useMemo(() => {
    const step = byLength ? 1 : (xRange[1] - xRange[0]) / 48;
    const out: number[] = [];
    for (let x = xRange[0]; x <= xRange[1] + 1e-9; x += step) out.push(Math.round(x * 100) / 100);
    return out;
  }, [xRange, byLength]);

  const levels = w.standard === 'WHO' ? [-3, -2, 0, 2, 3] : indicator === 'bfa' ? [5, 50, 85, 95] : [3, 50, 97];
  const lines = useMemo(() => levels.map((lv) => ({ level: lv, pts: referenceCurve(indicator, child.gender, w.standard, xs, lv, w.phase) })), [indicator, child.gender, w.standard, xs, w.phase, levels.join()]);
  const zones = useMemo(() => {
    const clampLo = w.standard === 'WHO' ? -3.6 : 1;
    const clampHi = w.standard === 'WHO' ? 3.6 : 99;
    return zoneBoundaries(indicator, w.standard).map((z) => ({
      tone: z.tone,
      lo: referenceCurve(indicator, child.gender, w.standard, xs, Math.max(z.from, clampLo), w.phase),
      hi: referenceCurve(indicator, child.gender, w.standard, xs, Math.min(z.to, clampHi), w.phase),
    }));
  }, [indicator, child.gender, w.standard, xs, w.phase]);

  if (!lines[0]?.pts.length) {
    return <p className="text-[15px] text-mute py-8 text-center">Grafik ini tidak tersedia untuk rentang usia yang dipilih.</p>;
  }

  const allY = [...zones.flatMap((z) => [...z.lo, ...z.hi].map((p) => p.y)), ...points.map((p) => p.value)];
  const rawMin = Math.min(...allY);
  const rawMax = Math.max(...allY);
  const pad = (rawMax - rawMin) * 0.04;
  const yMin = Math.max(0, rawMin - pad);
  const yMax = rawMax + pad;

  const innerW = Math.max(10, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;
  const sx = (x: number) => PAD.left + ((x - xRange[0]) / (xRange[1] - xRange[0])) * innerW;
  const sy = (y: number) => PAD.top + innerH - ((y - yMin) / (yMax - yMin)) * innerH;
  const P = (pts: { x: number; y: number }[]) => pts.map((p) => ({ x: sx(p.x), y: sy(p.y) }));

  const range = yMax - yMin;
  const yStep = range > 60 ? 10 : range > 30 ? 5 : range > 12 ? 2 : range > 6 ? 1 : 0.5;
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(Math.round(v * 10) / 10);
  const xStep = byLength ? 10 : xRange[1] - xRange[0] > 30 ? 6 : 3;
  const xTicks: number[] = [];
  for (let v = Math.ceil(xRange[0] / xStep) * xStep; v <= xRange[1]; v += xStep) xTicks.push(v);

  const childPath = points.length > 1 ? linePath(points.map((p) => ({ x: sx(p.x), y: sy(p.value) }))) : '';

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!points.length) return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    let best = 0;
    let bestDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(sx(p.x) - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setHover(best);
  };

  const active = hover !== null ? points[hover] : null;
  const activeResult = active ? assessRecord(child, active.record).results.find((r) => r.indicator === indicator) : null;
  const unit = indicatorInfo(indicator, w.from).unit;
  const levelLabel = (lv: number) => (w.standard === 'WHO' ? (lv > 0 ? `+${lv}` : `${lv}`) : `P${lv}`);

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
        aria-label={`Grafik ${indicatorInfo(indicator, w.from).label} ${child.name}, standar ${w.standard}`}
      >
        <defs>
          <clipPath id="plot-area">
            <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} />
          </clipPath>
        </defs>
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={PAD.left} x2={width - PAD.right} y1={sy(v)} y2={sy(v)} stroke="#F0E7DE" strokeWidth={1} />
            <text x={PAD.left - 7} y={sy(v) + 4} textAnchor="end" className="tabular" fontSize="11" fill="#8E837B">
              {formatNumber(v)}
            </text>
          </g>
        ))}
        {xTicks.map((v) => (
          <text key={`x${v}`} x={sx(v)} y={height - 10} textAnchor="middle" className="tabular" fontSize="11" fill="#8E837B">
            {v}
          </text>
        ))}

        <g clipPath="url(#plot-area)">
          {zones.map((z, i) => {
            const lo = P(z.lo);
            const hi = P(z.hi);
            if (!lo.length || !hi.length) return null;
            const d = `${linePath(hi)} ${lo
              .slice()
              .reverse()
              .map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`)
              .join(' ')} Z`;
            return <motion.path key={i} d={d} fill={ZONE_FILL[z.tone]} initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 0.4 }} />;
          })}
          {lines.map((l) => (
            <path
              key={l.level}
              d={linePath(P(l.pts))}
              fill="none"
              stroke={l.level === 0 || l.level === 50 ? '#8E837B' : '#C9BDB2'}
              strokeWidth={l.level === 0 || l.level === 50 ? 1.4 : 1}
              strokeDasharray={l.level === 0 || l.level === 50 ? '4 4' : undefined}
            />
          ))}
        </g>
        {lines.map((l) => {
          const last = l.pts[l.pts.length - 1];
          const y = sy(last.y);
          if (y < PAD.top - 2 || y > PAD.top + innerH + 2) return null;
          return (
            <text key={`lbl${l.level}`} x={width - PAD.right + 4} y={y + 3.5} fontSize="10" fill="#8E837B" className="tabular">
              {levelLabel(l.level)}
            </text>
          );
        })}

        {childPath && (
          <motion.path
            key={childPath}
            d={childPath}
            fill="none"
            stroke="#E5801F"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
          />
        )}
        {points.map((p, i) => (
          <motion.circle
            key={p.record.id}
            cx={sx(p.x)}
            cy={sy(p.value)}
            r={i === points.length - 1 || hover === i ? 6 : 4.5}
            fill="#E5801F"
            stroke="#FFFFFF"
            strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 500, damping: 22 }}
            style={{ transformOrigin: `${sx(p.x)}px ${sy(p.value)}px` }}
          />
        ))}
        {active && <line x1={sx(active.x)} x2={sx(active.x)} y1={PAD.top} y2={PAD.top + innerH} stroke="#231B16" strokeOpacity={0.25} strokeWidth={1} />}
      </svg>

      <div className="absolute left-1 top-0 text-[11px] text-mute -translate-y-0.5">{unit}</div>
      <div className="text-center text-[12px] text-mute -mt-1">{byLength ? (w.phase === 'length' ? 'Panjang badan (cm)' : 'Tinggi badan (cm)') : 'Usia (bulan)'}</div>

      <AnimatePresence>
        {active && (
          <motion.div
            key={active.record.id}
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute top-1 pointer-events-none bg-ink text-white rounded-[14px] px-3 py-2 text-[13px] shadow-float"
            style={{ left: Math.min(Math.max(sx(active.x) - 80, 4), width - 170), width: 166 }}
          >
            <div className="text-white/60">{formatDate(active.record.date)}</div>
            <div className="text-[16px] font-medium tabular">
              {formatNumber(active.value, indicator === 'wfa' || indicator === 'wflh' ? 2 : 1)} {unit}
            </div>
            {activeResult && (
              <div className="text-white/75 leading-snug">
                {activeResult.standard === 'WHO' ? `z ${formatNumber(activeResult.z, 1)}` : percentileLabel(activeResult.percentile)} · {activeResult.category.label}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GrowthLegend({ childName, standard }: { childName: string; standard: GrowthStandard }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13.5px] text-ink-2">
      <div className="flex items-center gap-2">
        <span className="w-5 h-3 rounded-[4px]" style={{ background: ZONE_FILL.success }} />
        Normal
      </div>
      <div className="flex items-center gap-2">
        <span className="w-5 h-3 rounded-[4px]" style={{ background: ZONE_FILL.warning }} />
        Waspada
      </div>
      <div className="flex items-center gap-2">
        <span className="w-5 h-3 rounded-[4px]" style={{ background: ZONE_FILL.danger }} />
        Perlu konsultasi
      </div>
      <div className="flex items-center gap-2">
        <span className="w-5 h-[3px] rounded-full bg-brand-orange-deep" />
        {childName}
      </div>
      <div className="col-span-2 text-[12.5px] text-mute">
        {standard === 'WHO' ? 'Garis menunjukkan z-score WHO (-3 sampai +3), garis putus-putus adalah median.' : 'Garis menunjukkan persentil CDC 2000, garis putus-putus adalah P50.'}
      </div>
    </div>
  );
}

/** Small helper for screens: z or percentile of one value without a record */
export function quickZ(child: Child, indicator: Indicator, age: number, value: number, height?: number) {
  const r = zScore(indicator, child.gender, age, value, height);
  return r ? { ...r, percentile: zToPercentile(r.z) } : null;
}
