import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Brain,
  CalendarCheck,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Ear,
  FileDown,
  Hand,
  HeartPulse,
  Lightbulb,
  ListChecks,
  MessageCircle,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import Screen from '../components/ui/Screen';
import Sheet from '../components/ui/Sheet';
import ProgressRing from '../components/ui/ProgressRing';
import Confetti from '../components/ui/Confetti';
import KpspPicture, { pictureItemText } from '../components/screening/KpspPicture';
import UnbornGate from '../components/child/UnbornGate';
import { Button, Card, EmptyState, Notice, Skeleton, StatusPill } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import type { Child, Screening, ScreeningType } from '../types';
import { useStore } from '../lib/store';
import { useNav } from '../lib/nav';
import { useChildData } from '../lib/useChildData';
import {
  answerLabel,
  formByKey,
  formFor,
  instrumentInfo,
  resultLabel,
  resultTone,
  scaleOptions,
  scoreForm,
  type AnswerValue,
  type ScreeningForm,
  type ScreeningItem,
} from '../lib/screening';
import { SPEECH_BANDS } from '../data/speech';
import { ageInMonths, formatDate } from '../lib/format';
import { sendJSON } from '../api';
import { emitDataChanged } from '../lib/events';
import { escapeHtml, printCta, printDocument, printHeader } from '../lib/print';
import { haptic } from '../lib/haptics';
import { listContainer, listItem } from '../lib/motion';
import { cx } from '../lib/cx';

export const SCREENING_ICONS: Record<ScreeningType, LucideIcon> = {
  kpsp: ClipboardCheck,
  tdd: Ear,
  speech_delay: MessageCircle,
  autism_signs: Brain,
  sensory: Hand,
  gpph: HeartPulse,
  mchat_r: Brain,
};

const TONE_COLOR = { success: '#4F9A68', warning: '#E3A12B', danger: '#D9634A' } as const;

function savedForm(report: Screening): ScreeningForm | null {
  const key = typeof report.answers?._form === 'string' ? (report.answers._form as string) : '';
  if (!key) return null;
  return formByKey(report.type, key, typeof report.answers?._age === 'number' ? (report.answers._age as number) : report.ageMonthAtTest);
}

function speechActivities(form: ScreeningForm | null) {
  if (!form || form.type !== 'speech_delay') return [];
  return SPEECH_BANDS.find((b) => form.key === `speech${b.fromMonths}_${b.toMonths}`)?.activities ?? [];
}

/** Screening history list, reused in the child profile and the Skrining tab */
export function ScreeningHistory({ screenings, onOpen, limit }: { screenings: Screening[]; onOpen: (s: Screening) => void; limit?: number }) {
  if (!screenings.length) {
    return <EmptyState icon={ClipboardCheck} title="Belum ada skrining" body="Hasil skrining akan tersimpan di sini lengkap dengan laporan PDF." className="py-6" />;
  }
  const list = limit ? screenings.slice(0, limit) : screenings;
  return (
    <motion.div className="space-y-2.5" variants={listContainer} initial="hidden" animate="show">
      {list.map((s) => {
        const Icon = SCREENING_ICONS[s.type] ?? ClipboardCheck;
        const tone = resultTone(s.result);
        const form = savedForm(s);
        return (
          <motion.button
            key={s.id}
            variants={listItem}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpen(s)}
            className="w-full text-left bg-white rounded-[22px] border border-line shadow-card p-4 flex items-center gap-3.5"
          >
            <span className="w-12 h-12 rounded-full bg-fill text-ink-2 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" strokeWidth={1.8} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[16.5px] truncate">{form?.title ?? instrumentInfo(s.type).title}</span>
              <span className="block text-[14px] text-mute mt-0.5">
                {formatDate(s.createdAt)} · usia {s.ageMonthAtTest} bln
              </span>
            </span>
            <StatusPill tone={tone}>{resultLabel(s.result, s.type)}</StatusPill>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export function printReport(child: Child, report: Screening) {
  const info = instrumentInfo(report.type);
  const form = savedForm(report);
  const tone = resultTone(report.result);
  const cls = tone === 'success' ? 'ok' : tone === 'warning' ? 'warn' : 'bad';
  const details = Array.isArray(report.answers?._details) ? (report.answers._details as unknown as string[]) : [];
  const rows = form
    ? form.items
        .map((q, i) => {
          const ans = answerLabel(q, report.answers[q.id] as AnswerValue);
          return `<tr><td>${i + 1}</td><td>${q.section ? `<span class="muted">${escapeHtml(q.section)}</span><br/>` : ''}${escapeHtml(pictureItemText(q.text, q.picture))}</td><td>${escapeHtml(ans)}</td></tr>`;
        })
        .join('')
    : '';
  const activities = speechActivities(form);
  printDocument(
    `Laporan ${form?.title ?? info.title} ${child.name}`,
    `${printHeader('Laporan skrining tumbuh kembang', 'FCS-' + report.id.slice(-6).toUpperCase())}
    <div class="meta"><div><span class="muted">Nama anak</span><b>${escapeHtml(child.name)}</b></div><div><span class="muted">Usia saat skrining</span><b>${report.ageMonthAtTest} bulan</b></div><div><span class="muted">Tanggal</span><b>${formatDate(
      report.createdAt,
      'long',
    )}</b></div><div><span class="muted">Instrumen</span><b>${escapeHtml(form?.label ?? info.title)}</b></div></div>
    <h2>Hasil</h2>
    <div class="result ${cls}"><b style="font-size:15px">${escapeHtml(resultLabel(report.result, report.type))}</b>${
      report.type === 'sensory' ? '' : ` (skor ${report.score})`
    }<br/>${escapeHtml(report.recommendation)}</div>
    ${details.length ? `<h2>Catatan</h2><ul>${details.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>` : ''}
    ${activities.length ? `<h2>Aktivitas di rumah</h2><ul>${activities.map((a) => `<li><b>${escapeHtml(a.title)}</b>: ${escapeHtml(a.text)}</li>`).join('')}</ul>` : ''}
    ${
      tone === 'success'
        ? printCta('Ingin memantau lebih dekat?', `Psikolog dan terapis FlourishCare siap menjawab pertanyaan seputar tumbuh kembang ${child.name}.`)
        : printCta('Langkah berikutnya: konsultasi dengan ahli', `Bawa laporan ini dan jadwalkan pemeriksaan bersama psikolog FlourishCare di Klinik Mitra Diani, Jakarta Timur.`)
    }
    ${rows ? `<h2>Rincian jawaban</h2><table><thead><tr><th>No</th><th>Pertanyaan</th><th>Jawaban</th></tr></thead><tbody>${rows}</tbody></table>` : ''}
    <div class="note"><b>Sumber:</b> ${escapeHtml(form?.source ?? info.basis)}.<br/><b>Penting:</b> laporan ini adalah hasil skrining mandiri oleh orang tua dan bukan diagnosis. Diagnosis hanya dapat ditegakkan oleh dokter anak, psikolog, atau terapis melalui pemeriksaan langsung. Bawa laporan ini saat konsultasi ke tenaga kesehatan mana pun.</div>
    <div class="note">Konsultasi dan terapi tumbuh kembang anak: <b>FlourishCare</b>, Klinik Mitra Diani, Jakarta Timur. Jadwalkan di book.flourishcare.id atau www.flourishcare.id</div>`,
  );
}

function Report({ child, report, onDone, celebrate }: { child: Child; report: Screening; onDone: () => void; celebrate: boolean }) {
  const nav = useNav();
  const [showAnswers, setShowAnswers] = useState(false);
  const tone = resultTone(report.result);
  const info = instrumentInfo(report.type);
  const form = savedForm(report);
  const details = Array.isArray(report.answers?._details) ? (report.answers._details as unknown as string[]) : [];
  const activities = speechActivities(form);
  const max = typeof report.answers?._max === 'number' ? (report.answers._max as number) : form?.items.length ?? 10;
  const ratio = report.type === 'gpph' || report.type === 'autism_signs' || report.type === 'sensory' || report.type === 'tdd' ? 1 - Math.min(1, report.score / Math.max(1, max)) : report.score / Math.max(1, max);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }} className="px-5 space-y-3">
      <Card className="p-5 text-center relative overflow-visible">
        <div className="relative inline-block">
          <ProgressRing value={ratio} size={112} stroke={10} color={TONE_COLOR[tone]} label={resultLabel(report.result, report.type)}>
            {report.type === 'sensory' || report.type === 'autism_signs' || report.type === 'tdd' ? (
              <div>
                <div className="text-[28px] leading-none tabular">{report.score}</div>
                <div className="text-[12px] text-mute mt-1">{report.type === 'sensory' ? 'area ditandai' : report.type === 'tdd' ? 'jawaban Tidak' : 'tanda'}</div>
              </div>
            ) : (
              <div>
                <div className="text-[28px] leading-none tabular">{report.score}</div>
                <div className="text-[12px] text-mute mt-1">dari {max}</div>
              </div>
            )}
          </ProgressRing>
          {celebrate && tone === 'success' && <Confetti />}
        </div>
        <div className="mt-4">
          <StatusPill tone={tone}>{resultLabel(report.result, report.type)}</StatusPill>
        </div>
        <div className="text-[22px] leading-tight mt-3">{form?.title ?? info.title}</div>
        <div className="text-[14px] text-mute mt-1">
          {formatDate(report.createdAt, 'long')} · usia {report.ageMonthAtTest} bulan
        </div>
        <p className="text-[16px] text-ink-2 leading-relaxed mt-4 text-left">{report.recommendation}</p>
        {details.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-left">
            {details.map((d) => (
              <li key={d} className="text-[15px] text-ink-2 leading-snug flex gap-2">
                <span className={cx('w-1.5 h-1.5 rounded-full mt-2 shrink-0', tone === 'danger' ? 'bg-semantic-danger' : 'bg-semantic-warning')} />
                {d}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {activities.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[16px]">
            <Lightbulb className="w-[18px] h-[18px] text-brand-orange-deep" strokeWidth={1.8} />
            Aktivitas bahasa di rumah
          </div>
          <div className="mt-2 space-y-2.5">
            {activities.map((a) => (
              <div key={a.id}>
                <div className="text-[15px] text-ink">{a.title}</div>
                <div className="text-[14.5px] text-ink-2 leading-relaxed">{a.text}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tone !== 'success' && (
        <Card className="p-5 bg-orange-gradient border-0 text-white shadow-orange">
          <div className="text-[19px] leading-snug">Ingin dicek langsung oleh ahli?</div>
          <p className="text-[15px] text-white/85 mt-1 leading-relaxed">Deteksi dan intervensi lebih awal memberi hasil terbaik. Tim FlourishCare siap membantu {child.name}.</p>
          <Button
            size="md"
            variant="secondary"
            icon={CalendarCheck}
            className="mt-4 !text-brand-orange-deep !border-white"
            onClick={() => nav.push({ name: 'booking', category: info.booking.category, subCode: info.booking.subCode })}
          >
            {info.booking.label}
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="secondary" icon={FileDown} onClick={() => printReport(child, report)}>
          Unduh PDF
        </Button>
        <Button variant="secondary" onClick={onDone}>
          Selesai
        </Button>
      </div>

      <Card className="overflow-hidden">
        <button onClick={() => setShowAnswers((v) => !v)} className="w-full flex items-center justify-between px-4 py-4 text-left">
          <span className="text-[17px]">Rincian jawaban</span>
          <motion.span animate={{ rotate: showAnswers ? 180 : 0 }}>
            <ChevronDown className="w-5 h-5 text-mute" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {showAnswers && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
              {form ? (
                <div className="divide-y divide-line border-t border-line">
                  {form.items.map((q, i) => (
                    <div key={q.id} className="px-4 py-3 flex gap-3 text-[15px]">
                      <span className="text-mute tabular w-5 shrink-0">{i + 1}</span>
                      <span className="flex-1 text-ink-2 leading-snug">{pictureItemText(q.text, q.picture)}</span>
                      <span className="shrink-0 text-right max-w-[34%]">{answerLabel(q, report.answers[q.id] as AnswerValue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 pb-4 text-[15px] text-mute">Rincian tidak tersedia untuk laporan versi lama.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Notice tone="neutral" title="Bukan diagnosis">
        Skrining ini membantu deteksi dini di rumah. Diagnosis hanya dapat ditegakkan oleh dokter anak, psikolog, atau terapis melalui pemeriksaan langsung.
      </Notice>
      <p className="text-[12.5px] text-mute leading-relaxed px-1">Sumber: {form?.source ?? info.basis}</p>
    </motion.div>
  );
}

/** Before starting: what it is, how long, what to prepare */
function Intro({ form, child, onStart }: { form: ScreeningForm; child: Child; onStart: () => void }) {
  const info = instrumentInfo(form.type);
  const Icon = SCREENING_ICONS[form.type];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-5 space-y-3">
      <Card className="p-5">
        <div className="flex items-start gap-3.5">
          <span className="w-12 h-12 rounded-full bg-brand-orange-soft text-brand-orange-deep flex items-center justify-center shrink-0">
            <Icon className="w-[22px] h-[22px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <div className="text-[20px] leading-tight">{form.title}</div>
            <div className="text-[14px] text-mute mt-0.5">
              {form.items.length} pertanyaan · sekitar {info.minutes} menit
            </div>
          </div>
        </div>
        <p className="text-[15.5px] text-ink-2 leading-relaxed mt-3">{info.description}</p>
        {form.intro && <p className="text-[15px] text-ink-2 leading-relaxed mt-2">{form.intro}</p>}
        <div className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-brand-orange-deep bg-brand-orange-tint rounded-full px-3 h-7">
          <Sparkles className="w-3.5 h-3.5" /> {info.basis}
        </div>
      </Card>
      {form.tools && form.tools.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[16px]">
            <ListChecks className="w-[18px] h-[18px] text-brand-orange-deep" strokeWidth={1.8} />
            Siapkan dulu
          </div>
          <ul className="mt-2 space-y-1">
            {form.tools.map((t) => (
              <li key={t} className="text-[15px] text-ink-2 flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
          {form.type === 'kpsp' && <p className="text-[13.5px] text-mute mt-2">Kubus bisa diganti balok mainan berukuran sekitar 2,5 cm.</p>}
        </Card>
      )}
      <Button block size="lg" icon={Sparkles} onClick={onStart}>
        Mulai untuk {child.name}
      </Button>
    </motion.div>
  );
}

function Quiz({ form, onCancel, onFinish }: { form: ScreeningForm; onCancel: () => void; onFinish: (answers: Record<string, AnswerValue>) => void }) {
  const items = form.items;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const q: ScreeningItem = items[index];
  const options = scaleOptions(q.scale);

  const answer = (val: AnswerValue) => {
    haptic('light');
    const next = { ...answers, [q.id]: val };
    setAnswers(next);
    if (index < items.length - 1) {
      setDir(1);
      setIndex(index + 1);
    } else {
      onFinish(next);
    }
  };

  const back = () => {
    if (index === 0) return onCancel();
    setDir(-1);
    setIndex(index - 1);
  };

  const tryWithChild = q.mode === 'perintah' || q.mode === 'amati' || q.mode === 'periksa';

  return (
    <div className="px-5 flex flex-col" style={{ minHeight: 'calc(100% - 20px)' }}>
      <div className="flex items-center justify-between text-[15px] text-mute">
        <span>
          Pertanyaan <span className="text-ink tabular">{index + 1}</span> dari {items.length}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" /> {instrumentInfo(form.type).minutes} menit
        </span>
      </div>
      <div className="h-2 rounded-full bg-fill mt-3 overflow-hidden">
        <motion.div className="h-full bg-orange-gradient rounded-full" initial={false} animate={{ width: `${((index + 1) / items.length) * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 30 }} />
      </div>

      <div className="relative mt-5">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={q.id}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -60, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <Card className="p-5">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="text-[13.5px] text-brand-orange-deep truncate">{q.section ?? form.title}</div>
                {tryWithChild && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[12.5px] text-ink-2 bg-fill rounded-full px-2.5 h-6">
                    <Hand className="w-3.5 h-3.5" /> Coba bersama si Kecil
                  </span>
                )}
              </div>
              <h2 className={cx('leading-[1.35] tracking-[-0.005em] font-normal', q.text.length > 140 ? 'text-[18px]' : 'text-[21px]')}>{pictureItemText(q.text, q.picture)}</h2>
              {q.picture && (
                <div className="mt-4">
                  <KpspPicture picture={q.picture} />
                </div>
              )}
              {q.note && <p className="text-[13.5px] text-mute mt-3 leading-relaxed">{q.note}</p>}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={cx('mt-4 grid gap-2.5', options.length === 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-1')}>
        {/* Equal visual weight for every answer so the design does not nudge the parent */}
        {options.map((opt) => {
          const picked = answers[q.id] === opt.value;
          return (
            <Button
              key={String(opt.value)}
              size={options.length > 3 ? 'md' : 'lg'}
              variant="secondary"
              onClick={() => answer(opt.value)}
              aria-pressed={picked}
              className={cx(options.length > 3 && '!justify-start !h-auto py-3 text-left !whitespace-normal !rounded-[20px]', options.length === 3 && '!px-2 !text-[15px]', picked && '!border-brand-orange !bg-brand-orange-soft !text-brand-orange-deep')}
            >
              {options.length > 3 ? (
                <span className="block">
                  <span className="block">{opt.label}</span>
                  {opt.hint && <span className="block text-[12.5px] text-mute font-normal leading-snug mt-0.5">{opt.hint.replace(/^Nilai \d+:\s*/, '')}</span>}
                </span>
              ) : (
                opt.label
              )}
            </Button>
          );
        })}
      </div>
      <button onClick={back} className="mt-3 self-center flex items-center gap-1.5 text-[15px] text-mute h-10 px-3">
        <ArrowLeft className="w-4 h-4" />
        {index === 0 ? 'Batalkan skrining' : 'Pertanyaan sebelumnya'}
      </button>
      <p className="text-[13.5px] text-mute leading-relaxed text-center mt-auto pt-3 pb-2">
        {q.scale === 'freq3' || q.scale === 'gpph4' ? 'Pilih yang paling sesuai dengan keseharian si Kecil.' : 'Jawab sesuai yang benar-benar terjadi, bukan yang diharapkan.'}
      </p>
    </div>
  );
}

export default function ScreeningScreen({ onBack, start, reportId }: { onBack?: () => void; start?: ScreeningType; reportId?: string }) {
  const { activeChild } = useStore();
  const nav = useNav();
  const toast = useToast();
  const { data, loading } = useChildData(activeChild?.id, !activeChild?.isUnborn);
  const [mode, setMode] = useState<'intro' | 'quiz' | 'report'>(reportId ? 'report' : 'intro');
  const [report, setReport] = useState<Screening | null>(null);
  const [fresh, setFresh] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const availability = useMemo(() => (activeChild && start ? formFor(start, activeChild) : { form: null }), [activeChild, start]);
  const form = availability.form;

  // Open a saved report
  useEffect(() => {
    if (!reportId || loading) return;
    const found = data.screenings.find((s) => s.id === reportId);
    if (found) {
      setReport(found);
      setFresh(false);
      setMode('report');
    }
  }, [reportId, loading, data.screenings]);

  if (!activeChild) return null;
  if (activeChild.isUnborn) {
    return (
      <Screen title="Skrining" onBack={onBack}>
        <UnbornGate name={activeChild.name} />
      </Screen>
    );
  }
  const age = ageInMonths(activeChild.birthDate);

  const finish = async (answers: Record<string, AnswerValue>) => {
    if (!form) return;
    const scored = scoreForm(form, answers, activeChild.name);
    setSubmitting(true);
    try {
      const saved = await sendJSON<Screening>('/api/screenings', {
        childId: activeChild.id,
        type: form.type,
        ageMonthAtTest: age,
        answers: { ...answers, _form: form.key, _age: age, _max: scored.max, _details: scored.details ?? [] },
        score: scored.score,
        result: scored.result,
        recommendation: scored.recommendation,
      });
      emitDataChanged('screenings');
      setReport(saved);
      setFresh(true);
      setMode('report');
      haptic(resultTone(scored.result) === 'success' ? 'success' : 'warning');
    } catch (err: any) {
      toast({ title: 'Gagal menyimpan hasil', body: err?.message || 'Periksa koneksi lalu coba lagi.', tone: 'warning' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (mode === 'quiz') return setConfirmCancel(true);
    onBack?.();
  };

  const title = mode === 'report' ? 'Hasil skrining' : form?.title ?? instrumentInfo(start ?? 'kpsp').title;

  return (
    <Screen
      title={title}
      largeTitle={mode === 'intro'}
      onBack={handleBack}
      right={
        mode === 'quiz' ? (
          <button onClick={() => setConfirmCancel(true)} aria-label="Tutup" className="w-11 h-11 rounded-full bg-white border border-line shadow-card flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        ) : undefined
      }
    >
      {mode === 'intro' && !reportId && (
        form ? (
          <Intro form={form} child={activeChild} onStart={() => setMode('quiz')} />
        ) : (
          <div className="px-5">
            <EmptyState
              icon={ClipboardCheck}
              title="Belum bisa dilakukan di aplikasi"
              body={availability.reason ?? 'Skrining ini belum tersedia untuk usia si Kecil.'}
              action={
                <Button variant="soft" icon={CalendarCheck} onClick={() => nav.push({ name: 'booking', category: 'psikolog', subCode: 'KONSUL' })}>
                  Konsultasi dengan psikolog
                </Button>
              }
            />
          </div>
        )
      )}

      {mode === 'quiz' && form && (
        <div className="relative h-full">
          <Quiz key={form.key} form={form} onCancel={() => setConfirmCancel(true)} onFinish={finish} />
          {submitting && (
            <div className="absolute inset-0 flex items-center justify-center bg-canvas/70 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-[16px] text-ink-2">
                <span className="w-5 h-5 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
                Menghitung hasil
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'report' && !report && (
        <div className="px-5 space-y-3">
          <Skeleton className="h-72 rounded-[22px]" />
          <Skeleton className="h-14 rounded-full" />
        </div>
      )}

      {mode === 'report' && report && <Report child={activeChild} report={report} celebrate={fresh} onDone={() => onBack?.()} />}

      <Sheet open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Batalkan skrining?" subtitle="Jawaban yang sudah diisi tidak akan disimpan.">
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
            Lanjutkan
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmCancel(false);
              onBack?.();
            }}
          >
            Batalkan
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}
