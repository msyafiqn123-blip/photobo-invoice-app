import React, { useState, useEffect } from 'react';
import { Settings, Save, Database, Building2, Check, X, ShieldCheck } from 'lucide-react';
import { getSupabaseConfig, resetSupabaseClient } from '../services/supabase';

const SettingsModal = ({ isOpen, onClose, settings, onSaveSettings }) => {
  const [formData, setFormData] = useState(settings || {});
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(() => getSupabaseConfig().key);
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

    // Save Supabase credentials to localStorage
    if (supabaseUrl) localStorage.setItem('photobo_supabase_url', supabaseUrl);
    else localStorage.removeItem('photobo_supabase_url');

    if (supabaseKey) localStorage.setItem('photobo_supabase_key', supabaseKey);
    else localStorage.removeItem('photobo_supabase_key');

    resetSupabaseClient();

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
            <span>Pengaturan Studio & Integrasi Supabase</span>
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

          {/* Supabase Cloud Connection */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 border-b border-stone-800 pb-2">
              <Database className="w-4 h-4" />
              <span>Konfigurasi Supabase Cloud Database (Opsional)</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Jika dikosongkan, aplikasi otomatis menggunakan <strong>LocalStorage browser</strong> yang langsung aktif. Jika diisi URL dan Anon Key Supabase Anda, data invoice akan tersinkronisasi ke cloud table <code className="bg-stone-800 px-1 py-0.5 rounded text-emerald-300">invoices</code>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-400 font-semibold block mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 focus:outline-none focus:border-emerald-500"
                  placeholder="https://xyzcompany.supabase.co"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 font-semibold block mb-1">
                  Supabase Anon Public Key
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 focus:outline-none focus:border-emerald-500"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </div>
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
