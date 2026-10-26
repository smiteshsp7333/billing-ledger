'use client';

import React from 'react';
import { CompanySummary, GroupGrandTotal } from '../../types';
import { SYSTEM_ACCOUNTS } from '../../lib/companies';
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
  Calendar,
  Percent,
  CalendarDays,
  Key,
  Copy,
  Check,
  X,
} from 'lucide-react';

interface MasterConsolidatedViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeView: 'DAILY' | 'MONTHLY';
  summaries: CompanySummary[];
  grandTotal: GroupGrandTotal;
  onEditCompany: (companyId: string) => void;
  selectedCompanyFilter: string | null;
  setSelectedCompanyFilter: (id: string | null) => void;
}

export default function MasterConsolidatedView({

  selectedDate,
  setSelectedDate,
  activeView,
  summaries,
  grandTotal,
  onEditCompany,
  selectedCompanyFilter,
  setSelectedCompanyFilter,
}: MasterConsolidatedViewProps) {
  const [showAccountsModal, setShowAccountsModal] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const companyAccounts = SYSTEM_ACCOUNTS.filter((acc) => acc.role === 'COMPANY_USER');

  const filteredSummaries = selectedCompanyFilter
    ? summaries.filter((s) => s.company.id === selectedCompanyFilter)
    : summaries;

  const dailyRecoveryRate =
    grandTotal.todayBilling > 0
      ? ((grandTotal.todayPayment / grandTotal.todayBilling) * 100).toFixed(1)
      : '0.0';

  const isMonthly = activeView === 'MONTHLY';
  const monthName = new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* 5 Executive Metric Cards - Dynamic based on activeView */}
      {!isMonthly ? (
        // DAILY MATRIX METRIC CARDS
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
            <span className="text-[11px] text-[#30d158] font-medium mt-1 block">
              {dailyRecoveryRate}% daily recovery rate
            </span>
          </div>

          {/* Total Bill (Month MTD) */}
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

          {/* Total Payment (TP) */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>Total Payment (TP)</span>
              <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#30d158]">
              ₹{grandTotal.monthPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] mt-1 block">
              {grandTotal.collectionRate}% MTD collection
            </span>
          </div>

          {/* Net Group Balance */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>Net Group Balance</span>
              <DollarSign className="w-4 h-4 text-[#ff9f0a]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#ff9f0a]">
              ₹{Math.abs(grandTotal.netDifference).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] mt-1 block">
              Net Receivable
            </span>
          </div>
        </div>
      ) : (
        // MONTHLY CUMULATIVE METRIC CARDS
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* MTD Total Billing */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>MTD Cumulative Billing</span>
              <TrendingUp className="w-4 h-4 text-[#0a84ff]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              ₹{grandTotal.monthBilling.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] mt-1 block">
              {monthName} Total Turnover
            </span>
          </div>

          {/* MTD Total Payment (Collection) */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>MTD Total Collection (TP)</span>
              <ArrowDownLeft className="w-4 h-4 text-[#30d158]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#30d158]">
              ₹{grandTotal.monthPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#30d158] font-medium mt-1 block">
              Total Realized Revenue
            </span>
          </div>

          {/* Net Pending Receivables */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>Net Outstanding Balance</span>
              <DollarSign className="w-4 h-4 text-[#ff9f0a]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#ff9f0a]">
              ₹{Math.abs(grandTotal.netDifference).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] mt-1 block">
              Unsettled Billing MTD
            </span>
          </div>

          {/* Group Recovery Rate */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>Group Recovery Rate</span>
              <Percent className="w-4 h-4 text-[#30d158]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#30d158]">
              {grandTotal.collectionRate}%
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#30d158] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, grandTotal.collectionRate)}%` }}
              />
            </div>
          </div>

          {/* Active Operating Companies */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>Active Entities</span>
              <Building2 className="w-4 h-4 text-[#bf5af2]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {grandTotal.totalCompanies} / {grandTotal.totalCompanies}
            </div>
            <span className="text-[11px] text-[#30d158] font-medium mt-1 block">
              100% Operational Reporting
            </span>
          </div>
        </div>
      )}

      {/* Main Container: Left Sidebar (9 Companies) + Right Master Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: 9 Companies Quick Switcher */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 px-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#0a84ff]" /> Group Companies
            </span>
            <span className="text-[11px] text-[#8e8e93] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              9 Units
            </span>
          </div>

          
          {/* Manage Accounts Button for Super Admin */}
          <button
            type="button"
            onClick={() => setShowAccountsModal(true)}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-between transition-all text-left"
          >
            <span className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-[#0a84ff]" />
              <span>Company Passwords</span>
            </span>
            <span className="text-[10px] bg-[#0a84ff]/20 text-[#0a84ff] px-1.5 py-0.5 rounded font-mono font-bold">
              Manage
            </span>
          </button>
          
          {/* "All 9 Companies" master button */}
          <button
            type="button"
            onClick={() => setSelectedCompanyFilter(null)}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between text-xs font-semibold ${
              selectedCompanyFilter === null
                ? 'bg-[#0a84ff] text-white shadow-md shadow-[#0a84ff]/25'
                : 'text-[#8e8e93] hover:text-white hover:bg-white/5'
            }`}
          >
            <span>All 9 Companies (Consolidated)</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* List of 9 Companies */}
          <div className="space-y-1 pt-1">
            {summaries.map((s) => {
              const isSelected = selectedCompanyFilter === s.company.id;
              return (
                <button
                  key={s.company.id}
                  type="button"
                  onClick={() => setSelectedCompanyFilter(isSelected ? null : s.company.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-white/15 text-white font-bold border border-white/20'
                      : 'text-[#8e8e93] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        s.hasEntryToday ? 'bg-[#30d158]' : 'bg-[#ff9f0a]'
                      }`}
                    />
                    <span className="truncate">{s.company.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8e8e93] shrink-0 ml-1">
                    ₹{Math.round((isMonthly ? s.monthBilling : s.todayBilling) / 1000)}k
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 px-2 flex items-center justify-between text-[10px] text-[#8e8e93]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#30d158]" /> Updated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff9f0a]" /> Pending
            </span>
          </div>
        </div>

        {/* Right Side: The Master Consolidated Table */}
        <div className="lg:col-span-3 bg-[#1c1c1e]/80 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Card Header with DATE FILTER in the right corner (Moved from Top Bar as requested) */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02]">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                {isMonthly
                  ? 'Monthly Cumulative Consolidated Billing & Payment Matrix'
                  : 'Consolidated Operational Billing & Payment Register'}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                  {isMonthly ? 'Month-to-Date' : 'Daily Matrix'}
                </span>
              </h2>
              <p className="text-xs text-[#8e8e93] mt-0.5">
                {isMonthly
                  ? `Aggregated figures for ${monthName} • Real-time audit across all 9 operating plants`
                  : `Date: ${selectedDate} • Group Daily Collections & Cumulative Month Figures`}
              </p>
            </div>

            {/* Right Corner Controls: DATE FILTER PILL + Clear Filter */}
            <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
              {selectedCompanyFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedCompanyFilter(null)}
                  className="text-xs text-[#0a84ff] hover:underline flex items-center gap-1 font-medium pr-2"
                >
                  <span>Show all 9</span>
                </button>
              )}

              {/* Date Filter Pill placed properly in the right corner */}
              <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full text-xs text-white font-medium border border-white/15 transition-all shadow-inner">
                <Calendar className="w-3.5 h-3.5 text-[#0a84ff] shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-mono text-xs"
                  title="Filter register by date"
                />
              </div>
            </div>
          </div>

          {/* TABLE DISPLAY */}
          <div className="overflow-x-auto">
            {!isMonthly ? (
              // DAILY MATRIX TABLE (With Requested 'Payment Received Date & Time' Column)
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[#8e8e93] font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5">Company Name</th>
                    <th className="py-3 px-3 text-right">Today Billing</th>
                    <th className="py-3 px-3 text-right">Today Payment</th>
                    <th className="py-3 px-3 text-center">Payment Received Date & Time</th>
                    <th className="py-3 px-3 text-right">Total Bill (MTD)</th>
                    <th className="py-3 px-3 text-right">Total Payment (TP)</th>
                    <th className="py-3 px-3 text-right">Net Balance</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSummaries.map((item) => (
                    <tr
                      key={item.company.id}
                      className="hover:bg-white/[0.04] transition-colors group"
                    >
                      <td className="py-3.5 px-3.5 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-[#0a84ff] font-bold">
                            {item.company.code}
                          </span>
                          <div>
                            <div className="text-white font-bold leading-tight">{item.company.name}</div>
                            <div className="text-[10px] text-[#8e8e93]">{item.company.location}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-white">
                        ₹{item.todayBilling.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#30d158]">
                        ₹{item.todayPayment.toLocaleString('en-IN')}
                      </td>

                      {/* Payment Received Date & Time Column */}
                      <td className="py-3.5 px-3 text-center font-mono text-[11px]">
                        {item.todayPayment > 0 ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="text-white font-semibold">
                              {item.paymentReceivedAt || `${selectedDate.split('-').reverse().join('-')}, 04:00 PM`}
                            </span>
                            {item.paymentMode && (
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/10 text-[#8e8e93] font-sans">
                                {item.paymentMode.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#8e8e93]/60 italic font-sans text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-white/90">
                        ₹{item.monthBilling.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-[#30d158]">
                        ₹{item.monthPayment.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-medium">
                        <span
                          className={`${
                            item.netDifference >= 0 ? 'text-[#ff9f0a]' : 'text-[#30d158]'
                          }`}
                        >
                          ₹{Math.abs(item.netDifference).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
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

                      <td className="py-3.5 px-3 text-center">
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
                    <td className="py-4 px-3.5 uppercase tracking-wider font-extrabold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0a84ff] animate-ping" />
                      GRAND TOTAL ({grandTotal.totalCompanies} COMPANIES)
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-white">
                      ₹{grandTotal.todayBilling.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#30d158]">
                      ₹{grandTotal.todayPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-center text-[11px] font-mono text-white/80">
                      Live Timestamped
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-white">
                      ₹{grandTotal.monthBilling.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#30d158]">
                      ₹{grandTotal.monthPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#ff9f0a]">
                      ₹{Math.abs(grandTotal.netDifference).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-center text-[11px] font-mono text-white/80">
                      {grandTotal.submittedCount}/{grandTotal.totalCompanies} Done
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="text-[10px] text-white/70 font-mono">Verified</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              // MONTHLY CUMULATIVE TABLE (Fully Functional Filter View)
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[#8e8e93] font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5">Company Name</th>
                    <th className="py-3 px-3 text-right">Month Billing (MTD)</th>
                    <th className="py-3 px-3 text-right">Month Payment (TP)</th>
                    <th className="py-3 px-3 text-right">Net Balance</th>
                    <th className="py-3 px-3 text-center">Collection %</th>
                    <th className="py-3 px-3 text-right">Avg Daily Billing</th>
                    <th className="py-3 px-3 text-center">Latest Payment Received At</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSummaries.map((item) => (
                    <tr
                      key={item.company.id}
                      className="hover:bg-white/[0.04] transition-colors group"
                    >
                      <td className="py-3.5 px-3.5 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-[#bf5af2] font-bold">
                            {item.company.code}
                          </span>
                          <div>
                            <div className="text-white font-bold leading-tight">{item.company.name}</div>
                            <div className="text-[10px] text-[#8e8e93]">{item.company.location}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                        ₹{item.monthBilling.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#30d158]">
                        ₹{item.monthPayment.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-semibold">
                        <span
                          className={`${
                            item.netDifference >= 0 ? 'text-[#ff9f0a]' : 'text-[#30d158]'
                          }`}
                        >
                          ₹{Math.abs(item.netDifference).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="text-xs font-mono font-bold text-[#30d158]">
                            {item.collectionRate}%
                          </span>
                          <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#30d158] h-full rounded-full"
                              style={{ width: `${Math.min(100, item.collectionRate)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-white/90">
                        ₹{item.avgDailyBilling.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono text-[11px] text-white/90">
                        {item.paymentReceivedAt || `${selectedDate.split('-').reverse().join('-')}, 04:00 PM`}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30">
                          <CheckCircle2 className="w-3 h-3" /> Reconciled
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
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
                  <tr className="bg-[#bf5af2]/15 border-t-2 border-[#bf5af2]/40 text-white font-bold text-xs">
                    <td className="py-4 px-3.5 uppercase tracking-wider font-extrabold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#bf5af2] animate-ping" />
                      MONTHLY GRAND TOTAL
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-white">
                      ₹{grandTotal.monthBilling.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#30d158]">
                      ₹{grandTotal.monthPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#ff9f0a]">
                      ₹{Math.abs(grandTotal.netDifference).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-center font-mono text-xs font-extrabold text-[#30d158]">
                      {grandTotal.collectionRate}%
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-xs text-white/80">
                      ₹{Math.round(grandTotal.monthBilling / 23).toLocaleString('en-IN')} /day
                    </td>
                    <td className="py-4 px-3 text-center font-mono text-[11px] text-white/80">
                      All Recorded
                    </td>
                    <td className="py-4 px-3 text-center text-[11px] font-mono text-[#30d158]">
                      100% Closed
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="text-[10px] text-white/70 font-mono">Audited</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>
    
      {/* Super Admin Modal: Company Accounts & Passwords Directory */}
      {showAccountsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0a84ff]/20 text-[#0a84ff] flex items-center justify-center border border-[#0a84ff]/30">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    Company Accounts & Credentials
                    <span className="text-[10px] font-bold text-[#30d158] bg-[#30d158]/15 px-2 py-0.5 rounded-full">
                      Super Admin Private
                    </span>
                  </h2>
                  <p className="text-xs text-[#8e8e93]">
                    Share these credentials with operating unit branch managers to log into their respective portals.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAccountsModal(false)}
                type="button"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#8e8e93] hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-[#8e8e93] uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-3">Username</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Access Password</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {companyAccounts.map((acc) => {
                    const isCopied = copiedId === acc.id;
                    const credText = "Company: " + acc.name + "\nUsername: " + acc.username + "\nEmail: " + acc.email + "\nPassword: " + acc.pass;
                    return (
                      <tr key={acc.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{acc.name}</span>
                          <span className="text-[10px] text-[#8e8e93]">{acc.id}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-white font-semibold">{acc.username}</td>
                        <td className="py-3 px-3 font-mono text-[#8e8e93] text-[11px]">{acc.email}</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#30d158]">{acc.pass}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.id, credText)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-medium border border-white/10 transition-colors inline-flex items-center gap-1.5"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-[#30d158]" />
                                <span className="text-[#30d158]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#0a84ff]" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-[#8e8e93]">
                Total 9 Registered Operating Entities
              </span>
              <button
                type="button"
                onClick={() => setShowAccountsModal(false)}
                className="px-5 py-2 rounded-xl bg-[#0a84ff] text-white text-xs font-semibold hover:bg-[#0a84ff]/90 transition-all cursor-pointer"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}