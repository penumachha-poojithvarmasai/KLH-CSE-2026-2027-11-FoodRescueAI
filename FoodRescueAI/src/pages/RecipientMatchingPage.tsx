import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MatchingEngine } from '../services/matching/matchingEngine';
import { GeographicMap } from '../components/map/GeographicMap';
import type { RecipientMatch } from '../types';
import { 
  GitMerge, 
  MapPin, 
  Send, 
  Sparkles, 
  Filter, 
  Map as MapIcon,
  CheckCircle2,
  Truck
} from 'lucide-react';

export const RecipientMatchingPage: React.FC = () => {
  const { submissions, recipients, redistributions, dispatchToRecipient, setActiveTab } = useApp();
  const { userRole } = useAuth();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(submissions[0]?.id || '');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [inspectMatch, setInspectMatch] = useState<RecipientMatch | null>(null);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [selectedRecipientForRoute, setSelectedRecipientForRoute] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  const currentSubmission = submissions.find(s => s.id === selectedSubmissionId) || submissions[0];
  const effectiveSubmissionId = currentSubmission?.id || '';

  // Detect if current submission has an existing persistent redistribution record
  const existingRedistribution = currentSubmission
    ? redistributions.find(
        r => (r.submissionId === currentSubmission.id || r.submission?.id === currentSubmission.id) &&
             r.status !== 'CANCELLED' && r.status !== 'REJECTED'
      )
    : undefined;

  // The submission is considered approved/dispatched if active redistribution exists
  // OR the submission status itself is beyond initial intake (AVAILABLE/ANALYZING)
  const isDispatched = Boolean(
    existingRedistribution ||
    (currentSubmission && currentSubmission.status !== 'AVAILABLE' && currentSubmission.status !== 'ANALYZING')
  );

  const approvedRecipientId = existingRedistribution?.matchedRecipientId || existingRedistribution?.recipient?.id;
  const approvedRecipient = recipients.find(r => r.id === approvedRecipientId) || existingRedistribution?.recipient;

  const getApprovalStatusLabel = () => {
    const status = existingRedistribution?.status || currentSubmission?.status;
    switch (status) {
      case 'MATCHED':
        return 'Dispatch Approved';
      case 'PICKUP_REQUESTED':
        return 'Approved — Pickup Pending';
      case 'ACCEPTED':
        return 'Approved — Pickup Accepted';
      case 'PICKUP_CONFIRMED':
        return 'Approved — Pickup Confirmed';
      case 'IN_TRANSIT':
        return 'Dispatched — In Transit';
      case 'REDISTRIBUTED':
      case 'COMPLETED':
        return 'Dispatched — Delivered';
      default:
        return 'Dispatch Approved';
    }
  };

  const handleViewLogistics = () => {
    if (userRole === 'RECIPIENT') {
      setActiveTab('redistribution');
    } else {
      setActiveTab('pickup');
    }
  };

  // Calculate matches dynamically using the 5-factor scoring engine
  const matches: RecipientMatch[] = currentSubmission 
    ? MatchingEngine.calculateMatches(currentSubmission, recipients)
    : [];

  const filteredMatches = matches.filter(m => {
    if (filterCategory === 'ALL') return true;
    return m.suitabilityStatus === filterCategory;
  });

  const handleDispatch = async (recipientId: string) => {
    if (!currentSubmission || isDispatching) return;
    try {
      setIsDispatching(true);
      await dispatchToRecipient(currentSubmission.id, recipientId);
      // Stay on page so provider can see the persistent approved state directly
      // without invalid redirect bounces
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GitMerge className="w-4 h-4" />
            <span>Step 3: DECIDE — Context-Aware Recipient Matching</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Recipient Matching Engine</h2>
          <p className="text-xs text-slate-400 mt-1">
            5-factor explainable scoring algorithm evaluating Category Compatibility, Need Level, Capacity, Distance, and Availability.
          </p>
        </div>

        {/* Submission Selector */}
        {submissions.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Target Listing:</span>
            <select
              value={effectiveSubmissionId}
              onChange={(e) => setSelectedSubmissionId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
            >
              {submissions.map(s => {
                const sRedist = redistributions.find(
                  r => (r.submissionId === s.id || r.submission?.id === s.id) &&
                       r.status !== 'CANCELLED' && r.status !== 'REJECTED'
                );
                const isItemDispatched = Boolean(sRedist || (s.status !== 'AVAILABLE' && s.status !== 'ANALYZING'));
                return (
                  <option key={s.id} value={s.id}>
                    {s.foodName} ({s.quantity} {s.unit}) {isItemDispatched ? '— [Approved]' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Target Food Submission Overview */}
      {currentSubmission && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/70 border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">SELECTED SURPLUS ITEM</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Urgency: {currentSubmission.urgency}
              </span>
              {isDispatched && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold flex items-center space-x-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                  <span>{getApprovalStatusLabel()}</span>
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">{currentSubmission.foodName}</h3>
            <p className="text-xs text-slate-600 font-medium">
              Provider: {currentSubmission.providerName} • Quantity: <strong>{currentSubmission.quantity} {currentSubmission.unit}</strong> (~{currentSubmission.estimatedServings} servings) • Usable window: <strong>{currentSubmission.remainingHours} hours</strong>
            </p>
            {isDispatched && approvedRecipient && (
              <p className="text-xs text-emerald-800 font-semibold pt-0.5 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Dispatched to: <strong>{approvedRecipient.name}</strong></span>
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block font-semibold">AI Priority Score</span>
              <span className="text-lg font-bold text-emerald-700">{currentSubmission.aiAnalysis?.priorityScore || 92}/100</span>
            </div>
            {isDispatched && (
              <button
                type="button"
                onClick={handleViewLogistics}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>View Logistics</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Persistent Approval Banner */}
      {isDispatched && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-200 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {getApprovalStatusLabel()}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  {existingRedistribution ? `Ref: #${existingRedistribution.id.slice(0, 8)}` : 'Persisted in SQLite'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {approvedRecipient ? (
                  <>This surplus food submission has been dispatched to <strong>{approvedRecipient.name}</strong>. Logistics pickup task has been created and saved in SQLite.</>
                ) : (
                  <>This surplus food submission has already been approved and dispatched for redistribution.</>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleViewLogistics}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shrink-0 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>View Logistics Tracker</span>
          </button>
        </div>
      )}

      {/* Candidate Recipients Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-slate-200">
            Scored Candidate Recipients ({filteredMatches.length})
          </h3>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="flex-1 sm:flex-none flex items-center space-x-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showMap ? 'Hide Geographic Map' : 'Show Hyderabad Map'}</span>
            </button>
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-slate-300 text-xs focus:outline-none"
              >
                <option value="ALL">All Suitability Levels</option>
                <option value="OPTIMAL">OPTIMAL Matches (&gt;85%)</option>
                <option value="GOOD">GOOD Matches (70-84%)</option>
                <option value="MODERATE">MODERATE Matches (50-69%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* OpenStreetMap Geographic Overview of Candidate NGOs */}
        {showMap && (
          <div className="space-y-2">
            <GeographicMap
              recipients={recipients}
              submissions={currentSubmission ? [currentSubmission] : []}
              selectedRecipientId={selectedRecipientForRoute || approvedRecipientId || filteredMatches[0]?.recipient.id}
              onSelectRecipient={(r) => {
                setSelectedRecipientForRoute(r.id);
              }}
              height="300px"
              showAllRecipients={true}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMatches.map(m => {
            const { recipient, overallScore, breakdown, suitabilityStatus } = m;
            const isThisRecipientApproved = isDispatched && (recipient.id === approvedRecipientId);

            return (
              <div
                key={recipient.id}
                className={`p-5 rounded-2xl glass-panel glass-panel-hover border space-y-4 flex flex-col justify-between transition ${
                  isThisRecipientApproved 
                    ? 'border-emerald-500/70 ring-1 ring-emerald-500/30 bg-emerald-950/10' 
                    : 'border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {recipient.organizationType}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {isThisRecipientApproved && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" />
                          <span>Approved Recipient</span>
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        suitabilityStatus === 'OPTIMAL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        suitabilityStatus === 'GOOD' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {suitabilityStatus}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-base text-slate-100">{recipient.name}</h4>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecipientForRoute(recipient.id);
                      setShowMap(true);
                    }}
                    className="flex items-center space-x-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors text-left cursor-pointer"
                    title="View route and location on map"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{recipient.distanceKm} km away • {recipient.location?.address || 'Hyderabad'}</span>
                  </button>
                </div>

                {/* Score Progress Badge */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Deterministic Match Score</span>
                    <span className="text-lg font-extrabold text-emerald-400">{overallScore}%</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                      style={{ width: `${overallScore}%` }}
                    />
                  </div>
                </div>

                {/* 5-Factor Score Matrix Pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block text-[9px]">Compatibility</span>
                    <span className="font-bold text-slate-200">{breakdown.categoryCompatibilityScore}/25 pts</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block text-[9px]">Need Level</span>
                    <span className="font-bold text-slate-200">{breakdown.needLevelScore}/25 pts</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block text-[9px]">Capacity</span>
                    <span className="font-bold text-slate-200">{breakdown.capacityMatchScore}/20 pts</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block text-[9px]">Distance & Window</span>
                    <span className="font-bold text-slate-200">{breakdown.distanceScore + breakdown.availabilityScore}/30 pts</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => setInspectMatch(m)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition text-center"
                  >
                    Score Breakdown
                  </button>

                  {isDispatched ? (
                    isThisRecipientApproved ? (
                      <button
                        onClick={handleViewLogistics}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1 shadow-md shadow-emerald-600/20"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>View Logistics</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-medium cursor-not-allowed text-center"
                        title="Listing is already dispatched to another recipient."
                      >
                        Dispatched
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleDispatch(recipient.id)}
                      disabled={isDispatching}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isDispatching 
                          ? 'Dispatching...' 
                          : userRole === 'FOOD_PROVIDER' 
                          ? 'Approve Dispatch' 
                          : userRole === 'RECIPIENT' 
                          ? 'Claim Batch' 
                          : 'Dispatch'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspect Score Breakdown Modal */}
      {inspectMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-slate-100">Algorithm Score Breakdown</h3>
              </div>
              <button
                onClick={() => setInspectMatch(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-slate-200">{inspectMatch.recipient.name}</h4>
                <p className="text-slate-400 mt-0.5">Overall Deterministic Score: <strong className="text-emerald-400 text-sm">{inspectMatch.overallScore}/100</strong></p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300">1. Category Compatibility</span>
                  <span className="font-bold text-emerald-400">{inspectMatch.breakdown.categoryCompatibilityScore} / 25 pts</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300">2. Recipient Need Level ({inspectMatch.recipient.currentNeedLevel})</span>
                  <span className="font-bold text-emerald-400">{inspectMatch.breakdown.needLevelScore} / 25 pts</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300">3. Available Capacity ({inspectMatch.recipient.availableCapacity} meals)</span>
                  <span className="font-bold text-emerald-400">{inspectMatch.breakdown.capacityMatchScore} / 20 pts</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300">4. Proximity / Distance ({inspectMatch.recipient.distanceKm} km)</span>
                  <span className="font-bold text-emerald-400">{inspectMatch.breakdown.distanceScore} / 15 pts</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300">5. Operating Hours & Urgency Window</span>
                  <span className="font-bold text-emerald-400">{inspectMatch.breakdown.availabilityScore} / 15 pts</span>
                </div>
              </div>
            </div>

            {isDispatched ? (
              inspectMatch.recipient.id === approvedRecipientId ? (
                <button
                  onClick={() => {
                    setInspectMatch(null);
                    handleViewLogistics();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Dispatch Approved — View in Logistics Tracker</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                  This surplus food listing has already been approved and dispatched to{' '}
                  <strong className="text-emerald-400">{approvedRecipient?.name || 'another recipient'}</strong>.
                </div>
              )
            ) : (
              <button
                onClick={() => {
                  handleDispatch(inspectMatch.recipient.id);
                  setInspectMatch(null);
                }}
                disabled={isDispatching}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isDispatching 
                    ? 'Dispatching...' 
                    : `Confirm Dispatch to ${inspectMatch.recipient.name}`}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
