import React, { useState } from 'react';
import {
  Search,
  FileText,
  MessageCircle,
  Download,
  Printer,
  Trash2,
  Calendar,
  User,
  Plus,
  Filter,
} from 'lucide-react';
import { formatDateIndo, formatRupiah } from '../utils/formatters';

const InvoiceList = ({
  invoices,
  activeInvoiceId,
  onSelectInvoice,
  onNewInvoice,
  onDeleteInvoice,
  onShareWhatsApp,
  onDownloadPdf,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (inv.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.invoiceCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.client?.phone || '').includes(searchTerm);

    if (!matchesSearch) return false;
    if (filterType === 'ALL') return true;
    return inv.docType === filterType;
  });

  const getDocBadge = (type) => {
    switch (type) {
      case 'TAGIHAN_DP':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">TAGIHAN DP</span>;
      case 'BUKTI_DP':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">DP DITERIMA</span>;
      case 'TAGIHAN_PELUNASAN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-800">TAGIHAN H-1</span>;
      case 'BUKTI_LUNAS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">LUNAS</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
      {/* Header & New Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Riwayat & Daftar Invoice</span>
          </h2>
          <p className="text-xs text-stone-400">
            Total {invoices.length} invoice tersimpan di sistem
          </p>
        </div>

        <button
          onClick={onNewInvoice}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Invoice Baru</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama klien, no invoice, atau WhatsApp..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-semibold"
          >
            <option value="ALL">Semua Status Dokumen</option>
            <option value="TAGIHAN_DP">Tagihan DP</option>
            <option value="BUKTI_DP">Bukti DP Diterima</option>
            <option value="TAGIHAN_PELUNASAN">Tagihan Pelunasan</option>
            <option value="BUKTI_LUNAS">Bukti Lunas</option>
          </select>
        </div>
      </div>

      {/* Invoice List Items */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {filteredInvoices.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500 italic border border-dashed border-stone-800 rounded-xl">
            Tidak ada invoice yang sesuai pencarian.
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const isActive = inv.id === activeInvoiceId;
            return (
              <div
                key={inv.id}
                onClick={() => onSelectInvoice(inv)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-amber-950/20 border-amber-500/70 shadow-md shadow-amber-950/30'
                    : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 hover:bg-stone-950'
                }`}
              >
                {/* Left Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {inv.invoiceCode}
                    </span>
                    {getDocBadge(inv.docType)}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-stone-100 uppercase">
                      {inv.client?.name || 'Klien Tanpa Nama'}
                    </span>
                    <span className="text-stone-500">•</span>
                    <span className="text-stone-400 font-mono">
                      {inv.client?.phone || '-'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-500" />
                      Acara: {inv.event?.date ? formatDateIndo(inv.event.date) : '-'}
                    </span>
                    <span className="text-stone-600">|</span>
                    <span>{inv.event?.packageName || 'Photobooth'}</span>
                  </div>
                </div>

                {/* Right Info & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-stone-800/80 pt-2 md:pt-0">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] text-stone-500 uppercase">Sisa Tagihan</div>
                    <div className="text-xs font-extrabold font-mono text-rose-400">
                      Rp {(inv.summary?.remainingBalance || 0).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onShareWhatsApp(inv)}
                      className="p-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-400 rounded-lg transition"
                      title="Kirim ke WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadPdf(inv)}
                      className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition"
                      title="Unduh PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteInvoice(inv.id)}
                      className="p-2 bg-stone-800 hover:bg-red-950 hover:text-red-400 text-stone-400 rounded-lg transition"
                      title="Hapus Invoice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
