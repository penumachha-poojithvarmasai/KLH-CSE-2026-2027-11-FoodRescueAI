import React from 'react';
import { Layers, CheckCircle2, BookmarkCheck } from 'lucide-react';

export const COMapping: React.FC = () => {
  const mappings = [
    {
      co: 'CO1',
      title: 'SOA Principles, Architecture & Governance',
      topics: [
        { name: 'Loose Coupling & Autonomous Services', desc: 'Each service has independent runtime, independent pom.xml, and independent port.', location: 'backend/*', status: 'Implemented' },
        { name: 'Orchestration Pattern', desc: 'Dispute Service acts as coordinator to validate shipment existence, invoke audit log, and dispatch notification.', location: 'backend/dispute-service/service/DisputeService.java', status: 'Implemented' },
        { name: 'REST vs SOAP Comparison', desc: 'Full comparative matrix covering payloads, envelope complexity, and use-case evaluation.', location: 'docs/PROJECT_REPORT.md & Architecture Explorer', status: 'Implemented' },
        { name: 'Agile User Stories & Acceptance Criteria', desc: 'US-01 through US-06 defined with sprint velocity, tasks, and acceptance constraints.', location: 'docs/USER_STORIES_AND_SPRINT.md & Local Agile Board', status: 'Implemented' },
      ]
    },
    {
      co: 'CO2',
      title: 'Security & Observability',
      topics: [
        { name: 'Spring Security & Stateless JWT', desc: 'JWT issued upon authentication, verified via OncePerRequestFilter with HMAC SHA-256 signatures.', location: 'backend/auth-service & all microservices', status: 'Implemented' },
        { name: 'Role-Based Access Control (RBAC)', desc: 'CUSTOMER, COURIER, and ADMIN authorities enforced on sensitive endpoints via @EnableMethodSecurity.', location: 'SecurityConfig.java in each service', status: 'Implemented' },
        { name: 'CORS Configuration & Safe Headers', desc: 'Centralized Gateway CORS policy allowing origin http://localhost:5173 with restricted methods.', location: 'backend/api-gateway/config/GatewayConfig.java', status: 'Implemented' },
        { name: 'Cryptographic Delivery Integrity', desc: 'SHA-256 evidence hashing prevents courier or customer tampering with delivery photos.', location: 'backend/evidence-service/service/EvidenceService.java', status: 'Implemented' },
      ]
    },
    {
      co: 'CO3',
      title: 'Service Discovery, Gateway & Database-Per-Service',
      topics: [
        { name: 'Netflix Eureka Service Discovery', desc: 'Autonomous discovery server on port 8761 with client registration heartbeats.', location: 'backend/discovery-server', status: 'Implemented' },
        { name: 'Spring Cloud API Gateway Routing', desc: 'Dynamic path routing (/api/shipments/**, /api/disputes/**) with X-Correlation-ID injection.', location: 'backend/api-gateway', status: 'Implemented' },
        { name: 'Database-Per-Service Pattern', desc: 'Isolated schemas (courierproof_auth, courierproof_shipments, courierproof_disputes, etc.) with zero direct cross-service SQL joins.', location: 'database/migrations & application.yml', status: 'Implemented' },
        { name: 'Spring Data JPA Persistence', desc: 'Declarative repositories, transactional entity mutations, and history audit records.', location: 'backend/*/repository/*', status: 'Implemented' },
      ]
    },
    {
      co: 'CO4',
      title: 'Testing & Continuous Integration (CI/CD)',
      topics: [
        { name: 'Unit Testing with JUnit 5 & Mockito', desc: 'Isolated business logic tests validating status transitions, dispute rules, and boundary exceptions.', location: 'backend/shipment-service/src/test/*', status: 'Implemented' },
        { name: 'Integration Testing & Build Verification', desc: 'Full Maven reactor compile and package passes across all 9 modules without compilation error.', location: 'mvn clean compile verification', status: 'Implemented' },
        { name: 'GitHub Actions Automated Workflow', desc: 'Multi-stage CI pipeline automating Java 21 setup, Maven builds, unit testing, and React Vite build check.', location: '.github/workflows/ci.yml', status: 'Implemented' },
        { name: 'Contract & OpenAPI Documentation', desc: 'Documented HTTP REST schemas, request payloads, response DTOs, and error codes.', location: 'docs/API_DOCUMENTATION.md', status: 'Implemented' },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Outcome (CO) Alignment Matrix</h1>
        <p className="text-sm text-slate-500">Mapping CourierProof codebase directly to the university SOA syllabus and evaluation criteria</p>
      </div>

      <div className="space-y-6">
        {mappings.map((m, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-blue-600 text-white font-mono font-bold text-xs rounded-lg">{m.co}</span>
                <h2 className="text-base font-bold text-slate-900">{m.title}</h2>
              </div>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 100% Evaluated
              </span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {m.topics.map((t, tIdx) => (
                <div key={tIdx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50">
                  <div className="space-y-1 max-w-2xl">
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <p className="text-slate-500 leading-normal">{t.desc}</p>
                  </div>
                  <div className="flex flex-col md:items-end gap-1">
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{t.location}</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

