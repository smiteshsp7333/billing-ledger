'use client';

import React, { useState, useEffect } from 'react';
import { UserSession } from '../../types';
import {
  BookOpen,
  Calendar,
  LogOut,
  Plus,
  Printer,
  User,
  LayoutGrid,
  BarChart3,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface ExecutiveHeaderProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeView: 'DAILY' | 'MONTHLY';
  setActiveView: (view: 'DAILY' | 'MONTHLY') => void;
  currentUser: UserSession | null;
  onLogout: () => void;
  onOpenEntryModal: () => void;
}

export default function ExecutiveHeader({
  selectedDate,
  setSelectedDate,
  activeView,
  setActiveView,
  currentUser,
  onLogout,
  onOpenEntryModal,
}: ExecutiveHeaderProps) {
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

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#121214]/80 backdrop-blur-2xl border-b border-white/10 transition-all">
      {/* Top Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between text-xs border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white/90 font-mono">{timeStr}</span>
          <span className="h-3 w-px bg-white/20" />
          <div className="flex items-center gap-1.5 text-[#30d158] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
            <span>Multi-Company Network Live</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[11px] text-white/90 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#0a84ff]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* User Profile & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/15">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">
                <User className="w-3.5 h-3.5 text-[#0a84ff]" />
                <span className="font-semibold text-white/95">{currentUser.name}</span>
                <span className="text-[10px] font-bold text-[#8e8e93] px-1.5 py-0.5 rounded bg-white/10 uppercase">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                title="Sign Out"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff453a]/15 hover:bg-[#ff453a]/25 border border-[#ff453a]/30 text-xs font-semibold text-[#ff453a] transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0a84ff] to-[#5e5ce6] flex items-center justify-center shadow-lg shadow-[#0a84ff]/20 border border-white/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Billing Ledger
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#0a84ff]/20 text-[#0a84ff] border border-[#0a84ff]/30">
                9 Group Companies
              </span>
            </h1>
            <p className="text-xs text-[#8e8e93]">Daily Operational Collection & Consolidated Billing Matrix</p>
          </div>
        </div>

        {/* View Switches & Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Segmented View Switch */}
          <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex items-center gap-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveView('DAILY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'DAILY'
                  ? 'bg-[#0a84ff] text-white shadow-sm font-semibold'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Daily Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('MONTHLY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'MONTHLY'
                  ? 'bg-[#0a84ff] text-white shadow-sm font-semibold'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Monthly Cumulative</span>
            </button>
          </div>

          {/* Quick Entry Button */}
          <button
            type="button"
            onClick={onOpenEntryModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#30d158] hover:bg-[#30d158]/90 text-white text-xs font-semibold shadow-lg shadow-[#30d158]/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Update Daily Entry</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            title="Print Master Sheet"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8e8e93] hover:text-white flex items-center justify-center transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
