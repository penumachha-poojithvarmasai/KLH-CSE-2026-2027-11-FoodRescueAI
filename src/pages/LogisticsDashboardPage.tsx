import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { GeographicMap } from '../components/map/GeographicMap';
import type { RedistributionStatus } from '../types';
import { 
  Truck, 
  CheckCircle2, 
  Navigation, 
  ChevronRight,
  Thermometer,
  ShieldCheck,
  PhoneCall,
  UserCheck,
  Repeat
} from 'lucide-react';

export const LogisticsDashboardPage: React.FC = () => {
  const { pickups, updatePickupStatus, recipients, submissions, setActiveTab } = useApp();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const filteredPickups = pickups.filter(p => {
    if (activeFilter === 'ACTIVE') return p.currentStatus !== 'COMPLETED' && p.currentStatus !== 'REDISTRIBUTED';
    if (activeFilter === 'COMPLETED') return p.currentStatus === 'COMPLETED' || p.currentStatus === 'REDISTRIBUTED';
    return true;
  });

  const activePickups = pickups.filter(p => p.currentStatus !== 'COMPLETED' && p.currentStatus !== 'REDISTRIBUTED');
  const inTransitCount = pickups.filter(p => p.currentStatus === 'IN_TRANSIT').length;
  const completedCount = pickups.filter(p => p.currentStatus === 'COMPLETED' || p.currentStatus === 'REDISTRIBUTED').length;

  const getNextStatus = (current: RedistributionStatus): RedistributionStatus => {
    switch (current) {
      case 'MATCHED':
      case 'ACCEPTED':
      case 'PICKUP_REQUESTED':
        return 'PICKUP_CONFIRMED';
      case 'PICKUP_CONFIRMED':
        return 'IN_TRANSIT';
      case 'IN_TRANSIT':
        return 'REDISTRIBUTED';
      case 'REDISTRIBUTED':
        return 'COMPLETED';
      default:
        return 'COMPLETED';
    }
  };

  const [selectedPickupId, setSelectedPickupId] = useState<string>(pickups[0]?.id || 'pick-401');
  const selectedPickup = pickups.find(p => p.id === selectedPickupId) || pickups[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Logistics Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 border border-sky-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-sky-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4 text-sky-600" />
            <span>Logistics & Dispatch Operations Command • Active Workspace</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">{user?.name || 'James Rodriguez'} — Logistics Control</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl font-medium">
            Real-time pickup coordination, volunteer driver dispatch, cold-chain verification, and route waypoints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('redistribution')}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm border border-slate-700 cursor-pointer"
          >
            <Repeat className="w-4 h-4 text-emerald-400" />
            <span>Redistribution & Fleet Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <div className="p-3.5 rounded-2xl bg-white border border-sky-300 text-xs text-right space-y-0.5 shadow-sm">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Active Eco Fleet</span>
            <span className="font-black text-sky-700 text-sm">4 Electric Vans Active</span>
          </div>
        </div>
      </div>


      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Pickups</span>
            <Truck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{activePickups.length}</div>
          <span className="text-[10px] text-indigo-400 font-medium">Currently queued / active</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>In-Transit Vans</span>
            <Navigation className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{inTransitCount}</div>
          <span className="text-[10px] text-purple-400 font-medium">En route to shelter</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Completed Deliveries</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{completedCount}</div>
          <span className="text-[10px] text-emerald-400 font-medium">Successfully delivered</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Cold-Chain Temp</span>
            <Thermometer className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">3.8 °C</div>
          <span className="text-[10px] text-emerald-400 font-medium">Optimal refrigerated transit</span>
        </div>
      </div>

      {/* Interactive Live Logistics Route Map */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Navigation className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
            <h3 className="font-bold text-sm text-slate-100">Live Geospatial Transit Route & Telemetry Visualizer</h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>REAL-TIME GPS TELEMETRY</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Real OpenStreetMap Geographic Map */}
          <div className="lg:col-span-2">
            <GeographicMap
              recipients={recipients}
              submissions={submissions}
              selectedPickup={selectedPickup}
              height="350px"
            />
          </div>

          {/* Active Route Telemetry Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Active Waypoint Telemetry</span>
              <h4 className="font-bold text-slate-100 text-sm">{selectedPickup?.providerName} → {selectedPickup?.recipientName}</h4>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Coordinator / Driver:</span>
                <span className="font-semibold text-slate-200">{selectedPickup?.coordinatorName || 'Alex Rivera'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Driver Contact:</span>
                <span className="font-mono text-indigo-300">{selectedPickup?.driverPhone || '+91 98765 90123'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Cargo Temp Sensor:</span>
                <span className="font-mono text-emerald-400 font-bold">3.8 °C (Compliant)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">EV Battery Charge:</span>
                <span className="font-mono text-cyan-400 font-bold">84% (Range ~140 km)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 h-full w-[65%]" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Intake Complete</span>
                <span className="text-indigo-400 font-bold">In-Transit (65%)</span>
                <span>Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Logistics Dispatch Control List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-slate-200">Pickup Dispatch Tasks & Route Waypoints</h3>

          <div className="flex items-center space-x-1.5 text-xs">
            {['ALL', 'ACTIVE', 'COMPLETED'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  activeFilter === f 
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' 
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPickups.map(pickup => {
            const nextSt = getNextStatus(pickup.currentStatus);
            const isSelected = pickup.id === selectedPickupId;

            return (
              <div 
                key={pickup.id} 
                onClick={() => setSelectedPickupId(pickup.id)}
                className={`p-5 rounded-2xl glass-panel border space-y-4 transition cursor-pointer ${
                  isSelected ? 'border-indigo-500/80 bg-slate-900/90 shadow-indigo-500/10 shadow-lg' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">DISPATCH #{pickup.id}</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/30 uppercase">
                        {pickup.currentStatus}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                          VIEWING ON MAP
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-base text-slate-100 mt-0.5">{pickup.providerName} → {pickup.recipientName}</h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    {pickup.currentStatus !== 'COMPLETED' && pickup.currentStatus !== 'REDISTRIBUTED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePickupStatus(pickup.id, nextSt);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition flex items-center space-x-1.5 active:scale-95"
                      >
                        <span>Advance to {nextSt}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>


                {/* Interactive Waypoint Route Step Bar */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Route Waypoint Progress:</span>
                    <span className="text-emerald-400 font-mono flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Cold Chain Validated (4.0°C)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className={`p-2 rounded-lg border ${
                      pickup.currentStatus === 'ACCEPTED' || pickup.currentStatus === 'PICKUP_CONFIRMED' || pickup.currentStatus === 'IN_TRANSIT' || pickup.currentStatus === 'COMPLETED'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      <span>1. Pickup Canteen</span>
                    </div>

                    <div className={`p-2 rounded-lg border ${
                      pickup.currentStatus === 'IN_TRANSIT' || pickup.currentStatus === 'REDISTRIBUTED' || pickup.currentStatus === 'COMPLETED'
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      <span>2. Eco Van Transit</span>
                    </div>

                    <div className={`p-2 rounded-lg border ${
                      pickup.currentStatus === 'REDISTRIBUTED' || pickup.currentStatus === 'COMPLETED'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      <span>3. Recipient Shelter</span>
                    </div>
                  </div>
                </div>

                {/* Detail Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">PICKUP LOCATION</span>
                    <p className="font-medium text-slate-200">{pickup.pickupAddress}</p>
                    <span className="text-[10px] text-emerald-400 block font-mono">Est. Pickup: {pickup.estimatedPickup}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">DESTINATION NGO</span>
                    <p className="font-medium text-slate-200">{pickup.destinationAddress}</p>
                    <span className="text-[10px] text-indigo-400 block font-mono">Est. Delivery: {pickup.estimatedArrival}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">ASSIGNED DRIVER</span>
                    <p className="font-medium text-slate-200 flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{pickup.coordinatorName}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                      <PhoneCall className="w-3 h-3 text-slate-400" />
                      <span>{pickup.driverPhone}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
