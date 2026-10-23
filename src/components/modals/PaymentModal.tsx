'use client';

import React, { useState, useEffect } from 'react';
import { Party, PaymentChannel, Payment, ExpenseCategory } from '../../types';
import { X, ArrowUpRight, Check, Calendar, Banknote, Landmark, QrCode, CreditCard, FileCheck2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  onSave: (data: Omit<Payment, 'id' | 'voucherNumber' | 'createdAt'>) => void;
  selectedDate: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  parties,
  onSave,
  selectedDate,
}: PaymentModalProps) {
  const [payeeType, setPayeeType] = useState<'REGISTERED' | 'CUSTOM'>('CUSTOM');
  const [partyId, setPartyId] = useState('');
  const [customPayeeName, setCustomPayeeName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('OFFICE_EXPENSE');
  const [channel, setChannel] = useState<PaymentChannel>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setDate(selectedDate);
      setPayeeType('CUSTOM');
      setPartyId(parties.length > 0 ? parties[0].id : '');
      setCustomPayeeName('');
      setAmount('');
      setCategory('OFFICE_EXPENSE');
      setChannel('CASH');
      setReferenceNumber('');
      setBillNumber('');
      setNotes('');
      setErrors({});
    }
  }, [isOpen, selectedDate, parties]);

  if (!isOpen) return null;

  const selectedParty = parties.find((p) => p.id === partyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than zero.';
    }

    let finalPayeeName = '';
    if (payeeType === 'REGISTERED' && selectedParty) {
      finalPayeeName = selectedParty.name;
    } else if (customPayeeName.trim()) {
      finalPayeeName = customPayeeName.trim();
    } else {
      newErrors.payee = 'Please provide payee or vendor name.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    onSave({
      date,
      timestamp: timeStr,
      payeeName: finalPayeeName,
      partyId: payeeType === 'REGISTERED' ? partyId : undefined,
      amount: numAmount,
      category,
      channel,
      referenceNumber: referenceNumber.trim() || undefined,
      billNumber: billNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const categories: { key: ExpenseCategory; label: string }[] = [
    { key: 'SUPPLIER_PURCHASE', label: 'Supplier / Purchase' },
    { key: 'FREIGHT_LOGISTICS', label: 'Freight & Logistics' },
    { key: 'OFFICE_EXPENSE', label: 'Office Expense' },
    { key: 'PETTY_CASH', label: 'Petty Cash Disbursal' },
    { key: 'RENT_UTILITIES', label: 'Rent, Electricity & Bills' },
    { key: 'SALARY_ADVANCE', label: 'Salary / Staff Advance' },
    { key: 'TAX_DUTY', label: 'GST / Customs / Duty' },
    { key: 'MISCELLANEOUS', label: 'Miscellaneous' },
  ];

  const channelOptions: { key: PaymentChannel; label: string; icon: React.ReactNode }[] = [
    { key: 'CASH', label: 'Cash Out', icon: <Banknote className="w-4 h-4" /> },
    { key: 'UPI', label: 'UPI / Scan', icon: <QrCode className="w-4 h-4" /> },
    { key: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT)', icon: <Landmark className="w-4 h-4" /> },
    { key: 'CHEQUE', label: 'Cheque Issued', icon: <FileCheck2 className="w-4 h-4" /> },
    { key: 'CARD', label: 'Company Card', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff453a]/15 text-[#ff453a] flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">Record Money Out</h2>
              <p className="text-xs text-[#8e8e93]">Vendor Payout & Operating Expense Voucher</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Payment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff453a] focus:ring-1 focus:ring-[#ff453a]/30 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Expense Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#2c2c2e] border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff453a] focus:ring-1 focus:ring-[#ff453a]/30 transition-all"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key} className="bg-[#2c2c2e] text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payee Selection Tabs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#8e8e93]">Paid To (Beneficiary)</label>
              <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPayeeType('CUSTOM')}
                  className={`px-2.5 py-0.5 rounded-md transition-all ${
                    payeeType === 'CUSTOM' ? 'bg-[#ff453a] text-white font-medium' : 'text-[#8e8e93]'
                  }`}
                >
                  Direct Payee
                </button>
                <button
                  type="button"
                  onClick={() => setPayeeType('REGISTERED')}
                  className={`px-2.5 py-0.5 rounded-md transition-all ${
                    payeeType === 'REGISTERED' ? 'bg-[#ff453a] text-white font-medium' : 'text-[#8e8e93]'
                  }`}
                >
                  Registered Vendor
                </button>
              </div>
            </div>

            {payeeType === 'REGISTERED' ? (
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#2c2c2e] border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff453a] focus:ring-1 focus:ring-[#ff453a]/30 transition-all"
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#2c2c2e] text-white">
                    {p.name} ({p.type})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customPayeeName}
                onChange={(e) => setCustomPayeeName(e.target.value)}
                placeholder="e.g., Office Tea & Snacks, Fast Courier, Shell Petrol"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff453a] focus:ring-1 focus:ring-[#ff453a]/30 transition-all"
              />
            )}
            {errors.payee && <p className="text-xs text-[#ff453a] mt-1">{errors.payee}</p>}
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
              Paid Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93] font-medium text-base">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-lg font-semibold focus:outline-none focus:border-[#ff453a] focus:ring-1 focus:ring-[#ff453a]/30 transition-all"
                required
              />
            </div>
            {errors.amount && <p className="text-xs text-[#ff453a] mt-1">{errors.amount}</p>}
          </div>

          {/* Payment Channel Selector */}
          <div>
            <label className="block text-xs font-medium text-[#8e8e93] mb-2">
              Payment Out Channel / Instrument
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {channelOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setChannel(opt.key)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                    channel === opt.key
                      ? 'bg-[#ff453a]/15 border-[#ff453a] text-[#ff453a] shadow-sm'
                      : 'bg-white/5 border-white/5 text-[#8e8e93] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference & Bill Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Vendor Bill / Invoice # (Optional)
              </label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="e.g., BILL-9921"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff453a] focus:ring-1 focus:ring-[#ff453a]/30 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                UTR / Cheque / Transaction Ref
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g., UTR-881923"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff453a] focus:ring-1 focus:ring-[#ff453a]/30 transition-all font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
              Expense Narration / Purpose
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Factory diesel generator refill"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#ff453a] focus:ring-1 focus:ring-[#ff453a]/30 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-[#8e8e93] hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#ff453a] hover:bg-[#ff453a]/90 text-white text-sm font-medium shadow-lg shadow-[#ff453a]/20 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" /> Save Payment Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
