import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { RedistributionStatus } from '../types';
import { 
  Repeat, 
  CheckCircle2, 
  Truck, 
  ArrowRight, 
  ChevronRight, 
  Filter, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  Navigation, 
  ArrowUpRight 
} from 'lucide-react';

export const RedistributionPage: React.FC = () => {
  const { redistributions, updateRedistributionStatus, setActiveTab, pickups } = useApp();
  const { userRole } = useAuth();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isLogisticsAuthorized = userRole === 'LOGISTICS_COORDINATOR' || userRole === 'ADMIN';

  const filteredItems = redistributions.filter(r => {
    if (selectedStatusFilter === 'ALL') return true;
    return r.status === selectedStatusFilter;
  });

  // Default selection to first item if none or current selected is filtered out
  const activeSelectedItem = redistributions.find(r => r.id === selectedItemId) || filteredItems[0] || null;
  const linkedPickup = activeSelectedItem ? pickups.find(p => p.redistributionId === activeSelectedItem.id) : null;

  const getNextPossibleStatus = (status: RedistributionStatus): RedistributionStatus | null => {
    switch (status) {
      case 'AVAILABLE': return 'ANALYZING';
      case 'ANALYZING': return 'MATCHED';
      case 'MATCHED': return 'REQUESTED';
      case 'REQUESTED': return 'ACCEPTED';
      case 'ACCEPTED': return 'PICKUP_REQUESTED';
      case 'PICKUP_REQUESTED': return 'PICKUP_CONFIRMED';
      case 'PICKUP_CONFIRMED': return 'IN_TRANSIT';
      case 'IN_TRANSIT': return 'REDISTRIBUTED';
      case 'REDISTRIBUTED': return 'COMPLETED';
      default: return null;
    }
  };

  const handleAdvanceStatus = async (itemId: string, nextStatus: RedistributionStatus) => {
    setIsUpdating(true);
    setActionError(null);
    try {
      await updateRedistributionStatus(itemId, nextStatus);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update status in backend.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeStyle = (status: RedistributionStatus) => {
    switch (status) {
      case 'MATCHED': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'ACCEPTED': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'PICKUP_REQUESTED': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'PICKUP_CONFIRMED': case 'IN_TRANSIT': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'REDISTRIBUTED': case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Repeat className="w-4 h-4" />
            <span>Step 4: ACT — Autonomous Redistribution Pipeline</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Redistribution Workflow Engine</h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end state transitions across 10 lifecycle stages from surplus detection to verified recipient delivery.
          </p>
        </div>

        {/* Right Controls: Role indicator & Status Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 ${
            isLogisticsAuthorized 
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-300' 
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isLogisticsAuthorized ? 'Logistics Coordinator Control Active' : `${userRole} (Read-Only Tracking)`}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses ({redistributions.length})</option>
              <option value="AVAILABLE">Available</option>
              <option value="MATCHED">Matched</option>
              <option value="PICKUP_REQUESTED">Pickup Requested</option>
              <option value="PICKUP_CONFIRMED">Pickup Confirmed</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="REDISTRIBUTED">Redistributed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-rose-200 font-bold ml-4">✕</button>
        </div>
      )}

      {/* State Machine Pipeline Overview */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800 hidden lg:flex items-center justify-between text-xs font-semibold text-slate-400 overflow-x-auto">
        <span className="text-slate-200 shrink-0 mr-3">Lifecycle Pipeline:</span>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">AVAILABLE</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">MATCHED</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">PICKUP_REQUESTED</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">PICKUP_CONFIRMED</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">IN_TRANSIT</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">COMPLETED</span>
        </div>
      </div>

      {/* Main Grid: Left Items List + Right Active Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Allocations List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800 text-xs text-slate-400">
              No redistributions currently match the selected filter.
            </div>
          ) : (
            filteredItems.map(item => {
              const isSelected = activeSelectedItem?.id === item.id;
              const nextStatus = getNextPossibleStatus(item.status);
              const foodTitle = item.submission?.foodName || 'Surplus Food Batch';
              const provider = item.submission?.providerName || 'Surplus Food Donor';
              const quantityStr = `${item.submission?.quantity ?? 0} ${item.submission?.unit || 'units'}`;
              const categoryStr = item.submission?.category || 'Cooked Meals';
              const recipientName = item.recipient?.name || 'Designated Shelter Recipient';
              const remainingWindow = item.submission?.remainingHours ?? 4;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-5 rounded-2xl glass-panel border transition cursor-pointer space-y-4 ${
                    isSelected 
                      ? 'border-emerald-500/80 bg-slate-900/90 shadow-lg shadow-emerald-500/10' 
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-emerald-400 font-bold">#{item.id}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(item.status)}`}>
                          {item.status}
                        </span>
                        {item.matchScore && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                            Match Score: <strong>{item.matchScore}%</strong>
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>Inspecting</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-100">{foodTitle}</h3>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      {nextStatus && isLogisticsAuthorized && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleAdvanceStatus(item.id, nextStatus)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Advance to {nextStatus}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setActiveTab('pickup')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Track Pickup</span>
                      </button>
                    </div>
                  </div>

                  {/* Details Triple Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block font-medium">Origin / Food Provider</span>
                      <span className="font-semibold text-slate-200 block truncate">{provider}</span>
                      <span className="text-[11px] text-slate-400 block">{quantityStr} ({categoryStr})</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block font-medium">Destination / Recipient</span>
                      <span className="font-semibold text-emerald-400 block truncate">{recipientName}</span>
                      <span className="text-[11px] text-slate-400 block truncate">{item.recipient?.location?.address || 'Designated Community Center'}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block font-medium">Usability Window</span>
                      <span className="font-semibold text-amber-400 block">{remainingWindow}h Remaining</span>
                      <span className="text-[11px] text-slate-400 block">
                        Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </div>
                  </div>

                  {/* Audit Log Compact Preview */}
                  {item.timeline && item.timeline.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Latest Audit Transition</span>
                        <span className="text-slate-500">{item.timeline.length} total events</span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-300 font-bold w-32 shrink-0">{item.timeline[item.timeline.length - 1].status}</span>
                        <span className="flex-1 truncate">{item.timeline[item.timeline.length - 1].note}</span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {new Date(item.timeline[item.timeline.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Allocation & Route Telemetry Inspector */}
        <div className="lg:col-span-1">
          {activeSelectedItem ? (
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 sticky top-4 space-y-5 bg-slate-900/90 shadow-xl">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Allocation Inspector</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(activeSelectedItem.status)}`}>
                    {activeSelectedItem.status}
                  </span>
                </div>
                <h3 className="font-black text-lg text-slate-100 mt-1">
                  {activeSelectedItem.submission?.foodName || 'Surplus Allocation Details'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reference: <span className="font-mono text-slate-300 font-bold">#{activeSelectedItem.id}</span>
                </p>
              </div>

              {/* Waypoint Route Details */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logistics Route Waypoints</span>
                <div className="space-y-2 relative pl-6 border-l-2 border-slate-800">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-950" />
                    <span className="text-[10px] text-indigo-400 font-bold block uppercase">Intake Point (Origin)</span>
                    <span className="text-xs font-semibold text-slate-200 block">
                      {activeSelectedItem.submission?.providerName || 'Food Provider'}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {activeSelectedItem.submission?.location?.address || 'Pickup address on file'}
                    </span>
                  </div>

                  <div className="relative pt-2">
                    <div className="absolute -left-[31px] top-2.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    <span className="text-[10px] text-emerald-400 font-bold block uppercase">Drop-Off Point (Destination)</span>
                    <span className="text-xs font-semibold text-slate-200 block">
                      {activeSelectedItem.recipient?.name || 'Community Recipient'}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {activeSelectedItem.recipient?.location?.address || 'Shelter delivery address on file'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Food & Cargo Properties */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Food Cargo Telemetry</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Quantity:</span>
                    <span className="font-semibold text-slate-200">
                      {activeSelectedItem.submission?.quantity ?? 0} {activeSelectedItem.submission?.unit || 'units'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Storage:</span>
                    <span className="font-semibold text-slate-200">
                      {activeSelectedItem.submission?.storageCondition || 'Standard'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Perishability:</span>
                    <span className="font-semibold text-amber-400">
                      {activeSelectedItem.submission?.perishability || 'MEDIUM'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Usable Window:</span>
                    <span className="font-semibold text-emerald-400">
                      {activeSelectedItem.submission?.remainingHours ?? 4} Hours
                    </span>
                  </div>
                </div>
              </div>

              {/* Driver & Telemetry (if linked pickup exists) */}
              {linkedPickup && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1">
                      <Truck className="w-3 h-3" />
                      <span>Assigned Dispatch Van</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{linkedPickup.id}</span>
                  </div>
                  <div className="text-slate-300 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Driver/Coordinator:</span>
                      <span className="font-semibold text-slate-200">{linkedPickup.coordinatorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Driver Phone:</span>
                      <span className="font-mono text-indigo-300 font-semibold">{linkedPickup.driverPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Arrival:</span>
                      <span className="font-semibold text-emerald-400">{linkedPickup.estimatedArrival}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons for Selected Allocation */}
              <div className="space-y-2 pt-2">
                {getNextPossibleStatus(activeSelectedItem.status) && isLogisticsAuthorized && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleAdvanceStatus(activeSelectedItem.id, getNextPossibleStatus(activeSelectedItem.status)!)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Advance State: {getNextPossibleStatus(activeSelectedItem.status)}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {!isLogisticsAuthorized && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 text-center">
                    Switch role to <strong>Logistics Coordinator</strong> to advance delivery state machine.
                  </div>
                )}

                <button
                  onClick={() => setActiveTab('logistics')}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-center space-x-2 border border-slate-700 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  <span>Inspect in GIS Logistics Command</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Complete Audit Trail */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Lifecycle Audit Trail</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeSelectedItem.timeline?.map((t, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-emerald-400 font-bold">{t.status}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-tight">{t.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 text-xs text-slate-400">
              Select an allocation from the list to inspect telemetry and route details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
