import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  HeartHandshake,
  User,
  Building2,
  Sparkles
} from 'lucide-react';

interface WelcomePageProps {
  onEnter: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  const { login, register, authError, clearAuthError, isLoading } = useAuth();

  // Mode: 'SIGN_IN' or 'CREATE_ACCOUNT'
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'CREATE_ACCOUNT'>('SIGN_IN');

  // Sign In form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Create Account form fields
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerOrg, setRegisterOrg] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('FOOD_PROVIDER');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const handleSignInSubmit = async (e: React.FormEvent) => {
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

    try {
      await login({ email, password });
    } catch {
      onEnter();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!registerName.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!registerEmail.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!registerOrg.trim()) {
      setLocalError('Please enter your organization, kitchen, or shelter name.');
      return;
    }
    if (!registerPassword.trim()) {
      setLocalError('Please enter a password.');
      return;
    }
    if (registerPassword.length < 4) {
      setLocalError('Password must be at least 4 characters.');
      return;
    }

    try {
      const success = await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
        organization: registerOrg
      });
      if (!success) {
        setLocalError('Could not register account. Please try again.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Failed to create account. Email may already be in use.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafd] text-slate-900 flex flex-col justify-between selection:bg-[#c2e7ff] selection:text-[#001d35] font-sans relative antialiased">
      
      {/* Subtle Background Glows (Google & Gemini Ambient Tones) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[10%] w-[520px] h-[520px] bg-[#1a73e8]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[480px] h-[480px] bg-[#7c3aed]/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#dfe3e7_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN HERO SECTION */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: BRANDING & SIMPLE PROBLEM STATEMENT */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-7 text-left">
            
            {/* Branding: Icon + FoodRescueAI + Subtitle */}
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl gemini-gradient-bg p-0.5 shadow-lg shadow-[#1a73e8]/20 flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl shadow-inner">
                  🌱
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
                  FoodRescue<span className="gemini-gradient-text">AI</span>
                </h1>
                <p className="text-sm sm:text-base font-bold text-[#0b57d0] tracking-tight">
                  Autonomous Food Rescue & Redistribution System
                </p>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="pt-1">
              <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                Every day, huge amounts of good, fresh surplus food from canteens, restaurants, and bakeries are thrown away. At the same time, many shelters, charities, and community kitchens struggle to find enough food for people in need.
              </p>
            </div>

            {/* Primary Action & Features */}
            <div className="pt-2 space-y-4">
              <div>
                <button
                  onClick={() => {
                    setAuthMode('CREATE_ACCOUNT');
                    setLocalError(null);
                    clearAuthError();
                  }}
                  className="px-7 py-3.5 rounded-2xl gemini-gradient-btn font-extrabold text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex items-center space-x-2.5 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Simple Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/90 text-xs">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1a73e8] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Fast AI Matching</span>
                    <span className="text-[11px] text-slate-500">Matches dietary needs & proximity</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#1e8e3e] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Safe Food Handling</span>
                    <span className="text-[11px] text-slate-500">Tracks temperature & expiry</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <HeartHandshake className="w-4 h-4 text-[#f9ab00] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Zero Waste Impact</span>
                    <span className="text-[11px] text-slate-500">Supports UN SDGs 2 & 12</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: PROFESSIONAL SIGN IN & CREATE ACCOUNT CARD */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-5 transition-all">
              
              {/* Card Header with Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('SIGN_IN');
                      setLocalError(null);
                      clearAuthError();
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                      authMode === 'SIGN_IN'
                        ? 'bg-[#0b57d0] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('CREATE_ACCOUNT');
                      setLocalError(null);
                      clearAuthError();
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                      authMode === 'CREATE_ACCOUNT'
                        ? 'bg-[#0b57d0] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0b57d0] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full border border-[#c2e7ff]">
                  {authMode === 'SIGN_IN' ? 'Secure Login' : 'New Registration'}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {authMode === 'SIGN_IN' ? 'Welcome Back' : 'Create an Account'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {authMode === 'SIGN_IN' 
                    ? 'Sign in to continue to FoodRescue AI' 
                    : 'Register your organization to rescue or receive food'}
                </p>
              </div>

              {/* Error Message */}
              {(localError || authError) && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{localError || authError}</span>
                </div>
              )}

              {/* ================================================================= */}
              {/* MODE 1: SIGN IN FORM */}
              {/* ================================================================= */}
              {authMode === 'SIGN_IN' && (
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="welcome-email" className="block text-xs font-bold text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="welcome-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setLocalError(null);
                          clearAuthError();
                        }}
                        placeholder="you@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="welcome-password" className="block text-xs font-bold text-slate-700">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="welcome-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setLocalError(null);
                          clearAuthError();
                        }}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition-all placeholder:text-slate-400 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl gemini-gradient-btn disabled:opacity-60 font-extrabold text-xs sm:text-sm shadow-md shadow-[#1a73e8]/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        <span>Signing In…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Create Account Link */}
                  <div className="text-center pt-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('CREATE_ACCOUNT');
                          setLocalError(null);
                          clearAuthError();
                        }}
                        className="font-bold text-[#0b57d0] hover:text-[#1a73e8] hover:underline cursor-pointer"
                      >
                        Create Account
                      </button>
                    </p>
                  </div>

                </form>
              )}

              {/* ================================================================= */}
              {/* MODE 2: CREATE ACCOUNT FORM */}
              {/* ================================================================= */}
              {authMode === 'CREATE_ACCOUNT' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  
                  {/* Name Field */}
                  <div className="space-y-1">
                    <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="reg-name"
                        type="text"
                        required
                        value={registerName}
                        onChange={(e) => {
                          setRegisterName(e.target.value);
                          setLocalError(null);
                          clearAuthError();
                        }}
                        placeholder="e.g. Dr. Anita Rao"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => {
                          setRegisterEmail(e.target.value);
                          setLocalError(null);
                          clearAuthError();
                        }}
                        placeholder="anita@cityshelter.org"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Organization Field */}
                  <div className="space-y-1">
                    <label htmlFor="reg-org" className="block text-xs font-bold text-slate-700">
                      Organization / Kitchen / Shelter *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="reg-org"
                        type="text"
                        required
                        value={registerOrg}
                        onChange={(e) => {
                          setRegisterOrg(e.target.value);
                          setLocalError(null);
                          clearAuthError();
                        }}
                        placeholder="e.g. City Community Shelter"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-1">
                    <label htmlFor="reg-role" className="block text-xs font-bold text-slate-700">
                      Account Role *
                    </label>
                    <select
                      id="reg-role"
                      value={registerRole}
                      onChange={(e) => setRegisterRole(e.target.value as UserRole)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#1a73e8] focus:bg-white transition-all"
                    >
                      <option value="FOOD_PROVIDER">👨‍🍳 Food Provider (Canteen / Kitchen / Restaurant)</option>
                      <option value="RECIPIENT">🏠 Recipient Charity (Shelter / Food Bank / NGO)</option>
                      <option value="LOGISTICS_COORDINATOR">🚐 Logistics Coordinator (Delivery / Driver)</option>
                    </select>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="reg-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        value={registerPassword}
                        onChange={(e) => {
                          setRegisterPassword(e.target.value);
                          setLocalError(null);
                          clearAuthError();
                        }}
                        placeholder="At least 4 characters"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#c2e7ff]/50 transition-all placeholder:text-slate-400 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        tabIndex={-1}
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Create Account Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl gemini-gradient-btn disabled:opacity-60 font-extrabold text-xs sm:text-sm shadow-md shadow-[#1a73e8]/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        <span>Creating Account…</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Create Account & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Switch to Sign In Link */}
                  <div className="text-center pt-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('SIGN_IN');
                          setLocalError(null);
                          clearAuthError();
                        }}
                        className="font-bold text-[#0b57d0] hover:text-[#1a73e8] hover:underline cursor-pointer"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>
      </main>

    </div>
  );
};
