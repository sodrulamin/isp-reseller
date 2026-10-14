import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { Package, Plus, Zap, CheckCircle2, Edit2 } from 'lucide-react';

export default function Packages() {
  const { activeWorkspaceId } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    speedMbps: '',
    monthlyPrice: '',
    description: '',
    active: true
  });

  const [editFormData, setEditFormData] = useState({
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

  const handleOpenEdit = (pkg) => {
    setEditingPackageId(pkg.id);
    setEditFormData({
      name: pkg.name || '',
      speedMbps: pkg.speedMbps != null ? String(pkg.speedMbps) : '',
      monthlyPrice: pkg.monthlyPrice != null ? String(pkg.monthlyPrice) : '',
      description: pkg.description || '',
      active: pkg.active ?? true
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/packages/${editingPackageId}`, {
        ...editFormData,
        speedMbps: Number(editFormData.speedMbps),
        monthlyPrice: Number(editFormData.monthlyPrice)
      });
      setIsEditModalOpen(false);
      setEditingPackageId(null);
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Internet Packages</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
          <div className="col-span-3 py-12 text-center text-slate-400 dark:text-slate-500 text-xs">Loading packages...</div>
        ) : packages.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-400 dark:text-slate-500 text-xs">No packages configured.</div>
        ) : (
          packages.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Zap className="w-5 h-5" />
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    p.active
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <div className="mt-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  ৳{p.monthlyPrice} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/ month</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Speed:</span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 font-mono">{p.speedMbps} Mbps</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  {p.description || 'Dedicated fiber optical bandwidth with low latency.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Package</span>
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
        title="Add Internet Package"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Package Plan Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Turbo 50 Mbps Home"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Speed (Mbps) *</label>
              <input
                type="number"
                required
                value={formData.speedMbps}
                onChange={e => setFormData({ ...formData, speedMbps: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Fee (৳) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.monthlyPrice}
                onChange={e => setFormData({ ...formData, monthlyPrice: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="1200.00"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="Package features, FUP details, etc."
            />
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
              Save Package
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPackageId(null);
        }}
        title="Edit Internet Package"
      >
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Package Plan Name *</label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Turbo 50 Mbps Home"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Speed (Mbps) *</label>
              <input
                type="number"
                required
                value={editFormData.speedMbps}
                onChange={e => setEditFormData({ ...editFormData, speedMbps: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Fee (৳) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={editFormData.monthlyPrice}
                onChange={e => setEditFormData({ ...editFormData, monthlyPrice: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="1200.00"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows="2"
              value={editFormData.description}
              onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="Package features, FUP details, etc."
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="edit-active-status"
              checked={editFormData.active}
              onChange={e => setEditFormData({ ...editFormData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
            />
            <label htmlFor="edit-active-status" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Active Plan (available for subscribers)
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPackageId(null);
              }}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Update Package
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
