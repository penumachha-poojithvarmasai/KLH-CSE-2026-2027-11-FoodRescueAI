import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Bell, 
  Truck,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { Link, useNavigate } from 'react-router-dom';
import { Shipment, Dispute } from '../../types';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [quickTrackingId, setQuickTrackingId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const [shipRes, dispRes, notifRes] = await Promise.allSettled([
          api.get('/api/shipments'),
          api.get('/api/disputes'),
          api.get(`/api/notifications/user/${user?.id || 1}`),
        ]);

        if (shipRes.status === 'fulfilled') setShipments(shipRes.value.data || []);
        if (dispRes.status === 'fulfilled') setDisputes(dispRes.value.data || []);
        if (notifRes.status === 'fulfilled') {
          const data = notifRes.value.data;
          setNotifications(Array.isArray(data) ? data : data ? [data] : []);
        }
      } catch (err) {
        console.error('Failed to load customer dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerData();
  }, [user]);

  const deliveredCount = shipments.filter(s => s.currentStatus === 'DELIVERED').length;
  const inTransitCount = shipments.filter(s => s.currentStatus === 'IN_TRANSIT' || s.currentStatus === 'OUT_FOR_DELIVERY').length;
  const openDisputes = disputes.filter(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');

  return (
    <div className="space-y-8">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs font-semibold border border-blue-400/30">
              <Package className="w-3.5 h-3.5" />
              <span>Customer Delivery Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.email.split('@')[0] || 'Customer'}
            </h1>
            <p className="text-sm text-blue-100/90 max-w-xl leading-relaxed">
              Track incoming orders, inspect cryptographic delivery proofs (photos & signatures), 
              and resolve missing package claims with zero hassle.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/disputes"
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Raise Delivery Dispute
            </Link>
            <Link
              to="/shipments"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition border border-white/20 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Track My Parcel
            </Link>
          </div>
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">My Packages</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{shipments.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total orders placed</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Transit</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{inTransitCount}</div>
          <div className="text-xs text-indigo-600 font-medium mt-1">On the way to you</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{deliveredCount}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Proof available in vault</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Disputes</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{openDisputes.length}</div>
          <div className="text-xs text-amber-600 font-medium mt-1">In customer arbitration</div>
        </div>
      </div>

      {/* Main Content: Active Orders & Notifications / Quick Proof */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Active Shipments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Consignments & Orders</h2>
              <p className="text-xs text-slate-500">Real-time status updates delivered directly to your doorstep</p>
            </div>
            <Link to="/shipments" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {shipments.map((s) => (
              <div key={s.id} className="p-5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 text-sm">{s.trackingId}</span>
                    <StatusBadge status={s.currentStatus} />
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Destination: {s.destinationAddress}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Recipient: {s.recipientName} • Contact: {s.recipientPhone}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {s.currentStatus === 'DELIVERED' ? (
                    <Link
                      to="/evidence"
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-lg transition border border-teal-200 flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> View Delivery Proof
                    </Link>
                  ) : (
                    <Link
                      to="/shipments"
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition border border-blue-200 flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" /> Live Tracking
                    </Link>
                  )}
                  <Link
                    to="/disputes"
                    className="px-3 py-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold rounded-lg transition border border-slate-200"
                  >
                    Dispute
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Notifications & Quick Dispute Status */}
        <div className="space-y-6">
          {/* Dispute Quick Check */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active Grievance Claims
              </h3>
              <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded">
                {openDisputes.length} active
              </span>
            </div>

            {openDisputes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
                You currently have no open delivery disputes. All orders are marked verified!
              </div>
            ) : (
              <div className="space-y-3">
                {openDisputes.map(d => (
                  <div key={d.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{d.disputeRef}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="text-[11px] text-slate-600">Tracking: {d.trackingId}</div>
                    <p className="text-slate-500 text-[11px] truncate">"{d.description}"</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link to="/disputes" className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1">
                Open Dispute Center <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Real-time Notifications */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                Delivery Alerts & Messages
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                Port 8086
              </span>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                  No new delivery alerts.
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <div className="font-semibold text-slate-800">{n.title || 'System Notification'}</div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
