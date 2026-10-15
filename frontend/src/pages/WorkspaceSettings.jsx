import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Settings, Save, CheckCircle2, Network, Building2, KeyRound, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function WorkspaceSettings({ onUpdate }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password state
  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!pwdData.currentPassword) {
      setPwdError('Current password is required');
      return;
    }
    if (!pwdData.newPassword || pwdData.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters');
      return;
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdError('New password and confirmation do not match');
      return;
    }
    if (pwdData.currentPassword === pwdData.newPassword) {
      setPwdError('New password cannot be the same as your current password');
      return;
    }

    setPwdSaving(true);
    try {
      const res = await apiClient.post('/auth/change-password', pwdData);
      setPwdSuccess(res.message || 'Password updated successfully!');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdSuccess(''), 4000);
    } catch (err) {
      setPwdError(err.message || 'Failed to update password');
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Workspace &amp; ISP Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure Mother ISP commercial terms, disbursement percentage rate, and company contact details.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Workspace settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Company Profile</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Reseller Name</label>
            <input
              type="text"
              required
              value={workspace?.name || ''}
              onChange={e => setWorkspace({ ...workspace, name: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Workspace Code</label>
            <input
              type="text"
              disabled
              value={workspace?.code || ''}
              className="w-full border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-mono rounded-lg px-3 py-2 text-xs cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
            <input
              type="text"
              value={workspace?.contactPerson || ''}
              onChange={e => setWorkspace({ ...workspace, contactPerson: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
            <input
              type="text"
              value={workspace?.phone || ''}
              onChange={e => setWorkspace({ ...workspace, phone: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-3">
            <Network className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Mother ISP Contract &amp; Percentage Sharing</span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
            Defines the percentage disbursed to Mother ISP when a subscriber billing cycle renews.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mother ISP Provider</label>
              <input
                type="text"
                value={workspace?.motherIspName || ''}
                onChange={e => setWorkspace({ ...workspace, motherIspName: e.target.value })}
                className="w-full border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-rose-600 dark:text-rose-400 mb-1">Mother ISP Disbursement (%)</label>
              <input
                type="number"
                step="0.01"
                required
                value={workspace?.motherIspDisbursementPercentage || ''}
                onChange={e => setWorkspace({ ...workspace, motherIspDisbursementPercentage: e.target.value })}
                className="w-full border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm font-bold text-rose-900 dark:text-rose-300 focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                You retain {(100 - Number(workspace?.motherIspDisbursementPercentage || 49)).toFixed(2)}% of subscriber package price.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
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

      {/* Account Security & Password Change */}
      <form onSubmit={handlePasswordChange} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Account Security &amp; Password</span>
          </h4>
          <span className="text-[11px] text-slate-400">Logged in as <strong className="text-slate-700 dark:text-slate-200">{user?.username}</strong></span>
        </div>

        {pwdError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        {pwdSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={pwdData.currentPassword}
                onChange={e => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg pl-3 pr-9 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={6}
                value={pwdData.newPassword}
                onChange={e => setPwdData({ ...pwdData, newPassword: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg pl-3 pr-9 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={6}
                value={pwdData.confirmPassword}
                onChange={e => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                placeholder="Repeat new password"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg pl-3 pr-9 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={pwdSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{pwdSaving ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
