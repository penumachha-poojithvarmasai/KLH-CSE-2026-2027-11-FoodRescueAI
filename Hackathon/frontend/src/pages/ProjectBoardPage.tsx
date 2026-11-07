import React from 'react';
import { Kanban, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const ProjectBoardPage: React.FC = () => {
  const stories = [
    { id: 'US-01', title: 'Shipment Tracking', desc: 'As a customer, track shipment history and current status.', points: 3, status: 'DONE', role: 'CUSTOMER' },
    { id: 'US-02', title: 'Cryptographic Proof Upload', desc: 'As a courier, upload delivery photo with SHA-256 hash.', points: 5, status: 'DONE', role: 'COURIER' },
    { id: 'US-03', title: 'Delivery Dispute Initiation', desc: 'As a customer, raise dispute with explanation and tracking code.', points: 5, status: 'DONE', role: 'CUSTOMER' },
    { id: 'US-04', title: 'Admin Dispute Arbitration', desc: 'As an admin, review evidence and resolve or reject dispute with mandatory reason.', points: 8, status: 'DONE', role: 'ADMIN' },
    { id: 'US-05', title: 'Cross-Service Audit Log', desc: 'As an auditor, trace chronological actions with correlation IDs.', points: 3, status: 'DONE', role: 'ADMIN' },
    { id: 'US-06', title: 'Role-Based Endpoint Protection', desc: 'As a security lead, enforce JWT RBAC filters across all APIs.', points: 5, status: 'DONE', role: 'SYSTEM' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agile Project & Sprint Board</h1>
        <p className="text-sm text-slate-500">Local hackathon sprint tracking (Demonstrating Agile / Scrum practices for CO1)</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-800 flex items-center justify-between">
        <div>
          <strong>Sprint 1 Velocity:</strong> 29 Story Points Completed | 100% Sprint Goal Achieved (End-to-End Delivery Verification)
        </div>
        <span className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-md text-[10px]">SPRINT 1 - CLOSED</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-100/70 p-4 rounded-xl border border-slate-200 flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <span>Product Backlog</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">0</span>
          </div>
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg">
            All prioritized hackathon user stories moved to sprint completion.
          </div>
        </div>

        <div className="bg-slate-100/70 p-4 rounded-xl border border-slate-200 flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <span>In Review / Verification</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">0</span>
          </div>
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg">
            All acceptance criteria tested and verified via backend JUnit & UI workflow.
          </div>
        </div>

        <div className="bg-slate-100/70 p-4 rounded-xl border border-slate-200 flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <span>Sprint Done</span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{stories.length}</span>
          </div>
          {stories.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{s.id}: {s.title}</span>
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] rounded">{s.points} pts</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">{s.desc}</p>
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[10px] font-semibold text-blue-600">{s.role}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" /> Accepted
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

