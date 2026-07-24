// File: src/app/(auth)/login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Utensils, Lock, User, Shield, Receipt, ChefHat, Bike, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login gagal. Periksa username dan password.');
        setLoading(false);
        return;
      }

      const role = data.user.role;
      if (role === 'ADMIN') router.push('/admin');
      else if (role === 'KASIR') router.push('/kasir');
      else if (role === 'DAPUR') router.push('/dapur');
      else if (role === 'RUNNER') router.push('/runner');
      else router.push('/');
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server.');
      setLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#781215] rounded-[20px] flex items-center justify-center text-white mx-auto shadow-xl shadow-[#781215]/30 mb-4">
            <Utensils className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Pesen<span className="text-[#781215]">Go</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Masuk untuk mengakses dashboard operasional</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-[#781215] text-sm p-3.5 rounded-2xl text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#781215]" />
                Username
              </label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#781215]" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#781215] hover:bg-[#600e11] text-white font-bold text-sm py-4 px-5 rounded-2xl shadow-lg shadow-[#781215]/25 transition-all flex items-center justify-center gap-2 btn-press disabled:opacity-60"
            >
              <span>{loading ? 'Memverifikasi...' : 'Masuk Dashboard'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Login */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <p className="text-xs text-slate-400 font-medium text-center uppercase tracking-wider">Akun Demo</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { u: 'kasir', p: 'kasir123', label: 'Kasir', icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { u: 'dapur', p: 'dapur123', label: 'Dapur', icon: ChefHat, color: 'text-amber-600', bg: 'bg-amber-50' },
                { u: 'runner', p: 'runner123', label: 'Runner', icon: Bike, color: 'text-blue-600', bg: 'bg-blue-50' },
                { u: 'admin', p: 'admin123', label: 'Admin', icon: Shield, color: 'text-[#781215]', bg: 'bg-[#781215]/10' },
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.u}
                    onClick={() => handleQuickLogin(item.u, item.p)}
                    className="flex items-center gap-2.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 p-3 rounded-2xl text-left transition-all btn-press"
                  >
                    <div className={`w-8 h-8 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <IconComp className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.label}</p>
                      <p className="text-[10px] text-slate-400">{item.u} / {item.p}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
