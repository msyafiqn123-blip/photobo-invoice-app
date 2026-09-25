import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

const ADMIN_PASSWORD = 'sasiera';

const AuthGateView = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanInput = password.trim().toLowerCase();

    if (cleanInput === ADMIN_PASSWORD) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('photobo_admin_auth', 'true');
      }
      setError(false);
      onLoginSuccess();
    } else {
      setError(true);
      setErrorMessage('Password salah. Silakan periksa kembali kata sandi Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0D0E] text-stone-200 flex flex-col items-center justify-center font-mulish p-4 sm:p-6">
      <div className="w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-950 border border-stone-800 p-2 shadow-inner">
            <img
              src="/photobo_logo_white.png"
              alt="Photobo Studio"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-stone-100 uppercase">
              PHOTOBO STUDIO
            </h1>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-400 block mb-1.5">
              Password Akses Admin:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                autoFocus
                placeholder="Ketik password..."
                className={`w-full bg-stone-950 border ${
                  error ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500' : 'border-stone-700 focus:border-amber-500'
                } rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition pr-11 font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-1 rounded-lg transition"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 p-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl shadow-lg shadow-amber-950/40 transition transform active:scale-98 cursor-pointer"
          >
            <span>Buka Sistem</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthGateView;
