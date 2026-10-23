'use client';

import React from 'react';
import { Receipt, Payment, Invoice } from '../../types';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Receipt | Payment | Invoice | null;
  type: 'RECEIPT' | 'PAYMENT' | 'INVOICE';
}

function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'Zero Rupees Only';

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }

  return inWords(n).trim() + ' Rupees Only';
}

export default function VoucherModal({ isOpen, onClose, data, type }: VoucherModalProps) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const amount = 'amount' in data ? data.amount : data.totalAmount;
  const voucherNo = 'voucherNumber' in data ? data.voucherNumber : data.invoiceNumber;
  const partyName = 'partyName' in data ? data.partyName : data.payeeName;
  const channel = 'channel' in data ? data.channel : 'OFFICIAL_INVOICE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="ios-glass w-full max-w-2xl rounded-ios-lg p-6 shadow-2xl relative border border-white/20 animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ios-blue px-2.5 py-0.5 rounded-full bg-ios-blue/10 border border-ios-blue/20">
              {type} Voucher Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper Layout */}
        <div className="mt-4 p-8 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200 printable-voucher">
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-950">POWERTECH SOLUTIONS</h1>
              <p className="text-[11px] text-slate-600 font-medium">MIDC Industrial Complex, Bhosari, Pune - 411026</p>
              <p className="text-[11px] text-slate-600 font-medium">GSTIN: 27AABCP8877K1Z4 | Contact: +91 98000 00001</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded bg-slate-900 text-white inline-block">
                {type} VOUCHER
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-2">{voucherNo}</p>
              <p className="text-[11px] text-slate-600">{data.date}</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="py-6 space-y-4 text-xs border-b border-slate-200">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-500">Party / Beneficiary:</span>
              <span className="col-span-2 font-bold text-slate-900 text-sm">{partyName}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-500">Payment Channel:</span>
              <span className="col-span-2 font-mono font-bold text-slate-800">{channel}</span>
            </div>

            {'referenceNumber' in data && data.referenceNumber && (
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold text-slate-500">Transaction Reference:</span>
                <span className="col-span-2 font-mono text-slate-800">{data.referenceNumber}</span>
              </div>
            )}

            {'linkedInvoiceNumber' in data && data.linkedInvoiceNumber && (
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold text-slate-500">Against Invoice:</span>
                <span className="col-span-2 font-mono text-slate-800">{data.linkedInvoiceNumber}</span>
              </div>
            )}

            {'notes' in data && data.notes && (
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold text-slate-500">Narration / Notes:</span>
                <span className="col-span-2 text-slate-700 italic">{data.notes}</span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="py-4 my-2 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Amount in Words</span>
              <span className="text-xs font-bold text-slate-800 italic">{numberToWords(amount)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Amount</span>
              <span className="text-xl font-black text-slate-950 font-mono">
                INR {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-10 flex justify-between items-end text-center text-xs">
            <div>
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Authorized Accountant</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified & Audited</span>
            </div>

            <div>
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Receiver / Remitter Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
