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
    <aside className="w-72 bg-slate-900 dark:bg-slate-950 text-slate-300 flex flex-col flex-shrink-0 min-h-[calc(100vh-4.25rem)] border-r border-transparent dark:border-slate-800/80 transition-colors">
      <div className="p-4">
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase px-3 mb-2.5">
          Navigation
        </p>
        <nav className="space-y-1.5">
          {menuItems.map(item => {
            if (item.role === 'SUPER_ADMIN' && !isSuperAdmin) return null;

            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all text-left ${
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
    </aside>
  );
}
