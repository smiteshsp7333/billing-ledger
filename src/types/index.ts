export type PaymentChannel = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD';

export type PartyType = 'CUSTOMER' | 'VENDOR' | 'SERVICE_PROVIDER';

export type ExpenseCategory =
  | 'SUPPLIER_PURCHASE'
  | 'FREIGHT_LOGISTICS'
  | 'OFFICE_EXPENSE'
  | 'PETTY_CASH'
  | 'RENT_UTILITIES'
  | 'SALARY_ADVANCE'
  | 'TAX_DUTY'
  | 'MISCELLANEOUS';

export type InvoicePaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  phone: string;
  email?: string;
  gstin?: string;
  city?: string;
  openingBalance: number; // positive = receivable from customer, negative = payable to vendor
}

export interface Receipt {
  id: string;
  voucherNumber: string; // RCP-2026-00001
  date: string; // YYYY-MM-DD
  timestamp: string;
  partyId: string;
  partyName: string;
  amount: number;
  channel: PaymentChannel;
  referenceNumber?: string;
  linkedInvoiceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  voucherNumber: string; // PAY-2026-00001
  date: string; // YYYY-MM-DD
  timestamp: string;
  payeeName: string;
  partyId?: string;
  amount: number;
  category: ExpenseCategory;
  channel: PaymentChannel;
  referenceNumber?: string;
  billNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2026-00001
  date: string; // YYYY-MM-DD
  partyId: string;
  partyName: string;
  taxableAmount: number;
  gstRate: number; // e.g. 18
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoicePaymentStatus;
  itemsDescription: string;
  createdAt: string;
}

export interface DenominationCount {
  d2000: number;
  d500: number;
  d200: number;
  d100: number;
  d50: number;
  d20: number;
  d10: number;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  openingCash: number;
  openingBank: number;
  denominations?: DenominationCount;
  physicalCashCounted?: number;
  cashVariance?: number;
  varianceReason?: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  voucherNumber: string;
  type: 'INVOICE' | 'RECEIPT' | 'PAYMENT' | 'OPENING';
  description: string;
  debit: number; // increases customer receivable or decreases vendor payable
  credit: number; // decreases customer receivable or increases vendor payable
  runningBalance: number;
  channel?: PaymentChannel;
}

export type ActiveTab = 'DAYBOOK' | 'RECEIPTS' | 'PAYMENTS' | 'INVOICES' | 'PARTIES' | 'EOD' | 'ANALYTICS';

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
