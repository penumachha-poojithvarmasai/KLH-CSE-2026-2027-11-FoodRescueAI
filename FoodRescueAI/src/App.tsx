import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { WelcomePage } from './pages/WelcomePage';
import type { UserRole } from './types';

// Role Dashboards
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { RecipientDashboardPage } from './pages/RecipientDashboardPage';
import { LogisticsDashboardPage } from './pages/LogisticsDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Shared Pages
import { DashboardPage } from './pages/DashboardPage';
import { FoodSubmissionPage } from './pages/FoodSubmissionPage';
import { AgentCommandCenterPage } from './pages/AgentCommandCenterPage';
import { RecipientMatchingPage } from './pages/RecipientMatchingPage';
import { RedistributionPage } from './pages/RedistributionPage';
import { PickupTrackerPage } from './pages/PickupTrackerPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ImpactDashboardPage } from './pages/ImpactDashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { getRoleNavConfig } from './utils/navigation';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, agentStage, isSimulating, notifications } = useApp();
  const { userRole, isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  const activeTabRef = useRef(activeTab);

  // 1. Synchronize URL hash -> activeTab on initial mount and on browser back/forward
  useEffect(() => {
    const handleHashSync = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const queryTab = params.get('tab')?.toLowerCase();
      const target = rawHash || queryTab;

      if (target && target !== activeTabRef.current.toLowerCase()) {
        setActiveTab(target);
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, [setActiveTab]);

  // 2. Synchronize activeTab -> URL hash without circular triggers
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (activeTab) {
      const currentHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      if (currentHash !== activeTab.toLowerCase()) {
        window.location.hash = activeTab;
      }
    }
  }, [activeTab]);

  // 3. Whenever authentication or userRole updates, verify activeTab permission
  useEffect(() => {
    if (isAuthenticated) {
      const roleRestrictedTabs: Record<string, UserRole[]> = {
        admin: ['ADMIN'],
        'dashboard-admin': ['ADMIN'],
        agent: ['LOGISTICS_COORDINATOR', 'ADMIN'],
        submissions: ['FOOD_PROVIDER', 'ADMIN'],
        matching: ['FOOD_PROVIDER', 'RECIPIENT', 'ADMIN'],
        redistribution: ['RECIPIENT', 'LOGISTICS_COORDINATOR', 'ADMIN'],
        provider: ['FOOD_PROVIDER', 'ADMIN'],
        'dashboard-provider': ['FOOD_PROVIDER', 'ADMIN'],
        recipient: ['RECIPIENT', 'ADMIN'],
        'dashboard-recipient': ['RECIPIENT', 'ADMIN'],
        logistics: ['LOGISTICS_COORDINATOR', 'ADMIN'],
        'dashboard-logistics': ['LOGISTICS_COORDINATOR', 'ADMIN'],
      };

      const allowed = roleRestrictedTabs[activeTab.toLowerCase()];
      if (allowed && !allowed.includes(userRole)) {
        setActiveTab('dashboard');
        if (window.location.hash.replace(/^#\/?/, '').trim().toLowerCase() !== 'dashboard') {
          window.location.hash = 'dashboard';
        }
      }
    }
  }, [isAuthenticated, userRole, activeTab, setActiveTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center text-slate-300 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <span>Loading FoodRescue AI...</span>
        </div>
      </div>
    );
  }

  // Show welcome landing page first if not authenticated
  if (showWelcome && !isAuthenticated) {
    return <WelcomePage onEnter={() => setShowWelcome(false)} />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderDashboardByRole = () => {
    switch (userRole) {
      case 'FOOD_PROVIDER': return <ProviderDashboardPage />;
      case 'RECIPIENT': return <RecipientDashboardPage />;
      case 'LOGISTICS_COORDINATOR': return <LogisticsDashboardPage />;
      case 'ADMIN': return <AdminDashboardPage />;
      default: return <DashboardPage />;
    }
  };

  const renderActivePage = () => {
    const currentTab = (activeTab || 'dashboard').toLowerCase();
    switch (currentTab) {
      case 'dashboard': 
        return renderDashboardByRole();
      case 'admin':
      case 'dashboard-admin':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']} onRedirectToDashboard={() => { setActiveTab('dashboard'); window.location.hash = 'dashboard'; }}>
            <AdminDashboardPage />
          </ProtectedRoute>
        );
      case 'provider':
      case 'dashboard-provider':
        return (
          <ProtectedRoute allowedRoles={['FOOD_PROVIDER', 'ADMIN']} onRedirectToDashboard={() => { setActiveTab('dashboard'); window.location.hash = 'dashboard'; }}>
            <ProviderDashboardPage />
          </ProtectedRoute>
        );
      case 'recipient':
      case 'dashboard-recipient':
        return (
          <ProtectedRoute allowedRoles={['RECIPIENT', 'ADMIN']} onRedirectToDashboard={() => { setActiveTab('dashboard'); window.location.hash = 'dashboard'; }}>
            <RecipientDashboardPage />
          </ProtectedRoute>
        );
      case 'logistics':
      case 'dashboard-logistics':
        return (
          <ProtectedRoute allowedRoles={['LOGISTICS_COORDINATOR', 'ADMIN']} onRedirectToDashboard={() => { setActiveTab('dashboard'); window.location.hash = 'dashboard'; }}>
            <LogisticsDashboardPage />
          </ProtectedRoute>
        );
      case 'submissions': 
        return (
          <ProtectedRoute allowedRoles={['FOOD_PROVIDER', 'ADMIN']} onRedirectToDashboard={() => { setActiveTab('dashboard'); window.location.hash = 'dashboard'; }}>
            <FoodSubmissionPage />
          </ProtectedRoute>
        );
      case 'agent': 
        return (
          <ProtectedRoute allowedRoles={['LOGISTICS_COORDINATOR', 'ADMIN']} onRedirectToDashboard={() => { setActiveTab('dashboard'); window.location.hash = 'dashboard'; }}>
            <AgentCommandCenterPage />
          </ProtectedRoute>
        );
      case 'matching': 
        return (
          <ProtectedRoute allowedRoles={['FOOD_PROVIDER', 'RECIPIENT', 'ADMIN']} onRedirectToDashboard={() => { setActiveTab('dashboard'); window.location.hash = 'dashboard'; }}>
            <RecipientMatchingPage />
          </ProtectedRoute>
        );
      case 'redistribution': 
        return (
          <ProtectedRoute allowedRoles={['RECIPIENT', 'LOGISTICS_COORDINATOR', 'ADMIN']} onRedirectToDashboard={() => { setActiveTab('dashboard'); window.location.hash = 'dashboard'; }}>
            <RedistributionPage />
          </ProtectedRoute>
        );
      case 'pickup': 
        return (
          <ProtectedRoute allowedRoles={['FOOD_PROVIDER', 'RECIPIENT', 'LOGISTICS_COORDINATOR', 'ADMIN']} onRedirectToDashboard={() => { setActiveTab('dashboard'); window.location.hash = 'dashboard'; }}>
            <PickupTrackerPage />
          </ProtectedRoute>
        );
      case 'notifications': 
        return <NotificationsPage />;
      case 'impact': 
        return <ImpactDashboardPage />;
      case 'settings': 
        return <SettingsPage />;
      default: 
        return renderDashboardByRole();
    }
  };

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const { items: mobileNavItems } = getRoleNavConfig(userRole, { isSimulating, agentStage, unreadNotifs });

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#c2e7ff] selection:text-[#001d35] transition-colors duration-300">
      <Header />



      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around py-2 px-1 text-[10px] shadow-sm">
        {mobileNavItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-0.5 p-1 rounded-lg ${
                isActive ? 'text-emerald-700 font-black' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[55px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <MainContent />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
