import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, EllipsisVertical, MessageCircleHeart, Plus, Send, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import Screen from '../components/ui/Screen';
import Sheet from '../components/ui/Sheet';
import Segmented from '../components/ui/Segmented';
import Switch from '../components/ui/Switch';
import { TextArea } from '../components/ui/Field';
import { Button, Card, Chip, EmptyState, IconButton, Skeleton } from '../components/ui/primitives';
import { ListGroup, ListRow } from '../components/ui/ListGroup';
import { PhotoAvatar } from '../components/ui/Avatar';
import { useToast } from '../components/ui/Toast';
import type { Question } from '../types';
import { useStore } from '../lib/store';
import { getJSON, sendJSON } from '../api';
import { emitDataChanged } from '../lib/events';
import { stripEmDash, timeAgo } from '../lib/format';
import { CLINICAL_EXPERTS } from '../data/seedData';
import { listContainer, listItem } from '../lib/motion';

const CATEGORIES = [
  { key: 'bicara', label: 'Bicara' },
  { key: 'nutrisi', label: 'Makan & nutrisi' },
  { key: 'sensori', label: 'Sensori & emosi' },
  { key: 'motorik', label: 'Motorik' },
  { key: 'lainnya', label: 'Lainnya' },
];

const MONTHLY_QUOTA = 3;

function categoryLabel(key?: string) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? 'Umum';
}

function expertFor(name?: string) {
  if (!name) return undefined;
  return CLINICAL_EXPERTS.find((e) => name.startsWith(e.name.split(',')[0]));
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <span className="w-8 h-8 rounded-full bg-brand-orange-soft flex items-center justify-center shrink-0">
        <ShieldCheck className="w-4 h-4 text-brand-orange-deep" />
      </span>
      <div className="bg-white border border-line rounded-[20px] rounded-bl-[6px] px-4 py-3 shadow-card">
        <div className="flex items-center gap-1" aria-label="Ahli sedang menyiapkan jawaban">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-faint"
              animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <div className="text-[13px] text-mute mt-1.5">Ahli sedang meninjau pertanyaan</div>
      </div>
    </div>
  );
}

function Thread({ q }: { q: Question }) {
  const expert = expertFor(q.answeredBy);
  return (
    <motion.div variants={listItem} className="space-y-2.5">
      <div className="flex justify-end">
        <div className="max-w-[86%] bg-brand-orange-soft rounded-[20px] rounded-br-[6px] px-4 py-3">
          <div className="text-[12px] text-brand-orange-deep mb-1">{categoryLabel(q.category)}</div>
          <p className="text-[16px] leading-relaxed text-ink">{q.questionText}</p>
          <div className="text-[12px] text-mute text-right mt-1.5">{timeAgo(q.createdAt)}</div>
        </div>
      </div>
      {q.status === 'pending' || !q.answerText ? (
        <TypingBubble />
      ) : (
        <div className="flex items-end gap-2">
          <PhotoAvatar src={expert?.photoUrl} name={q.answeredBy ?? 'Ahli'} size={32} />
          <div className="max-w-[86%] bg-white border border-line rounded-[20px] rounded-bl-[6px] px-4 py-3 shadow-card">
            <div className="text-[13px] text-mute flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
              {q.answeredBy ?? 'Tim ahli FlourishCare'}
            </div>
            <p className="text-[16px] leading-relaxed text-ink-2 mt-1.5 whitespace-pre-line">{stripEmDash(q.answerText)}</p>
            {q.answeredAt && <div className="text-[12px] text-mute mt-1.5">{timeAgo(q.answeredAt)}</div>}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function FaqItem({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={listItem}>
      <Card className="overflow-hidden">
        <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full text-left p-4 flex gap-3">
          <span className="flex-1 min-w-0">
            <span className="block text-[12px] text-brand-orange-deep">{categoryLabel(q.category)}</span>
            <span className="block text-[16px] leading-snug mt-1">{q.questionText}</span>
          </span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 mt-5">
            <ChevronDown className="w-5 h-5 text-mute" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }} className="overflow-hidden">
              <div className="px-4 pb-4">
                <div className="rounded-[16px] bg-fill p-3.5 text-[15px] text-ink-2 leading-relaxed whitespace-pre-line">{stripEmDash(q.answerText ?? '')}</div>
                <div className="text-[13px] text-mute mt-2 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
                  Dijawab {q.answeredBy ?? 'tim ahli FlourishCare'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function ComposeSheet({ open, onClose, remaining, childId, childName }: { open: boolean; onClose: () => void; remaining: number; childId: string; childName: string }) {
  const toast = useToast();
  const [category, setCategory] = useState('bicara');
  const [text, setText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setError('');
    }
  }, [open]);

  const send = async () => {
    if (text.trim().length < 15) {
      setError('Tulis minimal 15 karakter agar ahli bisa memahami kondisinya.');
      return;
    }
    if (remaining <= 0) {
      setError('Kuota gratis bulan ini sudah habis. Konsultasi langsung di klinik tetap bisa dipesan kapan saja.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await sendJSON('/api/questions', { childId, questionText: text.trim(), category, isPublic });
      emitDataChanged('questions');
      toast({ title: 'Pertanyaan terkirim', body: 'Ahli FlourishCare akan menjawab dalam 24 jam.' });
      setText('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tanya ahli"
      subtitle={`Ceritakan kondisi ${childName} sedetail mungkin.`}
      footer={
        <Button block size="lg" icon={Send} loading={sending} onClick={send} disabled={remaining <= 0}>
          Kirim pertanyaan
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        <div>
          <div className="text-[14px] text-mute mb-2 pl-1">Topik</div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.key} selected={category === c.key} onClick={() => setCategory(c.key)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </div>
        <TextArea
          label="Pertanyaan"
          rows={5}
          maxLength={1000}
          placeholder={`Contoh: ${childName} usia 21 bulan baru bisa 3 kata. Apakah perlu terapi wicara?`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError('');
          }}
          hint={`${text.trim().length}/1000 karakter, minimal 15`}
          error={error}
        />
        <div className="flex items-center gap-3 bg-white rounded-[18px] border border-line p-4">
          <div className="flex-1">
            <div className="text-[16px]">Bagikan ke FAQ publik</div>
            <div className="text-[14px] text-mute leading-snug">Ditampilkan tanpa nama, agar orang tua lain ikut terbantu.</div>
          </div>
          <Switch checked={isPublic} onChange={setIsPublic} label="Bagikan ke FAQ publik" />
        </div>
      </div>
    </Sheet>
  );
}

function ExpertAnswerSheet({ question, onClose }: { question: Question | null; onClose: () => void }) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => setText(''), [question?.id]);

  const draft = async () => {
    if (!question) return;
    setDrafting(true);
    try {
      const res = await sendJSON<{ draftText: string }>('/api/questions/answer-ai', { questionId: question.id });
      setText(stripEmDash(res.draftText));
    } catch {
      toast({ title: 'Draf AI belum tersedia', body: 'Silakan tulis jawaban secara manual.', tone: 'warning' });
    } finally {
      setDrafting(false);
    }
  };

  const send = async () => {
    if (!question || text.trim().length < 10) return;
    setSending(true);
    try {
      await sendJSON(`/api/questions/${question.id}/answer`, { expertId: 'exp_ira', answerText: stripEmDash(text.trim()) });
      emitDataChanged('questions');
      toast({ title: 'Jawaban terkirim' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Gagal mengirim', body: err.message, tone: 'warning' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet
      open={!!question}
      onClose={onClose}
      title="Jawab pertanyaan"
      size="large"
      footer={
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" icon={Wand2} loading={drafting} onClick={draft}>
            Draf AI
          </Button>
          <Button icon={Send} loading={sending} disabled={text.trim().length < 10} onClick={send}>
            Kirim
          </Button>
        </div>
      }
    >
      {question && (
        <div className="space-y-4 pt-1">
          <div className="rounded-[18px] bg-fill p-4 text-[16px] leading-relaxed text-ink-2">{question.questionText}</div>
          <TextArea label="Jawaban ahli" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis jawaban yang hangat dan jelas..." />
        </div>
      )}
    </Sheet>
  );
}

export default function TanyaAhliScreen({ onBack }: { onBack?: () => void }) {
  const { activeChild, profile } = useStore();
  const toast = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'mine' | 'faq'>('mine');
  const [composeOpen, setComposeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const [answering, setAnswering] = useState<Question | null>(null);
  const pendingIds = useRef<Set<string>>(new Set());

  const load = async () => {
    const list = await getJSON<Question[]>('/api/questions', []);
    // Toast when a pending question of mine just got answered
    list.forEach((q) => {
      if (pendingIds.current.has(q.id) && q.status !== 'pending') {
        toast({ title: 'Pertanyaan Anda terjawab', body: `Dijawab oleh ${q.answeredBy ?? 'tim ahli'}.` });
        emitDataChanged('notifications');
      }
    });
    pendingIds.current = new Set(list.filter((q) => q.parentId === profile?.id && q.status === 'pending').map((q) => q.id));
    setQuestions(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // Reload after a question is sent or answered elsewhere
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail === 'questions') load();
    };
    window.addEventListener('fc:data-changed', handler);
    return () => window.removeEventListener('fc:data-changed', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const mine = useMemo(() => questions.filter((q) => q.parentId === profile?.id), [questions, profile?.id]);
  const faq = useMemo(() => questions.filter((q) => q.isPublic && q.status !== 'pending' && q.answerText), [questions]);
  const queue = useMemo(() => questions.filter((q) => q.status === 'pending'), [questions]);
  const hasPending = mine.some((q) => q.status === 'pending');

  // Poll while waiting for an answer
  useEffect(() => {
    if (!hasPending) return;
    const id = window.setInterval(load, 3000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPending]);

  if (!activeChild) return null;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const used = mine.filter((q) => new Date(q.createdAt) >= monthStart).length;
  const remaining = Math.max(0, MONTHLY_QUOTA - used);

  return (
    <Screen
      title="Tanya Ahli"
      subtitle="Dijawab psikolog dan terapis FlourishCare"
      onBack={onBack}
      right={<IconButton icon={EllipsisVertical} label="Lainnya" onClick={() => setMenuOpen(true)} />}
      titleAccessory={
        !expertMode && (
          <Button size="sm" icon={Plus} onClick={() => setComposeOpen(true)}>
            Tanya
          </Button>
        )
      }
    >
      {expertMode ? (
        <div className="px-5 space-y-3">
          <Card className="p-4 flex items-center gap-3 bg-ink border-0 text-white">
            <ShieldCheck className="w-6 h-6 text-brand-yellow" />
            <div className="flex-1">
              <div className="text-[16px]">Mode ahli (demo)</div>
              <div className="text-[14px] text-white/70">{queue.length} pertanyaan menunggu jawaban</div>
            </div>
          </Card>
          {queue.length === 0 ? (
            <EmptyState icon={Sparkles} title="Antrean kosong" body="Semua pertanyaan sudah terjawab." />
          ) : (
            queue.map((q) => (
              <Card key={q.id} className="p-4">
                <div className="text-[12px] text-brand-orange-deep">{categoryLabel(q.category)} · {timeAgo(q.createdAt)}</div>
                <p className="text-[16px] leading-relaxed mt-1">{q.questionText}</p>
                <Button size="sm" className="mt-3" onClick={() => setAnswering(q)}>
                  Jawab
                </Button>
              </Card>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="px-5">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {CLINICAL_EXPERTS.map((e) => (
                    <PhotoAvatar key={e.id} src={e.photoUrl} name={e.name} size={36} className="ring-2 ring-white" />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] leading-tight">
                    {remaining} dari {MONTHLY_QUOTA} pertanyaan gratis
                  </div>
                  <div className="text-[14px] text-mute">Tersisa bulan ini</div>
                </div>
              </div>
              <div className="flex gap-1.5 mt-3.5" aria-hidden>
                {Array.from({ length: MONTHLY_QUOTA }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={false}
                    animate={{ backgroundColor: i < remaining ? '#F29935' : '#F0E7DE' }}
                    className="h-1.5 flex-1 rounded-full"
                  />
                ))}
              </div>
            </Card>
          </div>

          <div className="px-5 mt-4">
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                { value: 'mine', label: `Pertanyaanku (${mine.length})` },
                { value: 'faq', label: `FAQ (${faq.length})` },
              ]}
            />
          </div>

          <div className="px-5 mt-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 rounded-[22px]" />
                <Skeleton className="h-32 rounded-[22px]" />
              </div>
            ) : tab === 'mine' ? (
              mine.length === 0 ? (
                <EmptyState
                  icon={MessageCircleHeart}
                  title="Belum ada pertanyaan"
                  body="Tanyakan apa pun soal tumbuh kembang si Kecil. Jawaban datang dalam 24 jam."
                  action={
                    <Button icon={Plus} onClick={() => setComposeOpen(true)}>
                      Tulis pertanyaan
                    </Button>
                  }
                />
              ) : (
                <motion.div className="space-y-6" variants={listContainer} initial="hidden" animate="show">
                  {mine.map((q) => (
                    <Thread key={q.id} q={q} />
                  ))}
                </motion.div>
              )
            ) : faq.length === 0 ? (
              <EmptyState icon={Sparkles} title="FAQ masih kosong" body="Pertanyaan publik yang sudah dijawab akan muncul di sini." />
            ) : (
              <motion.div className="space-y-2.5" variants={listContainer} initial="hidden" animate="show">
                {faq.map((q) => (
                  <FaqItem key={q.id} q={q} />
                ))}
              </motion.div>
            )}
          </div>

          <p className="px-6 mt-6 text-[13px] text-mute leading-relaxed">
            Jawaban bersifat edukatif dan bukan diagnosis. Untuk pemeriksaan menyeluruh, jadwalkan konsultasi di klinik.
          </p>
        </>
      )}

      <ComposeSheet open={composeOpen} onClose={() => setComposeOpen(false)} remaining={remaining} childId={activeChild.id} childName={activeChild.name} />
      <ExpertAnswerSheet question={answering} onClose={() => setAnswering(null)} />

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Lainnya">
        <ListGroup className="!px-0 pt-1">
          <ListRow
            icon={ShieldCheck}
            iconTone="brown"
            title="Mode ahli (demo)"
            subtitle="Menjawab antrean sebagai tim klinik"
            trailing={<Switch checked={expertMode} onChange={(v) => { setExpertMode(v); setMenuOpen(false); }} label="Mode ahli" />}
          />
        </ListGroup>
      </Sheet>
    </Screen>
  );
}

