import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { ShieldCheck, Building2, UserCircle, LogOut, ChevronDown, RefreshCw } from 'lucide-react';

export default function Navbar({ onRunCycle, isRunningCycle }) {
  const { user, isSuperAdmin, logout, activeWorkspaceId, switchWorkspace } = useAuth();
  const [resellers, setResellers] = useState([]);

  useEffect(() => {
    if (isSuperAdmin) {
      apiClient.get('/resellers')
        .then(data => setResellers(data || []))
        .catch(err => console.error("Failed to load resellers for switch", err));
    }
  }, [isSuperAdmin]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            ISP
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">NetLedger SaaS</h1>
            <p className="text-xs text-slate-500">Reseller Financial &amp; Billing System</p>
          </div>
        </div>

        {/* Workspace Switcher / Badge */}
        <div className="ml-6 pl-6 border-l border-slate-200 flex items-center gap-2">
          {isSuperAdmin ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspace:</span>
              <select
                value={activeWorkspaceId}
                onChange={(e) => switchWorkspace(e.target.value)}
                className="text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Global Platform (All Workspaces)</option>
                {resellers.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code.toUpperCase()}) - {r.motherIspDisbursementPercentage}% Mother ISP
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{user?.resellerName || 'My Workspace'}</span>
              <span className="text-blue-500">({user?.resellerCode})</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* On-Demand Cycle Button for active workspace */}
        {onRunCycle && (
          <button
            onClick={onRunCycle}
            disabled={isRunningCycle}
            title="Scan & renew active subscriber billing cycles"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningCycle ? 'animate-spin' : ''}`} />
            <span>Process Billing Cycle</span>
          </button>
        )}

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-800">{user?.fullName || user?.username}</p>
            <p className="text-[11px] font-medium text-slate-500">
              {isSuperAdmin ? 'Super Administrator' : 'Reseller Admin'}
            </p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
