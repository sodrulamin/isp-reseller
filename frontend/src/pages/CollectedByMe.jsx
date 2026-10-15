import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  DollarSign,
  Calendar,
  Search,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Filter,
  CreditCard,
  FileSpreadsheet,
  Receipt,
  Clock
} from 'lucide-react';

export default function CollectedByMe({ onNavigate }) {
  const { activeWorkspaceId } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('ALL'); // 'ALL' | 'THIS_MONTH' | 'LAST_MONTH'

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/billing/collected-by-me');
      setTransactions(data || []);
    } catch (err) {
      console.error('Failed to load collected by me transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspaceId]);

  // Date helpers
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search
      const searchLower = search.toLowerCase();
      const matchesSearch =
        (tx.subscriberName || '').toLowerCase().includes(searchLower) ||
        (tx.subscriberCode || '').toLowerCase().includes(searchLower) ||
        (tx.transactionReference || '').toLowerCase().includes(searchLower) ||
        (tx.paymentMethod || '').toLowerCase().includes(searchLower) ||
        (tx.notes || '').toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Method
      if (methodFilter !== 'ALL' && tx.paymentMethod !== methodFilter) {
        return false;
      }

      // Period
      if (periodFilter !== 'ALL' && tx.transactionDate) {
        const txDate = new Date(tx.transactionDate);
        if (periodFilter === 'THIS_MONTH') {
          if (txDate.getFullYear() !== currentYear || txDate.getMonth() !== currentMonth) {
            return false;
          }
        } else if (periodFilter === 'LAST_MONTH') {
          const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
          if (
            txDate.getFullYear() !== lastMonthDate.getFullYear() ||
            txDate.getMonth() !== lastMonthDate.getMonth()
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [transactions, search, methodFilter, periodFilter, currentYear, currentMonth]);

  // Statistics
  const totalAllTime = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [transactions]);

  const totalThisMonth = useMemo(() => {
    return transactions
      .filter(tx => {
        if (!tx.transactionDate) return false;
        const d = new Date(tx.transactionDate);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [transactions, currentYear, currentMonth]);

  const uniqueMethods = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => {
      if (t.paymentMethod) set.add(t.paymentMethod);
    });
    return Array.from(set);
  }, [transactions]);

  const getMethodBadge = (method) => {
    const m = (method || 'CASH').toUpperCase();
    if (m === 'CASH') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Cash
        </span>
      );
    }
    if (m === 'BKASH') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
          bKash
        </span>
      );
    }
    if (m === 'NAGAD') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
          Nagad
        </span>
      );
    }
    if (m === 'BANK_TRANSFER') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          Bank Transfer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {m}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
              Invoices &amp; Billing
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Collected by Me Transactions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit log of all payments and deposits collected directly by you from subscribers (Cash, bKash, Nagad, Bank Transfer).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('invoices')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
            >
              <Receipt className="w-4 h-4 text-slate-500" />
              <span>View Invoices &amp; Billing</span>
            </button>
          )}
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected by Me */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Collected by Me
            </span>
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            ৳{totalAllTime.toFixed(2)}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            All-time direct collections across workspace
          </p>
        </div>

        {/* This Month's Collections */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Running Month Collections
            </span>
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            ৳{totalThisMonth.toFixed(2)}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Collected by me in current calendar month
          </p>
        </div>

        {/* Total Entries */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Direct Collections
            </span>
            <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-2">
            {transactions.length}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {filteredTransactions.length} matching current filter
          </p>
        </div>

        {/* Average Collection */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Average Collection
            </span>
            <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            ৳{transactions.length > 0 ? (totalAllTime / transactions.length).toFixed(2) : '0.00'}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Average payment received per receipt
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subscriber name, code, payment method, or transaction reference..."
            className="w-full text-xs text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Method Filter */}
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            {uniqueMethods
              .filter(m => !['CASH', 'BKASH', 'NAGAD', 'BANK_TRANSFER'].includes(m.toUpperCase()))
              .map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
          </select>

          {/* Period Filter */}
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium ml-1">Period:</span>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Time</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Receipt / Ref #</th>
                <th className="py-3 px-4">Notes / Purpose</th>
                <th className="py-3 px-4 text-right">Collected Amount</th>
                <th className="py-3 px-4 text-right">Wallet Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Loading collected by me transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Coins className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium text-slate-600 dark:text-slate-400">No collected-by-me transactions found</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      Direct cash and MFS deposits collected by you from subscribers will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-200 whitespace-nowrap">
                      {tx.transactionDate ? new Date(tx.transactionDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      }) : '—'}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {tx.subscriberName || 'Unknown'}
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono font-normal">
                        {tx.subscriberCode || '—'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getMethodBadge(tx.paymentMethod)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {tx.transactionReference || `DEP-${tx.id}`}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {tx.notes || 'Direct collection from customer'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      +৳{Number(tx.amount || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold font-mono text-xs text-slate-900 dark:text-slate-200 whitespace-nowrap">
                      ৳{Number(tx.balanceAfter || 0).toFixed(2)}
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
