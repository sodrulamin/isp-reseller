import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Network,
  Boxes,
  Wrench,
  Package,
  Receipt,
  Coins,
  Settings,
  Building2,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ currentTab, onSelectTab, isCollapsed, isMobileOpen, onCloseMobile }) {
  const { user, isSuperAdmin, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Financial Dashboard', icon: LayoutDashboard, role: 'ALL' },
    { id: 'subscribers', path: '/subscribers', label: 'Subscribers & Wallets', icon: Users, role: 'RESELLER' },
    { id: 'invoices', path: '/invoices', label: 'Invoices & Billing', icon: Receipt, role: 'RESELLER' },
    { id: 'collected-by-me', path: '/collected-by-me', label: 'Collected by Me', icon: Coins, role: 'RESELLER' },
    { id: 'mother-isp', path: '/mother-isp', label: 'Mother ISP Expenses', icon: Network, role: 'RESELLER' },
    { id: 'equipment', path: '/equipment', label: 'Equipment Expenses', icon: Boxes, role: 'RESELLER' },
    { id: 'packages', path: '/packages', label: 'Internet Packages', icon: Package, role: 'RESELLER' },
    { id: 'services', path: '/services', label: 'Physical Service Tickets', icon: Wrench, role: 'RESELLER' },
    { id: 'settings', path: '/settings', label: 'Workspace Settings', icon: Settings, role: 'RESELLER' },
    { id: 'resellers', path: '/resellers', label: 'Reseller Tenants (SaaS)', icon: Building2, role: 'SUPER_ADMIN' },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 lg:static lg:z-auto ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } w-72 bg-slate-900 dark:bg-slate-950 text-slate-300 flex flex-col flex-shrink-0 h-full overflow-hidden border-r border-transparent dark:border-slate-800/80 transition-all duration-300 ease-in-out select-none shadow-2xl lg:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              ISP
            </div>
            <span className="font-bold text-white text-base">Navigation</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 flex-1 overflow-y-auto overflow-x-hidden pt-4">
          <nav className="space-y-1.5">
            {menuItems.map(item => {
              if (item.role === 'SUPER_ADMIN' && !isSuperAdmin) return null;

              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTab(item.id);
                    onCloseMobile?.();
                  }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'gap-3.5 px-3.5 py-3'
                } rounded-xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </a>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout Section */}
      <div className="mt-auto p-3 border-t border-slate-800 dark:border-slate-800/80 bg-slate-900/90 dark:bg-slate-950/90">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              title={`${user?.fullName || user?.username} (${isSuperAdmin ? 'Super Administrator' : 'Reseller Admin'})`}
              className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center cursor-default uppercase"
            >
              {(user?.fullName || user?.username || 'U')[0]}
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-xl transition flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {user?.fullName || user?.username}
              </p>
              <p className="text-xs font-medium text-slate-400 truncate mt-0.5">
                {isSuperAdmin ? 'Super Administrator' : 'Reseller Admin'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-xl transition flex-shrink-0"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
