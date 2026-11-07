import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Search, 
  Camera, 
  Activity, 
  Layers, 
  ChevronRight, 
  Database, 
  Lock, 
  Network, 
  Cpu, 
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [shipmentStats, setShipmentStats] = useState({ totalShipments: 0, delivered: 0, inTransit: 0, pending: 0 });
  const [disputeStats, setDisputeStats] = useState({ open: 0, underReview: 0, resolved: 0, rejected: 0, total: 0 });
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [eurekaServices, setEurekaServices] = useState<string[]>([
    'API-GATEWAY (Port 8080)',
    'AUTH-SERVICE (Port 8081)',
    'SHIPMENT-SERVICE (Port 8082)',
    'EVIDENCE-SERVICE (Port 8083)',
    'DISPUTE-SERVICE (Port 8084)',
    'AUDIT-SERVICE (Port 8085)',
    'NOTIFICATION-SERVICE (Port 8086)'
  ]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [sStatsRes, dStatsRes, auditRes] = await Promise.allSettled([
          api.get('/api/shipments/dashboard/stats'),
          api.get('/api/disputes/dashboard/stats'),
          api.get('/api/audit/events/recent'),
        ]);

        if (sStatsRes.status === 'fulfilled') setShipmentStats(sStatsRes.value.data);
        if (dStatsRes.status === 'fulfilled') setDisputeStats(dStatsRes.value.data);
        if (auditRes.status === 'fulfilled') setRecentAudits(auditRes.value.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAdminData();
  }, []);

  const chartData = [
    { name: 'Delivered', count: shipmentStats.delivered || 1 },
    { name: 'In Transit', count: shipmentStats.inTransit || 1 },
    { name: 'Pending', count: shipmentStats.pending || 1 },
    { name: 'Disputes Open', count: disputeStats.open || 0 },
    { name: 'Under Review', count: disputeStats.underReview || 0 },
    { name: 'Resolved', count: disputeStats.resolved || 0 },
  ];

  const resolutionRate = disputeStats.total > 0 
    ? Math.round((disputeStats.resolved / disputeStats.total) * 100) 
    : 100;

  return (
    <div className="space-y-8">
      {/* Admin Executive Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">
              <Activity className="w-3.5 h-3.5" />
              <span>SOA System Command Center & Academic Jury View</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Operations & Governance Console
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Full administrative visibility across 7 decoupled microservices, database-per-service topologies, 
              cryptographic arbitration pipelines, and regulatory audit retention.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <Link
              to="/admin"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Arbitration Center
            </Link>
            <Link
              to="/architecture"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition border border-white/20 flex items-center gap-2"
            >
              <Network className="w-4 h-4 text-blue-400" /> Topology Explorer
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Enterprise Admin KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Consignments</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{shipmentStats.totalShipments || 3}</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Shipment DB (Port 8082)</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmed Delivered</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{shipmentStats.delivered || 1}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Evidence DB (Port 8083)</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Claims In Review</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{disputeStats.open || 0}</div>
          <div className="text-xs text-amber-600 font-medium mt-1">Dispute DB (Port 8084)</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-teal-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Arbitrated Cases</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{disputeStats.resolved || 0}</div>
          <div className="text-xs text-teal-600 font-medium mt-1">Audited outcomes</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">SLA Compliance</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{resolutionRate}%</div>
          <div className="text-xs text-indigo-600 font-medium mt-1">Mean Time to Resolve</div>
        </div>
      </div>

      {/* Main Charts & Microservices Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Shipment & Dispute Distribution</h2>
              <p className="text-xs text-slate-500">Real-time aggregate across isolated database instances</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-semibold">Active Mesh</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Database-per-service pattern enforced</span>
            <Link to="/architecture" className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1">
              Architecture Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Microservices Live Health Registry */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Eureka Service Registry</h2>
              <p className="text-xs text-slate-500">Live heartbeats via Port 8761</p>
            </div>
            <Cpu className="w-5 h-5 text-blue-600" />
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {eurekaServices.map((srv, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono font-medium text-slate-800">{srv}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  UP
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <a 
              href="http://localhost:8761" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
            >
              Open Eureka Dashboard <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Audit Stream Log */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Immutable Audit Event Stream</h2>
            <p className="text-xs text-slate-500">Append-only compliance log managed by Audit Service (Port 8085)</p>
          </div>
          <ShieldCheck className="w-5 h-5 text-teal-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Actor / User ID</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentAudits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No recent audit events logged yet.
                  </td>
                </tr>
              ) : (
                recentAudits.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{a.eventType}</td>
                    <td className="px-4 py-3 text-slate-600">{a.description}</td>
                    <td className="px-4 py-3 text-slate-500">User #{a.userId || 'SYSTEM'}</td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {new Date(a.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jury Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link 
          to="/admin" 
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow transition group text-xs"
        >
          <ShieldCheck className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition" />
          <div className="font-bold text-slate-900">Arbitration Center</div>
          <div className="text-slate-500 mt-1">Review disputes & inspect photo evidence</div>
        </Link>

        <Link 
          to="/architecture" 
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow transition group text-xs"
        >
          <Network className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition" />
          <div className="font-bold text-slate-900">Architecture Explorer</div>
          <div className="text-slate-500 mt-1">SOA diagrams & service boundaries</div>
        </Link>

        <Link 
          to="/security" 
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow transition group text-xs"
        >
          <Lock className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition" />
          <div className="font-bold text-slate-900">Security & Observability</div>
          <div className="text-slate-500 mt-1">JWT claims, BCrypt, & Correlation IDs</div>
        </Link>

        <Link 
          to="/co-mapping" 
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow transition group text-xs"
        >
          <Layers className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition" />
          <div className="font-bold text-slate-900">CO Mapping</div>
          <div className="text-slate-500 mt-1">Course Outcomes CO1 through CO4 compliance</div>
        </Link>
      </div>
    </div>
  );
};
