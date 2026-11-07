import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff,
  User,
  Building2,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, authError, clearAuthError, isLoading } = useAuth();

  const [mode, setMode] = useState<'SIGN_IN' | 'CREATE_ACCOUNT'>('SIGN_IN');

  // Sign In
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Create Account
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('FOOD_PROVIDER');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Please enter your password.');
      return;
    }

    await login({ email, password });
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!regName.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!regOrg.trim()) {
      setLocalError('Please enter your organization or kitchen name.');
      return;
    }
    if (!regPassword.trim()) {
      setLocalError('Please enter a password.');
      return;
    }
    if (regPassword.length < 4) {
      setLocalError('Password must be at least 4 characters.');
      return;
    }

    const ok = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      organization: regOrg
    });

    if (!ok) {
      setLocalError('Failed to create account. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] flex items-center justify-center p-4 selection:bg-[#c2e7ff] selection:text-[#001d35]">

      {/* Background glow (Google & Gemini subtle ambiance) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#1a73e8]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[450px] h-[450px] bg-[#7c3aed]/10 rounded-full blur-[130px]" />
      </div>

      <div className="relative max-w-sm w-full space-y-6">
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl gemini-gradient-bg p-0.5 shadow-lg shadow-[#1a73e8]/20 mx-auto">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center shadow-inner text-2xl">
              🌱
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              FoodRescue <span className="gemini-gradient-text font-extrabold">AI</span>
            </h1>
            <p className="text-xs text-[#0b57d0] font-bold">
              Autonomous Food Rescue & Redistribution System
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#f0f4f9] p-1 rounded-full border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('SIGN_IN');
              setLocalError(null);
              clearAuthError();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              mode === 'SIGN_IN' ? 'bg-[#0b57d0] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('CREATE_ACCOUNT');
              setLocalError(null);
              clearAuthError();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              mode === 'CREATE_ACCOUNT' ? 'bg-[#0b57d0] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error */}
        {(localError || authError) && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Form */}
        {mode === 'SIGN_IN' ? (
          <form onSubmit={handleSignIn} className="p-6 rounded-3xl bg-white border border-[#c2e7ff] space-y-4 shadow-xl shadow-slate-900/5">
            <h2 className="font-extrabold text-sm text-slate-900">Sign In to Your Workspace</h2>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLocalError(null); clearAuthError(); }}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLocalError(null); clearAuthError(); }}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl gemini-gradient-btn disabled:opacity-60 font-black text-sm shadow-md shadow-[#1a73e8]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Verifying credentials…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-500 font-medium">
              Role & dashboard are auto-assigned based on your credentials
            </p>
          </form>
        ) : (
          <form onSubmit={handleCreateAccount} className="p-6 rounded-3xl bg-white border border-[#c2e7ff] space-y-3.5 shadow-xl shadow-slate-900/5">
            <h2 className="font-extrabold text-sm text-slate-900">Create New Account</h2>

            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="reg-name" className="text-xs font-bold text-slate-700">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => { setRegName(e.target.value); setLocalError(null); }}
                  placeholder="e.g. Dr. Anita Rao"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="reg-email" className="text-xs font-bold text-slate-700">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => { setRegEmail(e.target.value); setLocalError(null); }}
                  placeholder="anita@cityshelter.org"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition"
                />
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-1">
              <label htmlFor="reg-org" className="text-xs font-bold text-slate-700">Organization / Shelter *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="reg-org"
                  type="text"
                  required
                  value={regOrg}
                  onChange={(e) => { setRegOrg(e.target.value); setLocalError(null); }}
                  placeholder="e.g. City Hope Kitchen"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1">
              <label htmlFor="reg-role" className="text-xs font-bold text-slate-700">Role *</label>
              <select
                id="reg-role"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1a73e8] focus:bg-white transition"
              >
                <option value="FOOD_PROVIDER">👨‍🍳 Food Provider (Canteen / Kitchen)</option>
                <option value="RECIPIENT">🏠 Recipient Charity (Shelter / NGO)</option>
                <option value="LOGISTICS_COORDINATOR">🚐 Logistics Coordinator (Driver)</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="reg-pass" className="text-xs font-bold text-slate-700">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="reg-pass"
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => { setRegPassword(e.target.value); setLocalError(null); }}
                  placeholder="At least 4 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(v => !v)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl gemini-gradient-btn disabled:opacity-60 font-black text-sm shadow-md shadow-[#1a73e8]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer mt-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Create Account & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
