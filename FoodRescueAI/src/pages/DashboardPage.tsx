import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Utensils, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Sparkles,
  Bot,
  Flame,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { metrics, submissions, redistributions, userRole, setActiveTab, triggerFullAgentSimulation, isSimulating } = useApp();

  // Category data for charts
  const categoryMap: { [key: string]: number } = {};
  submissions.forEach(s => {
    categoryMap[s.category] = (categoryMap[s.category] || 0) + s.quantity;
  });

  const categoryData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    value: categoryMap[cat]
  }));

  const COLORS = ['#1a73e8', '#1e8e3e', '#f9ab00', '#d93025', '#7c3aed', '#0097a7'];

  // Weekly Trend Data
  const weeklyData = [
    { day: 'Mon', recoveredKg: 480, meals: 960 },
    { day: 'Tue', recoveredKg: 620, meals: 1240 },
    { day: 'Wed', recoveredKg: 550, meals: 1100 },
    { day: 'Thu', recoveredKg: 780, meals: 1560 },
    { day: 'Fri', recoveredKg: 910, meals: 1820 },
    { day: 'Sat', recoveredKg: 460, meals: 920 },
    { day: 'Sun', recoveredKg: 450, meals: 900 },
  ];

  // Status breakdown data
  const statusCounts = {
    AVAILABLE: submissions.filter(s => s.status === 'AVAILABLE').length,
    ANALYZING: submissions.filter(s => s.status === 'ANALYZING').length,
    MATCHED: redistributions.filter(r => r.status === 'MATCHED').length,
    ACCEPTED: redistributions.filter(r => r.status === 'ACCEPTED').length,
    IN_TRANSIT: redistributions.filter(r => r.status === 'IN_TRANSIT').length,
    REDISTRIBUTED: redistributions.filter(r => r.status === 'REDISTRIBUTED' || r.status === 'COMPLETED').length,
  };

  const statusData = [
    { status: 'Available', count: statusCounts.AVAILABLE, fill: '#1a73e8' },
    { status: 'Matched', count: statusCounts.MATCHED, fill: '#f9ab00' },
    { status: 'Accepted', count: statusCounts.ACCEPTED, fill: '#7c3aed' },
    { status: 'In Transit', count: statusCounts.IN_TRANSIT, fill: '#0097a7' },
    { status: 'Completed', count: statusCounts.REDISTRIBUTED, fill: '#1e8e3e' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#e8f0fe] via-[#f3e8fd] to-[#e6f4ea] border border-[#c2e7ff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-[#0b57d0] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-[#7c3aed]" />
            <span>Autonomous Surplus-Food Redistribution Agent</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Welcome, <span className="gemini-gradient-text capitalize">{userRole.replace('_', ' ').toLowerCase()}</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl font-medium">
            Real-time surplus food detection, AI-based urgency evaluation, deterministic recipient matching, and automated logistics tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setActiveTab('submissions')}
            className="px-4 py-2.5 rounded-full gemini-gradient-btn font-extrabold text-xs shadow-md shadow-[#1a73e8]/20 transition flex items-center space-x-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Utensils className="w-4 h-4" />
            <span>Report Surplus Food</span>
          </button>

          <button
            onClick={triggerFullAgentSimulation}
            disabled={isSimulating}
            className="px-4 py-2.5 rounded-full bg-white hover:bg-[#f0f4f9] border border-[#c2e7ff] text-[#0b57d0] font-bold text-xs shadow-xs transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Bot className="w-4 h-4 text-[#1a73e8]" />
            <span>Simulate Agent Loop</span>
          </button>
        </div>
      </div>


      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Food Recovered</span>
            <Scale className="w-4 h-4 text-[#1e8e3e]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.totalFoodRecoveredKg.toLocaleString()}</span>
            <span className="text-xs text-[#137333] font-semibold">kg ({metrics.totalMealsSaved.toLocaleString()} meals)</span>
          </div>
          <div className="flex items-center text-[10px] text-[#137333] font-medium space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% from last week</span>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Active Donations</span>
            <Utensils className="w-4 h-4 text-[#f9ab00]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.activeDonations}</span>
            <span className="text-xs text-[#b06000] font-semibold">listings active</span>
          </div>
          <div className="flex items-center text-[10px] text-slate-500 space-x-1">
            <Clock className="w-3 h-3 text-[#f9ab00]" />
            <span>Usable time window active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Successful Redistributions</span>
            <CheckCircle2 className="w-4 h-4 text-[#1a73e8]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.successfulRedistributions}</span>
            <span className="text-xs text-[#0b57d0] font-semibold">completed</span>
          </div>
          <div className="flex items-center text-[10px] text-[#0b57d0] font-medium space-x-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>98.6% delivery success rate</span>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Urgent Requests</span>
            <AlertTriangle className="w-4 h-4 text-[#d93025]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.urgentRequests}</span>
            <span className="text-xs text-[#c5221f] font-semibold">critical dispatch</span>
          </div>
          <div className="flex items-center text-[10px] text-[#c5221f] font-medium space-x-1">
            <Flame className="w-3 h-3" />
            <span>Immediate matching active</span>
          </div>
        </div>
      </div>

      {/* SDG Alignment Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SDG 2 */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#fef7e0]/60 border border-[#feefc3] flex items-start space-x-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#fef7e0] border border-[#feefc3] flex items-center justify-center shrink-0">
            <span className="font-bold text-lg text-[#b06000]">SDG 2</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Zero Hunger</h3>
              <span className="text-[10px] bg-[#fef7e0] text-[#b06000] font-bold px-2 py-0.5 rounded-full border border-[#feefc3]">Target 2.1</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Redistributing nutritious surplus meals to food-insecure individuals, community shelters, and child care centers.
            </p>
            <div className="pt-2 flex items-center space-x-4 text-xs font-bold text-[#137333]">
              <span>{metrics.totalMealsSaved.toLocaleString()} Meals Saved</span>
              <span>•</span>
              <span>{metrics.recipientsServed} Recipients Served</span>
            </div>
          </div>
        </div>

        {/* SDG 12 */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#e6f4ea]/60 border border-[#ceead6] flex items-start space-x-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#e6f4ea] border border-[#ceead6] flex items-center justify-center shrink-0">
            <span className="font-bold text-lg text-[#137333]">SDG 12</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Responsible Consumption & Production</h3>
              <span className="text-[10px] bg-[#e6f4ea] text-[#137333] font-bold px-2 py-0.5 rounded-full border border-[#ceead6]">Target 12.3</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Halving food waste through AI-driven perishable food detection and automated logistics dispatch.
            </p>
            <div className="pt-2 flex items-center space-x-4 text-xs font-bold text-[#0b57d0]">
              <span>{metrics.foodWastePreventedKg.toLocaleString()} kg Waste Diverted</span>
              <span>•</span>
              <span>{metrics.co2DivertedKg.toLocaleString()} kg CO₂ Avoided</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Recovered Food Trend */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Weekly Recovered Surplus Food</h3>
              <p className="text-xs text-slate-500 font-medium">Daily food recovery trajectory (kg & equivalent meals)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f0fe] text-[#0b57d0] border border-[#c2e7ff]">
              Live Trend
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1a73e8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#747775" fontSize={12} tickLine={false} />
                <YAxis stroke="#747775" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e1e3e1', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 12px rgba(60,64,67,0.15)' }}
                />
                <Area type="monotone" dataKey="recoveredKg" stroke="#1a73e8" strokeWidth={2} fillOpacity={1} fill="url(#colorRecovered)" name="Food Recovered (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Category Distribution</h3>
            <PieChartIcon className="w-4 h-4 text-slate-500" />
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e1e3e1', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 12px rgba(60,64,67,0.15)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <div key={cat.name} className="flex items-center space-x-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-700 font-medium truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Redistribution Status Progress Bar */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Active Redistribution Pipeline Status</h3>
            <p className="text-xs text-slate-500 font-medium">Current state breakdown of ongoing food recovery operations</p>
          </div>
          <button
            onClick={() => setActiveTab('redistribution')}
            className="text-xs text-[#0b57d0] hover:underline font-bold"
          >
            Manage Pipeline →
          </button>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} layout="vertical">
              <XAxis type="number" stroke="#747775" fontSize={12} hide />
              <YAxis dataKey="status" type="category" stroke="#444746" fontSize={12} tickLine={false} width={90} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e1e3e1', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 12px rgba(60,64,67,0.15)' }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
