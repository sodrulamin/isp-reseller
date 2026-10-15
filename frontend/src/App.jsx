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
import CollectedByMe from './pages/CollectedByMe';
import ResellerManagement from './pages/ResellerManagement';
import WorkspaceSettings from './pages/WorkspaceSettings';

const TAB_TO_PATH = {
  dashboard: '/dashboard',
  subscribers: '/subscribers',
  invoices: '/invoices',
  'collected-by-me': '/collected-by-me',
  'mother-isp': '/mother-isp',
  equipment: '/equipment',
  packages: '/packages',
  services: '/services',
  settings: '/settings',
  resellers: '/resellers'
};

const PATH_TO_TAB = {
  '/dashboard': 'dashboard',
  '/subscribers': 'subscribers',
  '/invoices': 'invoices',
  '/collected-by-me': 'collected-by-me',
  '/mother-isp': 'mother-isp',
  '/equipment': 'equipment',
  '/packages': 'packages',
  '/services': 'services',
  '/settings': 'settings',
  '/resellers': 'resellers'
};

function getTabFromLocation() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path === '/' || path === '') return 'dashboard';
  return PATH_TO_TAB[path] || 'dashboard';
}

export default function App() {
  const { user, isSuperAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState(getTabFromLocation);
  const [cycleKey, setCycleKey] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('isp_sidebar_collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Keep state in sync when user clicks browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getTabFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    setIsMobileSidebarOpen(false);
    const targetPath = TAB_TO_PATH[tabId] || '/dashboard';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab: tabId }, '', targetPath);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('isp_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors overflow-hidden">
      <Navbar
        onToggleSidebar={toggleSidebar}
        onToggleMobileSidebar={toggleMobileSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <div className="flex flex-1 w-full overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleTabChange}
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto w-full min-w-0 h-full">
          {currentTab === 'dashboard' && <Dashboard key={cycleKey} onNavigate={handleTabChange} />}
          {currentTab === 'subscribers' && <Subscribers key={cycleKey} onTriggerCycle={() => setCycleKey(k => k + 1)} />}
          {currentTab === 'invoices' && <Invoices key={cycleKey} onTriggerCycle={() => setCycleKey(k => k + 1)} onNavigate={handleTabChange} />}
          {currentTab === 'collected-by-me' && <CollectedByMe key={cycleKey} onNavigate={handleTabChange} />}
          {currentTab === 'mother-isp' && <MotherIspExpenses key={cycleKey} />}
          {currentTab === 'equipment' && <EquipmentExpenses key={cycleKey} />}
          {currentTab === 'packages' && <Packages key={cycleKey} />}
          {currentTab === 'services' && <ServiceTickets key={cycleKey} />}
          {currentTab === 'settings' && <WorkspaceSettings onUpdate={() => setCycleKey(k => k + 1)} />}
          {currentTab === 'resellers' && isSuperAdmin && <ResellerManagement key={cycleKey} />}
        </main>
      </div>
    </div>
  );
}
