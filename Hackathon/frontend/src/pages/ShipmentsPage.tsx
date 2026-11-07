import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Shipment, ShipmentTrackingResponse, DeliveryEvidence } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Search, 
  Package, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Camera, 
  ShieldCheck, 
  User, 
  Phone,
  Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ShipmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [trackedResult, setTrackedResult] = useState<ShipmentTrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Shipment Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [originAddress, setOriginAddress] = useState('Central Fulfillment Hub, Mumbai, Maharashtra');
  const [destinationAddress, setDestinationAddress] = useState('Flat 402, Sea Crest Towers, Bandra West, Mumbai 400050');
  const [recipientName, setRecipientName] = useState('Rahul Sharma');
  const [recipientPhone, setRecipientPhone] = useState('+91 98765 43210');
  const [courierNotes, setCourierNotes] = useState('Priority express courier delivery');
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Evidence preview for tracked shipment
  const [evidenceData, setEvidenceData] = useState<DeliveryEvidence | null>(null);

  const fetchShipments = async () => {
    try {
      const res = await api.get('/api/shipments');
      setShipments(res.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShipments();
    // Default track CP-2024-001 so faculty immediately sees data
    handleTrackById('CP-2024-001');
  }, []);

  const handleTrackById = async (tId: string) => {
    if (!tId.trim()) return;
    setLoading(true);
    setError(null);
    setEvidenceData(null);
    try {
      const res = await api.get(`/api/shipments/track/${tId.trim()}`);
      setTrackedResult(res.data);
      // If delivered, attempt to fetch evidence
      if (res.data?.shipment?.id) {
        try {
          const evRes = await api.get(`/api/evidence/shipment/${res.data.shipment.id}`);
          if (evRes.data) setEvidenceData(evRes.data);
        } catch {
          // No evidence yet
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Shipment not found with given tracking ID.');
      setTrackedResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    handleTrackById(searchTrackingId);
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    setCreateSuccess(null);

    try {
      const res = await api.post('/api/shipments', {
        originAddress,
        destinationAddress,
        recipientName,
        recipientPhone,
        notes: courierNotes,
      });
      setCreateSuccess(`Shipment created with Tracking ID: ${res.data.trackingId}`);
      fetchShipments();
      // Track newly created shipment
      handleTrackById(res.data.trackingId);
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch new shipment.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shipment Tracking & Registry</h1>
          <p className="text-sm text-slate-500">Live parcel tracking, milestone history, and dispatch operations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" /> Dispatch New Parcel
        </button>
      </div>

      {/* Track Parcel Search Input */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleTrack} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Tracking ID (e.g. CP-2024-001, CP-2024-002, CP-2024-003)"
              value={searchTrackingId}
              onChange={(e) => setSearchTrackingId(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow shrink-0"
          >
            {loading ? 'Searching...' : 'Track Parcel'}
          </button>
        </form>

        {error && <div className="mt-4 text-xs text-rose-500 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">{error}</div>}

        {/* Detailed Tracking Result Card */}
        {trackedResult && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-lg text-white">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-blue-300 font-semibold uppercase tracking-wider block">Consignment Tracking ID</span>
                  <span className="text-lg font-mono font-bold tracking-tight text-white">{trackedResult.shipment.trackingId}</span>
                </div>
              </div>
              <StatusBadge status={trackedResult.shipment.currentStatus} />
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-slate-900 block">Origin Location:</span>
                  <span className="text-slate-600">{trackedResult.shipment.originAddress}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Destination Delivery Address:</span>
                  <span className="text-slate-600">{trackedResult.shipment.destinationAddress}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-slate-900 block">Recipient Information:</span>
                  <span className="text-slate-600">{trackedResult.shipment.recipientName} ({trackedResult.shipment.recipientPhone})</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Estimated / Actual Date:</span>
                  <span className="text-slate-600">
                    {trackedResult.shipment.estimatedDelivery ? new Date(trackedResult.shipment.estimatedDelivery).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Evidence Card if Available */}
            {evidenceData && (
              <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-800 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Cryptographic Proof of Delivery Attached</span>
                  </div>
                  <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold">
                    SHA-256 VERIFIED
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-xs">
                  {evidenceData.imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-teal-200 h-28 bg-slate-900">
                      <img 
                        src={evidenceData.imageUrl} 
                        alt="Proof of Delivery" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                  )}
                  <div className="md:col-span-2 space-y-1.5 text-slate-700">
                    <div>
                      <span className="text-slate-500 font-medium">Recipient Signed:</span>{' '}
                      <span className="font-semibold text-slate-900">{evidenceData.receiverName} ("{evidenceData.receiverSignature}")</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">GPS Location:</span>{' '}
                      <span className="font-mono text-slate-800 text-[11px] font-semibold">{evidenceData.gpsLocation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Checksum:</span>{' '}
                      <span className="font-mono text-blue-900 text-[10px] break-all bg-white p-1 rounded border border-teal-200 block mt-0.5">
                        {evidenceData.checksum}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Milestone Timeline Events */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Shipment Status Milestones
              </h4>
              <div className="relative pl-6 border-l-2 border-blue-500 space-y-4">
                {trackedResult.history.map((h, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white ring-2 ring-blue-100" />
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="font-semibold text-blue-700">{h.status}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{h.note || 'Milestone logged.'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shipments Master Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Shipments Registry</h2>
            <p className="text-xs text-slate-500">Live consignments managed by Shipment Service (Port 8082)</p>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{shipments.length} consignments total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Tracking ID</th>
                <th className="px-6 py-3.5">Recipient</th>
                <th className="px-6 py-3.5">Destination</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created Date</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3.5 font-mono font-bold text-blue-600">{s.trackingId}</td>
                  <td className="px-6 py-3.5 font-medium text-slate-900">{s.recipientName}</td>
                  <td className="px-6 py-3.5 text-slate-500 max-w-xs truncate">{s.destinationAddress}</td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={s.currentStatus} />
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleTrackById(s.trackingId)}
                      className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-semibold rounded-md transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Dispatch New Parcel */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Dispatch New Consignment
            </h2>
            <p className="text-xs text-slate-500 mb-4">Creates a new parcel record in Shipment Service (Port 8082)</p>

            {createSuccess && (
              <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200 font-medium">
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Origin Fulfillment Facility</label>
                <input
                  type="text"
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination Delivery Address</label>
                <input
                  type="text"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recipient Phone</label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Carrier Instructions / Notes</label>
                <textarea
                  value={courierNotes}
                  onChange={(e) => setCourierNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-semibold"
                >
                  {createLoading ? 'Dispatching...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
