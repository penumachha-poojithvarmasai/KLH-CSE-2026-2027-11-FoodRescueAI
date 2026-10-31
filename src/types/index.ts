export type UserRole = 'FOOD_PROVIDER' | 'RECIPIENT' | 'LOGISTICS_COORDINATOR' | 'ADMIN';

export type FoodCategory = 
  | 'Cooked Meals' 
  | 'Bakery' 
  | 'Fruits & Vegetables' 
  | 'Dairy' 
  | 'Packaged Food' 
  | 'Beverages' 
  | 'Other';

export type PerishabilityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RedistributionStatus = 
  | 'AVAILABLE' 
  | 'ANALYZING' 
  | 'MATCHED' 
  | 'REQUESTED' 
  | 'ACCEPTED' 
  | 'PICKUP_REQUESTED' 
  | 'PICKUP_CONFIRMED' 
  | 'IN_TRANSIT' 
  | 'REDISTRIBUTED' 
  | 'COMPLETED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'EXPIRED';

export type AgentStage = 'OBSERVE' | 'ANALYZE' | 'DECIDE' | 'ACT' | 'MONITOR' | 'IDLE';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarUrl?: string;
  createdAt: string;
  sourceUrl?: string;
  sourceName?: string;
}

export interface AuthCredentials {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface UserSession {
  user: UserRecord;
  token: string;
  loginTimestamp: string;
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface FoodSubmission {
  id: string;
  providerId: string;
  providerName: string;
  foodName: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  estimatedServings: number;
  preparationTime: string;
  expiryTime: string;
  storageCondition: 'Ambient' | 'Refrigerated' | 'Frozen' | 'Hot Held';
  location: Location;
  urgency: UrgencyLevel;
  perishability: PerishabilityLevel;
  remainingHours: number;
  notes: string;
  status: RedistributionStatus;
  createdAt: string;
  aiAnalysis?: AIAnalysis;
  sourceUrl?: string;
  sourceName?: string;
}

export interface Recipient {
  id: string;
  name: string;
  organizationType: 'Shelter' | 'Community Kitchen' | 'Orphanage' | 'Food Bank' | 'Senior Home' | 'NGO';
  distanceKm: number;
  requiredQuantity: number;
  availableCapacity: number;
  foodCompatibility: FoodCategory[];
  currentNeedLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  availabilityHours: string;
  location: Location;
  contactPerson: string;
  phone: string;
  sourceUrl?: string;
  sourceName?: string;
}

export interface AIAnalysis {
  submissionId: string;
  category: FoodCategory;
  quantityAssessment: string;
  perishability: PerishabilityLevel;
  urgency: UrgencyLevel;
  remainingUsableHours: number;
  suitability: string;
  recommendedRecipients: string[];
  priorityScore: number; // 0 - 100
  recommendedAction: string;
  pickupRequired: boolean;
  reasoningSummary: string;
  analyzedAt: string;
}

export interface MatchScoreBreakdown {
  categoryCompatibilityScore: number; // max 25
  needLevelScore: number;            // max 25
  capacityMatchScore: number;        // max 20
  distanceScore: number;             // max 15
  availabilityScore: number;         // max 15
}

export interface RecipientMatch {
  recipientId: string;
  recipient: Recipient;
  submissionId: string;
  overallScore: number; // 0 - 100
  breakdown: MatchScoreBreakdown;
  suitabilityStatus: 'OPTIMAL' | 'GOOD' | 'MODERATE' | 'POOR';
}

export interface TimelineEntry {
  status: RedistributionStatus;
  timestamp: string;
  note: string;
}

export interface RedistributionItem {
  id: string;
  submissionId: string;
  submission: FoodSubmission;
  matchedRecipientId?: string;
  recipient?: Recipient;
  matchScore?: number;
  status: RedistributionStatus;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PickupTask {
  id: string;
  redistributionId: string;
  providerName: string;
  recipientName: string;
  pickupAddress: string;
  destinationAddress: string;
  coordinatorName: string;
  driverPhone: string;
  currentStatus: RedistributionStatus;
  estimatedPickup: string;
  estimatedArrival: string;
  distanceKm: number;
  sourceUrl?: string;
  sourceName?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  targetSection: string;
}

export interface AgentEvent {
  id: string;
  stage: AgentStage;
  timestamp: string;
  message: string;
  details: string;
  dataPayload?: any;
}

export interface DashboardMetrics {
  totalFoodRecoveredKg: number;
  totalMealsSaved: number;
  activeDonations: number;
  successfulRedistributions: number;
  urgentRequests: number;
  recipientsServed: number;
  foodWastePreventedKg: number;
  co2DivertedKg: number;
  waterSavedLiters: number;
}

export interface AdminSystemMetrics extends DashboardMetrics {
  totalUsersCount: number;
  providersCount: number;
  recipientsCount: number;
  logisticsCount: number;
  failedRedistributions: number;
  activeAgentWorkflows: number;
}

export interface EmailServiceStatus {
  configured: boolean;
  status: 'operational' | 'fallback_unconfigured' | string;
  smtp_host: string | null;
  smtp_port: number;
  from_email: string | null;
  smtp_user: string | null;
  use_tls: boolean;
  provider_type: string;
  delivery_mode: string;
}

export interface TwilioServiceStatus {
  twilio_configured: boolean;
  sender_configured: boolean;
  sender_masked: string | null;
  active_gateway: string;
  fallback_mode: boolean;
}

