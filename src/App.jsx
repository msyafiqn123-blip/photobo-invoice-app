import React, { useState, useEffect, useRef } from 'react';
import InvoicePreview from './components/InvoicePreview';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';
import WhatsAppModal from './components/WhatsAppModal';
import SettingsModal from './components/SettingsModal';
import {
  loadInvoices,
  saveInvoice,
  deleteInvoice,
  loadSettings,
  saveSettings,
  INITIAL_SAMPLE_INVOICES,
} from './services/storage';
import { generateInvoiceCode } from './utils/invoiceCode';
import { downloadInvoicePdf, printInvoice } from './utils/exportPdf';
import {
  FileText,
  Download,
  Printer,
  MessageCircle,
  Settings,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  Smartphone,
  Save,
  ChevronRight,
} from 'lucide-react';

const createEmptyInvoice = (seq = '08', currentPackages = PACKAGE_OPTIONS) => {
  const today = new Date().toISOString().split('T')[0];
  const defaultPkg =
    (currentPackages && currentPackages.find((p) => p.code === '03')) ||
    (currentPackages && currentPackages[0]) || {
      code: '03',
      name: '4 Jam 2R',
      durationHours: 4,
      printType: 'Unlimited 2R',
      defaultPrice: 2500000,
    };
  const pkgPrice = Number(defaultPkg.defaultPrice) || 2500000;
  const dpAmount = Math.round(pkgPrice * 0.2);

  const initialCode = generateInvoiceCode({
    stageCode: '02',
    sequenceNumber: seq,
    invoiceDate: today,
    packageCode: defaultPkg.code || '03',
  });

  return {
    id: `inv-${Date.now()}`,
    invoiceCode: initialCode,
    invoiceDate: today,
    docType: 'TAGIHAN_PELUNASAN',
    stageCode: '02',
    sequenceNumber: seq,
    packageCode: defaultPkg.code || '03',
    client: {
      name: '',
      phone: '',
      location: '',
    },
    event: {
      date: today,
      timeStart: '10.00',
      timeEnd: '14.00',
      durationHours: defaultPkg.durationHours || 4,
      printType: defaultPkg.printType || 'Unlimited 2R',
      packageName: defaultPkg.name?.startsWith('Photobooth')
        ? defaultPkg.name
        : `Photobooth ${defaultPkg.durationHours || 4} Hours`,
    },
    items: [
      {
        id: 'item-1',
        description: `Photobooth ${defaultPkg.durationHours || 4} Hours\n${defaultPkg.printType || 'Unlimited 2R'}\n${today}\n10.00 - 14.00`,
        price: pkgPrice,
        paymentType: 'DOWN PAYMENT',
        amountPaid: dpAmount,
      },
    ],
    summary: {
      totalPackagePrice: pkgPrice,
      totalAdditionals: 0,
      totalDiscounts: 0,
      grandTotal: pkgPrice,
      downPaymentPaid: dpAmount,
      totalPaidSoFar: dpAmount,
      remainingBalance: Math.max(0, pkgPrice - dpAmount),
    },
    paymentMethod: 'BCA TRANSFER',
    accountNumber: 'BCA 7045166686',
    accountHolder: 'Sasiera Diva P',
    hasStamp: true,
  };
};

function App() {
  const [invoices, setInvoices] = useState(() => INITIAL_SAMPLE_INVOICES);
  const [activeInvoice, setActiveInvoice] = useState(() => INITIAL_SAMPLE_INVOICES[0] || createEmptyInvoice());
  const [settings, setSettings] = useState(loadSettings());
  
  // Navigation tabs: 'FORM' | 'PREVIEW' | 'LIST'
  const [mobileTab, setMobileTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('tab');
      if (p === 'PREVIEW' || p === 'LIST') return p;
    }
    return 'FORM';
  });
  const [desktopTab, setDesktopTab] = useState('EDITOR'); // 'EDITOR' | 'LIST'
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const [previewScale, setPreviewScale] = useState(0.8);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modals
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const previewRef = useRef(null);
  
  // Measure actual available screen width for perfect mobile fitting
  useEffect(() => {
    const updateScale = () => {
      const clientW = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
      setWindowWidth(clientW);
      if (clientW < 1024) {
        // Fits width with 32px breathing room on all phones and tablets
        const s = Math.min(1, Math.max(0.35, (clientW - 32) / 794));
        setPreviewScale(parseFloat(s.toFixed(2)));
      } else {
        setPreviewScale(0.8);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Ensure perfect fit whenever mobile user switches to PREVIEW tab
  useEffect(() => {
    if (mobileTab === 'PREVIEW' && typeof window !== 'undefined') {
      const clientW = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
      if (clientW < 1024) {
        const s = Math.min(1, Math.max(0.35, (clientW - 20) / 794));
        setPreviewScale(parseFloat(s.toFixed(2)));
      }
    }
  }, [mobileTab]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const loaded = await loadInvoices();
      setInvoices(loaded);
      if (loaded.length > 0) {
        setActiveInvoice(loaded[0]);
      } else {
        const empty = createEmptyInvoice();
        setActiveInvoice(empty);
      }
    };
    init();
  }, []);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveInvoice = async () => {
    if (!activeInvoice) return;
    setIsSaving(true);
    try {
      const updatedList = await saveInvoice(activeInvoice);
      setInvoices(updatedList);
      showToast('Invoice tersimpan dengan nomor: ' + activeInvoice.invoiceCode);
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan invoice.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewInvoice = () => {
    let maxSeq = 8;
    invoices.forEach((inv) => {
      const num = parseInt(inv.sequenceNumber || '0', 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    });
    const nextSeq = String(maxSeq).padStart(2, '0');
    const newInv = createEmptyInvoice(nextSeq, settings?.packages);
    setActiveInvoice(newInv);
    setDesktopTab('EDITOR');
    setMobileTab('FORM');
    showToast(`Invoice baru nomor urut ${nextSeq} siap dibuat!`);
  };

  const handleDeleteInvoice = async (id) => {
    if (confirm('Yakin ingin menghapus invoice ini?')) {
      const updatedList = await deleteInvoice(id);
      setInvoices(updatedList);
      if (activeInvoice?.id === id) {
        setActiveInvoice(updatedList[0] || createEmptyInvoice());
      }
      showToast('Invoice telah dihapus.');
    }
  };

  const handleDownloadPdf = async (invToDownload) => {
    const target = invToDownload || activeInvoice;
    if (!target) return;

    if (invToDownload && invToDownload.id !== activeInvoice?.id) {
      setActiveInvoice(invToDownload);
    }

    // Pastikan tab Preview / Editor aktif agar elemen DOM invoice-document ter-mount sempurna
    if (isMobile && mobileTab !== 'PREVIEW') {
      setMobileTab('PREVIEW');
    } else if (!isMobile && desktopTab === 'LIST') {
      setDesktopTab('EDITOR');
    }

    showToast('Menyiapkan file PDF ukuran A5 (148 × 210 mm)...');
    setTimeout(async () => {
      try {
        const filename = `${target.invoiceCode || 'INVOICE'} - ${target.client?.name || 'Photobo'}.pdf`.replace(/[\/\\:]/g, '_');
        await downloadInvoicePdf('invoice-document', filename, 'a5');
        showToast('PDF A5 berhasil diunduh!');
      } catch (err) {
        console.error(err);
        showToast('Gagal mengunduh PDF.');
      }
    }, 350);
  };

  const handlePrint = () => {
    printInvoice();
  };

  const handleSaveSettings = (newSettings) => {
    const saved = saveSettings(newSettings);
    setSettings(saved);
    if (activeInvoice) {
      setActiveInvoice((prev) => ({
        ...prev,
        paymentMethod: `${saved.bankName || 'BCA'} TRANSFER`,
        accountNumber: `${saved.bankName || 'BCA'} ${saved.bankAccountNumber || '7045166686'}`,
        accountHolder: saved.bankAccountHolder || 'Sasiera Diva P',
      }));
    }
    showToast('Pengaturan studio berhasil diperbarui!');
  };

  const isMobile = windowWidth < 1024;

  return (
    <div className="min-h-screen bg-[#0F0D0E] text-stone-200 flex flex-col font-mulish pb-20 lg:pb-0">
      {/* Top Navbar */}
      <header className="no-print sticky top-0 z-40 bg-[#160C10]/95 backdrop-blur-md border-b border-stone-800/80 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-stone-900 border border-stone-700/60 p-1 flex items-center justify-center shrink-0">
              <img
                src="/photobo_logo_white.png"
                alt="Photobo Studio"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-wide text-stone-100">
                  PHOTOBO
                </span>
                <span className="hidden sm:inline font-extrabold text-sm sm:text-base text-stone-400">
                  STUDIO
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AUTO-INV
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center p-1 bg-stone-950 border border-stone-800 rounded-xl">
            <button
              onClick={() => setDesktopTab('EDITOR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                desktopTab === 'EDITOR'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Editor & Live Preview</span>
            </button>
            <button
              onClick={() => setDesktopTab('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                desktopTab === 'LIST'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Riwayat ({invoices.length})</span>
            </button>
          </div>

          {/* Action Buttons (Desktop & Quick Mobile Icons) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => handleDownloadPdf()}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition transform active:scale-95"
              title="Unduh PDF 1:1"
            >
              <Download className="w-3.5 h-3.5 text-stone-950" />
              <span className="hidden xs:inline">Unduh PDF</span>
            </button>

            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition"
              title="Kirim via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition text-xs"
              title="Cetak via browser"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 sm:p-2 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 rounded-xl transition"
              title="Pengaturan Studio"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Top Segmented Tab Switcher */}
        {isMobile && (
          <div className="mt-2.5 grid grid-cols-3 gap-1 bg-stone-950 p-1 border border-stone-800/90 rounded-xl text-center">
            <button
              onClick={() => setMobileTab('FORM')}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                mobileTab === 'FORM'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400'
              }`}
            >
              📝 Isi Form
            </button>
            <button
              onClick={() => setMobileTab('PREVIEW')}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                mobileTab === 'PREVIEW'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400'
              }`}
            >
              👁️ Lihat PDF
            </button>
            <button
              onClick={() => setMobileTab('LIST')}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                mobileTab === 'LIST'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400'
              }`}
            >
              📋 Riwayat ({invoices.length})
            </button>
          </div>
        )}
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {/* DESKTOP VIEW */}
        {!isMobile ? (
          desktopTab === 'LIST' ? (
            <InvoiceList
              invoices={invoices}
              activeInvoiceId={activeInvoice?.id}
              onSelectInvoice={(inv) => {
                setActiveInvoice(inv);
                setDesktopTab('EDITOR');
              }}
              onNewInvoice={handleNewInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onShareWhatsApp={(inv) => {
                setActiveInvoice(inv);
                setIsWhatsAppOpen(true);
              }}
              onDownloadPdf={handleDownloadPdf}
            />
          ) : (
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Controls */}
              <div className="no-print col-span-5 space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Panel Data Booking
                  </span>
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    {activeInvoice?.invoiceCode}
                  </span>
                </div>

                {activeInvoice && (
                  <InvoiceForm
                    invoice={activeInvoice}
                    onChange={setActiveInvoice}
                    onSave={handleSaveInvoice}
                    onReset={handleNewInvoice}
                    isSaving={isSaving}
                    settings={settings}
                  />
                )}
              </div>

              {/* Right Column: Live A4 Document Preview */}
              <div className="col-span-7 flex flex-col items-center">
                {/* Preview Control Toolbar */}
                <div className="no-print w-full flex items-center justify-between bg-stone-900/90 border border-stone-800 rounded-2xl px-4 py-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Live Preview A5 (148 × 210 mm)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Format A5
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewScale((s) => Math.max(0.4, s - 0.1))}
                      className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition"
                      title="Perkecil"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono text-stone-400 w-12 text-center">
                      {Math.round(previewScale * 100)}%
                    </span>
                    <button
                      onClick={() => setPreviewScale((s) => Math.min(1.2, s + 0.1))}
                      className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition"
                      title="Perbesar"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewScale(0.8)}
                      className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition text-xs font-bold px-2"
                      title="Reset Skala"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Scaled Document Container Desktop */}
                <div className="w-full flex justify-center pb-6">
                  <div
                    className="mx-auto rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                      width: `${Math.round(794 * previewScale)}px`,
                      height: `${Math.round(1123 * previewScale)}px`,
                    }}
                  >
                    {activeInvoice && (
                      <InvoicePreview
                        ref={previewRef}
                        invoice={activeInvoice}
                        settings={settings}
                        scale={previewScale}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* MOBILE VIEW (Tab-based for touch comfort) */
          <div>
            {mobileTab === 'FORM' && (
              <div className="space-y-4">
                {activeInvoice && (
                  <InvoiceForm
                    invoice={activeInvoice}
                    onChange={setActiveInvoice}
                    onSave={handleSaveInvoice}
                    onReset={handleNewInvoice}
                    isSaving={isSaving}
                    onViewPdf={() => setMobileTab('PREVIEW')}
                    settings={settings}
                  />
                )}
              </div>
            )}

            {mobileTab === 'PREVIEW' && (
              <div className="space-y-3">
                {/* Mobile Zoom Controls */}
                <div className="flex items-center justify-between bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <span>Preview A5</span>
                    <span className="text-[10px] text-stone-400">({Math.round(previewScale * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewScale((s) => Math.max(0.35, s - 0.05))}
                      className="p-1 bg-stone-800 rounded text-stone-300"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewScale((s) => Math.min(1.0, s + 0.05))}
                      className="p-1 bg-stone-800 rounded text-stone-300"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const clientW = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
                        const target = clientW < 500 ? Math.min(0.46, (clientW - 24) / 794) : Math.min(0.8, (clientW - 32) / 794);
                        setPreviewScale(parseFloat(target.toFixed(2)));
                      }}
                      className="px-2 py-0.5 bg-stone-800 rounded text-[10px] font-bold text-stone-300"
                    >
                      Fit Layar
                    </button>
                  </div>
                </div>

                {/* Scaled Preview for Mobile */}
                <div className="w-full overflow-x-auto flex justify-center pb-8 px-1">
                  <div
                    className="mx-auto rounded-2xl overflow-hidden shadow-2xl shrink-0"
                    style={{
                      width: `${Math.round(794 * previewScale)}px`,
                      height: `${Math.round(1123 * previewScale)}px`,
                    }}
                  >
                    {activeInvoice && (
                      <InvoicePreview
                        ref={previewRef}
                        invoice={activeInvoice}
                        settings={settings}
                        scale={previewScale}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {mobileTab === 'LIST' && (
              <InvoiceList
                invoices={invoices}
                activeInvoiceId={activeInvoice?.id}
                onSelectInvoice={(inv) => {
                  setActiveInvoice(inv);
                  setMobileTab('FORM');
                }}
                onNewInvoice={handleNewInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onShareWhatsApp={(inv) => {
                  setActiveInvoice(inv);
                  setIsWhatsAppOpen(true);
                }}
                onDownloadPdf={handleDownloadPdf}
              />
            )}
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Floating Action Bar */}
      {isMobile && (
        <div className="no-print fixed bottom-0 left-0 right-0 z-40 bg-[#160C10]/95 backdrop-blur-md border-t border-stone-800 px-3 py-2 flex items-center justify-between gap-2 shadow-2xl">
          <button
            onClick={handleSaveInvoice}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 transition"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>

          <button
            onClick={() => handleDownloadPdf()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950/40 transition"
          >
            <Download className="w-3.5 h-3.5 text-stone-950" />
            <span>Unduh PDF</span>
          </button>

          <button
            onClick={() => setIsWhatsAppOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        invoice={activeInvoice}
        settings={settings}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="no-print fixed top-16 right-4 sm:top-auto sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 bg-stone-900 border border-amber-500/60 text-stone-100 px-4 py-2.5 rounded-xl shadow-2xl animate-bounce">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}
    </div>
  );
}

export default App;
