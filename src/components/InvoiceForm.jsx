import React, { useEffect, useState } from 'react';
import {
  generateInvoiceCode,
  PACKAGE_OPTIONS,
} from '../utils/invoiceCode';
import { formatDateIndo } from '../utils/formatters';
import CalendarPicker from './CalendarPicker';
import FormattedNumberInput from './FormattedNumberInput';
import {
  Plus,
  Trash2,
  Percent,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard,
  Hash,
  Sparkles,
  Lock,
  Edit3,
} from 'lucide-react';

const DOC_TYPES = [
  { id: 'TAGIHAN_DP', label: 'Tagihan DP', badge: 'Draft Tagihan' },
  { id: 'BUKTI_DP', label: 'Bukti Bayar DP', badge: 'Stempel Aktif' },
  { id: 'TAGIHAN_PELUNASAN', label: 'Tagihan Pelunasan', badge: 'Menjelang Hari H' },
  { id: 'BUKTI_LUNAS', label: 'Bukti Lunas', badge: 'Lunas 100%' },
];

const InvoiceForm = ({ invoice, onChange, onSave, onReset, isSaving, onViewPdf }) => {
  const [manualOverride, setManualOverride] = useState(false);

  // Helper to re-derive the automatic invoice code
  const getAutoCode = (inv) => {
    const isLunas = inv.docType === 'BUKTI_LUNAS' || inv.docType === 'TAGIHAN_PELUNASAN';
    const stageCode = isLunas ? '02' : '01';
    const dateVal = inv.invoiceDate || new Date();
    const pkgCode = inv.packageCode || '03';
    const sequenceNumber = inv.sequenceNumber || '08';

    return generateInvoiceCode({
      stageCode,
      sequenceNumber,
      invoiceDate: dateVal,
      packageCode: pkgCode,
    });
  };

  // Change sequence number (BB)
  const handleSequenceChange = (newSeq) => {
    const num = parseInt(newSeq, 10);
    const validNum = isNaN(num) ? 8 : Math.max(1, Math.min(99, num));
    const padded = String(validNum).padStart(2, '0');
    const updated = {
      ...invoice,
      sequenceNumber: padded,
    };
    recalculateSummary(updated);
  };

  // Sync package changes with item-1 and auto-generate invoice code
  const handlePackageChange = (packageCode) => {
    const pkg = PACKAGE_OPTIONS.find((p) => p.code === packageCode);
    if (!pkg) return;

    const eventDate = invoice.event?.date ? formatDateIndo(invoice.event.date) : 'Tanggal Acara';
    const timeRange = `${invoice.event?.timeStart || '10.00'} - ${invoice.event?.timeEnd || '14.00'}`;

    const formattedDesc = `${pkg.name.startsWith('Photobooth') ? pkg.name : `Photobooth ${pkg.durationHours} Hours`}\n${pkg.printType}\n${eventDate}\n${timeRange}`;

    // Calculate default 20% DP
    const dpAmount = Math.round(pkg.defaultPrice * 0.2);

    const updatedItems = [...(invoice.items || [])];
    if (updatedItems.length > 0) {
      updatedItems[0] = {
        ...updatedItems[0],
        description: formattedDesc,
        price: pkg.defaultPrice,
        amountPaid: invoice.docType === 'BUKTI_LUNAS' ? pkg.defaultPrice : dpAmount,
      };
    } else {
      updatedItems.push({
        id: 'item-1',
        description: formattedDesc,
        price: pkg.defaultPrice,
        paymentType: 'DOWN PAYMENT',
        amountPaid: dpAmount,
      });
    }

    const newInvoice = {
      ...invoice,
      packageCode,
      event: {
        ...invoice.event,
        packageName: `Photobooth ${pkg.durationHours} Hours`,
        durationHours: pkg.durationHours,
        printType: pkg.printType,
      },
      items: updatedItems,
    };

    recalculateSummary(newInvoice);
  };

  // Recalculate summary totals and automatically update invoice code
  const recalculateSummary = (inv) => {
    const items = inv.items || [];
    let pkgPrice = 0;
    let additionals = 0;
    let discounts = 0;
    let dpPaid = 0;
    let additionalsPaid = 0;

    items.forEach((item, index) => {
      const price = Number(item.price) || 0;
      const paid = Number(item.amountPaid) || 0;

      if (index === 0) {
        pkgPrice = Math.abs(price);
        dpPaid = Math.abs(paid);
      } else if (item.paymentType === 'ADDITIONAL') {
        additionals += Math.abs(price);
        additionalsPaid += Math.abs(paid);
      } else if (item.paymentType === 'DISCOUNT') {
        discounts += Math.abs(price);
      } else {
        if (price < 0) {
          discounts += Math.abs(price);
        } else {
          additionals += Math.abs(price);
          additionalsPaid += Math.abs(paid);
        }
      }
    });

    const grandTotal = Math.max(0, pkgPrice + additionals - discounts);

    let totalPaidSoFar = 0;
    let remainingBalance = 0;

    if (inv.docType === 'BUKTI_LUNAS') {
      totalPaidSoFar = grandTotal;
      remainingBalance = 0;
    } else {
      // For TAGIHAN_PELUNASAN, BUKTI_DP, and TAGIHAN_DP:
      // totalPaidSoFar is the total payment/DP entered by the user
      totalPaidSoFar = Math.min(grandTotal, dpPaid + additionalsPaid);
      remainingBalance = Math.max(0, grandTotal - totalPaidSoFar);
    }

    const isLunas = inv.docType === 'BUKTI_LUNAS' || inv.docType === 'TAGIHAN_PELUNASAN';
    const stageCode = isLunas ? '02' : '01';
    const seqNum = inv.sequenceNumber || '08';

    // ALWAYS AUTO-GENERATE invoice code unless manual override is explicitly turned on
    let code = inv.invoiceCode;
    if (!manualOverride) {
      code = generateInvoiceCode({
        stageCode,
        sequenceNumber: seqNum,
        invoiceDate: inv.invoiceDate || new Date(),
        packageCode: inv.packageCode || '03',
      });
    }

    const updated = {
      ...inv,
      invoiceCode: code,
      stageCode,
      sequenceNumber: seqNum,
      paymentMethod: 'BCA TRANSFER',
      accountNumber: 'BCA 7045166686',
      accountHolder: 'Sasiera Diva P',
      summary: {
        totalPackagePrice: pkgPrice,
        totalAdditionals: additionals,
        totalDiscounts: discounts,
        grandTotal,
        downPaymentPaid: dpPaid,
        totalPaidSoFar,
        remainingBalance,
      },
    };

    onChange(updated);
  };

  // Change Document Type
  const handleDocTypeChange = (type) => {
    const isLunas = type === 'BUKTI_LUNAS' || type === 'TAGIHAN_PELUNASAN';
    const isTagihan = type === 'TAGIHAN_DP' || type === 'TAGIHAN_PELUNASAN';
    const stageCode = isLunas ? '02' : '01';

    let updatedItems = [...(invoice.items || [])];
    if (type === 'BUKTI_LUNAS') {
      if (updatedItems.length > 0) {
        updatedItems[0] = {
          ...updatedItems[0],
          paymentType: 'PELUNASAN',
          amountPaid: updatedItems[0].price,
        };
      }
    } else if (updatedItems.length > 0 && updatedItems[0].paymentType === 'PELUNASAN') {
      updatedItems[0] = {
        ...updatedItems[0],
        paymentType: 'DOWN PAYMENT',
        amountPaid: Math.round(updatedItems[0].price * 0.2),
      };
    }

    const updated = {
      ...invoice,
      docType: type,
      stageCode,
      sequenceNumber: invoice.sequenceNumber || '08',
      paymentMethod: 'BCA TRANSFER',
      accountNumber: 'BCA 7045166686',
      accountHolder: 'Sasiera Diva P',
      hasStamp: !isTagihan,
      items: updatedItems,
    };

    recalculateSummary(updated);
  };

  // Sync event date and time into item 1 description
  const handleEventChange = (field, value) => {
    const newEvent = { ...invoice.event, [field]: value };
    const eventDate = newEvent.date ? formatDateIndo(newEvent.date) : 'Tanggal Acara';
    const timeRange = `${newEvent.timeStart || '10.00'} - ${newEvent.timeEnd || '14.00'}`;

    const pkg = PACKAGE_OPTIONS.find((p) => p.code === invoice.packageCode) || PACKAGE_OPTIONS[2];
    const formattedDesc = `${newEvent.packageName || pkg.name}\n${newEvent.printType || pkg.printType}\n${eventDate}\n${timeRange}`;

    const items = [...(invoice.items || [])];
    if (items.length > 0) {
      items[0] = { ...items[0], description: formattedDesc };
    }

    onChange({
      ...invoice,
      event: newEvent,
      items,
    });
  };

  // Item modifications
  const handleItemChange = (index, field, value) => {
    const items = [...(invoice.items || [])];
    items[index] = { ...items[index], [field]: value };
    recalculateSummary({ ...invoice, items });
  };

  const handleAddItem = (type = 'ADDITIONAL') => {
    const items = [...(invoice.items || [])];
    if (type === 'ADDITIONAL') {
      items.push({
        id: `item-${Date.now()}`,
        description: 'Transportasi',
        price: 150000,
        paymentType: 'ADDITIONAL',
        amountPaid: 150000,
      });
    } else {
      items.push({
        id: `item-${Date.now()}`,
        description: 'Promo 2026\nBooking s.d 31 Jan 2026',
        price: -300000,
        paymentType: 'DISCOUNT',
        amountPaid: -300000,
      });
    }
    recalculateSummary({ ...invoice, items });
  };

  const handleRemoveItem = (index) => {
    if (index === 0) return;
    const items = invoice.items.filter((_, i) => i !== index);
    recalculateSummary({ ...invoice, items });
  };

  const currentPkg = PACKAGE_OPTIONS.find((p) => p.code === invoice.packageCode) || PACKAGE_OPTIONS[2];

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-5 text-stone-200">
      {/* 1. Mode Dokumen Switcher */}
      <div>
        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
          Pilih Status Dokumen (1-Klik Switch)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DOC_TYPES.map((dt) => {
            const active = invoice.docType === dt.id;
            return (
              <button
                key={dt.id}
                type="button"
                onClick={() => handleDocTypeChange(dt.id)}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                  active
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-950/40 ring-1 ring-amber-500'
                    : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold">{dt.label}</span>
                <span className="text-[10px] opacity-75 mt-0.5">{dt.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PILIHAN PAKET PHOTOBOOTH (DD) - BERADA TEPAT DI ATAS NOMOR INVOICE */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Pilihan Paket Photobooth (Kode DD)</span>
          </div>
          <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
            Otomatis Memperbarui DD & Total Nota
          </span>
        </div>

        <div>
          <label className="text-[11px] text-stone-400 font-medium block mb-1.5">
            Pilih Paket Layanan:
          </label>
          <select
            value={invoice.packageCode || '03'}
            onChange={(e) => handlePackageChange(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700 hover:border-amber-500/50 text-stone-100 font-bold text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500 transition shadow-inner cursor-pointer"
          >
            {PACKAGE_OPTIONS.map((pkg) => (
              <option key={pkg.code} value={pkg.code} className="bg-stone-900 py-1">
                [{pkg.code}] {pkg.name} — Rp {pkg.defaultPrice.toLocaleString('id-ID')} ({pkg.printType})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Badge Details for the Selected Package */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-2">
            <span className="text-[10px] text-stone-400 block font-medium">Durasi</span>
            <strong className="text-xs font-bold text-stone-100">{currentPkg.durationHours} Jam Acara</strong>
          </div>
          <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-2">
            <span className="text-[10px] text-stone-400 block font-medium">Cetak Cetakan</span>
            <strong className="text-xs font-bold text-amber-300">{currentPkg.printType}</strong>
          </div>
          <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-2">
            <span className="text-[10px] text-stone-400 block font-medium">Harga Dasar</span>
            <strong className="text-xs font-mono font-bold text-emerald-400">
              Rp {currentPkg.defaultPrice.toLocaleString('id-ID')}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. NOMOR INVOICE 100% OTOMATIS */}
      <div className="bg-gradient-to-br from-amber-500/10 via-stone-950 to-stone-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-inner">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Hash className="w-4 h-4 text-amber-400" />
            <span>Nomor Invoice Otomatis</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              <Lock className="w-2.5 h-2.5" />
              OTOMATIS SISTEM
            </span>
            <button
              type="button"
              onClick={() => setManualOverride(!manualOverride)}
              className="text-[10px] text-stone-500 hover:text-stone-300 flex items-center gap-1 underline ml-1"
              title="Kustomisasi jika diperlukan"
            >
              <Edit3 className="w-2.5 h-2.5" />
              <span>{manualOverride ? 'Kunci Otomatis' : 'Edit'}</span>
            </button>
          </div>
        </div>

        {/* Big Prominent Invoice Code Display */}
        {manualOverride ? (
          <input
            type="text"
            value={invoice.invoiceCode || ''}
            onChange={(e) => onChange({ ...invoice, invoiceCode: e.target.value })}
            className="w-full bg-stone-900 border border-amber-500 font-mono font-black text-amber-300 text-lg rounded-xl px-3 py-2 focus:outline-none"
          />
        ) : (
          <div className="bg-stone-950/90 border border-stone-800 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <span className="font-mono font-black text-amber-300 text-lg sm:text-xl tracking-wider select-all">
              {invoice.invoiceCode || 'INV 01.08/I/03/26'}
            </span>
            <span className="text-[10px] text-stone-500 font-mono">
              AA.BB/CC/DD/YY
            </span>
          </div>
        )}

        {/* Formula breakdown tags */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
          <div className="bg-stone-900/80 border border-stone-800 rounded-lg px-2.5 py-1.5">
            <span className="text-stone-500 block text-[9px] uppercase font-semibold">AA (Tahap)</span>
            <strong className="text-amber-200">
              {invoice.stageCode === '02' ? '02 (Lunas)' : '01 (DP)'}
            </strong>
          </div>

          <div className="bg-stone-900/80 border border-amber-500/40 rounded-lg px-2.5 py-1.5 flex flex-col justify-between">
            <span className="text-stone-400 block text-[9px] uppercase font-semibold">
              BB (No. Urut)
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(invoice.sequenceNumber || '8', 10);
                  handleSequenceChange(Math.max(1, current - 1));
                }}
                className="w-5 h-5 flex items-center justify-center bg-stone-800 hover:bg-stone-700 text-stone-200 rounded font-bold text-xs"
                title="Kurangi nomor urut"
              >
                -
              </button>
              <input
                type="text"
                value={invoice.sequenceNumber || '08'}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  const updated = { ...invoice, sequenceNumber: val };
                  recalculateSummary(updated);
                }}
                onBlur={(e) => {
                  handleSequenceChange(e.target.value || '08');
                }}
                className="w-10 bg-stone-950 border border-stone-700 text-amber-300 font-mono font-bold text-center text-xs rounded py-0.5 focus:outline-none focus:border-amber-500"
                placeholder="08"
              />
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(invoice.sequenceNumber || '8', 10);
                  handleSequenceChange(current + 1);
                }}
                className="w-5 h-5 flex items-center justify-center bg-stone-800 hover:bg-stone-700 text-stone-200 rounded font-bold text-xs"
                title="Tambah nomor urut"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 rounded-lg px-2.5 py-1.5">
            <span className="text-stone-500 block text-[9px] uppercase font-semibold">CC (Bulan)</span>
            <strong className="text-amber-200">
              {invoice.invoiceCode?.split('/')[1] || 'IX'}
            </strong>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 rounded-lg px-2.5 py-1.5">
            <span className="text-stone-500 block text-[9px] uppercase font-semibold">DD (Paket)</span>
            <strong className="text-amber-200 truncate block" title={currentPkg.name}>
              {invoice.packageCode || '03'} ({currentPkg.name})
            </strong>
          </div>
        </div>

        {/* Tanggal Terbit Input */}
        <div className="pt-2 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <label className="text-[11px] text-stone-400 font-semibold whitespace-nowrap">
            Tanggal Terbit Nota:
          </label>
          <div className="w-full sm:min-w-[280px] sm:w-auto">
            <CalendarPicker
              value={invoice.invoiceDate || ''}
              onChange={(newDate) => {
                const updated = { ...invoice, invoiceDate: newDate };
                recalculateSummary(updated);
              }}
              label="Tanggal Terbit Nota"
              placeholder="Pilih Tanggal Terbit..."
            />
          </div>
        </div>
      </div>

      {/* 3. Data Klien */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
          <User className="w-3.5 h-3.5 text-amber-500" />
          <span>Informasi Klien</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-stone-400 block mb-1">Nama Klien</label>
            <input
              type="text"
              value={invoice.client?.name || ''}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  client: { ...invoice.client, name: e.target.value.toUpperCase() },
                })
              }
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-semibold text-stone-200 focus:outline-none focus:border-amber-500 uppercase"
              placeholder="VIRA APRILIANII"
            />
          </div>

          <div>
            <label className="text-[11px] text-stone-400 block mb-1">Nomor WhatsApp</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
              <input
                type="text"
                value={invoice.client?.phone || ''}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    client: { ...invoice.client, phone: e.target.value },
                  })
                }
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                placeholder="0857-2489-4972"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-stone-400 block mb-1">Domisili / Lokasi</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
              <input
                type="text"
                value={invoice.client?.location || ''}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    client: { ...invoice.client, location: e.target.value },
                  })
                }
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                placeholder="Purwakarta, Jawa Barat"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Jadwal Pelaksanaan Acara */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Jadwal Pelaksanaan Acara</span>
          </div>
          <span className="text-[11px] text-stone-400 font-medium">
            Paket Terpilih: <strong className="text-amber-400 uppercase font-bold">[{invoice.packageCode || '03'}] {currentPkg.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-stone-400 block mb-1">
              Tanggal Acara Pelaksanaan
            </label>
            <CalendarPicker
              value={invoice.event?.date || ''}
              onChange={(newDate) => handleEventChange('date', newDate)}
              label="Tanggal Acara Pelaksanaan"
              placeholder="Pilih Tanggal Acara..."
            />
          </div>

          <div>
            <label className="text-[11px] text-stone-400 block mb-1">Jam Acara (Mulai - Selesai)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={invoice.event?.timeStart || '10.00'}
                onChange={(e) => handleEventChange('timeStart', e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2 py-2 text-xs text-center font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                placeholder="10.00"
              />
              <input
                type="text"
                value={invoice.event?.timeEnd || '14.00'}
                onChange={(e) => handleEventChange('timeEnd', e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2 py-2 text-xs text-center font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                placeholder="14.00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Tabel Item Transaksi & Kalkulator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Rincian Item Transaksi
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAddItem('ADDITIONAL')}
              className="text-xs flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition"
            >
              <Plus className="w-3 h-3 text-amber-400" />
              <span>+ Transport</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddItem('DISCOUNT')}
              className="text-xs flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition"
            >
              <Percent className="w-3 h-3 text-emerald-400" />
              <span>+ Diskon Promo</span>
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {(invoice.items || []).map((item, index) => {
            const isPackage = index === 0;
            return (
              <div
                key={item.id || index}
                className="bg-stone-950 border border-stone-800 rounded-xl p-3 space-y-2.5"
              >
                {isPackage ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] text-stone-400 font-semibold block mb-1">
                          Pilihan Paket (Select)
                        </label>
                        <select
                          value={invoice.packageCode || '03'}
                          onChange={(e) => handlePackageChange(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs font-semibold text-amber-300 focus:outline-none focus:border-amber-500"
                        >
                          {PACKAGE_OPTIONS.map((pkg) => (
                            <option key={pkg.code} value={pkg.code}>
                              [{pkg.code}] {pkg.name} — Rp {pkg.defaultPrice.toLocaleString('id-ID')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-stone-400 font-semibold block mb-1">
                          Jam Acara (Input Jam Saja)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={invoice.event?.timeStart || '10.00'}
                            onChange={(e) => handleEventChange('timeStart', e.target.value)}
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2 py-2 text-xs text-center font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                            placeholder="10.00"
                          />
                          <span className="text-stone-500 font-bold">-</span>
                          <input
                            type="text"
                            value={invoice.event?.timeEnd || '14.00'}
                            onChange={(e) => handleEventChange('timeEnd', e.target.value)}
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2 py-2 text-xs text-center font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                            placeholder="14.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pratinjau Teks Format Nota */}
                    <div className="bg-stone-900/60 border border-stone-800/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                        <span className="text-[9px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded font-mono uppercase font-bold shrink-0">
                          Format Nota
                        </span>
                        <span className="text-stone-300 font-medium truncate text-[11px]">
                          {currentPkg.name} • {currentPkg.printType} • {invoice.event?.date ? formatDateIndo(invoice.event.date) : 'Tanggal Acara'} • {invoice.event?.timeStart || '10.00'} - {invoice.event?.timeEnd || '14.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-stone-500 block mb-0.5">
                        Deskripsi Item
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                        placeholder="Keterangan tambahan..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-stone-500 hover:text-red-400 p-1.5 mt-4 rounded-lg hover:bg-stone-900 transition"
                      title="Hapus baris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Harga / Nilai</label>
                    <FormattedNumberInput
                      value={item.price}
                      onChange={(newVal) => handleItemChange(index, 'price', newVal)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Jenis Tagihan</label>
                    <select
                      value={item.paymentType}
                      onChange={(e) => handleItemChange(index, 'paymentType', e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="DOWN PAYMENT">DOWN PAYMENT</option>
                      <option value="PELUNASAN">PELUNASAN</option>
                      <option value="ADDITIONAL">ADDITIONAL</option>
                      <option value="DISCOUNT">DISCOUNT</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">
                      {isPackage ? 'DP Dibayar' : 'Total Baris'}
                    </label>
                    <FormattedNumberInput
                      value={item.amountPaid}
                      onChange={(newVal) => handleItemChange(index, 'amountPaid', newVal)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Summary Preview */}
        <div className="bg-stone-950 border border-amber-900/40 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] text-stone-500 block uppercase">Total Acara</span>
            <strong className="text-stone-100 font-mono text-xs sm:text-sm">
              Rp {(invoice.summary?.grandTotal || 0).toLocaleString('id-ID')}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block uppercase">Total Pembayaran</span>
            <strong className="text-amber-400 font-mono text-xs sm:text-sm">
              Rp {(invoice.summary?.totalPaidSoFar || 0).toLocaleString('id-ID')}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block uppercase">Sisa Pembayaran</span>
            <strong className="text-rose-400 font-mono text-xs sm:text-sm">
              Rp {(invoice.summary?.remainingBalance || 0).toLocaleString('id-ID')}
            </strong>
          </div>
        </div>
      </div>

      {/* Action Bar Form */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-800 flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-stone-400 hover:text-stone-200 px-3 py-2 rounded-xl hover:bg-stone-800 transition"
        >
          Invoice Baru
        </button>

        <div className="flex items-center gap-2">
          {onViewPdf && (
            <button
              type="button"
              onClick={onViewPdf}
              className="lg:hidden px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition"
            >
              Lihat PDF ↗
            </button>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-950/50 transition transform active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-stone-950" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
