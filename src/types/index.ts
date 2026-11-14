export type CompanyCategory = 'LASER' | 'PVD' | 'WORKS';

export interface GroupCompany {
  id: string;
  name: string;
  category: CompanyCategory;
  code: string;
  location?: string;
  defaultUsername: string;
  defaultEmail: string;
}

export interface CompanyDailyEntry {
  id: string; // companyId_YYYY-MM-DD
  companyId: string;
  companyName: string;
  date: string; // YYYY-MM-DD
  todayBilling: number; // Today Billing value (INR)
  gstPayment: number; // GST Collection (INR)
  otherPayment: number; // Others / Other Collection (INR)
  todayPayment: number; // Total Collection = gstPayment + otherPayment (INR)
  purchaseValue?: number; // Optional
  notes?: string; // Optional remarks / narration
  paymentMode?: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';
  paymentReceivedAt?: string; // e.g. "23-10-2026, 04:15 PM"
  submittedBy?: string;
  submittedAt: string;
}

export interface CompanySummary {
  company: GroupCompany;
  todayBilling: number;
  todayGstPayment: number;
  todayOtherPayment: number;
  todayPayment: number;
  monthBilling: number;
  monthGstPayment: number;
  monthOtherPayment: number;
  monthPayment: number;
  netDifference: number; // Total Bill - Total Payment
  hasEntryToday: boolean;
  notes?: string;
  paymentMode?: string;
  paymentReceivedAt?: string;
  lastUpdated?: string;
  collectionRate: number; // Percentage
  avgDailyBilling: number;
}

export interface GroupGrandTotal {
  todayBilling: number;
  todayGstPayment: number;
  todayOtherPayment: number;
  todayPayment: number;
  monthBilling: number;
  monthGstPayment: number;
  monthOtherPayment: number;
  monthPayment: number;
  netDifference: number;
  submittedCount: number;
  totalCompanies: number;
  collectionRate: number;
}

export interface UserSession {
  email: string;
  username: string;
  name: string;
  role: 'SUPER_ADMIN' | 'COMPANY_USER';
  companyId?: string; // Assigned company for COMPANY_USER
  companyName?: string;
  token: string;
  loggedInAt: string;
}
