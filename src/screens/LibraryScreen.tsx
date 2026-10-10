import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BadgeCheck, Clock, Play, Search, X } from 'lucide-react';
import Screen from '../components/ui/Screen';
import CoverImage from '../components/ui/CoverImage';
import { Card, Chip, EmptyState } from '../components/ui/primitives';
import { PhotoAvatar, TeamAvatar } from '../components/ui/Avatar';
import type { Article } from '../types';
import { useNav } from '../lib/nav';
import { ARTICLES_SEED } from '../data/seedData';
import { findExpertByName, TEAM_SIGNATURE } from '../data/team';
import { useExperts } from '../lib/experts';
import { formatDate } from '../lib/format';
import { listContainer, listItem } from '../lib/motion';

const UPCOMING_VIDEOS = [
  {
    id: 'v_1',
    title: 'Sensory play dengan beras kering untuk anak sensitif tekstur',
    author: TEAM_SIGNATURE,
    minutes: 3,
    thumb: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'v_2',
    title: 'Melatih kontak mata dan meniru kata pertama',
    author: TEAM_SIGNATURE,
    minutes: 5,
    thumb: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=400&auto=format&fit=crop',
  },
];

export function readMinutes(article: Article): number {
  const words = article.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function plainExcerpt(html: string, length = 110) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > length ? text.slice(0, length).trim() + '...' : text;
}

/** Photo when a team member wrote it, the clinic mark when it is signed by the team. */
function AuthorAvatar({ name, size }: { name: string; size: number }) {
  const experts = useExperts();
  const expert = findExpertByName(experts, name);
  return expert ? <PhotoAvatar src={expert.photoUrl} name={expert.name} size={size} /> : <TeamAvatar size={size} />;
}

export default function LibraryScreen({ onBack }: { onBack?: () => void }) {
  const nav = useNav();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const categories = useMemo(() => ['all', ...Array.from(new Set(ARTICLES_SEED.map((a) => a.category)))], []);

  const filtered = ARTICLES_SEED.filter((a) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
    return matchQ && (category === 'all' || a.category === category);
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const [featured, ...rest] = filtered;

  return (
    <Screen title="Edukasi" subtitle="Bacaan singkat dari tim psikolog dan terapis" onBack={onBack}>
      <div className="px-5">
        <label className="flex items-center gap-3 h-[52px] px-4 rounded-[18px] bg-white border border-line shadow-card focus-within:border-brand-orange transition-colors">
          <Search className="w-5 h-5 text-mute" strokeWidth={1.7} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari topik, misalnya tantrum"
            className="flex-1 bg-transparent text-[17px] placeholder:text-faint"
            aria-label="Cari artikel"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Hapus pencarian" className="w-6 h-6 rounded-full bg-fill flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </label>
      </div>

      <div className="flex gap-2 px-5 mt-3 overflow-x-auto no-scrollbar">
        {categories.map((c) => (
          <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
            {c === 'all' ? 'Semua' : c}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Artikel tidak ditemukan" body="Coba kata kunci lain atau pilih kategori Semua." />
      ) : (
        <motion.div key={category + query} className="px-5 mt-5 space-y-3" variants={listContainer} initial="hidden" animate="show">
          {featured && (
            <motion.button
              variants={listItem}
              whileTap={{ scale: 0.98 }}
              onClick={() => nav.push({ name: 'article', id: featured.id })}
              className="w-full text-left bg-white rounded-[26px] border border-line shadow-card overflow-hidden"
            >
              <div className="relative h-48 bg-brand-orange-soft">
                <CoverImage src={featured.coverImageUrl} className="w-full h-full" markClassName="w-16 h-16" />
                <span className="absolute top-3 left-3 h-7 px-3 rounded-full glass-white text-[13px] flex items-center">{featured.category}</span>
              </div>
              <div className="p-4">
                <div className="text-[20px] leading-snug tracking-[-0.01em]">{featured.title}</div>
                <p className="text-[15px] text-mute leading-relaxed mt-1.5">{plainExcerpt(featured.body)}</p>
                <div className="flex items-center gap-2.5 mt-3.5">
                  <AuthorAvatar name={featured.authorName} size={30} />
                  <span className="text-[14px] text-ink-2 flex-1 truncate">{featured.authorName}</span>
                  <span className="text-[13px] text-mute flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5" /> {readMinutes(featured)} mnt
                  </span>
                </div>
              </div>
            </motion.button>
          )}

          {rest.map((a) => (
            <motion.button
              key={a.id}
              variants={listItem}
              whileTap={{ scale: 0.98 }}
              onClick={() => nav.push({ name: 'article', id: a.id })}
              className="w-full text-left bg-white rounded-[22px] border border-line shadow-card p-3 flex gap-3.5"
            >
              <CoverImage src={a.coverImageUrl} className="w-[88px] h-[88px] rounded-[16px] shrink-0" markClassName="w-9 h-9" />
              <span className="flex-1 min-w-0 py-0.5">
                <span className="block text-[13px] text-brand-orange-deep">{a.category}</span>
                <span className="block text-[16px] leading-snug mt-0.5 line-clamp-2">{a.title}</span>
                <span className="block text-[13px] text-mute mt-1.5">
                  {readMinutes(a)} mnt baca · {formatDate(a.publishedAt)}
                </span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}

      <div className="px-5 mt-8">
        <h2 className="text-[21px] font-normal">Video dari terapis</h2>
        <p className="text-[15px] text-mute mt-0.5">Sedang diproduksi tim klinik FlourishCare</p>
        <div className="flex gap-3 mt-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          {UPCOMING_VIDEOS.map((v) => (
            <Card key={v.id} className="w-[240px] shrink-0 overflow-hidden">
              <div className="relative h-32 bg-brand-orange-soft">
                <CoverImage src={v.thumb} className="w-full h-full" markClassName="w-12 h-12" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-11 h-11 rounded-full glass-white flex items-center justify-center">
                    <Play className="w-5 h-5 text-ink ml-0.5" fill="currentColor" />
                  </span>
                </span>
                <span className="absolute top-2.5 left-2.5 h-6 px-2.5 rounded-full bg-ink/75 text-white text-[12px] flex items-center">Segera tayang</span>
              </div>
              <div className="p-3.5">
                <div className="text-[15px] leading-snug line-clamp-2">{v.title}</div>
                <div className="text-[13px] text-mute mt-1">
                  {v.author.split(',')[0]} · {v.minutes} mnt
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Screen>
  );
}

export function ArticleScreen({ id, onBack }: { id: string; onBack?: () => void }) {
  const nav = useNav();
  const article = ARTICLES_SEED.find((a) => a.id === id);
  if (!article) {
    return (
      <Screen title="Artikel" onBack={onBack}>
        <EmptyState icon={Search} title="Artikel tidak ditemukan" />
      </Screen>
    );
  }
  const related = ARTICLES_SEED.filter((a) => a.id !== article.id).slice(0, 2);

  return (
    <Screen title={article.title} largeTitle={false} onBack={onBack}>
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="px-5">
        <div className="h-56 rounded-[26px] overflow-hidden bg-brand-orange-soft shadow-card">
          <CoverImage src={article.coverImageUrl} className="w-full h-full" markClassName="w-20 h-20" />
        </div>
      </motion.div>
      <div className="px-5 mt-5">
        <span className="inline-flex h-7 px-3 rounded-full bg-brand-orange-soft text-brand-orange-deep text-[13px] items-center">{article.category}</span>
        <h1 className="text-[28px] leading-[1.18] tracking-[-0.02em] font-normal mt-3">{article.title}</h1>
        <div className="flex items-center gap-3 mt-4">
          <AuthorAvatar name={article.authorName} size={42} />
          <div className="min-w-0 flex-1">
            <div className="text-[16px] truncate">{article.authorName}</div>
            <div className="text-[14px] text-mute truncate">{article.authorCredential}</div>
          </div>
          <span className="text-[13px] text-mute flex items-center gap-1 shrink-0">
            <Clock className="w-3.5 h-3.5" /> {readMinutes(article)} mnt
          </span>
        </div>
        {article.reviewedBy && (
          <div className="mt-4 flex items-center gap-2.5 rounded-[16px] bg-semantic-success-soft px-4 py-3 text-[14px] text-ink-2">
            <BadgeCheck className="w-5 h-5 text-semantic-success shrink-0" strokeWidth={1.8} />
            Ditinjau secara medis oleh {article.reviewedBy}
          </div>
        )}
        <div className="prose-fc mt-6" dangerouslySetInnerHTML={{ __html: article.body }} />
        <div className="text-[13px] text-mute mt-4">Diterbitkan {formatDate(article.publishedAt, 'long')}</div>
      </div>

      <div className="px-5 mt-8">
        <h2 className="text-[21px] font-normal mb-3">Baca juga</h2>
        <div className="space-y-3">
          {related.map((a) => (
            <motion.button
              key={a.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => nav.push({ name: 'article', id: a.id })}
              className="w-full text-left bg-white rounded-[22px] border border-line shadow-card p-3 flex gap-3.5"
            >
              <CoverImage src={a.coverImageUrl} className="w-[72px] h-[72px] rounded-[14px] shrink-0" markClassName="w-8 h-8" />
              <span className="flex-1 min-w-0 py-0.5">
                <span className="block text-[13px] text-brand-orange-deep">{a.category}</span>
                <span className="block text-[16px] leading-snug mt-0.5 line-clamp-2">{a.title}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
