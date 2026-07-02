import React, { useState } from 'react';
import { Search, BookOpen, Video as VideoIcon, Eye, ArrowLeft, Heart, CheckCircle, Sparkles } from 'lucide-react';
import { Article, Video } from '../types';
import { ARTICLES_SEED } from '../data/seedData';

const VIDEOS_SEED: Video[] = [
  {
    id: 'v_1',
    title: 'Sensory Play: Bermain Beras Kering untuk Mengatasi GTM & Taktil Sensitif',
    slug: 'sensory-play-beras',
    category: 'sensori',
    ageRange: '6 - 18 Bulan',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=200',
    durationSeconds: 180,
    authorName: 'Rian Hidayat, A.Md.OT',
    publishedAt: '2026-06-25'
  },
  {
    id: 'v_2',
    title: 'Mencapai Milestone Kontak Mata dan Meniru Kata Pertama Balita',
    slug: 'milestone-kontak-mata-meniru',
    category: 'bicara',
    ageRange: '12 - 36 Bulan',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=200',
    durationSeconds: 320,
    authorName: 'Ira Amanda, M.Psi., Psikolog',
    publishedAt: '2026-06-20'
  }
];

export default function ContentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const categories = [
    { key: 'all', label: 'Semua Kategori' },
    { key: 'Nutrisi', label: 'Nutrisi & MPASI' },
    { key: 'Bahasa', label: 'Terapi Wicara' },
    { key: 'Sensori & Motorik', label: 'Sensori & Okupasi' },
    { key: 'Sosial Emosional', label: 'Regulasi Emosi' }
  ];

  const filteredArticles = ARTICLES_SEED.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVideos = VIDEOS_SEED.filter((vid) => {
    const matchesSearch = vid.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || vid.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-3xl border border-orange-100/60 shadow-md p-6 font-sans">
      
      {selectedArticle ? (
        // DETAIL VIEW FOR ARTICLE
        <div className="space-y-6">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-xs font-bold text-brand-brown/70 hover:text-brand-orange flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Edukasi
          </button>

          <article className="space-y-6 max-w-3xl">
            {/* Banner Image */}
            <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden bg-orange-100 relative">
              <img
                src={selectedArticle.coverImageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800'}
                alt={selectedArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-xl text-xs font-extrabold text-brand-orange border border-orange-50">
                {selectedArticle.category}
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-brand-brown font-display leading-tight">
                {selectedArticle.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-brand-brown/60 font-semibold">
                <span>Ditulis oleh {selectedArticle.authorName}</span>
                {selectedArticle.reviewedBy && (
                  <>
                    <span>&bull;</span>
                    <span>Ditinjau oleh {selectedArticle.reviewedBy}</span>
                  </>
                )}
              </div>
            </div>

            {/* Clinician Review Badge */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Tinjauan Medis:</strong> Konten ini telah ditinjau dan dinyatakan sesuai pedoman klinis Kemenkes RI oleh <strong>{selectedArticle.reviewedBy || 'Klinisi FlourishCare'}</strong>.
              </span>
            </div>

            {/* Article Content */}
            <div className="text-brand-brown/90 leading-relaxed text-sm space-y-4 whitespace-pre-line font-medium" dangerouslySetInnerHTML={{ __html: selectedArticle.body }} />

            {/* SEO Simulated Tags Display in developer drawer */}
            <div className="p-4 bg-orange-50/20 rounded-2xl border border-orange-100/60">
              <span className="text-[10px] font-black text-brand-orange block mb-2">Metadata SEO dan OpenGraph (Simulasi)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono text-brand-brown/85">
                <div>
                  <strong>URL:</strong> /edukasi/{selectedArticle.slug}
                </div>
                <div>
                  <strong>Meta Title:</strong> {selectedArticle.title} | Flourishcare App
                </div>
                <div className="md:col-span-2">
                  <strong>Meta Description:</strong> Baca panduan kesehatan anak tentang {selectedArticle.title} yang direview secara medis oleh psikolog & dokter anak Indonesia.
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : (
        // MAIN CATALOGUE LIST
        <div className="space-y-8">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-orange-50">
            <div>
              <h2 className="text-xl font-extrabold text-brand-brown font-display flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-orange" />
                Perpustakaan Edukasi Ahli
              </h2>
              <p className="text-sm text-brand-brown/60 mt-0.5">Materi tumbuh kembang terpercaya, ditulis & direview oleh tim dokter & psikolog klinis</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-brand-brown/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari artikel atau stimulasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-orange-50/10 font-semibold"
              />
            </div>
          </div>

          {/* Categories Tab Filter */}
          <div className="flex overflow-x-auto gap-2 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-brand-orange text-white border-brand-orange shadow-xs'
                    : 'bg-white text-brand-brown/70 border-orange-100 hover:bg-orange-50/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Active Video Player Banner */}
          {activeVideo && (
            <div className="bg-brand-brown text-white p-5 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-md border border-orange-950/25">
              <div className="aspect-video w-full md:w-80 rounded-2xl overflow-hidden bg-black border border-white/10 shrink-0">
                <iframe
                  title={activeVideo.title}
                  width="100%"
                  height="100%"
                  src={activeVideo.videoUrl}
                  allowFullScreen
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-orange-200 bg-white/10 px-2 py-0.5 rounded">
                    Tutorial Video {activeVideo.category}
                  </span>
                  <span className="text-[10px] text-orange-100/70 font-semibold">Durasi: {Math.floor(activeVideo.durationSeconds / 60)} menit</span>
                </div>
                <h3 className="text-lg font-black font-display leading-snug">{activeVideo.title}</h3>
                <p className="text-xs text-orange-100/80 leading-relaxed font-semibold">Sesi panduan stimulasi taktil dan stimulasi bicara balita bersama spesialis FlourishCare.</p>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Tutup Video
                </button>
              </div>
            </div>
          )}

          {/* Split Screen: Articles (Left) & Videos (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Articles List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-xs text-brand-brown flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-brand-orange" /> Artikel Tinjauan Medis ({filteredArticles.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-xs text-brand-brown/40 border border-dashed rounded-2xl">
                    Tidak ditemukan artikel yang cocok, Bun.
                  </div>
                ) : (
                  filteredArticles.map((art) => (
                    <div 
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className="group bg-orange-50/5 border border-orange-100/60 rounded-2xl overflow-hidden cursor-pointer hover:border-brand-orange hover:bg-white transition-all shadow-xs"
                    >
                      <div className="h-40 bg-orange-100 overflow-hidden relative">
                        <img
                          src={art.coverImageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400'}
                          alt={art.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <span className="text-[9px] font-black text-brand-orange bg-orange-100/50 px-2 py-0.5 rounded">
                          {art.category}
                        </span>
                        <h4 className="font-extrabold text-sm text-brand-brown group-hover:text-brand-orange transition-all leading-snug font-display line-clamp-2">
                          {art.title}
                        </h4>
                        <div className="text-xs text-brand-brown/60 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: art.body.substring(0, 100) + '...' }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Col: Video Tutorials list */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-brand-brown flex items-center gap-1">
                <VideoIcon className="w-4 h-4 text-brand-orange" /> Video Terapi & Stimulasi ({filteredVideos.length})
              </h3>

              <div className="space-y-3">
                {filteredVideos.length === 0 ? (
                  <div className="py-12 text-center text-xs text-brand-brown/40 border border-dashed rounded-2xl">
                    Tidak ditemukan video pendukung.
                  </div>
                ) : (
                  filteredVideos.map((vid) => (
                    <div 
                      key={vid.id}
                      onClick={() => setActiveVideo(vid)}
                      className="p-3 bg-orange-50/20 border border-orange-100/50 hover:border-brand-orange rounded-2xl flex items-center gap-3.5 cursor-pointer hover:bg-white transition-all shadow-xs"
                    >
                      {/* Video thumb simulation */}
                      <div className="w-20 h-16 bg-brand-brown rounded-xl overflow-hidden relative shrink-0 flex items-center justify-center">
                        <VideoIcon className="w-6 h-6 text-white absolute" />
                        <img 
                          src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=200'} 
                          alt={vid.title} 
                          className="w-full h-full object-cover opacity-75"
                        />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="font-extrabold text-xs text-brand-brown truncate leading-tight">
                          {vid.title}
                        </h4>
                        <p className="text-[10px] text-brand-brown/60 line-clamp-2 leading-relaxed">
                          Oleh {vid.authorName} &bull; {Math.floor(vid.durationSeconds / 60)} menit
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Verified Author Banner */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-orange-100/60 flex gap-2.5">
                <Sparkles className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-brand-brown/85 font-semibold">
                  <strong>Standardisasi Kurikulum:</strong> Seluruh modul stimulasi video dirancang oleh terapis okupasi bersertifikat Klinik FlourishCare Tebet guna menjamin keamanan melatih otot motorik anak di rumah.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
