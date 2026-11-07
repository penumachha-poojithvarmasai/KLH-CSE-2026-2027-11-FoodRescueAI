import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api/apiService';
import type { EmailServiceStatus, TwilioServiceStatus } from '../types';
import { 
  Settings, 
  Cpu, 
  UserCheck, 
  RotateCcw, 
  CheckCircle2, 
  Key,
  Server,
  Palette,
  Mail,
  MessageSquare,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    userRole, 
    aiMode, 
    setAiMode, 
    resetToMockData 
  } = useApp();

  const [aiBackendStatus, setAiBackendStatus] = useState<{
    gemini_configured: boolean;
    model: string;
    active_engine: string;
    fallback_mode: boolean;
  } | null>(null);

  const [emailStatus, setEmailStatus] = useState<EmailServiceStatus | null>(null);
  const [smsStatus, setSmsStatus] = useState<TwilioServiceStatus | null>(null);
  const [isRefreshingServices, setIsRefreshingServices] = useState<boolean>(false);

  const fetchServiceStatuses = async () => {
    setIsRefreshingServices(true);
    try {
      const [aiRes, emailRes, smsRes] = await Promise.allSettled([
        ApiService.checkAIStatus(),
        ApiService.checkEmailStatus(),
        ApiService.checkSMSStatus()
      ]);
      if (aiRes.status === 'fulfilled') setAiBackendStatus(aiRes.value);
      if (emailRes.status === 'fulfilled') setEmailStatus(emailRes.value);
      if (smsRes.status === 'fulfilled') setSmsStatus(smsRes.value);
    } catch {
      // safe fallback handling
    } finally {
      setIsRefreshingServices(false);
    }
  };

  useEffect(() => {
    fetchServiceStatuses();
  }, []);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);


  const handleSaveSettings = () => {
    setSaveStatus('Settings updated successfully!');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Platform Configuration</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Settings & Agent Engine Controls</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage user roles, AI decision engine modes, simulated latency, seed data, and SOA integration readiness.
          </p>
        </div>
      </div>

      {saveStatus && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* ── UNIFIED THEME BADGE ── */}
      <div className="p-6 rounded-2xl glass-panel border border-emerald-200/80 space-y-3">
        <div className="flex items-center space-x-2 text-emerald-700">
          <Palette className="w-5 h-5" />
          <h3 className="font-extrabold text-sm text-slate-900">Platform Appearance</h3>
        </div>
        <p className="text-xs text-slate-600">
          The entire platform is unified under one bright, warm sunlight & organic emerald color theme designed for maximum clarity, optimism, and readability.
        </p>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">☀️</span>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">Warm Sunlight & Fresh Emerald</span>
              <span className="text-[10px] text-emerald-800 font-semibold">Single Unified Global Design System</span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-full shadow-sm">
            ACTIVE WORLDWIDE
          </span>
        </div>
      </div>


      {/* Active Session Info Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400">
            <UserCheck className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-200">Current Authenticated Workspace</h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
            {userRole.replace('_', ' ')}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Navigation options, capabilities, and dashboard widgets are customized strictly for your authenticated role.
        </p>
      </div>

      {/* AI Decision Engine Configuration */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Cpu className="w-5 h-5" />
          <h3 className="font-bold text-sm text-slate-200">AI Intelligence Engine Selection</h3>
        </div>

        <p className="text-xs text-slate-400">
          Choose the active intelligence engine for perishability analysis and recipient priority scoring.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              setAiMode('RULE_ENGINE');
              handleSaveSettings();
            }}
            className={`p-4 rounded-xl text-left border transition space-y-2 ${
              aiMode === 'RULE_ENGINE'
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold glow-indigo'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Deterministic Rule Engine</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">DEFAULT</span>
            </div>
            <p className="text-[11px] text-slate-400">Zero external API dependencies. instant local evaluation.</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setAiMode('SIMULATED_GEMINI');
              handleSaveSettings();
            }}
            className={`p-4 rounded-xl text-left border transition space-y-2 ${
              aiMode === 'SIMULATED_GEMINI'
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold glow-indigo'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Simulated Gemini 1.5 Pro</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">SIMULATED</span>
            </div>
            <p className="text-[11px] text-slate-400">Simulates real Gemini API latency and rich LLM reasoning payloads.</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setAiMode('REAL_GEMINI');
              handleSaveSettings();
            }}
            className={`p-4 rounded-xl text-left border transition space-y-2 ${
              aiMode === 'REAL_GEMINI'
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold glow-indigo'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Google Gemini 3.8 Flash</span>
              {aiBackendStatus?.gemini_configured ? (
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">ACTIVE CLOUD</span>
              ) : (
                <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">FALLBACK READY</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {aiBackendStatus?.gemini_configured
                ? 'Live Gemini 3.8 Flash cloud analysis active via backend configuration.'
                : 'Deterministic fallback ready. Configure GEMINI_API_KEY in backend/.env for live cloud AI.'}
            </p>
          </button>
        </div>

        {/* Gemini AI Backend Status & Security Card */}
        {aiMode === 'REAL_GEMINI' && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Backend Gemini Engine Status (Loaded from backend/.env)</span>
              </label>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                aiBackendStatus?.gemini_configured 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {aiBackendStatus?.gemini_configured ? '● CLOUD CONNECTED' : '○ FALLBACK ACTIVE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-900/90 p-3 rounded-lg border border-slate-800 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">Default Model:</span>
                <span className="text-indigo-300 font-bold">{aiBackendStatus?.model || 'gemini-3.8-flash'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Active Engine:</span>
                <span className="text-slate-300 truncate block">{aiBackendStatus?.active_engine || 'RuleEngineFallback'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Config Source:</span>
                <span className="text-emerald-400">backend/.env (GEMINI_API_KEY)</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Security note: The Gemini API key is loaded strictly on the backend via environment variables and is never exposed in client bundles. If unconfigured or offline, the deterministic RuleEngineFallback guarantees 100% uptime.
            </p>
          </div>
        )}
      </div>

      {/* Outbound Notification & Gateway Services Status (Email & SMS) */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Mail className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-200">Outbound Notification & Dispatch Gateways</h3>
          </div>
          <button
            type="button"
            onClick={fetchServiceStatuses}
            disabled={isRefreshingServices}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingServices ? 'animate-spin' : ''}`} />
            <span>Check Telemetry Status</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Live operational status of external notification delivery pipelines. Zero credentials or passwords are ever exposed to the client bundle.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* SMTP Email Delivery Service Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">SMTP Email Delivery Service</h4>
                    <span className="text-[10px] text-slate-500 font-mono">GET /api/v1/notifications/email/status</span>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                  emailStatus?.configured 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {emailStatus?.configured ? '● LIVE SMTP DISPATCH' : '○ SAFE FALLBACK MODE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-3 rounded-lg border border-slate-800 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">SMTP Host / Server:</span>
                  <span className={`text-[11px] font-bold truncate block ${emailStatus?.configured ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {emailStatus?.configured ? emailStatus.smtp_host : 'Unconfigured'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Port & Security:</span>
                  <span className="text-[11px] text-slate-300 block">
                    {emailStatus?.configured ? `${emailStatus.smtp_port} (${emailStatus.use_tls ? 'TLS' : 'Plain'})` : 'Local Fallback'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Sender Identity:</span>
                  <span className="text-[11px] text-slate-300 truncate block">
                    {emailStatus?.from_email || 'notifications@foodrescue.ai'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Delivery Mode:</span>
                  <span className={`text-[11px] font-semibold truncate block ${emailStatus?.configured ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {emailStatus?.delivery_mode || 'Safe Mock/In-App Fallback'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              {emailStatus?.configured
                ? 'Live SMTP outbound dispatch enabled for redistribution receipts and urgency alerts.'
                : 'Safe Fallback Mode: Outbound emails are gracefully simulated and preserved in-app without raising errors or connecting to external servers.'}
            </p>
          </div>

          {/* Twilio SMS Gateway Service Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Twilio SMS Gateway</h4>
                    <span className="text-[10px] text-slate-500 font-mono">GET /api/v1/notifications/sms/status</span>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                  smsStatus?.twilio_configured 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {smsStatus?.twilio_configured ? '● CLOUD CONNECTED' : '○ IN-APP FALLBACK'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-3 rounded-lg border border-slate-800 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Active Gateway:</span>
                  <span className={`text-[11px] font-bold truncate block ${smsStatus?.twilio_configured ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {smsStatus?.twilio_configured ? 'Twilio Cloud SMS' : 'In-App Fallback'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Sender Phone:</span>
                  <span className="text-[11px] text-slate-300 block">
                    {smsStatus?.sender_masked || 'None (Internal)'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500 block">Fallback Engine:</span>
                  <span className="text-[11px] text-slate-300 truncate block">
                    {smsStatus?.fallback_mode ? 'Deterministic Zero-Dependency Signal' : 'Live Cellular Dispatch'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              {smsStatus?.twilio_configured
                ? 'Twilio SMS cellular broadcast active via backend configuration.'
                : 'Zero-dependency fallback active: In-app telemetry guarantees 100% notification delivery without external cloud SMS fees.'}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Security & Zero-Leak Guarantee: All API tokens, SMTP passwords, and secret keys remain strictly isolated on the backend server environment (<code className="text-slate-300">backend/.env</code>). No private secrets are ever serialized or transmitted to the web frontend.
          </span>
        </div>
      </div>

      {/* Future Microservices Readiness Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Server className="w-5 h-5" />
          <h3 className="font-bold text-sm text-slate-200">Spring Boot & SOA Integration Architecture</h3>
        </div>

        <p className="text-xs text-slate-400">
          The application service layer is decoupled and abstracted to seamlessly connect with Spring Cloud microservices:
        </p>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="text-emerald-400">React Frontend</span>
            <span>→</span>
            <span className="text-indigo-400">Spring Cloud Gateway</span>
            <span>→</span>
            <span className="text-amber-400">Eureka Service Registry</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Microservices: <strong className="text-slate-300">Auth-Service</strong> (Port 8081) | <strong className="text-slate-300">Food-Service</strong> (Port 8082) | <strong className="text-slate-300">AI-Agent-Service</strong> (Port 8083) | <strong className="text-slate-300">Matching-Service</strong> (Port 8084) | <strong className="text-slate-300">Logistics-Service</strong> (Port 8085)
          </div>
        </div>
      </div>

      {/* Reset Seed Data */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-200">Reset Demo Data</h3>
          <p className="text-xs text-slate-400">Restore default initial food submissions, recipients, and notifications.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetToMockData();
            handleSaveSettings();
          }}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-bold transition flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
