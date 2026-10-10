import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { Wrench, Plus, Search, CheckCircle2, Clock, AlertTriangle, User } from 'lucide-react';

export default function ServiceTickets() {
  const { activeWorkspaceId } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [formData, setFormData] = useState({
    subscriberId: '',
    issueType: 'FIBER_CUT',
    description: '',
    technicianName: '',
    operationalCost: '',
    status: 'OPEN',
    resolutionNotes: ''
  });

  const [resolveData, setResolveData] = useState({
    operationalCost: '',
    status: 'RESOLVED',
    resolutionNotes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [tcks, subs] = await Promise.all([
        apiClient.get('/service-tickets'),
        apiClient.get('/subscribers')
      ]);
      setTickets(tcks || []);
      setSubscribers(subs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspaceId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/service-tickets', {
        ...formData,
        subscriberId: Number(formData.subscriberId),
        operationalCost: formData.operationalCost ? Number(formData.operationalCost) : 0,
      });
      setIsAddModalOpen(false);
      setFormData({
        subscriberId: '',
        issueType: 'FIBER_CUT',
        description: '',
        technicianName: '',
        operationalCost: '',
        status: 'OPEN',
        resolutionNotes: ''
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenResolve = (t) => {
    setSelectedTicket(t);
    setResolveData({
      operationalCost: t.operationalCost || '',
      status: 'RESOLVED',
      resolutionNotes: t.resolutionNotes || ''
    });
    setIsResolveModalOpen(true);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/service-tickets/${selectedTicket.id}`, {
        subscriberId: selectedTicket.subscriberId,
        issueType: selectedTicket.issueType,
        description: selectedTicket.description,
        technicianName: selectedTicket.technicianName,
        operationalCost: Number(resolveData.operationalCost || 0),
        status: resolveData.status,
        resolutionNotes: resolveData.resolutionNotes
      });
      setIsResolveModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalServiceExpense = tickets.reduce((sum, t) => sum + (Number(t.operationalCost) || 0), 0);

  const filtered = tickets.filter(t =>
    (t.ticketNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.subscriberName || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.issueType || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.technicianName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Physical Service Issues &amp; Maintenance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Expense #3: Technician transportation, splicing consumables, and operational labor costs when physical faults are reported.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Report Physical Service Issue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Physical Service Expenses</span>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-2">৳{totalServiceExpense.toFixed(2)}</h3>
          <p className="text-xs text-slate-400 mt-1">Operational repair &amp; technician costs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Reported Tickets</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{tickets.length}</h3>
          <p className="text-xs text-slate-400 mt-1">Customer complaint visits</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolved Rate</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">
            {tickets.length > 0 ? ((tickets.filter(t => t.status === 'RESOLVED').length / tickets.length) * 100).toFixed(0) : 100}%
          </h3>
          <p className="text-xs text-slate-400 mt-1">{tickets.filter(t => t.status === 'RESOLVED').length} resolved issues</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ticket number, subscriber, or issue type..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4 font-bold text-rose-600">Operational Cost</th>
                <th className="py-3 px-4">Reported Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">Loading service tickets...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">No service tickets recorded yet.</td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {t.ticketNumber}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {t.subscriberName}
                      <div className="text-[10px] text-slate-400 font-mono">{t.subscriberCode}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                        {t.issueType}
                      </span>
                      <p className="text-slate-600 mt-1 line-clamp-2">{t.description}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {t.technicianName || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-rose-600 text-sm">
                      ৳{Number(t.operationalCost || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                      {t.reportedDate?.replace('T', ' ').substring(0, 16)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenResolve(t)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 font-semibold rounded text-[11px] text-slate-700 transition"
                      >
                        Update / Cost
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Ticket Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Report Physical Service Fault (Reseller Expense #3)"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subscriber *</label>
            <select
              required
              value={formData.subscriberId}
              onChange={e => setFormData({ ...formData, subscriberId: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subscriber</option>
              {subscribers.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.subscriberCode}) - {s.phone}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category *</label>
              <select
                value={formData.issueType}
                onChange={e => setFormData({ ...formData, issueType: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="FIBER_CUT">Fiber Cut / Physical Joint Break</option>
                <option value="LOS_RED_LIGHT">Red Light LOS (Loss of Signal)</option>
                <option value="SLOW_SPEED">High Latency / Slow Speed</option>
                <option value="ROUTER_CONFIG">Router Config / Wi-Fi Reset</option>
                <option value="WIRE_RELOCATION">Wire Shift / Relocation</option>
                <option value="SPLICING">Optical Core Re-splicing</option>
                <option value="HARDWARE_ISSUE">Power Adapter / Port Defect</option>
                <option value="OTHER">Other Operational Issue</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Technician</label>
              <input
                type="text"
                value={formData.technicianName}
                onChange={e => setFormData({ ...formData, technicianName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="Technician name"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Problem Description *</label>
            <textarea
              required
              rows="3"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what occurred, location of fault, etc."
            />
          </div>

          <div>
            <label className="block font-semibold text-rose-600 mb-1">Operational Cost (৳ Reseller Expense)</label>
            <input
              type="number"
              step="0.01"
              value={formData.operationalCost}
              onChange={e => setFormData({ ...formData, operationalCost: e.target.value })}
              className="w-full border border-rose-300 bg-rose-50/30 rounded-lg px-3 py-2 text-sm font-bold text-rose-900 focus:ring-2 focus:ring-rose-500"
              placeholder="e.g. 350.00 (transport, materials, splicing honorarium)"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Log Issue Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Resolve / Update Cost Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title={`Update Service Ticket: ${selectedTicket?.ticketNumber}`}
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={resolveData.status}
              onChange={e => setResolveData({ ...resolveData, status: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-rose-600 mb-1">Operational Cost (৳ Incurred Expense)</label>
            <input
              type="number"
              step="0.01"
              value={resolveData.operationalCost}
              onChange={e => setResolveData({ ...resolveData, operationalCost: e.target.value })}
              className="w-full border border-rose-300 bg-rose-50/30 rounded-lg px-3 py-2 text-sm font-bold text-rose-900 focus:ring-2 focus:ring-rose-500"
              placeholder="Total expense to solve issue"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resolution &amp; Maintenance Notes</label>
            <textarea
              rows="3"
              value={resolveData.resolutionNotes}
              onChange={e => setResolveData({ ...resolveData, resolutionNotes: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Spliced loose fiber joint at pillar box. Optical power restored to -18dBm."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsResolveModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              Update Ticket &amp; Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
