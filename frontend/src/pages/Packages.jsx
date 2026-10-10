import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { Package, Plus, Zap, CheckCircle2 } from 'lucide-react';

export default function Packages() {
  const { activeWorkspaceId } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    speedMbps: '',
    monthlyPrice: '',
    description: '',
    active: true
  });

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/packages');
      setPackages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [activeWorkspaceId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/packages', {
        ...formData,
        speedMbps: Number(formData.speedMbps),
        monthlyPrice: Number(formData.monthlyPrice)
      });
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        speedMbps: '',
        monthlyPrice: '',
        description: '',
        active: true
      });
      loadPackages();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Internet Packages</h2>
          <p className="text-xs text-slate-500 mt-1">
            Bandwidth and speed tiers offered to your subscribers in this workspace.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Package Plan</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400 text-xs">Loading packages...</div>
        ) : packages.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-400 text-xs">No packages configured.</div>
        ) : (
          packages.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Zap className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                <div className="mt-2 text-2xl font-extrabold text-blue-600">
                  ৳{p.monthlyPrice} <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span>Speed:</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">{p.speedMbps} Mbps</span>
                </div>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  {p.description || 'Dedicated fiber optical bandwidth with low latency.'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Internet Package"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Package Plan Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Turbo 50 Mbps Home"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Speed (Mbps) *</label>
              <input
                type="number"
                required
                value={formData.speedMbps}
                onChange={e => setFormData({ ...formData, speedMbps: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Fee (৳) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.monthlyPrice}
                onChange={e => setFormData({ ...formData, monthlyPrice: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="1200.00"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="Package features, FUP details, etc."
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
              Save Package
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
