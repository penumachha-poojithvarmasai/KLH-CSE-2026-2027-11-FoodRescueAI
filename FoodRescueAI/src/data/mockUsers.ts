import type { UserRecord, UserRole } from '../types';

export interface DemoUserAccount {
  user: UserRecord;
  demoPasswordHash: string; // Demo password
}

export const DEMO_USERS: Record<UserRole, DemoUserAccount> = {
  FOOD_PROVIDER: {
    user: {
      id: 'usr-1',
      name: 'Grand Plaza Hotel',
      email: 'provider@foodrescue.ai',
      role: 'FOOD_PROVIDER',
      organization: 'Grand Plaza Hospitality',
      createdAt: '2026-01-15T08:00:00.000Z'
    },
    demoPasswordHash: 'provider123'
  },
  RECIPIENT: {
    user: {
      id: 'usr-2',
      name: 'The Akshaya Patra Foundation',
      email: 'recipient@foodrescue.ai',
      role: 'RECIPIENT',
      organization: 'The Akshaya Patra Foundation',
      createdAt: '2026-01-20T10:00:00.000Z',
      sourceName: 'The Akshaya Patra Foundation Official Registry',
      sourceUrl: 'https://www.akshayapatra.org'
    },
    demoPasswordHash: 'recipient123'
  },
  LOGISTICS_COORDINATOR: {
    user: {
      id: 'usr-3',
      name: 'Alex Rivera',
      email: 'logistics@foodrescue.ai',
      role: 'LOGISTICS_COORDINATOR',
      organization: 'City Express Logistics',
      createdAt: '2026-02-01T09:00:00.000Z'
    },
    demoPasswordHash: 'logistics123'
  },
  ADMIN: {
    user: {
      id: 'usr-4',
      name: 'System Admin',
      email: 'admin@foodrescue.ai',
      role: 'ADMIN',
      organization: 'FoodRescue AI Headquarters',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    demoPasswordHash: 'admin123'
  }
};

