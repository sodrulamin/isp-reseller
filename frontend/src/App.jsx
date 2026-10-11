import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { apiClient } from './api/client';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Subscribers from './pages/Subscribers';
import MotherIspExpenses from './pages/MotherIspExpenses';
import EquipmentExpenses from './pages/EquipmentExpenses';
import ServiceTickets from './pages/ServiceTickets';
import Packages from './pages/Packages';
import Invoices from './pages/Invoices';
import ResellerManagement from './pages/ResellerManagement';
import WorkspaceSettings from './pages/WorkspaceSettings';

export default function App() {
  const { user, isSuperAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [cycleKey, setCycleKey] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('isp_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('isp_sidebar_collapsed', String(next));
      return next;
    });
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors overflow-hidden">
      <Navbar onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />

      <div className="flex flex-1 w-full overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full min-w-0 h-full">
          {currentTab === 'dashboard' && <Dashboard key={cycleKey} onNavigate={setCurrentTab} />}
          {currentTab === 'subscribers' && <Subscribers key={cycleKey} onTriggerCycle={() => setCycleKey(k => k + 1)} />}
          {currentTab === 'mother-isp' && <MotherIspExpenses key={cycleKey} />}
          {currentTab === 'equipment' && <EquipmentExpenses key={cycleKey} />}
          {currentTab === 'services' && <ServiceTickets key={cycleKey} />}
          {currentTab === 'packages' && <Packages key={cycleKey} />}
          {currentTab === 'invoices' && <Invoices key={cycleKey} />}
          {currentTab === 'resellers' && isSuperAdmin && <ResellerManagement key={cycleKey} />}
          {currentTab === 'settings' && <WorkspaceSettings onUpdate={() => setCycleKey(k => k + 1)} />}
        </main>
      </div>
    </div>
  );
}
