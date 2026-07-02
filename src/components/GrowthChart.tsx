import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Plus, Trash2, TrendingUp, Sparkles, Scale, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Child, GrowthRecord } from '../types';

interface GrowthChartProps {
  child: Child;
  onRefreshStats: () => void;
}

// WHO Standard Reference weights (median, 15th percentile, 85th percentile, 3rd percentile, 97th percentile) for Boys (L)
const WHO_BOYS_WEIGHT = [
  { ageMonth: 0, p3: 2.4, p15: 2.9, median: 3.3, p85: 3.9, p97: 4.4 },
  { ageMonth: 3, p3: 5.0, p15: 5.7, median: 6.4, p85: 7.2, p97: 8.0 },
  { ageMonth: 6, p3: 6.4, p15: 7.1, median: 7.9, p85: 8.9, p97: 9.8 },
  { ageMonth: 9, p3: 7.2, p15: 8.0, median: 8.9, p85: 10.0, p97: 11.0 },
  { ageMonth: 12, p3: 7.8, p15: 8.6, median: 9.6, p85: 10.8, p97: 12.0 },
  { ageMonth: 15, p3: 8.3, p15: 9.2, median: 10.3, p85: 11.5, p97: 12.8 },
  { ageMonth: 18, p3: 8.8, p15: 9.8, median: 11.0, p85: 12.2, p97: 13.7 },
  { ageMonth: 24, p3: 9.7, p15: 10.8, median: 12.2, p85: 13.6, p97: 15.3 }
];

// WHO Standard Reference weights for Girls (P)
const WHO_GIRLS_WEIGHT = [
  { ageMonth: 0, p3: 2.3, p15: 2.8, median: 3.2, p85: 3.7, p97: 4.2 },
  { ageMonth: 3, p3: 4.5, p15: 5.2, median: 5.8, p85: 6.6, p97: 7.5 },
  { ageMonth: 6, p3: 5.8, p15: 6.5, median: 7.3, p85: 8.2, p97: 9.3 },
  { ageMonth: 9, p3: 6.5, p15: 7.3, median: 8.2, p85: 9.3, p97: 10.5 },
  { ageMonth: 12, p3: 7.0, p15: 7.9, median: 8.9, p85: 10.1, p97: 11.5 },
  { ageMonth: 15, p3: 7.6, p15: 8.5, median: 9.5, p85: 10.8, p97: 12.4 },
  { ageMonth: 18, p3: 8.1, p15: 9.1, median: 10.2, p85: 11.6, p97: 13.2 },
  { ageMonth: 24, p3: 9.0, p15: 10.1, median: 11.5, p85: 13.0, p97: 14.8 }
];

export default function GrowthChart({ child, onRefreshStats }: GrowthChartProps) {
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCirc, setHeadCirc] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'chart' | 'logs'>('chart');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrowthRecords();
  }, [child.id]);

  const fetchGrowthRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/growth/${child.id}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Failed to load growth records:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAgeInMonths = (birthDateStr: string, recordDateStr: string): number => {
    const birth = new Date(birthDateStr);
    const rec = new Date(recordDateStr);
    const diffTime = Math.abs(rec.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.round((diffDays / 30.4375) * 10) / 10; // decimal representation
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !height || !headCirc) {
      setError('Mohon lengkapi semua isian parameter pertumbuhan.');
      return;
    }

    try {
      const response = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: child.id,
          date,
          weightKg: parseFloat(weight),
          heightCm: parseFloat(height),
          headCircumferenceCm: parseFloat(headCirc),
          notes
        }),
      });

      if (response.ok) {
        setWeight('');
        setHeight('');
        setHeadCirc('');
        setNotes('');
        setError('');
        fetchGrowthRecords();
        onRefreshStats();
      } else {
        throw new Error('Gagal menyimpan catatan pertumbuhan.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus riwayat pengukuran ini, Bun?')) return;
    try {
      const response = await fetch(`/api/growth/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchGrowthRecords();
        onRefreshStats();
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // Prepare chart data combining WHO standards and Aiden's measurements
  const standardWeights = child.gender === 'L' ? WHO_BOYS_WEIGHT : WHO_GIRLS_WEIGHT;
  
  const chartData = standardWeights.map((std) => {
    // Find records in this age range (+/- 1.5 months)
    const recordInAge = records.find((rec) => {
      const recAge = calculateAgeInMonths(child.birthDate, rec.date);
      return Math.abs(recAge - std.ageMonth) <= 1.5;
    });

    return {
      ageMonth: std.ageMonth,
      'WHO Median (Normal)': std.median,
      'WHO Batas Atas (P85)': std.p85,
      'WHO Batas Bawah (P15)': std.p15,
      'P3 (Sangat Kurang)': std.p3,
      'P97 (Berlebih)': std.p97,
      [`Berat ${child.name} (kg)`]: recordInAge ? recordInAge.weightKg : undefined
    };
  });

  // Check the latest record status
  const getLatestStatus = () => {
    if (records.length === 0) return null;
    const latest = records[records.length - 1];
    const ageMonths = calculateAgeInMonths(child.birthDate, latest.date);
    
    // Find closest standard age
    const closestStd = standardWeights.reduce((prev, curr) => {
      return (Math.abs(curr.ageMonth - ageMonths) < Math.abs(prev.ageMonth - ageMonths)) ? curr : prev;
    });

    const w = latest.weightKg;
    if (w < closestStd.p3) {
      return {
        level: 'danger',
        title: 'Sangat Kurang (Gizi Buruk / Red Flag)',
        desc: `Berat badan ${child.name} berada di bawah persentil ke-3 WHO. Hal ini memerlukan evaluasi segera oleh dokter anak spesialis gizi tumbuh kembang untuk mendeteksi risiko stunting atau malnutrisi.`,
        color: 'text-semantic-danger bg-red-50 border-red-200'
      };
    } else if (w < closestStd.p15) {
      return {
        level: 'warning',
        title: 'Kurang / Waspada (Underweight)',
        desc: `Berat badan ${child.name} berada di zona kuning batas bawah (antara P3 & P15). Pastikan kecukupan ASI, MPASI seimbang, atau konsultasikan porsi makan si Kecil ke ahli gizi klinik FlourishCare.`,
        color: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    } else if (w > closestStd.p97) {
      return {
        level: 'danger',
        title: 'Kelebihan Berat Badan (Overweight)',
        desc: `Berat badan ${child.name} berada di atas persentil ke-97 WHO. Disarankan menjaga asupan gizi seimbang tanpa kelebihan gula/kalori berlebih dan mengkonsultasikan ke dokter anak.`,
        color: 'text-semantic-danger bg-red-50 border-red-200'
      };
    } else if (w > closestStd.p85) {
      return {
        level: 'warning',
        title: 'Cukup Berat / Waspada Atas',
        desc: `Berat badan si kecil berada di zona kuning batas atas. Mulai pantau keaktifan bermain fisik si Kecil dan kurangi porsi camilan manis berlebih.`,
        color: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    } else {
      return {
        level: 'success',
        title: 'Pertumbuhan Sangat Baik (Normal)',
        desc: `Hebat, Bun! Berat badan ${child.name} berada di zona hijau ideal WHO (antara P15 & P85). Pertahankan pemberian nutrisi bergizi seimbang dan stimulasi aktif!`,
        color: 'text-semantic-success bg-emerald-50 border-emerald-200'
      };
    }
  };

  const status = getLatestStatus();

  return (
    <div className="bg-white rounded-3xl border border-orange-100/60 shadow-md p-6">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-orange-50">
        <div>
          <h2 className="text-xl font-extrabold text-brand-brown font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-orange" />
            Grafik Pertumbuhan WHO ({child.name})
          </h2>
          <p className="text-sm text-brand-brown/60 mt-0.5">Pantau kecukupan berat badan si Kecil sesuai persentil IDAI & WHO</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-orange-50/50 p-1 rounded-xl">
          <button
            onClick={() => setTab('chart')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'chart' ? 'bg-white text-brand-orange shadow-sm' : 'text-brand-brown/70 hover:text-brand-orange'
            }`}
          >
            Visualisasi Grafik
          </button>
          <button
            onClick={() => setTab('logs')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'logs' ? 'bg-white text-brand-orange shadow-sm' : 'text-brand-brown/70 hover:text-brand-orange'
            }`}
          >
            Riwayat Log ({records.length})
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Input Form */}
        <div className="bg-orange-50/20 rounded-2xl border border-orange-100/50 p-5 space-y-4">
          <h3 className="font-extrabold text-sm text-brand-brown tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-brand-orange" /> Log Pengukuran Baru
          </h3>

          {error && (
            <div className="p-2.5 bg-red-50 text-xs font-semibold text-semantic-danger border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleAddRecord} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-brown mb-1.5">Tanggal Ukur</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white font-medium text-brand-brown"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-brand-brown mb-1.5">Berat (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="10.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-brown mb-1.5">Tinggi (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="82.0"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-brown mb-1.5">LK (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="47.5"
                  value={headCirc}
                  onChange={(e) => setHeadCirc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-brown mb-1.5">Catatan Pendukung (Opsional)</label>
              <input
                type="text"
                placeholder="Misal: Tumbuh gigi, sedang GTM"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-orange text-white py-2.5 rounded-xl font-bold hover:bg-brand-orange/95 text-sm flex items-center justify-center gap-1.5 shadow-sm shadow-orange-100 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Simpan Pengukuran
            </button>
          </form>

          {/* Quick Stats Summary */}
          {records.length > 0 && (
            <div className="pt-3 border-t border-orange-100/60">
              <div className="grid grid-cols-3 gap-2 text-center bg-white p-2 rounded-xl border border-orange-100/40 shadow-xs">
                <div>
                  <div className="text-[10px] font-bold text-brand-brown/50">Berat Terakhir</div>
                  <div className="text-sm font-black text-brand-brown">{records[records.length - 1].weightKg} kg</div>
                </div>
                <div className="border-x border-orange-50">
                  <div className="text-[10px] font-bold text-brand-brown/50">Tinggi Badan</div>
                  <div className="text-sm font-black text-brand-brown">{records[records.length - 1].heightCm} cm</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-brand-brown/50">Lingkar Kepala</div>
                  <div className="text-sm font-black text-brand-brown">{records[records.length - 1].headCircumferenceCm} cm</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Tab Contents (Chart or Logs) */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          
          {tab === 'chart' ? (
            <div className="space-y-6">
              {/* Graphic Container */}
              <div className="h-64 md:h-80 w-full bg-orange-50/10 rounded-2xl border border-orange-100/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#FCEFE3" />
                    <XAxis 
                      dataKey="ageMonth" 
                      label={{ value: 'Usia (Bulan)', position: 'insideBottom', offset: -5, fill: '#7A4C3D', fontSize: 10, fontWeight: 'bold' }} 
                      tick={{ fill: '#7A4C3D', fontSize: 10 }}
                    />
                    <YAxis 
                      label={{ value: 'Berat (Kg)', angle: -90, position: 'insideLeft', offset: 10, fill: '#7A4C3D', fontSize: 10, fontWeight: 'bold' }}
                      tick={{ fill: '#7A4C3D', fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFDE9', border: '1px solid #F5BB3E', borderRadius: '12px', fontSize: '11px', color: '#7A4C3D' }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    
                    {/* Reference WHO Lines */}
                    <Line type="monotone" dataKey="P3 (Sangat Kurang)" stroke="#E4572E" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                    <Line type="monotone" dataKey="WHO Batas Bawah (P15)" stroke="#F5BB3E" strokeDasharray="4 4" dot={false} strokeWidth={1.2} />
                    <Line type="monotone" dataKey="WHO Median (Normal)" stroke="#4CAF7D" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="WHO Batas Atas (P85)" stroke="#F5BB3E" strokeDasharray="4 4" dot={false} strokeWidth={1.2} />
                    <Line type="monotone" dataKey="P97 (Berlebih)" stroke="#E4572E" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                    
                    {/* Child's Line */}
                    <Line 
                      type="monotone" 
                      dataKey={`Berat ${child.name} (kg)`} 
                      stroke="#F29935" 
                      strokeWidth={3} 
                      activeDot={{ r: 8 }} 
                      dot={{ r: 5, fill: '#F29935', stroke: '#fff', strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Status & Medical Guidelines */}
              {status ? (
                <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${status.color}`}>
                  {status.level === 'success' && <CheckCircle2 className="w-6 h-6 text-semantic-success shrink-0 mt-0.5" />}
                  {status.level === 'warning' && <AlertTriangle className="w-6 h-6 text-semantic-warning shrink-0 mt-0.5" />}
                  {status.level === 'danger' && <AlertTriangle className="w-6 h-6 text-semantic-danger shrink-0 mt-0.5" />}
                  
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm">{status.title}</h4>
                    <p className="text-xs leading-relaxed opacity-90">{status.desc}</p>
                    {status.level !== 'success' && (
                      <div className="pt-2">
                        <span className="text-xs font-bold underline cursor-pointer flex items-center gap-1 hover:opacity-80">
                          Bunda, yuk konsultasikan dengan Dokter Anak / Ahli Gizi FlourishCare &rarr;
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-orange-100 bg-orange-50/10 flex items-center gap-2 text-brand-brown/70 text-xs">
                  <Info className="w-4 h-4 text-brand-orange" /> Belum ada catatan pertumbuhan terdaftar. Silakan masukkan data pertama si Kecil di form sebelah kiri!
                </div>
              )}
            </div>
          ) : (
            // Tab Logs
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-orange-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-orange-50 text-brand-brown font-bold text-xs">
                    <tr>
                      <th className="p-3">Tanggal Ukur</th>
                      <th className="p-3">Berat (kg)</th>
                      <th className="p-3">Tinggi (cm)</th>
                      <th className="p-3">Lingkar Kepala</th>
                      <th className="p-3">Catatan</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-50/50">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-xs text-brand-brown/50">
                          Belum ada riwayat log pertumbuhan.
                        </td>
                      </tr>
                    ) : (
                      records.slice().reverse().map((rec) => (
                        <tr key={rec.id} className="hover:bg-orange-50/10 text-xs font-semibold text-brand-brown/85">
                          <td className="p-3 whitespace-nowrap">
                            {new Date(rec.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-3 font-bold text-brand-brown">{rec.weightKg} kg</td>
                          <td className="p-3 font-bold">{rec.heightCm} cm</td>
                          <td className="p-3 font-bold">{rec.headCircumferenceCm} cm</td>
                          <td className="p-3 text-brand-brown/60 italic max-w-xs truncate">{rec.notes || '-'}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteRecord(rec.id)}
                              className="text-brand-brown/40 hover:text-semantic-danger p-1"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-orange-50/30 rounded-2xl border border-orange-100/40 text-xs leading-relaxed text-brand-brown/70 flex gap-2">
                <Sparkles className="w-4 h-4 text-brand-yellow shrink-0" />
                <span>
                  <strong>Tips:</strong> Kurva pertumbuhan WHO ini dihitung otomatis mengikuti standar Z-Score KPSP Kemenkes RI untuk memantau status gizi normal, gizi buruk (wasting), atau obesitas dini.
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
