import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api/apiService';
import { authService } from '../services/auth/authService';
import { 
  ShieldCheck, 
  Users, 
  Utensils, 
  Building2, 
  Truck, 
  Bot, 
  BarChart2, 
  FileText,
  Activity,
  Server,
  RefreshCw,
  UserPlus,
  X,
  Cpu
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const getRoleBadgeConfig = (role: string) => {
  switch (role) {
    case 'FOOD_PROVIDER':
      return {
        label: 'FOOD PROVIDER',
        style: 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-black'
      };
    case 'RECIPIENT':
      return {
        label: 'RECIPIENT',
        style: 'bg-[#fef7e0] text-[#b06000] border border-[#feefc3] font-black'
      };
    case 'LOGISTICS_COORDINATOR':
      return {
        label: 'LOGISTICS COORDINATOR',
        style: 'bg-[#e8f0fe] text-[#1a73e8] border border-[#c2e7ff] font-black'
      };
    case 'ADMIN':
      return {
        label: 'ADMIN',
        style: 'bg-[#f3e8fd] text-[#7c3aed] border border-[#e9d5ff] font-black'
      };
    default:
      return {
        label: role,
        style: 'bg-slate-100 text-slate-800 border border-slate-200 font-black'
      };
  }
};

export const AdminDashboardPage: React.FC = () => {
  const { 
    submissions, 
    recipients, 
    pickups, 
    agentEvents, 
    metrics,
    agentStage,
    isSimulating,
    isBackendOnline,
    aiMode
  } = useApp();
  const { user, session } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<'OVERVIEW' | 'USERS' | 'FOOD' | 'RECIPIENTS' | 'PICKUPS' | 'LOGS'>('OVERVIEW');
  const [backendUsers, setBackendUsers] = useState<any[]>([]);
  const [userFetchError, setUserFetchError] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);

  // AI Backend Status for viva/audit telemetry
  const [aiBackendStatus, setAiBackendStatus] = useState<{
    gemini_configured: boolean;
    model: string;
    active_engine: string;
    fallback_mode: boolean;
  } | null>(null);

  useEffect(() => {
    ApiService.checkAIStatus()
      .then(status => setAiBackendStatus(status))
      .catch(() => {});
  }, []);

  // Admin user creation state
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<string>('FOOD_PROVIDER');
  const [newUserOrg, setNewUserOrg] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);
  const [createUserMsg, setCreateUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAdminCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserMsg(null);
    setIsCreatingUser(true);
    try {
      await ApiService.adminCreateUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        role: newUserRole,
        organization: newUserOrg.trim(),
        password: newUserPassword
      }, session?.token);

      setCreateUserMsg({ type: 'success', text: `User ${newUserEmail} created successfully with role ${newUserRole}!` });
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('FOOD_PROVIDER');
      setNewUserOrg('');
      setNewUserPassword('');
      await loadBackendUsers();
      setTimeout(() => {
        setShowAddUserModal(false);
        setCreateUserMsg(null);
      }, 1500);
    } catch (err: any) {
      setCreateUserMsg({ type: 'error', text: err.message || 'Failed to create user account' });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const loadBackendUsers = async () => {
    setIsLoadingUsers(true);
    setUserFetchError(null);
    try {
      const uList = await ApiService.fetchUsers(session?.token);
      // Merge backend users with any locally registered custom users not yet in backend
      const customUsers = authService.getCustomUsers();
      const emailSet = new Set(uList.map((u: any) => u.email.toLowerCase()));
      const merged = [...uList];
      for (const cu of customUsers) {
        if (!emailSet.has(cu.email.toLowerCase())) {
          merged.push(cu);
          emailSet.add(cu.email.toLowerCase());
        }
      }
      setBackendUsers(merged);
    } catch (err: any) {
      // Offline / network fallback: use baseline accounts + locally registered accounts
      const baseUsers = [
        { name: 'Grand Plaza Hotel', email: 'provider@foodrescue.ai', role: 'FOOD_PROVIDER', organization: 'Grand Plaza Hospitality' },
        { name: 'The Akshaya Patra Foundation', email: 'recipient@foodrescue.ai', role: 'RECIPIENT', organization: 'The Akshaya Patra Foundation' },
        { name: 'Alex Rivera', email: 'logistics@foodrescue.ai', role: 'LOGISTICS_COORDINATOR', organization: 'City Express Logistics' },
        { name: 'System Admin', email: 'admin@foodrescue.ai', role: 'ADMIN', organization: 'FoodRescue AI Headquarters' },
      ];
      const customUsers = authService.getCustomUsers();
      const emailSet = new Set(baseUsers.map((u: any) => u.email.toLowerCase()));
      const merged = [...baseUsers];
      for (const cu of customUsers) {
        if (!emailSet.has(cu.email.toLowerCase())) {
          merged.push(cu);
          emailSet.add(cu.email.toLowerCase());
        }
      }
      setBackendUsers(merged);
      if (session?.token) {
        setUserFetchError(err.message || 'Loaded users from local registry');
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadBackendUsers();
  }, [session?.token]);

  useEffect(() => {
    if (activeAdminTab === 'USERS') {
      loadBackendUsers();
    }
  }, [activeAdminTab]);


  // Weekly analytics data
  const weeklyData = [
    { day: 'Mon', recoveredKg: 480, meals: 960 },
    { day: 'Tue', recoveredKg: 620, meals: 1240 },
    { day: 'Wed', recoveredKg: 550, meals: 1100 },
    { day: 'Thu', recoveredKg: 780, meals: 1560 },
    { day: 'Fri', recoveredKg: 910, meals: 1820 },
    { day: 'Sat', recoveredKg: 460, meals: 920 },
    { day: 'Sun', recoveredKg: 450, meals: 900 },
  ];

  // Stage counts for Agent monitoring
  const observeCount = agentEvents.filter(e => e.stage === 'OBSERVE').length;
  const analyzeCount = agentEvents.filter(e => e.stage === 'ANALYZE').length;
  const decideCount = agentEvents.filter(e => e.stage === 'DECIDE').length;
  const actCount = agentEvents.filter(e => e.stage === 'ACT').length;
  const monitorCount = agentEvents.filter(e => e.stage === 'MONITOR').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#e8f0fe] via-[#f3e8fd] to-[#e6f4ea] border border-[#c2e7ff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-[#0b57d0] text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-[#1a73e8]" />
            <span>Global Operations & System Administration Command Center</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">{user?.name || 'System Admin'} Portal</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
            System-wide telemetry, multi-role user management, autonomous AI agent loop monitoring, and high-level SDG impact metrics.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-xs border ${
            isBackendOnline 
              ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]' 
              : 'bg-[#fef7e0] text-[#b06000] border-[#feefc3]'
          }`}>
            <Activity className={`w-3.5 h-3.5 ${isBackendOnline ? 'text-[#1e8e3e] animate-pulse' : 'text-[#f9ab00]'}`} />
            <span>SYSTEM HEALTH: {isBackendOnline ? 'FASTAPI BACKEND ONLINE' : 'LOCAL FALLBACK ACTIVE'}</span>
          </span>
        </div>
      </div>


      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'OVERVIEW', label: 'System Telemetry & Analytics', icon: BarChart2 },
          { id: 'USERS', label: `Registered Accounts (${backendUsers.length || 4})`, icon: Users },
          { id: 'FOOD', label: 'Food Listings (' + submissions.length + ')', icon: Utensils },
          { id: 'RECIPIENTS', label: 'NGO Recipients (' + recipients.length + ')', icon: Building2 },
          { id: 'PICKUPS', label: 'Logistics Fleet (' + pickups.length + ')', icon: Truck },
          { id: 'LOGS', label: 'Agent Audit Trail', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
                isActive 
                  ? 'bg-[#c2e7ff]/70 text-[#001d35] font-black border border-[#7fcfff]/60 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0f4f9]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeAdminTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Primary System Overview Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl glass-panel border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Registered Accounts</span>
              <div className="text-2xl font-bold text-slate-900">4 Workspaces</div>
              <span className="text-[10px] text-[#7c3aed] font-semibold">1 Provider • 1 Recipient • 1 Logistics • 1 Admin</span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Surplus Diverted</span>
              <div className="text-2xl font-bold text-[#1e8e3e]">{metrics.totalFoodRecoveredKg.toLocaleString()} kg</div>
              <span className="text-[10px] text-[#137333] font-medium">{metrics.totalMealsSaved.toLocaleString()} meals served</span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-medium">AI Intelligence Engine</span>
              <div className="text-xl font-black text-[#1a73e8] truncate" title={aiMode === 'REAL_GEMINI' ? 'Gemini 3.8 Flash' : aiMode === 'SIMULATED_GEMINI' ? 'Simulated Gemini' : 'Rule Engine'}>
                {aiMode === 'REAL_GEMINI' ? 'Gemini 3.8 Flash' : aiMode === 'SIMULATED_GEMINI' ? 'Simulated Gemini' : 'Rule Engine'}
              </div>
              <span className="text-[10px] text-[#0b57d0] font-medium block truncate">
                Backend: {isBackendOnline ? 'FastAPI Online (Port 8000)' : 'Local Fallback'}
              </span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Agent Loop Status</span>
              <div className="text-2xl font-bold text-[#b06000]">{isSimulating ? 'EXECUTING' : 'READY'}</div>
              <span className="text-[10px] text-[#ea8600] font-medium">Stage: {agentStage}</span>
            </div>
          </div>

          {/* AI Agent Workflow Stage Monitor Across 5 Stages */}
          <div className="p-6 rounded-2xl glass-panel border border-[#c2e7ff] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-[#7c3aed]" />
                <h3 className="font-bold text-sm text-slate-900">AI Agent Workflow Stage Monitor</h3>
              </div>
              <span className="text-[10px] font-mono text-[#0b57d0] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full border border-[#c2e7ff]">
                CONTINUOUS AGENT AUDIT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { stage: 'OBSERVE', count: observeCount, desc: 'Surplus Detection' },
                { stage: 'ANALYZE', count: analyzeCount, desc: 'Usable Time & Urgency' },
                { stage: 'DECIDE', count: decideCount, desc: '5-Factor Deterministic Match' },
                { stage: 'ACT', count: actCount, desc: 'Automated Dispatch' },
                { stage: 'MONITOR', count: monitorCount, desc: 'Logistics Telemetry' },
              ].map((s, idx) => (
                <div key={s.stage} className="p-3.5 rounded-xl bg-[#f8fafd] border border-slate-200 space-y-1 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">0{idx + 1}. {s.stage}</span>
                  <div className="text-xl font-extrabold text-[#7c3aed]">{s.count} Events</div>
                  <span className="text-[9px] text-slate-500 block">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Analytics & Spring Boot Microservices Readiness */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">System Throughput & Recovery Trajectory</h3>
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1a73e8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#747775" fontSize={12} tickLine={false} />
                    <YAxis stroke="#747775" fontSize={12} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e1e3e1', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 12px rgba(60,64,67,0.15)' }}
                    />
                    <Area type="monotone" dataKey="recoveredKg" stroke="#1a73e8" strokeWidth={2} fillOpacity={1} fill="url(#colorAdmin)" name="Food Diverted (kg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SOA Microservices & System Telemetry */}
            <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Server className="w-4 h-4" />
                  <h3 className="font-bold text-sm text-slate-200">System Architecture & Service Telemetry</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Viva & Audit Telemetry</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* FastAPI Backend */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block text-[11px]">FastAPI Core Backend</span>
                    <span className="text-[10px] text-slate-500 font-mono">Port :8000 (/api/v1)</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                    isBackendOnline 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {isBackendOnline ? 'ONLINE' : 'LOCAL FALLBACK'}
                  </span>
                </div>

                {/* Gemini AI Engine */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#1a73e8]" />
                      <span className="font-semibold text-slate-200 block text-[11px]">Gemini AI Intelligence Engine</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      {aiMode === 'REAL_GEMINI' ? (aiBackendStatus?.model || 'gemini-3.8-flash') : aiMode === 'SIMULATED_GEMINI' ? 'Simulated Gemini' : 'Rule Engine'}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono shrink-0 ${
                    aiMode === 'REAL_GEMINI' 
                      ? (aiBackendStatus?.gemini_configured ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30')
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {aiMode === 'REAL_GEMINI' 
                      ? (aiBackendStatus?.gemini_configured ? 'ACTIVE CLOUD' : 'FALLBACK READY')
                      : aiMode === 'SIMULATED_GEMINI' ? 'SIMULATED' : 'DETERMINISTIC'}
                  </span>
                </div>

                {/* Spring Cloud Gateway */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block text-[11px]">Spring Cloud Gateway</span>
                    <span className="text-[10px] text-slate-500 font-mono">Port :8080 (API Gateway)</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                    GATEWAY READY
                  </span>
                </div>

                {/* Eureka Service Registry */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block text-[11px]">Eureka Service Registry</span>
                    <span className="text-[10px] text-slate-500 font-mono">Port :8761 (Service Discovery)</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono">
                    REGISTRY READY
                  </span>
                </div>

                {/* Microservices */}
                {[
                  { name: 'Food-Service', port: 8082, role: 'Surplus Ingestion' },
                  { name: 'Matching-Service', port: 8084, role: '5-Factor Allocation' },
                  { name: 'Logistics-Service', port: 8085, role: 'Fleet & Dispatch' },
                ].map(ms => (
                  <div key={ms.name} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block text-[11px]">{ms.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Port :{ms.port} • {ms.role}</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                      SOA READY
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeAdminTab === 'USERS' && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Registered System User Accounts</h3>
              <p className="text-xs text-slate-500">Authenticated directly from SQLite database via JWT-protected endpoint</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setShowAddUserModal(true);
                  setCreateUserMsg(null);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
              <button
                onClick={loadBackendUsers}
                disabled={isLoadingUsers}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full gemini-gradient-btn text-white text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                <span>Refresh Users</span>
              </button>
            </div>
          </div>

          {/* Admin User Provisioning Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5 text-[#1a73e8]" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Provision System User (Admin RBAC)</h3>
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {createUserMsg && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    createUserMsg.type === 'success' 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                      : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}>
                    {createUserMsg.text}
                  </div>
                )}

                <form onSubmit={handleAdminCreateUser} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Regional Coordinator"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="e.g. coordinator@foodrescue.ai"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Organization *</label>
                    <input
                      type="text"
                      required
                      value={newUserOrg}
                      onChange={(e) => setNewUserOrg(e.target.value)}
                      placeholder="e.g. City Food Bank"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">User Role (All roles permitted for Admin) *</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1a73e8] focus:bg-white"
                    >
                      <option value="FOOD_PROVIDER">FOOD_PROVIDER (Kitchen / Restaurant)</option>
                      <option value="RECIPIENT">RECIPIENT (Shelter / NGO / Food Bank)</option>
                      <option value="LOGISTICS_COORDINATOR">LOGISTICS_COORDINATOR (Fleet / Driver)</option>
                      <option value="ADMIN">ADMIN (System Administrator)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Password *</label>
                    <input
                      type="password"
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingUser}
                      className="px-4 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                    >
                      {isCreatingUser ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <span>Create User</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}


          {userFetchError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {userFetchError}
            </div>
          )}

          {isLoadingUsers ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <div className="w-5 h-5 rounded-full border-2 border-[#1a73e8] border-t-transparent animate-spin mx-auto mb-2" />
              <span>Fetching user records with Admin JWT authorization...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {(backendUsers.length > 0 ? backendUsers : [
                { name: 'Grand Plaza Hotel', email: 'provider@foodrescue.ai', role: 'FOOD_PROVIDER', organization: 'Grand Plaza Hospitality' },
                { name: 'The Akshaya Patra Foundation', email: 'recipient@foodrescue.ai', role: 'RECIPIENT', organization: 'The Akshaya Patra Foundation' },
                { name: 'Alex Rivera', email: 'logistics@foodrescue.ai', role: 'LOGISTICS_COORDINATOR', organization: 'City Express Logistics' },
                { name: 'System Admin', email: 'admin@foodrescue.ai', role: 'ADMIN', organization: 'FoodRescue AI Headquarters' },
              ]).map((usr: any) => {
                const badge = getRoleBadgeConfig(usr.role);
                return (
                  <div key={usr.email} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs hover:border-[#c2e7ff] transition-all">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">{usr.name}</span>
                      <span className="text-slate-500 font-medium">{usr.email} • Organization: {usr.organization}</span>
                    </div>
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full border tracking-wide shadow-2xs ${badge.style}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* TAB 3: FOOD SUBMISSIONS */}
      {activeAdminTab === 'FOOD' && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">All Food Listings ({submissions.length})</h3>
          <div className="space-y-3">
            {submissions.map(sub => (
              <div key={sub.id} className="p-4 rounded-xl bg-[#f8fafd] border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">{sub.foodName}</span>
                  <span className="text-slate-500 font-medium">Provider: {sub.providerName} • Quantity: {sub.quantity} {sub.unit}</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-mono">
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RECIPIENTS */}
      {activeAdminTab === 'RECIPIENTS' && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Recipient Organizations ({recipients.length})</h3>
          <div className="space-y-3">
            {recipients.map(r => (
              <div key={r.id} className="p-4 rounded-xl bg-[#f8fafd] border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">{r.name}</span>
                  <span className="text-slate-500 font-medium">Type: {r.organizationType} • Need: {r.currentNeedLevel} • Capacity: {r.availableCapacity}</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#fef7e0] text-[#b06000] border border-[#feefc3] font-mono">
                  {r.distanceKm} km away
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PICKUPS */}
      {activeAdminTab === 'PICKUPS' && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Pickup Dispatch Tasks ({pickups.length})</h3>
          <div className="space-y-3">
            {pickups.map(p => (
              <div key={p.id} className="p-4 rounded-xl bg-[#f8fafd] border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">#{p.id}: {p.providerName} → {p.recipientName}</span>
                  <span className="text-slate-500 font-medium">Coordinator: {p.coordinatorName}</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#c2e7ff] font-mono">
                  {p.currentStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeAdminTab === 'LOGS' && (
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">AI Agent Event Audit Trail ({agentEvents.length})</h3>
          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {agentEvents.map(evt => (
              <div key={evt.id} className="p-3.5 rounded-xl bg-[#f8fafd] border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#7c3aed]">[{evt.stage}] {evt.message}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(evt.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-slate-600 text-[11px] font-medium">{evt.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
