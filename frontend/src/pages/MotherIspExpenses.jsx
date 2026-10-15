import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Network,
  DollarSign,
  Calendar,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  CheckCircle2,
  Plus,
  Minus,
  RefreshCw,
  Wallet,
  Receipt,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function MotherIspExpenses() {
  const { activeWorkspaceId } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reseller, setReseller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'disbursements'

  // Search & Filter
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals & Forms
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    transactionRef: '',
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [payoutsData, transactionsData, resellerData] = await Promise.all([
        apiClient.get('/billing/mother-isp-payouts'),
        apiClient.get('/billing/mother-isp-transactions'),
        apiClient.get('/workspace/current')
      ]);
      setPayouts(payoutsData || []);
      setTransactions(transactionsData || []);
      setReseller(resellerData || null);
    } catch (err) {
      console.error('Failed to load Mother ISP financial records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspaceId]);

  const totalDisbursed = payouts.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
  const motherIspBalance = Number(reseller?.motherIspResellerBalance || 0);

  const resetForm = () => {
    setFormData({
      amount: '',
      paymentMethod: 'BANK_TRANSFER',
      transactionRef: '',
      notes: ''
    });
    setActionError('');
  };

  const handleOpenTopup = () => {
    resetForm();
    setIsTopupModalOpen(true);
  };

  const handleOpenWithdraw = () => {
    resetForm();
    setIsWithdrawModalOpen(true);
  };

  const handleTopupSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setActionError('Please enter a valid top-up amount greater than 0');
      return;
    }
    setSubmitting(true);
    setActionError('');
    try {
      await apiClient.post('/billing/mother-isp/topup', {
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionRef: formData.transactionRef,
        notes: formData.notes
      });
      setIsTopupModalOpen(false);
      setSuccessMessage('Successfully credited Mother ISP balance.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to top up balance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setActionError('Please enter a valid withdrawal amount greater than 0');
      return;
    }
    setSubmitting(true);
    setActionError('');
    try {
      await apiClient.post('/billing/mother-isp/withdraw', {
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionRef: formData.transactionRef,
        notes: formData.notes
      });
      setIsWithdrawModalOpen(false);
      setSuccessMessage('Successfully recorded withdrawal from Mother ISP.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to record withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      (tx.subscriberName || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.subscriberCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.transactionRef || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.notes || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.transactionType || '').toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'ALL' || tx.transactionType === typeFilter;
    return matchesSearch && matchesType;
  });

  // Filtered disbursements
  const filteredPayouts = payouts.filter(p =>
    (p.subscriberName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.subscriberCode || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.transactionRef || '').toLowerCase().includes(search.toLowerCase())
  );

  const getTransactionTypeBadge = (type) => {
    switch (type) {
      case 'CUSTOMER_PORTAL_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Portal Payment
          </span>
        );
      case 'CYCLE_DISBURSEMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <ArrowUpRight className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Cycle Fee Paid
          </span>
        );
      case 'RESELLER_TOPUP':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Plus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Manual Top-up
          </span>
        );
      case 'RESELLER_WITHDRAWAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Minus className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Withdrawal
          </span>
        );
      case 'DISBURSEMENT_REVERSAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <RefreshCw className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            Fee Reversal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mother ISP Account &amp; Ledger</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your Mother ISP balance, portal payments credited, cycle fee obligations, top-ups, and withdrawals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenTopup}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Top Up Balance</span>
          </button>
          <button
            onClick={handleOpenWithdraw}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Minus className="w-4 h-4" />
            <span>Withdraw Money</span>
          </button>
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mother ISP Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">My Mother ISP Balance</span>
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className={`text-2xl font-extrabold mt-2 ${motherIspBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            ৳{motherIspBalance.toFixed(2)}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Current balance in Mother ISP account
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={handleOpenTopup}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              + Top-up
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={handleOpenWithdraw}
              className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Total Disbursement Obligations */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cycle Fee Deductions</span>
            <DollarSign className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">৳{totalDisbursed.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Total Mother ISP fee for renewed cycles</p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            {payouts.length} subscriber cycles renewed
          </div>
        </div>

        {/* Ledger Transactions Count */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account Transactions</span>
            <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-2">{transactions.length}</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Total recorded ledger entries</p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            Includes portal, fees, topups &amp; withdrawals
          </div>
        </div>

        {/* Contractual Share Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mother ISP Share Rate</span>
            <Network className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {reseller?.motherIspDisbursementPercentage ? Number(reseller.motherIspDisbursementPercentage).toFixed(1) : '49.0'}%
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Deducted per subscriber monthly cycle</p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            Reseller keeps remaining share
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ledger'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Account Ledger ({transactions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('disbursements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'disbursements'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Subscriber Cycle Deductions ({payouts.length})</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'ledger'
                ? "Search ledger by subscriber, notes, transaction reference..."
                : "Search disbursements by subscriber, code, or payout reference..."
            }
            className="w-full text-xs text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
        </div>

        {activeTab === 'ledger' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="CUSTOMER_PORTAL_PAYMENT">Customer Portal Payments</option>
              <option value="CYCLE_DISBURSEMENT">Cycle Fee Deductions</option>
              <option value="RESELLER_TOPUP">Reseller Top-ups</option>
              <option value="RESELLER_WITHDRAWAL">Withdrawals</option>
              <option value="DISBURSEMENT_REVERSAL">Fee Reversals</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab Content: Account Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Date &amp; Ref</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Subscriber / Note</th>
                  <th className="py-3 px-4">Channel / Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Mother ISP Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 dark:text-slate-500">
                      Loading account ledger...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No account transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isCredit = Number(tx.amount || 0) >= 0;
                    return (
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
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                            {tx.transactionRef || `TX-#${tx.id}`}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getTransactionTypeBadge(tx.transactionType)}
                        </td>

                        <td className="py-3.5 px-4">
                          {tx.subscriberName ? (
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {tx.subscriberName}
                              </span>
                              <span className="ml-1 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                                ({tx.subscriberCode})
                              </span>
                            </div>
                          ) : null}
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {tx.notes || '—'}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono text-[10px] font-semibold">
                            {tx.paymentMethod || 'SYSTEM'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-sm whitespace-nowrap">
                          <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                            {isCredit ? '+' : ''}৳{Math.abs(Number(tx.amount || 0)).toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-semibold font-mono text-xs text-slate-900 dark:text-slate-200 whitespace-nowrap">
                          ৳{Number(tx.balanceAfter || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Subscriber Cycle Deductions */}
      {activeTab === 'disbursements' && (
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
                  <th className="py-3 px-4 text-right">Deducted Mother ISP Fee</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500">
                      Loading payout records...
                    </td>
                  </tr>
                ) : filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No mother ISP cycle payouts recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((item) => (
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
      )}

      {/* Top-Up Modal */}
      <Modal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        title="Top Up Mother ISP Account Balance"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleTopupSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record funds you paid directly to Mother ISP (via bank transfer, cash, or mobile financial service). This amount will be added to your Mother ISP account balance only.
          </p>

          {actionError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Top-up Amount (৳) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">৳</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="5000.00"
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="BKASH">bKash</option>
              <option value="NAGAD">Nagad</option>
              <option value="CASH">Cash Deposit</option>
              <option value="OTHER">Other Method</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Transaction / Reference ID (Optional)
            </label>
            <input
              type="text"
              value={formData.transactionRef}
              onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
              placeholder="e.g. TR-892174 or Bank Slip #"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Remarks (Optional)
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Advance deposit for upcoming month"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsTopupModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition shadow-sm"
            >
              {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{submitting ? 'Crediting...' : 'Credit Balance'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw from Mother ISP Account"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record earnings or funds withdrawn from your Mother ISP balance to your personal bank account or cash. This will be deducted from your Mother ISP balance only.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Current Balance:</span>
            <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ৳{motherIspBalance.toFixed(2)}
            </span>
          </div>

          {actionError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Withdrawal Amount (৳) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">৳</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="2000.00"
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Received Via *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="BKASH">bKash</option>
              <option value="NAGAD">Nagad</option>
              <option value="CASH">Cash Withdrawal</option>
              <option value="OTHER">Other Method</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Transaction / Voucher Reference (Optional)
            </label>
            <input
              type="text"
              value={formData.transactionRef}
              onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
              placeholder="e.g. WTH-40192 or Cheque #"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Remarks (Optional)
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Profit share payout for current quarter"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsWithdrawModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl transition shadow-sm"
            >
              {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Minus className="w-3.5 h-3.5" />}
              <span>{submitting ? 'Recording...' : 'Record Withdrawal'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
