'use client';

import React, { useState } from 'react';
import { DayRecord, DenominationCount } from '../../types';
import { calculateDenominationsTotal } from '../../lib/store';
import { X, Lock, Unlock, Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface EODLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayRecord: DayRecord;
  expectedCash: number;
  expectedBank: number;
  onSaveEOD: (data: {
    isLocked: boolean;
    lockedBy: string;
    denominations: DenominationCount;
    physicalCashCounted: number;
    cashVariance: number;
    varianceReason?: string;
  }) => void;
}

export default function EODLockModal({
  isOpen,
  onClose,
  dayRecord,
  expectedCash,
  expectedBank,
  onSaveEOD,
}: EODLockModalProps) {
  const [lockedBy, setLockedBy] = useState(dayRecord.lockedBy || 'Finance Manager');
  const [denominations, setDenominations] = useState<DenominationCount>(
    dayRecord.denominations || {
      d2000: 0,
      d500: 0,
      d200: 0,
      d100: 0,
      d50: 0,
      d20: 0,
      d10: 0,
    }
  );
  const [varianceReason, setVarianceReason] = useState(dayRecord.varianceReason || '');

  if (!isOpen) return null;

  const handleDenomChange = (key: keyof DenominationCount, val: number) => {
    setDenominations((prev) => ({
      ...prev,
      [key]: Math.max(0, val || 0),
    }));
  };

  const physicalCash = calculateDenominationsTotal(denominations);
  const cashVariance = Number((physicalCash - expectedCash).toFixed(2));

  const handleLockSubmit = (isLocking: boolean) => {
    if (isLocking && cashVariance !== 0 && !varianceReason.trim()) {
      alert('A reason is mandatory when physical cash variance is not zero.');
      return;
    }

    onSaveEOD({
      isLocked: isLocking,
      lockedBy: lockedBy.trim() || 'Finance Manager',
      denominations,
      physicalCashCounted: physicalCash,
      cashVariance,
      varianceReason: varianceReason.trim() || undefined,
    });

    onClose();
  };

  const rows: { key: keyof DenominationCount; multiplier: number }[] = [
    { key: 'd2000', multiplier: 2000 },
    { key: 'd500', multiplier: 500 },
    { key: 'd200', multiplier: 200 },
    { key: 'd100', multiplier: 100 },
    { key: 'd50', multiplier: 50 },
    { key: 'd20', multiplier: 20 },
    { key: 'd10', multiplier: 10 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="ios-glass w-full max-w-xl rounded-ios-lg p-6 shadow-2xl relative border border-white/20 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-ios-yellow/20 text-ios-yellow flex items-center justify-center border border-ios-yellow/30">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">EOD Currency Denomination & Day Lock</h2>
            <p className="text-xs text-ios-gray">Date: {dayRecord.date}</p>
          </div>
        </div>

        {dayRecord.isLocked ? (
          <div className="p-4 rounded-2xl bg-ios-red/10 border border-ios-red/30 space-y-3 mb-4">
            <div className="flex items-center gap-2 text-ios-red font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>This operational day is finalized & LOCKED.</span>
            </div>
            <p className="text-xs text-white/80">
              Locked by: <span className="font-semibold">{dayRecord.lockedBy}</span> on {dayRecord.lockedAt}
            </p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleLockSubmit(false)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock for Management Audit Correction</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Currency Denominations Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white/80 pb-2 border-b border-white/10">
            <span>Currency Note</span>
            <span>Count (Quantity)</span>
            <span className="text-right">Subtotal (INR)</span>
          </div>

          <div className="space-y-2">
            {rows.map((r) => {
              const count = denominations[r.key];
              const subtotal = count * r.multiplier;
              return (
                <div key={r.key} className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-mono font-bold text-white w-20">INR {r.multiplier} x</span>
                  <input
                    type="number"
                    min="0"
                    disabled={dayRecord.isLocked}
                    value={count || ''}
                    onChange={(e) => handleDenomChange(r.key, parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-24 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-center focus:outline-none focus:border-ios-blue"
                  />
                  <span className="font-mono font-bold text-white/90 text-right w-28">
                    INR {subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Variance Comparison Box */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Total Physical Cash Counted:</span>
              <span className="font-mono text-base font-bold text-white">
                INR {physicalCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/70">System Expected Cash in Hand:</span>
              <span className="font-mono text-base font-bold text-ios-blue">
                INR {expectedCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="font-bold text-white">Variance (Shortage / Overage):</span>
              <span
                className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-full border ${
                  cashVariance === 0
                    ? 'bg-ios-green/20 text-ios-green border-ios-green/30'
                    : cashVariance > 0
                    ? 'bg-ios-yellow/20 text-ios-yellow border-ios-yellow/30'
                    : 'bg-ios-red/20 text-ios-red border-ios-red/30'
                }`}
              >
                {cashVariance === 0
                  ? 'INR 0.00 (Exact Match)'
                  : `INR ${cashVariance.toLocaleString('en-IN')} (${cashVariance > 0 ? 'Surplus' : 'Deficit'})`}
              </span>
            </div>
          </div>

          {cashVariance !== 0 && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-ios-yellow mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Mandatory Variance Justification Reason *</span>
              </label>
              <textarea
                rows={2}
                disabled={dayRecord.isLocked}
                placeholder="Explain the physical cash variance..."
                value={varianceReason}
                onChange={(e) => setVarianceReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-ios-yellow"
              />
            </div>
          )}

          {!dayRecord.isLocked && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Supervisor Name"
                value={lockedBy}
                onChange={(e) => setLockedBy(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleLockSubmit(true)}
                className="px-6 py-2.5 rounded-full bg-ios-yellow hover:bg-ios-yellow/90 text-black font-bold text-xs shadow-lg shadow-ios-yellow/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>Finalize & Seal Day</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
