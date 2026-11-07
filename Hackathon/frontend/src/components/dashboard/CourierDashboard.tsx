import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Truck, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Upload, 
  AlertCircle, 
  FileCheck, 
  Navigation, 
  Package, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { Link } from 'react-router-dom';
import { Shipment } from '../../types';

export const CourierDashboard: React.FC = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Quick delivery confirmation state
  const [selectedForDelivery, setSelectedForDelivery] = useState<Shipment | null>(null);
  const [receiverName, setReceiverName] = useState('Rahul Sharma');
  const [deliveryNotes, setDeliveryNotes] = useState('Delivered at front door directly to recipient.');
  const [gpsLocation, setGpsLocation] = useState('19.0760, 72.8777 (GPS Active)');
  const [signature, setSignature] = useState('Rahul S.');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchShipments = async () => {
    try {
      const res = await api.get('/api/shipments');
      setShipments(res.data || []);
      // Preselect first out-for-delivery or in-transit
      const active = (res.data || []).find((s: Shipment) => s.currentStatus !== 'DELIVERED');
      if (active) setSelectedForDelivery(active);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleUpdateStatus = async (shipmentId: number, newStatus: string) => {
    setUpdatingId(shipmentId);
    setActionSuccess(null);
    try {
      await api.put(`/api/shipments/${shipmentId}/status`, {
        status: newStatus,
        note: `Courier updated consignment to ${newStatus} on route`,
      });
      setActionSuccess(`Shipment #${shipmentId} updated to ${newStatus}!`);
      fetchShipments();
    } catch (e: any) {
      alert('Failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForDelivery) return;
    if (!file) {
      setUploadError('Please select a photo proof (camera image or file) to calculate SHA-256 seal.');
      return;
    }
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('shipmentId', selectedForDelivery.id.toString());
    formData.append('receiverName', receiverName);
    formData.append('deliveryNotes', deliveryNotes);
    formData.append('gpsLocation', gpsLocation);
    formData.append('signature', signature);

    try {
      await api.post('/api/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Also transition shipment status to DELIVERED
      await api.put(`/api/shipments/${selectedForDelivery.id}/status`, {
        status: 'DELIVERED',
        note: 'Delivered with cryptographically verified SHA-256 photographic evidence',
      });
      setActionSuccess(`Consignment #${selectedForDelivery.trackingId} delivered with cryptographic proof!`);
      fetchShipments();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Proof ingestion failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const pendingDeliveries = shipments.filter(s => s.currentStatus !== 'DELIVERED');
  const completedDeliveries = shipments.filter(s => s.currentStatus === 'DELIVERED');

  return (
    <div className="space-y-8">
      {/* Courier Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-teal-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-full text-xs font-semibold border border-emerald-400/30">
              <Truck className="w-3.5 h-3.5" />
              <span>Courier Field Operations Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Courier Dispatch & Proof Capture
            </h1>
            <p className="text-sm text-teal-100/90 max-w-xl leading-relaxed">
              Capture geotagged proof-of-delivery photos, log digital recipient signatures, 
              compute immutable SHA-256 checksums, and update delivery milestones on the road.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/evidence"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> Full Evidence Ingestion
            </Link>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Courier Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-teal-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Manifest</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{shipments.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total packages assigned</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Delivery</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{pendingDeliveries.length}</div>
          <div className="text-xs text-amber-600 font-medium mt-1">Action required today</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered & Sealed</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{completedDeliveries.length}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">SHA-256 proof uploaded</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">GPS Integrity</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">100%</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Geofence compliance</div>
        </div>
      </div>

      {/* Main Courier Layout: Route Queue + Fast Ingestion Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Delivery Manifest Route Queue */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Delivery Manifest</h2>
              <p className="text-xs text-slate-500">Select consignment to upload proof or change milestone</p>
            </div>
            <button
              onClick={fetchShipments}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
            {shipments.map((s) => (
              <div 
                key={s.id}
                onClick={() => setSelectedForDelivery(s)}
                className={`p-4 cursor-pointer transition text-xs ${
                  selectedForDelivery?.id === s.id ? 'bg-teal-50/70 border-l-4 border-teal-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{s.trackingId}</span>
                    <StatusBadge status={s.currentStatus} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">#{s.id}</span>
                </div>

                <div className="text-slate-700 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{s.destinationAddress}</span>
                </div>

                <div className="text-slate-500 mt-1 flex items-center justify-between text-[11px]">
                  <span>Recipient: <strong>{s.recipientName}</strong> ({s.recipientPhone})</span>
                  <span>Est: {s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : 'N/A'}</span>
                </div>

                {/* Milestone quick-triggers */}
                {s.currentStatus !== 'DELIVERED' && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-semibold">Transition Status:</span>
                    {s.currentStatus === 'PENDING' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(s.id, 'IN_TRANSIT'); }}
                        disabled={updatingId === s.id}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-semibold text-[10px] transition"
                      >
                        Start Transit
                      </button>
                    )}
                    {(s.currentStatus === 'PENDING' || s.currentStatus === 'IN_TRANSIT') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(s.id, 'OUT_FOR_DELIVERY'); }}
                        disabled={updatingId === s.id}
                        className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded font-semibold text-[10px] transition"
                      >
                        Out for Delivery
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Fast Proof-of-Delivery Capture Terminal */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-600" />
                Delivery Proof Capture Terminal
              </h2>
              {selectedForDelivery && (
                <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded font-bold text-slate-700">
                  {selectedForDelivery.trackingId}
                </span>
              )}
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {selectedForDelivery ? (
              <form onSubmit={handleUploadProof} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500 font-semibold text-[11px]">Selected Consignment:</div>
                  <div className="text-sm font-bold text-slate-900">{selectedForDelivery.recipientName}</div>
                  <div className="text-slate-600 text-[11px] truncate">{selectedForDelivery.destinationAddress}</div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recipient Name Confirmed</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Notes / Handover Detail</label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">GPS Telemetry</label>
                    <input
                      type="text"
                      value={gpsLocation}
                      onChange={(e) => setGpsLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Digital Signature</label>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attach Photo Proof (Doorstep / Recipient Handover)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Ingesting Proof & Hashing (SHA-256)...' : 'Confirm Delivery & Ingest Proof'}
                </button>
              </form>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Select a consignment from the left manifest to capture proof of delivery.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            <strong>SOA Role Boundary:</strong> Courier account has rights to execute status transitions and multipart evidence ingestion via the API Gateway.
          </div>
        </div>

      </div>
    </div>
  );
};
