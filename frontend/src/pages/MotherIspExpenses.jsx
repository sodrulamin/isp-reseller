import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Network, DollarSign, Calendar, Search, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function MotherIspExpenses() {
  const { activeWorkspaceId } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/billing/mother-isp-payouts');
      setPayouts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, [activeWorkspaceId]);

  const totalDisbursed = payouts.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);

  const filtered = payouts.filter(p =>
    (p.subscriberName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.subscriberCode || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.transactionRef || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mother ISP Package Expenses</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Expense #1: Automated disbursement obligations calculated per subscriber cycle using your configured percentage.
          </p>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Disbursed to Mother ISP</span>
          <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">৳{totalDisbursed.toFixed(2)}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Across all subscriber cycles to date</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Package Cycle Disbursements</span>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-2">{payouts.length}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Total recorded monthly payouts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Disbursement Rate</span>
          <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {payouts.length > 0 ? (payouts.reduce((acc, p) => acc + Number(p.disbursementPercentage || 49), 0) / payouts.length).toFixed(1) : 49.0}%
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Contractual mother ISP percentage</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subscriber name, code, or payout reference..."
          className="w-full text-xs text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Cycle Date</th>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Internet Package</th>
                <th className="py-3 px-4">Package Price</th>
                <th className="py-3 px-4">Configured Share %</th>
                <th className="py-3 px-4 text-right">Disbursed to Mother ISP</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500">Loading payout records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500">No mother ISP payouts recorded yet.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-200">
                      {item.cycleDate}
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.transactionRef}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {item.subscriberName}
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{item.subscriberCode}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">
                      {item.packageName}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-200">
                      ৳{Number(item.packagePrice || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {item.disbursementPercentage}% Mother ISP
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-rose-600 dark:text-rose-400 text-sm">
                      ৳{Number(item.amountPaid || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{item.paymentStatus}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
