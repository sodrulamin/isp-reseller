import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../api/client';
import { Building2, Sun, Moon, Menu } from 'lucide-react';

export default function Navbar({ onToggleSidebar, isSidebarCollapsed }) {
  const { user, isSuperAdmin, activeWorkspaceId, switchWorkspace } = useAuth();
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
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            className="p-2 -ml-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-sm">
            ISP
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">isp-reseller</h1>
            {isSuperAdmin ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Workspace:</span>
                <select
                  value={activeWorkspaceId}
                  onChange={(e) => switchWorkspace(e.target.value)}
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-0.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{user?.resellerName || 'My Workspace'}</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">({user?.resellerCode})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
