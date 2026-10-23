'use client';

import dynamic from 'next/dynamic';

const DailyBillingLedgerTerminal = dynamic(
  () => import('../components/DailyBillingLedgerTerminal'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#0a84ff] border-t-transparent animate-spin" />
          <span className="text-xs text-[#8e8e93] font-medium tracking-wide">
            Loading Daily Billing Ledger...
          </span>
        </div>
      </div>
    ),
  }
);

export default function Page() {
  return <DailyBillingLedgerTerminal />;
}
