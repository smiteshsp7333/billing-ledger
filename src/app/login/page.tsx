'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';
import { UserSession } from '../../types';
import { GROUP_COMPANIES, SYSTEM_ACCOUNTS } from '../../lib/companies';

export default function LoginPage() {
  const router = useRouter();

  const [loginType, setLoginType] = useState<'COMPANY' | 'ADMIN'>('COMPANY');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(GROUP_COMPANIES[0].id);
  const [identifier, setIdentifier] = useState('admin@powertech.com');
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

  const activeCompany = GROUP_COMPANIES.find((c) => c.id === selectedCompanyId);
  const activeAccount = SYSTEM_ACCOUNTS.find((a) => a.companyId === selectedCompanyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      let matchedAccount = null;

      if (loginType === 'ADMIN') {
        const rawId = identifier.trim().toLowerCase();
        matchedAccount = SYSTEM_ACCOUNTS.find(
          (acc) =>
            acc.role === 'SUPER_ADMIN' &&
            (acc.email.toLowerCase() === rawId || acc.username.toLowerCase() === rawId)
        );

        if (!matchedAccount || matchedAccount.pass !== password) {
          setError('Invalid Super Admin credentials. Please check your username/email and password.');
          setIsLoading(false);
          return;
        }
      } else {
        // Company login
        matchedAccount = SYSTEM_ACCOUNTS.find(
          (acc) => acc.companyId === selectedCompanyId
        );

        if (!matchedAccount) {
          setError('Selected entity not found in registry.');
          setIsLoading(false);
          return;
        }

        const validPasses = [
          matchedAccount.pass,
          `${matchedAccount.username}123`,
          `${activeCompany?.code.toLowerCase()}123`,
        ];

        if (!validPasses.includes(password.trim())) {
          setError(`Invalid company password. Pass key is: ${matchedAccount.pass}`);
          setIsLoading(false);
          return;
        }
      }

      const session: UserSession = {
        email: matchedAccount.email,
        username: matchedAccount.username,
        name: matchedAccount.name,
        role: matchedAccount.role,
        companyId: matchedAccount.companyId,
        companyName: matchedAccount.companyName,
        token: `session_${Date.now()}`,
        loggedInAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('billing_ledger_session', JSON.stringify(session));
      }

      router.replace('/');
    }, 350);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#0a84ff]/15 to-[#5e5ce6]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0a84ff] to-[#5e5ce6] flex items-center justify-center shadow-xl shadow-[#0a84ff]/25 border border-white/20">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Billing Ledger</h1>
              <p className="text-xs text-[#8e8e93] mt-1">Multi-Company Executive Consolidation & Branch Terminal</p>
            </div>
          </div>

          {/* Segmented Login Mode Selector */}
          <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setLoginType('COMPANY');
                setError(null);
                setPassword('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                loginType === 'COMPANY'
                  ? 'bg-[#0a84ff] text-white shadow-md shadow-[#0a84ff]/30'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Company Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginType('ADMIN');
                setError(null);
                setPassword('');
                setIdentifier('admin@powertech.com');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                loginType === 'ADMIN'
                  ? 'bg-[#0a84ff] text-white shadow-md shadow-[#0a84ff]/30'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-xs text-[#ff453a] flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginType === 'COMPANY' ? (
              // COMPANY PORTAL SELECTOR
              <div>
                <label className="block text-xs font-medium text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0a84ff]" /> Select Registered Entity
                </label>
                <div className="relative">
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => {
                      setSelectedCompanyId(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-[#2c2c2e] border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/40 transition-all cursor-pointer"
                  >
                    {GROUP_COMPANIES.map((comp) => (
                      <option key={comp.id} value={comp.id} className="bg-[#2c2c2e] text-white py-1">
                        {comp.name} ({comp.code})
                      </option>
                    ))}
                  </select>
                </div>
                {activeCompany && activeAccount && (
                  <p className="text-[11px] text-[#8e8e93] mt-1.5 pl-1">
                    Entity: <span className="text-white font-medium">{activeCompany.location}</span> • Access Password: <span className="font-mono text-[#30d158] font-bold">{activeAccount.pass}</span>
                  </p>
                )}
              </div>
            ) : (
              // SUPER ADMIN LOGIN
              <div>
                <label className="block text-xs font-medium text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0a84ff]" /> Super Admin Email / Username
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@powertech.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-[#8e8e93]/60 focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/40 transition-all font-sans"
                  required
                />
                <p className="text-[11px] text-[#8e8e93] mt-1 pl-1">
                  Default: <span className="text-white font-mono">admin@powertech.com</span> • Password: <span className="font-mono text-[#30d158] font-bold">admin123</span>
                </p>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0a84ff]" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access password"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-[#8e8e93]/60 focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/40 transition-all font-sans"
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
              className="w-full py-3.5 px-4 rounded-xl bg-[#0a84ff] hover:bg-[#0a84ff]/90 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-[#0a84ff]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {loginType === 'COMPANY' ? 'Sign In to Company Portal' : 'Sign In to Super Admin'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Clean footer info */}
          <div className="pt-3 border-t border-white/10 text-center">
            <span className="text-[11px] text-[#8e8e93]">
              Power Tech Group • Secured Financial Consolidation Network
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
