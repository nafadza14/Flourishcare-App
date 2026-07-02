import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Camera, 
  Download, 
  Printer, 
  Info, 
  Sparkles, 
  Bell, 
  Image as ImageIcon 
} from 'lucide-react';
import { Child, ChildImmunization, ImmunizationReference } from '../types';
import { IMMUNIZATIONS_SEED } from '../data/seedData';

interface ImmunizationSchedulerProps {
  child: Child;
}

export default function ImmunizationScheduler({ child }: ImmunizationSchedulerProps) {
  const [givenVaccines, setGivenVaccines] = useState<ChildImmunization[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempDates, setTempDates] = useState<Record<string, string>>({});
  const [photoUploadingId, setPhotoUploadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchChildImmunizations();
  }, [child.id]);

  const fetchChildImmunizations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/immunization/${child.id}`);
      if (response.ok) {
        const data = await response.json();
        setGivenVaccines(data);
        
        // Initialize date pickers with already logged dates
        const dates: Record<string, string> = {};
        data.forEach((v: ChildImmunization) => {
          if (v.givenDate) dates[v.immunizationId] = v.givenDate;
        });
        setTempDates(dates);
      }
    } catch (err) {
      console.error('Failed to load child vaccinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAgeInMonths = (birthDateStr: string): number => {
    const birth = new Date(birthDateStr);
    const now = new Date(); // assume current time 2026-07-01
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.4375);
  };

  const currentAgeInMonths = calculateAgeInMonths(child.birthDate);

  const isVaccineGiven = (id: string): boolean => {
    return givenVaccines.some(v => v.immunizationId === id && v.givenDate);
  };

  const getVaccineRecord = (id: string): ChildImmunization | undefined => {
    return givenVaccines.find(v => v.immunizationId === id);
  };

  const handleDateChange = (id: string, value: string) => {
    setTempDates(prev => ({ ...prev, [id]: value }));
  };

  const handleToggleVaccine = async (id: string, forceUntoggle = false) => {
    const isGiven = isVaccineGiven(id);
    const dateSelected = tempDates[id] || new Date().toISOString().split('T')[0];

    try {
      const response = await fetch('/api/immunization/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: child.id,
          immunizationId: id,
          givenDate: isGiven || forceUntoggle ? undefined : dateSelected,
          proofPhotoUrl: isGiven || forceUntoggle ? undefined : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200'
        })
      });

      if (response.ok) {
        fetchChildImmunizations();
      }
    } catch (err) {
      console.error('Failed to log immunization:', err);
    }
  };

  // Simulate a KIA book vaccine stamp photo capture
  const handleUploadPhoto = (id: string) => {
    setPhotoUploadingId(id);
    setTimeout(async () => {
      try {
        const dateSelected = tempDates[id] || new Date().toISOString().split('T')[0];
        const response = await fetch('/api/immunization/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            childId: child.id,
            immunizationId: id,
            givenDate: dateSelected,
            proofPhotoUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=200' // mock uploaded photo
          })
        });

        if (response.ok) {
          fetchChildImmunizations();
        }
      } catch (err) {
        console.error('Failed upload mock:', err);
      } finally {
        setPhotoUploadingId(null);
      }
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-orange-100/60 shadow-md p-6 font-sans print:border-none print:shadow-none print:p-0">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-orange-50 print:mb-2 print:pb-2">
        <div>
          <h2 className="text-xl font-extrabold text-brand-brown font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-orange" />
            Jadwal & Imunisasi IDAI ({child.name})
          </h2>
          <p className="text-sm text-brand-brown/60 mt-0.5 print:text-xs">
            Kalender vaksinasi dasar anak nasional Kemenkes RI. Usia Aiden saat ini: <strong>{currentAgeInMonths} Bulan</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 border border-orange-100 rounded-xl text-xs font-bold text-brand-brown hover:bg-orange-50/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Jadwal (KIA)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Summary & Actionable Alerts */}
        <div className="space-y-6 print:hidden">
          
          {/* Notification Alert Banner */}
          <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-3">
            <h4 className="font-extrabold text-xs text-brand-brown uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-brand-orange" /> Pengingat Vaksinasi
            </h4>
            <p className="text-xs text-brand-brown/80 leading-relaxed font-semibold">
              Berdasarkan usia Aiden ({currentAgeInMonths} Bulan), jadwal imunisasi berikutnya yang disarankan adalah:
            </p>
            <div className="p-3 bg-white rounded-xl border border-orange-50 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-brand-orange">MR 2 (Booster Campak)</span>
                <span className="text-[10px] bg-orange-100 text-brand-brown font-bold px-2 py-0.5 rounded">Usia 18 Bulan</span>
              </div>
              <p className="text-[11px] text-brand-brown/60 leading-relaxed">
                Mencegah radang paru parah & kecacatan rubela. Segera jadwalkan kunjungan klinik atau home-visit bidan FlourishCare.
              </p>
            </div>
            <p className="text-[10px] text-brand-brown/50">
              * Pengingat otomatis H-7 & H-1 akan dikirimkan gratis via WhatsApp dan Push Notification.
            </p>
          </div>

          {/* Guidelines info */}
          <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100 flex gap-2.5 text-xs text-brand-brown/80 leading-relaxed">
            <Info className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
            <div>
              <strong>Petunjuk KIA:</strong> Simpan riwayat digital dengan mengunggah foto lembar cap dokter di buku KIA / KMS Anda. Ini memudahkan verifikasi riwayat saat pendaftaran TK/SD nantinya!
            </div>
          </div>

          {/* Digital Vaccination Certificate Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-brand-brown uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-brand-yellow animate-spin" /> Kartu Vaksin Digital
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Resmi FlourishCare
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-brand-brown/50">NAMA ANAK</div>
              <div className="text-lg font-black text-brand-brown font-display uppercase">{child.name}</div>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-bold text-brand-brown">
                <div>
                  <div className="text-[9px] text-brand-brown/50 uppercase">TANGGAL LAHIR</div>
                  <div>{new Date(child.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-[9px] text-brand-brown/50 uppercase">IMUNISASI SELESAI</div>
                  <div className="text-brand-orange font-black">
                    {givenVaccines.filter(v => v.givenDate).length} dari {IMMUNIZATIONS_SEED.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Immunization Timeline Grid */}
        <div className="lg:col-span-2 space-y-4 print:col-span-3">
          <h3 className="font-extrabold text-xs text-brand-brown uppercase tracking-wider print:text-sm">
            Garis Waktu Imunisasi Dasar & Penguat (Booster)
          </h3>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1 print:max-h-none print:overflow-visible">
            {IMMUNIZATIONS_SEED.map((v) => {
              const record = getVaccineRecord(v.id);
              const isDone = !!record?.givenDate;
              const dateVal = tempDates[v.id] || '';

              return (
                <div 
                  key={v.id}
                  className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all print:py-2 print:border-orange-100 ${
                    isDone 
                      ? 'border-emerald-100 bg-emerald-50/10' 
                      : 'border-orange-100/40 bg-white'
                  }`}
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                        isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-brand-orange'
                      }`}>
                        {v.recommendedAgeMonth === 0 ? 'Lahir' : `${v.recommendedAgeMonth} Bulan`}
                      </span>
                      <h4 className="font-black text-sm text-brand-brown">{v.vaccineName}</h4>
                      {isDone && (
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3 fill-emerald-500 text-white" /> Selesai
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-brown/70 leading-relaxed font-semibold">
                      {v.description}
                    </p>
                  </div>

                  {/* Log Action Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 print:hidden">
                    {isDone ? (
                      // Done Status with Photo link & Undo Option
                      <div className="flex items-center gap-2 text-xs">
                        {record.givenDate && (
                          <div className="text-right">
                            <div className="text-[9px] text-brand-brown/40 uppercase">DIBERIKAN TGL</div>
                            <div className="font-black text-brand-brown">
                              {new Date(record.givenDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        )}
                        {record.proofPhotoUrl && (
                          <a 
                            href={record.proofPhotoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 border border-orange-100 rounded-xl hover:bg-orange-50 text-brand-orange"
                            title="Lihat Bukti Foto"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleToggleVaccine(v.id, true)}
                          className="text-xs font-bold text-brand-brown/40 hover:text-semantic-danger px-2.5 py-1.5 rounded-lg border border-orange-100"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      // Incomplete Action: Log and Upload Photo
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={dateVal}
                          onChange={(e) => handleDateChange(v.id, e.target.value)}
                          className="px-2 py-1.5 text-xs border border-orange-100 rounded-lg text-brand-brown font-semibold bg-orange-50/10 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                        />
                        <button
                          onClick={() => handleToggleVaccine(v.id)}
                          className="bg-brand-orange hover:bg-brand-orange/90 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Log Vaksin
                        </button>
                        <button
                          disabled={photoUploadingId === v.id}
                          onClick={() => handleUploadPhoto(v.id)}
                          className="p-1.5 border border-orange-100 hover:border-brand-orange rounded-xl text-brand-brown/60 hover:text-brand-orange"
                          title="Unggah Foto Buku KIA"
                        >
                          <Camera className={`w-4 h-4 ${photoUploadingId === v.id ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Printable date representation */}
                  <div className="hidden print:block text-xs font-bold text-brand-brown text-right">
                    {isDone ? `Selesai (${new Date(record.givenDate!).toLocaleDateString('id-ID')})` : 'Belum Diberikan'}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
