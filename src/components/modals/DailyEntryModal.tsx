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
  const [gstPayment, setGstPayment] = useState('');
  const [otherPayment, setOtherPayment] = useState('');
  const [paymentReceivedAt, setPaymentReceivedAt] = useState('');
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
      setGstPayment(String(existingEntry.gstPayment ?? Math.round(existingEntry.todayPayment * 0.75)));
      setOtherPayment(String(existingEntry.otherPayment ?? Math.round(existingEntry.todayPayment * 0.25)));
      setPaymentReceivedAt(existingEntry.paymentReceivedAt || getDefaultDateTime(existingEntry.date));
    } else {
      setTodayBilling('');
      setGstPayment('');
      setOtherPayment('');
      setPaymentReceivedAt(getDefaultDateTime(date));
    }
  }, [existingEntry, date, isOpen]);

  if (!isOpen) return null;

  const selectedCompany = GROUP_COMPANIES.find((c) => c.id === companyId);
  const totalPayment = (parseFloat(gstPayment) || 0) + (parseFloat(otherPayment) || 0);

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

    if (!gstPayment.trim()) {
      setError('GST Collection is mandatory (enter 0 if nil).');
      return;
    }
    const gst = parseFloat(gstPayment);
    if (isNaN(gst) || gst < 0) {
      setError('Please enter a valid GST Collection figure.');
      return;
    }

    if (!otherPayment.trim()) {
      setError('Others Collection is mandatory (enter 0 if nil).');
      return;
    }
    const other = parseFloat(otherPayment);
    if (isNaN(other) || other < 0) {
      setError('Please enter a valid Others Collection figure.');
      return;
    }

    const key = `${companyId}_${date}`;
    onSave({
      id: key,
      companyId,
      companyName: selectedCompany ? selectedCompany.name : companyId,
      date,
      todayBilling: bill,
      gstPayment: gst,
      otherPayment: other,
      todayPayment: gst + other,
      paymentReceivedAt: paymentReceivedAt.trim() || getDefaultDateTime(date),
      submittedBy: 'Super Admin',
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
              <p className="text-xs text-[#8e8e93]">Super Admin Manual Console</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#8e8e93] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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

          {/* Today Billing & Total Payment */}
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
                Total Collection (Auto-Calculated)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#30d158] font-medium text-sm">
                  ₹
                </span>
                <input
                  type="text"
                  readOnly
                  value={totalPayment.toLocaleString('en-IN')}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#30d158]/10 border border-[#30d158]/30 text-[#30d158] font-mono text-base font-bold focus:outline-none cursor-default"
                />
              </div>
            </div>
          </div>

          {/* GST Collection & Others */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-white/90 mb-1.5">
                GST Collection (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0a84ff] font-medium text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  value={gstPayment}
                  onChange={(e) => setGstPayment(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm font-bold focus:outline-none focus:border-[#0a84ff] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-white/90 mb-1.5">
                Others (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bf5af2] font-medium text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  value={otherPayment}
                  onChange={(e) => setOtherPayment(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm font-bold focus:outline-none focus:border-[#0a84ff] transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Received Date & Time */}
          <div>
            <label className="block font-semibold text-white/90 mb-1.5">
              Payment Received Date &amp; Time
            </label>
            <input
              type="text"
              value={paymentReceivedAt}
              onChange={(e) => setPaymentReceivedAt(e.target.value)}
              placeholder="e.g. 23-10-2026, 04:15 PM"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-[#0a84ff] transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-[#8e8e93] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#30d158] hover:bg-[#30d158]/90 text-white font-semibold shadow-lg shadow-[#30d158]/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Publish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
