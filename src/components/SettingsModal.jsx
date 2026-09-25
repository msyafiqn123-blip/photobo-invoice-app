import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Building2,
  Check,
  X,
  ShieldCheck,
  Package,
  RotateCcw,
  Plus,
  Trash2,
} from 'lucide-react';
import { PACKAGE_OPTIONS } from '../utils/invoiceCode';
import FormattedNumberInput from './FormattedNumberInput';

const SettingsModal = ({ isOpen, onClose, settings, onSaveSettings }) => {
  const [formData, setFormData] = useState(settings || {});
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePackageChange = (index, field, value) => {
    const pkgs = [...(formData.packages || PACKAGE_OPTIONS)];
    pkgs[index] = {
      ...pkgs[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, packages: pkgs }));
  };

  const handleAddPackage = () => {
    const current = formData.packages || PACKAGE_OPTIONS;
    const newCode = String(current.length + 1).padStart(2, '0');
    const newPkg = {
      code: newCode,
      name: `Paket Kustom ${current.length + 1}`,
      durationHours: 3,
      printType: 'Unlimited 2R',
      defaultPrice: 2000000,
    };
    setFormData((prev) => ({
      ...prev,
      packages: [...current, newPkg],
    }));
  };

  const handleRemovePackage = (index) => {
    const current = formData.packages || PACKAGE_OPTIONS;
    if (current.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      packages: current.filter((_, i) => i !== index),
    }));
  };

  const handleResetPackages = () => {
    setFormData((prev) => ({
      ...prev,
      packages: PACKAGE_OPTIONS,
    }));
  };

  const handleTermsChange = (index, value) => {
    const newTerms = [...(formData.terms || [])];
    newTerms[index] = value;
    setFormData((prev) => ({ ...prev, terms: newTerms }));
  };

  const handleAddTerm = () => {
    setFormData((prev) => ({
      ...prev,
      terms: [...(prev.terms || []), ''],
    }));
  };

  const handleRemoveTerm = (index) => {
    setFormData((prev) => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index),
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-stone-200 font-bold">
            <Settings className="w-5 h-5 text-amber-500" />
            <span>Pengaturan Studio</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Studio Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 border-b border-stone-800 pb-2">
              <Building2 className="w-4 h-4" />
              <span>Profil Studio Photobo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-400 font-semibold block mb-1">
                  Nama Studio
                </label>
                <input
                  type="text"
                  name="studioName"
                  value={formData.studioName || ''}
                  onChange={handleChange}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 font-semibold block mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline || ''}
                  onChange={handleChange}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 font-semibold block mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram || ''}
                  onChange={handleChange}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                  placeholder="@Photobo_Studio"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 font-semibold block mb-1">
                  Nomor WhatsApp CS
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={handleChange}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                  placeholder="0811-1332-931"
                />
              </div>
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Rekening Pembayaran Studio</span>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full font-medium">
                Aktif di Dokumen Invoice
              </span>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Nomor rekening ini otomatis tercantum pada bagian bawah dokumen invoice resmi dan draf pesan WhatsApp.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-stone-400 font-semibold block mb-1">
                  Nama Bank
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName || ''}
                  onChange={handleChange}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                  placeholder="BCA"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 font-semibold block mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber || ''}
                  onChange={handleChange}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                  placeholder="7045166686"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 font-semibold block mb-1">
                  Atas Nama (Pemilik)
                </label>
                <input
                  type="text"
                  name="bankAccountHolder"
                  value={formData.bankAccountHolder || ''}
                  onChange={handleChange}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                  placeholder="Sasiera Diva P"
                />
              </div>
            </div>
          </div>

          {/* Paket Layanan & Harga Photobooth */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <Package className="w-4 h-4" />
                <span>Daftar & Tarif Paket Photobooth</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPackages}
                  className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1 transition px-2 py-1 rounded hover:bg-stone-800"
                  title="Kembalikan tarif ke standar Photobo Studio"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Standar</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddPackage}
                  className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Tambah Paket</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Atur tarif dasar (default price), durasi, dan jenis cetak untuk setiap paket. Tarif ini otomatis digunakan saat membuat nota baru atau memilih paket di formulir.
            </p>

            <div className="space-y-3">
              {(formData.packages || PACKAGE_OPTIONS).map((pkg, index) => (
                <div
                  key={pkg.code || index}
                  className="bg-stone-950/80 border border-stone-800 hover:border-stone-700 rounded-xl p-3.5 space-y-3 transition"
                >
                  {/* Top Bar: Code, Name, Delete */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        [{pkg.code}]
                      </span>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => handlePackageChange(index, 'name', e.target.value)}
                        className="flex-1 bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-200 focus:outline-none focus:border-amber-500"
                        placeholder="Nama Paket"
                      />
                    </div>

                    {(formData.packages || PACKAGE_OPTIONS).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePackage(index)}
                        className="text-stone-500 hover:text-red-400 p-1 rounded hover:bg-stone-900 transition"
                        title="Hapus paket ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Grid Fields: Harga, Durasi, Jenis Cetak */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div>
                      <label className="text-[10px] text-stone-400 font-semibold block mb-1">
                        Harga Dasar Paket (Rp)
                      </label>
                      <FormattedNumberInput
                        value={pkg.defaultPrice}
                        onChange={(val) => handlePackageChange(index, 'defaultPrice', val)}
                        allowNegative={false}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-amber-500"
                        placeholder="1.500.000"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-stone-400 font-semibold block mb-1">
                        Durasi Acara (Jam)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={pkg.durationHours || 2}
                        onChange={(e) =>
                          handlePackageChange(index, 'durationHours', parseInt(e.target.value, 10) || 1)
                        }
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-stone-400 font-semibold block mb-1">
                        Format Cetak
                      </label>
                      <input
                        type="text"
                        value={pkg.printType || 'Unlimited 2R'}
                        onChange={(e) => handlePackageChange(index, 'printType', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                        placeholder="Unlimited 2R"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-bold text-amber-400 border-b border-stone-800 pb-2">
              <span>Syarat & Ketentuan Pembayaran</span>
              <button
                type="button"
                onClick={handleAddTerm}
                className="text-xs text-stone-400 hover:text-amber-400"
              >
                + Tambah Poin
              </button>
            </div>

            <div className="space-y-2">
              {(formData.terms || []).map((term, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 w-5">{index + 1}.</span>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleTermsChange(index, e.target.value)}
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(index)}
                    className="text-stone-500 hover:text-red-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-400 hover:text-stone-200 transition rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-900/30 transition transform active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-stone-950" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-stone-950" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
