import React, { forwardRef } from 'react';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

const InvoicePreview = forwardRef(({ invoice, settings, scale = 1 }, ref) => {
  if (!invoice) return null;

  const {
    invoiceCode = 'INV 01.08/I/03/26',
    invoiceDate = '2026-01-11',
    docType = 'TAGIHAN_PELUNASAN',
    client = {},
    items = [],
    summary = {},
    paymentMethod,
    accountNumber,
    accountHolder,
    hasStamp = true,
  } = invoice;

  const studioSettings = settings || {};
  const instagramHandle = studioSettings.instagram || '@Photobo_Studio';
  const whatsappNumber = studioSettings.whatsapp || '0811-1332-931';
  const termsList = studioSettings.terms || [
    'Down Payment minimal 20% dari Harga untuk booking jadwal',
    'Pelunasan Maksimal H-1 Tanggal Pelaksanaan',
  ];

  const finalPaymentMethod =
    paymentMethod || studioSettings.bankMethodLabel || `${studioSettings.bankName || 'BCA'} TRANSFER`;
  const finalAccountNumber =
    accountNumber || `${studioSettings.bankName || 'BCA'} ${studioSettings.bankAccountNumber || '7045166686'}`;
  const finalAccountHolder =
    accountHolder || studioSettings.bankAccountHolder || 'Sasiera Diva P';

  // Document labels based on docType
  const getDocTypeHeader = () => {
    switch (docType) {
      case 'TAGIHAN_DP':
        return {
          title: 'TAGIHAN BOOKING FEE',
          recipientLabel: 'DITAGIHKAN KEPADA',
          note: 'Mohon lakukan pembayaran Booking Fee untuk konfirmasi jadwal.',
          showStamp: false,
        };
      case 'TAGIHAN_PELUNASAN':
        return {
          title: 'NOTA PEMBAYARAN',
          recipientLabel: 'TELAH DITERIMA PEMBAYARAN DARI',
          note: studioSettings.validityNote || 'Invoice ini adalah bukti pembayaran yang sah',
          showStamp: false,
        };
      case 'BUKTI_LUNAS':
        return {
          title: 'NOTA PEMBAYARAN',
          recipientLabel: 'TELAH DITERIMA PEMBAYARAN DARI',
          note: studioSettings.validityNote || 'Invoice ini adalah bukti pembayaran yang sah',
          showStamp: hasStamp !== false,
          isLunas: true,
        };
      case 'BUKTI_DP':
      default:
        return {
          title: 'NOTA PEMBAYARAN',
          recipientLabel: 'TELAH DITERIMA PEMBAYARAN DARI',
          note: studioSettings.validityNote || 'Invoice ini adalah bukti pembayaran yang sah',
          showStamp: hasStamp !== false,
        };
    }
  };

  const docConfig = getDocTypeHeader();
  const isLunas =
    docConfig.isLunas ||
    docType === 'BUKTI_LUNAS' ||
    (summary.remainingBalance !== undefined && Number(summary.remainingBalance) === 0);

  return (
    <div
      ref={ref}
      id="invoice-document"
      className="invoice-print-container relative bg-[#C1B6A4] text-black font-mulish select-none shadow-2xl"
      style={{
        width: '794px',
        minWidth: '794px',
        maxWidth: '794px',
        height: '1123px',
        minHeight: '1123px',
        maxHeight: '1123px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
      }}
    >
      {/* 1. Background Vector Architecture Matching Authentic Canva Template */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 794 1123"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Full Taupe Border Base #C1B6A4 */}
        <rect width="794" height="1123" fill="#C1B6A4" />

        {/* Top Pitch Dark Header #160C10 */}
        <rect width="794" height="200" fill="#160C10" />

        {/* The Signature Canva Asymmetrical Scooped Cream Card #EFE7DA */}
        {/* Left tab extends higher up to y=80 with 'INVOICE', then smoothly scoops down to y=182 under the camera logo */}
        <path
          d="
            M 52 80
            L 360 80
            C 385 80, 395 105, 402 135
            C 408 165, 415 182, 436 182
            L 742 182
            A 28 28 0 0 1 770 210
            L 770 1067
            A 28 28 0 0 1 742 1095
            L 52 1095
            A 28 28 0 0 1 24 1067
            L 24 108
            A 28 28 0 0 1 52 80
            Z
          "
          fill="#EFE7DA"
        />
      </svg>

      {/* 2. Top Right PHOTOBO Camera Logo (Bold & Beautifully Proportioned) */}
      <div className="absolute top-[-6px] right-[48px] z-10">
        <img
          src="/photobo_logo_white.png"
          alt="Photobo Logo"
          className="w-[210px] h-auto object-contain"
        />
      </div>

      {/* 3. Foreground Document Content */}
      <div
        className="relative z-10 flex flex-col justify-between"
        style={{
          width: '794px',
          height: '1123px',
          padding: '96px 54px 64px 54px',
          boxSizing: 'border-box',
        }}
      >
        {/* UPPER SECTION */}
        <div>
          {/* Header Row: Big Bold INVOICE Serif Title in the raised left tab */}
          <div className="pb-3">
            <h1
              className="text-[56px] font-black tracking-[0.05em] text-[#160C10] leading-none"
              style={{ fontFamily: '"Bodoni Moda", "Playfair Display", Georgia, serif' }}
            >
              INVOICE
            </h1>
          </div>

          {/* Metadata 2 Columns Grid */}
          <div className="grid grid-cols-2 gap-6 pt-3 pb-4">
            {/* Left Column: Nota Title, Code, Date */}
            <div>
              <div className="font-black text-[16px] tracking-wide uppercase text-black">
                {docConfig.title}
              </div>
              <div className="text-black font-bold text-[14.5px] tracking-wide mt-1">
                {invoiceCode}
              </div>
              <div className="text-black font-semibold text-[14px] mt-0.5">
                {formatDateIndo(invoiceDate)}
              </div>
            </div>

            {/* Right Column: Client Information (Right Aligned, gracefully placed inside cream card) */}
            <div className="text-right pt-[34px]">
              <div className="font-bold tracking-wider uppercase text-black text-[13px]">
                {docConfig.recipientLabel}
              </div>
              <div className="font-black text-[18px] tracking-wide text-black uppercase mt-0.5 truncate">
                {client.name || 'NAMA KLIEN'}
              </div>
              <div className="text-black font-semibold text-[14px] mt-0.5">
                {client.phone || '08XX-XXXX-XXXX'}
              </div>
              <div className="text-black font-medium text-[14px] mt-0.5 truncate">
                {client.location || 'Kota, Provinsi'}
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="mt-1">
            {/* Table Header Row: Prominent Pitch Black Bar */}
            <div className="bg-[#160C10] text-white flex items-center px-4 py-2 rounded-[5px] h-[48px] text-[13px] font-black tracking-wider shadow-sm">
              <div className="w-[44%] text-left pl-3">DESKRIPSI</div>
              <div className="w-[18%] text-center">HARGA</div>
              <div className="w-[19%] text-center leading-tight text-[11.5px]">
                <div>JENIS</div>
                <div>PEMBAYARAN</div>
              </div>
              <div className="w-[19%] text-center leading-tight text-[11.5px]">
                <div>TOTAL</div>
                <div>PEMBAYARAN</div>
              </div>
            </div>

            {/* Table Body Rows */}
            <div className="divide-y divide-black/75">
              {items && items.length > 0 ? (
                items.map((item, index) => {
                  const descLines = (item.description || '').split('\n');
                  const mainTitle = descLines[0] || '';
                  const subLines = descLines.slice(1);

                  return (
                    <div
                      key={item.id || index}
                      className="flex items-center px-4 py-3.5 text-[14px] leading-tight"
                    >
                      {/* Deskripsi */}
                      <div className="w-[44%] pl-3 pr-2">
                        <div className="font-extrabold text-black text-[15px] tracking-wide">
                          {mainTitle}
                        </div>
                        {subLines.length > 0 && (
                          <div className="text-black/90 font-semibold text-[13.5px] mt-1 space-y-0.5 leading-snug">
                            {subLines.map((line, lIdx) => (
                              <div key={lIdx}>{line}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Harga */}
                      <div className="w-[18%] text-center font-bold text-black text-[15px]">
                        {formatRupiah(item.price)}
                      </div>

                      {/* Jenis Pembayaran */}
                      <div className="w-[19%] text-center font-normal tracking-wider uppercase text-black text-[13px]">
                        {item.paymentType}
                      </div>

                      {/* Total Pembayaran */}
                      <div className="w-[19%] text-right pr-4 font-bold text-black text-[15px]">
                        {formatRupiah(item.amountPaid)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-black/50 italic text-[14px]">
                  Belum ada item transaksi
                </div>
              )}
            </div>

            {/* Solid Black Separator Line */}
            <div className="w-full h-[2px] bg-black my-2"></div>

            {/* Summary Rows (Prominent & Balanced) */}
            <div className="py-1 space-y-2 text-[15.5px]">
              <div className="flex justify-between items-center font-black tracking-wide">
                <span className="text-black pl-3">TOTAL PEMBAYARAN</span>
                <span className="text-black text-right pr-4">
                  {formatRupiah(summary.totalPaidSoFar ?? summary.grandTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center font-black tracking-wide">
                <span className="text-black pl-3">SISA PEMBAYARAN</span>
                <span className="text-black text-right pr-4">
                  {formatRupiah(summary.remainingBalance ?? 0)}
                </span>
              </div>

              {/* Status Lunas dibawah Sisa Pembayaran */}
              {isLunas && (
                <div className="flex justify-end pr-4 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-black tracking-widest px-3 py-1 rounded-full bg-[#065F46] text-white uppercase shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    LUNAS / PAID
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOWER SECTION */}
        <div className="relative pt-2">
          {/* Metode Pembayaran & Nomor Rekening */}
          <div className="flex justify-between items-start pt-1">
            <div>
              <div className="font-black tracking-wider text-black uppercase text-[13.5px]">
                METODE PEMBAYARAN :
              </div>
              <div className="font-black text-black mt-1 tracking-wider uppercase text-[15.5px]">
                {finalPaymentMethod}
              </div>
            </div>

            <div className="text-right pr-3">
              <div className="font-extrabold tracking-wide text-black text-[13.5px]">
                Nomor Rekening
              </div>
              <div className="font-black text-[17.5px] text-black tracking-wider mt-0.5">
                {finalAccountNumber}
              </div>
              <div className="font-bold text-black text-[15px] mt-0.5">
                {finalAccountHolder}
              </div>
            </div>
          </div>

          {/* Syarat dan Ketentuan Pembayaran */}
          <div className="mt-3 text-[12px] leading-relaxed">
            <div className="font-black tracking-wide uppercase text-black text-[13px] mb-1">
              SYARAT DAN KETENTUAN PEMBAYARAN
            </div>
            <div className="space-y-0.5 font-semibold text-black/90 max-w-[520px]">
              {termsList.map((term, i) => (
                <div key={i}>
                  {term.startsWith('1.') || term.startsWith('2.') ? term : `${i + 1}.${term}`}
                </div>
              ))}
            </div>
          </div>

          {/* Official Stamp - Natural angle with centered Photobo text */}
          {docConfig.showStamp && (
            <div
              className="absolute right-[30px] bottom-[34px] pointer-events-none"
              style={{
                filter: 'drop-shadow(0 3px 6px rgba(217, 27, 36, 0.2))',
              }}
            >
              <img
                src="/photobo_stamp.svg"
                alt="Photobo Stamp"
                className="w-[140px] h-auto object-contain opacity-95"
              />
            </div>
          )}

          {/* Validity Statement */}
          <div className="mt-2.5 text-[12.5px] italic font-bold text-black">
            {docConfig.note}
          </div>

          {/* Social Icons & Contacts Footer */}
          <div className="mt-2.5 pt-2.5 flex items-center gap-8 text-[13.5px] font-bold text-black border-t border-black/25">
            {/* Instagram */}
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span>{instagramHandle}</span>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{whatsappNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;
