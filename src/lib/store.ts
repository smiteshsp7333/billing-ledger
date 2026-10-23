import { CompanyDailyEntry, GroupGrandTotal, CompanySummary } from '../types';
import { GROUP_COMPANIES } from './companies';

const STORAGE_KEY = 'group_billing_ledger_v2';

// Seed realistic October 2026 records
function generateInitialEntries(): Record<string, CompanyDailyEntry> {
  const entries: Record<string, CompanyDailyEntry> = {};
  const todayStr = '2026-10-23';

  // Realistic billing and collections for today (Oct 23)
  const todayData: Record<string, { bill: number; pay: number; pur: number; submitted: boolean }> = {
    'pt-laser': { bill: 145000, pay: 120000, pur: 35000, submitted: true },
    'pt-laser-cutting': { bill: 210000, pay: 185000, pur: 52000, submitted: true },
    'pt-laser-works': { bill: 95000, pay: 88000, pur: 21000, submitted: true },
    'pt-i-laser': { bill: 175000, pay: 150000, pur: 41000, submitted: true },
    'galaxy-pvd': { bill: 320000, pay: 290000, pur: 84000, submitted: true },
    'galaxy-laser-cutting': { bill: 160000, pay: 140000, pur: 38000, submitted: true },
    'rainbow-pvd': { bill: 115000, pay: 98000, pur: 29000, submitted: true },
    'diamond-pvd': { bill: 240000, pay: 215000, pur: 60000, submitted: true },
    'merit-i-laser': { bill: 130000, pay: 110000, pur: 32000, submitted: true },
  };

  // Seed October 1 to 23
  GROUP_COMPANIES.forEach((comp, idx) => {
    const baseBill = (idx + 1) * 35000 + 40000;
    const basePay = baseBill * 0.88;
    const basePur = baseBill * 0.25;

    // Past 10 days
    for (let d = 14; d <= 22; d++) {
      const date = `2026-10-${String(d).padStart(2, '0')}`;
      const key = `${comp.id}_${date}`;
      const variance = ((d * 7 + idx * 13) % 25) * 1000;
      entries[key] = {
        id: key,
        companyId: comp.id,
        companyName: comp.name,
        date,
        todayBilling: baseBill + variance,
        todayPayment: basePay + variance * 0.8,
        purchaseValue: basePur + variance * 0.2,
        notes: d === 22 ? 'Cleared part payment' : undefined,
        submittedBy: 'Operator',
        submittedAt: `${date}T18:30:00.000Z`,
      };
    }

    // Today Oct 23
    const td = todayData[comp.id];
    if (td && td.submitted) {
      const key = `${comp.id}_${todayStr}`;
      entries[key] = {
        id: key,
        companyId: comp.id,
        companyName: comp.name,
        date: todayStr,
        todayBilling: td.bill,
        todayPayment: td.pay,
        purchaseValue: td.pur,
        notes: 'Regular daily run verified',
        submittedBy: 'Accounts Lead',
        submittedAt: `${todayStr}T16:15:00.000Z`,
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
  all[key] = {
    ...entry,
    id: key,
    submittedAt: new Date().toISOString(),
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
  let totalTodayPay = 0;
  let totalMonthBill = 0;
  let totalMonthPay = 0;
  let totalNetDiff = 0;
  let submittedCount = 0;

  const summaries: CompanySummary[] = GROUP_COMPANIES.map((comp) => {
    const todayKey = `${comp.id}_${selectedDate}`;
    const todayEntry = entries[todayKey];

    const todayBill = todayEntry ? todayEntry.todayBilling : 0;
    const todayPay = todayEntry ? todayEntry.todayPayment : 0;

    // Month Cumulative for this company
    const compMonthEntries = allList.filter(
      (e) => e.companyId === comp.id && e.date.startsWith(currentMonth) && e.date <= selectedDate
    );

    const monthBill = compMonthEntries.reduce((sum, e) => sum + e.todayBilling, 0);
    const monthPay = compMonthEntries.reduce((sum, e) => sum + e.todayPayment, 0);
    const netDiff = monthBill - monthPay;

    if (todayEntry) {
      submittedCount++;
    }

    totalTodayBill += todayBill;
    totalTodayPay += todayPay;
    totalMonthBill += monthBill;
    totalMonthPay += monthPay;
    totalNetDiff += netDiff;

    return {
      company: comp,
      todayBilling: todayBill,
      todayPayment: todayPay,
      monthBilling: monthBill,
      monthPayment: monthPay,
      netDifference: netDiff,
      hasEntryToday: Boolean(todayEntry),
      notes: todayEntry?.notes,
      lastUpdated: todayEntry?.submittedAt,
    };
  });

  const grandTotal: GroupGrandTotal = {
    todayBilling: totalTodayBill,
    todayPayment: totalTodayPay,
    monthBilling: totalMonthBill,
    monthPayment: totalMonthPay,
    netDifference: totalNetDiff,
    submittedCount,
    totalCompanies: GROUP_COMPANIES.length,
  };

  return { summaries, grandTotal };
}
