import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Home, 
  CreditCard, 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  QrCode, 
  User, 
  ArrowRight, 
  X, 
  ExternalLink 
} from 'lucide-react';
import { Child, Booking } from '../types';
import { CLINICAL_EXPERTS } from '../data/seedData';
import { apiFetch } from '../api';

interface Expert {
  id: string;
  name: string;
  role: string;
  clinic: string;
  photoUrl: string;
}

interface BookingHubProps {
  child: Child;
  preSelectedService?: string;
  preSelectedTherapistId?: string;
}

export default function BookingHub({ child, preSelectedService = 'onsite', preSelectedTherapistId = 'exp_ira' }: BookingHubProps) {
  const [serviceType, setServiceType] = useState<string>(preSelectedService);
  const [expertId, setExpertId] = useState<string>(preSelectedTherapistId);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 - 10:30');
  const [loading, setLoading] = useState(false);
  const [bookingsHistory, setBookingsHistory] = useState<Booking[]>([]);

  // Payment popup state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va'>('qris');
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [showWaNotification, setShowWaNotification] = useState<string | null>(null);

  const services = [
    { key: 'onsite', title: 'Onsite Klinik Tebet', desc: 'Asesmen langsung lengkap dengan fasilitas sensori & okupasi terlengkap.', icon: MapPin, price: 450000 },
    { key: 'telekonsultasi', title: 'Telekonsultasi Online', desc: 'Konsultasi video interaktif dengan Psikolog Klinis dari kenyamanan rumah.', icon: Video, price: 250000 },
    { key: 'home', title: 'Home Therapy Visit', desc: 'Terapis senior kami datang berkunjung untuk sesi stimulasi langsung di rumah.', icon: Home, price: 350000 },
  ];

  const timeSlots = [
    '09:00 - 10:30',
    '11:00 - 12:30',
    '14:00 - 15:30',
    '16:00 - 17:30'
  ];

  const getSelectedPrice = () => {
    return services.find(s => s.key === serviceType)?.price || 0;
  };

  const getSelectedServiceTitle = () => {
    return services.find(s => s.key === serviceType)?.title || '';
  };

  const getExpertInfo = (id: string): Expert | undefined => {
    return CLINICAL_EXPERTS.find(e => e.id === id);
  };

  const handleCreateBookingDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert('Mohon pilih tanggal kunjungan terlebih dahulu.');
      return;
    }

    // Prepare temporary draft booking
    const draft: Booking = {
      id: `bk_${Math.random().toString(36).substr(2, 9)}`,
      parentId: 'u_amanda',
      childId: child.id,
      serviceType: (serviceType === 'home' ? 'home_visit' : serviceType) as any,
      subService: getSelectedServiceTitle(),
      packageName: 'Sesi Tunggal (1 Jam)',
      therapistId: expertId,
      therapistName: CLINICAL_EXPERTS.find(e => e.id === expertId)?.name || 'Terapis',
      scheduledAt: `${date}T${timeSlot.split(' - ')[0]}:00.000Z`,
      status: 'pending',
      paymentStatus: 'unpaid',
      amount: getSelectedPrice(),
      midtransOrderId: 'FC-MID-' + Date.now(),
      bookingCode: 'FC-BK-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString()
    };

    setActiveBooking(draft);
    setShowPaymentModal(true);
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!activeBooking) return;
    setLoading(true);

    try {
      const response = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...activeBooking,
          paymentStatus: 'paid',
          status: 'confirmed'
        })
      });

      if (response.ok) {
        const confirmedBooking = await response.json();
        setBookingsHistory(prev => [...prev, confirmedBooking]);
        setShowPaymentModal(false);
        
        // Trigger simulated WhatsApp dispatch notification (F12)
        const expName = confirmedBooking.therapistName || 'Terapis';
        const formattedDate = confirmedBooking.scheduledAt.split('T')[0];
        setShowWaNotification(
          `Halo Bunda Amanda! Pembayaran booking *${confirmedBooking.subService}* senilai Rp${confirmedBooking.amount.toLocaleString('id-ID')} untuk si Kecil *${child.name}* telah BERHASIL diverifikasi. Jadwal: *${formattedDate}* bersama *${expName}*. Sampai jumpa di klinik! 🌱`
        );

        setTimeout(() => {
          setShowWaNotification(null);
        }, 10000); // hide notification after 10s
      }
    } catch (err) {
      console.error('Failed to book:', err);
    } finally {
      setLoading(false);
      setActiveBooking(null);
    }
  };

  return (
    <div className="w-full font-sans space-y-4">
      
      {/* WhatsApp simulated notification toast */}
      {showWaNotification && (
        <motion.div 
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm bg-emerald-600 border border-emerald-400 text-white p-3.5 rounded-2xl shadow-2xl flex items-start gap-3"
        >
          <Smartphone className="w-5 h-5 shrink-0 text-white fill-white animate-bounce mt-0.5" />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="text-[8px] font-black tracking-wider bg-emerald-800 text-white px-1.5 py-0.5 rounded w-fit uppercase">WhatsApp Konfirmasi Terkirim</div>
            <p className="text-[10px] font-bold leading-normal whitespace-pre-line">{showWaNotification}</p>
          </div>
          <button onClick={() => setShowWaNotification(null)} className="text-white/70 hover:text-white shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Mini info badge */}
      <div className="bg-orange-50/50 border border-orange-100/30 rounded-2xl p-3 flex gap-2.5 items-start shadow-xs">
        <Calendar className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold text-brand-brown/80 leading-relaxed">
          Booking Klinik: Jadwalkan sesi konsultasi klinis langsung dengan Dokter Anak, Psikolog Anak, atau Terapis FlourishCare untuk si Kecil {child.name}.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        
        {/* Left Col: Services Selector Form */}
        <form onSubmit={handleCreateBookingDraft} className="space-y-4">
          
          {/* Service Category Selection */}
          <div className="space-y-2">
            <span className="text-[9px] text-brand-brown/50 font-black tracking-wider px-0.5 uppercase">Pilih Layanan Konsultasi</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {services.map((serv) => {
                const IconComp = serv.icon;
                return (
                  <button
                    key={serv.key}
                    type="button"
                    onClick={() => setServiceType(serv.key)}
                    className={`p-3 rounded-2xl text-left border flex flex-col justify-between gap-3 transition-all shadow-xs ${
                      serviceType === serv.key
                        ? 'border-brand-orange bg-orange-50/15 ring-1 ring-brand-orange'
                        : 'border-orange-100/40 bg-white hover:bg-orange-50/10'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        serviceType === serv.key ? 'bg-orange-100 text-brand-orange' : 'bg-orange-50 text-brand-brown/40'
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <h4 className="font-extrabold text-[11px] text-brand-brown">{serv.title}</h4>
                      <p className="text-[9.5px] text-brand-brown/60 leading-normal font-bold">{serv.desc}</p>
                    </div>

                    <div className="text-[10px] font-black text-brand-orange pt-1.5 border-t border-orange-100/10 w-full">
                      Rp {serv.price.toLocaleString('id-ID')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expert / Doctor Select */}
          <div className="space-y-2">
            <span className="text-[9px] text-brand-brown/50 font-black tracking-wider px-0.5 uppercase">Pilih Dokter / Psikolog Anak</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CLINICAL_EXPERTS.map((exp) => (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => setExpertId(exp.id)}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    expertId === exp.id
                      ? 'border-brand-orange bg-orange-50/15 ring-1 ring-brand-orange'
                      : 'border-orange-100/40 bg-white hover:bg-orange-50/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 border border-orange-200/50 shrink-0">
                    <img 
                      src={exp.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200'} 
                      alt={exp.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-[10.5px] text-brand-brown leading-tight truncate">{exp.name}</h4>
                    <p className="text-[9.5px] text-brand-brown/50 font-bold">{exp.role}</p>
                    <p className="text-[8.5px] text-brand-orange font-black mt-0.5 tracking-wider uppercase">✓ {exp.clinic}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <span className="block text-[9px] text-brand-brown/50 font-black tracking-wider px-0.5 uppercase mb-1.5">Pilih Tanggal</span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-1.5 border border-orange-100/50 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-orange font-bold text-brand-brown text-[10.5px]"
              />
            </div>

            <div>
              <span className="block text-[9px] text-brand-brown/50 font-black tracking-wider px-0.5 uppercase mb-1.5">Pilih Jam Pertemuan</span>
              <div className="grid grid-cols-2 gap-1.5">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-1.5 px-2.5 rounded-xl text-[10px] font-black border text-center transition-colors cursor-pointer ${
                      timeSlot === slot
                        ? 'border-brand-orange bg-orange-50 text-brand-orange ring-1 ring-brand-orange'
                        : 'border-orange-100/40 bg-white text-brand-brown hover:bg-orange-50/10'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            type="submit"
            className="w-full bg-brand-orange hover:bg-brand-orange/95 text-white py-2.5 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
          >
            Lanjutkan Pembayaran Instan (Sandbox Midtrans) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Right Col: Booking Logs History */}
        <div className="space-y-2">
          <span className="text-[9px] text-brand-brown/50 font-black tracking-wider px-0.5 uppercase">
            Sesi Booking Saya ({bookingsHistory.length})
          </span>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {bookingsHistory.length === 0 ? (
              <div className="py-8 border border-dashed border-orange-100 bg-orange-50/10 rounded-2xl text-center space-y-1.5 text-brand-brown/40">
                <Calendar className="w-6 h-6 text-orange-200 mx-auto animate-pulse" />
                <h4 className="font-bold text-[10px]">Belum Ada Sesi Dipesan</h4>
                <p className="text-[9px] text-brand-brown/50 font-semibold">Jadwalkan konsultasi perdana Anda di formulir di atas!</p>
              </div>
            ) : (
              bookingsHistory.slice().reverse().map((b) => {
                const expert = b.therapistId ? getExpertInfo(b.therapistId) : undefined;
                return (
                  <div key={b.id} className="p-3 bg-white border border-orange-100/30 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-100/50 text-emerald-700 text-[8px] font-black rounded uppercase tracking-wider">
                        {b.serviceType}
                      </span>
                      <span className="text-[8.5px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 font-black uppercase tracking-wider">
                        ✓ Lunas
                      </span>
                    </div>

                    <div className="space-y-0.5 font-bold text-brand-brown">
                      <div className="text-[8px] text-brand-brown/40 font-black uppercase tracking-wider">PEMBIMBING:</div>
                      <div className="text-[10px] font-black text-brand-brown">{expert?.name || 'Spesialis'}</div>
                      <p className="text-[9.5px] text-brand-brown/50 font-semibold leading-relaxed">
                        Jadwal: {b.date} &bull; {b.timeSlot}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-orange-100/10 font-bold">
                      <span className="text-brand-brown/40">KODE BILL: {b.id.toUpperCase()}</span>
                      <span className="text-brand-orange font-black">Rp {b.amount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MIDTRANS SECURE SANDBOX OVERLAY POPUP MODAL                */}
      {/* ------------------------------------------------------------- */}
      {showPaymentModal && activeBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl border border-orange-50 font-sans"
          >
            {/* Midtrans top banner */}
            <div className="bg-[#1D212F] text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-[#00AFEF] rounded-full" />
                <span className="font-extrabold text-xs tracking-wide">Midtrans Sandbox</span>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Price section */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider">FlourishCare Order</span>
                <span className="text-[10px] font-black text-slate-700">{getSelectedServiceTitle()}</span>
              </div>
              <span className="text-xs font-black text-slate-800">
                Rp {activeBooking.amount.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div className="text-[9px] font-black text-slate-400 tracking-wider uppercase">PILIH METODE PEMBAYARAN</div>
              
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`py-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                    paymentMethod === 'qris'
                      ? 'border-brand-orange bg-orange-50/10 text-brand-orange ring-1 ring-brand-orange'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-brand-orange" />
                  <span className="text-[9px] font-black">QRIS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('va')}
                  className={`py-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                    paymentMethod === 'va'
                      ? 'border-brand-orange bg-orange-50/10 text-brand-orange ring-1 ring-brand-orange'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-brand-orange" />
                  <span className="text-[9px] font-black">Virtual Account</span>
                </button>
              </div>

              {/* simulated payment content */}
              {paymentMethod === 'qris' ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/50 flex flex-col items-center justify-center space-y-1">
                  <div className="w-24 h-24 bg-white rounded-lg border border-slate-200 p-1.5 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-800 rounded flex items-center justify-center text-white text-[8px] font-mono text-center leading-tight">
                      [QRIS CODE]
                    </div>
                  </div>
                  <span className="text-[8.5px] text-slate-400 font-bold text-center">Pindai QR menggunakan Gopay/OVO Anda.</span>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/50 space-y-0.5">
                  <span className="text-[8.5px] text-slate-400 block font-bold">Nomor Virtual Account</span>
                  <div className="text-xs font-mono font-black text-slate-800 tracking-wider">
                    88092 08123456789
                  </div>
                  <span className="text-[8.5px] text-slate-400 block font-bold">Simulasikan bayar dari m-banking.</span>
                </div>
              )}

              {/* Confirmation trigger */}
              <button
                type="button"
                onClick={handleSimulatePaymentSuccess}
                className="w-full bg-[#00AFEF] text-white py-2 rounded-xl font-black text-[10px] flex items-center justify-center gap-1 cursor-pointer"
              >
                Simulasikan Pembayaran Lunas
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
