import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { ArrowLeft, Lock } from 'lucide-react';
import { LoginPage } from '../../pages/LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onRedirectToDashboard?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  onRedirectToDashboard 
}) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-slate-300 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <span>Verifying Authentication Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl glass-panel border border-rose-500/30 space-y-5 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Role Authorization Required</span>
            <h3 className="text-xl font-bold text-slate-100">Unauthorized Access</h3>
            <p className="text-xs text-slate-400">
              Your active account role (<strong className="text-slate-200">{userRole}</strong>) does not have authorization to view this section.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
            Strict Role-Based Access Control (RBAC) enforced. Login with an authorized role account to access these settings.
          </div>

          <button
            onClick={() => onRedirectToDashboard && onRedirectToDashboard()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Permitted Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
