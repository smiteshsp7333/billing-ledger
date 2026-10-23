import {
  Party,
  Receipt,
  Payment,
  Invoice,
  DayRecord,
  DenominationCount,
  LedgerEntry,
} from '../types';

const STORAGE_KEY = 'daily_billing_ledger_v1';

export const INITIAL_PARTIES: Party[] = [
  {
    id: 'pty-1',
    name: 'Tata Power Industrial Solutions',
    type: 'CUSTOMER',
    phone: '+91 98200 11223',
    email: 'accounts@tatapower.com',
    gstin: '27AABCT3518Q1Z8',
    city: 'Pune',
    openingBalance: 150000,
  },
  {
    id: 'pty-2',
    name: 'Adani Solar Infrastructure Ltd',
    type: 'CUSTOMER',
    phone: '+91 98450 44556',
    email: 'billing@adanisolar.com',
    gstin: '24AAACA1122R1Z2',
    city: 'Ahmedabad',
    openingBalance: 240000,
  },
  {
    id: 'pty-3',
    name: 'L&T Heavy Engineering Division',
    type: 'CUSTOMER',
    phone: '+91 97660 77889',
    email: 'finance@lnt.com',
    gstin: '27AAACL1234F1Z9',
    city: 'Mumbai',
    openingBalance: 0,
  },
  {
    id: 'pty-4',
    name: 'Reliance Power Grid Systems',
    type: 'CUSTOMER',
    phone: '+91 99200 33445',
    email: 'powergrid@reliance.com',
    gstin: '27AABCR5566K1Z3',
    city: 'Navi Mumbai',
    openingBalance: 85000,
  },
  {
    id: 'pty-5',
    name: 'Hindalco Copper & Metal Industries',
    type: 'VENDOR',
    phone: '+91 98111 22334',
    email: 'sales@hindalco.com',
    gstin: '27AAACH8899P1Z3',
    city: 'Mumbai',
    openingBalance: -95000,
  },
  {
    id: 'pty-6',
    name: 'Polycab Electricals & Cables Ltd',
    type: 'VENDOR',
    phone: '+91 98222 33445',
    email: 'orders@polycab.com',
    gstin: '24AAACP4455Q1Z7',
    city: 'Vadodara',
    openingBalance: -45000,
  },
  {
    id: 'pty-7',
    name: 'Blue Dart Express Logistics',
    type: 'SERVICE_PROVIDER',
    phone: '+91 98333 44556',
    email: 'support@bluedart.com',
    gstin: '27AAACB1199N1Z0',
    city: 'Pune',
    openingBalance: -12000,
  },
];

const today = new Date().toISOString().slice(0, 10);

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'rcp-1',
    voucherNumber: 'RCP-2026-00001',
    date: today,
    timestamp: '10:30 AM',
    partyId: 'pty-1',
    partyName: 'Tata Power Industrial Solutions',
    amount: 150000,
    channel: 'BANK_TRANSFER',
    referenceNumber: 'NEFT-HDFC-992144',
    linkedInvoiceNumber: 'INV-2026-00001',
    notes: 'Advance mobilization for substation control panel',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rcp-2',
    voucherNumber: 'RCP-2026-00002',
    date: today,
    timestamp: '12:15 PM',
    partyId: 'pty-2',
    partyName: 'Adani Solar Infrastructure Ltd',
    amount: 80000,
    channel: 'UPI',
    referenceNumber: 'UPI-ICICI-44882199',
    linkedInvoiceNumber: 'INV-2026-00002',
    notes: 'Part settlement for solar cabling invoice',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rcp-3',
    voucherNumber: 'RCP-2026-00003',
    date: today,
    timestamp: '02:45 PM',
    partyId: 'pty-3',
    partyName: 'L&T Heavy Engineering Division',
    amount: 35000,
    channel: 'CASH',
    referenceNumber: 'COUNTER-REC-08',
    notes: 'Direct counter cash receipt for transformer service',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    voucherNumber: 'PAY-2026-00001',
    date: today,
    timestamp: '11:00 AM',
    payeeName: 'Hindalco Copper & Metal Industries',
    partyId: 'pty-5',
    amount: 45000,
    category: 'SUPPLIER_PURCHASE',
    channel: 'BANK_TRANSFER',
    referenceNumber: 'RTGS-HDFC-882200',
    billNumber: 'HIN-OCT-449',
    notes: 'Payment for 99.9% purity copper busbars',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pay-2',
    voucherNumber: 'PAY-2026-00002',
    date: today,
    timestamp: '01:20 PM',
    payeeName: 'Blue Dart Express Logistics',
    partyId: 'pty-7',
    amount: 8500,
    category: 'FREIGHT_LOGISTICS',
    channel: 'UPI',
    referenceNumber: 'UPI-GPay-998811',
    billNumber: 'BD-EXP-7721',
    notes: 'Interstate heavy consignment freight charges',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pay-3',
    voucherNumber: 'PAY-2026-00003',
    date: today,
    timestamp: '04:10 PM',
    payeeName: 'Workshop Petty Cash Custodian',
    amount: 2500,
    category: 'PETTY_CASH',
    channel: 'CASH',
    referenceNumber: 'PETTY-VOUCHER-14',
    notes: 'Workshop tool repairs and client technical refreshments',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-00001',
    date: today,
    partyId: 'pty-1',
    partyName: 'Tata Power Industrial Solutions',
    taxableAmount: 127118.64,
    gstRate: 18,
    gstAmount: 22881.36,
    totalAmount: 150000,
    paidAmount: 150000,
    balanceAmount: 0,
    status: 'PAID',
    itemsDescription: '500kVA Industrial Step-Down Transformer (Serial PT-8829)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-00002',
    date: today,
    partyId: 'pty-2',
    partyName: 'Adani Solar Infrastructure Ltd',
    taxableAmount: 101694.92,
    gstRate: 18,
    gstAmount: 18305.08,
    totalAmount: 120000,
    paidAmount: 80000,
    balanceAmount: 40000,
    status: 'PARTIAL',
    itemsDescription: 'Modular HT Control Panels with programmable logic relays',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-00003',
    date: today,
    partyId: 'pty-4',
    partyName: 'Reliance Power Grid Systems',
    taxableAmount: 80508.47,
    gstRate: 18,
    gstAmount: 14491.53,
    totalAmount: 95000,
    paidAmount: 0,
    balanceAmount: 95000,
    status: 'UNPAID',
    itemsDescription: 'Heavy duty busbar copper trunking system (4000A capacity)',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_DAYS: Record<string, DayRecord> = {
  [today]: {
    date: today,
    isLocked: false,
    openingCash: 25000,
    openingBank: 340000,
    physicalCashCounted: 0,
    cashVariance: 0,
    varianceReason: '',
    denominations: {
      d2000: 0,
      d500: 0,
      d200: 0,
      d100: 0,
      d50: 0,
      d20: 0,
      d10: 0,
    },
  },
};

export interface LedgerStoreData {
  parties: Party[];
  receipts: Receipt[];
  payments: Payment[];
  invoices: Invoice[];
  days: Record<string, DayRecord>;
  seqReceipt: number;
  seqPayment: number;
  seqInvoice: number;
}

export function loadStore(): LedgerStoreData {
  const initial: LedgerStoreData = {
    parties: INITIAL_PARTIES,
    receipts: INITIAL_RECEIPTS,
    payments: INITIAL_PAYMENTS,
    invoices: INITIAL_INVOICES,
    days: INITIAL_DAYS,
    seqReceipt: 4,
    seqPayment: 4,
    seqInvoice: 4,
  };

  if (typeof window === 'undefined') {
    return initial;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.parties)) {
        if (!parsed.days || typeof parsed.days !== 'object') {
          parsed.days = { ...INITIAL_DAYS };
        }
        if (!parsed.days[today]) {
          const dates = Object.keys(parsed.days).sort();
          const lastDate = dates[dates.length - 1];
          const lastDay = lastDate ? parsed.days[lastDate] : null;

          parsed.days[today] = {
            date: today,
            isLocked: false,
            openingCash: lastDay ? (lastDay.physicalCashCounted || lastDay.openingCash) : 25000,
            openingBank: lastDay ? lastDay.openingBank : 340000,
            physicalCashCounted: 0,
            cashVariance: 0,
            varianceReason: '',
            denominations: { d2000: 0, d500: 0, d200: 0, d100: 0, d50: 0, d20: 0, d10: 0 },
          };
        }
        // Ensure all arrays exist
        parsed.receipts = parsed.receipts || [];
        parsed.payments = parsed.payments || [];
        parsed.invoices = parsed.invoices || [];
        parsed.parties = parsed.parties || [];
        parsed.seqReceipt = parsed.seqReceipt || 1;
        parsed.seqPayment = parsed.seqPayment || 1;
        parsed.seqInvoice = parsed.seqInvoice || 1;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load ledger store, resetting to initial data:', err);
  }

  saveStore(initial);
  return initial;
}

export function saveStore(data: LedgerStoreData): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }
}

export function calculateDenominationsTotal(d?: DenominationCount): number {
  if (!d) return 0;
  return (
    (Number(d.d2000) || 0) * 2000 +
    (Number(d.d500) || 0) * 500 +
    (Number(d.d200) || 0) * 200 +
    (Number(d.d100) || 0) * 100 +
    (Number(d.d50) || 0) * 50 +
    (Number(d.d20) || 0) * 20 +
    (Number(d.d10) || 0) * 10
  );
}

export function computePartyLedger(partyId: string, store: LedgerStoreData): { party: Party; entries: LedgerEntry[]; totalBilled: number; totalCollected: number; totalPaid: number; currentBalance: number } {
  const party = store.parties.find((p) => p.id === partyId);
  if (!party) {
    throw new Error('Party not found');
  }

  const entries: LedgerEntry[] = [];
  let running = party.openingBalance;

  // Opening balance entry
  entries.push({
    id: 'opening',
    date: '2026-04-01',
    voucherNumber: 'OPENING',
    type: 'OPENING',
    description: 'Brought Forward Opening Ledger Balance',
    debit: party.openingBalance > 0 ? party.openingBalance : 0,
    credit: party.openingBalance < 0 ? Math.abs(party.openingBalance) : 0,
    runningBalance: running,
  });

  let totalBilled = 0;
  let totalCollected = 0;
  let totalPaid = 0;

  // Invoices (for Customers: increases receivable -> debit)
  const partyInvoices = store.invoices.filter((i) => i.partyId === partyId);
  partyInvoices.forEach((inv) => {
    totalBilled += inv.totalAmount;
    running += inv.totalAmount;
    entries.push({
      id: inv.id,
      date: inv.date,
      voucherNumber: inv.invoiceNumber,
      type: 'INVOICE',
      description: `Sales Invoice: ${inv.itemsDescription}`,
      debit: inv.totalAmount,
      credit: 0,
      runningBalance: running,
    });
  });

  // Receipts (for Customers: payments received -> credit, reduces receivable)
  const partyReceipts = store.receipts.filter((r) => r.partyId === partyId);
  partyReceipts.forEach((rcp) => {
    totalCollected += rcp.amount;
    running -= rcp.amount;
    entries.push({
      id: rcp.id,
      date: rcp.date,
      voucherNumber: rcp.voucherNumber,
      type: 'RECEIPT',
      description: `Collection via ${rcp.channel}${rcp.referenceNumber ? ' (' + rcp.referenceNumber + ')' : ''}: ${rcp.notes || ''}`,
      debit: 0,
      credit: rcp.amount,
      runningBalance: running,
      channel: rcp.channel,
    });
  });

  // Payments (for Vendors: payouts made -> debit, reduces payable)
  const partyPayments = store.payments.filter((p) => p.partyId === partyId);
  partyPayments.forEach((pay) => {
    totalPaid += pay.amount;
    running += pay.amount; // for vendors who have negative balance, adding reduces liability
    entries.push({
      id: pay.id,
      date: pay.date,
      voucherNumber: pay.voucherNumber,
      type: 'PAYMENT',
      description: `Vendor Payout via ${pay.channel}${pay.billNumber ? ' Bill #' + pay.billNumber : ''}: ${pay.notes || ''}`,
      debit: pay.amount,
      credit: 0,
      runningBalance: running,
      channel: pay.channel,
    });
  });

  // Sort entries by date
  entries.sort((a, b) => a.date.localeCompare(b.date));

  // Recalculate true chronological running balance
  let cur = party.openingBalance;
  entries.forEach((e) => {
    if (e.id === 'opening') {
      e.runningBalance = cur;
    } else {
      cur = cur + e.debit - e.credit;
      e.runningBalance = cur;
    }
  });

  return {
    party,
    entries,
    totalBilled,
    totalCollected,
    totalPaid,
    currentBalance: cur,
  };
}
