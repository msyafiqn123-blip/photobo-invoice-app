import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Sparkles,
  MessageCircle,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { buildOrderWhatsAppMessage, encodeOrderData } from '../utils/order';
import { loadSettings } from '../services/storage';

const CustomerOrderView = () => {
  const settings = loadSettings();
  const packages = settings?.packages || [];
  const studioWhatsapp = settings?.whatsapp || '0811-1332-931';
  const cleanStudioPhone = studioWhatsapp.replace(/\D/g, '');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    date: '',
    timeStart: '10.00',
    timeEnd: '14.00',
    packageCode: packages[0]?.code || '03',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedWaUrl, setSubmittedWaUrl] = useState('');

  const selectedPkg =
    packages.find((p) => p.code === formData.packageCode) ||
    packages[0] || {
      code: '03',
      name: '4 Jam 2R',
      durationHours: 4,
      printType: 'Unlimited 2R',
      defaultPrice: 2500000,
    };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama pemesan wajib diisi';
    if (!formData.phone.trim()) errs.phone = 'Nomor WhatsApp wajib diisi';
    if (!formData.location.trim()) errs.location = 'Lokasi / venue acara wajib diisi';
    if (!formData.date.trim()) errs.date = 'Tanggal acara wajib dipilih';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const message = buildOrderWhatsAppMessage(formData, selectedPkg, studioWhatsapp);
    const waUrl = `https://wa.me/${cleanStudioPhone.startsWith('0') ? '62' + cleanStudioPhone.slice(1) : cleanStudioPhone}?text=${encodeURIComponent(message)}`;

    setSubmittedWaUrl(waUrl);
    setIsSubmitted(true);

    // Automatically open WhatsApp in new tab
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0D0E] text-stone-200 font-mulish py-6 px-3.5 sm:px-6 flex flex-col justify-between">
      <div className="max-w-xl mx-auto w-full space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-900 border border-stone-800 p-2 shadow-xl">
            <img
              src="/photobo_logo_white.png"
              alt="Photobo Studio"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black tracking-wider text-stone-100 uppercase">
              PHOTOBO STUDIO
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
              Formulir Reservasi & Pemesanan Layanan
            </p>
          </div>

          {/* Kontak WhatsApp Resmi */}
          <div className="pt-1">
            <a
              href={`https://wa.me/${cleanStudioPhone.startsWith('0') ? '62' + cleanStudioPhone.slice(1) : cleanStudioPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/60 transition shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Kontak WhatsApp Resmi: {studioWhatsapp}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {isSubmitted ? (
          /* Success Screen */
          <div className="bg-stone-900/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-100">
                Pesanan Berhasil Disiapkan!
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed max-w-md mx-auto">
                Konfirmasi pemesanan Anda telah dialihkan ke WhatsApp resmi Photobo Studio. Admin kami akan segera memeriksa ketersediaan jadwal dan menerbitkan invoice resmi untuk Anda.
              </p>
            </div>

            {/* Order Summary Recap */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-stone-800/60">
                <span className="text-stone-400">Nama Klien</span>
                <span className="font-bold text-stone-100">{formData.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800/60">
                <span className="text-stone-400">Nomor WhatsApp</span>
                <span className="font-mono text-stone-200">{formData.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800/60">
                <span className="text-stone-400">Tanggal Acara</span>
                <span className="font-bold text-amber-300">{formatDateIndo(formData.date)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800/60">
                <span className="text-stone-400">Paket Terpilih</span>
                <span className="font-bold text-stone-100">[{selectedPkg.code}] {selectedPkg.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-400">Total Harga Paket</span>
                <span className="font-mono font-bold text-emerald-400">{formatRupiah(selectedPkg.defaultPrice)}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <a
                href={submittedWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Buka Ulang Chat WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-stone-400 hover:text-stone-200 py-1 transition underline"
              >
                Ubah / Isi Formulir Baru
              </button>
            </div>
          </div>
        ) : (
          /* Order Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Data Pemesan */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider pb-1 border-b border-stone-800">
                <User className="w-4 h-4" />
                <span>1. Data Klien / Pemesan</span>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Nama Lengkap / Pasangan <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="cth: Vira Apriliani"
                  className={`w-full bg-stone-950 border ${
                    errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-800 focus:border-amber-500'
                  } rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition`}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Nomor WhatsApp Aktif <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="cth: 085724894972"
                    className={`w-full bg-stone-950 border ${
                      errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-800 focus:border-amber-500'
                    } rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-mono text-stone-100 placeholder-stone-600 focus:outline-none transition`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Lokasi / Venue Acara & Kota <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="cth: Gedung Puri Asri, Purwakarta"
                    className={`w-full bg-stone-950 border ${
                      errors.location ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-800 focus:border-amber-500'
                    } rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition`}
                  />
                </div>
                {errors.location && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.location}</span>
                  </p>
                )}
              </div>
            </div>

            {/* 2. Jadwal Acara */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider pb-1 border-b border-stone-800">
                <Calendar className="w-4 h-4" />
                <span>2. Jadwal Acara</span>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-semibold block mb-1">
                  Tanggal Pelaksanaan Acara <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={`w-full bg-stone-950 border ${
                    errors.date ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-800 focus:border-amber-500'
                  } rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none transition font-mono`}
                />
                {errors.date && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.date}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">
                    Jam Mulai Acara
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
                      <Clock className="w-3 h-3" />
                    </div>
                    <input
                      type="text"
                      value={formData.timeStart}
                      onChange={(e) => handleChange('timeStart', e.target.value)}
                      placeholder="10.00"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-2 py-2 text-xs font-mono text-center text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">
                    Jam Selesai Acara
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
                      <Clock className="w-3 h-3" />
                    </div>
                    <input
                      type="text"
                      value={formData.timeEnd}
                      onChange={(e) => handleChange('timeEnd', e.target.value)}
                      placeholder="14.00"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-2 py-2 text-xs font-mono text-center text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Pilihan Paket Photobooth */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider pb-1 border-b border-stone-800">
                <Sparkles className="w-4 h-4" />
                <span>3. Pilihan Paket Layanan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {packages.map((pkg) => {
                  const isSelected = formData.packageCode === pkg.code;
                  return (
                    <div
                      key={pkg.code}
                      onClick={() => handleChange('packageCode', pkg.code)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-stone-100 ring-1 ring-amber-500/50 shadow-md'
                          : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-stone-100 block">
                            [{pkg.code}] {pkg.name}
                          </span>
                          <span className="text-[11px] text-amber-300 font-semibold block mt-0.5">
                            {pkg.printType} • {pkg.durationHours} Jam Acara
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500 text-stone-950'
                              : 'border-stone-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-stone-500 uppercase">Tarif Paket</span>
                        <span className="font-mono font-black text-xs text-emerald-400">
                          {formatRupiah(pkg.defaultPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Catatan Tambahan */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xl">
              <label className="text-xs text-stone-300 font-semibold block">
                Catatan Tambahan / Request Khusus (Opsional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="cth: Request tema template foto, backdrop khusus, info akses venue..."
                rows={2}
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none transition resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition transform active:scale-98 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Konfirmasi Order ke WhatsApp</span>
              </button>
              <p className="text-[11px] text-stone-400 text-center mt-2 leading-relaxed">
                Pemesanan Anda akan diteruskan langsung ke WhatsApp resmi Photobo Studio untuk konfirmasi jadwal & invoice resmi.
              </p>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-stone-500 pt-6 pb-2">
        <p>© {new Date().getFullYear()} Photobo Studio. Hak Cipta Dilindungi.</p>
        <p className="mt-0.5">Layanan Pemesanan Resmi Photobooth Specialist</p>
      </div>
    </div>
  );
};

export default CustomerOrderView;
