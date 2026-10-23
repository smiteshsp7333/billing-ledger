'use client';

import { useRouter } from 'next/navigation';

import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Receipt,
  Payment,
  Invoice,
  Party,
  PaymentChannel,
  LedgerStoreData,
  DenominationCount,
} from '../types';
import { loadStore, saveStore, computePartyLedger } from '../lib/store';
import { UserSession } from '../types';
import IOSHeader from './layout/IOSHeader';
import ReceiptModal from './modals/ReceiptModal';
import PaymentModal from './modals/PaymentModal';
import InvoiceModal from './modals/InvoiceModal';
import VoucherModal from './modals/VoucherModal';
import PartyStatementModal from './modals/PartyStatementModal';
import EODLockModal from './modals/EODLockModal';
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Users,
  Lock,
  Search,
  Filter,
  Printer,
  ChevronRight,
  TrendingUp,
  Banknote,
  Landmark,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Plus,
  BookOpen,
  PieChart,
  Calendar,
} from 'lucide-react';


export default function DailyBillingLedgerPage() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [store, setStore] = useState<LedgerStoreData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('DAYBOOK');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Modals state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [eodModalOpen, setEodModalOpen] = useState(false);

  // Voucher preview modal
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [voucherData, setVoucherData] = useState<Receipt | Payment | Invoice | null>(null);
  const [voucherType, setVoucherType] = useState<'RECEIPT' | 'PAYMENT' | 'INVOICE'>('RECEIPT');

  // Party statement modal
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const rawUser = localStorage.getItem('billing_ledger_session');
      if (!rawUser) {
        router.replace('/login');
        return;
      }
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
        } else {
          router.replace('/login');
          return;
        }
      } catch (e) {
        localStorage.removeItem('billing_ledger_session');
        router.replace('/login');
        return;
      }
    }

    const loaded = loadStore();
    setStore(loaded);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('billing_ledger_session');
    }
    router.replace('/login');
  };

  if (!isMounted || !store) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-xs">
        Loading Daily Billing Ledger...
      </div>
    );
  }

  // Ensure current day record
  const currentDay = store.days[selectedDate] || {
    date: selectedDate,
    isLocked: false,
    openingCash: 25000,
    openingBank: 340000,
    physicalCashCounted: 0,
    cashVariance: 0,
    denominations: { d2000: 0, d500: 0, d200: 0, d100: 0, d50: 0, d20: 0, d10: 0 },
  };

  // Filter records for selected date
  const dayReceipts = store.receipts.filter((r) => r.date === selectedDate);
  const dayPayments = store.payments.filter((p) => p.date === selectedDate);
  const dayInvoices = store.invoices.filter((i) => i.date === selectedDate);

  // Financial calculations
  const totalCashIn = dayReceipts
    .filter((r) => r.channel === 'CASH')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalBankIn = dayReceipts
    .filter((r) => r.channel !== 'CASH')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalInward = totalCashIn + totalBankIn;

  const totalCashOut = dayPayments
    .filter((p) => p.channel === 'CASH')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalBankOut = dayPayments
    .filter((p) => p.channel !== 'CASH')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalOutward = totalCashOut + totalBankOut;

  const netCashFlow = totalInward - totalOutward;

  const closingCash = currentDay.openingCash + totalCashIn - totalCashOut;
  const closingBank = currentDay.openingBank + totalBankIn - totalBankOut;
  const totalClosing = closingCash + closingBank;

  // Handlers for creating new records
  const handleSaveReceipt = (receiptData: Omit<Receipt, 'id' | 'voucherNumber' | 'createdAt'>) => {
    const nextSeq = store.seqReceipt;
    const voucherNumber = `RCP-2026-${String(nextSeq).padStart(5, '0')}`;

    const newReceipt: Receipt = {
      ...receiptData,
      id: `rcp-${Date.now()}`,
      voucherNumber,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...store,
      receipts: [newReceipt, ...store.receipts],
      seqReceipt: nextSeq + 1,
    };

    setStore(updated);
    saveStore(updated);
  };

  const handleSavePayment = (paymentData: Omit<Payment, 'id' | 'voucherNumber' | 'createdAt'>) => {
    const nextSeq = store.seqPayment;
    const voucherNumber = `PAY-2026-${String(nextSeq).padStart(5, '0')}`;

    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      voucherNumber,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...store,
      payments: [newPayment, ...store.payments],
      seqPayment: nextSeq + 1,
    };

    setStore(updated);
    saveStore(updated);
  };

  const handleSaveInvoice = (
    invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>,
    settlement?: { amount: number; channel: PaymentChannel; reference?: string }
  ) => {
    const nextSeq = store.seqInvoice;
    const invoiceNumber = `INV-2026-${String(nextSeq).padStart(5, '0')}`;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    let updatedReceipts = store.receipts;
    let nextReceiptSeq = store.seqReceipt;

    if (settlement && settlement.amount > 0) {
      const receiptVoucherNumber = `RCP-2026-${String(nextReceiptSeq).padStart(5, '0')}`;
      const linkedReceipt: Receipt = {
        id: `rcp-${Date.now()}`,
        voucherNumber: receiptVoucherNumber,
        date: selectedDate,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        partyId: invoiceData.partyId,
        partyName: invoiceData.partyName,
        amount: settlement.amount,
        channel: settlement.channel,
        referenceNumber: settlement.reference,
        linkedInvoiceNumber: invoiceNumber,
        notes: `Settlement on bill generation for ${invoiceNumber}`,
        createdAt: new Date().toISOString(),
      };
      updatedReceipts = [linkedReceipt, ...store.receipts];
      nextReceiptSeq += 1;
    }

    const updated = {
      ...store,
      invoices: [newInvoice, ...store.invoices],
      receipts: updatedReceipts,
      seqInvoice: nextSeq + 1,
      seqReceipt: nextReceiptSeq,
    };

    setStore(updated);
    saveStore(updated);
  };

  const handleSaveEOD = (eodData: {
    isLocked: boolean;
    lockedBy: string;
    denominations: DenominationCount;
    physicalCashCounted: number;
    cashVariance: number;
    varianceReason?: string;
  }) => {
    const updatedDay: any = {
      ...currentDay,
      isLocked: eodData.isLocked,
      lockedAt: eodData.isLocked ? new Date().toISOString() : undefined,
      lockedBy: eodData.lockedBy,
      denominations: eodData.denominations,
      physicalCashCounted: eodData.physicalCashCounted,
      cashVariance: eodData.cashVariance,
      varianceReason: eodData.varianceReason,
    };

    const updated = {
      ...store,
      days: {
        ...store.days,
        [selectedDate]: updatedDay,
      },
    };

    setStore(updated);
    saveStore(updated);
  };

  const openVoucher = (
    data: Receipt | Payment | Invoice,
    type: 'RECEIPT' | 'PAYMENT' | 'INVOICE'
  ) => {
    setVoucherData(data);
    setVoucherType(type);
    setVoucherModalOpen(true);
  };

  const openPartyStatement = (party: Party) => {
    setSelectedParty(party);
    setStatementModalOpen(true);
  };

  // Unified day transactions for Day Book
  const unifiedTransactions = [
    ...dayReceipts.map((r) => ({
      id: r.id,
      time: r.timestamp,
      voucher: r.voucherNumber,
      type: 'INWARD' as const,
      party: r.partyName,
      amount: r.amount,
      channel: r.channel,
      ref: r.referenceNumber,
      notes: r.notes,
      raw: r,
    })),
    ...dayPayments.map((p) => ({
      id: p.id,
      time: p.timestamp,
      voucher: p.voucherNumber,
      type: 'OUTWARD' as const,
      party: p.payeeName,
      amount: p.amount,
      channel: p.channel,
      ref: p.referenceNumber,
      notes: p.notes,
      raw: p,
    })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  // Analytics datasets
  const channelData = [
    { name: 'Bank Transfer', value: totalBankIn, color: '#007AFF' },
    { name: 'Physical Cash', value: totalCashIn, color: '#34C759' },
    { name: 'Expenses Out', value: totalOutward, color: '#FF3B30' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* iOS Translucent App Bar */}
      <IOSHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReceipt={() => setReceiptModalOpen(true)}
        onOpenPayment={() => setPaymentModalOpen(true)}
        onOpenInvoice={() => setInvoiceModalOpen(true)}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isDayLocked={Boolean(currentDay.isLocked)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* 5 Core iOS Glass Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Opening Balance */}
          <div className="ios-glass-card p-4 rounded-ios border border-white/10">
            <div className="flex items-center justify-between text-ios-gray">
              <span className="text-[10px] uppercase font-bold tracking-wider">Opening Balances</span>
              <BookOpen className="w-4 h-4 text-white/50" />
            </div>
            <span className="text-xl font-bold font-mono text-white block mt-2">
              INR {(currentDay.openingCash + currentDay.openingBank).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <div className="mt-2 text-[10px] text-ios-gray space-y-0.5">
              <div className="flex justify-between">
                <span>Cash:</span>
                <span className="font-mono text-white">INR {currentDay.openingCash.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Bank:</span>
                <span className="font-mono text-white">INR {currentDay.openingBank.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* 2. Inward Today */}
          <div className="ios-glass-card p-4 rounded-ios border border-ios-green/20">
            <div className="flex items-center justify-between text-ios-green">
              <span className="text-[10px] uppercase font-bold tracking-wider">Inward Received</span>
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-ios-green block mt-2">
              INR {totalInward.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <div className="mt-2 text-[10px] text-ios-gray space-y-0.5">
              <div className="flex justify-between">
                <span>Bank/UPI:</span>
                <span className="font-mono text-white">INR {totalBankIn.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash:</span>
                <span className="font-mono text-white">INR {totalCashIn.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* 3. Outward Today */}
          <div className="ios-glass-card p-4 rounded-ios border border-ios-red/20">
            <div className="flex items-center justify-between text-ios-red">
              <span className="text-[10px] uppercase font-bold tracking-wider">Outward Paid</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-ios-red block mt-2">
              INR {totalOutward.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <div className="mt-2 text-[10px] text-ios-gray space-y-0.5">
              <div className="flex justify-between">
                <span>Bank/UPI:</span>
                <span className="font-mono text-white">INR {totalBankOut.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash:</span>
                <span className="font-mono text-white">INR {totalCashOut.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* 4. Net Operational Flow */}
          <div className="ios-glass-card p-4 rounded-ios border border-ios-blue/20">
            <div className="flex items-center justify-between text-ios-blue">
              <span className="text-[10px] uppercase font-bold tracking-wider">Net Cash Flow</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <span
              className={`text-xl font-bold font-mono block mt-2 ${
                netCashFlow >= 0 ? 'text-ios-blue' : 'text-ios-orange'
              }`}
            >
              INR {netCashFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[10px] text-ios-gray mt-2 truncate">
              {netCashFlow >= 0 ? 'Surplus Operational Position' : 'Deficit Cash Outflow'}
            </p>
          </div>

          {/* 5. Closing Position */}
          <div className="ios-glass-card p-4 rounded-ios border border-white/20 bg-gradient-to-b from-white/[0.08] to-transparent">
            <div className="flex items-center justify-between text-white">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/90">Closing Total</span>
              <Banknote className="w-4 h-4 text-ios-green" />
            </div>
            <span className="text-xl font-bold font-mono text-white block mt-2">
              INR {totalClosing.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <div className="mt-2 text-[10px] text-ios-gray space-y-0.5">
              <div className="flex justify-between">
                <span>Cash in Hand:</span>
                <span className="font-mono text-white font-semibold">INR {closingCash.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>In Bank Accts:</span>
                <span className="font-mono text-white font-semibold">INR {closingBank.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== VIEW 1: DAY BOOK ===================== */}
        {activeTab === 'DAYBOOK' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Today Operational Chronology</h2>
                <p className="text-xs text-ios-gray">
                  Unified cash-bank flow for {selectedDate} ({unifiedTransactions.length} entries recorded)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEodModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-ios-yellow/10 hover:bg-ios-yellow/20 text-ios-yellow border border-ios-yellow/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>EOD Currency Count & Seal</span>
                </button>
              </div>
            </div>

            {unifiedTransactions.length === 0 ? (
              <div className="ios-glass p-12 rounded-ios-lg text-center space-y-3 border border-white/10">
                <BookOpen className="w-8 h-8 text-ios-gray mx-auto" />
                <p className="text-sm font-semibold text-white">No transactions recorded on this date.</p>
                <p className="text-xs text-ios-gray max-w-sm mx-auto">
                  Click the Money In or Money Out action pills in the header to post vouchers.
                </p>
              </div>
            ) : (
              <div className="rounded-ios-lg ios-glass border border-white/10 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 border-b border-white/10 text-ios-gray uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Voucher</th>
                        <th className="py-3 px-4">Flow</th>
                        <th className="py-3 px-4">Party / Beneficiary</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Ref / Notes</th>
                        <th className="py-3 px-4 text-right">Amount (INR)</th>
                        <th className="py-3 px-4 text-right">Voucher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {unifiedTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-4 font-mono text-white/70">{tx.time}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-white">{tx.voucher}</td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                tx.type === 'INWARD'
                                  ? 'bg-ios-green/10 text-ios-green border-ios-green/20'
                                  : 'bg-ios-red/10 text-ios-red border-ios-red/20'
                              }`}
                            >
                              {tx.type === 'INWARD' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              <span>{tx.type}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-white">{tx.party}</td>
                          <td className="py-2.5 px-4">
                            <span className="font-mono text-[11px] text-white/80">{tx.channel}</span>
                          </td>
                          <td className="py-2.5 px-4 text-ios-gray max-w-xs truncate">
                            {tx.ref ? `Ref: ${tx.ref} • ` : ''}{tx.notes || '-'}
                          </td>
                          <td
                            className={`py-2.5 px-4 text-right font-mono font-bold text-sm ${
                              tx.type === 'INWARD' ? 'text-ios-green' : 'text-ios-red'
                            }`}
                          >
                            {tx.type === 'INWARD' ? '+' : '-'}INR {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => openVoucher(tx.raw as any, tx.type === 'INWARD' ? 'RECEIPT' : 'PAYMENT')}
                              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-colors"
                            >
                              Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== VIEW 2: RECEIPTS ===================== */}
        {activeTab === 'RECEIPTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Collections & Inward Receipts</h2>
                <p className="text-xs text-ios-gray">All receipts posted across channels</p>
              </div>
              <button
                onClick={() => setReceiptModalOpen(true)}
                disabled={Boolean(currentDay.isLocked)}
                className="px-4 py-2 rounded-full bg-ios-green hover:bg-ios-green/90 text-black font-bold text-xs shadow-lg shadow-ios-green/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Receipt</span>
              </button>
            </div>

            <div className="rounded-ios-lg ios-glass border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-ios-gray uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Customer / Remitter</th>
                    <th className="py-3 px-4">Payment Channel</th>
                    <th className="py-3 px-4">Transaction UTR / Ref</th>
                    <th className="py-3 px-4 text-right">Amount (INR)</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {store.receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-mono text-white/80">{r.date} {r.timestamp}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-white">{r.voucherNumber}</td>
                      <td className="py-2.5 px-4 font-semibold text-white">{r.partyName}</td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-ios-green">{r.channel}</td>
                      <td className="py-2.5 px-4 font-mono text-ios-gray">{r.referenceNumber || '-'}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-ios-green">
                        INR {r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => openVoucher(r, 'RECEIPT')}
                          className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px]"
                        >
                          Print Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== VIEW 3: PAYMENTS ===================== */}
        {activeTab === 'PAYMENTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Expenses & Outward Payouts</h2>
                <p className="text-xs text-ios-gray">Operational vouchers & vendor settlements</p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(true)}
                disabled={Boolean(currentDay.isLocked)}
                className="px-4 py-2 rounded-full bg-ios-red hover:bg-ios-red/90 text-white font-bold text-xs shadow-lg shadow-ios-red/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Expense</span>
              </button>
            </div>

            <div className="rounded-ios-lg ios-glass border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-ios-gray uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Payment #</th>
                    <th className="py-3 px-4">Payee / Vendor</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Bill #</th>
                    <th className="py-3 px-4 text-right">Amount (INR)</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {store.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-mono text-white/80">{p.date} {p.timestamp}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-white">{p.voucherNumber}</td>
                      <td className="py-2.5 px-4 font-semibold text-white">{p.payeeName}</td>
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                          {p.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-ios-red">{p.channel}</td>
                      <td className="py-2.5 px-4 font-mono text-ios-gray">{p.billNumber || '-'}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-ios-red">
                        INR {p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => openVoucher(p, 'PAYMENT')}
                          className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px]"
                        >
                          Print Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== VIEW 4: INVOICES ===================== */}
        {activeTab === 'INVOICES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Sales Invoices & Daily Bills</h2>
                <p className="text-xs text-ios-gray">Commercial billing with GST & credit tracking</p>
              </div>
              <button
                onClick={() => setInvoiceModalOpen(true)}
                disabled={Boolean(currentDay.isLocked)}
                className="px-4 py-2 rounded-full bg-ios-blue hover:bg-ios-blue/90 text-white font-bold text-xs shadow-lg shadow-ios-blue/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue New Bill</span>
              </button>
            </div>

            <div className="rounded-ios-lg ios-glass border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-ios-gray uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items / Details</th>
                    <th className="py-3 px-4 text-right">Taxable</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {store.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-mono text-white/80">{inv.date}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-4 font-semibold text-white">{inv.partyName}</td>
                      <td className="py-2.5 px-4 text-ios-gray max-w-xs truncate">{inv.itemsDescription}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-white/80">
                        INR {inv.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                        INR {inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-ios-orange">
                        INR {inv.balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            inv.status === 'PAID'
                              ? 'bg-ios-green/10 text-ios-green border-ios-green/30'
                              : inv.status === 'PARTIAL'
                              ? 'bg-ios-orange/10 text-ios-orange border-ios-orange/30'
                              : 'bg-ios-red/10 text-ios-red border-ios-red/30'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => openVoucher(inv, 'INVOICE')}
                          className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px]"
                        >
                          View Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== VIEW 5: PARTY LEDGERS ===================== */}
        {activeTab === 'PARTIES' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Party Directory & Running Ledgers</h2>
                <p className="text-xs text-ios-gray">Complete running statements of account for all entities</p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-ios-gray absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search parties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder:text-ios-gray focus:outline-none focus:border-ios-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {store.parties
                .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((party) => {
                  const ledger = store ? computePartyLedger(party.id, store) : null;
                  const bal = ledger?.currentBalance || 0;
                  return (
                    <div
                      key={party.id}
                      onClick={() => openPartyStatement(party)}
                      className="ios-glass p-5 rounded-ios border border-white/10 hover:border-ios-blue/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                            {party.type}
                          </span>
                          <h3 className="text-sm font-bold text-white group-hover:text-ios-blue transition-colors mt-2">
                            {party.name}
                          </h3>
                          <p className="text-xs text-ios-gray mt-0.5">
                            {party.phone} {party.city ? `• ${party.city}` : ''}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-ios-gray group-hover:text-white transition-colors" />
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-baseline">
                        <span className="text-[11px] text-ios-gray">Running Balance:</span>
                        <span
                          className={`text-sm font-bold font-mono ${
                            bal > 0 ? 'text-ios-orange' : bal < 0 ? 'text-ios-purple' : 'text-ios-green'
                          }`}
                        >
                          INR {Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}{' '}
                          <span className="text-[10px]">
                            {bal > 0 ? 'Dr (Due)' : bal < 0 ? 'Cr (Payable)' : 'Settled'}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ===================== VIEW 6: EOD RECONCILIATION ===================== */}
        {activeTab === 'EOD' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">End-of-Day (EOD) Currency Count & Seal</h2>
                <p className="text-xs text-ios-gray">Verify physical drawer cash against system calculations</p>
              </div>

              <button
                onClick={() => setEodModalOpen(true)}
                className="px-4 py-2 rounded-full bg-ios-yellow hover:bg-ios-yellow/90 text-black font-bold text-xs shadow-lg shadow-ios-yellow/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Open Currency Counter</span>
              </button>
            </div>

            <div className="ios-glass p-6 rounded-ios-lg border border-white/10 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/5">
                  <span className="text-[10px] uppercase font-bold text-ios-gray">System Computed Cash</span>
                  <span className="text-2xl font-bold font-mono text-white block mt-1">
                    INR {closingCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5">
                  <span className="text-[10px] uppercase font-bold text-ios-gray">Physical Cash Counted</span>
                  <span className="text-2xl font-bold font-mono text-ios-blue block mt-1">
                    INR {(currentDay.physicalCashCounted || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5">
                  <span className="text-[10px] uppercase font-bold text-ios-gray">Audit Status</span>
                  <span
                    className={`text-lg font-bold block mt-1 flex items-center gap-1.5 ${
                      currentDay.isLocked ? 'text-ios-red' : 'text-ios-green'
                    }`}
                  >
                    {currentDay.isLocked ? <Lock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{currentDay.isLocked ? 'Day Locked & Sealed' : 'Day Open & Active'}</span>
                  </span>
                </div>
              </div>

              {currentDay.varianceReason && (
                <div className="p-3.5 rounded-xl bg-ios-yellow/10 border border-ios-yellow/30 text-xs text-ios-yellow">
                  <span className="font-bold">Variance Note: </span>
                  <span>{currentDay.varianceReason}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== VIEW 7: ANALYTICS ===================== */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Operational Cash & Bank Analytics</h2>
              <p className="text-xs text-ios-gray">Real-time payment channel breakdown and liquidity summary</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Channel Distribution */}
              <div className="ios-glass p-6 rounded-ios-lg border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Inward Payment Channel Mix</h3>
                  <span className="text-[11px] text-ios-gray font-mono">100% Reconciled</span>
                </div>
                <div className="space-y-4 py-2">
                  {channelData.map((d) => {
                    const percent = totalInward > 0 ? ((d.value / totalInward) * 100).toFixed(1) : '0';
                    return (
                      <div key={d.name} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-2 text-white font-medium">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                            {d.name}
                          </span>
                          <span className="font-mono text-white font-semibold">
                            INR {d.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}{' '}
                            <span className="text-ios-gray text-[11px] font-normal">({percent}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%`, backgroundColor: d.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day Position Summary */}
              <div className="ios-glass p-6 rounded-ios-lg border border-white/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Liquidity Snapshot</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/5 flex justify-between items-center">
                    <span className="text-ios-gray">Cash Collections Inflow:</span>
                    <span className="font-mono font-bold text-ios-green">
                      +INR {totalCashIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 flex justify-between items-center">
                    <span className="text-ios-gray">Digital & Bank Inflow:</span>
                    <span className="font-mono font-bold text-ios-blue">
                      +INR {totalBankIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 flex justify-between items-center">
                    <span className="text-ios-gray">Total Operational Outflow:</span>
                    <span className="font-mono font-bold text-ios-red">
                      -INR {totalOutward.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-ios-blue/10 border border-ios-blue/20 flex justify-between items-center">
                    <span className="font-bold text-white">Net Daily Operational Liquidity:</span>
                    <span className="font-mono font-black text-ios-blue text-sm">
                      INR {netCashFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Slide-up Action Modals */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        parties={store.parties}
        onSave={handleSaveReceipt}
        selectedDate={selectedDate}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        parties={store.parties}
        onSave={handleSavePayment}
        selectedDate={selectedDate}
      />

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        parties={store.parties}
        onSave={handleSaveInvoice}
        selectedDate={selectedDate}
      />

      <EODLockModal
        isOpen={eodModalOpen}
        onClose={() => setEodModalOpen(false)}
        dayRecord={currentDay}
        expectedCash={closingCash}
        expectedBank={closingBank}
        onSaveEOD={handleSaveEOD}
      />

      <VoucherModal
        isOpen={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        data={voucherData}
        type={voucherType}
      />

      <PartyStatementModal
        isOpen={statementModalOpen}
        onClose={() => setStatementModalOpen(false)}
        party={selectedParty}
        store={store}
      />
    </div>
  );
}
