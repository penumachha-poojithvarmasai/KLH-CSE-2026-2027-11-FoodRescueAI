import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Utensils, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Sparkles,
  ChevronRight,
  Clock,
  RefreshCw,
  Award,
  Zap
} from 'lucide-react';

export const ProviderDashboardPage: React.FC = () => {
  const { 
    submissions, 
    redistributions, 
    setActiveTab, 
    runAIAnalysisForSubmission,
    metrics
  } = useApp();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const filteredSubmissions = submissions.filter(s => {
    if (selectedCategory === 'ALL') return true;
    return s.category.toUpperCase().includes(selectedCategory.toUpperCase());
  });

  const activeSubmissions = submissions.filter(s => s.status !== 'COMPLETED' && s.status !== 'EXPIRED');
  const urgentItems = submissions.filter(s => s.urgency === 'HIGH' || s.urgency === 'CRITICAL');
  const completedRedistributions = redistributions.filter(r => r.status === 'COMPLETED' || r.status === 'REDISTRIBUTED');

  const handleReAnalyze = async (subId: string) => {
    setAnalyzingId(subId);
    await runAIAnalysisForSubmission(subId);
    setTimeout(() => setAnalyzingId(null), 800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Provider Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>Food Provider Portal • Active Workspace</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">{user?.name || 'Grand Horizon Canteen'}</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl font-medium">
            Log edible surplus food, track real-time AI urgency scores, and monitor automated recipient handoffs.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setActiveTab('submissions')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition flex items-center space-x-2 shrink-0 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Surplus Food Batch</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Active Surplus Listings</span>
            <Utensils className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeSubmissions.length}</div>
          <span className="text-[10px] text-emerald-700 font-bold">Awaiting matching & pickup</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Urgent Dispatches (&lt;6h)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{urgentItems.length}</div>
          <span className="text-[10px] text-rose-600 font-bold">Critical usable window</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Completed Handoffs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completedRedistributions.length}</div>
          <span className="text-[10px] text-emerald-700 font-bold">Meals served to NGOs</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>Active Pickups</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{redistributions.filter(r => r.status === 'IN_TRANSIT' || r.status === 'ACCEPTED').length}</div>
          <span className="text-[10px] text-amber-700 font-bold">Vehicle en route to canteen</span>
        </div>
      </div>

      {/* Provider Environmental Impact Highlight */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Provider Sustainability Record</h4>
            <p className="text-xs text-slate-600">
              Your canteen has prevented food waste and supplied high-grade nutrition to local community shelters.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-semibold">CO₂ Offset</span>
            <span className="font-extrabold text-emerald-700 text-sm">{(metrics.co2DivertedKg * 0.4).toFixed(0)} kg</span>
          </div>
          <div className="text-right">

            <span className="text-[10px] text-slate-400 block font-semibold">Meals Donated</span>
            <span className="font-bold text-indigo-400 text-sm">{(metrics.totalMealsSaved * 0.35).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Active Food Listings Table & Filters */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-200">Surplus Food Listings & Usable Time Windows</h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px]">
            {['ALL', 'COOKED MEALS', 'BAKERY', 'PRODUCE'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredSubmissions.map(sub => {
            const isAnalyzingThis = analyzingId === sub.id;
            const remaining = sub.remainingHours || 4;
            const totalH = 12;
            const pctRemaining = Math.max(0, Math.min(100, (remaining / totalH) * 100));

            return (
              <div key={sub.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4 hover:border-slate-700 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-100 text-base">{sub.foodName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        sub.urgency === 'CRITICAL' 
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                          : sub.urgency === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {sub.urgency} URGENCY
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Category: <strong className="text-slate-200">{sub.category}</strong> • Quantity: <strong className="text-emerald-400">{sub.quantity} {sub.unit}</strong> (~{sub.estimatedServings} servings) • Storage: <strong className="text-slate-200">{sub.storageCondition}</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleReAnalyze(sub.id)}
                      disabled={isAnalyzingThis}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingThis ? 'animate-spin' : ''}`} />
                      <span>{isAnalyzingThis ? 'Analyzing...' : 'AI Re-score'}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('matching')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1 transition"
                    >
                      <span>View Matches</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expiry Bar & Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left: Time Remaining Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Usable Window Remaining</span>
                      </span>
                      <span className="font-bold text-amber-400 font-mono">{remaining}h left</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          pctRemaining < 30 ? 'bg-rose-500' : pctRemaining < 60 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${pctRemaining}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: AI Score Summary */}
                  {sub.aiAnalysis && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-indigo-400" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">AI Priority Score</span>
                          <span className="font-bold text-indigo-300 text-xs">{sub.aiAnalysis.priorityScore} / 100</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 italic truncate max-w-[180px]">
                        {sub.aiAnalysis.recommendedAction || 'Recommended for instant recipient dispatch.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
