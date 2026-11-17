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
      {/* 5 Executive Metric Cards - Powertech CRM Box Design */}
      {!isMonthly ? (
        // DAILY MATRIX METRIC CARDS
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Box 1: Today Total Billing */}
          <div className="bg-[#111c38] p-5 rounded-2xl border border-slate-800/80 shadow-xl transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Today Total Billing
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-white tracking-tight">
              ₹{displayFooterTotal.todayBilling.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-2 block truncate">
              {isIndividualView
                ? `Unit: ${singleSummary?.company.name}`
                : selectedDivision !== 'ALL'
                ? `${selectedDivision} Division (${displayFooterTotal.statusText})`
                : `Across ${grandTotal.submittedCount} of ${grandTotal.totalCompanies} companies`}
            </span>
          </div>

          {/* Box 2: Today Total Collections (Interactive Box) */}
          <div
            onClick={() => setShowDivisionBoxes(!showDivisionBoxes)}
            className={`cursor-pointer p-5 rounded-2xl border shadow-xl transition-all select-none ${
              showDivisionBoxes
                ? 'bg-[#111c38] border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-emerald-500/5'
                : 'bg-[#111c38] border-slate-800/80 hover:border-emerald-500/50'
            }`}
            title="Click to toggle PVD vs Laser collections breakdown"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Today Collections</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Breakdown
                </span>
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-emerald-400 tracking-tight">
              ₹{displayFooterTotal.todayPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-2 block truncate">
              PVD: ₹{pvdTotals.todayPayment.toLocaleString('en-IN')} • Laser: ₹
              {laserTotals.todayPayment.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Box 3: GST Collections Box */}
          <div className="bg-[#111c38] p-5 rounded-2xl border border-slate-800/80 shadow-xl transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                GST Collections
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-blue-400 tracking-tight">
              ₹{displayFooterTotal.todayGstPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-2 block truncate">
              PVD: ₹{pvdTotals.todayGst.toLocaleString('en-IN')} • Laser: ₹
              {laserTotals.todayGst.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Box 4: Others Collections Box */}
          <div className="bg-[#111c38] p-5 rounded-2xl border border-slate-800/80 shadow-xl transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Others Collections
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-purple-400 tracking-tight">
              ₹{displayFooterTotal.todayOtherPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-2 block truncate">
              PVD: ₹{pvdTotals.todayOther.toLocaleString('en-IN')} • Laser: ₹
              {laserTotals.todayOther.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Box 5: Net Balance Box */}
          <div className="bg-[#111c38] p-5 rounded-2xl border border-slate-800/80 shadow-xl transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Net Group Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-amber-400 tracking-tight">
              ₹{Math.abs(displayFooterTotal.netDifference).toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-2 block">
              Net Outstanding Balance
            </span>
          </div>
        </div>
      ) : (
        // MONTHLY CUMULATIVE METRIC CARDS
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* MTD Total Billing */}
          <div className="bg-[#111c38] p-5 rounded-2xl border border-slate-800/80 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                MTD Cumulative Billing
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-white tracking-tight">
              ₹{displayFooterTotal.monthBilling.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-2 block">
              {monthName} Total Turnover
            </span>
          </div>

          {/* MTD Total Payment (Interactive Box) */}
          <div
            onClick={() => setShowDivisionBoxes(!showDivisionBoxes)}
            className={`cursor-pointer p-5 rounded-2xl border shadow-xl transition-all select-none ${
              showDivisionBoxes
                ? 'bg-[#111c38] border-emerald-500/60 ring-1 ring-emerald-500/40'
                : 'bg-[#111c38] border-slate-800/80 hover:border-emerald-500/50'
            }`}
            title="Click to toggle PVD vs Laser MTD split"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>MTD Collections</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Breakdown
                </span>
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-emerald-400 tracking-tight">
              ₹{displayFooterTotal.monthPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-2 block truncate">
              PVD: ₹{pvdTotals.monthPayment.toLocaleString('en-IN')} • Laser: ₹
              {laserTotals.monthPayment.toLocaleString('en-IN')}
            </span>
          </div>

          {/* MTD GST Collections */}
          <div className="bg-[#111c38] p-5 rounded-2xl border border-slate-800/80 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                MTD GST Collections
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-blue-400 tracking-tight">
              ₹{displayFooterTotal.monthGstPayment.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-2 block truncate">
              PVD: ₹{pvdTotals.monthGst.toLocaleString('en-IN')} • Laser: ₹
              {laserTotals.monthGst.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Group Recovery Rate */}
          <div className="bg-[#111c38] p-5 rounded-2xl border border-slate-800/80 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Group Recovery Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-emerald-400 tracking-tight">
              {displayFooterTotal.collectionRate}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, displayFooterTotal.collectionRate)}%` }}
              />
            </div>
          </div>

          {/* Net Pending Receivables */}
          <div className="bg-[#111c38] p-5 rounded-2xl border border-slate-800/80 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Net Outstanding
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-sans text-amber-400 tracking-tight">
              ₹{Math.abs(displayFooterTotal.netDifference).toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-2 block">
              Unsettled Billing MTD
            </span>
          </div>
        </div>
      )}

      {/* DEDICATED DIVISION COLLECTIONS COMPARISON PANELS (PVD vs LASER) */}
      {showDivisionBoxes && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>Division Collections Breakdown</span>
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-800/80 border border-slate-700/80 px-2.5 py-0.5 rounded-full font-medium">
                Select a division to filter related data
              </span>
            </div>
            {selectedDivision !== 'ALL' && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Companies</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box A: PVD Coating Division Collections */}
            <div
              onClick={() => handleSelectDivision(selectedDivision === 'PVD' ? 'ALL' : 'PVD')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative shadow-xl select-none ${
                selectedDivision === 'PVD'
                  ? 'bg-[#151c3d] border-purple-500 ring-2 ring-purple-500/40 shadow-purple-500/10'
                  : 'bg-[#111c38] border-slate-800 hover:border-purple-500/60 hover:bg-[#131f42]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      PVD Coating Division Collections
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {pvdTotals.totalCount} Plants
                    </span>
                  </div>
                  <div className="text-3xl font-black font-sans text-white mt-2.5 tracking-tight">
                    ₹
                    {(isMonthly ? pvdTotals.monthPayment : pvdTotals.todayPayment).toLocaleString(
                      'en-IN'
                    )}
                  </div>
                </div>

                <div className="text-right bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Recovery Rate
                  </span>
                  <span className="text-sm font-extrabold font-sans text-emerald-400">
                    {isMonthly ? pvdTotals.monthRecoveryRate : pvdTotals.recoveryRate}%
                  </span>
                </div>
              </div>

              {/* Sub-breakdown: GST vs Others */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
                <div className="bg-[#0b1329] rounded-xl p-3 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                    GST Collection
                  </span>
                  <span className="text-base font-bold font-sans text-blue-400 mt-1 block">
                    ₹
                    {(isMonthly ? pvdTotals.monthGst : pvdTotals.todayGst).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-[#0b1329] rounded-xl p-3 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                    Others Collection
                  </span>
                  <span className="text-base font-bold font-sans text-purple-400 mt-1 block">
                    ₹
                    {(isMonthly ? pvdTotals.monthOther : pvdTotals.todayOther).toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>
              </div>

              {/* Action Banner */}
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-purple-400">
                <span>
                  {selectedDivision === 'PVD'
                    ? 'PVD related data active below (Click to reset)'
                    : 'Click to filter related PVD plant records'}
                </span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    selectedDivision === 'PVD' ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </div>

            {/* Box B: Laser Division Collections */}
            <div
              onClick={() => handleSelectDivision(selectedDivision === 'LASER' ? 'ALL' : 'LASER')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative shadow-xl select-none ${
                selectedDivision === 'LASER'
                  ? 'bg-[#151c3d] border-blue-500 ring-2 ring-blue-500/40 shadow-blue-500/10'
                  : 'bg-[#111c38] border-slate-800 hover:border-blue-500/60 hover:bg-[#131f42]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Laser Division Collections
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {laserTotals.totalCount} Plants
                    </span>
                  </div>
                  <div className="text-3xl font-black font-sans text-white mt-2.5 tracking-tight">
                    ₹
                    {(isMonthly ? laserTotals.monthPayment : laserTotals.todayPayment).toLocaleString(
                      'en-IN'
                    )}
                  </div>
                </div>

                <div className="text-right bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Recovery Rate
                  </span>
                  <span className="text-sm font-extrabold font-sans text-emerald-400">
                    {isMonthly ? laserTotals.monthRecoveryRate : laserTotals.recoveryRate}%
                  </span>
                </div>
              </div>

              {/* Sub-breakdown: GST vs Others */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
                <div className="bg-[#0b1329] rounded-xl p-3 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                    GST Collection
                  </span>
                  <span className="text-base font-bold font-sans text-blue-400 mt-1 block">
                    ₹
                    {(isMonthly ? laserTotals.monthGst : laserTotals.todayGst).toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>
                <div className="bg-[#0b1329] rounded-xl p-3 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                    Others Collection
                  </span>
                  <span className="text-base font-bold font-sans text-purple-400 mt-1 block">
                    ₹
                    {(isMonthly ? laserTotals.monthOther : laserTotals.todayOther).toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>
              </div>

              {/* Action Banner */}
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-blue-400">
                <span>
                  {selectedDivision === 'LASER'
                    ? 'Laser related data active below (Click to reset)'
                    : 'Click to filter related Laser plant records'}
                </span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    selectedDivision === 'LASER' ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container: Left Sidebar + Right Master Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Companies Switcher & Division Tabs */}
        <div className="bg-[#0d1527] rounded-2xl border border-slate-800/90 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 px-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" /> Group Companies
            </span>
            <span className="text-[11px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
              Group Units
            </span>
          </div>

          {/* Division Filter Segmented Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#0b1329] p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleSelectDivision('ALL')}
              className={`py-1.5 rounded-lg transition-all ${
                selectedDivision === 'ALL'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleSelectDivision('LASER')}
              className={`py-1.5 rounded-lg transition-all ${
                selectedDivision === 'LASER'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-blue-400'
              }`}
            >
              Laser (6)
            </button>
            <button
              type="button"
              onClick={() => handleSelectDivision('PVD')}
              className={`py-1.5 rounded-lg transition-all ${
                selectedDivision === 'PVD'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-purple-400'
              }`}
            >
              PVD (3)
            </button>
          </div>

          {/* Manage Accounts Button for Super Admin */}
          <button
            type="button"
            onClick={() => setShowAccountsModal(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-white text-xs font-semibold flex items-center justify-between transition-all text-left"
          >
            <span className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>Company Passwords</span>
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-sans font-bold">
              Manage
            </span>
          </button>

          {/* Master consolidated button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs font-semibold ${
              selectedCompanyFilter === null && selectedDivision === 'ALL'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>All Companies (Consolidated)</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* List of Companies (Dynamic based on selectedDivision) */}
          <div className="space-y-1.5 pt-1 max-h-[380px] overflow-y-auto pr-1">
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
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-slate-800 text-white font-bold border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        s.hasEntryToday ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    <span className="truncate font-sans">{s.company.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                        isPvd
                          ? 'bg-purple-500/15 text-purple-400'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}
                    >
                      {isPvd ? 'PVD' : 'LASER'}
                    </span>
                    <span className="text-xs font-bold font-sans text-slate-400">
                      ₹{Math.round((isMonthly ? s.monthBilling : s.todayBilling) / 1000)}k
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 px-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Updated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending
            </span>
          </div>
        </div>

        {/* Right Side: The Master Consolidated Table & Related Data View */}
        <div className="lg:col-span-3 bg-[#0d1527] rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl">
          {/* Card Header with DATE FILTER */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1329]/50">
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
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : selectedDivision === 'LASER'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
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
              <p className="text-xs text-slate-400 mt-1">
                {selectedDivision !== 'ALL'
                  ? `Showing ${filteredSummaries.length} plants in ${selectedDivision} Division • Date: ${selectedDate}`
                  : isMonthly
                  ? `Aggregated figures for ${monthName} • Real-time audit across operating plants`
                  : `Date: ${selectedDate} • Daily Collections & Cumulative Month Figures`}
              </p>
            </div>

            {/* Right Corner Controls: DATE FILTER + Reset Filter */}
            <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
              {(selectedCompanyFilter || selectedDivision !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1 pr-2"
                >
                  <span>Show All Companies</span>
                </button>
              )}

              {/* Date Filter Pill */}
              <div className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-full text-xs text-white font-medium border border-slate-700 transition-all shadow-inner">
                <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-sans text-xs"
                  title="Filter register by date"
                />
              </div>
            </div>
          </div>

          {/* Active Filter Notification Pill */}
          {selectedDivision !== 'ALL' && (
            <div
              className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-semibold ${
                selectedDivision === 'PVD'
                  ? 'bg-purple-950/30 border-purple-900/50 text-purple-300'
                  : 'bg-blue-950/30 border-blue-900/50 text-blue-300'
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
                className="underline hover:text-white text-[11px] font-bold"
              >
                Clear Division Filter
              </button>
            </div>
          )}

          {/* TABLE DISPLAY */}
          <div className="overflow-x-auto">
            {!isMonthly ? (
              // DAILY MATRIX TABLE
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0b1329] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5">Company Name</th>
                    <th className="py-3 px-3 text-right">Today Billing</th>
                    <th className="py-3 px-3 text-right text-blue-400">GST Collection</th>
                    <th className="py-3 px-3 text-right text-purple-400">Others</th>
                    <th className="py-3 px-3 text-right text-emerald-400">Today Payment</th>
                    <th className="py-3 px-3 text-center">Payment Received Date & Time</th>
                    <th className="py-3 px-3 text-right">Total Bill (MTD)</th>
                    <th className="py-3 px-3 text-right">Total Payment (TP)</th>
                    <th className="py-3 px-3 text-right">Net Balance</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSummaries.map((item) => {
                    const isPvd = isPvdCompany(item.company);
                    return (
                      <tr
                        key={item.company.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="py-3.5 px-3.5 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-7 h-7 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-[10px] font-sans font-black ${
                                isPvd ? 'text-purple-400' : 'text-blue-400'
                              }`}
                            >
                              {item.company.code}
                            </span>
                            <div>
                              <div className="text-white font-bold leading-tight flex items-center gap-1.5 font-sans">
                                <span>{item.company.name}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                                    isPvd
                                      ? 'bg-purple-500/15 text-purple-400'
                                      : 'bg-blue-500/15 text-blue-400'
                                  }`}
                                >
                                  {isPvd ? 'PVD' : 'LASER'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {item.company.location}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold font-sans text-slate-100">
                          ₹{item.todayBilling.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold font-sans text-blue-400">
                          ₹{(item.todayGstPayment || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold font-sans text-purple-400">
                          ₹{(item.todayOtherPayment || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-black font-sans text-emerald-400">
                          ₹{item.todayPayment.toLocaleString('en-IN')}
                        </td>

                        {/* Payment Received Date & Time Column */}
                        <td className="py-3.5 px-3 text-center text-xs">
                          {item.todayPayment > 0 ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-slate-200 font-bold font-sans">
                                {item.paymentReceivedAt ||
                                  `${selectedDate.split('-').reverse().join('-')}, 04:00 PM`}
                              </span>
                              {item.paymentMode && (
                                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-sans font-semibold">
                                  {item.paymentMode.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic font-sans text-xs">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right font-semibold font-sans text-slate-200">
                          ₹{item.monthBilling.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold font-sans text-emerald-400">
                          ₹{item.monthPayment.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold font-sans">
                          <span
                            className={
                              item.netDifference >= 0 ? 'text-amber-400' : 'text-emerald-400'
                            }
                          >
                            ₹{Math.abs(item.netDifference).toLocaleString('en-IN')}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {item.hasEntryToday ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onEditCompany(item.company.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3 text-blue-400" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr className="bg-[#0b1329] border-t-2 border-blue-500/50 text-white font-bold text-xs">
                    <td className="py-4 px-3.5 uppercase tracking-wider font-black flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                      {displayFooterTotal.label}
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-white">
                      ₹{displayFooterTotal.todayBilling.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-blue-400">
                      ₹{displayFooterTotal.todayGstPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-purple-400">
                      ₹{displayFooterTotal.todayOtherPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-emerald-400">
                      ₹{displayFooterTotal.todayPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-center text-xs text-slate-300">
                      Live Timestamped
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-white">
                      ₹{displayFooterTotal.monthBilling.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-emerald-400">
                      ₹{displayFooterTotal.monthPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-amber-400">
                      ₹{Math.abs(displayFooterTotal.netDifference).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-center text-xs text-slate-300">
                      {displayFooterTotal.statusText}
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="text-xs font-bold text-slate-400">Verified</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              // MONTHLY CUMULATIVE TABLE
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0b1329] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5">Company Name</th>
                    <th className="py-3 px-3 text-right">Month Billing (MTD)</th>
                    <th className="py-3 px-3 text-right text-blue-400">GST Collection (MTD)</th>
                    <th className="py-3 px-3 text-right text-purple-400">Others (MTD)</th>
                    <th className="py-3 px-3 text-right text-emerald-400">Month Payment (TP)</th>
                    <th className="py-3 px-3 text-right">Net Balance</th>
                    <th className="py-3 px-3 text-center">Collection %</th>
                    <th className="py-3 px-3 text-right">Avg Daily Billing</th>
                    <th className="py-3 px-3 text-center">Latest Payment Received At</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSummaries.map((item) => {
                    const isPvd = isPvdCompany(item.company);
                    return (
                      <tr
                        key={item.company.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="py-3.5 px-3.5 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-7 h-7 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-[10px] font-sans font-black ${
                                isPvd ? 'text-purple-400' : 'text-blue-400'
                              }`}
                            >
                              {item.company.code}
                            </span>
                            <div>
                              <div className="text-white font-bold leading-tight flex items-center gap-1.5 font-sans">
                                <span>{item.company.name}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                                    isPvd
                                      ? 'bg-purple-500/15 text-purple-400'
                                      : 'bg-blue-500/15 text-blue-400'
                                  }`}
                                >
                                  {isPvd ? 'PVD' : 'LASER'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {item.company.location}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold font-sans text-white">
                          ₹{item.monthBilling.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold font-sans text-blue-400">
                          ₹{(item.monthGstPayment || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold font-sans text-purple-400">
                          ₹{(item.monthOtherPayment || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-black font-sans text-emerald-400">
                          ₹{item.monthPayment.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold font-sans">
                          <span
                            className={
                              item.netDifference >= 0 ? 'text-amber-400' : 'text-emerald-400'
                            }
                          >
                            ₹{Math.abs(item.netDifference).toLocaleString('en-IN')}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="text-xs font-bold font-sans text-emerald-400">
                              {item.collectionRate}%
                            </span>
                            <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-400 h-full rounded-full"
                                style={{ width: `${Math.min(100, item.collectionRate)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right font-semibold font-sans text-slate-200">
                          ₹{item.avgDailyBilling.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-center text-xs text-slate-300 font-sans">
                          {item.paymentReceivedAt ||
                            `${selectedDate.split('-').reverse().join('-')}, 04:00 PM`}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Reconciled
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onEditCompany(item.company.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3 text-blue-400" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr className="bg-[#0b1329] border-t-2 border-purple-500/50 text-white font-bold text-xs">
                    <td className="py-4 px-3.5 uppercase tracking-wider font-black flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                      {displayFooterTotal.label}
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-white">
                      ₹{displayFooterTotal.monthBilling.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-blue-400">
                      ₹{displayFooterTotal.monthGstPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-purple-400">
                      ₹{displayFooterTotal.monthOtherPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-emerald-400">
                      ₹{displayFooterTotal.monthPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-sm font-black text-amber-400">
                      ₹{Math.abs(displayFooterTotal.netDifference).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-center font-sans text-xs font-black text-emerald-400">
                      {displayFooterTotal.collectionRate}%
                    </td>
                    <td className="py-4 px-3 text-right font-sans text-xs text-slate-300">
                      ₹{displayFooterTotal.avgDailyBilling.toLocaleString('en-IN')} /day
                    </td>
                    <td className="py-4 px-3 text-center text-xs text-slate-300 font-sans">
                      All Recorded
                    </td>
                    <td className="py-4 px-3 text-center text-xs font-bold text-emerald-400">
                      100% Closed
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="text-xs font-bold text-slate-400">Audited</span>
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
          <div className="relative w-full max-w-3xl bg-[#0d1527] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    Company Accounts & Credentials
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      Super Admin Private
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Share these credentials with operating unit branch managers to log into their
                    respective portals.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAccountsModal(false)}
                type="button"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0b1329] border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-3">Username</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Access Password</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
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
                      <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{acc.name}</span>
                          <span className="text-[10px] text-slate-400">{acc.id}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{acc.username}</td>
                        <td className="py-3 px-3 text-slate-400 text-xs">{acc.email}</td>
                        <td className="py-3 px-3 font-bold text-emerald-400">{acc.pass}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.id, credText)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center gap-1.5"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-blue-400" />
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

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Registered Operating Entities ({companyAccounts.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAccountsModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
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
