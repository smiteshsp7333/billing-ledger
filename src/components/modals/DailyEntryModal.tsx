'use client';

import React, { useState, useEffect } from 'react';
import { CompanyDailyEntry } from '../../types';
import { GROUP_COMPANIES } from '../../lib/companies';
import { X, Check, Building2, Calendar, AlertCircle } from 'lucide-react';

interface DailyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  defaultCompanyId?: string;
  existingEntry?: CompanyDailyEntry;
  onSave: (entry: CompanyDailyEntry) => void;
}

export default function DailyEntryModal({
  isOpen,
  onClose,
  selectedDate,
  defaultCompanyId,
  existingEntry,
  onSave,
}: DailyEntryModalProps) {
  const [companyId, setCompanyId] = useState(defaultCompanyId || GROUP_COMPANIES[0].id);
  const [date, setDate] = useState(selectedDate);
  const [todayBilling, setTodayBilling] = useState('');
  const [todayPayment, setTodayPayment] = useState('');
  const [purchaseValue, setPurchaseValue] = useState('');
  const [paymentMode, setPaymentMode] = useState<'BANK_TRANSFER' | 'UPI' | 'CASH' | 'CHEQUE'>('BANK_TRANSFER');
  const [paymentReceivedAt, setPaymentReceivedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedBy, setSubmittedBy] = useState('Super Admin');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultCompanyId) {
      setCompanyId(defaultCompanyId);
    }
  }, [defaultCompanyId]);

  useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate]);

  const getDefaultDateTime = (d: string) => {
    const formatted = d.split('-').reverse().join('-');
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${formatted}, ${time}`;
  };

  useEffect(() => {
    if (existingEntry) {
      setTodayBilling(String(existingEntry.todayBilling));
      setTodayPayment(String(existingEntry.todayPayment));
      setPurchaseValue(String(existingEntry.purchaseValue || '0'));
      setPaymentMode(existingEntry.paymentMode || 'BANK_TRANSFER');
      setPaymentReceivedAt(existingEntry.paymentReceivedAt || getDefaultDateTime(existingEntry.date));
      setNotes(existingEntry.notes || '');
      setSubmittedBy(existingEntry.submittedBy || 'Super Admin');
    } else {
      setTodayBilling('');
      setTodayPayment('');
      setPurchaseValue('0');
      setPaymentMode('BANK_TRANSFER');
      setPaymentReceivedAt(getDefaultDateTime(date));
      setNotes('');
      setSubmittedBy('Super Admin');
    }
  }, [existingEntry, date, isOpen]);

  if (!isOpen) return null;

  const selectedCompany = GROUP_COMPANIES.find((c) => c.id === companyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!todayBilling.trim()) {
      setError('Today Total Billing is mandatory.');
      return;
    }
    const bill = parseFloat(todayBilling);
    if (isNaN(bill) || bill < 0) {
      setError('Please enter a valid Today Billing figure (0 or more).');
      return;
    }

    if (!todayPayment.trim()) {
      setError('Today Payment / Collection is mandatory.');
      return;
    }
    const pay = parseFloat(todayPayment);
    if (isNaN(pay) || pay < 0) {
      setError('Please enter a valid Today Payment / Collection figure (0 or more).');
      return;
    }

    if (!purchaseValue.trim()) {
      setError('Purchase / Outward Value is mandatory (Enter 0 if none).');
      return;
    }
    const pur = parseFloat(purchaseValue);
    if (isNaN(pur) || pur < 0) {
      setError('Please enter a valid Purchase / Outward value.');
      return;
    }

    if (!paymentReceivedAt.trim()) {
      setError('Payment Received Date & Time is mandatory.');
      return;
    }

    if (!notes.trim()) {
      setError('Day Notes / Narration is mandatory.');
      return;
    }

    if (!submittedBy.trim()) {
      setError('Operator / Submitter Name is mandatory.');
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
      paymentMode,
      paymentReceivedAt: paymentReceivedAt.trim(),
      notes: notes.trim(),
      submittedBy: submittedBy.trim(),
      submittedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0a84ff]/20 text-[#0a84ff] flex items-center justify-center border border-[#0a84ff]/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Record Daily Entry</h2>
              <p className="text-xs text-[#8e8e93]">All fields are mandatory for executive audit</p>
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
          <div className="p-3 mb-4 rounded-xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-xs text-[#ff453a] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Company & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-white/90 mb-1.5">
                Group Company *
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#2c2c2e] border border-white/10 text-white font-semibold focus:outline-none focus:border-[#0a84ff] transition-all"
              >
                {GROUP_COMPANIES.map((comp) => (
                  <option key={comp.id} value={comp.id} className="bg-[#2c2c2e] text-white">
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-white/90 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0a84ff]" /> Entry Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-[#0a84ff] transition-all"
                required
              />
            </div>
          </div>

          {/* Today Billing & Today Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-white/90 mb-1.5">
                Today Total Billing (₹) *
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
              <label className="block font-semibold text-white/90 mb-1.5">
                Today Payment / Collection (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#30d158] font-medium text-sm">
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

          {/* Purchase Outward & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-white/90 mb-1.5">
                Purchase / Outward Value (₹) *
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
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-white/90 mb-1.5">
                Payment Mode *
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#2c2c2e] border border-white/10 text-white font-semibold focus:outline-none focus:border-[#0a84ff] transition-all"
                required
              >
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI / QR Transfer</option>
                <option value="CHEQUE">Cheque Clearance</option>
                <option value="CASH">Cash Deposit</option>
              </select>
            </div>
          </div>

          {/* Payment Received Date & Time & Submitter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-white/90 mb-1.5">
                Payment Received Date & Time *
              </label>
              <input
                type="text"
                value={paymentReceivedAt}
                onChange={(e) => setPaymentReceivedAt(e.target.value)}
                placeholder="e.g. 23-10-2026, 04:15 PM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-[#0a84ff] transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-white/90 mb-1.5">
                Recorded By / Operator *
              </label>
              <input
                type="text"
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                placeholder="Super Admin / Operator"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0a84ff] transition-all"
                required
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-white/90 mb-1.5">
              Day Notes / Narration *
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared via RTGS from principal client"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0a84ff] transition-all"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-[#8e8e93] hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#30d158] hover:bg-[#30d158]/90 text-white font-semibold shadow-lg shadow-[#30d158]/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Publish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
