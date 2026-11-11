'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle 
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col justify-center items-center p-4 font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#1d1d1f] flex items-center justify-center text-amber-300 font-serif font-bold text-xl mx-auto shadow-sm">
            आ
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">Aarunodya Residency</h1>
            <p className="text-xs text-[#86868b] mt-0.5">
              Bhakt Niwas PMS • Pandharpur
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-black/[0.08] rounded-3xl p-7 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#86868b] mb-1 font-semibold">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="username"
                  placeholder="yuvaraj@aarunodya.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-[#f5f5f7] border border-black/[0.08] rounded-2xl pl-10 pr-4 text-base sm:text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#86868b] mb-1 font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-[#f5f5f7] border border-black/[0.08] rounded-2xl pl-10 pr-4 text-base sm:text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs font-semibold tracking-tight transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-95 disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Signing In…' : 'Sign In to PMS'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-black/[0.06] space-y-2">
            <span className="block text-[10px] uppercase tracking-wider text-[#86868b] font-semibold text-center">
              Quick Select Staff Login
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('yuvaraj@aarunodya.com', 'Admin@12345')}
                className="p-2.5 rounded-xl bg-[#f5f5f7] hover:bg-stone-200 text-left transition-colors"
              >
                <strong className="block text-[#1d1d1f] text-[11px]">Yuvaraj Malave</strong>
                <span className="text-[10px] text-[#86868b]">Owner / Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('frontdesk@aarunodya.com', 'Desk@12345')}
                className="p-2.5 rounded-xl bg-[#f5f5f7] hover:bg-stone-200 text-left transition-colors"
              >
                <strong className="block text-[#1d1d1f] text-[11px]">Reception Desk</strong>
                <span className="text-[10px] text-[#86868b]">Front Desk</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-[#0071e3] hover:underline"
          >
            ← Return to Aarunodya Residency site
          </Link>
        </div>
      </div>
    </div>
  );
}
