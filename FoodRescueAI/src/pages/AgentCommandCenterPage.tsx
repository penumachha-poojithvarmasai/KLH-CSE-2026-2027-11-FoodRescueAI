import React from 'react';
import { useApp } from '../context/AppContext';
import type { AgentStage } from '../types';
import { 
  Bot, 
  Eye, 
  Brain, 
  GitMerge, 
  Send, 
  Activity, 
  Play, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

export const AgentCommandCenterPage: React.FC = () => {
  const { 
    agentStage, 
    isSimulating, 
    triggerFullAgentSimulation, 
    agentEvents, 
    submissions, 
    redistributions,
    aiMode 
  } = useApp();

  const stages: { id: AgentStage; title: string; icon: React.ReactNode; description: string; resultSummary: string }[] = [
    {
      id: 'OBSERVE',
      title: 'OBSERVE',
      icon: <Eye className="w-5 h-5" />,
      description: 'Detect & ingest surplus food data from canteens, events & markets',
      resultSummary: 'Food detected: 85 meals (Hot Biryani & Curry)'
    },
    {
      id: 'ANALYZE',
      title: 'ANALYZE',
      icon: <Brain className="w-5 h-5" />,
      description: 'Evaluate category, perishability, usable hours & priority score',
      resultSummary: 'Urgency: HIGH | Usable window: 4 hours | Priority: 94/100'
    },
    {
      id: 'DECIDE',
      title: 'DECIDE',
      icon: <GitMerge className="w-5 h-5" />,
      description: 'Run 5-factor recipient matching algorithm',
      resultSummary: 'Best Recipient: The Akshaya Patra Foundation (Score 94%)'
    },
    {
      id: 'ACT',
      title: 'ACT',
      icon: <Send className="w-5 h-5" />,
      description: 'Dispatch redistribution request & trigger notification signals',
      resultSummary: 'Redistribution request dispatched successfully'
    },
    {
      id: 'MONITOR',
      title: 'MONITOR',
      icon: <Activity className="w-5 h-5" />,
      description: 'Track pickup vehicle telemetry, ETA & delivery confirmation',
      resultSummary: 'Pickup in progress (Express Van #4 assigned)'
    }
  ];

  const getStageStatus = (stageId: AgentStage) => {
    if (isSimulating) {
      if (agentStage === stageId) return 'active';
      const stageOrder: AgentStage[] = ['OBSERVE', 'ANALYZE', 'DECIDE', 'ACT', 'MONITOR'];
      const currentIdx = stageOrder.indexOf(agentStage);
      const stageIdx = stageOrder.indexOf(stageId);
      return stageIdx < currentIdx ? 'completed' : 'pending';
    }
    return agentEvents.some(e => e.stage === stageId) ? 'completed' : 'pending';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>Autonomous Intelligence Center</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">FoodRescue AI Agent Command Center</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
            Autonomous decision engine executing continuous surplus food surveillance, perishability analysis, recipient matching, dispatching, and logistics monitoring.
          </p>
        </div>

        <button
          onClick={triggerFullAgentSimulation}
          disabled={isSimulating}
          className={`px-5 py-3 rounded-xl font-black text-xs shadow-md transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            isSimulating 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-600/30 active:scale-95'
          }`}
        >
          <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Executing Agent Loop...' : 'Simulate Full Agent Loop'}</span>
        </button>
      </div>


      {/* Visual Agent Lifecycle Stepper */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              5-Stage Agent Lifecycle Pipeline
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Engine: {aiMode}
          </span>
        </div>

        {/* Stepper Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {stages.map((stage, idx) => {
            const status = getStageStatus(stage.id);
            const isCurrentActive = agentStage === stage.id && isSimulating;

            return (
              <div
                key={stage.id}
                className={`p-4 rounded-xl transition-all relative flex flex-col justify-between space-y-3 ${
                  isCurrentActive
                    ? 'bg-emerald-500/10 border-2 border-emerald-500 glow-emerald animate-stage-pulse'
                    : status === 'completed'
                    ? 'bg-slate-900/90 border border-slate-700/80'
                    : 'bg-slate-950/40 border border-slate-800/50 opacity-70'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${
                    isCurrentActive 
                      ? 'bg-emerald-500 text-slate-950 font-bold' 
                      : status === 'completed' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {stage.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">0{idx + 1}</span>
                </div>

                {/* Stage Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-200">{stage.title}</h4>
                    {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">{stage.description}</p>
                </div>

                {/* Result payload snapshot */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 font-mono">
                  <span className="text-[9px] text-emerald-400 block font-semibold mb-0.5">LATEST OUTPUT:</span>
                  <p className="truncate">{stage.resultSummary}</p>
                </div>

                {/* Connecting arrow for desktop */}
                {idx < 4 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent State Summary & Execution Log & Reasoning Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Analysis & State Panel */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Agent State Machine</h3>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              isSimulating ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isSimulating ? 'RUNNING LOOP' : 'AGENT READY'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400">Current Lifecycle Stage:</span>
              <div className="text-sm font-bold text-emerald-400">{agentStage}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400">Submissions Monitored:</span>
              <div className="text-sm font-bold text-slate-200">{submissions.length} Food Listings</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400">Active Dispatch Pipelines:</span>
              <div className="text-sm font-bold text-indigo-400">{redistributions.length} Active Workflows</div>
            </div>

            {/* Human In The Loop Toggle */}
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-200">Human-In-The-Loop:</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ENABLED</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Coordinators can pause or override autonomous matching recommendations before physical vehicle dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Agent Event Log & Reasoning Tree */}
        <div className="lg:col-span-2 space-y-4">
          {/* Decision Reasoning Tree */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">5-Factor Autonomous Decision Weights</h3>
              <span className="text-[10px] text-slate-400 font-mono">Deterministic Matching Matrix</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-slate-400 block">Category Fit</span>
                <span className="font-bold text-emerald-400 text-sm">25%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-slate-400 block">Need Level</span>
                <span className="font-bold text-amber-400 text-sm">25%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-slate-400 block">Capacity Fit</span>
                <span className="font-bold text-indigo-400 text-sm">20%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-slate-400 block">Proximity / Dist</span>
                <span className="font-bold text-purple-400 text-sm">15%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-slate-400 block">Availability</span>
                <span className="font-bold text-cyan-400 text-sm">15%</span>
              </div>
            </div>
          </div>

          {/* Event Log */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Autonomous Agent Event Log</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live Audit Trail</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {agentEvents.map(evt => (
                <div key={evt.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        evt.stage === 'OBSERVE' ? 'bg-blue-500/20 text-blue-400' :
                        evt.stage === 'ANALYZE' ? 'bg-purple-500/20 text-purple-400' :
                        evt.stage === 'DECIDE' ? 'bg-amber-500/20 text-amber-400' :
                        evt.stage === 'ACT' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {evt.stage}
                      </span>
                      <span className="font-semibold text-slate-200">{evt.message}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans pl-1">{evt.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

