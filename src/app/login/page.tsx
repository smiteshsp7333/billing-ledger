'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserSession } from '../../types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to home
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('billing_ledger_session');
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          if (parsed && parsed.email) {
            router.replace('/');
          }
        } catch (e) {
          localStorage.removeItem('billing_ledger_session');
        }
      }
    }
  }, [router]);

  const validAccounts: { [email: string]: { pass: string; name: string; role: 'ADMIN' | 'ACCOUNTANT' | 'CASHIER' } } = {
    'admin@powertech.com': { pass: 'admin123', name: 'Executive Admin', role: 'ADMIN' },
    'accountant@powertech.com': { pass: 'accounts123', name: 'Senior Accountant', role: 'ACCOUNTANT' },
    'cashier@powertech.com': { pass: 'cash123', name: 'Billing Cashier', role: 'CASHIER' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const userMatch = validAccounts[trimmedEmail];

    setTimeout(() => {
      if (userMatch && userMatch.pass === password) {
        const session: UserSession = {
          email: trimmedEmail,
          name: userMatch.name,
          role: userMatch.role,
          token: `session_${Date.now()}`,
          loggedInAt: new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('billing_ledger_session', JSON.stringify(session));
        }

        router.replace('/');
      } else {
        setError('Invalid credentials. Please verify your email and password.');
        setIsLoading(false);
      }
    }, 400);
  };

  const quickFill = (demoEmail: string) => {
    const acc = validAccounts[demoEmail];
    if (acc) {
      setEmail(demoEmail);
      setPassword(acc.pass);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-ios-blue/15 to-ios-purple/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0a84ff] to-[#5e5ce6] flex items-center justify-center shadow-xl shadow-[#0a84ff]/25 border border-white/20">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Billing Ledger</h1>
              <p className="text-xs text-[#8e8e93] mt-1">Daily Operational Cash & Bank Journal</p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-xs text-[#ff453a] flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@powertech.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#8e8e93]/60 focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/40 transition-all font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#8e8e93]/60 focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/40 transition-all font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0a84ff] hover:bg-[#0a84ff]/90 text-white text-sm font-semibold tracking-wide shadow-lg shadow-[#0a84ff]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Pre-configured Credentials */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <span className="text-[11px] font-medium text-[#8e8e93] block text-center uppercase tracking-wider">
              Quick Pre-configured Access
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickFill('admin@powertech.com')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-white flex flex-col items-center gap-1 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#0a84ff]" />
                <span className="font-semibold">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('accountant@powertech.com')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-white flex flex-col items-center gap-1 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
                <span className="font-semibold">Accounts</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('cashier@powertech.com')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-white flex flex-col items-center gap-1 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#ff9f0a]" />
                <span className="font-semibold">Cashier</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
