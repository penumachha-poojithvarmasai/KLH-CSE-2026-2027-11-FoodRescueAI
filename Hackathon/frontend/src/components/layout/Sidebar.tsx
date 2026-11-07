import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Camera,
  AlertTriangle,
  ShieldCheck,
  Network,
  Lock,
  Layers,
  Kanban,
  LogOut,
  Truck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Shipments', path: '/shipments', icon: Package },
    { name: 'Delivery Evidence', path: '/evidence', icon: Camera },
    { name: 'Disputes', path: '/disputes', icon: AlertTriangle },
    ...(user?.role === 'ADMIN'
      ? [
          { name: 'Admin Review', path: '/admin', icon: ShieldCheck },
          { name: 'Architecture Explorer', path: '/architecture', icon: Network },
          { name: 'Security & Observability', path: '/security', icon: Lock },
          { name: 'CO Mapping', path: '/co-mapping', icon: Layers },
          { name: 'Agile Project Board', path: '/board', icon: Kanban },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800">
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-white tracking-wide block leading-tight">CourierProof</span>
          <span className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">SOA Verified</span>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
        <div className="text-xs text-slate-400">Signed in as:</div>
        <div className="text-sm font-medium text-white truncate">{user?.email || 'Guest User'}</div>
        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-blue-900/50 text-blue-300 border border-blue-700/50">
          {user?.role || 'UNAUTHENTICATED'}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-400 hover:text-rose-200 hover:bg-rose-950/30 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
