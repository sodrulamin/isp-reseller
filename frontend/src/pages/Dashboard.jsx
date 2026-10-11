import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Users,
  Network,
  Boxes,
  Wrench,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Sparkles,
  PieChart,
  BarChart3,
  Receipt,
  ShieldCheck,
  ChevronRight,
  Layers
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const { user, isSuperAdmin, activeWorkspaceId } = useAuth();
  const [finance, setFinance] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [financeData, txData] = await Promise.all([
        apiClient.get('/finance/monthly-summary', { month: selectedMonth }),
        apiClient.get('/billing/wallet-transactions')
      ]);
      setFinance(financeData);
      setRecentTransactions((txData || []).slice(0, 6));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth, activeWorkspaceId]);

  const monthOptions = [
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
  ];

  // Financial metrics
  const totalRev = Number(finance?.totalRevenue || 0);
  const directRev = Number(finance?.directPackageCollections || 0);
  const portalRev = Number(finance?.portalPackageCollections || 0);
  const eqRev = Number(finance?.equipmentSalesCollections || 0);

  const motherIspExp = Number(finance?.motherIspPayoutExpense || 0);
  const eqExp = Number(finance?.equipmentPurchaseExpense || 0);
  const svcExp = Number(finance?.physicalServiceExpense || 0);
  const totalExp = Number(finance?.totalExpenses || 0);

  const netProfit = Number(finance?.netMonthlyProfit || 0);
  const netMargin = Number(finance?.netMarginPercent || 0);
  const grossProfit = Number(finance?.packageGrossProfit || 0);
  const grossMargin = Number(finance?.packageGrossMarginPercent || 0);

  const motherIspBalance = Number(finance?.motherIspResellerBalance || 0);
  const totalSubscribers = Number(finance?.totalSubscribers || 0);
  const activeSubscribers = Number(finance?.activeSubscribers || 0);
  const outstandingDue = Number(finance?.totalSubscriberOutstandingDue || 0);
  const walletCredits = Number(finance?.totalSubscriberWalletCredits || 0);

  // Expense percentage breakdown
  const motherIspPct = totalExp > 0 ? ((motherIspExp / totalExp) * 100).toFixed(1) : 0;
  const eqPct = totalExp > 0 ? ((eqExp / totalExp) * 100).toFixed(1) : 0;
  const svcPct = totalExp > 0 ? ((svcExp / totalExp) * 100).toFixed(1) : 0;

  // Trend bar max value
  const trends = finance?.monthlyTrends || [];
  const maxTrendVal = Math.max(
    ...trends.map(t => Math.max(t.revenue || 0, t.totalExpense || 0, t.netProfit || 0)),
    1000
  );

  const formatShort = (num) => {
    if (!num || num === 0) return '0';
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return Math.round(num).toString();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* Top Bar / Command Center */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Executive Financial Cockpit
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
              Comprehensive revenue collection channels, Mother ISP split, operational costs &amp; profit margins.
            </p>
          </div>
        </div>

        {/* Action Controls & Month Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Period:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hero KPI Cards: 4 Flagship Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Net Reseller Profit */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white rounded-2xl p-5 shadow-md shadow-emerald-500/15">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Net Reseller Profit</span>
            <div className="p-1.5 rounded-lg bg-white/15 backdrop-blur-md">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">৳{netProfit.toFixed(2)}</div>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-emerald-100 font-medium">
              <span className="px-1.5 py-0.5 rounded bg-white/20 font-semibold">{netMargin.toFixed(1)}% Net Margin</span>
              <span>After all expenses</span>
            </div>
          </div>
        </div>

        {/* Total Operating Collections */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gross Collections</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">৳{totalRev.toFixed(2)}</div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Direct: <strong className="text-slate-800 dark:text-slate-200">৳{directRev.toFixed(0)}</strong></span>
              <span>•</span>
              <span>Portal: <strong className="text-indigo-600 dark:text-indigo-400">৳{portalRev.toFixed(0)}</strong></span>
            </div>
          </div>
        </div>

        {/* My Balance at Mother ISP */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">My Mother ISP Balance</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">৳{motherIspBalance.toFixed(2)}</div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-normal">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Accumulated credit held at Mother ISP</span>
            </div>
          </div>
        </div>

        {/* Total Incurred Expenses */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Expenses</span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">৳{totalExp.toFixed(2)}</div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-normal">
              <span>ISP share: ৳{motherIspExp.toFixed(0)} ({motherIspPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: 6-Month Trend & Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column: 6-Month High-Res Financial Trend (8 Columns) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    6-Month Financial Trend Velocity
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Month-by-month comparative analysis of revenue, expenses, and net retained profit.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                  <span className="text-slate-600 dark:text-slate-300">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-400" />
                  <span className="text-slate-600 dark:text-slate-300">Expenses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300">Net Profit</span>
                </div>
              </div>
            </div>

            {/* Dynamic Interactive Trend Bars */}
            <div className="h-72 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
              {trends.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  No historical trend data available
                </div>
              ) : (
                trends.map((item, idx) => {
                  const revHeight = Math.min(100, Math.max(6, ((item.revenue || 0) / maxTrendVal) * 100));
                  const expHeight = Math.min(100, Math.max(6, ((item.totalExpense || 0) / maxTrendVal) * 100));
                  const profitHeight = Math.min(100, Math.max(6, ((Math.max(0, item.netProfit || 0)) / maxTrendVal) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-2 sm:gap-2.5 h-full">
                        {/* Revenue Bar */}
                        <div className="flex flex-col items-center h-full justify-end">
                          <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1 leading-none select-none">
                            ৳{formatShort(item.revenue)}
                          </span>
                          <div
                            style={{ height: `${revHeight}%` }}
                            title={`Revenue: ৳${Number(item.revenue || 0).toFixed(2)}`}
                            className="w-6 sm:w-8 bg-blue-500 rounded-t-md transition-all group-hover:bg-blue-600 cursor-pointer shadow-sm"
                          />
                        </div>

                        {/* Expense Bar */}
                        <div className="flex flex-col items-center h-full justify-end">
                          <span className="text-[10px] sm:text-[11px] font-bold text-rose-500 dark:text-rose-400 mb-1 leading-none select-none">
                            ৳{formatShort(item.totalExpense)}
                          </span>
                          <div
                            style={{ height: `${expHeight}%` }}
                            title={`Expenses: ৳${Number(item.totalExpense || 0).toFixed(2)}`}
                            className="w-6 sm:w-8 bg-rose-400 rounded-t-md transition-all group-hover:bg-rose-500 cursor-pointer shadow-sm"
                          />
                        </div>

                        {/* Net Profit Bar */}
                        <div className="flex flex-col items-center h-full justify-end">
                          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 leading-none select-none">
                            ৳{formatShort(item.netProfit)}
                          </span>
                          <div
                            style={{ height: `${profitHeight}%` }}
                            title={`Net Profit: ৳${Number(item.netProfit || 0).toFixed(2)}`}
                            className="w-6 sm:w-8 bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-600 cursor-pointer shadow-sm"
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-2.5 whitespace-nowrap">
                        {item.month}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-3 gap-3 pt-3 mt-1">
            <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">Package Margin</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                {grossMargin.toFixed(1)}%
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ৳{grossProfit.toFixed(2)} profit
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">Subscribers Base</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                {activeSubscribers} / {totalSubscribers}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                {totalSubscribers > 0 ? ((activeSubscribers / totalSubscribers) * 100).toFixed(0) : 100}% Active
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">Due vs Advance</span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                ৳{outstandingDue.toFixed(0)} Due
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ৳{walletCredits.toFixed(0)} Advance
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Expense Composition & Collections Breakdown (4 Columns) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Revenue Source Split */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Collections Channels</h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                Incoming
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Direct Reseller */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Collected by Me</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">৳{directRev.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 pl-3.5">
                  Cash in Hand, bKash &amp; direct mobile transfers
                </p>
              </div>

              {/* Mother ISP Portal */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Mother ISP Portal</span>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">৳{portalRev.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 pl-3.5">
                  Customers paid via Mother ISP customer portal
                </p>
              </div>

              {/* Equipment Hardware Sales */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Equipment Sales</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">৳{eqRev.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 pl-3.5">
                  Router, ONU, patch cord component sales
                </p>
              </div>
            </div>
          </div>

          {/* Expense Composition */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Expense Allocation</h4>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">৳{totalExp.toFixed(2)}</span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${motherIspPct}%` }} className="bg-indigo-600 transition-all" title={`Mother ISP: ${motherIspPct}%`} />
              <div style={{ width: `${eqPct}%` }} className="bg-amber-500 transition-all" title={`Equipment: ${eqPct}%`} />
              <div style={{ width: `${svcPct}%` }} className="bg-rose-500 transition-all" title={`Services: ${svcPct}%`} />
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="text-slate-600 dark:text-slate-300 font-normal">Mother ISP ({finance?.motherIspDisbursementPercentage || 49}%)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">৳{motherIspExp.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-normal">Hardware Purchases</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">৳{eqExp.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-normal">Physical Servicing</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">৳{svcExp.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Full Accounting Ledger & Recent Live Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Monthly Accounting Ledger Table (7 Columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Income Statement Audit ({finance?.monthLabel || 'Current Month'})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accounting Standard</span>
          </div>

          <div className="p-5 space-y-3.5">
            {/* Step 1: Revenue */}
            <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                1. Gross Collections
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Direct Subscriber Collections (Cash / MFS)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">৳{directRev.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Mother ISP Customer Portal Payments</span>
                  <span className="font-semibold text-slate-900 dark:text-white">৳{portalRev.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Hardware &amp; Equipment Sales</span>
                  <span className="font-semibold text-slate-900 dark:text-white">৳{eqRev.toFixed(2)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-750 flex justify-between font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                  <span>Total Operating Revenue</span>
                  <span>৳{totalRev.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Step 2: Expenses */}
            <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                2. Operational Expenses
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Mother ISP Disbursement ({finance?.motherIspDisbursementPercentage}%)</span>
                  <span className="font-semibold text-rose-500">- ৳{motherIspExp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Equipment Inventory Purchases</span>
                  <span className="font-semibold text-rose-500">- ৳{eqExp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Field Servicing &amp; Maintenance</span>
                  <span className="font-semibold text-rose-500">- ৳{svcExp.toFixed(2)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-750 flex justify-between font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
                  <span>Total Incurred Expenses</span>
                  <span>- ৳{totalExp.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Step 3: Bottom Line Profit */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                  Net Reseller Earnings
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Revenue minus Mother ISP payout, equipment &amp; maintenance
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
                  ৳{netProfit.toFixed(2)}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  {netMargin.toFixed(1)}% profit margin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Live Payment Entries & Quick Links (5 Columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Collections Stream</h3>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('subscribers')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No payment collections recorded yet.
                </div>
              ) : (
                recentTransactions.map(tx => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {tx.subscriberName}
                        </span>
                        {tx.paymentChannel === 'MOTHER_ISP_PORTAL' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                            Portal
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                            Direct ({tx.paymentMethod})
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-mono">
                        {tx.transactionDate?.replace('T', ' ').substring(0, 16)} • {tx.subscriberCode}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        +৳{Number(tx.amount || 0).toFixed(2)}
                      </span>
                      {tx.paymentChannel === 'MOTHER_ISP_PORTAL' && Number(tx.resellerCreditedAmount || 0) > 0 && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          +৳{tx.resellerCreditedAmount} to balance
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('subscribers')}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors shadow-sm text-xs"
                >
                  <span>Deposit Subscriber</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </button>
                <button
                  onClick={() => onNavigate('mother-isp')}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors shadow-sm text-xs"
                >
                  <span>Mother ISP Ledger</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
