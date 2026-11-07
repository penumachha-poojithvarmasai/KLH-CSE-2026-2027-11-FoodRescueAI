import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { GeographicMap } from '../components/map/GeographicMap';
import type { RedistributionStatus } from '../types';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  User, 
  ChevronRight
} from 'lucide-react';

export const PickupTrackerPage: React.FC = () => {
  const { pickups, updatePickupStatus, recipients, submissions } = useApp();
  const { userRole } = useAuth();

  const timelineSteps: { status: RedistributionStatus; label: string }[] = [
    { status: 'MATCHED', label: 'Matched' },
    { status: 'ACCEPTED', label: 'Accepted' },
    { status: 'PICKUP_REQUESTED', label: 'Pickup Requested' },
    { status: 'PICKUP_CONFIRMED', label: 'Pickup Confirmed' },
    { status: 'IN_TRANSIT', label: 'In Transit' },
    { status: 'REDISTRIBUTED', label: 'Redistributed' },
    { status: 'COMPLETED', label: 'Completed' }
  ];

  const getStepIndex = (status: RedistributionStatus) => {
    const idx = timelineSteps.findIndex(s => s.status === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Step 5: MONITOR — Real-time Pickup & Logistics Telemetry</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Pickup & Redistribution Tracker</h2>
          <p className="text-xs text-slate-400 mt-1">
            Live shipment tracking, driver coordinator details, route visualization, and department handoff confirmation.
          </p>
        </div>
      </div>

      {/* Pickups List */}
      <div className="space-y-6">
        {pickups.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 text-xs text-slate-400">
            No active pickup tasks currently queued. Submitting a food item will automatically dispatch logistics tasks.
          </div>
        ) : (
          pickups.map(pickup => {
            const currentIdx = getStepIndex(pickup.currentStatus);

            return (
              <div key={pickup.id} className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">TASK #{pickup.id}</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">
                        {pickup.currentStatus}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-100">{pickup.providerName} → {pickup.recipientName}</h3>
                  </div>

                  {/* Department-Specific Status Action Control */}
                  {currentIdx < timelineSteps.length - 1 && (
                    <button
                      onClick={() => {
                        const nextState = timelineSteps[currentIdx + 1].status;
                        updatePickupStatus(pickup.id, nextState);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center space-x-1.5 self-start sm:self-center"
                    >
                      <span>
                        {userRole === 'FOOD_PROVIDER'
                          ? 'Confirm Canteen Driver Handoff'
                          : userRole === 'RECIPIENT'
                          ? 'Confirm Delivery at Shelter'
                          : `Advance to ${timelineSteps[currentIdx + 1].label}`}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Visual Shipment Timeline Stepper */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logistics Timeline Stepper</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {timelineSteps.map((step, idx) => {
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div
                          key={step.status}
                          className={`p-2.5 rounded-xl text-center space-y-1 border transition ${
                            isCurrent
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold glow-emerald'
                              : isCompleted
                              ? 'bg-slate-900 border-slate-700 text-slate-200'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-slate-700" />
                            )}
                          </div>
                          <span className="text-[10px] block truncate">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Logistics Info & Route Map Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Provider & Destination Addresses */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                    <h4 className="font-bold text-slate-300 flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Route Waypoints</span>
                    </h4>

                    <div className="space-y-2 pl-2 border-l-2 border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">PICKUP LOCATION</span>
                        <p className="text-slate-200 font-medium">{pickup.pickupAddress}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">DESTINATION</span>
                        <p className="text-slate-200 font-medium">{pickup.destinationAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Driver Coordinator */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                    <h4 className="font-bold text-slate-300 flex items-center space-x-1.5">
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>Assigned Coordinator</span>
                    </h4>

                    <div className="space-y-1.5">
                      <p className="text-slate-200 font-semibold">{pickup.coordinatorName}</p>
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{pickup.driverPhone}</span>
                      </div>
                      <div className="pt-2 text-[11px] text-slate-400">
                        Total Distance: <strong className="text-slate-200">{pickup.distanceKm} km</strong>
                      </div>
                    </div>
                  </div>

                  {/* ETAs */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                    <h4 className="font-bold text-slate-300 flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Estimated Telemetry</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Est. Pickup</span>
                        <span className="font-bold text-amber-400">{pickup.estimatedPickup}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Est. Arrival</span>
                        <span className="font-bold text-emerald-400">{pickup.estimatedArrival}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real OpenStreetMap Transit Route Map */}
                <div className="pt-2">
                  <GeographicMap
                    recipients={recipients}
                    submissions={submissions}
                    selectedPickup={pickup}
                    height="220px"
                    showAllRecipients={false}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
