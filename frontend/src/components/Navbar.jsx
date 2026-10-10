import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../api/client';
import { Building2, LogOut, RefreshCw, Sun, Moon } from 'lucide-react';

export default function Navbar({ onRunCycle, isRunningCycle }) {
  const { user, isSuperAdmin, logout, activeWorkspaceId, switchWorkspace } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [resellers, setResellers] = useState([]);

  useEffect(() => {
    if (isSuperAdmin) {
      apiClient.get('/resellers')
        .then(data => setResellers(data || []))
        .catch(err => console.error("Failed to load resellers for switch", err));
    }
  }, [isSuperAdmin]);

  return (
    <header className="min-h-[4.25rem] py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-sm">
            ISP
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">isp-reseller</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Expenses, Revenue &amp; Profit Monitoring</p>
          </div>
        </div>

        {/* Workspace Switcher / Badge */}
        <div className="ml-6 pl-6 border-l border-slate-200 dark:border-slate-800 flex items-center gap-2">
          {isSuperAdmin ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workspace:</span>
              <select
                value={activeWorkspaceId}
                onChange={(e) => switchWorkspace(e.target.value)}
                className="text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 px-3.5 py-1.5 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-900/60">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{user?.resellerName || 'My Workspace'}</span>
              <span className="text-blue-500 dark:text-blue-400">({user?.resellerCode})</span>
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
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRunningCycle ? 'animate-spin' : ''}`} />
            <span>Process Billing Cycle</span>
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-3.5 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.fullName || user?.username}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isSuperAdmin ? 'Super Administrator' : 'Reseller Admin'}
            </p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
