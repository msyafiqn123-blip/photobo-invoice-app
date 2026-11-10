import React, { useState } from 'react';
import { Download, FileCheck, Share2, ExternalLink, ArrowLeft } from 'lucide-react';

const DownloadView = () => {
  const [downloading, setDownloading] = useState(false);
  const pdfUrl = '/temp/INV_01.09_X_01_26_-_NOVA_YOGI.pdf';
  const fileName = 'INV 01.09_X_01_26 - NOVA_YOGI.pdf';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: 'application/pdf' });

      // If mobile supports Web Share with file, offer direct save to files or WhatsApp
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: fileName,
            text: 'Dokumen Invoice Resmi Photobo Studio',
            files: [file],
          });
          setDownloading(false);
          return;
        } catch (_) {
          // Fallback to normal download if share was canceled
        }
      }

      // Standard trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch (e) {
      console.error(e);
      window.open(pdfUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0D0E] text-stone-200 font-mulish py-8 px-4 flex flex-col justify-between items-center">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Brand */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 p-2 shadow-xl mx-auto">
            <img
              src="/photobo_logo_white.png"
              alt="Photobo Studio"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-black tracking-wider text-stone-100 uppercase">
            PHOTOBO STUDIO
          </h1>
          <p className="text-xs text-stone-400">Unduh Dokumen Invoice Resmi</p>
        </div>

        {/* Card */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-left">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                Dokumen Siap Diunduh
              </div>
              <div className="font-mono text-sm font-black text-stone-100">
                INV 01.09/X/01/26
              </div>
            </div>
          </div>

          <div className="bg-stone-950/80 rounded-2xl p-4 text-xs space-y-2.5 border border-stone-800/80">
            <div className="flex justify-between">
              <span className="text-stone-400">Klien</span>
              <span className="font-bold text-stone-100">NOVA/YOGI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">No. WhatsApp</span>
              <span className="font-mono text-stone-300">087736883306</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Lokasi</span>
              <span className="font-medium text-stone-300 text-right">
                Bale dan Resto Panghegar Purwakarta
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Format Kertas</span>
              <span className="font-bold text-amber-300">A5 (148 × 210 mm)</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition transform active:scale-98 cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Mengunduh...' : 'Simpan / Unduh PDF ke HP'}</span>
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka & Lihat di Tab Baru</span>
            </a>
          </div>
        </div>

        <div className="pt-2">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Utama</span>
          </a>
        </div>
      </div>

      <div className="text-center text-[10px] text-stone-500 pt-8">
        <p>© {new Date().getFullYear()} Photobo Studio. Hak Cipta Dilindungi.</p>
      </div>
    </div>
  );
};

export default DownloadView;
