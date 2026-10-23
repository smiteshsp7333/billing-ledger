'use client';

import React, { useState, useEffect } from 'react';
import { Party, PaymentChannel, Invoice } from '../../types';
import { X, FileText, Check, Calendar, Percent } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  onSave: (
    invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>,
    settlement?: { amount: number; channel: PaymentChannel; reference?: string }
  ) => void;
  selectedDate: string;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  parties,
  onSave,
  selectedDate,
}: InvoiceModalProps) {
  const [partyId, setPartyId] = useState('');
  const [customPartyName, setCustomPartyName] = useState('');
  const [itemsDescription, setItemsDescription] = useState('');
  const [taxableAmount, setTaxableAmount] = useState('');
  const [gstRate, setGstRate] = useState<number>(18);
  const [date, setDate] = useState(selectedDate);

  // Immediate Settlement Option
  const [immediatePayment, setImmediatePayment] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [settleChannel, setSettleChannel] = useState<PaymentChannel>('UPI');
  const [settleReference, setSettleReference] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const gstRates = [0, 5, 12, 18, 28];

  useEffect(() => {
    if (isOpen) {
      setDate(selectedDate);
      setPartyId(parties.length > 0 ? parties[0].id : '');
      setCustomPartyName('');
      setItemsDescription('');
      setTaxableAmount('');
      setGstRate(18);
      setImmediatePayment(false);
      setPaidAmount('');
      setSettleChannel('UPI');
      setSettleReference('');
      setErrors({});
    }
  }, [isOpen, selectedDate, parties]);

  if (!isOpen) return null;

  const parsedTaxable = parseFloat(taxableAmount) || 0;
  const calculatedGst = (parsedTaxable * gstRate) / 100;
  const totalBillAmount = parsedTaxable + calculatedGst;

  const parsedPaid = immediatePayment ? parseFloat(paidAmount) || 0 : 0;
  const balanceRemaining = Math.max(0, totalBillAmount - parsedPaid);

  const selectedParty = parties.find((p) => p.id === partyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (parsedTaxable <= 0) {
      newErrors.taxable = 'Please enter a valid taxable amount.';
    }

    if (!itemsDescription.trim()) {
      newErrors.items = 'Please specify items or service description.';
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

    if (immediatePayment && parsedPaid > totalBillAmount) {
      newErrors.paid = 'Immediate collection cannot exceed total invoice value.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let status: 'PAID' | 'PARTIAL' | 'UNPAID' = 'UNPAID';
    if (immediatePayment) {
      if (parsedPaid >= totalBillAmount) {
        status = 'PAID';
      } else if (parsedPaid > 0) {
        status = 'PARTIAL';
      }
    }

    const settlementData = immediatePayment && parsedPaid > 0
      ? {
          amount: parsedPaid,
          channel: settleChannel,
          reference: settleReference.trim() || undefined,
        }
      : undefined;

    onSave(
      {
        date,
        partyId: partyId === 'NEW' ? 'custom' : partyId,
        partyName: finalPartyName,
        taxableAmount: parsedTaxable,
        gstRate,
        gstAmount: calculatedGst,
        totalAmount: totalBillAmount,
        paidAmount: parsedPaid,
        balanceAmount: balanceRemaining,
        status,
        itemsDescription: itemsDescription.trim(),
      },
      settlementData
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0a84ff]/15 text-[#0a84ff] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">Create Commercial Invoice</h2>
              <p className="text-xs text-[#8e8e93]">GST Tax Invoice & Customer Ledger Posting</p>
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
          {/* Date & Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Invoice Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/30 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Billed To (Customer)
              </label>
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#2c2c2e] border border-white/10 text-white text-sm focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/30 transition-all"
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#2c2c2e] text-white">
                    {p.name}
                  </option>
                ))}
                <option value="NEW" className="bg-[#2c2c2e] text-white">+ New / Walk-in Customer</option>
              </select>
            </div>
          </div>

          {/* New Customer Name */}
          {partyId === 'NEW' && (
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Customer Name / Enterprise *
              </label>
              <input
                type="text"
                value={customPartyName}
                onChange={(e) => setCustomPartyName(e.target.value)}
                placeholder="e.g., Matrix Logistics Corp"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/30 transition-all"
              />
              {errors.party && <p className="text-xs text-[#ff453a] mt-1">{errors.party}</p>}
            </div>
          )}

          {/* Line Item Description */}
          <div>
            <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
              Goods / Service Description *
            </label>
            <input
              type="text"
              value={itemsDescription}
              onChange={(e) => setItemsDescription(e.target.value)}
              placeholder="e.g., Industrial Servo Motors (Qty: 4 units)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/30 transition-all"
              required
            />
            {errors.items && <p className="text-xs text-[#ff453a] mt-1">{errors.items}</p>}
          </div>

          {/* Taxable Amount & GST Slabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Taxable Subtotal (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93] font-medium text-base">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={taxableAmount}
                  onChange={(e) => {
                    setTaxableAmount(e.target.value);
                    if (immediatePayment) {
                      const t = parseFloat(e.target.value) || 0;
                      setPaidAmount(String(t + (t * gstRate) / 100));
                    }
                  }}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-base font-semibold focus:outline-none focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]/30 transition-all"
                  required
                />
              </div>
              {errors.taxable && <p className="text-xs text-[#ff453a] mt-1">{errors.taxable}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-[#8e8e93] mb-1.5 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" /> Applicable GST Rate
              </label>
              <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                {gstRates.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setGstRate(rate);
                      if (immediatePayment) {
                        setPaidAmount(String(parsedTaxable + (parsedTaxable * rate) / 100));
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      gstRate === rate
                        ? 'bg-[#0a84ff] text-white shadow-sm'
                        : 'text-[#8e8e93] hover:text-white'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tax Calculation Preview Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between text-[#8e8e93]">
              <span>Taxable Value:</span>
              <span className="font-mono text-white">₹{parsedTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[#8e8e93]">
              <span>GST ({gstRate}%):</span>
              <span className="font-mono text-white">₹{calculatedGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-semibold text-white">
              <span>Total Invoice Amount:</span>
              <span className="font-mono text-[#0a84ff]">₹{totalBillAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Immediate Payment Option */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={immediatePayment}
                onChange={(e) => {
                  setImmediatePayment(e.target.checked);
                  if (e.target.checked && totalBillAmount > 0) {
                    setPaidAmount(String(totalBillAmount));
                  } else {
                    setPaidAmount('');
                  }
                }}
                className="w-4 h-4 rounded text-[#0a84ff] bg-white/10 border-white/20 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-white font-medium">Record Immediate Payment Collection</span>
            </label>

            {immediatePayment && (
              <div className="mt-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#8e8e93] mb-1">
                      Received Now (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#0a84ff]"
                    />
                    {errors.paid && <p className="text-[11px] text-[#ff453a] mt-1">{errors.paid}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#8e8e93] mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={settleChannel}
                      onChange={(e) => setSettleChannel(e.target.value as PaymentChannel)}
                      className="w-full px-3 py-2 rounded-xl bg-[#2c2c2e] border border-white/10 text-white text-xs focus:outline-none focus:border-[#0a84ff]"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="CASH">Cash in Hand</option>
                      <option value="BANK_TRANSFER">Bank NEFT / RTGS</option>
                      <option value="CARD">Debit / Credit Card</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#8e8e93] mb-1">
                    Payment Reference / UTR # (Optional)
                  </label>
                  <input
                    type="text"
                    value={settleReference}
                    onChange={(e) => setSettleReference(e.target.value)}
                    placeholder="e.g., UPI-TXN-49219"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#0a84ff]"
                  />
                </div>

                <div className="flex justify-between items-center text-xs pt-1 text-[#8e8e93]">
                  <span>Outstanding Invoice Balance:</span>
                  <span className={`font-mono font-medium ${balanceRemaining > 0 ? 'text-[#ff9f0a]' : 'text-[#34c759]'}`}>
                    ₹{balanceRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
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
              className="px-5 py-2.5 rounded-xl bg-[#0a84ff] hover:bg-[#0a84ff]/90 text-white text-sm font-medium shadow-lg shadow-[#0a84ff]/20 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" /> Generate & Post Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
