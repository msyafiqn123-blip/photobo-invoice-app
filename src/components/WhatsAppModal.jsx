import React, { useState, useEffect } from 'react';
import { generateWhatsAppMessage, getWhatsAppLink } from '../utils/whatsapp';
import { getInvoicePdfBlob } from '../utils/exportPdf';
import {
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  X,
  FileText,
  Download,
  Paperclip,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const WhatsAppModal = ({ isOpen, onClose, invoice, settings }) => {
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  useEffect(() => {
    if (invoice) {
      setMessage(generateWhatsAppMessage({ invoice, settings }));
      setDownloadTriggered(false);
    }
  }, [invoice, settings]);

  if (!isOpen || !invoice) return null;

  const phone = invoice.client?.phone || '';
  const waUrl = getWhatsAppLink(phone, message);

  const safeCode = (invoice.invoiceCode || 'INVOICE').replace(/[\/\\:]/g, '_');
  const safeClient = (invoice.client?.name || 'Photobo').replace(/[\/\\:]/g, '_');
  const filename = `${safeCode} - ${safeClient}.pdf`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectDownload = async () => {
    setIsGenerating(true);
    try {
      const res = await getInvoicePdfBlob('invoice-document-master', 'a5');
      if (res && res.pdf) {
        res.pdf.save(filename);
        setDownloadTriggered(true);
      }
    } catch (err) {
      console.error('Failed to download invoice PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToWhatsApp = async () => {
    setIsGenerating(true);
    try {
      const res = await getInvoicePdfBlob('invoice-document-master', 'a5');

      if (res && res.blob) {
        const file = new File([res.blob], filename, { type: 'application/pdf' });

        // If native Web Share API supports file sharing (Mobile devices / modern OS)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Invoice ${invoice.invoiceCode}`,
              text: message,
            });
            setDownloadTriggered(true);
            return;
          } catch (shareErr) {
            if (shareErr.name === 'AbortError') {
              // User cancelled native share sheet
              return;
            }
            console.warn('Web Share failed, continuing to download + WhatsApp Web fallback:', shareErr);
          }
        }

        // Desktop / WhatsApp Web fallback:
        // Automatically download the PDF invoice
        res.pdf.save(filename);
        setDownloadTriggered(true);
      }

      // Open WhatsApp Web with pre-filled message and recipient
      window.open(waUrl, '_blank');
    } catch (error) {
      console.error('Error in WhatsApp send flow:', error);
      // Fallback: open WhatsApp link even if PDF creation encountered an issue
      window.open(waUrl, '_blank');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60 shrink-0">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="block text-sm text-stone-100 font-bold">Kirim Invoice via WhatsApp</span>
              <span className="block text-[11px] text-emerald-400 font-normal">Lampiran Dokumen PDF A5</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Recipient */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              Nomor WhatsApp Klien
            </label>
            <div className="flex items-center justify-between bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-200">
              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-mono text-sm">+62</span>
                <span className="font-semibold text-sm">{phone || 'Nomor belum diisi'}</span>
              </div>
              <span className="text-[11px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                {invoice.client?.name || 'Klien'}
              </span>
            </div>
          </div>

          {/* PDF Attachment Card */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              Lampiran Dokumen Invoice (PDF A5)
            </label>
            <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-center justify-center text-rose-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-stone-200 truncate">{filename}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-900/40 text-amber-300 border border-amber-800/40 shrink-0">
                      A5
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 truncate mt-0.5">
                    Dokumen resmi siap cetak & kirim
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDirectDownload}
                disabled={isGenerating}
                className="px-3 py-1.5 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition shrink-0 border border-stone-700/50 cursor-pointer disabled:opacity-50"
                title="Unduh file PDF ini langsung"
              >
                <Download className="w-3.5 h-3.5 text-stone-400" />
                <span>Unduh PDF</span>
              </button>
            </div>
          </div>

          {/* Download & Attach Guidance */}
          {downloadTriggered ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-200">PDF Berhasil Disiapkan & Diunduh!</span>
                <p className="text-[11px] text-emerald-300/90 mt-0.5">
                  File <code className="text-emerald-100 bg-emerald-900/50 px-1 py-0.5 rounded font-mono text-[10px]">{filename}</code> sudah tersimpan. Silakan drag & drop / lampirkan file ini ke chat WhatsApp yang baru terbuka.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-xl flex items-start gap-2.5 text-xs text-stone-400">
              <Paperclip className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="text-stone-300 font-medium">Pengiriman via WhatsApp:</span> Di HP, invoice PDF dapat langsung terlampir via menu Share WhatsApp. Di Komputer/Laptop, PDF akan <strong>otomatis terunduh</strong> saat WhatsApp Web terbuka sehingga Kakak tinggal drag & drop ke kolom chat.
              </div>
            </div>
          )}

          {/* WhatsApp Message Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Pesan Teks WhatsApp
              </label>
              <button
                onClick={handleCopy}
                className="text-xs flex items-center gap-1 text-stone-400 hover:text-stone-200 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Pesan</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs leading-relaxed text-stone-300 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-stone-800 bg-stone-950/60 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-stone-400 hover:text-stone-200 transition rounded-xl"
          >
            Tutup
          </button>
          <button
            onClick={handleSendToWhatsApp}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition transform active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Menyiapkan PDF...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                <span>Kirim ke WhatsApp (Lampirkan PDF)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;
