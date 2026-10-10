import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Brain, CalendarCheck, ChevronDown, ClipboardCheck, Clock, FileDown, MessageCircle, Sparkles, X } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Sheet from '../components/ui/Sheet';
import ProgressRing from '../components/ui/ProgressRing';
import Confetti from '../components/ui/Confetti';
import { Button, Card, EmptyState, Notice, Skeleton, StatusPill } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import type { Child, Screening, ScreeningType } from '../types';
import { useStore } from '../lib/store';
import { useNav } from '../lib/nav';
import { useChildData } from '../lib/useChildData';
import { INSTRUMENTS, instrumentInfo, maxScore, questionsFor, resultLabel, resultTone, scoreScreening } from '../lib/screening';
import { ageInMonths, formatDate } from '../lib/format';
import { sendJSON } from '../api';
import { emitDataChanged } from '../lib/events';
import { escapeHtml, printDocument, printHeader } from '../lib/print';
import { haptic } from '../lib/haptics';
import { listContainer, listItem } from '../lib/motion';
import { cx } from '../lib/cx';

const ICONS: Record<ScreeningType, typeof Brain> = {
  kpsp: ClipboardCheck,
  mchat_r: Brain,
  speech_delay: MessageCircle,
};

const TONE_COLOR = { success: '#4F9A68', warning: '#E3A12B', danger: '#D9634A' } as const;

function bookingTarget(type: ScreeningType) {
  if (type === 'mchat_r') return { category: 'psikotes' as const, subCode: 'DIAG', label: 'Jadwalkan asesmen psikolog' };
  if (type === 'speech_delay') return { category: 'onsite' as const, subCode: 'TW', label: 'Jadwalkan terapi wicara' };
  return { category: 'psikolog' as const, subCode: 'KONSUL', label: 'Konsultasi dengan psikolog' };
}

/** Screening history list, reused in the child profile */
export function ScreeningHistory({ screenings, onOpen }: { screenings: Screening[]; onOpen: (s: Screening) => void }) {
  if (!screenings.length) {
    return <EmptyState icon={ClipboardCheck} title="Belum ada skrining" body="Hasil skrining akan tersimpan di sini sebagai laporan." className="py-6" />;
  }
  return (
    <motion.div className="space-y-2.5" variants={listContainer} initial="hidden" animate="show">
      {screenings.map((s) => {
        const Icon = ICONS[s.type] ?? ClipboardCheck;
        const tone = resultTone(s.result);
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
              <span className="block text-[17px] truncate">{instrumentInfo(s.type).title}</span>
              <span className="block text-[14px] text-mute mt-0.5">
                {formatDate(s.createdAt)} · usia {s.ageMonthAtTest} bln
              </span>
            </span>
            <StatusPill tone={tone}>{resultLabel(s.result)}</StatusPill>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

function printReport(child: Child, report: Screening) {
  const info = instrumentInfo(report.type);
  const tone = resultTone(report.result);
  const cls = tone === 'success' ? 'ok' : tone === 'warning' ? 'warn' : 'bad';
  const rows = questionsFor(report.type)
    .map((q, i) => {
      const ans = String(report.answers[q.id] ?? '-');
      return `<tr><td>${i + 1}</td><td>${escapeHtml(q.text)}</td><td>${escapeHtml(ans)}</td></tr>`;
    })
    .join('');
  printDocument(
    `Laporan ${info.title} ${child.name}`,
    `${printHeader('Laporan hasil skrining mandiri', 'FCS-' + report.id.slice(-6).toUpperCase())}
    <div class="meta"><div><span class="muted">Nama anak</span><b>${escapeHtml(child.name)}</b></div><div><span class="muted">Usia saat tes</span><b>${report.ageMonthAtTest} bulan</b></div><div><span class="muted">Tanggal</span><b>${formatDate(
      report.createdAt,
      'long',
    )}</b></div><div><span class="muted">Instrumen</span><b>${escapeHtml(info.title)}</b></div></div>
    <h2>Hasil</h2>
    <div class="result ${cls}"><b style="font-size:15px">${escapeHtml(resultLabel(report.result))}</b> (skor ${report.score} dari ${maxScore(report.type)})<br/>${escapeHtml(
      report.recommendation,
    )}</div>
    <h2>Rincian jawaban</h2>
    <table><thead><tr><th>No</th><th>Pertanyaan</th><th>Jawaban</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="note"><b>Penting:</b> laporan ini adalah hasil skrining edukatif mandiri berdasarkan pedoman KPSP Kemenkes dan M-CHAT-R. Laporan ini bukan diagnosis medis atau psikologis. Diagnosis hanya dapat ditegakkan oleh dokter spesialis anak, psikolog, atau terapis berlisensi melalui pemeriksaan langsung.</div>
    <div class="sign">Tim klinis FlourishCare</div>`,
  );
}

function Report({ child, report, onDone, celebrate }: { child: Child; report: Screening; onDone: () => void; celebrate: boolean }) {
  const nav = useNav();
  const [showAnswers, setShowAnswers] = useState(false);
  const tone = resultTone(report.result);
  const info = instrumentInfo(report.type);
  const total = maxScore(report.type);
  const target = bookingTarget(report.type);
  const ratio = report.type === 'mchat_r' ? 1 - report.score / total : report.score / total;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }} className="px-5 space-y-3">
      <Card className="p-5 text-center relative overflow-visible">
        <div className="relative inline-block">
          <ProgressRing value={ratio} size={120} stroke={10} color={TONE_COLOR[tone]} label={`Skor ${report.score} dari ${total}`}>
            <div>
              <div className="text-[30px] leading-none tabular">{report.score}</div>
              <div className="text-[13px] text-mute mt-1">dari {total}</div>
            </div>
          </ProgressRing>
          {celebrate && tone === 'success' && <Confetti />}
        </div>
        <div className="mt-4">
          <StatusPill tone={tone}>{resultLabel(report.result)}</StatusPill>
        </div>
        <div className="text-[22px] leading-tight mt-3">{info.title}</div>
        <div className="text-[14px] text-mute mt-1">
          {formatDate(report.createdAt, 'long')} · usia {report.ageMonthAtTest} bulan
        </div>
        <p className="text-[16px] text-ink-2 leading-relaxed mt-4 text-left">{report.recommendation}</p>
      </Card>

      {tone !== 'success' && (
        <Card className="p-5 bg-orange-gradient border-0 text-white shadow-orange">
          <div className="text-[19px] leading-snug">Ingin dicek langsung oleh ahli?</div>
          <p className="text-[15px] text-white/85 mt-1 leading-relaxed">
            Intervensi lebih awal memberi hasil terbaik. Tim FlourishCare siap membantu {child.name}.
          </p>
          <Button
            size="md"
            variant="secondary"
            icon={CalendarCheck}
            className="mt-4 !text-brand-orange-deep !border-white"
            onClick={() => nav.push({ name: 'booking', category: target.category, subCode: target.subCode })}
          >
            {target.label}
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
              <div className="divide-y divide-line border-t border-line">
                {questionsFor(report.type).map((q, i) => (
                  <div key={q.id} className="px-4 py-3 flex gap-3 text-[15px]">
                    <span className="text-mute tabular w-5 shrink-0">{i + 1}</span>
                    <span className="flex-1 text-ink-2 leading-snug">{q.text}</span>
                    <span className="shrink-0">{String(report.answers[q.id] ?? '-')}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Notice tone="neutral" title="Bukan diagnosis">
        Skrining ini bersifat edukatif untuk deteksi dini. Diagnosis hanya dapat ditegakkan oleh dokter anak, psikolog, atau terapis melalui pemeriksaan langsung.
      </Notice>
    </motion.div>
  );
}

function Quiz({ type, onCancel, onFinish }: { type: ScreeningType; onCancel: () => void; onFinish: (answers: Record<string, 'Ya' | 'Tidak'>) => void }) {
  const questions = questionsFor(type);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Record<string, 'Ya' | 'Tidak'>>({});
  const q = questions[index];

  const answer = (val: 'Ya' | 'Tidak') => {
    haptic('light');
    const next = { ...answers, [q.id]: val };
    setAnswers(next);
    if (index < questions.length - 1) {
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

  return (
    <div className="px-5 flex flex-col" style={{ minHeight: 'calc(100% - 20px)' }}>
      <div className="flex items-center justify-between text-[15px] text-mute">
        <span>
          Pertanyaan <span className="text-ink tabular">{index + 1}</span> dari {questions.length}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" /> {instrumentInfo(type).minutes} menit
        </span>
      </div>
      <div className="h-2 rounded-full bg-fill mt-3 overflow-hidden">
        <motion.div
          className="h-full bg-orange-gradient rounded-full"
          initial={false}
          animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>

      <div className="relative mt-6 min-h-[260px]">
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
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            <Card className="p-6 min-h-[240px] flex flex-col justify-center">
              <div className="text-[14px] text-brand-orange-deep mb-3">{instrumentInfo(type).title}</div>
              <h2 className="text-[24px] leading-[1.3] tracking-[-0.01em] font-normal">{q.text}</h2>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        {/* Equal visual weight for both answers so the design does not nudge the parent */}
        {(['Tidak', 'Ya'] as const).map((opt) => {
          const picked = answers[q.id] === opt;
          return (
            <Button
              key={opt}
              size="lg"
              variant="secondary"
              onClick={() => answer(opt)}
              aria-pressed={picked}
              className={cx(picked && '!border-brand-orange !bg-brand-orange-soft !text-brand-orange-deep')}
            >
              {opt}
            </Button>
          );
        })}
      </div>
      <button onClick={back} className="mt-4 self-center flex items-center gap-1.5 text-[15px] text-mute h-10 px-3">
        <ArrowLeft className="w-4 h-4" />
        {index === 0 ? 'Batalkan skrining' : 'Pertanyaan sebelumnya'}
      </button>
      <p className="text-[14px] text-mute leading-relaxed text-center mt-auto pt-4">
        Pilih <span className="text-ink">Ya</span> bila si Kecil melakukannya secara konsisten dalam 2 minggu terakhir.
      </p>
    </div>
  );
}

export default function ScreeningScreen({ onBack, start, reportId }: { onBack?: () => void; start?: ScreeningType; reportId?: string }) {
  const { activeChild } = useStore();
  const toast = useToast();
  const { data, loading } = useChildData(activeChild?.id);
  const [mode, setMode] = useState<'home' | 'quiz' | 'report'>(start ? 'quiz' : reportId ? 'report' : 'home');
  const [type, setType] = useState<ScreeningType>(start ?? 'kpsp');
  const [report, setReport] = useState<Screening | null>(null);
  const [fresh, setFresh] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (start) {
      setType(start);
      setMode('quiz');
    }
  }, [start]);

  // Open a specific saved report (from the child profile)
  useEffect(() => {
    if (!reportId || loading) return;
    const found = data.screenings.find((s) => s.id === reportId);
    if (found) {
      setReport(found);
      setType(found.type);
      setFresh(false);
      setMode('report');
    }
  }, [reportId, loading, data.screenings]);

  if (!activeChild) return null;
  const age = ageInMonths(activeChild.birthDate);

  const finish = async (answers: Record<string, 'Ya' | 'Tidak'>) => {
    const { score, result, recommendation } = scoreScreening(type, answers, activeChild.name);
    setSubmitting(true);
    try {
      const saved = await sendJSON<Screening>('/api/screenings', {
        childId: activeChild.id,
        type,
        ageMonthAtTest: age,
        answers,
        score,
        result,
        recommendation,
      });
      emitDataChanged('screenings');
      setReport(saved);
      setFresh(true);
      setMode('report');
      haptic(resultTone(result) === 'success' ? 'success' : 'warning');
    } catch {
      toast({ title: 'Gagal menyimpan hasil', body: 'Periksa koneksi lalu coba lagi.', tone: 'warning' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (mode === 'quiz') return setConfirmCancel(true);
    if (mode === 'report' && !start && !reportId) {
      setMode('home');
      setReport(null);
      return;
    }
    onBack?.();
  };

  const title = mode === 'quiz' ? instrumentInfo(type).title : mode === 'report' ? 'Hasil skrining' : 'Skrining Dini';

  return (
    <Screen
      title={title}
      subtitle={mode === 'home' ? `Deteksi dini untuk ${activeChild.name}, usia ${age} bulan` : undefined}
      largeTitle={mode === 'home'}
      onBack={onBack || mode !== 'home' ? handleBack : undefined}
      right={
        mode === 'quiz' ? (
          <button onClick={() => setConfirmCancel(true)} aria-label="Tutup" className="w-11 h-11 rounded-full bg-white border border-line shadow-card flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        ) : undefined
      }
    >
      {mode === 'home' && (
        <>
          <motion.div className="px-5 space-y-3" variants={listContainer} initial="hidden" animate="show">
            {INSTRUMENTS.map((inst) => {
              const Icon = ICONS[inst.type];
              const inRange = age >= inst.minMonth && age <= inst.maxMonth;
              return (
                <motion.div key={inst.type} variants={listItem}>
                  <Card className="p-5">
                    <div className="flex items-start gap-3.5">
                      <span className="w-12 h-12 rounded-full bg-brand-orange-soft text-brand-orange-deep flex items-center justify-center shrink-0">
                        <Icon className="w-[22px] h-[22px]" strokeWidth={1.8} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[19px] leading-tight">{inst.title}</div>
                        <div className="text-[14px] text-mute mt-0.5">
                          {inst.ageLabel} · {questionsFor(inst.type).length} pertanyaan
                        </div>
                      </div>
                    </div>
                    <p className="text-[15px] text-ink-2 leading-relaxed mt-3">{inst.description}</p>
                    {!inRange && (
                      <p className="text-[14px] text-[#9A6A12] bg-semantic-warning-soft rounded-[14px] px-3 py-2 mt-3">
                        Usia {activeChild.name} di luar rentang yang disarankan, hasil bisa kurang akurat.
                      </p>
                    )}
                    <Button
                      className="mt-4"
                      size="md"
                      variant={inRange ? 'primary' : 'secondary'}
                      icon={Sparkles}
                      onClick={() => {
                        setType(inst.type);
                        setMode('quiz');
                      }}
                    >
                      Mulai skrining
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="px-5 mt-7">
            <h2 className="text-[21px] font-normal mb-3">Riwayat</h2>
            {loading ? (
              <Skeleton className="h-20 rounded-[22px]" />
            ) : (
              <ScreeningHistory
                screenings={data.screenings}
                onOpen={(s) => {
                  setReport(s);
                  setType(s.type);
                  setFresh(false);
                  setMode('report');
                }}
              />
            )}
          </div>
          <p className="px-6 mt-5 text-[13px] text-mute leading-relaxed">
            Hasil skrining bukan diagnosis. Gunakan sebagai bahan diskusi bersama dokter, psikolog, atau terapis.
          </p>
        </>
      )}

      {mode === 'quiz' && (
        <div className="relative h-full">
          <Quiz key={type} type={type} onCancel={() => setConfirmCancel(true)} onFinish={finish} />
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

      {mode === 'report' && report && (
        <Report
          child={activeChild}
          report={report}
          celebrate={fresh}
          onDone={() => {
            if ((start || reportId) && onBack) return onBack();
            setMode('home');
            setReport(null);
          }}
        />
      )}

      <Sheet open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Batalkan skrining?" subtitle="Jawaban yang sudah diisi tidak akan disimpan.">
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
            Lanjutkan
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmCancel(false);
              if (start && onBack) return onBack();
              setMode('home');
            }}
          >
            Batalkan
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}
