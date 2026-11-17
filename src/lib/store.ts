import { CompanyDailyEntry, GroupGrandTotal, CompanySummary } from '../types';
import { GROUP_COMPANIES } from './companies';

const STORAGE_KEY = 'group_billing_ledger_v6';

// Seed realistic records matching Screenshot 1 & 2
function generateInitialEntries(): Record<string, CompanyDailyEntry> {
  const entries: Record<string, CompanyDailyEntry> = {};
  const todayStr = '2026-10-23';

  // Specific figures for Oct 23 matching Screenshot 1 & 2
  const todayData: Record<
    string,
    {
      baseBill: number;
      otherBill: number;
      payCol: number;
      otherPay: number;
      time: string;
      mode: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';
      notes: string;
    }
  > = {
    'pt-laser': {
      baseBill: 100000,
      otherBill: 5000,
      payCol: 110000,
      otherPay: 5000,
      time: '23-10-2026, 04:15 PM',
      mode: 'BANK_TRANSFER',
      notes: 'Cleared via RTGS from bulk fabrication client',
    },
    'pt-laser-cutting': {
      baseBill: 150000,
      otherBill: 8000,
      payCol: 160000,
      otherPay: 7000,
      time: '23-10-2026, 03:40 PM',
      mode: 'BANK_TRANSFER',
      notes: 'Job work billing and partial advance received',
    },
    'pt-laser-works': {
      baseBill: 80000,
      otherBill: 4000,
      payCol: 85000,
      otherPay: 4000,
      time: '23-10-2026, 05:10 PM',
      mode: 'UPI',
      notes: 'Counter payment cleared in full',
    },
    'pt-i-laser': {
      baseBill: 125000,
      otherBill: 6000,
      payCol: 135000,
      otherPay: 5000,
      time: '23-10-2026, 02:50 PM',
      mode: 'BANK_TRANSFER',
      notes: 'Laser profiling project collection',
    },
    'galaxy-pvd': {
      baseBill: 220000,
      otherBill: 10000,
      payCol: 240000,
      otherPay: 8000,
      time: '23-10-2026, 12:30 PM',
      mode: 'CHEQUE',
      notes: 'Chq #44021 cleared in bank account',
    },
    'galaxy-laser-cutting': {
      baseBill: 110000,
      otherBill: 5000,
      payCol: 120000,
      otherPay: 4000,
      time: '23-10-2026, 04:45 PM',
      mode: 'BANK_TRANSFER',
      notes: 'Direct NEFT transfer verified',
    },
    'rainbow-pvd': {
      baseBill: 85000,
      otherBill: 4000,
      payCol: 92000,
      otherPay: 3500,
      time: '23-10-2026, 01:15 PM',
      mode: 'UPI',
      notes: 'PVD coating batch settlement',
    },
    'diamond-pvd': {
      baseBill: 170000,
      otherBill: 8000,
      payCol: 185000,
      otherPay: 6000,
      time: '23-10-2026, 04:00 PM',
      mode: 'BANK_TRANSFER',
      notes: 'Architectural coating work payment received',
    },
    'merit-i-laser': {
      baseBill: 95000,
      otherBill: 4500,
      payCol: 102000,
      otherPay: 4000,
      time: '23-10-2026, 05:30 PM',
      mode: 'BANK_TRANSFER',
      notes: 'Day closing payment verified by unit operator',
    },
  };

  // Seed October 16 to 22 history (last 7 days)
  GROUP_COMPANIES.forEach((comp, idx) => {
    const defaultBase = (idx + 1) * 20000 + 60000;
    const defaultOther = 3000 + idx * 500;

    for (let d = 16; d <= 22; d++) {
      const dayStr = String(d).padStart(2, '0');
      const date = `2026-10-${dayStr}`;
      const key = `${comp.id}_${date}`;
      const variance = ((d * 7 + idx * 11) % 15) * 1000;
      const bBill = defaultBase + variance;
      const oBill = defaultOther + ((d % 3) * 500);
      const bWithGst = Math.round(bBill * 1.18);
      const pCol = Math.round(bWithGst * 0.92);
      const oPay = Math.round(oBill * 0.9);

      entries[key] = {
        id: key,
        companyId: comp.id,
        companyName: comp.name,
        date,
        billing: bBill,
        otherBilling: oBill,
        billingWithGst: bWithGst,
        paymentCollection: pCol,
        otherPayment: oPay,
        todayBilling: bWithGst + oBill,
        todayPayment: pCol + oPay,
        paymentMode: (idx % 2 === 0 ? 'BANK_TRANSFER' : 'UPI') as any,
        paymentReceivedAt: `${dayStr}-10-2026, 04:30 PM`,
        notes: 'Daily collection recorded and verified',
        submittedBy: `${comp.code} Operator`,
        submittedAt: `${date}T16:30:00.000Z`,
      };
    }

    // Today Oct 23
    const td = todayData[comp.id];
    if (td) {
      const key = `${comp.id}_${todayStr}`;
      const bWithGst = Math.round(td.baseBill * 1.18);
      entries[key] = {
        id: key,
        companyId: comp.id,
        companyName: comp.name,
        date: todayStr,
        billing: td.baseBill,
        otherBilling: td.otherBill,
        billingWithGst: bWithGst,
        paymentCollection: td.payCol,
        otherPayment: td.otherPay,
        todayBilling: bWithGst + td.otherBill,
        todayPayment: td.payCol + td.otherPay,
        paymentMode: td.mode,
        paymentReceivedAt: td.time,
        notes: td.notes,
        submittedBy: `${comp.code} Operator`,
        submittedAt: `${todayStr}T16:00:00.000Z`,
      };
    }
  });

  return entries;
}

export function loadAllEntries(): Record<string, CompanyDailyEntry> {
  if (typeof window === 'undefined') {
    return generateInitialEntries();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load group ledger store:', err);
  }

  const initial = generateInitialEntries();
  saveAllEntries(initial);
  return initial;
}

export function saveAllEntries(entries: Record<string, CompanyDailyEntry>): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save group ledger entries:', e);
    }
  }
}

export function saveCompanyDailyEntry(entry: CompanyDailyEntry): void {
  const all = loadAllEntries();
  const key = `${entry.companyId}_${entry.date}`;

  const otherBill = Number(entry.otherBilling) || 0;
  let bWithGst = Number(entry.billingWithGst) || 0;
  let baseBill = Number(entry.billing) || 0;

  // Auto-reconcile base billing vs billing with GST
  if (bWithGst > 0 && baseBill === 0) {
    baseBill = Math.round(bWithGst / 1.18);
  } else if (baseBill > 0 && bWithGst === 0) {
    bWithGst = Math.round(baseBill * 1.18);
  }

  const payCol = Number(entry.paymentCollection) || 0;
  const oPay = Number(entry.otherPayment) || 0;
  const totBill = bWithGst + otherBill;
  const totPay = payCol + oPay;

  all[key] = {
    ...entry,
    id: key,
    billing: baseBill,
    otherBilling: otherBill,
    billingWithGst: bWithGst,
    paymentCollection: payCol,
    otherPayment: oPay,
    todayBilling: totBill,
    todayPayment: totPay,
    submittedAt: entry.submittedAt || new Date().toISOString(),
  };
  saveAllEntries(all);
}

export function getCompanyEntries(companyId: string): CompanyDailyEntry[] {
  const all = loadAllEntries();
  return Object.values(all)
    .filter((e) => e.companyId === companyId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// Compute Consolidated Master Matrix for a selected date
export function computeConsolidatedSummary(
  selectedDate: string,
  entries: Record<string, CompanyDailyEntry>
): {
  summaries: CompanySummary[];
  grandTotal: GroupGrandTotal;
} {
  const currentMonth = selectedDate.slice(0, 7); // YYYY-MM
  const allList = Object.values(entries);

  let totalBilling = 0;
  let totalOtherBilling = 0;
  let totalBillingWithGst = 0;
  let totalPaymentCollection = 0;
  let totalOtherPayment = 0;
  let totalTodayBilling = 0;
  let totalTodayPayment = 0;

  let totalMonthBilling = 0;
  let totalMonthOtherBilling = 0;
  let totalMonthBillingWithGst = 0;
  let totalMonthPaymentCollection = 0;
  let totalMonthOtherPayment = 0;
  let totalMonthPayment = 0;

  let submittedCount = 0;

  const summaries: CompanySummary[] = GROUP_COMPANIES.map((comp) => {
    const todayKey = `${comp.id}_${selectedDate}`;
    const todayEntry = entries[todayKey];

    const bBill = todayEntry ? (Number(todayEntry.billing) || Math.round((Number(todayEntry.billingWithGst) || 0) / 1.18)) : 0;
    const oBill = todayEntry ? (Number(todayEntry.otherBilling) || 0) : 0;
    const bWithGst = todayEntry ? (Number(todayEntry.billingWithGst) || Math.round(bBill * 1.18)) : 0;
    const pCol = todayEntry ? (Number(todayEntry.paymentCollection) || 0) : 0;
    const oPay = todayEntry ? (Number(todayEntry.otherPayment) || 0) : 0;
    const todayBill = bWithGst + oBill;
    const todayPay = pCol + oPay;

    // Month Cumulative for this company up to selectedDate
    const compMonthEntries = allList.filter(
      (e) => e.companyId === comp.id && e.date.startsWith(currentMonth) && e.date <= selectedDate
    );

    const monthBill = compMonthEntries.reduce((sum, e) => sum + (Number(e.billing) || Math.round((Number(e.billingWithGst) || e.todayBilling) / 1.18)), 0);
    const monthOtherBill = compMonthEntries.reduce((sum, e) => sum + (Number(e.otherBilling) || 0), 0);
    const monthBillWithGst = compMonthEntries.reduce((sum, e) => sum + (Number(e.billingWithGst) || Math.round((Number(e.billing) || 0) * 1.18) || e.todayBilling), 0);
    const monthPayCol = compMonthEntries.reduce((sum, e) => sum + (Number(e.paymentCollection) || Math.round(e.todayPayment * 0.95)), 0);
    const monthOtherPay = compMonthEntries.reduce((sum, e) => sum + (Number(e.otherPayment) || Math.round(e.todayPayment * 0.05)), 0);
    const monthTotalBill = monthBillWithGst + monthOtherBill;
    const monthTotalPay = monthPayCol + monthOtherPay;

    if (todayEntry) {
      submittedCount++;
    }

    totalBilling += bBill;
    totalOtherBilling += oBill;
    totalBillingWithGst += bWithGst;
    totalPaymentCollection += pCol;
    totalOtherPayment += oPay;
    totalTodayBilling += todayBill;
    totalTodayPayment += todayPay;

    totalMonthBilling += monthBill;
    totalMonthOtherBilling += monthOtherBill;
    totalMonthBillingWithGst += monthBillWithGst;
    totalMonthPaymentCollection += monthPayCol;
    totalMonthOtherPayment += monthOtherPay;
    totalMonthPayment += monthTotalPay;

    const rate = monthTotalBill > 0 ? (monthTotalPay / monthTotalBill) * 100 : 0;
    const activeDays = Math.max(1, compMonthEntries.length);
    const avgDailyBilling = monthTotalBill / activeDays;

    return {
      company: comp,
      billing: bBill,
      otherBilling: oBill,
      billingWithGst: bWithGst,
      paymentCollection: pCol,
      otherPayment: oPay,
      todayBilling: todayBill,
      todayPayment: todayPay,
      monthBilling: monthBill,
      monthOtherBilling: monthOtherBill,
      monthBillingWithGst: monthBillWithGst,
      monthPaymentCollection: monthPayCol,
      monthOtherPayment: monthOtherPay,
      monthPayment: monthTotalPay,
      hasEntryToday: Boolean(todayEntry),
      notes: todayEntry?.notes,
      paymentMode: todayEntry?.paymentMode,
      paymentReceivedAt:
        todayEntry?.paymentReceivedAt ||
        (todayPay > 0 ? `${selectedDate.split('-').reverse().join('-')}, 04:00 PM` : '-'),
      lastUpdated: todayEntry?.submittedAt,
      collectionRate: Number(rate.toFixed(1)),
      avgDailyBilling: Math.round(avgDailyBilling),
    };
  });

  const grandTotal: GroupGrandTotal = {
    billing: totalBilling,
    otherBilling: totalOtherBilling,
    billingWithGst: totalBillingWithGst,
    paymentCollection: totalPaymentCollection,
    otherPayment: totalOtherPayment,
    todayBilling: totalTodayBilling,
    todayPayment: totalTodayPayment,
    monthBilling: totalMonthBilling,
    monthOtherBilling: totalMonthOtherBilling,
    monthBillingWithGst: totalMonthBillingWithGst,
    monthPaymentCollection: totalMonthPaymentCollection,
    monthOtherPayment: totalMonthOtherPayment,
    monthPayment: totalMonthPayment,
    submittedCount,
    totalCompanies: GROUP_COMPANIES.length,
    collectionRate:
      totalMonthBillingWithGst + totalMonthOtherBilling > 0
        ? Number(((totalMonthPayment / (totalMonthBillingWithGst + totalMonthOtherBilling)) * 100).toFixed(1))
        : 0,
  };

  return { summaries, grandTotal };
}
