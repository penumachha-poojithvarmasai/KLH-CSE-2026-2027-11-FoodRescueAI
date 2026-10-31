import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getRoleNavConfig } from '../../utils/navigation';
import { 
  Bot, 
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, agentStage, isSimulating, notifications } = useApp();
  const { userRole } = useAuth();
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const { title, items } = getRoleNavConfig(userRole, { isSimulating, agentStage, unreadNotifs });

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex shrink-0 shadow-xs">
      <div className="p-4 space-y-6">
        {/* Navigation Group */}
        <div>
          <p className="px-3 text-[10px] font-black uppercase tracking-wider text-[#0b57d0] mb-2">{title}</p>
          <nav className="space-y-1">
            {items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#c2e7ff]/60 text-[#001d35] font-black shadow-xs border border-[#7fcfff]/60' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0f4f9]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0b57d0]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#0b57d0] border border-[#c2e7ff] animate-pulse">
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

        {/* Novelty Highlights Card - Google Gemini styled */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#f8fafd] via-[#f0f4f9] to-[#e8f0fe]/60 border border-[#c2e7ff] space-y-2.5 shadow-2xs">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider gemini-gradient-text">3 Core Innovations</span>
          </div>
          <ul className="text-[11px] text-slate-700 space-y-2 pl-0.5">
            <li className="flex items-start space-x-2">
              <Zap className="w-3.5 h-3.5 text-[#f9ab00] shrink-0 mt-0.5" />
              <span><strong className="text-slate-900">Surplus AI Intelligence</strong>: Usable time & urgency.</span>
            </li>
            <li className="flex items-start space-x-2">
              <Target className="w-3.5 h-3.5 text-[#1a73e8] shrink-0 mt-0.5" />
              <span><strong className="text-slate-900">Contextual Matching</strong>: 5-factor explainable score.</span>
            </li>
            <li className="flex items-start space-x-2">
              <Bot className="w-3.5 h-3.5 text-[#1e8e3e] shrink-0 mt-0.5" />
              <span><strong className="text-slate-900">Autonomous Dispatch</strong>: Real-time OBSERVE-MONITOR.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-100 bg-[#f8fafd]">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#1e8e3e] animate-pulse" />
          <span className="text-[11px] text-slate-800 font-bold">FastAPI + Vite Active</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">UN SDG 2 & 12 Sustainable Network</p>
      </div>
    </aside>
  );
};

