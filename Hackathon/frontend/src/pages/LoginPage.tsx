import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Truck, Lock, Mail, AlertCircle, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up / Register
        const response = await api.post('/api/auth/register', { email, password, role });
        login({
          id: response.data.userId,
          email: response.data.email,
          role: response.data.role,
          token: response.data.token,
        });
        navigate('/dashboard');
      } else {
        // Sign In
        const response = await api.post('/api/auth/login', { email, password });
        login({
          id: response.data.userId,
          email: response.data.email,
          role: response.data.role,
          token: response.data.token,
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        (isSignUp ? 'Registration failed. User may already exist.' : 'Authentication failed. Please verify credentials or service status.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email: demoEmail, password: 'demo1234' });
      login({
        id: response.data.userId,
        email: response.data.email,
        role: response.data.role,
        token: response.data.token,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials or service status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create Temporary Account' : 'Sign in to CourierProof'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">Enterprise Delivery Arbitration Platform</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-700/60">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isSignUp ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isSignUp ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up (New Account)
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="name@courierproof.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Assign System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="CUSTOMER">CUSTOMER (Dispute & Track)</option>
                <option value="COURIER">COURIER (Upload Evidence)</option>
                <option value="ADMIN">ADMIN (Arbitrate Disputes)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (isSignUp ? 'Creating Account...' : 'Authenticating...') : (isSignUp ? 'Create & Sign In' : 'Sign In')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/60">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
            One-Click Instant Demo Logins
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('customer@demo.com', 'CUSTOMER')}
              className="px-2 py-2.5 bg-slate-900 hover:bg-blue-900/40 hover:border-blue-500 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all text-center cursor-pointer"
            >
              Customer
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('courier@demo.com', 'COURIER')}
              className="px-2 py-2.5 bg-slate-900 hover:bg-blue-900/40 hover:border-blue-500 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all text-center cursor-pointer"
            >
              Courier
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('admin@demo.com', 'ADMIN')}
              className="px-2 py-2.5 bg-slate-900 hover:bg-blue-900/40 hover:border-blue-500 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all text-center cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
