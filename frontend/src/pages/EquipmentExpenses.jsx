import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { Boxes, Plus, Search, Tag, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function EquipmentExpenses() {
  const { activeWorkspaceId } = useAuth();
  const [equipments, setEquipments] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    itemType: 'ROUTER',
    serialNumber: '',
    purchaseCost: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    subscriberId: '',
    billedToSubscriber: false,
    customerBilledAmount: '',
    customerPaidAmount: '',
    status: 'IN_STOCK',
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [eqs, subs] = await Promise.all([
        apiClient.get('/equipment'),
        apiClient.get('/subscribers')
      ]);
      setEquipments(eqs || []);
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
      await apiClient.post('/equipment', {
        ...formData,
        purchaseCost: Number(formData.purchaseCost),
        subscriberId: formData.subscriberId ? Number(formData.subscriberId) : null,
        customerBilledAmount: formData.customerBilledAmount ? Number(formData.customerBilledAmount) : 0,
        customerPaidAmount: formData.customerPaidAmount ? Number(formData.customerPaidAmount) : 0,
      });
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        itemType: 'ROUTER',
        serialNumber: '',
        purchaseCost: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        subscriberId: '',
        billedToSubscriber: false,
        customerBilledAmount: '',
        customerPaidAmount: '',
        status: 'IN_STOCK',
        notes: ''
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPurchaseCost = equipments.reduce((sum, e) => sum + (Number(e.purchaseCost) || 0), 0);
  const totalCustomerRecovered = equipments.reduce((sum, e) => sum + (Number(e.customerPaidAmount) || 0), 0);

  const filtered = equipments.filter(e =>
    (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.serialNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.subscriberName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Equipment &amp; Hardware Expenses</h2>
          <p className="text-xs text-slate-500 mt-1">
            Expense #2: Routers, ONUs, fiber patch cords and components. Track customer billing vs absorbed installation costs.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Equipment Purchase</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Equipment Purchase Cost</span>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-2">৳{totalPurchaseCost.toFixed(2)}</h3>
          <p className="text-xs text-slate-400 mt-1">Total reseller expenditure</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Collected from Subscribers</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">৳{totalCustomerRecovered.toFixed(2)}</h3>
          <p className="text-xs text-slate-400 mt-1">When billed directly to client</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Absorbed / Net Hardware Cost</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">৳{Math.max(0, totalPurchaseCost - totalCustomerRecovered).toFixed(2)}</h3>
          <p className="text-xs text-slate-400 mt-1">Free installations &amp; company assets</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by equipment name, serial number, or subscriber..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Equipment &amp; Serial</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Purchase Date</th>
                <th className="py-3 px-4 font-bold text-rose-600">Reseller Expense</th>
                <th className="py-3 px-4">Deployed To</th>
                <th className="py-3 px-4">Subscriber Billed?</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">Loading equipment...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">No equipment recorded yet.</td>
                </tr>
              ) : (
                filtered.map(eq => (
                  <tr key={eq.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {eq.name}
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        S/N: {eq.serialNumber || 'N/A'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                        {eq.itemType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {eq.purchaseDate}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-rose-600 text-sm">
                      ৳{Number(eq.purchaseCost || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      {eq.subscriberName ? (
                        <div>
                          <div className="font-semibold text-slate-900">{eq.subscriberName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{eq.subscriberCode}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">In Stock / Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {eq.billedToSubscriber ? (
                        <div>
                          <span className="text-blue-700 font-semibold">Billed: ৳{eq.customerBilledAmount}</span>
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Paid: ৳{eq.customerPaidAmount} ({eq.paymentStatus})
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                          Absorbed by Reseller
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        eq.status === 'DEPLOYED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : eq.status === 'IN_STOCK'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {eq.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Equipment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Equipment Purchase (Reseller Expense #2)"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Equipment / Item Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. TP-Link Archer C6"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Item Category *</label>
              <select
                value={formData.itemType}
                onChange={e => setFormData({ ...formData, itemType: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="ROUTER">Wi-Fi Router</option>
                <option value="ONU">GPON / EPON ONU</option>
                <option value="OPTICAL_FIBER">Fiber Drop Cable</option>
                <option value="CONNECTOR">Fast Connectors / Patch Cord</option>
                <option value="MEDIA_CONVERTER">Media Converter</option>
                <option value="OTHER">Other Electrical Component</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Serial Number / Asset Tag</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="e.g. TPL-98124"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Date *</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-rose-600 mb-1">Reseller Purchase Cost (৳ Expense) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.purchaseCost}
              onChange={e => setFormData({ ...formData, purchaseCost: e.target.value })}
              className="w-full border border-rose-300 bg-rose-50/30 rounded-lg px-3 py-2 text-sm font-bold text-rose-900 focus:ring-2 focus:ring-rose-500"
              placeholder="e.g. 2400.00"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h5 className="font-semibold text-slate-800">Subscriber Deployment &amp; Recovery Option</h5>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Assign to Subscriber (Optional)</label>
              <select
                value={formData.subscriberId}
                onChange={e => setFormData({ ...formData, subscriberId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Keep in Stock (Unassigned)</option>
                {subscribers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.subscriberCode})</option>
                ))}
              </select>
            </div>

            {formData.subscriberId && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="billedCheck"
                    checked={formData.billedToSubscriber}
                    onChange={e => setFormData({ ...formData, billedToSubscriber: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="billedCheck" className="font-medium text-slate-700">
                    Bill this component to subscriber (otherwise reseller absorbs cost)
                  </label>
                </div>

                {formData.billedToSubscriber && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Customer Billed Amount (৳)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.customerBilledAmount}
                        onChange={e => setFormData({ ...formData, customerBilledAmount: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 2800.00"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Customer Paid Right Now (৳)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.customerPaidAmount}
                        onChange={e => setFormData({ ...formData, customerPaidAmount: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave 0 if due"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
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
              Record Equipment Purchase
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
