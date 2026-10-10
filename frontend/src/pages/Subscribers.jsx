import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Users,
  Plus,
  Wallet,
  Calendar,
  CreditCard,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  History,
  Phone,
  Mail,
  MapPin,
  Tag
} from 'lucide-react';

export default function Subscribers({ onTriggerCycle }) {
  const { activeWorkspaceId } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [subLedger, setSubLedger] = useState([]);

  // Add Subscriber Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    packageId: '',
    joinDate: new Date().toISOString().split('T')[0],
    initialDeposit: '',
    motherIspRateOverride: '',
    pppoeUsername: '',
    pppoePassword: '',
    notes: ''
  });

  // Deposit Form
  const [depositData, setDepositData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    transactionReference: '',
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [subs, pkgs] = await Promise.all([
        apiClient.get('/subscribers'),
        apiClient.get('/packages')
      ]);
      setSubscribers(subs || []);
      setPackages(pkgs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspaceId]);

  const handleCreateSubscriber = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/subscribers', {
        ...formData,
        packageId: Number(formData.packageId),
        initialDeposit: formData.initialDeposit ? Number(formData.initialDeposit) : 0,
        motherIspRateOverride: formData.motherIspRateOverride ? Number(formData.motherIspRateOverride) : null
      });
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        packageId: '',
        joinDate: new Date().toISOString().split('T')[0],
        initialDeposit: '',
        motherIspRateOverride: '',
        pppoeUsername: '',
        pppoePassword: '',
        notes: ''
      });
      loadData();
      if (onTriggerCycle) onTriggerCycle();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenDeposit = (sub) => {
    setSelectedSub(sub);
    setDepositData({
      amount: '',
      paymentMethod: 'CASH',
      transactionReference: '',
      notes: ''
    });
    setIsDepositModalOpen(true);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/subscribers/${selectedSub.id}/wallet/deposit`, {
        ...depositData,
        amount: Number(depositData.amount)
      });
      setIsDepositModalOpen(false);
      loadData();
      if (onTriggerCycle) onTriggerCycle();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenLedger = async (sub) => {
    setSelectedSub(sub);
    setIsLedgerModalOpen(true);
    try {
      const data = await apiClient.get(`/subscribers/${sub.id}/wallet/transactions`);
      setSubLedger(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSubs = subscribers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search) ||
    s.subscriberCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Subscribers &amp; Wallets</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Billing cycles start on subscriber join anniversary date. Track customer advance vs delayed payments.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Subscriber</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subscriber name, phone, or subscriber ID..."
          className="w-full text-xs text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Plan &amp; Speed</th>
                <th className="py-3 px-4">Join Date &amp; Cycle Day</th>
                <th className="py-3 px-4">Next Renewal</th>
                <th className="py-3 px-4">Mother ISP Fee</th>
                <th className="py-3 px-4 text-right">Wallet Balance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500">Loading subscribers...</td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500">No subscribers found.</td>
                </tr>
              ) : (
                filteredSubs.map((sub) => {
                  const balance = Number(sub.walletBalance || 0);
                  const isAdvance = balance > 0;
                  const isDue = balance < 0;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-base">{sub.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 mt-1">
                          <Tag className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.subscriberCode}</span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span>{sub.phone}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{sub.packageName}</div>
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                          ৳{sub.packagePrice} / mo ({sub.packageSpeed} Mbps)
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-slate-900 dark:text-slate-200 font-semibold text-sm">{sub.joinDate}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Cycle day: <span className="font-bold text-indigo-600 dark:text-indigo-400">{sub.billingCycleDay}th</span> of month
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-slate-900 dark:text-slate-200 font-semibold text-sm">{sub.nextBillingDate}</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Active Cycle</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-rose-600 dark:text-rose-400 text-sm">৳{Number(sub.motherIspMonthlyPayout || 0).toFixed(2)}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">({sub.effectiveMotherIspRate}%)</div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className={`font-extrabold text-base ${
                          isAdvance ? 'text-emerald-600 dark:text-emerald-400' : isDue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {balance >= 0 ? `৳${balance.toFixed(2)}` : `-৳${Math.abs(balance).toFixed(2)}`}
                        </div>
                        <div className="text-xs font-semibold mt-1">
                          {isAdvance && <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">Advance Paid</span>}
                          {isDue && <span className="text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">Delayed / Due</span>}
                          {balance === 0 && <span className="text-slate-500 dark:text-slate-400">Settled (0.00)</span>}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenDeposit(sub)}
                            title="Collect payment / deposit into wallet"
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold rounded-lg flex items-center gap-1.5 transition text-xs shadow-sm"
                          >
                            <Wallet className="w-4 h-4" />
                            <span>Deposit</span>
                          </button>

                          <button
                            onClick={() => handleOpenLedger(sub)}
                            title="View wallet transaction history"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subscriber Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Subscriber"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubscriber} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subscriber Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Asif Mahmud"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="+88017..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="subscriber@email.com"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Internet Package *</label>
              <select
                required
                value={formData.packageId}
                onChange={e => setFormData({ ...formData, packageId: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Package</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ৳{p.monthlyPrice}/mo ({p.speedMbps} Mbps)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Join Date (Billing Cycle Start) *
              </label>
              <input
                type="date"
                required
                value={formData.joinDate}
                onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Billing cycle will renew every month on this date.
              </p>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Advance Deposit (৳)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.initialDeposit}
                onChange={e => setFormData({ ...formData, initialDeposit: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 1000.00"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Amount subscriber pays upfront into their wallet.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PPPoE Username</label>
              <input
                type="text"
                value={formData.pppoeUsername}
                onChange={e => setFormData({ ...formData, pppoeUsername: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="user_username"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Custom Mother ISP Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.motherIspRateOverride}
                onChange={e => setFormData({ ...formData, motherIspRateOverride: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="Leave blank for workspace default %"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Physical Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="Building, Road, Area"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Save Subscriber &amp; Start Cycle
            </button>
          </div>
        </form>
      </Modal>

      {/* Wallet Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title={`Wallet Payment Deposit: ${selectedSub?.name}`}
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Current Wallet Balance:</span>
              <span className={`font-bold ${
                Number(selectedSub?.walletBalance || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                ৳{Number(selectedSub?.walletBalance || 0).toFixed(2)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Monthly Package Fee: ৳{selectedSub?.packagePrice}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deposit Amount (৳) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={depositData.amount}
              onChange={e => setDepositData({ ...depositData, amount: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={depositData.paymentMethod}
                onChange={e => setDepositData({ ...depositData, paymentMethod: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="CASH">Cash in Hand</option>
                <option value="BKASH">bKash Personal / Merchant</option>
                <option value="NAGAD">Nagad</option>
                <option value="ROCKET">Rocket</option>
                <option value="BANK_TRANSFER">Bank Wire / Transfer</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transaction Ref / TrxID</label>
              <input
                type="text"
                value={depositData.transactionReference}
                onChange={e => setDepositData({ ...depositData, transactionReference: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="e.g. 9J21KA991"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Description</label>
            <input
              type="text"
              value={depositData.notes}
              onChange={e => setDepositData({ ...depositData, notes: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Advance payment for 2 months"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              Credit Wallet
            </button>
          </div>
        </form>
      </Modal>

      {/* Ledger History Modal */}
      <Modal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        title={`Wallet Ledger History: ${selectedSub?.name}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">{selectedSub?.name}</span> ({selectedSub?.subscriberCode})
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Plan: {selectedSub?.packageName}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Current Balance</span>
              <div className="font-bold text-base text-slate-900 dark:text-white">৳{Number(selectedSub?.walletBalance || 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Balance After</th>
                  <th className="py-2 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subLedger.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400 dark:text-slate-500">No transactions yet</td>
                  </tr>
                ) : (
                  subLedger.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {tx.transactionDate?.replace('T', ' ').substring(0, 16)}
                      </td>
                      <td className="py-2 px-3 font-semibold">
                        {tx.transactionType === 'DEPOSIT' ? (
                          <span className="text-emerald-600 dark:text-emerald-400">DEPOSIT</span>
                        ) : tx.transactionType === 'MONTHLY_PACKAGE_DEDUCTION' ? (
                          <span className="text-rose-600 dark:text-rose-400">FEE DEDUCTION</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">{tx.transactionType}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-200">
                        {tx.transactionType === 'DEPOSIT' ? `+৳${tx.amount}` : `-৳${tx.amount}`}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-300">
                        ৳{tx.balanceAfter}
                      </td>
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {tx.notes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
