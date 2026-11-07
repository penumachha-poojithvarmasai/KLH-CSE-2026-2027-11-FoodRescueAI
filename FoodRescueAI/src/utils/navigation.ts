import type { LucideIcon } from 'lucide-react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Bot, 
  GitMerge, 
  Repeat, 
  Truck, 
  Bell, 
  Globe2, 
  Settings,
  Building2,
  UtensilsCrossed
} from 'lucide-react';
import type { UserRole } from '../types';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  count?: number;
}

export function getRoleNavConfig(
  userRole: UserRole, 
  context: { 
    isSimulating: boolean; 
    agentStage: string; 
    unreadNotifs: number 
  }
): { title: string; items: NavItem[] } {
  const { isSimulating, agentStage, unreadNotifs } = context;
  const agentBadge = isSimulating ? 'SIMULATING' : agentStage !== 'IDLE' ? agentStage : undefined;
  const notifCount = unreadNotifs > 0 ? unreadNotifs : undefined;

  switch (userRole) {
    case 'FOOD_PROVIDER':
      return {
        title: 'Food Provider Menu',
        items: [
          { id: 'dashboard', label: 'Provider Dashboard', icon: UtensilsCrossed },
          { id: 'submissions', label: 'Report Surplus Food', icon: PlusCircle },
          { id: 'matching', label: 'Recipient Matching', icon: GitMerge },
          { id: 'pickup', label: 'Pickup Tracker', icon: Truck },
          { id: 'notifications', label: 'Notifications', icon: Bell, count: notifCount },
          { id: 'impact', label: 'Provider Impact', icon: Globe2 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ]
      };

    case 'RECIPIENT':
      return {
        title: 'Recipient NGO Menu',
        items: [
          { id: 'dashboard', label: 'Recipient Dashboard', icon: Building2 },
          { id: 'matching', label: 'Available Surplus Food', icon: GitMerge },
          { id: 'redistribution', label: 'Active Allocations', icon: Repeat },
          { id: 'pickup', label: 'Delivery Tracker', icon: Truck },
          { id: 'notifications', label: 'Notifications', icon: Bell, count: notifCount },
          { id: 'impact', label: 'Community Impact', icon: Globe2 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ]
      };

    case 'LOGISTICS_COORDINATOR':
      return {
        title: 'Logistics Command Menu',
        items: [
          { id: 'dashboard', label: 'Logistics Dashboard', icon: Truck },
          { id: 'pickup', label: 'Pickup & Dispatch', icon: Truck },
          { id: 'redistribution', label: 'Redistribution Flow', icon: Repeat },
          { id: 'agent', label: 'AI Dispatch Agent', icon: Bot, badge: agentBadge },
          { id: 'notifications', label: 'Notifications', icon: Bell, count: notifCount },
          { id: 'impact', label: 'Fleet Impact', icon: Globe2 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ]
      };

    case 'ADMIN':
    default:
      return {
        title: 'Executive Admin Console',
        items: [
          { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
          { id: 'agent', label: 'AI Agent Command', icon: Bot, badge: agentBadge },
          { id: 'submissions', label: 'All Food Listings', icon: PlusCircle },
          { id: 'matching', label: 'Matching Engine', icon: GitMerge },
          { id: 'redistribution', label: 'Redistribution Flow', icon: Repeat },
          { id: 'pickup', label: 'Fleet Operations', icon: Truck },
          { id: 'notifications', label: 'Notifications', icon: Bell, count: notifCount },
          { id: 'impact', label: 'SDG & Carbon Analytics', icon: Globe2 },
          { id: 'settings', label: 'Platform Settings', icon: Settings },
        ]
      };
  }
}
