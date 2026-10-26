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
  CreditCard,
  User,
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
  const [paymentMode, setPaymentMode] = useState<'BANK_TRANSFER' | 'UPI' | 'CASH' | 'CHEQUE'>('BANK_TRANSFER');
  const [paymentReceivedAt, setPaymentReceivedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [operatorName, setOperatorName] = useState(currentUser.name || 'Branch Operator');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<CompanyDailyEntry[]>([]);

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
      setTodayPayment(String(existingToday.todayPayment));
      setPurchaseValue(String(existingToday.purchaseValue || ''));
      setPaymentMode(existingToday.paymentMode || 'BANK_TRANSFER');
      setPaymentReceivedAt(existingToday.paymentReceivedAt || getDefaultDateTime(activeDate));
      setNotes(existingToday.notes || '');
      setOperatorName(existingToday.submittedBy || currentUser.name);
    } else {
      setTodayBilling('');
      setTodayPayment('');
      setPurchaseValue('');
      setPaymentMode('BANK_TRANSFER');
      setPaymentReceivedAt(getDefaultDateTime(activeDate));
      setNotes('');
      setOperatorName(currentUser.name || 'Branch Operator');
    }
  };

  const getDefaultDateTime = (d: string) => {
    const formatted = d.split('-').reverse().join('-');
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${formatted}, ${time}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict validation - ALL fields mandatory
    if (!todayBilling.trim()) {
      setErrorMessage('Today Total Billing is mandatory.');
      return;
    }
    const bill = parseFloat(todayBilling);
    if (isNaN(bill) || bill < 0) {
      setErrorMessage('Please enter a valid Today Total Billing figure.');
      return;
    }

    if (!todayPayment.trim()) {
      setErrorMessage('Today Payment / Collection is mandatory.');
      return;
    }
    const pay = parseFloat(todayPayment);
    if (isNaN(pay) || pay < 0) {
      setErrorMessage('Please enter a valid Today Payment figure.');
      return;
    }

    if (!purchaseValue.trim()) {
      setErrorMessage('Purchase / Material Outward Value is mandatory (Enter 0 if nil).');
      return;
    }
    const pur = parseFloat(purchaseValue);
    if (isNaN(pur) || pur < 0) {
      setErrorMessage('Please enter a valid Purchase / Outward value.');
      return;
    }

    if (!paymentReceivedAt.trim()) {
      setErrorMessage('Payment Received Date & Time is mandatory.');
      return;
    }

    if (!notes.trim()) {
      setErrorMessage('Day Notes / Remarks is mandatory.');
      return;
    }

    if (!operatorName.trim()) {
      setErrorMessage('Operator / Submitter Name is mandatory.');
      return;
    }

    const entry: CompanyDailyEntry = {
      id: `${company.id}_${date}`,
      companyId: company.id,
      companyName: company.name,
      date,
      todayBilling: bill,
      todayPayment: pay,
      purchaseValue: pur,
      paymentMode,
      paymentReceivedAt: paymentReceivedAt.trim(),
      notes: notes.trim(),
      submittedBy: operatorName.trim(),
      submittedAt: new Date().toISOString(),
    };

    saveCompanyDailyEntry(entry);
    setSavedSuccess(true);
    refreshHistory(date);

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Company Header Banner - Month-to-Date billing & payment metrics removed as requested */}
      <div className="bg-[#1c1c1e]/85 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0a84ff] to-[#5e5ce6] flex items-center justify-center text-white font-mono font-bold text-xl shadow-lg border border-white/20">
            {company.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#0a84ff] bg-[#0a84ff]/15 px-2 py-0.5 rounded border border-[#0a84ff]/30">
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

      {/* Main Form: Clean, focused entry */}
      <div className="bg-[#1c1c1e]/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="pb-4 border-b border-white/10 mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Record Daily Figures</h2>
          <p className="text-xs text-[#8e8e93]">
            Submit today's gross billing, collections, and outward values. All fields are mandatory.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 mb-6 rounded-2xl bg-[#30d158]/20 border border-[#30d158]/40 text-xs text-[#30d158] font-semibold flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Daily numbers successfully recorded and synchronized to Super Admin Master Console!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 mb-6 rounded-2xl bg-[#ff453a]/20 border border-[#ff453a]/40 text-xs text-[#ff453a] font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Today Billing & Today Payment */}
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
                  value={todayBilling}
                  onChange={(e) => setTodayBilling(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white font-mono text-2xl font-bold focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/30 transition-all"
                  required
                />
              </div>
              <span className="text-[11px] text-[#8e8e93]">Gross bill value produced today</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/95 flex items-center justify-between">
                <span>Today Payment / Collection (₹)</span>
                <span className="text-[#30d158] text-[11px] font-bold">Mandatory *</span>
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
              <span className="text-[11px] text-[#8e8e93]">Total collection received today</span>
            </div>
          </div>

          {/* Row 2: Purchase Outward & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/95 flex items-center justify-between">
                <span>Purchase / Material Outward Value (₹)</span>
                <span className="text-[#0a84ff] text-[11px] font-bold">Mandatory *</span>
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
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-[#0a84ff] transition-all"
                  required
                />
              </div>
              <span className="text-[11px] text-[#8e8e93]">Material cost or outward expenditure</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/95 flex items-center justify-between">
                <span>Payment Mode</span>
                <span className="text-[#0a84ff] text-[11px] font-bold">Mandatory *</span>
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-[#2c2c2e] border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-[#0a84ff] transition-all"
                required
              >
                <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS)</option>
                <option value="UPI">UPI / Digital QR</option>
                <option value="CHEQUE">Cheque Clearance</option>
                <option value="CASH">Cash Collection</option>
              </select>
              <span className="text-[11px] text-[#8e8e93]">Primary mode of collection</span>
            </div>
          </div>

          {/* Row 3: Payment Received Date & Time & Submitter Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/95 flex items-center justify-between">
                <span>Payment Received Date & Time</span>
                <span className="text-[#0a84ff] text-[11px] font-bold">Mandatory *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={paymentReceivedAt}
                  onChange={(e) => setPaymentReceivedAt(e.target.value)}
                  placeholder="e.g. 26-10-2026, 04:30 PM"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#0a84ff] transition-all"
                  required
                />
              </div>
              <span className="text-[11px] text-[#8e8e93]">Date and timestamp when funds were realized</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/95 flex items-center justify-between">
                <span>Operator / Received By</span>
                <span className="text-[#0a84ff] text-[11px] font-bold">Mandatory *</span>
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Operator name"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-[#0a84ff] transition-all"
                required
              />
              <span className="text-[11px] text-[#8e8e93]">Person submitting this record</span>
            </div>
          </div>

          {/* Row 4: Day Notes / Remarks */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/95 flex items-center justify-between">
              <span>Day Notes / Narration</span>
              <span className="text-[#0a84ff] text-[11px] font-bold">Mandatory *</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Major fabrication invoice cleared; shift 2 pending"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-[#0a84ff] transition-all"
              required
            />
            <span className="text-[11px] text-[#8e8e93]">Operational log and client remarks for audit</span>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-[#30d158] hover:bg-[#30d158]/90 text-white text-sm font-bold shadow-lg shadow-[#30d158]/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>Submit & Publish to Super Admin</span>
            </button>
          </div>
        </form>
      </div>

      {/* Submission Audit Log */}
      <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-[#0a84ff]" />
            Submission Log ({company.name})
          </span>
          <span className="text-[11px] text-[#8e8e93]">Historical records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[#8e8e93] uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Billing</th>
                <th className="py-2.5 px-4 text-right">Payment</th>
                <th className="py-2.5 px-4 text-center">Payment Received At</th>
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
                  <td className="py-3 px-4 text-center text-white/90 text-[11px]">{h.paymentReceivedAt || '-'}</td>
                  <td className="py-3 px-4 text-right text-white/70">₹{(h.purchaseValue || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-sans text-xs text-[#8e8e93] truncate max-w-xs">{h.notes}</td>
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
