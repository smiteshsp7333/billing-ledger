'use client';

import React from 'react';
import { CompanySummary, GroupGrandTotal } from '../../types';
import {
  Building2,
  TrendingUp,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Edit2,
  DollarSign,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface MasterConsolidatedViewProps {
  selectedDate: string;
  activeView: 'DAILY' | 'MONTHLY';
  summaries: CompanySummary[];
  grandTotal: GroupGrandTotal;
  onEditCompany: (companyId: string) => void;
  selectedCompanyFilter: string | null;
  setSelectedCompanyFilter: (id: string | null) => void;
}

export default function MasterConsolidatedView({
  selectedDate,
  activeView,
  summaries,
  grandTotal,
  onEditCompany,
  selectedCompanyFilter,
  setSelectedCompanyFilter,
}: MasterConsolidatedViewProps) {
  const filteredSummaries = selectedCompanyFilter
    ? summaries.filter((s) => s.company.id === selectedCompanyFilter)
    : summaries;

  const collectionRate =
    grandTotal.todayBilling > 0
      ? ((grandTotal.todayPayment / grandTotal.todayBilling) * 100).toFixed(1)
      : '0.0';

  const monthCollectionRate =
    grandTotal.monthBilling > 0
      ? ((grandTotal.monthPayment / grandTotal.monthBilling) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* 5 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Today Total Billing */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
            <span>Today Total Billing</span>
            <TrendingUp className="w-4 h-4 text-[#0a84ff]" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ₹{grandTotal.todayBilling.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#8e8e93] mt-1 block">
            Across {grandTotal.submittedCount} of {grandTotal.totalCompanies} companies
          </span>
        </div>

        {/* Today Total Payment (Collection) */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
            <span>Today Total Payment</span>
            <ArrowDownLeft className="w-4 h-4 text-[#30d158]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#30d158]">
            ₹{grandTotal.todayPayment.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#30d158] mt-1 block">
            {collectionRate}% daily recovery rate
          </span>
        </div>

        {/* Cumulative Month Billing */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
            <span>Total Bill (Month)</span>
            <Layers className="w-4 h-4 text-[#bf5af2]" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ₹{grandTotal.monthBilling.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#8e8e93] mt-1 block">
            Cumulative MTD Total
          </span>
        </div>

        {/* Cumulative Month Payment (TP) */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
            <span>Total Payment (TP)</span>
            <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#30d158]">
            ₹{grandTotal.monthPayment.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#8e8e93] mt-1 block">
            {monthCollectionRate}% MTD collection
          </span>
        </div>

        {/* Net Outstanding / Difference */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
            <span>Net Group Balance</span>
            <DollarSign className="w-4 h-4 text-[#ff9f0a]" />
          </div>
          <div className={`text-xl font-bold font-mono ${
            grandTotal.netDifference >= 0 ? 'text-[#ff9f0a]' : 'text-[#30d158]'
          }`}>
            ₹{Math.abs(grandTotal.netDifference).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#8e8e93] mt-1 block">
            {grandTotal.netDifference >= 0 ? 'Net Receivable' : 'Net Advance Surplus'}
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Group of Companies Selector (As Srinivas Sir requested) */}
        <div className="lg:col-span-1 bg-[#1c1c1e]/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0a84ff]" />
              Group Companies
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80">
              9 Units
            </span>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setSelectedCompanyFilter(null)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                selectedCompanyFilter === null
                  ? 'bg-[#0a84ff] text-white shadow-md'
                  : 'text-[#8e8e93] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>All 9 Companies (Consolidated)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {summaries.map((s) => (
              <button
                key={s.company.id}
                type="button"
                onClick={() =>
                  setSelectedCompanyFilter(
                    selectedCompanyFilter === s.company.id ? null : s.company.id
                  )
                }
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                  selectedCompanyFilter === s.company.id
                    ? 'bg-[#0a84ff] text-white font-semibold shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      s.hasEntryToday ? 'bg-[#30d158]' : 'bg-[#ff9f0a]'
                    }`}
                  />
                  <span className="truncate text-[11px] font-medium">{s.company.name}</span>
                </div>
                <span className="text-[10px] font-mono text-[#8e8e93]">
                  ₹{(s.todayBilling / 1000).toFixed(0)}k
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 text-[11px] text-[#8e8e93] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#30d158]" /> Updated Today
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff9f0a]" /> Pending
            </span>
          </div>
        </div>

        {/* Right Side: The Master Consolidated Table (As per Handwritten Sheet) */}
        <div className="lg:col-span-3 bg-[#1c1c1e]/80 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Consolidated Operational Billing & Payment Register
              </h2>
              <p className="text-xs text-[#8e8e93]">
                Date: <span className="text-white font-mono font-semibold">{selectedDate}</span> • Group Daily Collections & Cumulative Month Figures
              </p>
            </div>

            {selectedCompanyFilter && (
              <button
                type="button"
                onClick={() => setSelectedCompanyFilter(null)}
                className="text-xs text-[#0a84ff] hover:underline flex items-center gap-1 self-start sm:self-auto font-medium"
              >
                <span>Clear filter (Show all 9 companies)</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[#8e8e93] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4 text-right">Today Billing</th>
                  <th className="py-3 px-4 text-right">Today Payment (Collection)</th>
                  <th className="py-3 px-4 text-right">Total Bill (MTD)</th>
                  <th className="py-3 px-4 text-right">Total Payment (TP)</th>
                  <th className="py-3 px-4 text-right">Net Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSummaries.map((item) => (
                  <tr
                    key={item.company.id}
                    className="hover:bg-white/[0.04] transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-[#0a84ff] font-bold">
                          {item.company.code}
                        </span>
                        <div>
                          <div className="text-white font-bold">{item.company.name}</div>
                          <div className="text-[10px] text-[#8e8e93]">{item.company.location}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                      ₹{item.todayBilling.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#30d158]">
                      ₹{item.todayPayment.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-white/90">
                      ₹{item.monthBilling.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#30d158]">
                      ₹{item.monthPayment.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-medium">
                      <span
                        className={`${
                          item.netDifference >= 0 ? 'text-[#ff9f0a]' : 'text-[#30d158]'
                        }`}
                      >
                        ₹{Math.abs(item.netDifference).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.hasEntryToday ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30">
                          <CheckCircle2 className="w-3 h-3" /> Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff9f0a]/15 text-[#ff9f0a] border border-[#ff9f0a]/30">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onEditCompany(item.company.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-medium border border-white/10 transition-colors inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3 text-[#0a84ff]" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="bg-[#0a84ff]/15 border-t-2 border-[#0a84ff]/40 text-white font-bold text-xs">
                  <td className="py-4 px-4 uppercase tracking-wider font-extrabold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0a84ff] animate-ping" />
                    GRAND TOTAL ({grandTotal.totalCompanies} COMPANIES)
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-sm font-extrabold text-white">
                    ₹{grandTotal.todayBilling.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-sm font-extrabold text-[#30d158]">
                    ₹{grandTotal.todayPayment.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-sm font-extrabold text-white">
                    ₹{grandTotal.monthBilling.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-sm font-extrabold text-[#30d158]">
                    ₹{grandTotal.monthPayment.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-sm font-extrabold text-[#ff9f0a]">
                    ₹{Math.abs(grandTotal.netDifference).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-center text-[11px] font-mono text-white/80">
                    {grandTotal.submittedCount}/{grandTotal.totalCompanies} Done
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-[10px] text-white/70 font-mono">Verified</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
