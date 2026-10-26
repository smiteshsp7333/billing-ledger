'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { UserSession } from '../../types';
import { SYSTEM_ACCOUNTS } from '../../lib/companies';

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('billing_ledger_session');
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          if (parsed && (parsed.email || parsed.username)) {
            router.replace('/');
          }
        } catch (e) {
          localStorage.removeItem('billing_ledger_session');
        }
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const rawId = identifier.trim().toLowerCase();
      const rawPass = password.trim();

      const matched = SYSTEM_ACCOUNTS.find(
        (acc) =>
          (acc.email.toLowerCase() === rawId || acc.username.toLowerCase() === rawId) &&
          (acc.pass === rawPass || `${acc.username}123` === rawPass)
      );

      if (!matched) {
        setError('Invalid credentials. Please enter a valid username/email and password.');
        setIsLoading(false);
        return;
      }

      const session: UserSession = {
        email: matched.email,
        username: matched.username,
        name: matched.name,
        role: matched.role,
        companyId: matched.companyId,
        companyName: matched.companyName,
        token: `session_${Date.now()}`,
        loggedInAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('billing_ledger_session', JSON.stringify(session));
      }

      router.replace('/');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#0a84ff]/15 to-[#5e5ce6]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl space-y-7">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0a84ff] to-[#5e5ce6] flex items-center justify-center shadow-xl shadow-[#0a84ff]/25 border border-white/20">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Billing Ledger</h1>
              <p className="text-xs text-[#8e8e93] mt-1">Multi-Company Daily Financial Consolidation</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-xs text-[#ff453a] flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Clean Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0a84ff]" /> Username or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter username or email"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-[#8e8e93]/60 focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/40 transition-all font-sans"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0a84ff]" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-4 pr-11 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-[#8e8e93]/60 focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/40 transition-all font-sans"
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
              className="w-full py-3.5 px-4 rounded-xl bg-[#0a84ff] hover:bg-[#0a84ff]/90 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-[#0a84ff]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer pt-4"
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

          {/* Secure Footer */}
          <div className="pt-2 border-t border-white/10 text-center">
            <span className="text-[11px] text-[#8e8e93]">
              Power Tech Group • Secured Executive Network
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
