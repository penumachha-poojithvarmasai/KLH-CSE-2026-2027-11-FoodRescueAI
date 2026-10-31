import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MatchingEngine } from '../services/matching/matchingEngine';
import { 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  Utensils, 
  Filter,
  Truck,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const RecipientDashboardPage: React.FC = () => {
  const { submissions, recipients, redistributions, dispatchToRecipient, pickups } = useApp();
  const { user } = useAuth();

  const fallbackRecipient: any = {
    id: 'rec-fallback',
    name: user?.organization || user?.name || 'Community Recipient',
    organizationType: 'Shelter',
    distanceKm: 2.5,
    requiredQuantity: 100,
    availableCapacity: 100,
    foodCompatibility: ['Cooked Meals', 'Bakery'],
    currentNeedLevel: 'MEDIUM',
    availabilityHours: '8:00 AM - 9:00 PM',
    location: { address: 'Hyderabad Central Hub', lat: 17.3850, lng: 78.4867 },
    contactPerson: user?.name || 'Coordinator',
    phone: '+91 98765 00000'
  };

  const currentRecipient = (recipients && recipients.length > 0)
    ? (recipients.find(r => 
        (user?.name && r.name && r.name.toLowerCase().includes(user.name.toLowerCase())) ||
        (user?.organization && r.name && r.name.toLowerCase().includes(user.organization.toLowerCase()))
      ) || recipients[0])
    : fallbackRecipient;

  const [filterMinScore, setFilterMinScore] = useState<number>(70);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Compute matches specifically for this recipient across available submissions
  const recommendedMatches = submissions
    .map(sub => {
      const matchResults = MatchingEngine.calculateMatches(sub, [currentRecipient]);
      return {
        submission: sub,
        match: matchResults[0]
      };
    })
    .filter(item => item.match && item.match.overallScore >= filterMinScore)
    .sort((a, b) => b.match.overallScore - a.match.overallScore);

  const acceptedRedistributions = redistributions.filter(r => r.matchedRecipientId === currentRecipient?.id || r.recipient?.name === currentRecipient?.name);
  const activeDeliveries = pickups.filter(p => p.recipientName === currentRecipient?.name || p.currentStatus === 'IN_TRANSIT');

  return (
    <div className="space-y-6 pb-12">
      {/* Recipient Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border border-amber-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Recipient Organization Portal • Active Workspace</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">{user?.name || currentRecipient.name}</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl font-medium">
            Browse AI-matched surplus food listings, claim donations, and track incoming logistics deliveries to your shelter.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-white border border-amber-300 text-xs text-right space-y-0.5 shadow-sm">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Daily Serving Need</span>
            <div className="flex items-center space-x-1.5 justify-end">
              <span className="font-black text-emerald-700 text-sm">{currentRecipient.availableCapacity} / {currentRecipient.requiredQuantity} Meals</span>
            </div>
          </div>
        </div>
      </div>


      {/* Recipient Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Recommended Matches</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{recommendedMatches.length}</div>
          <span className="text-[10px] text-emerald-400 font-medium">Compatibility &gt; {filterMinScore}%</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Accepted & Claimed</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{acceptedRedistributions.length}</div>
          <span className="text-[10px] text-indigo-400 font-medium">Claimed donations</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Incoming Deliveries</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{activeDeliveries.length}</div>
          <span className="text-[10px] text-amber-400 font-medium">En route to shelter</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Daily Unmet Need</span>
            <Users className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{Math.max(0, currentRecipient.requiredQuantity - currentRecipient.availableCapacity)}</div>
          <span className="text-[10px] text-rose-400 font-medium">Additional servings needed</span>
        </div>
      </div>

      {/* Active Incoming Deliveries Tracker Section */}
      {activeDeliveries.length > 0 && (
        <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Truck className="w-5 h-5 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-200">Active Incoming Shipments to Shelter</h3>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              LIVE DISPATCH TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDeliveries.map(del => (
              <div key={del.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 text-sm">Shipment #{del.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {del.currentStatus}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p><strong className="text-slate-200">Origin Canteen:</strong> {del.providerName}</p>
                  <p><strong className="text-slate-200">Assigned Driver:</strong> {del.coordinatorName} ({del.driverPhone})</p>
                  <p className="flex items-center space-x-1 text-emerald-400 pt-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Est. Arrival at Shelter: {del.estimatedArrival}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Matches Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-200">
              AI-Recommended Surplus Food Listings
            </h3>
            <p className="text-xs text-slate-400">Deterministic 5-factor scoring tailored to your shelter's needs</p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterMinScore}
              onChange={(e) => setFilterMinScore(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:border-amber-500"
            >
              <option value={85}>OPTIMAL Matches (&gt;85%)</option>
              <option value={70}>GOOD Matches (&gt;70%)</option>
              <option value={50}>ALL Matches (&gt;50%)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendedMatches.length === 0 ? (
            <div className="col-span-2 p-8 text-center glass-panel rounded-2xl text-slate-400 text-xs space-y-2">
              <Utensils className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No active food matches meeting the selected threshold ({filterMinScore}%).</p>
            </div>
          ) : (
            recommendedMatches.map(({ submission: sub, match }) => {
              const isExpanded = expandedMatchId === sub.id;

              return (
                <div key={sub.id} className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 space-y-4 flex flex-col justify-between transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        MATCH SCORE: {match.overallScore}%
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{sub.remainingHours}h Usable Window</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-slate-100">{sub.foodName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Provider: <strong className="text-slate-200">{sub.providerName}</strong> • Quantity: <strong className="text-emerald-400">{sub.quantity} {sub.unit}</strong> (~{sub.estimatedServings} servings)
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{sub.location.address}</span>
                      </span>
                      <span className="text-slate-300 font-mono text-[11px]">{currentRecipient.distanceKm} km away</span>
                    </div>

                    {/* Score Matrix Breakdown Toggle */}
                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                      <button
                        type="button"
                        onClick={() => setExpandedMatchId(isExpanded ? null : sub.id)}
                        className="w-full flex items-center justify-between text-[11px] font-semibold text-emerald-400 hover:underline"
                      >
                        <span>Explainable AI 5-Factor Score Matrix</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[10px] text-slate-300">
                          <div className="flex items-center justify-between">
                            <span>1. Category Compatibility</span>
                            <span className="font-mono text-emerald-400">{match.breakdown.categoryCompatibilityScore} / 25 pts</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>2. Recipient Need Urgency</span>
                            <span className="font-mono text-emerald-400">{match.breakdown.needLevelScore} / 25 pts</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>3. Storage Capacity Fit</span>
                            <span className="font-mono text-emerald-400">{match.breakdown.capacityMatchScore} / 20 pts</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>4. Geographic Proximity</span>
                            <span className="font-mono text-emerald-400">{match.breakdown.distanceScore} / 15 pts</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>5. Usable Time Window</span>
                            <span className="font-mono text-emerald-400">{match.breakdown.availabilityScore} / 15 pts</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => dispatchToRecipient(sub.id, currentRecipient.id)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept & Claim Rescue Batch</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
