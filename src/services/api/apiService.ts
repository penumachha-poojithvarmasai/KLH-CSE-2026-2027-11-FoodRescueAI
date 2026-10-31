import type { 
  FoodSubmission, 
  Recipient, 
  RedistributionItem, 
  PickupTask, 
  NotificationItem, 
  DashboardMetrics,
  RedistributionStatus,
  AIAnalysis,
  EmailServiceStatus,
  TwilioServiceStatus
} from '../../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';


export class ApiService {
  /**
   * Helper to append authorization headers when a session token exists.
   * Automatically retrieves active session token from localStorage if not explicitly provided.
   */
  public static getHeaders(token?: string, extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extraHeaders };
    let activeToken = token;
    if (!activeToken && typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('foodrescue_session_v1');
        if (stored) {
          const session = JSON.parse(stored);
          if (session?.token) {
            activeToken = session.token;
          }
        }
      } catch {}
    }
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }
    return headers;
  }

  /**
   * Performs FastAPI backend authentication with database-backed credentials & password hash verification.
   */
  public static async login(credentials: { email: string; password?: string }): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password || ''
      }),
      signal: AbortSignal.timeout(2500)
    });

    if (!res.ok) {
      let errMsg = 'Backend authentication failed';
      try {
        const errData = await res.json();
        errMsg = errData.detail || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    return await res.json();
  }

  /**
   * Performs FastAPI backend logout.
   */
  public static async logout(token?: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: ApiService.getHeaders(token)
      });
    } catch {}
  }

  /**
   * Registers a new user account via dedicated public self-registration flow.
   * Only allows FOOD_PROVIDER, RECIPIENT, LOGISTICS_COORDINATOR. Rejects ADMIN.
   */
  public static async registerUser(userData: {
    name: string;
    email: string;
    password?: string;
    role: string;
    organization: string;
  }): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email.trim().toLowerCase(),
        password: userData.password || '',
        role: userData.role,
        organization: userData.organization
      })
    });

    if (!res.ok) {
      let errMsg = 'Registration failed';
      try {
        const errData = await res.json();
        errMsg = errData.detail || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    return await res.json();
  }

  /**
   * Creates a user via protected administrator user management (POST /api/v1/users).
   * Requires ADMIN Bearer token. Legitimate administrators can provision any role.
   */
  public static async adminCreateUser(
    userData: {
      name: string;
      email: string;
      password?: string;
      role: string;
      organization: string;
    },
    token?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: ApiService.getHeaders(token),
      body: JSON.stringify({
        name: userData.name,
        email: userData.email.trim().toLowerCase(),
        password: userData.password || '',
        role: userData.role,
        organization: userData.organization
      })
    });

    if (!res.ok) {
      let errMsg = 'Admin user creation failed';
      try {
        const errData = await res.json();
        errMsg = errData.detail || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    return await res.json();
  }

  /**
   * Fetches the authenticated user profile using a JWT Bearer token from GET /api/v1/auth/me.
   */
  public static async getMe(token: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: ApiService.getHeaders(token),
      signal: AbortSignal.timeout(2500)
    });

    if (!res.ok) {
      let errMsg = 'Failed to fetch authenticated user profile';
      try {
        const errData = await res.json();
        errMsg = errData.detail || errMsg;
      } catch {}
      const err = new Error(errMsg) as any;
      err.status = res.status;
      throw err;
    }

    return await res.json();
  }


  /**
   * Checks if the FastAPI backend is running and healthy.
   */
  public static async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return false;
      const data = await res.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  }

  /**
   * Triggers initial backend database seeding.
   */
  public static async seedDatabase(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetches surplus food submissions from SQLite DB.
   */
  public static async fetchSubmissions(): Promise<FoodSubmission[]> {
    const res = await fetch(`${API_BASE_URL}/food/submissions`);
    if (!res.ok) throw new Error('Failed to fetch food submissions');
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      providerId: item.provider_id,
      providerName: item.provider_name,
      foodName: item.food_name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      estimatedServings: item.estimated_servings,
      preparationTime: item.preparation_time,
      expiryTime: item.expiry_time,
      storageCondition: item.storage_condition,
      location: item.location,
      urgency: item.urgency,
      perishability: item.perishability,
      remainingHours: item.remaining_hours,
      notes: item.notes || '',
      status: item.status,
      createdAt: item.created_at,
      aiAnalysis: item.ai_analysis
    }));
  }

  /**
   * Creates a new surplus food submission in SQLite DB.
   */
  public static async createSubmission(submission: FoodSubmission): Promise<FoodSubmission> {
    const payload = {
      provider_id: submission.providerId,
      provider_name: submission.providerName,
      food_name: submission.foodName,
      category: submission.category,
      quantity: submission.quantity,
      unit: submission.unit,
      estimated_servings: submission.estimatedServings,
      preparation_time: submission.preparationTime,
      expiry_time: submission.expiryTime,
      storage_condition: submission.storageCondition,
      location: submission.location,
      urgency: submission.urgency,
      perishability: submission.perishability,
      remaining_hours: submission.remainingHours,
      notes: submission.notes,
      status: submission.status,
      ai_analysis: submission.aiAnalysis,
      source_name: 'FoodRescue AI Web Frontend',
      source_url: window.location.href
    };

    const res = await fetch(`${API_BASE_URL}/food/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create food submission in backend');
    const item = await res.json();
    return {
      ...submission,
      id: item.id,
      createdAt: item.created_at
    };
  }

  /**
   * Fetches recipient organizations from SQLite DB.
   */
  public static async fetchRecipients(): Promise<Recipient[]> {
    const res = await fetch(`${API_BASE_URL}/recipients`);
    if (!res.ok) throw new Error('Failed to fetch recipients');
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      organizationType: item.organization_type,
      distanceKm: item.distance_km,
      requiredQuantity: item.required_quantity,
      availableCapacity: item.available_capacity,
      foodCompatibility: item.food_compatibility,
      currentNeedLevel: item.current_need_level,
      availabilityHours: item.availability_hours,
      location: item.location,
      contactPerson: item.contact_person,
      phone: item.phone,
      sourceName: item.source_name,
      sourceUrl: item.source_url
    }));
  }

  /**
   * Fetches active redistributions from SQLite DB.
   */
  public static async fetchRedistributions(token?: string): Promise<RedistributionItem[]> {
    const res = await fetch(`${API_BASE_URL}/redistributions`, {
      headers: ApiService.getHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to fetch redistributions');
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      submissionId: item.submission_id,
      submission: item.submission ? {
        id: item.submission.id,
        providerId: item.submission.provider_id,
        providerName: item.submission.provider_name,
        foodName: item.submission.food_name,
        category: item.submission.category,
        quantity: item.submission.quantity,
        unit: item.submission.unit,
        estimatedServings: item.submission.estimated_servings,
        preparationTime: item.submission.preparation_time,
        expiryTime: item.submission.expiry_time,
        storageCondition: item.submission.storage_condition,
        location: item.submission.location,
        urgency: item.submission.urgency,
        perishability: item.submission.perishability,
        remainingHours: item.submission.remaining_hours,
        notes: item.submission.notes || '',
        status: item.submission.status,
        createdAt: item.submission.created_at,
        aiAnalysis: item.submission.ai_analysis
      } : undefined,
      matchedRecipientId: item.matched_recipient_id,
      recipient: item.recipient ? {
        id: item.recipient.id,
        name: item.recipient.name,
        organizationType: item.recipient.organization_type,
        distanceKm: item.recipient.distance_km,
        requiredQuantity: item.recipient.required_quantity,
        availableCapacity: item.recipient.available_capacity,
        foodCompatibility: item.recipient.food_compatibility,
        currentNeedLevel: item.recipient.current_need_level,
        availabilityHours: item.recipient.availability_hours,
        location: item.recipient.location,
        contactPerson: item.recipient.contact_person,
        phone: item.recipient.phone,
        sourceName: item.recipient.source_name,
        sourceUrl: item.recipient.source_url
      } : undefined,
      matchScore: item.match_score,
      status: item.status,
      timeline: item.timeline || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  /**
   * Creates a new redistribution item in SQLite DB.
   */
  public static async createRedistribution(item: RedistributionItem, token?: string): Promise<RedistributionItem> {
    const payload = {
      submission_id: item.submissionId,
      matched_recipient_id: item.matchedRecipientId,
      match_score: item.matchScore,
      status: item.status,
      timeline: item.timeline,
      source_name: 'FoodRescue AI Recipient Matching Engine',
      source_url: typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173'
    };

    const res = await fetch(`${API_BASE_URL}/redistributions`, {
      method: 'POST',
      headers: ApiService.getHeaders(token),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save redistribution item in backend');
    const created = await res.json();
    return {
      ...item,
      id: created.id,
      createdAt: created.created_at,
      updatedAt: created.updated_at
    };
  }

  /**
   * Updates redistribution status in SQLite DB.
   */
  public static async updateRedistributionStatus(id: string, status: RedistributionStatus, note?: string, token?: string): Promise<any> {
    const url = `${API_BASE_URL}/redistributions/${id}/status?status_val=${encodeURIComponent(status)}${note ? `&note=${encodeURIComponent(note)}` : ''}`;
    const res = await fetch(url, { 
      method: 'PATCH',
      headers: ApiService.getHeaders(token)
    });
    if (!res.ok) {
      let errMsg = 'Failed to update redistribution status';
      try {
        const errData = await res.json();
        errMsg = errData.detail || errMsg;
      } catch {}
      throw new Error(errMsg);
    }
    return await res.json();
  }

  /**
   * Updates food submission status in SQLite DB.
   */
  public static async updateFoodSubmissionStatus(id: string, status: RedistributionStatus, token?: string): Promise<any> {
    const url = `${API_BASE_URL}/food/submissions/${id}/status?status_val=${encodeURIComponent(status)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: ApiService.getHeaders(token)
    });
    if (!res.ok) {
      let errMsg = 'Failed to update food submission status';
      try {
        const errData = await res.json();
        errMsg = errData.detail || errMsg;
      } catch {}
      throw new Error(errMsg);
    }
    return await res.json();
  }

  /**
   * Fetches logistics pickup tasks from SQLite DB.
   */
  public static async fetchPickups(): Promise<PickupTask[]> {
    const res = await fetch(`${API_BASE_URL}/pickups`);
    if (!res.ok) throw new Error('Failed to fetch pickup tasks');
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      redistributionId: item.redistribution_id,
      providerName: item.provider_name,
      recipientName: item.recipient_name,
      pickupAddress: item.pickup_address,
      destinationAddress: item.destination_address,
      coordinatorName: item.coordinator_name,
      driverPhone: item.driver_phone,
      currentStatus: item.current_status,
      estimatedPickup: item.estimated_pickup,
      estimatedArrival: item.estimated_arrival,
      distanceKm: item.distance_km,
      sourceName: item.source_name,
      sourceUrl: item.source_url
    }));
  }

  /**
   * Creates a pickup task in SQLite DB.
   */
  public static async createPickupTask(task: PickupTask): Promise<PickupTask> {
    const payload = {
      redistribution_id: task.redistributionId,
      provider_name: task.providerName,
      recipient_name: task.recipientName,
      pickup_address: task.pickupAddress,
      destination_address: task.destinationAddress,
      coordinator_name: task.coordinatorName,
      driver_phone: task.driverPhone,
      current_status: task.currentStatus,
      estimated_pickup: task.estimatedPickup,
      estimated_arrival: task.estimatedArrival,
      distance_km: task.distanceKm,
      source_name: 'FoodRescue AI Logistics Engine'
    };

    const res = await fetch(`${API_BASE_URL}/pickups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create pickup task in backend');
    const item = await res.json();
    return {
      ...task,
      id: item.id
    };
  }

  /**
   * Updates pickup status in SQLite DB.
   */
  public static async updatePickupStatus(id: string, status: RedistributionStatus, token?: string): Promise<void> {
    const url = `${API_BASE_URL}/pickups/${id}/status?status_val=${encodeURIComponent(status)}`;
    const res = await fetch(url, { 
      method: 'PATCH',
      headers: ApiService.getHeaders(token)
    });
    if (!res.ok) {
      let errMsg = 'Failed to update pickup status';
      try {
        const errData = await res.json();
        errMsg = errData.detail || errMsg;
      } catch {}
      throw new Error(errMsg);
    }
  }

  /**
   * Fetches notifications from SQLite DB.
   */
  public static async fetchNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE_URL}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      type: item.type,
      timestamp: item.created_at,
      read: item.read,
      targetSection: item.target_section
    }));
  }

  /**
   * Creates a notification in SQLite DB.
   */
  public static async createNotification(title: string, message: string, type: string, targetSection: string): Promise<void> {
    const payload = {
      title,
      message,
      type,
      read: false,
      target_section: targetSection,
      source_name: 'FoodRescue AI Alert Service'
    };
    await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  /**
   * Marks a notification read in SQLite DB.
   */
  public static async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
  }

  /**
   * Fetches all registered users from backend (Admin-only, requires JWT token).
   */
  public static async fetchUsers(token?: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: ApiService.getHeaders(token)
    });
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('Access denied: Admin role required to view user list.');
      }
      throw new Error('Failed to fetch users from backend');
    }
    return await res.json();
  }

  /**
   * Fetches computed matches for a submission from SQLite DB.
   */
  public static async fetchMatches(submissionId?: string): Promise<any[]> {
    const url = submissionId 
      ? `${API_BASE_URL}/matches?submission_id=${encodeURIComponent(submissionId)}`
      : `${API_BASE_URL}/matches`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return await res.json();
  }

  /**
   * Fetches aggregate system metrics from SQLite DB.
   */
  public static async fetchMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${API_BASE_URL}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return await res.json();
  }

  /**
   * Checks the operational status of the Gemini AI integration.
   */
  public static async checkAIStatus(): Promise<{
    gemini_configured: boolean;
    model: string;
    active_engine: string;
    fallback_mode: boolean;
  }> {
    const res = await fetch(`${API_BASE_URL}/ai/status`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to retrieve AI engine status');
    return await res.json();
  }

  /**
   * Checks the operational diagnostic status of the SMTP Email Service.
   * Never exposes SMTP passwords or secrets.
   */
  public static async checkEmailStatus(): Promise<EmailServiceStatus> {
    const res = await fetch(`${API_BASE_URL}/notifications/email/status`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to retrieve Email service status');
    return await res.json();
  }

  /**
   * Checks the operational diagnostic status of the Twilio SMS Gateway.
   * Never exposes Twilio auth tokens or secrets.
   */
  public static async checkSMSStatus(): Promise<TwilioServiceStatus> {
    const res = await fetch(`${API_BASE_URL}/notifications/sms/status`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to retrieve SMS gateway status');
    return await res.json();
  }

  /**
   * Analyzes food submission using backend AI service (Gemini or deterministic fallback).
   */
  public static async analyzeFood(submission: Partial<FoodSubmission>): Promise<AIAnalysis> {
    const payload = {
      id: submission.id,
      food_name: submission.foodName,
      category: submission.category,
      quantity: submission.quantity,
      unit: submission.unit,
      estimated_servings: submission.estimatedServings,
      preparation_time: submission.preparationTime,
      expiry_time: submission.expiryTime,
      storage_condition: submission.storageCondition,
      location: submission.location,
      remaining_hours: submission.remainingHours,
      notes: submission.notes
    };

    const res = await fetch(`${API_BASE_URL}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Failed to run backend AI analysis');
    return await res.json();
  }
}

