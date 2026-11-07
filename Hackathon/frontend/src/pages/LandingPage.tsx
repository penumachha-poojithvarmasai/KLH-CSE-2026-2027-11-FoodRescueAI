import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, FileCheck, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Truck className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">CourierProof</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 rounded-lg text-white shadow transition-all"
          >
            Launch Platform
          </Link>
        </div>
      </header>

      <section className="flex-1 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-semibold mb-8">
          <ShieldCheck className="w-4 h-4" /> SOA & Microservices Architecture Hackathon Project
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight mb-6">
          Every Delivery. Every Proof. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
            Every Resolution.
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Address e-commerce false delivery claims with cryptographically verified photo proof, immutable audit trails, and transparent multi-service dispute arbitration.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            to="/shipments"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            Track a Shipment <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/disputes"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl transition-all"
          >
            Raise Delivery Dispute
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left w-full">
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Cryptographic Evidence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              SHA-256 evidence hashing prevents courier tampering. Upload photos, GPS metadata, and digital signature records.
            </p>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 bg-teal-600/20 text-teal-400 rounded-lg flex items-center justify-center mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Service Orchestration</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dispute workflows coordinate validation against Shipment Service, persistence in Dispute DB, and event audit tracking.
            </p>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Role-Based Access Control</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Strict JWT boundaries across Gateway: Couriers upload delivery proofs, Customers dispute, Admins arbitrate.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        CourierProof • Designed for Academic Evaluation & University Hackathon Demonstrations
      </footer>
    </div>
  );
};

