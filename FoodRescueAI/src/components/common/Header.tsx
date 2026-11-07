import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  Play, 
  Menu, 
  LogOut, 
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

import { authService } from '../../services/auth/authService';
import { MobileDrawer } from './MobileDrawer';

export const Header: React.FC = () => {
  const { 
    notifications, 
    setActiveTab, 
    triggerFullAgentSimulation, 
    isSimulating,
    markNotificationRead
  } = useApp();

  const { user, userRole, logout } = useAuth();
  const effectiveUser = user || authService.getCurrentSession()?.user;
  const effectiveRole = (effectiveUser?.role || userRole || 'FOOD_PROVIDER') as string;

  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleDisplayName = (role?: string) => {
    const r = (role || '').toUpperCase();
    switch (r) {
      case 'FOOD_PROVIDER':
        return {
          label: 'Food Provider',
          badgeClass: 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
        };
      case 'RECIPIENT':
        return {
          label: 'Recipient Charity',
          badgeClass: 'bg-[#fef7e0] text-[#b06000] border-[#feefc3]'
        };
      case 'LOGISTICS_COORDINATOR':
        return {
          label: 'Logistics Coordinator',
          badgeClass: 'bg-[#e8f0fe] text-[#1a73e8] border-[#c2e7ff]'
        };
      case 'ADMIN':
        return {
          label: 'Platform Admin',
          badgeClass: 'bg-[#f3e8fd] text-[#7c3aed] border-[#e9d5ff]'
        };
      default:
        return {
          label: role ? role.replace(/_/g, ' ') : 'Authorized User',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const roleConfig = getRoleDisplayName(effectiveRole);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e1e3e1] px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
        {/* Left: Mobile Hamburger + Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1a73e8] via-[#7c3aed] to-[#db2777] p-0.5 shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-lg">
                🌱
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">FoodRescue <span className="gemini-gradient-text font-black">AI</span></h1>
                <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#c2e7ff]">
                  Gemini Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden xl:block font-medium">Autonomous Surplus-Food Detection Platform</p>
            </div>
          </div>
        </div>

        {/* Center: Agent Loop Simulator Control */}
        <div className="hidden lg:flex items-center space-x-3">
          <button
            onClick={triggerFullAgentSimulation}
            disabled={isSimulating}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
              isSimulating 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'gemini-gradient-btn shadow-blue-500/20 active:scale-95'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Executing Agent Loop...' : 'Simulate Full Agent Loop'}</span>
          </button>
        </div>

        {/* Right Controls: Authenticated User Identity, Notifications, Sign Out */}
        <div className="flex items-center space-x-2.5">
          {/* Authenticated User Identity & Human-Readable Role Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs">
            <span className="text-slate-500 font-medium">Welcome,</span>
            <span className="font-extrabold text-slate-900 truncate max-w-[140px] md:max-w-[200px] lg:max-w-[280px]" title={effectiveUser?.name || 'Authorized User'}>
              {effectiveUser?.name || 'Authorized User'}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border tracking-wide shrink-0 ${roleConfig.badgeClass}`}>
              {roleConfig.label}
            </span>
          </div>


          {/* Notifications Icon */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition border border-slate-200 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-800">Agent Activity Notifications</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-emerald-600 hover:underline font-bold"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No active notifications</div>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          setActiveTab(n.targetSection);
                          setShowNotifications(false);
                        }}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition flex items-start space-x-2.5 ${!n.read ? 'bg-emerald-50/50' : ''}`}
                      >
                        {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                        {n.type === 'info' && <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-800 truncate">{n.title}</p>
                            <span className="text-[10px] text-slate-400">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            id="sign-out-btn"
            onClick={logout}
            className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </header>


      {/* Mobile Drawer Navigation */}
      <MobileDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} />
    </>
  );
};
