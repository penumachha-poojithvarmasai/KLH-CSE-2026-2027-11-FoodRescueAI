import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getRoleNavConfig } from '../../utils/navigation';
import { authService } from '../../services/auth/authService';
import { 
  X,
  LogOut
} from 'lucide-react';

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'FOOD_PROVIDER': return 'Food Provider';
    case 'RECIPIENT': return 'Recipient Charity';
    case 'LOGISTICS_COORDINATOR': return 'Logistics Coordinator';
    case 'ADMIN': return 'Platform Admin';
    default: return String(role).replace(/_/g, ' ');
  }
};


interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, agentStage, isSimulating, notifications } = useApp();
  const { user, userRole, logout } = useAuth();
  const effectiveUser = user || authService.getCurrentSession()?.user;
  const effectiveRole = (effectiveUser?.role || userRole || 'FOOD_PROVIDER') as string;

  if (!isOpen) return null;

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const { title, items } = getRoleNavConfig(effectiveRole as any, { isSimulating, agentStage, unreadNotifs });

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative w-72 bg-white border-r border-slate-200 flex flex-col justify-between p-4 z-10 space-y-6 shadow-2xl">
        <div className="space-y-5">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🌱</span>
              <span className="font-extrabold text-sm text-slate-900">FoodRescue AI</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Card */}
          <div className="p-3.5 rounded-2xl bg-[#f0f4f9] border border-[#c2e7ff] space-y-2 shadow-2xs">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#c2e7ff] text-[#001d35] border border-[#7cacf8] flex items-center justify-center font-bold text-xs shrink-0">
                {effectiveUser?.name ? effectiveUser.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 block leading-tight">Welcome,</span>
                <span className="font-extrabold text-slate-900 text-xs truncate block">{effectiveUser?.name || 'Authorized User'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#c2e7ff]/40">
              <span className="text-slate-600 truncate max-w-[120px]">{effectiveUser?.organization}</span>
              <span className="font-black uppercase px-2 py-0.5 rounded-full border tracking-wide bg-[#e8f0fe] text-[#1a73e8] border-[#c2e7ff]">
                {getRoleLabel(effectiveRole)}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#0b57d0] px-1">{title}</p>
          <nav className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
            {items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-bold transition ${
                    isActive 
                      ? 'bg-[#c2e7ff]/60 text-[#001d35] font-black border border-[#7fcfff]/60 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0f4f9]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0b57d0]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#0b57d0] border border-[#c2e7ff]">
                      {item.badge}
                    </span>
                  )}

                  {item.count && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d93025] text-white">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-700 hover:text-rose-700 text-xs font-bold transition flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

};
