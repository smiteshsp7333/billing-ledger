'use client';

import React, { useState, useEffect } from 'react';
import { ActiveTab, UserSession } from '../../types';
import {
  Calendar,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Users,
  Lock,
  BarChart3,
  BookOpen,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react';

interface IOSHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenReceipt: () => void;
  onOpenPayment: () => void;
  onOpenInvoice: () => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isDayLocked: boolean;
  currentUser?: UserSession | null;
  onLogout?: () => void;
}

export default function IOSHeader({
  activeTab,
  setActiveTab,
  onOpenReceipt,
  onOpenPayment,
  onOpenInvoice,
  selectedDate,
  setSelectedDate,
  isDayLocked,
  currentUser,
  onLogout,
}: IOSHeaderProps) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { key: ActiveTab; label: string; icon: any }[] = [
    { key: 'DAYBOOK', label: 'Day Book', icon: BookOpen },
    { key: 'RECEIPTS', label: 'Receipts', icon: ArrowDownLeft },
    { key: 'PAYMENTS', label: 'Expenses', icon: ArrowUpRight },
    { key: 'INVOICES', label: 'Invoices', icon: FileText },
    { key: 'PARTIES', label: 'Party Ledgers', icon: Users },
    { key: 'EOD', label: 'EOD Audit Lock', icon: Lock },
    { key: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 ios-glass-header transition-all">
      {/* Top iOS Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between text-xs border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white/90 tracking-tight font-mono">{timeStr}</span>
          <span className="h-3 w-px bg-white/20" />
          <div className="flex items-center gap-1.5 text-ios-green font-medium">
            <span className="w-2 h-2 rounded-full bg-ios-green animate-pulse" />
            <span>System Online</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[11px] text-white/80 font-medium">
            <Calendar className="w-3.5 h-3.5 text-ios-blue" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
            />
          </div>

          {isDayLocked ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-ios-red/20 text-ios-red border border-ios-red/30 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Day Locked
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-ios-green/20 text-ios-green border border-ios-green/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Day Open
            </span>
          )}

          {/* User Profile & Logout Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">
              <User className="w-3.5 h-3.5 text-[#0a84ff]" />
              <span className="font-semibold text-white/90">{currentUser?.name || 'Administrator'}</span>
              <span className="text-[10px] font-bold text-[#8e8e93] px-1.5 py-0.5 rounded bg-white/10 uppercase">
                {currentUser?.role || 'Admin'}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Sign Out of Billing Ledger"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff453a]/15 hover:bg-[#ff453a]/25 border border-[#ff453a]/30 text-xs font-semibold text-[#ff453a] transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* App Title & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-ios-blue to-ios-indigo flex items-center justify-center shadow-lg shadow-ios-blue/20 border border-white/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Billing Ledger
            </h1>
            <p className="text-xs text-ios-gray">Daily Operational Cash & Bank Journal</p>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenReceipt}
            disabled={isDayLocked}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-ios-green/20 hover:bg-ios-green/30 text-ios-green border border-ios-green/30 font-semibold text-xs transition-all active:scale-95 disabled:opacity-40"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>+ Money In (Receipt)</span>
          </button>

          <button
            onClick={onOpenPayment}
            disabled={isDayLocked}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-ios-red/20 hover:bg-ios-red/30 text-ios-red border border-ios-red/30 font-semibold text-xs transition-all active:scale-95 disabled:opacity-40"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+ Money Out (Expense)</span>
          </button>

          <button
            onClick={onOpenInvoice}
            disabled={isDayLocked}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-ios-blue hover:bg-ios-blue/90 text-white font-semibold text-xs transition-all shadow-lg shadow-ios-blue/20 active:scale-95 disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Bill / Invoice</span>
          </button>
        </div>
      </div>

      {/* iOS Segmented Navigation Slider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 overflow-x-auto">
        <div className="ios-segmented">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`ios-segmented-item flex items-center gap-1.5 whitespace-nowrap ${
                  isActive ? 'active' : 'hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
