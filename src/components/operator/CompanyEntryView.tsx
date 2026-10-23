'use client';

import React, { useState, useEffect } from 'react';
import { CompanyDailyEntry, UserSession } from '../../types';
import { GROUP_COMPANIES } from '../../lib/companies';
import { getCompanyEntries, saveCompanyDailyEntry } from '../../lib/store';
import {
  Calendar,
  Check,
  CheckCircle2,
  History,
} from 'lucide-react';

interface CompanyEntryViewProps {
  currentUser: UserSession;
  selectedDate: string;
}

export default function CompanyEntryView({ currentUser, selectedDate }: CompanyEntryViewProps) {
  const assignedCompanyId = currentUser.companyId || 'merit-i-laser';
  const company = GROUP_COMPANIES.find((c) => c.id === assignedCompanyId) || GROUP_COMPANIES[0];

  const [date, setDate] = useState(selectedDate);
  const [todayBilling, setTodayBilling] = useState('');
  const [todayPayment, setTodayPayment] = useState('');
  const [purchaseValue, setPurchaseValue] = useState('');
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [history, setHistory] = useState<CompanyDailyEntry[]>([]);

  useEffect(() => {
    setDate(selectedDate);
    refreshHistory();
  }, [selectedDate, assignedCompanyId]);

  const refreshHistory = () => {
    const list = getCompanyEntries(company.id);
    setHistory(list);

    const existingToday = list.find((e) => e.date === selectedDate);
    if (existingToday) {
      setTodayBilling(String(existingToday.todayBilling));
      setTodayPayment(String(existingToday.todayPayment));
      setPurchaseValue(String(existingToday.purchaseValue || ''));
      setNotes(existingToday.notes || '');
    } else {
      setTodayBilling('');
      setTodayPayment('');
      setPurchaseValue('');
      setNotes('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bill = parseFloat(todayBilling) || 0;
    const pay = parseFloat(todayPayment) || 0;
    const pur = parseFloat(purchaseValue) || 0;

    const entry: CompanyDailyEntry = {
      id: `${company.id}_${date}`,
      companyId: company.id,
      companyName: company.name,
      date,
      todayBilling: bill,
      todayPayment: pay,
      purchaseValue: pur,
      notes: notes.trim() || undefined,
      submittedBy: currentUser.name,
      submittedAt: new Date().toISOString(),
    };

    saveCompanyDailyEntry(entry);
    setSavedSuccess(true);
    refreshHistory();

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const currentMonth = date.slice(0, 7);
  const monthEntries = history.filter((h) => h.date.startsWith(currentMonth));
  const monthBillingTotal = monthEntries.reduce((sum, h) => sum + h.todayBilling, 0);
  const monthPaymentTotal = monthEntries.reduce((sum, h) => sum + h.todayPayment, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0a84ff] to-[#5e5ce6] flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/20">
            {company.code}
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#0a84ff] bg-[#0a84ff]/15 px-2 py-0.5 rounded border border-[#0a84ff]/30">
              Assigned Entity Portal
            </span>
            <h1 className="text-xl font-bold text-white mt-1">{company.name}</h1>
            <p className="text-xs text-[#8e8e93]">Daily Collection & Operational Billing Desk</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-right">
            <span className="text-[10px] text-[#8e8e93] block">Month-to-Date Billing</span>
            <span className="text-sm font-bold font-mono text-white">
              ₹{monthBillingTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-right">
            <span className="text-[10px] text-[#8e8e93] block">Month-to-Date Payment (TP)</span>
            <span className="text-sm font-bold font-mono text-[#30d158]">
              ₹{monthPaymentTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#1c1c1e]/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Submit Daily Overall Numbers</h2>
            <p className="text-xs text-[#8e8e93]">
              No line-item invoice data needed • Simple overall day collection & billing
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <Calendar className="w-4 h-4 text-[#0a84ff]" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 mb-6 rounded-2xl bg-[#30d158]/20 border border-[#30d158]/40 text-xs text-[#30d158] font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Daily numbers successfully updated and published to Super Admin master console!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/90">
                Today Total Billing (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  value={todayBilling}
                  onChange={(e) => setTodayBilling(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white font-mono text-2xl font-bold focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/30 transition-all"
                  required
                />
              </div>
              <span className="text-[11px] text-[#8e8e93]">Gross bill value generated today</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/90">
                Today Payment / Collection (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#30d158]/60 text-xl font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  value={todayPayment}
                  onChange={(e) => setTodayPayment(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-[#30d158] font-mono text-2xl font-bold focus:outline-none focus:border-[#30d158] focus:ring-1 focus:ring-[#30d158]/30 transition-all"
                  required
                />
              </div>
              <span className="text-[11px] text-[#8e8e93]">Total money collected in cash, UPI, or bank</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/90">
                Purchase / Outward Value (₹) - Optional
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-base font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  value={purchaseValue}
                  onChange={(e) => setPurchaseValue(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-base focus:outline-none focus:border-[#0a84ff] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/90">
                Day Notes / Remark (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Client XYZ cleared bulk balance"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#0a84ff] transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-4">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-[#30d158] hover:bg-[#30d158]/90 text-white text-sm font-bold shadow-lg shadow-[#30d158]/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>Submit Today Numbers</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-[#0a84ff]" />
            Submission Log ({company.name})
          </span>
          <span className="text-[11px] text-[#8e8e93]">Last 15 days</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[#8e8e93] uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Billing</th>
                <th className="py-2.5 px-4 text-right">Payment / Collection</th>
                <th className="py-2.5 px-4 text-right">Purchase</th>
                <th className="py-2.5 px-4">Remarks</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {history.slice(0, 10).map((h) => (
                <tr key={h.id} className="hover:bg-white/[0.03]">
                  <td className="py-3 px-4 font-semibold text-white">{h.date}</td>
                  <td className="py-3 px-4 text-right text-white">₹{h.todayBilling.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-[#30d158] font-bold">₹{h.todayPayment.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-white/70">₹{(h.purchaseValue || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-sans text-xs text-[#8e8e93] truncate max-w-xs">{h.notes || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#30d158]/15 text-[#30d158]">
                      <CheckCircle2 className="w-3 h-3" /> Recorded
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
