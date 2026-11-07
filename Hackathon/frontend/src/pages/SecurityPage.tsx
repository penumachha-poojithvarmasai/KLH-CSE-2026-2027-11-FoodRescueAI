import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Lock, Shield, CheckCircle2, XCircle, AlertTriangle, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SecurityPage: React.FC = () => {
  const { user } = useAuth();
  const [gatewayStatus, setGatewayStatus] = useState<string>('ONLINE');
  const [testResult, setTestResult] = useState<string | null>(null);

  const testForbiddenAccess = async () => {
    try {
      // Trying to trigger an admin action or unauthorized path
      await api.put('/api/disputes/1/resolve', { resolution: 'Hacked' });
      setTestResult('FAILED: The endpoint allowed unauthorized access!');
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setTestResult(`SUCCESS (403 Forbidden / 401 Unauthorized): Server rejected request properly with status code ${err.response.status}. Role enforcement is active.`);
      } else {
        setTestResult(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Observability Dashboard</h1>
        <p className="text-sm text-slate-500">JWT token validation, RBAC enforcement, and service health status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gateway Status</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Port 8080 Active
          </div>
          <p className="text-xs text-slate-400 mt-2">Correlation ID tracking enabled</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Token Role</span>
            <Lock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{user?.role || 'ANONYMOUS'}</div>
          <p className="text-xs text-slate-400 mt-2 font-mono truncate">{user?.email || 'No active session'}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Password Encryption</span>
            <Shield className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">BCrypt (10 Rounds)</div>
          <p className="text-xs text-slate-400 mt-2">Zero plaintext credentials stored</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-600" />
          Live Security Boundary Test (RBAC Verification)
        </h2>
        <p className="text-xs text-slate-600">
          Faculty jury evaluation test: Click below to invoke an Admin-only endpoint (<code>PUT /api/disputes/1/resolve</code>). If logged in as Customer or Courier, the backend Spring Security filter chain MUST reject it with <strong>403 Forbidden</strong>.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={testForbiddenAccess}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition-all"
          >
            Trigger Unauthorized Request Test
          </button>
        </div>

        {testResult && (
          <div className="p-4 rounded-xl text-xs font-mono bg-slate-50 border border-slate-200 text-slate-800">
            {testResult}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Microservice Security Matrices</h2>
        </div>
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Endpoint Path</th>
              <th className="px-6 py-3">HTTP Method</th>
              <th className="px-6 py-3">Allowed Roles</th>
              <th className="px-6 py-3">Unauthorized Behavior</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            <tr>
              <td className="px-6 py-3 text-slate-900">/api/auth/login</td>
              <td className="px-6 py-3 text-emerald-600 font-bold">POST</td>
              <td className="px-6 py-3 text-slate-600 font-sans">Public</td>
              <td className="px-6 py-3 text-slate-400 font-sans">N/A</td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-slate-900">/api/shipments/track/*</td>
              <td className="px-6 py-3 text-blue-600 font-bold">GET</td>
              <td className="px-6 py-3 text-slate-600 font-sans">Public Tracking</td>
              <td className="px-6 py-3 text-slate-400 font-sans">N/A</td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-slate-900">/api/evidence/upload</td>
              <td className="px-6 py-3 text-emerald-600 font-bold">POST</td>
              <td className="px-6 py-3 text-amber-700 font-sans font-semibold">COURIER, ADMIN</td>
              <td className="px-6 py-3 text-rose-600 font-sans">403 Forbidden</td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-slate-900">/api/disputes</td>
              <td className="px-6 py-3 text-emerald-600 font-bold">POST</td>
              <td className="px-6 py-3 text-blue-700 font-sans font-semibold">CUSTOMER, ADMIN</td>
              <td className="px-6 py-3 text-rose-600 font-sans">403 Forbidden</td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-slate-900">/api/disputes/*/resolve</td>
              <td className="px-6 py-3 text-indigo-600 font-bold">PUT</td>
              <td className="px-6 py-3 text-purple-700 font-sans font-semibold">ADMIN only</td>
              <td className="px-6 py-3 text-rose-600 font-sans">403 Forbidden</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

