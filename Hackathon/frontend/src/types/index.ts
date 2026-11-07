export type UserRole = 'CUSTOMER' | 'COURIER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: UserRole;
  userId: number;
}

export interface Shipment {
  id: number;
  trackingId: string;
  customerId: number;
  courierId: number;
  originAddress: string;
  destinationAddress: string;
  currentStatus: 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DISPUTED';
  estimatedDelivery?: string;
  actualDelivery?: string;
  recipientName: string;
  recipientPhone: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ShipmentHistory {
  id: number;
  shipmentId: number;
  status: string;
  note: string;
  performedBy: string;
  timestamp: string;
}

export interface ShipmentTrackingResponse {
  shipment: Shipment;
  history: ShipmentHistory[];
}

export interface DashboardStats {
  totalShipments: number;
  delivered: number;
  inTransit: number;
  pending: number;
}

export type Evidence = DeliveryEvidence;
export interface DeliveryEvidence {
  id: number;
  evidenceId: string;
  shipmentId: number;
  uploadedByCourierId: number;
  imageUrl: string;
  imageFileName: string;
  checksum: string;
  receiverName: string;
  receiverSignature?: string;
  deliveryNotes?: string;
  gpsLocation?: string;
  deliveredAt: string;
  uploadStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface Dispute {
  id: number;
  disputeRef: string;
  shipmentId: number;
  trackingId: string;
  customerId: number;
  reason: 'PACKAGE_NOT_RECEIVED' | 'DAMAGED' | 'WRONG_ITEM' | 'LATE_DELIVERY' | 'OTHER';
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  resolution?: string;
  resolvedByAdminId?: number;
  createdAt: string;
  resolvedAt?: string;
  updatedAt?: string;
}

export interface DisputeNote {
  id: number;
  disputeId: number;
  note: string;
  addedBy: string;
  addedByRole: string;
  addedAt: string;
}

export interface DisputeDetailResponse {
  dispute: Dispute;
  notes: DisputeNote[];
}

export interface DisputeStats {
  open: number;
  underReview: number;
  resolved: number;
  rejected: number;
  total: number;
}

export interface AuditRecord {
  id: number;
  correlationId: string;
  eventType: string;
  entityType: string;
  entityId: number;
  actorEmail: string;
  actorRole: string;
  description: string;
  metadata?: string;
  timestamp: string;
}

