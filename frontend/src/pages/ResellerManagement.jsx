import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { Building2, Plus, Users, Network, ShieldCheck, CheckCircle2, Search } from 'lucide-react';

export default function ResellerManagement() {
  const { switchWorkspace } = useAuth();
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    motherIspName: 'Mother ISP Grid',
    motherIspDisbursementPercentage: '49.00',
    adminUsername: '',
    adminPassword: '',
    adminFullName: ''
  });

  const loadResellers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/resellers');
      setResellers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResellers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/resellers', {
        ...formData,
        motherIspDisbursementPercentage: Number(formData.motherIspDisbursementPercentage)
      });
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        code: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        motherIspName: 'Mother ISP Grid',
        motherIspDisbursementPercentage: '49.00',
        adminUsername: '',
        adminPassword: '',
        adminFullName: ''
      });
      loadResellers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = resellers.filter(r =>
    (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.contactPerson || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">SaaS Reseller Tenant Workspaces</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and provision unlimited ISP reseller workspaces. Configure customized Mother ISP disbursement percentages.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Reseller Workspace</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reseller name, slug code, or contact person..."
          className="w-full text-xs text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400 dark:text-slate-500 text-xs">Loading resellers...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-400 dark:text-slate-500 text-xs">No resellers found.</div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <Building2 className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {r.code}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {r.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{r.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.contactPerson} • {r.phone}</p>

                {/* Configuration Specs */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Mother ISP Partner:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{r.motherIspName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Mother ISP Payout:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{r.motherIspDisbursementPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Reseller Retained:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{(100 - Number(r.motherIspDisbursementPercentage)).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Active Subscribers:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{r.subscriberCount} Subscribers</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => switchWorkspace(String(r.id))}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Enter Workspace
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New SaaS Reseller Tenant"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Reseller Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. SpeedNet Broadband"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Workspace Code / Slug *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="e.g. speednet"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mother ISP Provider Name</label>
              <input
                type="text"
                value={formData.motherIspName}
                onChange={e => setFormData({ ...formData, motherIspName: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Level3 Telecom"
              />
            </div>
            <div>
              <label className="block font-semibold text-rose-600 dark:text-rose-400 mb-1">Mother ISP Disbursement (%) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.motherIspDisbursementPercentage}
                onChange={e => setFormData({ ...formData, motherIspDisbursementPercentage: e.target.value })}
                className="w-full border border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20 rounded-lg px-3 py-2 text-xs font-bold text-rose-800 dark:text-rose-300 focus:ring-2 focus:ring-rose-500"
                placeholder="49.00"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                E.g. 49% paid to Mother ISP, reseller retains 51%.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="Manager name"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="+8801..."
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="font-semibold text-slate-800 dark:text-slate-200">Workspace Administrator Account</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Admin Username *</label>
                <input
                  type="text"
                  required
                  value={formData.adminUsername}
                  onChange={e => setFormData({ ...formData, adminUsername: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                  placeholder="admin_speednet"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Admin Password *</label>
                <input
                  type="password"
                  required
                  value={formData.adminPassword}
                  onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Create Workspace &amp; Provision
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
