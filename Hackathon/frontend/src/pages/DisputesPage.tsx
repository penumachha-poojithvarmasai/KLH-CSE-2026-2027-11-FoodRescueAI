import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Dispute } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { AlertTriangle, Plus, Search, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DisputesPage: React.FC = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [trackingId, setTrackingId] = useState('CP-2024-001');
  const [reason, setReason] = useState('PACKAGE_NOT_RECEIVED');
  const [description, setDescription] = useState('The courier status shows delivered, but I checked the front door and mailroom and no parcel was found.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/api/disputes');
      setDisputes(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/disputes', {
        trackingId,
        reason,
        description,
      });
      setShowCreateModal(false);
      fetchDisputes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to file dispute. Ensure tracking ID exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dispute Resolution Chamber</h1>
          <p className="text-sm text-slate-500">Customer arbitration requests and cross-service investigation cases</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Raise Dispute
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              File Delivery Dispute
            </h2>

            {error && <div className="mb-4 text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">{error}</div>}

            <form onSubmit={handleCreateDispute} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tracking ID</label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  required
                  placeholder="e.g. CP-2024-001"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dispute Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="PACKAGE_NOT_RECEIVED">Package Not Received</option>
                  <option value="DAMAGED">Package Damaged</option>
                  <option value="WRONG_ITEM">Wrong Item Received</option>
                  <option value="LATE_DELIVERY">Severely Delayed Delivery</option>
                  <option value="OTHER">Other Dispute Reason</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Explanation</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow"
                >
                  {loading ? 'Submitting...' : 'Confirm Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Active Dispute Registry</h2>
          <span className="text-xs text-slate-500">{disputes.length} cases</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Dispute Ref</th>
                <th className="px-6 py-3">Tracking Code</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Arbitration Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {disputes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No disputes registered. Click "Raise Dispute" to initiate a claim.
                  </td>
                </tr>
              ) : (
                disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{d.disputeRef}</td>
                    <td className="px-6 py-4 font-mono">{d.trackingId}</td>
                    <td className="px-6 py-4">{d.reason.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                    <td className="px-6 py-4 text-slate-500">
                      {d.resolution ? (
                        <span className="text-emerald-700 font-medium">{d.resolution}</span>
                      ) : (
                        <span className="italic text-slate-400">Awaiting admin arbitration</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

