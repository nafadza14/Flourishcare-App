import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCw } from 'lucide-react';
import type { KpspPicture as PictureKey } from '../../data/kpsp';

/**
 * Simple illustrations for KPSP items that refer to a picture ("seperti pada gambar").
 * Drawn for this app to show the posture or example; they are not copies of the printed sheet.
 */

const SKIN = '#F7C39E';
const SKIN_DARK = '#E9A57E';
const BODY = '#FBE2C8';
const LINE = '#8A5434';
const GROUND = '#E7DCD1';

function Panel({ label, tone, children }: { label?: string; tone?: 'ok' | 'no'; children: React.ReactNode }) {
  return (
    <figure className="flex-1 min-w-0 bg-white rounded-[18px] border border-line p-2">
      <div className="aspect-[2/1] w-full">{children}</div>
      {label && (
        <figcaption className={`text-center text-[13px] mt-1 ${tone === 'no' ? 'text-semantic-danger' : tone === 'ok' ? 'text-semantic-success' : 'text-mute'}`}>{label}</figcaption>
      )}
    </figure>
  );
}

/** Baby lying on the tummy with the head lifted to an angle (degrees from the floor) */
function ProneBaby({ angle, chest }: { angle: number; chest?: boolean }) {
  const rad = (angle * Math.PI) / 180;
  const pivot = chest ? { x: 152, y: 66 } : { x: 150, y: 80 };
  const head = { x: pivot.x + Math.cos(rad) * 20, y: pivot.y - Math.sin(rad) * 20 };
  return (
    <svg viewBox="0 0 240 120" className="w-full h-full" aria-hidden>
      <line x1="16" y1="102" x2="224" y2="102" stroke={GROUND} strokeWidth="3" strokeLinecap="round" />
      {/* legs */}
      <path d="M62 92 Q40 92 28 98" stroke={SKIN_DARK} strokeWidth="9" strokeLinecap="round" fill="none" />
      {chest ? (
        <>
          <path d="M66 94 Q110 92 150 70" stroke={BODY} strokeWidth="30" strokeLinecap="round" fill="none" />
          <line x1="150" y1="74" x2="154" y2="100" stroke={SKIN} strokeWidth="9" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="104" cy="88" rx="50" ry="14" fill={BODY} />
          <path d="M140 92 L160 99" stroke={SKIN} strokeWidth="9" strokeLinecap="round" />
        </>
      )}
      <line x1={pivot.x - 6} y1={pivot.y + 4} x2={pivot.x} y2={pivot.y} stroke={SKIN_DARK} strokeWidth="10" strokeLinecap="round" />
      <circle cx={head.x} cy={head.y} r="17" fill={SKIN} />
      <circle cx={head.x + Math.cos(rad) * 6 + 3} cy={head.y - Math.sin(rad) * 2 - 2} r="2" fill={LINE} />
      {!chest && angle > 0 && (
        <path d={`M${pivot.x + 30},${pivot.y} A30,30 0 0,0 ${pivot.x + Math.cos(rad) * 30},${pivot.y - Math.sin(rad) * 30}`} stroke="#F29935" strokeWidth="2" fill="none" strokeDasharray="3 3" />
      )}
    </svg>
  );
}

function PullToSit({ good }: { good: boolean }) {
  return (
    <svg viewBox="0 0 240 120" className="w-full h-full" aria-hidden>
      <line x1="16" y1="104" x2="224" y2="104" stroke={GROUND} strokeWidth="3" strokeLinecap="round" />
      <path d="M70 100 L120 70" stroke={BODY} strokeWidth="28" strokeLinecap="round" />
      <path d="M62 102 L30 100" stroke={SKIN_DARK} strokeWidth="9" strokeLinecap="round" />
      {/* arms held by the adult */}
      <path d="M118 66 L160 40" stroke={SKIN} strokeWidth="8" strokeLinecap="round" />
      <circle cx="166" cy="36" r="9" fill="#E8D5C4" />
      {good ? <circle cx="134" cy="56" r="17" fill={SKIN} /> : <circle cx="128" cy="84" r="17" fill={SKIN} />}
    </svg>
  );
}

function Raking() {
  return (
    <svg viewBox="0 0 240 120" className="w-full h-full" aria-hidden>
      <rect x="10" y="88" width="220" height="10" rx="5" fill={GROUND} />
      {[70, 84, 96, 110].map((x, i) => (
        <ellipse key={x} cx={x} cy={84 - (i % 2) * 2} rx="5" ry="4" fill="#7A4A2C" />
      ))}
      <path d="M190 40 Q150 40 140 62 L126 82" stroke={SKIN} strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M130 80 Q112 84 100 80 M134 74 Q114 74 104 70" stroke={SKIN_DARK} strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M96 64 L84 68" stroke="#F29935" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  );
}

function Lines({ crossing }: { crossing: boolean }) {
  return (
    <svg viewBox="0 0 240 120" className="w-full h-full" aria-hidden>
      <line x1="100" y1="20" x2="100" y2="100" stroke="#231B16" strokeWidth="4" strokeLinecap="round" />
      {crossing ? <line x1="80" y1="30" x2="140" y2="96" stroke="#E5801F" strokeWidth="4" strokeLinecap="round" /> : <line x1="138" y1="22" x2="138" y2="98" stroke="#E5801F" strokeWidth="4" strokeLinecap="round" />}
    </svg>
  );
}

function LongerLine() {
  const [turned, setTurned] = useState(false);
  return (
    <div>
      <motion.div animate={{ rotate: turned ? 180 : 0 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }} className="bg-white rounded-[18px] border border-line p-4">
        <svg viewBox="0 0 240 90" className="w-full" aria-label="Dua garis dengan panjang berbeda">
          <line x1="30" y1="28" x2="214" y2="28" stroke="#231B16" strokeWidth="5" strokeLinecap="round" />
          <line x1="30" y1="64" x2="150" y2="64" stroke="#231B16" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </motion.div>
      <button onClick={() => setTurned((v) => !v)} className="mt-2 mx-auto flex items-center gap-1.5 text-[14px] text-brand-orange-deep h-9 px-3">
        <RotateCw className="w-4 h-4" /> Putar gambar
      </button>
    </div>
  );
}

const PICTURE_SET = [
  { emoji: '🐱', name: 'Kucing' },
  { emoji: '🐦', name: 'Burung' },
  { emoji: '🐴', name: 'Kuda' },
  { emoji: '🐶', name: 'Anjing' },
  { emoji: '🧑', name: 'Orang' },
];

function Pictures({ showNames }: { showNames: boolean }) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {PICTURE_SET.map((p) => (
          <div key={p.name} className="aspect-square bg-white rounded-[16px] border border-line flex items-center justify-center text-[34px]" role="img" aria-label={p.name}>
            {p.emoji}
          </div>
        ))}
      </div>
      {showNames && <p className="text-[13px] text-mute mt-2 text-center">Gambar: {PICTURE_SET.map((p) => p.name.toLowerCase()).join(', ')}</p>}
    </div>
  );
}

function Shape({ kind }: { kind: 'plus' | 'square' }) {
  return (
    <div className="bg-white rounded-[18px] border border-line p-4 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-24 h-24" aria-label={kind === 'plus' ? 'Contoh tanda tambah' : 'Contoh kotak'}>
        {kind === 'plus' ? (
          <path d="M50 14 V86 M14 50 H86" stroke="#231B16" strokeWidth="6" strokeLinecap="round" />
        ) : (
          <rect x="18" y="18" width="64" height="64" fill="none" stroke="#231B16" strokeWidth="6" strokeLinejoin="round" />
        )}
      </svg>
    </div>
  );
}

export default function KpspPicture({ picture }: { picture: PictureKey }) {
  switch (picture) {
    case 'prone_head':
      return <Panel label="Kepala terangkat"><ProneBaby angle={22} /></Panel>;
    case 'prone_45':
      return <Panel label="Kepala membentuk sudut 45°"><ProneBaby angle={45} /></Panel>;
    case 'prone_90':
      return <Panel label="Kepala tegak"><ProneBaby angle={82} /></Panel>;
    case 'prone_chest':
      return <Panel label="Dada terangkat, bertumpu pada lengan"><ProneBaby angle={60} chest /></Panel>;
    case 'pull_to_sit':
      return (
        <div className="flex gap-2">
          <Panel label="Ya: leher kaku, kepala ikut" tone="ok"><PullToSit good /></Panel>
          <Panel label="Tidak: kepala jatuh ke belakang" tone="no"><PullToSit good={false} /></Panel>
        </div>
      );
    case 'raking':
      return <Panel label="Memungut dengan gerakan menggerapai"><Raking /></Panel>;
    case 'line_copy':
      return (
        <div className="flex gap-2">
          <Panel label="Jawab Ya" tone="ok"><Lines crossing={false} /></Panel>
          <Panel label="Jawab Tidak" tone="no"><Lines crossing /></Panel>
        </div>
      );
    case 'pictures':
      return <Pictures showNames={false} />;
    case 'pictures_actions':
      return <Pictures showNames={false} />;
    case 'longer_line':
      return <LongerLine />;
    case 'draw_plus':
      return <Shape kind="plus" />;
    case 'draw_square':
      return <Shape kind="square" />;
    default:
      return null;
  }
}

/** Text of picture items reads "...seperti ini: Jawab 'Tidak' bila...": keep the instruction, the picture shows the examples */
export function pictureItemText(text: string, picture?: PictureKey): string {
  if (picture === 'line_copy') return text.replace(/\s*Jawab\s+[‘'"]Ya[’'"][\s\S]*$/i, '').trim() + ' Lihat contoh jawaban di bawah.';
  return text;
}
