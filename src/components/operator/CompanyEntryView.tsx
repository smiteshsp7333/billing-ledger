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
  Building2,
  AlertCircle,
  Clock,
  Lock,
  Edit3,
} from 'lucide-react';

interface CompanyEntryViewProps {
  currentUser: UserSession;
  selectedDate: string;
}

export default function CompanyEntryView({ currentUser, selectedDate }: CompanyEntryViewProps) {
  const assignedCompanyId = currentUser.companyId || 'merit-i-laser';
  const company = GROUP_COMPANIES.find((c) => c.id === assignedCompanyId) || GROUP_COMPANIES[0];

  const todayDateStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(selectedDate);
  const [todayBilling, setTodayBilling] = useState('');
  const [gstPayment, setGstPayment] = useState('');
  const [otherPayment, setOtherPayment] = useState('');
  const [paymentReceivedAt, setPaymentReceivedAt] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<CompanyDailyEntry[]>([]);

  // Same-day edit rule:
  // Can only edit if the date being entered/viewed is today's current calendar date or the active register date
  const isSameDay = date === todayDateStr || date === selectedDate;

  useEffect(() => {
    setDate(selectedDate);
    refreshHistory(selectedDate);
  }, [selectedDate, assignedCompanyId]);

  const refreshHistory = (activeDate: string) => {
    const list = getCompanyEntries(company.id);
    setHistory(list);

    const existingToday = list.find((e) => e.date === activeDate);
    if (existingToday) {
      setTodayBilling(String(existingToday.todayBilling));
      setGstPayment(String(existingToday.gstPayment ?? Math.round(existingToday.todayPayment * 0.75)));
      setOtherPayment(String(existingToday.otherPayment ?? Math.round(existingToday.todayPayment * 0.25)));
      setPaymentReceivedAt(existingToday.paymentReceivedAt || getDefaultDateTime(activeDate));
    } else {
      setTodayBilling('');
      setGstPayment('');
      setOtherPayment('');
      setPaymentReceivedAt(getDefaultDateTime(activeDate));
    }
  };

  const getDefaultDateTime = (d: string) => {
    const formatted = d.split('-').reverse().join('-');
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${formatted}, ${time}`;
  };

  const calculatedTotalPayment =
    (parseFloat(gstPayment) || 0) + (parseFloat(otherPayment) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Enforce Same-day edit rule
    if (!isSameDay) {
      setErrorMessage('Entries can only be edited on the same day when made. Past dates are locked.');
      return;
    }

    if (!todayBilling.trim()) {
      setErrorMessage('Today Total Billing is mandatory.');
      return;
    }
    const bill = parseFloat(todayBilling);
    if (isNaN(bill) || bill < 0) {
      setErrorMessage('Please enter a valid Today Total Billing figure.');
      return;
    }

    if (!gstPayment.trim()) {
      setErrorMessage('GST Collection is mandatory (enter 0 if nil).');
      return;
    }
    const gst = parseFloat(gstPayment);
    if (isNaN(gst) || gst < 0) {
      setErrorMessage('Please enter a valid GST Collection figure.');
      return;
    }

    if (!otherPayment.trim()) {
      setErrorMessage('Others Collection is mandatory (enter 0 if nil).');
      return;
    }
    const other = parseFloat(otherPayment);
    if (isNaN(other) || other < 0) {
      setErrorMessage('Please enter a valid Others Collection figure.');
      return;
    }

    const totalPay = gst + other;

    const entry: CompanyDailyEntry = {
      id: `${company.id}_${date}`,
      companyId: company.id,
      companyName: company.name,
      date,
      todayBilling: bill,
      gstPayment: gst,
      otherPayment: other,
      todayPayment: totalPay,
      paymentReceivedAt: paymentReceivedAt.trim() || getDefaultDateTime(date),
      submittedBy: currentUser.name || `${company.code} Operator`,
      submittedAt: new Date().toISOString(),
    };

    saveCompanyDailyEntry(entry);
    setSavedSuccess(true);
    refreshHistory(date);

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  };

  const handleEditRow = (rowDate: string) => {
    setDate(rowDate);
    refreshHistory(rowDate);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Company Header Banner */}
      <div className="bg-[#1c1c1e]/85 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0a84ff] to-[#5e5ce6] flex items-center justify-center text-white font-mono font-bold text-xl shadow-lg border border-white/20">
            {company.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#30d158] bg-[#30d158]/15 px-2 py-0.5 rounded border border-[#30d158]/30">
                Operating Unit Portal
              </span>
              <span className="text-xs text-[#8e8e93] font-medium">{company.location}</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">{company.name}</h1>
            <p className="text-xs text-[#8e8e93]">Daily Collection & Operational Billing Desk</p>
          </div>
        </div>

        {/* Date Filter for Operator */}
        <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-2xl border border-white/10 text-xs">
          <Calendar className="w-4 h-4 text-[#0a84ff]" />
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              refreshHistory(e.target.value);
            }}
            className="bg-transparent text-white font-mono focus:outline-none cursor-pointer text-xs"
          />
        </div>
      </div>

      {/* Main Form: Focused on Billing, GST Collections & Others */}
      <div className="bg-[#1c1c1e]/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="pb-4 border-b border-white/10 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Record Daily Figures</h2>
            <p className="text-xs text-[#8e8e93]">
              Submit today&apos;s gross billing and collections breakdown.
            </p>
          </div>
          {!isSameDay ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ff453a]/15 text-[#ff453a] border border-[#ff453a]/30">
              <Lock className="w-3.5 h-3.5" />
              <span>Past Date (Locked)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Date (Editable Today)</span>
            </span>
          )}
        </div>

        {!isSameDay && (
          <div className="p-4 mb-6 rounded-2xl bg-[#ff9f0a]/15 border border-[#ff9f0a]/30 text-xs text-[#ff9f0a] font-medium flex items-center gap-2.5">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              Same-Day Edit Rule: Entries can only be modified on the same day of submission. This past-date record is locked for editing.
            </span>
          </div>
        )}

        {savedSuccess && (
          <div className="p-4 mb-6 rounded-2xl bg-[#30d158]/20 border border-[#30d158]/40 text-xs text-[#30d158] font-semibold flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Daily figures successfully recorded and synchronized to Super Admin Master Console!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 mb-6 rounded-2xl bg-[#ff453a]/20 border border-[#ff453a]/40 text-xs text-[#ff453a] font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Today Billing & Calculated Total Collection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/95 flex items-center justify-between">
                <span>Today Total Billing (₹)</span>
                <span className="text-[#0a84ff] text-[11px] font-bold">Mandatory *</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  disabled={!isSameDay}
                  value={todayBilling}
                  onChange={(e) => setTodayBilling(e.target.value)}
                  placeholder="0"
                  className={`w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white font-mono text-2xl font-bold focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/30 transition-all ${
                    !isSameDay ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  required
                />
              </div>
              <span className="text-[11px] text-[#8e8e93]">Gross bill value produced today</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/95 flex items-center justify-between">
                <span>Total Payment / Collection (₹)</span>
                <span className="text-[#30d158] text-[11px] font-bold">Auto Sum</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#30d158]/60 text-xl font-mono">
                  ₹
                </span>
                <input
                  type="text"
                  readOnly
                  value={calculatedTotalPayment.toLocaleString('en-IN')}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/30 text-[#30d158] font-mono text-2xl font-bold focus:outline-none cursor-default"
                />
              </div>
              <span className="text-[11px] text-[#8e8e93]">Total collection (GST Collections + Others)</span>
            </div>
          </div>

          {/* Row 2: 2 Separate Columns - GST Collections & Others */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/95 flex items-center justify-between">
                <span>GST Collection (₹)</span>
                <span className="text-[#0a84ff] text-[11px] font-bold">Mandatory *</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-base font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  disabled={!isSameDay}
                  value={gstPayment}
                  onChange={(e) => setGstPayment(e.target.value)}
                  placeholder="0"
                  className={`w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base font-bold focus:outline-none focus:border-[#0a84ff] transition-all ${
                    !isSameDay ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  required
                />
              </div>
              <span className="text-[11px] text-[#8e8e93]">Collections received against GST / Tax invoice</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/95 flex items-center justify-between">
                <span>Others (₹)</span>
                <span className="text-[#0a84ff] text-[11px] font-bold">Mandatory *</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-base font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  disabled={!isSameDay}
                  value={otherPayment}
                  onChange={(e) => setOtherPayment(e.target.value)}
                  placeholder="0"
                  className={`w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base font-bold focus:outline-none focus:border-[#0a84ff] transition-all ${
                    !isSameDay ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  required
                />
              </div>
              <span className="text-[11px] text-[#8e8e93]">Other collections (Enter 0 if nil)</span>
            </div>
          </div>

          {/* Row 3: Timestamp */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/95 flex items-center justify-between">
              <span>Payment Received Date &amp; Time</span>
              <span className="text-[#8e8e93] text-[11px]">System Timestamp</span>
            </label>
            <input
              type="text"
              disabled={!isSameDay}
              value={paymentReceivedAt}
              onChange={(e) => setPaymentReceivedAt(e.target.value)}
              placeholder="e.g. 23-10-2026, 04:30 PM"
              className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#0a84ff] transition-all ${
                !isSameDay ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end">
            {isSameDay ? (
              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-[#30d158] hover:bg-[#30d158]/90 text-white text-sm font-bold shadow-lg shadow-[#30d158]/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>Submit &amp; Publish to Super Admin</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#8e8e93] bg-white/5 px-4 py-2.5 rounded-xl border border-white/10">
                <Lock className="w-4 h-4 text-[#ff9f0a]" />
                <span>Locked: Cannot edit past-day entries</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Submission Audit Log - STRICTLY LAST 7 DAYS DATA ONLY */}
      <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-[#0a84ff]" />
            Submission Log ({company.name})
          </span>
          <span className="text-[11px] text-[#0a84ff] font-semibold px-2 py-0.5 rounded bg-[#0a84ff]/10 border border-[#0a84ff]/20">
            Last 7 Days Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[#8e8e93] uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Billing</th>
                <th className="py-2.5 px-4 text-right">GST Collection</th>
                <th className="py-2.5 px-4 text-right">Others</th>
                <th className="py-2.5 px-4 text-right">Total Payment</th>
                <th className="py-2.5 px-4 text-center">Payment Received At</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {/* Displaying ONLY last 7 days records */}
              {history.slice(0, 7).map((h) => {
                const canEditThisRow = h.date === todayDateStr || h.date === selectedDate;
                const gstVal = h.gstPayment ?? Math.round(h.todayPayment * 0.75);
                const otherVal = h.otherPayment ?? Math.round(h.todayPayment * 0.25);
                return (
                  <tr key={h.id} className="hover:bg-white/[0.03]">
                    <td className="py-3 px-4 font-semibold text-white">{h.date}</td>
                    <td className="py-3 px-4 text-right text-white">₹{h.todayBilling.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-[#0a84ff] font-bold">₹{gstVal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-[#bf5af2] font-semibold">₹{otherVal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-[#30d158] font-bold">₹{h.todayPayment.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center text-white/90 text-[11px]">{h.paymentReceivedAt || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#30d158]/15 text-[#30d158]">
                        <CheckCircle2 className="w-3 h-3" /> Recorded
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {canEditThisRow ? (
                        <button
                          type="button"
                          onClick={() => handleEditRow(h.date)}
                          className="px-2.5 py-1 rounded-lg bg-[#0a84ff]/20 hover:bg-[#0a84ff]/30 text-[#0a84ff] text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                          title="Edit today's submission"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] text-[#8e8e93] bg-white/5 border border-white/10 inline-flex items-center gap-1 cursor-not-allowed"
                          title="Locked - Past day records cannot be edited"
                        >
                          <Lock className="w-2.5 h-2.5 text-[#ff9f0a]" />
                          <span>Locked</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
