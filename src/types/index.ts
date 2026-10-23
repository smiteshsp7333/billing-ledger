export type CompanyCategory = 'LASER' | 'PVD' | 'WORKS';

export interface GroupCompany {
  id: string;
  name: string;
  category: CompanyCategory;
  code: string;
  location?: string;
}

export interface CompanyDailyEntry {
  id: string; // companyId_YYYY-MM-DD
  companyId: string;
  companyName: string;
  date: string; // YYYY-MM-DD
  todayBilling: number; // Today Billing value (₹)
  todayPayment: number; // Today Payment / Collection (₹)
  purchaseValue: number; // Purchase / Outward value (₹)
  notes?: string;
  submittedBy: string;
  submittedAt: string;
}

export interface CompanySummary {
  company: GroupCompany;
  todayBilling: number;
  todayPayment: number;
  monthBilling: number;
  monthPayment: number;
  netDifference: number; // Total Bill - Total Payment or Billing - Purchase
  hasEntryToday: boolean;
  notes?: string;
  lastUpdated?: string;
}

export interface GroupGrandTotal {
  todayBilling: number;
  todayPayment: number;
  monthBilling: number;
  monthPayment: number;
  netDifference: number;
  submittedCount: number;
  totalCompanies: number;
}

export interface UserSession {
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ACCOUNTS' | 'COMPANY_USER';
  companyId?: string; // Assigned company for COMPANY_USER
  companyName?: string;
  token: string;
  loggedInAt: string;
}
