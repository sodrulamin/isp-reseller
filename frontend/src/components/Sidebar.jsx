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
  Settings,
  Building2
} from 'lucide-react';

export default function Sidebar({ currentTab, onSelectTab }) {
  const { isSuperAdmin } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Financial Dashboard', icon: LayoutDashboard, role: 'ALL' },
    { id: 'subscribers', label: 'Subscribers & Wallets', icon: Users, role: 'RESELLER' },
    { id: 'mother-isp', label: 'Mother ISP Expenses', icon: Network, role: 'RESELLER' },
    { id: 'equipment', label: 'Equipment Expenses', icon: Boxes, role: 'RESELLER' },
    { id: 'services', label: 'Physical Service Tickets', icon: Wrench, role: 'RESELLER' },
    { id: 'packages', label: 'Internet Packages', icon: Package, role: 'RESELLER' },
    { id: 'invoices', label: 'Invoices & Billing', icon: Receipt, role: 'RESELLER' },
    { id: 'resellers', label: 'Reseller Tenants (SaaS)', icon: Building2, role: 'SUPER_ADMIN' },
    { id: 'settings', label: 'Workspace Settings', icon: Settings, role: 'RESELLER' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3 mb-2">
          Navigation
        </p>
        <nav className="space-y-1">
          {menuItems.map(item => {
            if (item.role === 'SUPER_ADMIN' && !isSuperAdmin) return null;

            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="bg-slate-800/80 rounded-lg p-3 text-xs border border-slate-700/50">
          <p className="font-semibold text-white">Expense &amp; Profit Engine</p>
          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
            Revenue minus Mother ISP payout, equipment, and service maintenance.
          </p>
        </div>
      </div>
    </aside>
  );
}
