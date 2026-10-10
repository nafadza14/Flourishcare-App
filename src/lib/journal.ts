import { useCallback, useEffect, useRef, useState } from 'react';
import { BookHeart, Cake, Moon, Smile, Sparkles, Stethoscope, Utensils, type LucideIcon } from 'lucide-react';
import type { JournalCategory, JournalEntry } from '../types';
import { getJSON } from '../api';
import { useDataChanged } from './events';

export const JOURNAL_CATEGORIES: { key: JournalCategory; label: string; icon: LucideIcon; color: string }[] = [
  { key: 'momen_pertama', label: 'Momen pertama', icon: Sparkles, color: '#F29935' },
  { key: 'makan', label: 'Makan', icon: Utensils, color: '#4F9A68' },
  { key: 'tidur', label: 'Tidur', icon: Moon, color: '#6B7FD7' },
  { key: 'emosi', label: 'Emosi dan tantrum', icon: Smile, color: '#E3A12B' },
  { key: 'kesehatan', label: 'Kesehatan', icon: Stethoscope, color: '#D9634A' },
  { key: 'hari_spesial', label: 'Hari spesial', icon: Cake, color: '#E98AA3' },
  { key: 'catatan', label: 'Catatan bebas', icon: BookHeart, color: '#8E837B' },
];

export function categoryInfo(key: JournalCategory) {
  return JOURNAL_CATEGORIES.find((c) => c.key === key) ?? JOURNAL_CATEGORIES[JOURNAL_CATEGORIES.length - 1];
}

/** One tap templates for the moments parents most want to remember */
export const FIRST_MOMENTS = [
  'Senyum pertama',
  'Tengkurap pertama',
  'Duduk sendiri',
  'Gigi pertama',
  'Makan pertama (MPASI)',
  'Merangkak pertama',
  'Kata pertama',
  'Langkah pertama',
  'Hari pertama sekolah',
];

export function useJournal(childId: string | undefined) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const req = useRef(0);
  const load = useCallback(async () => {
    if (!childId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    const id = ++req.current;
    const list = await getJSON<JournalEntry[]>(`/api/journal/${childId}`, []);
    if (id === req.current) {
      setEntries(list);
      setLoading(false);
    }
  }, [childId]);
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);
  useDataChanged((scope) => scope === 'journal' && load(), [load]);
  return { entries, loading, reload: load, setEntries };
}

/** Text used when sharing an entry with a therapist or family */
export function shareText(childName: string, e: JournalEntry, dateLabel: string): string {
  const cat = categoryInfo(e.category).label;
  return [`${childName}, ${dateLabel}`, `${cat}${e.title ? `: ${e.title}` : ''}`, e.body?.trim()].filter(Boolean).join('\n') + '\n\nDicatat di FlourishCare';
}
