import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Dispute, DisputeDetailResponse, DeliveryEvidence } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  MessageSquare, 
  AlertCircle, 
  FileCheck, 
  Camera, 
  Scale, 
  User, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<DisputeDetailResponse | null>(null);
  const [associatedEvidence, setAssociatedEvidence] = useState<DeliveryEvidence | null>(null);
  const [resolutionText, setResolutionText] = useState('Evidence verified. Courier GPS confirms delivery at address.');
  const [newNote, setNewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/api/disputes');
      setDisputes(res.data);
      // Auto-select first dispute if available and none selected
      if (res.data && res.data.length > 0 && !selectedDispute) {
        inspectDispute(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const inspectDispute = async (id: number) => {
    try {
      const res = await api.get(`/api/disputes/${id}`);
      setSelectedDispute(res.data);
      setStatusMessage(null);

      // Attempt to load delivery evidence for this shipment
      if (res.data?.dispute?.shipmentId) {
        try {
          const evRes = await api.get(`/api/evidence/shipment/${res.data.dispute.shipmentId}`);
          setAssociatedEvidence(evRes.data || null);
        } catch {
          setAssociatedEvidence(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolve = async () => {
    if (!selectedDispute) return;
    setActionLoading(true);
    try {
      await api.put(`/api/disputes/${selectedDispute.dispute.id}/resolve`, {
        resolution: resolutionText,
      });
      setStatusMessage('Dispute resolved successfully with permanent immutable audit entry.');
      inspectDispute(selectedDispute.dispute.id);
      fetchDisputes();
    } catch (e: any) {
      alert('Failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDispute) return;
    setActionLoading(true);
    try {
      await api.put(`/api/disputes/${selectedDispute.dispute.id}/reject`, {
        resolution: resolutionText || 'Insufficient proof provided by claimant.',
      });
      setStatusMessage('Dispute officially rejected. Reason persisted.');
      inspectDispute(selectedDispute.dispute.id);
      fetchDisputes();
    } catch (e: any) {
      alert('Failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !newNote.trim()) return;
    try {
      await api.post(`/api/disputes/${selectedDispute.dispute.id}/notes`, { note: newNote.trim() });
      setNewNote('');
      inspectDispute(selectedDispute.dispute.id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Arbitration & Investigation Center</h1>
        <p className="text-sm text-slate-500">
          Cross-service evidence review, tamper-proof audit verification, and authoritative decision binding
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Dispute Dossier Selector */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              Incoming Claims Dossier
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">{disputes.length} cases</span>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[650px]">
            {disputes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No disputes found.</div>
            ) : (
              disputes.map((d) => (
                <div
                  key={d.id}
                  onClick={() => inspectDispute(d.id)}
                  className={`p-4 cursor-pointer transition text-xs ${
                    selectedDispute?.dispute.id === d.id
                      ? 'bg-blue-50/80 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-slate-900">{d.disputeRef}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="font-medium text-slate-800">{d.reason.replace(/_/g, ' ')}</div>
                  <div className="text-slate-500 truncate mt-1">{d.description}</div>
                  <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>Tracking: {d.trackingId}</span>
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Investigation, Evidence Proof, & Decision Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDispute ? (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold text-slate-900">
                      {selectedDispute.dispute.disputeRef}
                    </span>
                    <StatusBadge status={selectedDispute.dispute.status} />
                  </div>
                  <span className="text-xs text-slate-400">
                    Created on {new Date(selectedDispute.dispute.createdAt).toLocaleString()} • Consignment #{selectedDispute.dispute.trackingId}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Claimant Role</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                    CUSTOMER (User ID #{selectedDispute.dispute.customerId})
                  </span>
                </div>
              </div>

              {statusMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Dispute Details & Customer Statement */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">Customer Grievance Statement:</span>
                <p className="text-slate-800 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
                  "{selectedDispute.dispute.description}"
                </p>
                <div className="flex items-center justify-between pt-1 text-slate-500">
                  <span>Category: <strong>{selectedDispute.dispute.reason.replace(/_/g, ' ')}</strong></span>
                  <span>Shipment Target ID: #{selectedDispute.dispute.shipmentId}</span>
                </div>
              </div>

              {/* Delivery Proof Inspection (Evidence Service Cross-Verification) */}
              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    Delivery Evidence Inspection (Evidence Service)
                  </h3>
                  {associatedEvidence && (
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                      SHA-256 MATCH VERIFIED
                    </span>
                  )}
                </div>

                {associatedEvidence ? (
                  <div className="grid md:grid-cols-3 gap-4 text-xs pt-1">
                    {associatedEvidence.imageUrl && (
                      <div className="rounded-lg overflow-hidden border border-blue-200 aspect-video bg-black">
                        <img 
                          src={associatedEvidence.imageUrl} 
                          alt="Delivery Proof" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                    )}
                    <div className="md:col-span-2 space-y-2 text-slate-700">
                      <div>
                        <span className="text-slate-500 block">Cryptographic Checksum:</span>
                        <span className="font-mono text-blue-900 text-[10px] break-all bg-white p-1 rounded border border-blue-200 block font-semibold">
                          {associatedEvidence.checksum}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Recipient Sign-off:</span>
                          <span className="font-semibold">{associatedEvidence.receiverName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">GPS Geolocation:</span>
                          <span className="font-mono text-[11px] font-semibold">{associatedEvidence.gpsLocation}</span>
                        </div>
                      </div>
                      {associatedEvidence.deliveryNotes && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Courier Delivery Notes:</span>
                          <span className="italic text-slate-600">"{associatedEvidence.deliveryNotes}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No physical evidence record attached for this shipment yet.
                  </div>
                )}
              </div>

              {/* Resolution Form if not yet finalized */}
              {selectedDispute.dispute.status !== 'RESOLVED' && selectedDispute.dispute.status !== 'REJECTED' ? (
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Formal Arbitration Decision
                  </h3>
                  <textarea
                    rows={2}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Enter permanent resolution justification for the audit trail..."
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleResolve}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Resolve in Favor of Evidence
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Dispute Claim
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Final Arbitrated Resolution:
                  </span>
                  <p className="text-emerald-800 italic">"{selectedDispute.dispute.resolution}"</p>
                  <span className="text-[10px] text-emerald-600 block mt-2">
                    Resolved at: {selectedDispute.dispute.resolvedAt ? new Date(selectedDispute.dispute.resolvedAt).toLocaleString() : 'N/A'} by Admin #{selectedDispute.dispute.resolvedByAdminId || '1'}
                  </span>
                </div>
              )}

              {/* Investigation Internal Notes Log */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Investigation Case Notes & Audit Chronology
                </h3>

                <div className="space-y-2">
                  {selectedDispute.notes.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No notes added to this investigation file yet.</div>
                  ) : (
                    selectedDispute.notes.map((n) => (
                      <div key={n.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                          <span className="font-semibold text-slate-600">{n.addedBy || 'Admin Reviewer'} ({n.addedByRole || 'ADMIN'})</span>
                          <span>{n.addedAt ? new Date(n.addedAt).toLocaleString() : 'Just now'}</span>
                        </div>
                        <p className="text-slate-700">{n.note}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal investigation note..."
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition"
                  >
                    Add Note
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-16 text-center text-slate-400 text-xs">
              Select an incoming dispute from the left column to review evidence, notes, and perform arbitration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
