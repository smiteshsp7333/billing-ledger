'use client';

import React, { useState, useEffect } from 'react';
import { Party, PaymentChannel, Receipt } from '../../types';
import { X, ArrowDownLeft, Check, Calendar, Banknote, Landmark, QrCode, CreditCard, FileCheck2, User } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  onSave: (data: Omit<Receipt, 'id' | 'voucherNumber' | 'createdAt'>) => void;
  selectedDate: string;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  parties,
  onSave,
  selectedDate,
}: ReceiptModalProps) {
  const [partyId, setPartyId] = useState('');
  const [customPartyName, setCustomPartyName] = useState('');
  const [amount, setAmount] = useState('');
  const [channel, setChannel] = useState<PaymentChannel>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [linkedInvoiceNumber, setLinkedInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setDate(selectedDate);
      setPartyId(parties.length > 0 ? parties[0].id : '');
      setCustomPartyName('');
      setAmount('');
      setChannel('UPI');
      setReferenceNumber('');
      setLinkedInvoiceNumber('');
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

    let finalPartyName = '';
    if (partyId === 'NEW') {
      if (!customPartyName.trim()) {
        newErrors.party = 'Please specify the customer name.';
      } else {
        finalPartyName = customPartyName.trim();
      }
    } else if (selectedParty) {
      finalPartyName = selectedParty.name;
    } else {
      newErrors.party = 'Please select a customer.';
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
      partyId: partyId === 'NEW' ? 'custom' : partyId,
      partyName: finalPartyName,
      amount: numAmount,
      channel,
      referenceNumber: referenceNumber.trim() || undefined,
      linkedInvoiceNumber: linkedInvoiceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const channelOptions: { key: PaymentChannel; label: string; icon: React.ReactNode }[] = [
    { key: 'CASH', label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
    { key: 'UPI', label: 'UPI / QR', icon: <QrCode className="w-4 h-4" /> },
    { key: 'BANK_TRANSFER', label: 'Bank (NEFT/RTGS)', icon: <Landmark className="w-4 h-4" /> },
    { key: 'CHEQUE', label: 'Cheque', icon: <FileCheck2 className="w-4 h-4" /> },
    { key: 'CARD', label: 'Debit/Credit Card', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#34c759]/15 text-[#34c759] flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">Record Money In</h2>
              <p className="text-xs text-[#8e8e93]">Customer Collection & Inward Payment Voucher</p>
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
                <Calendar className="w-3.5 h-3.5" /> Receipt Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#34c759] focus:ring-1 focus:ring-[#34c759]/30 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Customer / Source Party
              </label>
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#2c2c2e] border border-white/10 text-white text-sm focus:outline-none focus:border-[#34c759] focus:ring-1 focus:ring-[#34c759]/30 transition-all"
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#2c2c2e] text-white">
                    {p.name} ({p.type})
                  </option>
                ))}
                <option value="NEW" className="bg-[#2c2c2e] text-white">+ Walk-in / New Customer</option>
              </select>
            </div>
          </div>

          {/* New Party Name Input if selected NEW */}
          {partyId === 'NEW' && (
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Enter Customer Name *
              </label>
              <input
                type="text"
                value={customPartyName}
                onChange={(e) => setCustomPartyName(e.target.value)}
                placeholder="e.g., Apex Solutions Pvt Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#34c759] focus:ring-1 focus:ring-[#34c759]/30 transition-all"
              />
              {errors.party && <p className="text-xs text-[#ff453a] mt-1">{errors.party}</p>}
            </div>
          )}

          {/* Party Balance Preview */}
          {selectedParty && partyId !== 'NEW' && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-[#8e8e93] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Current Ledger Status:
              </span>
              <span
                className={`font-mono font-medium ${
                  selectedParty.openingBalance > 0
                    ? 'text-[#ff9f0a]'
                    : selectedParty.openingBalance < 0
                    ? 'text-[#34c759]'
                    : 'text-[#8e8e93]'
                }`}
              >
                {selectedParty.openingBalance > 0
                  ? `Receivable: ₹${selectedParty.openingBalance.toLocaleString('en-IN')}`
                  : selectedParty.openingBalance < 0
                  ? `Advance: ₹${Math.abs(selectedParty.openingBalance).toLocaleString('en-IN')}`
                  : 'Settled / Zero Balance'}
              </span>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
              Received Amount (₹) *
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
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-lg font-semibold focus:outline-none focus:border-[#34c759] focus:ring-1 focus:ring-[#34c759]/30 transition-all"
                required
              />
            </div>
            {errors.amount && <p className="text-xs text-[#ff453a] mt-1">{errors.amount}</p>}
          </div>

          {/* Payment Channel Selector */}
          <div>
            <label className="block text-xs font-medium text-[#8e8e93] mb-2">
              Payment Instrument / Inward Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {channelOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setChannel(opt.key)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                    channel === opt.key
                      ? 'bg-[#34c759]/15 border-[#34c759] text-[#34c759] shadow-sm'
                      : 'bg-white/5 border-white/5 text-[#8e8e93] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference / UTR Number */}
          {channel !== 'CASH' && (
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Reference / UTR / Cheque / Transaction ID
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g., UPI-202610239981 or Chq #449210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#34c759] focus:ring-1 focus:ring-[#34c759]/30 transition-all font-mono"
              />
            </div>
          )}

          {/* Linked Invoice & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Against Invoice # (Optional)
              </label>
              <input
                type="text"
                value={linkedInvoiceNumber}
                onChange={(e) => setLinkedInvoiceNumber(e.target.value)}
                placeholder="e.g., INV-2026-00001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#34c759] focus:ring-1 focus:ring-[#34c759]/30 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Voucher Remarks / Narration
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Part payment received"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#34c759] focus:ring-1 focus:ring-[#34c759]/30 transition-all"
              />
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-[#34c759] hover:bg-[#34c759]/90 text-white text-sm font-medium shadow-lg shadow-[#34c759]/20 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" /> Save Receipt Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
