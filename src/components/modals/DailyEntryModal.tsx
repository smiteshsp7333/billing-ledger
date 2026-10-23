'use client';

import React, { useState, useEffect } from 'react';
import { GroupCompany, CompanyDailyEntry } from '../../types';
import { GROUP_COMPANIES } from '../../lib/companies';
import { X, Check, Calendar, Building2 } from 'lucide-react';

interface DailyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  defaultCompanyId?: string;
  onSave: (entry: CompanyDailyEntry) => void;
  existingEntry?: CompanyDailyEntry;
}

export default function DailyEntryModal({
  isOpen,
  onClose,
  selectedDate,
  defaultCompanyId,
  onSave,
  existingEntry,
}: DailyEntryModalProps) {
  const [companyId, setCompanyId] = useState(defaultCompanyId || GROUP_COMPANIES[0].id);
  const [date, setDate] = useState(selectedDate);
  const [todayBilling, setTodayBilling] = useState('');
  const [todayPayment, setTodayPayment] = useState('');
  const [purchaseValue, setPurchaseValue] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDate(selectedDate);
      const targetCompany = defaultCompanyId || GROUP_COMPANIES[0].id;
      setCompanyId(targetCompany);

      if (existingEntry) {
        setTodayBilling(String(existingEntry.todayBilling || ''));
        setTodayPayment(String(existingEntry.todayPayment || ''));
        setPurchaseValue(String(existingEntry.purchaseValue || ''));
        setNotes(existingEntry.notes || '');
      } else {
        setTodayBilling('');
        setTodayPayment('');
        setPurchaseValue('');
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, selectedDate, defaultCompanyId, existingEntry]);

  if (!isOpen) return null;

  const selectedCompany = GROUP_COMPANIES.find((c) => c.id === companyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const bill = parseFloat(todayBilling);
    const pay = parseFloat(todayPayment);
    const pur = parseFloat(purchaseValue) || 0;

    if (isNaN(bill) || bill < 0) {
      setError('Please enter a valid Today Billing figure (0 or more).');
      return;
    }

    if (isNaN(pay) || pay < 0) {
      setError('Please enter a valid Today Payment / Collection figure (0 or more).');
      return;
    }

    const key = `${companyId}_${date}`;
    onSave({
      id: key,
      companyId,
      companyName: selectedCompany ? selectedCompany.name : companyId,
      date,
      todayBilling: bill,
      todayPayment: pay,
      purchaseValue: pur,
      notes: notes.trim() || undefined,
      submittedBy: 'Operator',
      submittedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#30d158]/15 text-[#30d158] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Record Daily Figures</h2>
              <p className="text-xs text-[#8e8e93]">Update Today Billing & Collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#8e8e93] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-xs text-[#ff453a]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Group Company *
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#2c2c2e] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#0a84ff] transition-all"
              >
                {GROUP_COMPANIES.map((comp) => (
                  <option key={comp.id} value={comp.id} className="bg-[#2c2c2e] text-white">
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Entry Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#0a84ff] transition-all"
                required
              />
            </div>
          </div>

          {/* Today Billing & Today Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Today Billing (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93] font-medium text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  value={todayBilling}
                  onChange={(e) => setTodayBilling(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-base font-bold focus:outline-none focus:border-[#0a84ff] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Today Payment / Collection (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93] font-medium text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  value={todayPayment}
                  onChange={(e) => setTodayPayment(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#30d158] font-mono text-base font-bold focus:outline-none focus:border-[#30d158] transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Purchase / Outward value */}
          <div>
            <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
              Purchase / Material Outward Value (₹) - Optional
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93] font-medium text-sm">
                ₹
              </span>
              <input
                type="number"
                step="1"
                value={purchaseValue}
                onChange={(e) => setPurchaseValue(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#0a84ff] transition-all"
              />
            </div>
          </div>

          {/* Notes / Remarks */}
          <div>
            <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
              Remarks / Narration (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Major client payment received via RTGS"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#0a84ff] transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-[#8e8e93] hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#30d158] hover:bg-[#30d158]/90 text-white text-xs font-semibold shadow-lg shadow-[#30d158]/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
