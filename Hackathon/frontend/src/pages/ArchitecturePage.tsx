import React from 'react';
import { Network, Server, Database, ArrowRight, Layers, FileCode2, Cpu } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const services = [
    { name: 'API Gateway', port: '8080', tech: 'Spring Cloud Gateway', role: 'Central entrypoint, JWT parsing, routing & CORS', color: 'bg-blue-600' },
    { name: 'Discovery Server', port: '8761', tech: 'Netflix Eureka', role: 'Service registry, heartbeat monitor & dynamic routing', color: 'bg-emerald-600' },
    { name: 'Auth Service', port: '8081', tech: 'Spring Security + JWT', role: 'User identities, BCrypt credential hashing & RBAC', color: 'bg-purple-600' },
    { name: 'Shipment Service', port: '8082', tech: 'Spring Data JPA', role: 'Tracking timeline, lifecycle status transitions', color: 'bg-amber-600' },
    { name: 'Evidence Service', port: '8083', tech: 'Multipart + SHA-256', role: 'Proof-of-delivery ingestion, hashing & binary serving', color: 'bg-teal-600' },
    { name: 'Dispute Service', port: '8084', tech: 'Orchestrator', role: 'Cross-service arbitration, case history & notes', color: 'bg-rose-600' },
    { name: 'Audit Service', port: '8085', tech: 'Immutable Ledger', role: 'Chronological activity stream & correlation tracking', color: 'bg-slate-700' },
    { name: 'Notification Service', port: '8086', tech: 'Event Listener', role: 'In-app event notifications for users & couriers', color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SOA & Microservices Architecture Explorer</h1>
        <p className="text-sm text-slate-500">Service topology, loose coupling verification, and orchestration flow</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          System Architectural Blueprint
        </h2>

        <div className="bg-slate-900 text-slate-200 p-6 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          <pre>{`
 [React 19 + TypeScript SPA (Vite :5173)]
                  │
                  ▼ (HTTP REST Requests with Authorization: Bearer JWT)
 ┌────────────────────────────────────────────────────────────────────────┐
 │           Spring Cloud API Gateway (Port 8080)                         │
 │           - Global CORS Filter                                         │
 │           - Correlation ID Header Injection (X-Correlation-ID)         │
 └───────────────────────────────┬────────────────────────────────────────┘
                                 │ Dynamic Service Discovery via Eureka (:8761)
            ┌────────────────────┼────────────────────┬─────────────────────┐
            ▼                    ▼                    ▼                     ▼
   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
   │  Auth Service   │  │Shipment Service │  │Evidence Service │  │ Dispute Service │
   │   (Port 8081)   │  │   (Port 8082)   │  │   (Port 8083)   │  │   (Port 8084)   │
   │  - BCrypt Pass  │  │  - Lifecycle    │  │  - SHA-256 Hash │  │ - Orchestrator  │
   │  - JWT Issue    │  │  - History Log  │  │  - Storage      │  │ - Arbitration   │
   └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
            │                    │                    │                    │
            ▼                    ▼                    ▼                    ▼
     courierproof_auth    courierproof_ship   courierproof_evid    courierproof_disp
         (MySQL)              (MySQL)              (MySQL)              (MySQL)
                                                                           │
                                              ┌────────────────────────────┴───────────┐
                                              ▼                                        ▼
                                     ┌─────────────────┐                      ┌─────────────────┐
                                     │  Audit Service  │                      │Notification Svc │
                                     │   (Port 8085)   │                      │   (Port 8086)   │
                                     │  - Event Audit  │                      │  - User Alerts  │
                                     └────────┬────────┘                      └────────┬────────┘
                                              ▼                                        ▼
                                      courierproof_audit                      courierproof_notif
`}</pre>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((s, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">:{s.port}</span>
              </div>
              <div className="text-[11px] font-semibold text-blue-600 mb-2">{s.tech}</div>
              <p className="text-xs text-slate-500 leading-normal">{s.role}</p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Microservice Autonomous
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            REST vs SOAP in CourierProof
          </h3>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p><strong>REST (Implemented):</strong> Resource-oriented, JSON payloads over HTTP. Ideal for web clients, sub-100ms response times, and standard multipart file uploads (Evidence Service).</p>
            <p><strong>SOAP (Enterprise Legacy Comparison):</strong> XML envelope-based with rigid WSDL contract. Used in legacy postal clearinghouses requiring WS-Security; higher payload overhead than REST.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            Database-Per-Service Pattern
          </h3>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>Every microservice strictly encapsulates its own MySQL schema. Dispute Service never directly performs SQL queries against the Shipment table; it calls the <code>/api/shipments/track/&#123;id&#125;</code> endpoint across the network.</p>
            <p>This guarantees schema autonomy and prevents database-level tight coupling.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

