import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../api/client';
import { Building2, Sun, Moon, Menu, KeyRound } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Navbar({ onToggleSidebar, onToggleMobileSidebar, isSidebarCollapsed }) {
  const { user, isSuperAdmin, activeWorkspaceId, switchWorkspace } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [resellers, setResellers] = useState([]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      apiClient.get('/resellers')
        .then(data => setResellers(data || []))
        .catch(err => console.error("Failed to load resellers for switch", err));
    }
  }, [isSuperAdmin]);

  return (
    <header className="min-h-[4rem] py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile Drawer Hamburger Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            title="Open menu"
            className="p-2 -ml-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            className="hidden lg:flex p-2 -ml-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle sidebar width"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-sm flex-shrink-0">
            ISP
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">isp-reseller</h1>
            {isSuperAdmin ? (
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 min-w-0">
                <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 font-medium">Workspace:</span>
                <select
                  value={activeWorkspaceId}
                  onChange={(e) => switchWorkspace(e.target.value)}
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-md px-1.5 sm:px-2 py-0.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[150px] sm:max-w-xs md:max-w-md truncate"
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
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5 truncate max-w-[160px] sm:max-w-xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="truncate">{user?.resellerName || 'My Workspace'}</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-medium flex-shrink-0">({user?.resellerCode})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Change Password Button */}
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          title="Change Login Password"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700/80 shadow-sm"
        >
          <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Change Password</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </header>
  );
}
