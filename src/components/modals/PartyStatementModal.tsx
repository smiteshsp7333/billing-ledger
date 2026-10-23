'use client';

import React from 'react';
import { Party, LedgerStoreData } from '../../types';
import { computePartyLedger } from '../../lib/store';
import { X, Printer, Users, ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';

interface PartyStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: Party | null;
  store: LedgerStoreData;
}

export default function PartyStatementModal({
  isOpen,
  onClose,
  party,
  store,
}: PartyStatementModalProps) {
  if (!isOpen || !party) return null;

  const ledger = computePartyLedger(party.id, store);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="ios-glass w-full max-w-4xl rounded-ios-lg p-6 shadow-2xl relative border border-white/20 animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-ios-purple/20 text-ios-purple flex items-center justify-center border border-ios-purple/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {party.name}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                  {party.type}
                </span>
              </h2>
              <p className="text-xs text-ios-gray">
                {party.city ? `${party.city} • ` : ''}{party.phone} {party.gstin ? `• GSTIN: ${party.gstin}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 rounded-2xl ios-glass-card">
            <span className="text-[10px] uppercase font-bold text-ios-gray tracking-wider block">Total Billed</span>
            <span className="text-lg font-bold font-mono text-white mt-1 block">
              INR {ledger.totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl ios-glass-card">
            <span className="text-[10px] uppercase font-bold text-ios-gray tracking-wider block">Total Collected / Paid</span>
            <span className="text-lg font-bold font-mono text-ios-green mt-1 block">
              INR {(ledger.totalCollected + ledger.totalPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl ios-glass-card border border-ios-blue/30">
            <span className="text-[10px] uppercase font-bold text-ios-blue tracking-wider block">Current Running Balance</span>
            <span
              className={`text-lg font-black font-mono mt-1 block ${
                ledger.currentBalance > 0
                  ? 'text-ios-orange'
                  : ledger.currentBalance < 0
                  ? 'text-ios-purple'
                  : 'text-ios-green'
              }`}
            >
              INR {Math.abs(ledger.currentBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}{' '}
              <span className="text-[11px] font-bold">
                {ledger.currentBalance > 0 ? '(Dr / Receivable)' : ledger.currentBalance < 0 ? '(Cr / Payable)' : '(Settled)'}
              </span>
            </span>
          </div>
        </div>

        {/* Chronological Statement Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-ios-gray uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Particulars / Narration</th>
                  <th className="py-2.5 px-3 text-right">Debit (INR)</th>
                  <th className="py-2.5 px-3 text-right">Credit (INR)</th>
                  <th className="py-2.5 px-3 text-right font-bold text-white">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ledger.entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2 px-3 font-mono text-white/80">{entry.date}</td>
                    <td className="py-2 px-3 font-mono font-bold text-white">{entry.voucherNumber}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-white/80 max-w-xs truncate">{entry.description}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-ios-orange">
                      {entry.debit > 0 ? entry.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-ios-green">
                      {entry.credit > 0 ? entry.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-white">
                      INR {Math.abs(entry.runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}{' '}
                      <span className="text-[10px] text-ios-gray">
                        {entry.runningBalance >= 0 ? 'Dr' : 'Cr'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
