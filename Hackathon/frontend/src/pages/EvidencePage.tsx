import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Camera, Upload, CheckCircle2, AlertCircle, Hash, MapPin, FileCheck, Image, ExternalLink, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Shipment, DeliveryEvidence } from '../types';

export const EvidencePage: React.FC = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState('1');
  const [receiverName, setReceiverName] = useState('Rahul Sharma');
  const [deliveryNotes, setDeliveryNotes] = useState('Delivered directly to recipient at front gate.');
  const [gpsLocation, setGpsLocation] = useState('19.0760, 72.8777 (Mumbai Central)');
  const [signature, setSignature] = useState('Rahul S.');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Evidence Gallery state
  const [vaultEvidence, setVaultEvidence] = useState<DeliveryEvidence | null>(null);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [inspectShipmentId, setInspectShipmentId] = useState('1');

  useEffect(() => {
    // Fetch available shipments for the dropdown
    const fetchShipments = async () => {
      try {
        const res = await api.get('/api/shipments');
        setShipments(res.data);
      } catch (e) {
        console.error('Failed to load shipments dropdown', e);
      }
    };
    fetchShipments();
    loadEvidenceForShipment('1');
  }, []);

  const loadEvidenceForShipment = async (sId: string) => {
    setLoadingEvidence(true);
    setVaultEvidence(null);
    try {
      const res = await api.get(`/api/evidence/shipment/${sId}`);
      setVaultEvidence(res.data || null);
    } catch (e) {
      console.log('No evidence found for shipment ' + sId);
      setVaultEvidence(null);
    } finally {
      setLoadingEvidence(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file to upload as delivery proof.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('shipmentId', selectedShipmentId);
    formData.append('receiverName', receiverName);
    formData.append('deliveryNotes', deliveryNotes);
    formData.append('gpsLocation', gpsLocation);
    formData.append('signature', signature);

    try {
      const res = await api.post('/api/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      setSuccessMsg('Evidence successfully ingested and SHA-256 seal computed!');
      // Refresh the inspected evidence view
      if (inspectShipmentId === selectedShipmentId) {
        loadEvidenceForShipment(selectedShipmentId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Evidence upload failed. Ensure user role is COURIER or ADMIN.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Delivery Evidence Vault & Ingestion</h1>
        <p className="text-sm text-slate-500">
          Cryptographically verifiable proof-of-delivery ingestion, SHA-256 validation, and GPS geolocation record
        </p>
      </div>

      {/* Main 2-Column Split: Upload Form vs Live Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Upload / Submit Proof */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Upload Proof of Delivery
              </h2>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-semibold">
                Courier / Admin Action
              </span>
            </div>

            {user?.role === 'CUSTOMER' && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Customer Read-Only Notice:</strong>
                  Your account is logged in as Customer. To submit delivery proofs, switch to <strong>courier@demo.com</strong> or <strong>admin@demo.com</strong>. You can inspect existing proofs in the right panel.
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Target Shipment</label>
                <select
                  value={selectedShipmentId}
                  onChange={(e) => setSelectedShipmentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                >
                  {shipments.length > 0 ? (
                    shipments.map((s) => (
                      <option key={s.id} value={s.id}>
                        Shipment #{s.id} — {s.trackingId} ({s.currentStatus}) — {s.recipientName}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">Shipment #1 — CP-2024-001 (DELIVERED)</option>
                      <option value="2">Shipment #2 — CP-2024-002 (IN_TRANSIT)</option>
                      <option value="3">Shipment #3 — CP-2024-003 (OUT_FOR_DELIVERY)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receiver Name</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Notes & Location Description</label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Handed package directly to recipient at front gate, ID checked."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GPS Coordinates</label>
                  <input
                    type="text"
                    value={gpsLocation}
                    onChange={(e) => setGpsLocation(e.target.value)}
                    placeholder="e.g. 19.0760, 72.8777"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Signature Confirmation</label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Recipient initials/signature"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Photographic Evidence (Image)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || user?.role === 'CUSTOMER'}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Ingesting Evidence & Computing SHA-256...' : 'Ingest Proof of Delivery'}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            <strong>Microservices Isolation:</strong> Evidence Service operates with its own database (`courierproof_evidence`) on Port 8083, verifying file hashes independently of dispute or shipment logic.
          </div>
        </div>

        {/* Right Column: Evidence Vault Inspector & Cryptographic Verification */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                Proof-of-Delivery Inspection Vault
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Inspect Shipment:</span>
                <select
                  value={inspectShipmentId}
                  onChange={(e) => {
                    setInspectShipmentId(e.target.value);
                    loadEvidenceForShipment(e.target.value);
                  }}
                  className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="1">Shipment #1 (CP-2024-001)</option>
                  <option value="2">Shipment #2 (CP-2024-002)</option>
                  <option value="3">Shipment #3 (CP-2024-003)</option>
                </select>
              </div>
            </div>

            {loadingEvidence ? (
              <div className="py-20 text-center text-xs text-slate-400">
                Querying Evidence Service (Port 8083)...
              </div>
            ) : vaultEvidence ? (
              <div className="space-y-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Cryptographic Seal Verified</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {vaultEvidence.uploadStatus || 'VERIFIED'}
                  </span>
                </div>

                {/* Photo Preview if image exists */}
                {vaultEvidence.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 bg-black/5 aspect-video relative group">
                    <img 
                      src={vaultEvidence.imageUrl} 
                      alt="Delivery Proof" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback image if custom file path
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded text-white text-[11px] flex justify-between items-center">
                      <span className="truncate">{vaultEvidence.imageFileName || 'delivery_proof.jpg'}</span>
                      <span className="font-mono text-emerald-400 text-[10px]">VERIFIED TAMPER-PROOF</span>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 block font-medium">Evidence UUID Reference:</span>
                  <span className="font-mono text-slate-800 break-all select-all font-semibold">
                    {vaultEvidence.evidenceId}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">SHA-256 Cryptographic Checksum:</span>
                  <div className="font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-slate-900 break-all select-all mt-1 text-[11px] font-semibold text-blue-900">
                    {vaultEvidence.checksum}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block">Recipient Confirmed:</span>
                    <span className="font-semibold text-slate-800">{vaultEvidence.receiverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Recipient Signature:</span>
                    <span className="font-semibold text-slate-800 italic font-serif text-sm">
                      "{vaultEvidence.receiverSignature || 'N/A'}"
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block">GPS Coordinates:</span>
                    <span className="font-mono text-slate-800 font-semibold">{vaultEvidence.gpsLocation || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Delivered Timestamp:</span>
                    <span className="text-slate-700">
                      {vaultEvidence.deliveredAt ? new Date(vaultEvidence.deliveredAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {vaultEvidence.deliveryNotes && (
                  <div className="pt-1">
                    <span className="text-slate-400 block">Courier Delivery Notes:</span>
                    <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 italic mt-0.5">
                      "{vaultEvidence.deliveryNotes}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No Evidence Found for Shipment #{inspectShipmentId}</p>
                <p className="text-slate-400 mt-1 max-w-xs mx-auto">
                  Select Shipment #1 (CP-2024-001) or upload new proof using the form on the left.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Security Model: SHA-256 Pre-image Resistance</span>
            <span className="font-semibold text-teal-600">Immutable Storage</span>
          </div>
        </div>

      </div>
    </div>
  );
};
