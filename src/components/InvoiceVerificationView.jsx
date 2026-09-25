import React from 'react';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { getWhatsAppLink } from '../utils/whatsapp';
import {
  CheckCircle2,
  Clock,
  FileCheck,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Printer,
  Tag,
  Receipt,
  Check,
} from 'lucide-react';

const InvoiceVerificationView = ({ data }) => {
  if (!data) return null;

  const {
    invoiceCode = 'INV 01.08/I/03/26',
    clientName = 'Klien',
    clientPhone = '',
    clientLocation = '',
    eventDate = '',
    packageName = 'Photobooth 4 Hours',
    printType = '',
    packagePrice = 0,
    discounts = 0,
    additionals = 0,
    grandTotal = 0,
    totalPaid = 0,
    remainingBalance = 0,
    status = 'LUNAS',
    accountNumber = 'BCA 7045166686 a.n. Sasiera Diva P',
    invoiceDate = '',
    isLunas = false,
  } = data;

  const isDpOnly = !isLunas && totalPaid > 0 && remainingBalance > 0;
  const isPendingFull = !isLunas && totalPaid === 0;

  // Smart fallback for print type (e.g. Unlimited 2R / 4R / Strip)
  const finalPrintType =
    printType ||
    (packageName?.toLowerCase().includes('4r')
      ? 'Unlimited 4R'
      : packageName?.toLowerCase().includes('strip')
      ? 'Unlimited Strip'
      : 'Unlimited 2R');

  // Smart fallback for package price
  const finalPackagePrice =
    packagePrice > 0
      ? packagePrice
      : grandTotal > 0
      ? Math.max(grandTotal, grandTotal + discounts - additionals)
      : 2500000;

  // WhatsApp message for customer inquiry
  const waMsg = `Halo Photobo Studio, saya sedang melihat verifikasi invoice *${invoiceCode}* a.n. *${clientName}*. Status: ${
    isLunas ? 'LUNAS' : `Sisa Tagihan Rp ${remainingBalance.toLocaleString('id-ID')}`
  }.`;
  const waUrl = getWhatsAppLink('0811-1332-931', waMsg);

  return (
    <div className="min-h-screen bg-[#0F0D0E] text-stone-200 flex flex-col font-mulish py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 p-2 shadow-xl">
            <img
              src="/photobo_logo_white.png"
              alt="Photobo Studio"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-wider text-stone-100 uppercase">
            PHOTOBO STUDIO
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verifikasi Pembayaran Resmi</span>
          </div>
        </div>

        {/* Status Hero Card */}
        <div
          className={`rounded-3xl p-6 sm:p-7 border shadow-2xl text-center space-y-4 ${
            isLunas
              ? 'bg-gradient-to-b from-emerald-950/60 to-stone-950 border-emerald-500/40 text-emerald-300'
              : isDpOnly
              ? 'bg-gradient-to-b from-blue-950/60 to-stone-950 border-blue-500/40 text-blue-300'
              : 'bg-gradient-to-b from-amber-950/60 to-stone-950 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex justify-center">
            {isLunas ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center animate-pulse">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>
            ) : isDpOnly ? (
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                <FileCheck className="w-9 h-9 text-blue-400" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                <Clock className="w-9 h-9 text-amber-400" />
              </div>
            )}
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400 block mb-1">
              STATUS TRANSAKSI
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-wide">
              {isLunas
                ? 'LUNAS 100%'
                : isDpOnly
                ? 'DOWN PAYMENT DITERIMA'
                : 'TAGIHAN PELUNASAN'}
            </div>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-md mx-auto leading-relaxed">
              {isLunas
                ? 'Seluruh tagihan untuk jadwal acara ini telah lunas dan terverifikasi secara sah di Photobo Studio.'
                : isDpOnly
                ? 'Pembayaran uang muka (DP) telah diterima. Sisa pembayaran wajib diselesaikan maksimal H-1 tanggal acara.'
                : 'Menjelang hari pelaksanaan, mohon lakukan pelunasan ke rekening resmi Photobo Studio.'}
            </p>
          </div>

          {/* Ringkasan Finansial 3 Kolom */}
          <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-stone-400 font-semibold block uppercase">
                Total Tagihan
              </span>
              <span className="text-xs sm:text-base font-black font-mono text-stone-100 block mt-0.5">
                {formatRupiah(grandTotal)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-semibold block uppercase">
                Telah Masuk
              </span>
              <span className="text-xs sm:text-base font-black font-mono text-emerald-400 block mt-0.5">
                {formatRupiah(totalPaid)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-semibold block uppercase">
                Sisa Tagihan
              </span>
              <span
                className={`text-xs sm:text-base font-black font-mono block mt-0.5 ${
                  isLunas ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isLunas ? 'Rp 0 (LUNAS)' : formatRupiah(remainingBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Information Card */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-stone-800">
            <Sparkles className="w-4 h-4" />
            <span>Rincian Dokumen & Layanan Resmi</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-stone-800/60">
              <span className="text-stone-400">Nomor Invoice</span>
              <span className="font-mono font-black text-amber-300 select-all">
                {invoiceCode}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-stone-800/60">
              <span className="text-stone-400">Nama Klien</span>
              <span className="font-bold text-stone-100 uppercase">
                {clientName}
              </span>
            </div>

            {clientPhone && (
              <div className="flex justify-between py-1 border-b border-stone-800/60">
                <span className="text-stone-400">WhatsApp Klien</span>
                <span className="font-mono text-stone-300">{clientPhone}</span>
              </div>
            )}

            {clientLocation && (
              <div className="flex justify-between py-1 border-b border-stone-800/60">
                <span className="text-stone-400">Lokasi Acara</span>
                <span className="text-stone-300 text-right">{clientLocation}</span>
              </div>
            )}

            {eventDate && (
              <div className="flex justify-between py-1 border-b border-stone-800/60">
                <span className="text-stone-400">Tanggal Pelaksanaan</span>
                <span className="font-bold text-stone-100">
                  {formatDateIndo(eventDate)}
                </span>
              </div>
            )}

            {/* Paket Layanan */}
            <div className="flex justify-between py-1 border-b border-stone-800/60">
              <span className="text-stone-400">Paket Layanan</span>
              <span className="font-bold text-amber-300 text-right">
                {packageName || 'Photobooth'}
              </span>
            </div>

            {/* Detail Format / Ukuran Cetak */}
            <div className="flex justify-between items-center py-1.5 border-b border-stone-800/60">
              <span className="text-stone-400 flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Detail Format Cetak</span>
              </span>
              <span className="font-extrabold text-stone-100 bg-stone-800 px-3 py-1 rounded-lg border border-stone-700 text-right tracking-wide">
                {finalPrintType}
              </span>
            </div>

            {/* Rincian Biaya & Pembayaran */}
            <div className="pt-2 pb-1 text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-stone-400" />
              <span>Rincian Biaya & Pembayaran</span>
            </div>

            {/* Harga Paket Layanan */}
            <div className="flex justify-between py-1 border-b border-stone-800/60 pl-2">
              <span className="text-stone-400">Harga Paket</span>
              <span className="font-mono font-bold text-stone-200">
                {formatRupiah(finalPackagePrice)}
              </span>
            </div>

            {/* Biaya Tambahan (jika ada) */}
            {additionals > 0 && (
              <div className="flex justify-between py-1 border-b border-stone-800/60 pl-2">
                <span className="text-stone-400">Biaya Tambahan / Transport</span>
                <span className="font-mono font-bold text-stone-300">
                  + {formatRupiah(additionals)}
                </span>
              </div>
            )}

            {/* Diskon / Potongan Harga */}
            <div className="flex justify-between py-1 border-b border-stone-800/60 pl-2">
              <span className="text-stone-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-stone-400" />
                <span>Diskon / Promo</span>
              </span>
              <span
                className={`font-mono font-bold ${
                  discounts > 0 ? 'text-emerald-400' : 'text-stone-400'
                }`}
              >
                {discounts > 0 ? `- ${formatRupiah(discounts)}` : 'Rp 0'}
              </span>
            </div>

            {/* Total Tagihan Acara */}
            <div className="flex justify-between py-1.5 border-b border-stone-800/60 bg-stone-950/60 px-3 rounded-xl">
              <span className="text-stone-200 font-bold">Total Tagihan Acara</span>
              <span className="font-mono font-black text-amber-300 text-sm sm:text-base">
                {formatRupiah(grandTotal)}
              </span>
            </div>

            {/* Pembayaran Telah Masuk (Sudah Dibayar) */}
            <div className="flex justify-between py-1.5 border-b border-stone-800/60 bg-emerald-950/25 border border-emerald-500/20 px-3 rounded-xl">
              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pembayaran Telah Masuk</span>
              </span>
              <span className="font-mono font-black text-emerald-400 text-sm sm:text-base">
                {formatRupiah(totalPaid)}
              </span>
            </div>

            {/* Sisa Pembayaran */}
            <div className="flex justify-between py-1.5 border-b border-stone-800/60 px-3 rounded-xl">
              <span className="text-stone-200 font-bold">Sisa Pembayaran</span>
              <span
                className={`font-mono font-black text-sm sm:text-base ${
                  isLunas ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isLunas ? 'Rp 0 (LUNAS)' : formatRupiah(remainingBalance)}
              </span>
            </div>

            {/* Rekening Resmi */}
            <div className="flex justify-between py-1 pt-2">
              <span className="text-stone-400">Rekening Resmi Studio</span>
              <span className="font-semibold text-stone-300 text-right">
                {accountNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Only WhatsApp Confirmation for Customer */}
        <div className="space-y-3 pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition transform active:scale-98"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Konfirmasi ke WhatsApp Photobo Studio</span>
          </a>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-stone-500 pt-2">
          <p>© {new Date().getFullYear()} Photobo Studio. Hak Cipta Dilindungi.</p>
          <p className="mt-0.5">Dokumen ini merupakan verifikasi digital resmi yang terenkripsi.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceVerificationView;
