import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Settings, Save, CheckCircle2, Network, Building2 } from 'lucide-react';

export default function WorkspaceSettings({ onUpdate }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiClient.get('/workspace/current')
      .then(data => {
        setWorkspace(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const updated = await apiClient.put('/workspace/settings', {
        ...workspace,
        motherIspDisbursementPercentage: Number(workspace.motherIspDisbursementPercentage)
      });
      setWorkspace(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Workspace &amp; ISP Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure Mother ISP commercial terms, disbursement percentage rate, and company contact details.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Workspace settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 text-xs">
        <div className="border-b border-slate-100 pb-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Company Profile</span>
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Reseller Name</label>
            <input
              type="text"
              required
              value={workspace?.name || ''}
              onChange={e => setWorkspace({ ...workspace, name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Workspace Code</label>
            <input
              type="text"
              disabled
              value={workspace?.code || ''}
              className="w-full border border-slate-200 bg-slate-50 text-slate-400 font-mono rounded-lg px-3 py-2 text-xs cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
            <input
              type="text"
              value={workspace?.contactPerson || ''}
              onChange={e => setWorkspace({ ...workspace, contactPerson: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={workspace?.phone || ''}
              onChange={e => setWorkspace({ ...workspace, phone: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
            <Network className="w-4 h-4 text-indigo-600" />
            <span>Mother ISP Contract &amp; Percentage Sharing</span>
          </h4>
          <p className="text-[11px] text-slate-500 mb-4">
            Defines the percentage disbursed to Mother ISP when a subscriber billing cycle renews.
          </p>

          <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mother ISP Provider</label>
              <input
                type="text"
                value={workspace?.motherIspName || ''}
                onChange={e => setWorkspace({ ...workspace, motherIspName: e.target.value })}
                className="w-full border border-indigo-200 bg-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-rose-600 mb-1">Mother ISP Disbursement (%)</label>
              <input
                type="number"
                step="0.01"
                required
                value={workspace?.motherIspDisbursementPercentage || ''}
                onChange={e => setWorkspace({ ...workspace, motherIspDisbursementPercentage: e.target.value })}
                className="w-full border border-rose-300 bg-white rounded-lg px-3 py-2 text-sm font-bold text-rose-900 focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                You retain {(100 - Number(workspace?.motherIspDisbursementPercentage || 49)).toFixed(2)}% of subscriber package price.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Workspace Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
