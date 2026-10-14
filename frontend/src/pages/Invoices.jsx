import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Receipt,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Wallet,
  CreditCard,
  Tag,
  ArrowRight,
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function Invoices({ onTriggerCycle }) {
  const { activeWorkspaceId } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Approve Due Bill Modal
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [approveData, setApproveData] = useState({
    amount: '',
    paymentChannel: 'DIRECT_RESELLER',
    paymentMethod: 'CASH',
    transactionReference: '',
    notes: ''
  });

  // Reject Due Invoice Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRejectInvoice, setSelectedRejectInvoice] = useState(null);
  const [rejectReason, setRejectReason] = useState('Customer disconnected / Line inactive');

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/billing/invoices');
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [activeWorkspaceId]);

  const handleOpenApprove = (inv) => {
    setSelectedInvoice(inv);
    const due = Number(inv.dueAmount || 0);
    setApproveData({
      amount: String(due > 0 ? due : 0),
      paymentChannel: 'DIRECT_RESELLER',
      paymentMethod: 'CASH',
      transactionReference: '',
      notes: `Approval & Mother ISP disbursement for ${inv.invoiceNumber}`
    });
    setIsApproveModalOpen(true);
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/billing/invoices/${selectedInvoice.id}/approve`, {
        ...approveData,
        amount: Number(approveData.amount)
      });
      setIsApproveModalOpen(false);
      loadInvoices();
    } catch (err) {
      alert(err.message || 'Failed to approve due bill');
    }
  };

  const handleOpenReject = (inv) => {
    setSelectedRejectInvoice(inv);
    setRejectReason('Customer disconnected / Line inactive');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRejectInvoice) return;
    try {
      await apiClient.post(`/billing/invoices/${selectedRejectInvoice.id}/reject`, {
        reason: rejectReason
      });
      setIsRejectModalOpen(false);
      loadInvoices();
    } catch (err) {
      alert(err.message || 'Failed to reject due invoice');
    }
  };

  const handleDeleteInvoice = async (inv) => {
    const confirmMsg = `Delete invoice ${inv.invoiceNumber}?\n\nThis will undo the package fee deduction, revert any Mother ISP disbursement, and restore previous subscriber cycle calculations.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await apiClient.delete(`/billing/invoices/${inv.id}`);
      loadInvoices();
    } catch (err) {
      alert(err.message || 'Failed to delete invoice');
    }
  };

  const filtered = invoices.filter(inv =>
    (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (inv.subscriberName || '').toLowerCase().includes(search.toLowerCase()) ||
    (inv.subscriberCode || '').toLowerCase().includes(search.toLowerCase()) ||
    (inv.pppoeUsername || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Subscriber Billing Invoices</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated scheduler runs nightly at 1:00 AM (Asia/Dhaka). You can also run the cycle check manually at any time.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={async () => {
              if (confirm('Run billing cycle check now for all due subscribers in this workspace?')) {
                try {
                  const res = await apiClient.post('/billing/run-cycle');
                  alert(res.message + ` (${res.processedSubscribers || 0} subscriber(s) processed)`);
                  loadInvoices();
                  if (onTriggerCycle) onTriggerCycle();
                } catch (err) {
                  alert('Failed to run billing cycle: ' + err.message);
                }
              }
            }}
            title="Manually trigger scheduled billing cycle check now"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Run Cycle Now</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by invoice number, subscriber name, subscriber ID, or PPPoE username..."
          className="w-full text-xs text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4 font-bold">Due Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Mother ISP</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400 dark:text-slate-500">Loading invoices...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400 dark:text-slate-500">No invoices found.</td>
                </tr>
              ) : (
                filtered.map(inv => {
                  const hasDue = Number(inv.dueAmount || 0) > 0;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="text-sm">{inv.subscriberName}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{inv.subscriberCode}</span>
                          {inv.pppoeUsername && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 dark:text-blue-400 font-bold">{inv.pppoeUsername}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {inv.billingPeriodStart} to {inv.billingPeriodEnd}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {inv.dueDate}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        ৳{Number(inv.totalAmount || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                        ৳{Number(inv.paidAmount || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-400">
                        ৳{Number(inv.dueAmount || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : inv.status === 'PARTIAL'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : inv.status === 'REJECTED'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {inv.status === 'REJECTED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400">
                            Cancelled
                          </span>
                        ) : inv.motherIspDisbursed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Disbursed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Awaiting Approval
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {inv.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-semibold text-xs mr-1">
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Rejected</span>
                            </span>
                          ) : !inv.motherIspDisbursed || hasDue ? (
                            <>
                              <button
                                onClick={() => handleOpenApprove(inv)}
                                title={hasDue ? "Approve and settle customer due with Mother ISP disbursement" : "Approve and disburse to Mother ISP"}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 transition text-xs shadow-sm whitespace-nowrap"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{hasDue ? "Approve" : "Approve & Disburse"}</span>
                              </button>
                              {hasDue && (
                                <button
                                  onClick={() => handleOpenReject(inv)}
                                  title="Reject due invoice"
                                  className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold rounded-lg flex items-center gap-1 transition text-xs shadow-sm border border-rose-200 dark:border-rose-800"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mr-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Settled</span>
                            </span>
                          )}

                          <button
                            onClick={() => handleDeleteInvoice(inv)}
                            title="Delete invoice and undo related calculations"
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Approve Due Bill Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title={`Approve Due Bill: ${selectedInvoice?.invoiceNumber}`}
      >
        <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs">
          {/* Invoice Overview */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedInvoice?.subscriberName}</span>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                  ID: {selectedInvoice?.subscriberCode} {selectedInvoice?.pppoeUsername ? `• PPPoE: ${selectedInvoice.pppoeUsername}` : ''}
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold block">Outstanding Due</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-base">
                  ৳{Number(selectedInvoice?.dueAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>Period: {selectedInvoice?.billingPeriodStart} to {selectedInvoice?.billingPeriodEnd}</span>
              <span>Total Bill: ৳{Number(selectedInvoice?.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          {Number(selectedInvoice?.dueAmount || 0) <= 0 ? (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 rounded-xl text-blue-800 dark:text-blue-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>Advance Settlement Covered</span>
              </div>
              <p className="text-[11px]">
                This invoice was covered in full from the subscriber's advance wallet balance. Approving will disburse the Mother ISP share and confirm continuation of their line.
              </p>
            </div>
          ) : (
            <>
              {/* Payment Collection Channel */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Collected Through *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    approveData.paymentChannel === 'DIRECT_RESELLER'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentChannel"
                        value="DIRECT_RESELLER"
                        checked={approveData.paymentChannel === 'DIRECT_RESELLER'}
                        onChange={() => setApproveData({ ...approveData, paymentChannel: 'DIRECT_RESELLER', paymentMethod: 'CASH' })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-bold text-xs">Collected by Me</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
                      Direct Cash or MFS. Reseller collects and owes Mother ISP share.
                    </span>
                  </label>

                  <label className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    approveData.paymentChannel === 'MOTHER_ISP_PORTAL'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentChannel"
                        value="MOTHER_ISP_PORTAL"
                        checked={approveData.paymentChannel === 'MOTHER_ISP_PORTAL'}
                        onChange={() => setApproveData({ ...approveData, paymentChannel: 'MOTHER_ISP_PORTAL', paymentMethod: 'ONLINE_PORTAL' })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-bold text-xs">Mother ISP Portal</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
                      Customer paid Mother ISP portal directly. Mother ISP retains fee and credits your profit.
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Approve / Settle Amount (৳) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={approveData.amount}
                  onChange={e => setApproveData({ ...approveData, amount: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={approveData.paymentMethod}
                    onChange={e => setApproveData({ ...approveData, paymentMethod: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {approveData.paymentChannel === 'MOTHER_ISP_PORTAL' ? (
                      <>
                        <option value="ONLINE_PORTAL">Mother ISP Portal / Gateway</option>
                        <option value="BKASH">bKash (Mother ISP Portal)</option>
                        <option value="NAGAD">Nagad (Mother ISP Portal)</option>
                        <option value="BANK_TRANSFER">Bank (Mother ISP Portal)</option>
                      </>
                    ) : (
                      <>
                        <option value="CASH">Cash in Hand</option>
                        <option value="BKASH">bKash Personal / Merchant</option>
                        <option value="NAGAD">Nagad</option>
                        <option value="ROCKET">Rocket</option>
                        <option value="BANK_TRANSFER">Bank Wire / Transfer</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transaction Ref / TrxID</label>
                  <input
                    type="text"
                    value={approveData.transactionReference}
                    onChange={e => setApproveData({ ...approveData, transactionReference: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="e.g. TRX-98129"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Description</label>
            <input
              type="text"
              value={approveData.notes}
              onChange={e => setApproveData({ ...approveData, notes: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="Approval remarks"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsApproveModalOpen(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{Number(selectedInvoice?.dueAmount || 0) > 0 ? `Approve & Settle (৳${approveData.amount || '0.00'})` : 'Approve & Disburse to Mother ISP'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Due Invoice Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={`Reject Due Invoice: ${selectedRejectInvoice?.invoiceNumber}`}
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
          {/* Invoice Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedRejectInvoice?.subscriberName}</span>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                  ID: {selectedRejectInvoice?.subscriberCode} {selectedRejectInvoice?.pppoeUsername ? `• PPPoE: ${selectedRejectInvoice.pppoeUsername}` : ''}
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold block">Due Amount to Reject</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-base">
                  ৳{Number(selectedRejectInvoice?.dueAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>Period: {selectedRejectInvoice?.billingPeriodStart} to {selectedRejectInvoice?.billingPeriodEnd}</span>
              <span>Total Bill: ৳{Number(selectedRejectInvoice?.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 rounded-xl text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>Consequences of Rejecting:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
              <li>The outstanding due of ৳{Number(selectedRejectInvoice?.dueAmount || 0).toFixed(2)} will be cancelled.</li>
              <li>The subscriber wallet will be credited back the debited due amount.</li>
              <li>No disbursement to Mother ISP will be made.</li>
            </ul>
          </div>

          {/* Rejection Reason */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rejection Reason *
            </label>
            <div className="space-y-2">
              <select
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500"
              >
                <option value="Customer disconnected / Line inactive">Customer disconnected / Line inactive</option>
                <option value="Customer refused to pay renewal bill">Customer refused to pay renewal bill</option>
                <option value="Billed in error / Incorrect cycle">Billed in error / Incorrect cycle</option>
                <option value="Customer migrated / Account cancelled">Customer migrated / Account cancelled</option>
                <option value="Other">Other (specify below)</option>
              </select>
              <input
                type="text"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500"
                placeholder="Specify rejection details or reason..."
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Confirm Rejection</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
