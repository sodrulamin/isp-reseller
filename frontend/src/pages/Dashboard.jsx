import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import { TrendBarChart, ExpenseBreakdownChart } from '../components/FinancialCharts';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Network,
  Boxes,
  Wrench,
  Users,
  Wallet,
  AlertCircle,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const { user, isSuperAdmin, activeWorkspaceId } = useAuth();
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadFinancials = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.get('/finance/monthly-summary', { month: selectedMonth });
      setFinance(data);
    } catch (err) {
      setError(err.message || 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, [selectedMonth, activeWorkspaceId]);

  const monthOptions = [
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Financial &amp; Profit Monitoring
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time monthly revenue, Mother ISP disbursements, equipment, and service expenses.
          </p>
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Collections (Revenue)"
          value={`৳${Number(finance?.totalRevenue || 0).toFixed(2)}`}
          subtitle="Subscriber packages + equipment payments"
          icon={DollarSign}
          color="blue"
        />

        <MetricCard
          title="Mother ISP Payout (Expense #1)"
          value={`৳${Number(finance?.motherIspPayoutExpense || 0).toFixed(2)}`}
          subtitle={`Disbursed at ${finance?.motherIspDisbursementPercentage || 49}% rate`}
          icon={Network}
          color="indigo"
        />

        <MetricCard
          title="Package Gross Profit"
          value={`৳${Number(finance?.packageGrossProfit || 0).toFixed(2)}`}
          subtitle={`${Number(finance?.packageGrossMarginPercent || 0).toFixed(1)}% gross margin`}
          icon={TrendingUp}
          color="emerald"
        />

        <MetricCard
          title="Net Monthly Profit"
          value={`৳${Number(finance?.netMonthlyProfit || 0).toFixed(2)}`}
          subtitle={`${Number(finance?.netMarginPercent || 0).toFixed(1)}% after all expenses`}
          icon={CheckCircle2}
          color={Number(finance?.netMonthlyProfit || 0) >= 0 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Expense Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">My Mother ISP Balance</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">৳{Number(finance?.motherIspResellerBalance || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mother ISP Packages</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">৳{Number(finance?.motherIspPayoutExpense || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Equipment Purchases (Expense #2)</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">৳{Number(finance?.equipmentPurchaseExpense || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Physical Servicing (Expense #3)</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">৳{Number(finance?.physicalServiceExpense || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <TrendBarChart trends={finance?.monthlyTrends || []} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <ExpenseBreakdownChart
            motherIsp={finance?.motherIspPayoutExpense || 0}
            equipment={finance?.equipmentPurchaseExpense || 0}
            service={finance?.physicalServiceExpense || 0}
          />
        </div>
      </div>

      {/* Financial Statement Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Statement Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{finance?.monthLabel || 'Current Month'}</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 rounded-full border border-blue-200 dark:border-blue-900/50">
            Accounting Summary
          </span>
        </div>

        <div className="p-6">
          <div className="space-y-5">
            {/* Revenue Section */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">1. Operating Revenue &amp; Collections</h5>
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Direct Reseller Package Collections</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Collected by you in cash, bKash, direct transfer</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">৳{Number(finance?.directPackageCollections || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Mother ISP Portal Collections</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Paid by subscriber directly on Mother ISP portal</span>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">৳{Number(finance?.portalPackageCollections || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Subscriber Equipment Component Payments</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Router &amp; ONU hardware sales</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">৳{Number(finance?.equipmentSalesCollections || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-center font-extrabold text-blue-600 dark:text-blue-400">
                  <span>Total Gross Collections</span>
                  <span>৳{Number(finance?.totalRevenue || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">2. Reseller Operating Expenses</h5>
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">Mother ISP Reseller Package Disbursement ({finance?.motherIspDisbursementPercentage}%)</span>
                  <span className="font-bold text-rose-500">- ৳{Number(finance?.motherIspPayoutExpense || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">Equipment &amp; Hardware Purchases (Routers, ONU, Fiber Drop)</span>
                  <span className="font-bold text-rose-500">- ৳{Number(finance?.equipmentPurchaseExpense || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">Physical Service Operational Maintenance (Splicing, Line Repairs)</span>
                  <span className="font-bold text-rose-500">- ৳{Number(finance?.physicalServiceExpense || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-center font-extrabold text-rose-600 dark:text-rose-400">
                  <span>Total Incurred Expenses</span>
                  <span>- ৳{Number(finance?.totalExpenses || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Profit Section */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">3. Profitability &amp; Margins</h5>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-5 text-sm space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-900 dark:text-emerald-200 font-semibold">Package Gross Margin (Revenue - Mother ISP Payout)</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 text-base">৳{Number(finance?.packageGrossProfit || 0).toFixed(2)} ({Number(finance?.packageGrossMarginPercent || 0).toFixed(1)}%)</span>
                </div>
                <div className="border-t border-emerald-200/60 dark:border-emerald-800/60 pt-3 flex justify-between items-center">
                  <span className="text-emerald-950 dark:text-emerald-100 font-bold text-base">Net Reseller Profit (Bottom Line)</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-300 text-2xl">৳{Number(finance?.netMonthlyProfit || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
