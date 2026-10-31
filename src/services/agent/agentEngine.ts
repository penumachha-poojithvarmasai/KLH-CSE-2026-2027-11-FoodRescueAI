import type { AgentStage, AgentEvent } from '../../types';

export interface AgentSimulationStep {
  stage: AgentStage;
  message: string;
  details: string;
  delayMs: number;
}

export const AGENT_SIMULATION_STEPS: AgentSimulationStep[] = [
  {
    stage: 'OBSERVE',
    message: 'Surplus Food Detected',
    details: 'Autonomous scanner captured new food listing from Grand Horizon University Canteen: 85 meals of Hot Biryani & Curry.',
    delayMs: 1200
  },
  {
    stage: 'ANALYZE',
    message: 'AI Analyzing Food Characteristics...',
    details: 'Rule-Engine evaluated storage condition (Hot Held), remaining usable time (4h), perishability (HIGH), and assigned Priority Score 94/100.',
    delayMs: 1500
  },
  {
    stage: 'DECIDE',
    message: 'Selecting Optimal Recipient...',
    details: '5-factor deterministic matching engine scored candidate recipients. Selected The Akshaya Patra Foundation (Score 94%, Distance 2.4 km).',
    delayMs: 1500
  },
  {
    stage: 'ACT',
    message: 'Dispatching Redistribution Request...',
    details: 'Autonomous agent dispatched priority request payload to The Akshaya Patra Foundation and sent real-time notification alerts.',
    delayMs: 1500
  },
  {
    stage: 'MONITOR',
    message: 'Monitoring Pickup & Redistribution...',
    details: 'Logistics tracking initialized. Express Van #4 assigned for pickup. Real-time ETA telemetry active.',
    delayMs: 1200
  }
];

export class AgentEngine {
  public static createAgentEvent(stage: AgentStage, message: string, details: string, dataPayload?: any): AgentEvent {
    return {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      stage,
      timestamp: new Date().toISOString(),
      message,
      details,
      dataPayload
    };
  }
}
