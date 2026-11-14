import { CompanyDailyEntry, GroupGrandTotal, CompanySummary } from '../types';
import { GROUP_COMPANIES } from './companies';

const STORAGE_KEY = 'group_billing_ledger_v4';

// Seed realistic October 2026 records
function generateInitialEntries(): Record<string, CompanyDailyEntry> {
  const entries: Record<string, CompanyDailyEntry> = {};
  const todayStr = '2026-10-23';

  // Specific figures for Oct 23 matching the register
  const todayData: Record<
    string,
    {
      bill: number;
      gstPay: number;
      otherPay: number;
      pur: number;
      mode: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';
      time: string;
      notes: string;
    }
  > = {
    'pt-laser': {
      bill: 145000,
      gstPay: 95000,
      otherPay: 25000,
      pur: 35000,
      mode: 'BANK_TRANSFER',
      time: '23-10-2026, 04:15 PM',
      notes: 'Cleared via RTGS from bulk fabrication client',
    },
    'pt-laser-cutting': {
      bill: 210000,
      gstPay: 150000,
      otherPay: 35000,
      pur: 52000,
      mode: 'BANK_TRANSFER',
      time: '23-10-2026, 03:40 PM',
      notes: 'Job work billing and partial advance received',
    },
    'pt-laser-works': {
      bill: 95000,
      gstPay: 70000,
      otherPay: 18000,
      pur: 21000,
      mode: 'UPI',
      time: '23-10-2026, 05:10 PM',
      notes: 'Counter payment cleared in full',
    },
    'pt-i-laser': {
      bill: 175000,
      gstPay: 120000,
      otherPay: 30000,
      pur: 41000,
      mode: 'BANK_TRANSFER',
      time: '23-10-2026, 02:50 PM',
      notes: 'Laser profiling project collection',
    },
    'galaxy-pvd': {
      bill: 320000,
      gstPay: 230000,
      otherPay: 60000,
      pur: 84000,
      mode: 'CHEQUE',
      time: '23-10-2026, 12:30 PM',
      notes: 'Chq #44021 cleared in bank account',
    },
    'galaxy-laser-cutting': {
      bill: 160000,
      gstPay: 110000,
      otherPay: 30000,
      pur: 38000,
      mode: 'BANK_TRANSFER',
      time: '23-10-2026, 04:45 PM',
      notes: 'Direct NEFT transfer verified',
    },
    'rainbow-pvd': {
      bill: 115000,
      gstPay: 80000,
      otherPay: 18000,
      pur: 29000,
      mode: 'UPI',
      time: '23-10-2026, 01:15 PM',
      notes: 'PVD coating batch settlement',
    },
    'diamond-pvd': {
      bill: 240000,
      gstPay: 170000,
      otherPay: 45000,
      pur: 60000,
      mode: 'BANK_TRANSFER',
      time: '23-10-2026, 04:00 PM',
      notes: 'Architectural coating work payment received',
    },
    'merit-i-laser': {
      bill: 130000,
      gstPay: 85000,
      otherPay: 25000,
      pur: 32000,
      mode: 'BANK_TRANSFER',
      time: '23-10-2026, 05:30 PM',
      notes: 'Day closing payment verified by unit operator',
    },
  };

  // Seed October 14 to 22 history
  GROUP_COMPANIES.forEach((comp, idx) => {
    const baseBill = (idx + 1) * 35000 + 40000;
    const baseGst = Math.round(baseBill * 0.68);
    const baseOther = Math.round(baseBill * 0.20);
    const basePur = baseBill * 0.25;

    for (let d = 14; d <= 22; d++) {
      const dayStr = String(d).padStart(2, '0');
      const date = `2026-10-${dayStr}`;
      const key = `${comp.id}_${date}`;
      const variance = ((d * 7 + idx * 13) % 25) * 1000;
      const gstVal = baseGst + Math.round(variance * 0.6);
      const otherVal = baseOther + Math.round(variance * 0.2);
      entries[key] = {
        id: key,
        companyId: comp.id,
        companyName: comp.name,
        date,
        todayBilling: baseBill + variance,
        gstPayment: gstVal,
        otherPayment: otherVal,
        todayPayment: gstVal + otherVal,
        purchaseValue: basePur + variance * 0.2,
        paymentMode: (idx % 2 === 0 ? 'BANK_TRANSFER' : 'UPI') as any,
        paymentReceivedAt: `${dayStr}-10-2026, 04:30 PM`,
        notes: 'Daily collection recorded and verified',
        submittedBy: 'Operator',
        submittedAt: `${date}T16:30:00.000Z`,
      };
    }

    // Today Oct 23
    const td = todayData[comp.id];
    if (td) {
      const key = `${comp.id}_${todayStr}`;
      entries[key] = {
        id: key,
        companyId: comp.id,
        companyName: comp.name,
        date: todayStr,
        todayBilling: td.bill,
        gstPayment: td.gstPay,
        otherPayment: td.otherPay,
        todayPayment: td.gstPay + td.otherPay,
        purchaseValue: td.pur,
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
  const gst = Number(entry.gstPayment) || 0;
  const other = Number(entry.otherPayment) || 0;
  const totalPay = gst + other;

  all[key] = {
    ...entry,
    id: key,
    gstPayment: gst,
    otherPayment: other,
    todayPayment: totalPay,
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

  let totalTodayBill = 0;
  let totalTodayGstPay = 0;
  let totalTodayOtherPay = 0;
  let totalTodayPay = 0;
  let totalMonthBill = 0;
  let totalMonthGstPay = 0;
  let totalMonthOtherPay = 0;
  let totalMonthPay = 0;
  let totalNetDiff = 0;
  let submittedCount = 0;

  const summaries: CompanySummary[] = GROUP_COMPANIES.map((comp) => {
    const todayKey = `${comp.id}_${selectedDate}`;
    const todayEntry = entries[todayKey];

    const todayBill = todayEntry ? todayEntry.todayBilling : 0;
    const todayGst = todayEntry ? (Number(todayEntry.gstPayment) || 0) : 0;
    const todayOther = todayEntry ? (Number(todayEntry.otherPayment) || 0) : 0;
    const todayPay = todayEntry ? (todayGst + todayOther || todayEntry.todayPayment) : 0;

    // Month Cumulative for this company up to selectedDate
    const compMonthEntries = allList.filter(
      (e) => e.companyId === comp.id && e.date.startsWith(currentMonth) && e.date <= selectedDate
    );

    const monthBill = compMonthEntries.reduce((sum, e) => sum + e.todayBilling, 0);
    const monthGst = compMonthEntries.reduce((sum, e) => sum + (Number(e.gstPayment) || Math.round(e.todayPayment * 0.75)), 0);
    const monthOther = compMonthEntries.reduce((sum, e) => sum + (Number(e.otherPayment) || Math.round(e.todayPayment * 0.25)), 0);
    const monthPay = monthGst + monthOther;
    const netDiff = monthBill - monthPay;

    if (todayEntry) {
      submittedCount++;
    }

    totalTodayBill += todayBill;
    totalTodayGstPay += todayGst;
    totalTodayOtherPay += todayOther;
    totalTodayPay += todayPay;
    totalMonthBill += monthBill;
    totalMonthGstPay += monthGst;
    totalMonthOtherPay += monthOther;
    totalMonthPay += monthPay;
    totalNetDiff += netDiff;

    const rate = monthBill > 0 ? (monthPay / monthBill) * 100 : 0;
    const activeDays = Math.max(1, compMonthEntries.length);
    const avgDailyBilling = monthBill / activeDays;

    return {
      company: comp,
      todayBilling: todayBill,
      todayGstPayment: todayGst,
      todayOtherPayment: todayOther,
      todayPayment: todayPay,
      monthBilling: monthBill,
      monthGstPayment: monthGst,
      monthOtherPayment: monthOther,
      monthPayment: monthPay,
      netDifference: netDiff,
      hasEntryToday: Boolean(todayEntry),
      notes: todayEntry?.notes,
      paymentMode: todayEntry?.paymentMode,
      paymentReceivedAt: todayEntry?.paymentReceivedAt || (todayPay > 0 ? `${selectedDate.split('-').reverse().join('-')}, 04:00 PM` : '-'),
      lastUpdated: todayEntry?.submittedAt,
      collectionRate: Number(rate.toFixed(1)),
      avgDailyBilling: Math.round(avgDailyBilling),
    };
  });

  const grandCollectionRate =
    totalMonthBill > 0 ? (totalMonthPay / totalMonthBill) * 100 : 0;

  const grandTotal: GroupGrandTotal = {
    todayBilling: totalTodayBill,
    todayGstPayment: totalTodayGstPay,
    todayOtherPayment: totalTodayOtherPay,
    todayPayment: totalTodayPay,
    monthBilling: totalMonthBill,
    monthGstPayment: totalMonthGstPay,
    monthOtherPayment: totalMonthOtherPay,
    monthPayment: totalMonthPay,
    netDifference: totalNetDiff,
    submittedCount,
    totalCompanies: GROUP_COMPANIES.length,
    collectionRate: Number(grandCollectionRate.toFixed(1)),
  };

  return { summaries, grandTotal };
}
