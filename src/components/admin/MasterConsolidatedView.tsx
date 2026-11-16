'use client';

import React, { useState, useMemo } from 'react';
import { CompanySummary, GroupGrandTotal, GroupCompany } from '../../types';
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
  Key,
  Copy,
  Check,
  X,
  Boxes,
  Coins,
  ShieldCheck,
  RotateCcw,
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

export type DivisionFilter = 'ALL' | 'PVD' | 'LASER';

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
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<DivisionFilter>('ALL');
  const [showDivisionBoxes, setShowDivisionBoxes] = useState<boolean>(true);

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const companyAccounts = SYSTEM_ACCOUNTS.filter((acc) => acc.role === 'COMPANY_USER');

  // Division categorizer: PVD vs Laser (Laser includes cutting and works)
  const isPvdCompany = (comp: GroupCompany) =>
    comp.category === 'PVD' || comp.name.toUpperCase().includes('PVD');

  const pvdSummaries = useMemo(
    () => summaries.filter((s) => isPvdCompany(s.company)),
    [summaries]
  );
  const laserSummaries = useMemo(
    () => summaries.filter((s) => !isPvdCompany(s.company)),
    [summaries]
  );

  // Aggregated figures for PVD Division
  const pvdTotals = useMemo(() => {
    const todayBilling = pvdSummaries.reduce((acc, s) => acc + s.todayBilling, 0);
    const todayGst = pvdSummaries.reduce((acc, s) => acc + (s.todayGstPayment || 0), 0);
    const todayOther = pvdSummaries.reduce((acc, s) => acc + (s.todayOtherPayment || 0), 0);
    const todayPayment = pvdSummaries.reduce((acc, s) => acc + s.todayPayment, 0);
    const monthBilling = pvdSummaries.reduce((acc, s) => acc + s.monthBilling, 0);
    const monthGst = pvdSummaries.reduce((acc, s) => acc + (s.monthGstPayment || 0), 0);
    const monthOther = pvdSummaries.reduce((acc, s) => acc + (s.monthOtherPayment || 0), 0);
    const monthPayment = pvdSummaries.reduce((acc, s) => acc + s.monthPayment, 0);
    const netDifference = pvdSummaries.reduce((acc, s) => acc + s.netDifference, 0);
    const submittedCount = pvdSummaries.filter((s) => s.hasEntryToday).length;
    const recoveryRate = todayBilling > 0 ? ((todayPayment / todayBilling) * 100).toFixed(1) : '0.0';
    const monthRecoveryRate =
      monthBilling > 0 ? ((monthPayment / monthBilling) * 100).toFixed(1) : '0.0';

    return {
      todayBilling,
      todayGst,
      todayOther,
      todayPayment,
      monthBilling,
      monthGst,
      monthOther,
      monthPayment,
      netDifference,
      submittedCount,
      totalCount: pvdSummaries.length,
      recoveryRate,
      monthRecoveryRate,
    };
  }, [pvdSummaries]);

  // Aggregated figures for Laser Division
  const laserTotals = useMemo(() => {
    const todayBilling = laserSummaries.reduce((acc, s) => acc + s.todayBilling, 0);
    const todayGst = laserSummaries.reduce((acc, s) => acc + (s.todayGstPayment || 0), 0);
    const todayOther = laserSummaries.reduce((acc, s) => acc + (s.todayOtherPayment || 0), 0);
    const todayPayment = laserSummaries.reduce((acc, s) => acc + s.todayPayment, 0);
    const monthBilling = laserSummaries.reduce((acc, s) => acc + s.monthBilling, 0);
    const monthGst = laserSummaries.reduce((acc, s) => acc + (s.monthGstPayment || 0), 0);
    const monthOther = laserSummaries.reduce((acc, s) => acc + (s.monthOtherPayment || 0), 0);
    const monthPayment = laserSummaries.reduce((acc, s) => acc + s.monthPayment, 0);
    const netDifference = laserSummaries.reduce((acc, s) => acc + s.netDifference, 0);
    const submittedCount = laserSummaries.filter((s) => s.hasEntryToday).length;
    const recoveryRate =
      todayBilling > 0 ? ((todayPayment / todayBilling) * 100).toFixed(1) : '0.0';
    const monthRecoveryRate =
      monthBilling > 0 ? ((monthPayment / monthBilling) * 100).toFixed(1) : '0.0';

    return {
      todayBilling,
      todayGst,
      todayOther,
      todayPayment,
      monthBilling,
      monthGst,
      monthOther,
      monthPayment,
      netDifference,
      submittedCount,
      totalCount: laserSummaries.length,
      recoveryRate,
      monthRecoveryRate,
    };
  }, [laserSummaries]);

  // Apply Division and Single Company filters
  const filteredSummaries = useMemo(() => {
    let list = summaries;
    if (selectedDivision === 'PVD') {
      list = list.filter((s) => isPvdCompany(s.company));
    } else if (selectedDivision === 'LASER') {
      list = list.filter((s) => !isPvdCompany(s.company));
    }

    if (selectedCompanyFilter) {
      list = list.filter((s) => s.company.id === selectedCompanyFilter);
    }
    return list;
  }, [summaries, selectedDivision, selectedCompanyFilter]);

  const isIndividualView = Boolean(selectedCompanyFilter && filteredSummaries.length === 1);
  const singleSummary = isIndividualView ? filteredSummaries[0] : null;

  const isMonthly = activeView === 'MONTHLY';
  const monthName = new Date(selectedDate).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate dynamic footer totals
  const displayFooterTotal = useMemo(() => {
    if (isIndividualView && singleSummary) {
      return {
        label: 'TOTAL - ' + singleSummary.company.name.toUpperCase(),
        todayBilling: singleSummary.todayBilling,
        todayGstPayment: singleSummary.todayGstPayment || 0,
        todayOtherPayment: singleSummary.todayOtherPayment || 0,
        todayPayment: singleSummary.todayPayment,
        monthBilling: singleSummary.monthBilling,
        monthGstPayment: singleSummary.monthGstPayment || 0,
        monthOtherPayment: singleSummary.monthOtherPayment || 0,
        monthPayment: singleSummary.monthPayment,
        netDifference: singleSummary.netDifference,
        statusText: singleSummary.hasEntryToday ? 'Submitted' : 'Pending',
        collectionRate: singleSummary.collectionRate,
        avgDailyBilling: singleSummary.avgDailyBilling,
      };
    }

    if (selectedDivision === 'PVD') {
      return {
        label: `PVD DIVISION TOTAL (${pvdTotals.totalCount} PLANTS)`,
        todayBilling: pvdTotals.todayBilling,
        todayGstPayment: pvdTotals.todayGst,
        todayOtherPayment: pvdTotals.todayOther,
        todayPayment: pvdTotals.todayPayment,
        monthBilling: pvdTotals.monthBilling,
        monthGstPayment: pvdTotals.monthGst,
        monthOtherPayment: pvdTotals.monthOther,
        monthPayment: pvdTotals.monthPayment,
        netDifference: pvdTotals.netDifference,
        statusText: `${pvdTotals.submittedCount}/${pvdTotals.totalCount} Done`,
        collectionRate: Number(pvdTotals.recoveryRate),
        avgDailyBilling: Math.round(pvdTotals.monthBilling / 23),
      };
    }

    if (selectedDivision === 'LASER') {
      return {
        label: `LASER DIVISION TOTAL (${laserTotals.totalCount} PLANTS)`,
        todayBilling: laserTotals.todayBilling,
        todayGstPayment: laserTotals.todayGst,
        todayOtherPayment: laserTotals.todayOther,
        todayPayment: laserTotals.todayPayment,
        monthBilling: laserTotals.monthBilling,
        monthGstPayment: laserTotals.monthGst,
        monthOtherPayment: laserTotals.monthOther,
        monthPayment: laserTotals.monthPayment,
        netDifference: laserTotals.netDifference,
        statusText: `${laserTotals.submittedCount}/${laserTotals.totalCount} Done`,
        collectionRate: Number(laserTotals.recoveryRate),
        avgDailyBilling: Math.round(laserTotals.monthBilling / 23),
      };
    }

    return {
      label: 'GRAND TOTAL (ALL COMPANIES)',
      todayBilling: grandTotal.todayBilling,
      todayGstPayment: grandTotal.todayGstPayment || 0,
      todayOtherPayment: grandTotal.todayOtherPayment || 0,
      todayPayment: grandTotal.todayPayment,
      monthBilling: grandTotal.monthBilling,
      monthGstPayment: grandTotal.monthGstPayment || 0,
      monthOtherPayment: grandTotal.monthOtherPayment || 0,
      monthPayment: grandTotal.monthPayment,
      netDifference: grandTotal.netDifference,
      statusText: `${grandTotal.submittedCount}/${grandTotal.totalCompanies} Done`,
      collectionRate: grandTotal.collectionRate,
      avgDailyBilling: Math.round(grandTotal.monthBilling / 23),
    };
  }, [isIndividualView, singleSummary, selectedDivision, pvdTotals, laserTotals, grandTotal]);

  const handleSelectDivision = (div: DivisionFilter) => {
    setSelectedDivision(div);
    setSelectedCompanyFilter(null);
  };

  const handleResetFilters = () => {
    setSelectedDivision('ALL');
    setSelectedCompanyFilter(null);
  };

  return (
    <div className="space-y-6">
      {/* 5 Executive Metric Cards - Clickable Boxed Views */}
      {!isMonthly ? (
        // DAILY MATRIX METRIC CARDS
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Box 1: Today Total Billing */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg transition-all hover:border-white/20">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>Today Total Billing</span>
              <TrendingUp className="w-4 h-4 text-[#0a84ff]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              ₹{displayFooterTotal.todayBilling.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] mt-1 block truncate">
              {isIndividualView
                ? `Unit: ${singleSummary?.company.name}`
                : selectedDivision !== 'ALL'
                ? `${selectedDivision} Division (${displayFooterTotal.statusText})`
                : `Across ${grandTotal.submittedCount} of ${grandTotal.totalCompanies} companies`}
            </span>
          </div>

          {/* Box 2: Today Total Collections / Payments (Interactive Box) */}
          <div
            onClick={() => setShowDivisionBoxes(!showDivisionBoxes)}
            className={`cursor-pointer p-4 rounded-2xl border backdrop-blur-2xl transition-all shadow-lg select-none ${
              showDivisionBoxes
                ? 'bg-[#30d158]/10 border-[#30d158]/40 ring-1 ring-[#30d158]/30'
                : 'bg-[#1c1c1e]/80 border-white/10 hover:border-[#30d158]/40'
            }`}
            title="Click to toggle PVD vs Laser collections breakdown"
          >
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Coins className="w-3.5 h-3.5 text-[#30d158]" />
                <span>Today Collections</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#30d158]/20 text-[#30d158]">
                {showDivisionBoxes ? 'Breakdown Active' : 'Click to Split'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#30d158]">
              ₹{displayFooterTotal.todayPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] font-medium mt-1 block truncate">
              PVD: ₹{pvdTotals.todayPayment.toLocaleString('en-IN')} • Laser: ₹
              {laserTotals.todayPayment.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Box 3: GST Collections Box */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg transition-all hover:border-white/20">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>GST Collections</span>
              <ShieldCheck className="w-4 h-4 text-[#0a84ff]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#0a84ff]">
              ₹{displayFooterTotal.todayGstPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] mt-1 block truncate">
              PVD: ₹{pvdTotals.todayGst.toLocaleString('en-IN')} • Laser: ₹
              {laserTotals.todayGst.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Box 4: Others Collections Box */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg transition-all hover:border-white/20">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>Others Collections</span>
              <Boxes className="w-4 h-4 text-[#bf5af2]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#bf5af2]">
              ₹{displayFooterTotal.todayOtherPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] mt-1 block truncate">
              PVD: ₹{pvdTotals.todayOther.toLocaleString('en-IN')} • Laser: ₹
              {laserTotals.todayOther.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Box 5: Net Balance Box */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg transition-all hover:border-white/20">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>Net Group Balance</span>
              <DollarSign className="w-4 h-4 text-[#ff9f0a]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#ff9f0a]">
              ₹{Math.abs(displayFooterTotal.netDifference).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] mt-1 block">
              Net Outstanding Balance
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
              ₹{displayFooterTotal.monthBilling.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] mt-1 block">
              {monthName} Total Turnover
            </span>
          </div>

          {/* MTD Total Payment (Interactive Box) */}
          <div
            onClick={() => setShowDivisionBoxes(!showDivisionBoxes)}
            className={`cursor-pointer p-4 rounded-2xl border backdrop-blur-2xl transition-all shadow-lg select-none ${
              showDivisionBoxes
                ? 'bg-[#30d158]/10 border-[#30d158]/40 ring-1 ring-[#30d158]/30'
                : 'bg-[#1c1c1e]/80 border-white/10 hover:border-[#30d158]/40'
            }`}
            title="Click to toggle PVD vs Laser MTD split"
          >
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Coins className="w-3.5 h-3.5 text-[#30d158]" />
                <span>MTD Collections (TP)</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#30d158]/20 text-[#30d158]">
                {showDivisionBoxes ? 'Breakdown Active' : 'Click to Split'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-[#30d158]">
              ₹{displayFooterTotal.monthPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] font-medium mt-1 block truncate">
              PVD: ₹{pvdTotals.monthPayment.toLocaleString('en-IN')} • Laser: ₹
              {laserTotals.monthPayment.toLocaleString('en-IN')}
            </span>
          </div>

          {/* MTD GST Collections */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>MTD GST Collections</span>
              <ShieldCheck className="w-4 h-4 text-[#0a84ff]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#0a84ff]">
              ₹{displayFooterTotal.monthGstPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] mt-1 block truncate">
              PVD: ₹{pvdTotals.monthGst.toLocaleString('en-IN')} • Laser: ₹
              {laserTotals.monthGst.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Group Recovery Rate */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>Group Recovery Rate</span>
              <Percent className="w-4 h-4 text-[#30d158]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#30d158]">
              {displayFooterTotal.collectionRate}%
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#30d158] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, displayFooterTotal.collectionRate)}%` }}
              />
            </div>
          </div>

          {/* Net Pending Receivables */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-[#8e8e93] text-xs mb-1.5">
              <span>Net Outstanding Balance</span>
              <DollarSign className="w-4 h-4 text-[#ff9f0a]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#ff9f0a]">
              ₹{Math.abs(displayFooterTotal.netDifference).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#8e8e93] mt-1 block">
              Unsettled Billing MTD
            </span>
          </div>
        </div>
      )}

      {/* DEDICATED DIVISION COLLECTIONS BOXED VIEW (PVD vs LASER) */}
      {showDivisionBoxes && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-[#30d158]" /> Division Collections Breakdown
              </span>
              <span className="text-[10px] text-[#8e8e93] font-medium bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                Click a division box to view related data
              </span>
            </div>
            {selectedDivision !== 'ALL' && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#0a84ff] hover:underline font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show All Companies</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box A: PVD Coating Division Collections */}
            <div
              onClick={() => handleSelectDivision(selectedDivision === 'PVD' ? 'ALL' : 'PVD')}
              className={`p-5 rounded-2xl backdrop-blur-2xl border transition-all cursor-pointer relative overflow-hidden group select-none shadow-xl ${
                selectedDivision === 'PVD'
                  ? 'bg-[#bf5af2]/15 border-[#bf5af2] ring-2 ring-[#bf5af2]/50'
                  : 'bg-[#1c1c1e]/85 border-white/10 hover:border-[#bf5af2]/60 hover:bg-[#bf5af2]/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#bf5af2]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                      PVD Coating Division Collections
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#bf5af2]/20 text-[#bf5af2] font-bold border border-[#bf5af2]/30">
                      {pvdTotals.totalCount} Plants
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2 tracking-tight">
                    ₹
                    {(isMonthly ? pvdTotals.monthPayment : pvdTotals.todayPayment).toLocaleString(
                      'en-IN'
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-[#8e8e93] block">
                    Recovery Rate
                  </span>
                  <span className="text-sm font-mono font-extrabold text-[#30d158]">
                    {isMonthly ? pvdTotals.monthRecoveryRate : pvdTotals.recoveryRate}%
                  </span>
                </div>
              </div>

              {/* Sub-breakdown: GST vs Others */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-white/10">
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <span className="text-[10px] text-[#8e8e93] block uppercase tracking-wide">
                    GST Collection
                  </span>
                  <span className="text-xs font-bold font-mono text-[#0a84ff] mt-0.5 block">
                    ₹
                    {(isMonthly ? pvdTotals.monthGst : pvdTotals.todayGst).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <span className="text-[10px] text-[#8e8e93] block uppercase tracking-wide">
                    Others Collection
                  </span>
                  <span className="text-xs font-bold font-mono text-[#bf5af2] mt-0.5 block">
                    ₹
                    {(isMonthly ? pvdTotals.monthOther : pvdTotals.todayOther).toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>
              </div>

              {/* Action Banner */}
              <div className="mt-3.5 flex items-center justify-between text-[11px] font-semibold text-[#bf5af2]">
                <span>
                  {selectedDivision === 'PVD'
                    ? 'Related PVD data currently active'
                    : 'Click to view related PVD plant data'}
                </span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    selectedDivision === 'PVD' ? 'rotate-90' : 'group-hover:translate-x-1'
                  }`}
                />
              </div>
            </div>

            {/* Box B: Laser Division Collections */}
            <div
              onClick={() => handleSelectDivision(selectedDivision === 'LASER' ? 'ALL' : 'LASER')}
              className={`p-5 rounded-2xl backdrop-blur-2xl border transition-all cursor-pointer relative overflow-hidden group select-none shadow-xl ${
                selectedDivision === 'LASER'
                  ? 'bg-[#0a84ff]/15 border-[#0a84ff] ring-2 ring-[#0a84ff]/50'
                  : 'bg-[#1c1c1e]/85 border-white/10 hover:border-[#0a84ff]/60 hover:bg-[#0a84ff]/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0a84ff]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Laser Division Collections
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0a84ff]/20 text-[#0a84ff] font-bold border border-[#0a84ff]/30">
                      {laserTotals.totalCount} Plants
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2 tracking-tight">
                    ₹
                    {(isMonthly ? laserTotals.monthPayment : laserTotals.todayPayment).toLocaleString(
                      'en-IN'
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-[#8e8e93] block">
                    Recovery Rate
                  </span>
                  <span className="text-sm font-mono font-extrabold text-[#30d158]">
                    {isMonthly ? laserTotals.monthRecoveryRate : laserTotals.recoveryRate}%
                  </span>
                </div>
              </div>

              {/* Sub-breakdown: GST vs Others */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-white/10">
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <span className="text-[10px] text-[#8e8e93] block uppercase tracking-wide">
                    GST Collection
                  </span>
                  <span className="text-xs font-bold font-mono text-[#0a84ff] mt-0.5 block">
                    ₹
                    {(isMonthly ? laserTotals.monthGst : laserTotals.todayGst).toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <span className="text-[10px] text-[#8e8e93] block uppercase tracking-wide">
                    Others Collection
                  </span>
                  <span className="text-xs font-bold font-mono text-[#bf5af2] mt-0.5 block">
                    ₹
                    {(isMonthly ? laserTotals.monthOther : laserTotals.todayOther).toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>
              </div>

              {/* Action Banner */}
              <div className="mt-3.5 flex items-center justify-between text-[11px] font-semibold text-[#0a84ff]">
                <span>
                  {selectedDivision === 'LASER'
                    ? 'Related Laser data currently active'
                    : 'Click to view related Laser plant data'}
                </span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    selectedDivision === 'LASER' ? 'rotate-90' : 'group-hover:translate-x-1'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container: Left Sidebar + Right Master Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Companies Quick Switcher & Division Filter Pills */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-4 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 px-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#0a84ff]" /> Group Companies
            </span>
            <span className="text-[11px] text-[#8e8e93] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              Group Units
            </span>
          </div>

          {/* Division Filter Segmented Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleSelectDivision('ALL')}
              className={`py-1 rounded-lg transition-all ${
                selectedDivision === 'ALL'
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleSelectDivision('LASER')}
              className={`py-1 rounded-lg transition-all ${
                selectedDivision === 'LASER'
                  ? 'bg-[#0a84ff] text-white font-bold shadow-md shadow-[#0a84ff]/30'
                  : 'text-[#8e8e93] hover:text-[#0a84ff]'
              }`}
            >
              Laser (6)
            </button>
            <button
              type="button"
              onClick={() => handleSelectDivision('PVD')}
              className={`py-1 rounded-lg transition-all ${
                selectedDivision === 'PVD'
                  ? 'bg-[#bf5af2] text-white font-bold shadow-md shadow-[#bf5af2]/30'
                  : 'text-[#8e8e93] hover:text-[#bf5af2]'
              }`}
            >
              PVD (3)
            </button>
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

          {/* Master consolidated button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between text-xs font-semibold ${
              selectedCompanyFilter === null && selectedDivision === 'ALL'
                ? 'bg-[#0a84ff] text-white shadow-md shadow-[#0a84ff]/25'
                : 'text-[#8e8e93] hover:text-white hover:bg-white/5'
            }`}
          >
            <span>All Companies (Consolidated)</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* List of Companies (Dynamic based on selectedDivision) */}
          <div className="space-y-1 pt-1 max-h-[380px] overflow-y-auto pr-1">
            {(selectedDivision === 'ALL'
              ? summaries
              : selectedDivision === 'PVD'
              ? pvdSummaries
              : laserSummaries
            ).map((s) => {
              const isSelected = selectedCompanyFilter === s.company.id;
              const isPvd = isPvdCompany(s.company);
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
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <span
                      className={`text-[9px] px-1 rounded font-mono ${
                        isPvd
                          ? 'bg-[#bf5af2]/15 text-[#bf5af2]'
                          : 'bg-[#0a84ff]/15 text-[#0a84ff]'
                      }`}
                    >
                      {isPvd ? 'PVD' : 'LASER'}
                    </span>
                    <span className="text-[10px] font-mono text-[#8e8e93]">
                      ₹{Math.round((isMonthly ? s.monthBilling : s.todayBilling) / 1000)}k
                    </span>
                  </div>
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

        {/* Right Side: The Master Consolidated Table & Related Data View */}
        <div className="lg:col-span-3 bg-[#1c1c1e]/80 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Card Header with DATE FILTER in the right corner */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {selectedDivision === 'PVD'
                    ? 'PVD Coating Division Collections & Operational Ledger'
                    : selectedDivision === 'LASER'
                    ? 'Laser Division Collections & Operational Ledger'
                    : isMonthly
                    ? 'Monthly Cumulative Consolidated Billing & Payment Matrix'
                    : 'Consolidated Operational Billing & Payment Register'}
                </h2>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    selectedDivision === 'PVD'
                      ? 'bg-[#bf5af2]/20 text-[#bf5af2] border-[#bf5af2]/30'
                      : selectedDivision === 'LASER'
                      ? 'bg-[#0a84ff]/20 text-[#0a84ff] border-[#0a84ff]/30'
                      : 'bg-white/10 text-white/80 border-white/10'
                  }`}
                >
                  {selectedDivision === 'PVD'
                    ? 'PVD Related Data'
                    : selectedDivision === 'LASER'
                    ? 'Laser Related Data'
                    : isMonthly
                    ? 'Month-to-Date'
                    : 'Daily Matrix'}
                </span>
              </div>
              <p className="text-xs text-[#8e8e93] mt-0.5">
                {selectedDivision !== 'ALL'
                  ? `Showing ${filteredSummaries.length} plants in ${selectedDivision} Division • Date: ${selectedDate}`
                  : isMonthly
                  ? `Aggregated figures for ${monthName} • Real-time audit across operating plants`
                  : `Date: ${selectedDate} • Daily Collections & Cumulative Month Figures`}
              </p>
            </div>

            {/* Right Corner Controls: DATE FILTER PILL + Reset Filter */}
            <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
              {(selectedCompanyFilter || selectedDivision !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#0a84ff] hover:underline flex items-center gap-1 font-medium pr-2"
                >
                  <span>Show All Companies</span>
                </button>
              )}

              {/* Date Filter Pill */}
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

          {/* Active Filter Notification Pill */}
          {selectedDivision !== 'ALL' && (
            <div
              className={`px-4 py-2 border-b flex items-center justify-between text-xs font-medium ${
                selectedDivision === 'PVD'
                  ? 'bg-[#bf5af2]/10 border-[#bf5af2]/20 text-[#bf5af2]'
                  : 'bg-[#0a84ff]/10 border-[#0a84ff]/20 text-[#0a84ff]'
              }`}
            >
              <span>
                Filtering related data for <strong>{selectedDivision} Division</strong> (
                {filteredSummaries.length} Plants) • Total Collection: ₹
                {(isMonthly
                  ? selectedDivision === 'PVD'
                    ? pvdTotals.monthPayment
                    : laserTotals.monthPayment
                  : selectedDivision === 'PVD'
                  ? pvdTotals.todayPayment
                  : laserTotals.todayPayment
                ).toLocaleString('en-IN')}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDivision('ALL')}
                className="underline hover:text-white text-[11px]"
              >
                Clear Division Filter
              </button>
            </div>
          )}

          {/* TABLE DISPLAY */}
          <div className="overflow-x-auto">
            {!isMonthly ? (
              // DAILY MATRIX TABLE (With GST Collection & Others Columns)
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[#8e8e93] font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5">Company Name</th>
                    <th className="py-3 px-3 text-right">Today Billing</th>
                    <th className="py-3 px-3 text-right text-[#0a84ff]">GST Collection</th>
                    <th className="py-3 px-3 text-right text-[#bf5af2]">Others</th>
                    <th className="py-3 px-3 text-right text-[#30d158]">Today Payment</th>
                    <th className="py-3 px-3 text-center">Payment Received Date & Time</th>
                    <th className="py-3 px-3 text-right">Total Bill (MTD)</th>
                    <th className="py-3 px-3 text-right">Total Payment (TP)</th>
                    <th className="py-3 px-3 text-right">Net Balance</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSummaries.map((item) => {
                    const isPvd = isPvdCompany(item.company);
                    return (
                      <tr
                        key={item.company.id}
                        className="hover:bg-white/[0.04] transition-colors group"
                      >
                        <td className="py-3.5 px-3.5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold ${
                                isPvd ? 'text-[#bf5af2]' : 'text-[#0a84ff]'
                              }`}
                            >
                              {item.company.code}
                            </span>
                            <div>
                              <div className="text-white font-bold leading-tight flex items-center gap-1.5">
                                <span>{item.company.name}</span>
                                <span
                                  className={`text-[9px] px-1 rounded font-mono ${
                                    isPvd
                                      ? 'bg-[#bf5af2]/15 text-[#bf5af2]'
                                      : 'bg-[#0a84ff]/15 text-[#0a84ff]'
                                  }`}
                                >
                                  {isPvd ? 'PVD' : 'LASER'}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#8e8e93]">
                                {item.company.location}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-semibold text-white">
                          ₹{item.todayBilling.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-semibold text-[#0a84ff]">
                          ₹{(item.todayGstPayment || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-semibold text-[#bf5af2]">
                          ₹{(item.todayOtherPayment || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-[#30d158]">
                          ₹{item.todayPayment.toLocaleString('en-IN')}
                        </td>

                        {/* Payment Received Date & Time Column */}
                        <td className="py-3.5 px-3 text-center font-mono text-[11px]">
                          {item.todayPayment > 0 ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-white font-semibold">
                                {item.paymentReceivedAt ||
                                  `${selectedDate.split('-').reverse().join('-')}, 04:00 PM`}
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
                            className={
                              item.netDifference >= 0 ? 'text-[#ff9f0a]' : 'text-[#30d158]'
                            }
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
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr className="bg-[#0a84ff]/15 border-t-2 border-[#0a84ff]/40 text-white font-bold text-xs">
                    <td className="py-4 px-3.5 uppercase tracking-wider font-extrabold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0a84ff] animate-ping" />
                      {displayFooterTotal.label}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-white">
                      ₹{displayFooterTotal.todayBilling.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#0a84ff]">
                      ₹{displayFooterTotal.todayGstPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#bf5af2]">
                      ₹{displayFooterTotal.todayOtherPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#30d158]">
                      ₹{displayFooterTotal.todayPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-center text-[11px] font-mono text-white/80">
                      Live Timestamped
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-white">
                      ₹{displayFooterTotal.monthBilling.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#30d158]">
                      ₹{displayFooterTotal.monthPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#ff9f0a]">
                      ₹{Math.abs(displayFooterTotal.netDifference).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-center text-[11px] font-mono text-white/80">
                      {displayFooterTotal.statusText}
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="text-[10px] text-white/70 font-mono">Verified</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              // MONTHLY CUMULATIVE TABLE (With GST & Others Columns)
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[#8e8e93] font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5">Company Name</th>
                    <th className="py-3 px-3 text-right">Month Billing (MTD)</th>
                    <th className="py-3 px-3 text-right text-[#0a84ff]">GST Collection (MTD)</th>
                    <th className="py-3 px-3 text-right text-[#bf5af2]">Others (MTD)</th>
                    <th className="py-3 px-3 text-right text-[#30d158]">Month Payment (TP)</th>
                    <th className="py-3 px-3 text-right">Net Balance</th>
                    <th className="py-3 px-3 text-center">Collection %</th>
                    <th className="py-3 px-3 text-right">Avg Daily Billing</th>
                    <th className="py-3 px-3 text-center">Latest Payment Received At</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSummaries.map((item) => {
                    const isPvd = isPvdCompany(item.company);
                    return (
                      <tr
                        key={item.company.id}
                        className="hover:bg-white/[0.04] transition-colors group"
                      >
                        <td className="py-3.5 px-3.5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold ${
                                isPvd ? 'text-[#bf5af2]' : 'text-[#0a84ff]'
                              }`}
                            >
                              {item.company.code}
                            </span>
                            <div>
                              <div className="text-white font-bold leading-tight flex items-center gap-1.5">
                                <span>{item.company.name}</span>
                                <span
                                  className={`text-[9px] px-1 rounded font-mono ${
                                    isPvd
                                      ? 'bg-[#bf5af2]/15 text-[#bf5af2]'
                                      : 'bg-[#0a84ff]/15 text-[#0a84ff]'
                                  }`}
                                >
                                  {isPvd ? 'PVD' : 'LASER'}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#8e8e93]">
                                {item.company.location}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                          ₹{item.monthBilling.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-semibold text-[#0a84ff]">
                          ₹{(item.monthGstPayment || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-semibold text-[#bf5af2]">
                          ₹{(item.monthOtherPayment || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-[#30d158]">
                          ₹{item.monthPayment.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-semibold">
                          <span
                            className={
                              item.netDifference >= 0 ? 'text-[#ff9f0a]' : 'text-[#30d158]'
                            }
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
                          {item.paymentReceivedAt ||
                            `${selectedDate.split('-').reverse().join('-')}, 04:00 PM`}
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
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr className="bg-[#bf5af2]/15 border-t-2 border-[#bf5af2]/40 text-white font-bold text-xs">
                    <td className="py-4 px-3.5 uppercase tracking-wider font-extrabold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#bf5af2] animate-ping" />
                      {displayFooterTotal.label}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-white">
                      ₹{displayFooterTotal.monthBilling.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#0a84ff]">
                      ₹{displayFooterTotal.monthGstPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#bf5af2]">
                      ₹{displayFooterTotal.monthOtherPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#30d158]">
                      ₹{displayFooterTotal.monthPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-extrabold text-[#ff9f0a]">
                      ₹{Math.abs(displayFooterTotal.netDifference).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-center font-mono text-xs font-extrabold text-[#30d158]">
                      {displayFooterTotal.collectionRate}%
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-xs text-white/80">
                      ₹{displayFooterTotal.avgDailyBilling.toLocaleString('en-IN')} /day
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
                    Share these credentials with operating unit branch managers to log into their
                    respective portals.
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
                    const credText =
                      'Company: ' +
                      acc.name +
                      '\nUsername: ' +
                      acc.username +
                      '\nEmail: ' +
                      acc.email +
                      '\nPassword: ' +
                      acc.pass;
                    return (
                      <tr key={acc.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{acc.name}</span>
                          <span className="text-[10px] text-[#8e8e93]">{acc.id}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-white font-semibold">
                          {acc.username}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#8e8e93] text-[11px]">
                          {acc.email}
                        </td>
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
                Registered Operating Entities ({companyAccounts.length})
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
