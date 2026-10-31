import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  UserRole, 
  FoodSubmission, 
  Recipient, 
  RedistributionItem, 
  PickupTask, 
  NotificationItem, 
  DashboardMetrics, 
  AgentEvent,
  AgentStage,
  RedistributionStatus
} from '../types';
import { 
  INITIAL_SUBMISSIONS, 
  INITIAL_RECIPIENTS, 
  INITIAL_REDISTRIBUTIONS, 
  INITIAL_PICKUPS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_METRICS,
  INITIAL_AGENT_EVENTS 
} from '../data/mockData';
import { getAIService } from '../services/ai/aiService';
import { MatchingEngine } from '../services/matching/matchingEngine';
import { RedistributionService } from '../services/redistribution/redistributionService';
import { AGENT_SIMULATION_STEPS, AgentEngine } from '../services/agent/agentEngine';
import { ApiService } from '../services/api/apiService';

import { useAuth } from './AuthContext';

interface AppContextType {
  userRole: UserRole;
  activeTab: string;
  submissions: FoodSubmission[];
  recipients: Recipient[];
  redistributions: RedistributionItem[];
  pickups: PickupTask[];
  notifications: NotificationItem[];
  agentEvents: AgentEvent[];
  agentStage: AgentStage;
  isSimulating: boolean;
  metrics: DashboardMetrics;
  aiMode: 'RULE_ENGINE' | 'SIMULATED_GEMINI' | 'REAL_GEMINI';
  isBackendOnline: boolean;
  
  setUserRole: (role: UserRole) => void;
  setActiveTab: (tab: string) => void;
  addFoodSubmission: (data: Partial<FoodSubmission>) => Promise<FoodSubmission>;
  runAIAnalysisForSubmission: (submissionId: string) => Promise<void>;
  dispatchToRecipient: (submissionId: string, recipientId: string) => Promise<void>;
  updateRedistributionStatus: (id: string, status: RedistributionStatus, note?: string) => Promise<void>;
  updatePickupStatus: (id: string, status: RedistributionStatus) => Promise<void>;
  triggerFullAgentSimulation: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => void;
  setAiMode: (mode: 'RULE_ENGINE' | 'SIMULATED_GEMINI' | 'REAL_GEMINI') => void;
  refreshBackendData: () => Promise<void>;
  resetToMockData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const userRole = auth.userRole || 'FOOD_PROVIDER';
  const setUserRole = (_role: UserRole) => {};
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [submissions, setSubmissions] = useState<FoodSubmission[]>(INITIAL_SUBMISSIONS);
  const [recipients, setRecipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);
  const [redistributions, setRedistributions] = useState<RedistributionItem[]>(INITIAL_REDISTRIBUTIONS);
  const [pickups, setPickups] = useState<PickupTask[]>(INITIAL_PICKUPS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>(INITIAL_AGENT_EVENTS);
  const [agentStage, setAgentStage] = useState<AgentStage>('IDLE');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>(INITIAL_METRICS);
  const [aiMode, setAiMode] = useState<'RULE_ENGINE' | 'SIMULATED_GEMINI' | 'REAL_GEMINI'>('RULE_ENGINE');
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  // Full Backend Data Hydration
  const refreshBackendData = async () => {
    try {
      const isHealthy = await ApiService.checkHealth();
      setIsBackendOnline(isHealthy);
      if (!isHealthy) return;

      const [subData, recData, redData, pickData, notifData, metricData] = await Promise.allSettled([
        ApiService.fetchSubmissions(),
        ApiService.fetchRecipients(),
        ApiService.fetchRedistributions(),
        ApiService.fetchPickups(),
        ApiService.fetchNotifications(),
        ApiService.fetchMetrics()
      ]);

      const allSubmissions = subData.status === 'fulfilled' && subData.value.length > 0 ? subData.value : submissions;
      const allRecipients = recData.status === 'fulfilled' && recData.value.length > 0 ? recData.value : recipients;

      if (subData.status === 'fulfilled' && subData.value.length > 0) {
        let subs = subData.value;
        if (redData.status === 'fulfilled' && redData.value.length > 0) {
          const redistMap = new Map(redData.value.map(r => [r.submissionId, r.status]));
          subs = subs.map(s => {
            const rStatus = redistMap.get(s.id);
            if (rStatus && rStatus !== 'AVAILABLE' && rStatus !== 'CANCELLED' && rStatus !== 'REJECTED' && s.status === 'AVAILABLE') {
              return { ...s, status: rStatus };
            }
            return s;
          });
        }
        setSubmissions(subs);
      }
      if (recData.status === 'fulfilled' && recData.value.length > 0) {
        setRecipients(recData.value);
      }
      if (redData.status === 'fulfilled' && redData.value.length > 0) {
        const sanitized = redData.value.map(item => {
          let itemSub: FoodSubmission | undefined = item.submission;
          if (!itemSub) {
            itemSub = allSubmissions.find(s => s.id === item.submissionId) || INITIAL_SUBMISSIONS.find(s => s.id === item.submissionId);
          }
          let itemRec: Recipient | undefined = item.recipient;
          if (!itemRec && item.matchedRecipientId) {
            itemRec = allRecipients.find(r => r.id === item.matchedRecipientId) || INITIAL_RECIPIENTS.find(r => r.id === item.matchedRecipientId);
          }
          return {
            ...item,
            submission: itemSub || {
              id: item.submissionId || 'sub-fallback',
              providerId: 'prov-default',
              providerName: 'Surplus Provider Hub',
              foodName: 'Surplus Food Donation',
              category: 'Cooked Meals',
              quantity: 20,
              unit: 'meals',
              estimatedServings: 20,
              preparationTime: new Date().toISOString(),
              expiryTime: new Date(Date.now() + 14400000).toISOString(),
              storageCondition: 'Hot Held',
              location: { address: 'Surplus Intake Hub, HITEC City, Hyderabad', lat: 17.4483, lng: 78.3748 },
              urgency: 'HIGH',
              perishability: 'HIGH',
              remainingHours: 4,
              notes: 'Dispatched via FoodRescue AI pipeline.',
              status: item.status,
              createdAt: item.createdAt
            },
            recipient: itemRec
          };
        });
        setRedistributions(sanitized);
      }
      if (pickData.status === 'fulfilled' && pickData.value.length > 0) {
        setPickups(pickData.value);
      }
      if (notifData.status === 'fulfilled' && notifData.value.length > 0) {
        setNotifications(notifData.value);
      }
      if (metricData.status === 'fulfilled') {
        setMetrics(metricData.value);
      }

      // Check Gemini AI configuration status from backend
      try {
        const aiStatus = await ApiService.checkAIStatus();
        if (aiStatus.gemini_configured) {
          setAiMode(prev => (prev === 'RULE_ENGINE' ? 'REAL_GEMINI' : prev));
        }
      } catch {}
    } catch (err) {
      console.warn('FastAPI backend synchronization note:', err);
    }
  };

  useEffect(() => {
    refreshBackendData();
    const interval = setInterval(refreshBackendData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Automatically recalculate top metrics whenever submissions/redistributions update
  useEffect(() => {
    const activeDons = submissions.filter(s => s.status !== 'COMPLETED' && s.status !== 'EXPIRED' && s.status !== 'CANCELLED').length;
    const urgentCount = submissions.filter(s => s.urgency === 'HIGH' || s.urgency === 'CRITICAL').length;
    const completedCount = redistributions.filter(r => r.status === 'COMPLETED' || r.status === 'REDISTRIBUTED').length;
    
    setMetrics(prev => ({
      ...prev,
      activeDonations: activeDons,
      urgentRequests: urgentCount,
      successfulRedistributions: INITIAL_METRICS.successfulRedistributions + completedCount
    }));
  }, [submissions, redistributions]);


  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', targetSection: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      targetSection
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addFoodSubmission = async (data: Partial<FoodSubmission>): Promise<FoodSubmission> => {
    const aiService = getAIService(aiMode);
    const aiAnalysis = await aiService.analyzeFoodSubmission(data);

    let newSub: FoodSubmission = {
      id: `sub-${Date.now().toString().slice(-6)}`,
      providerId: 'prov-cur',
      providerName: data.providerName || 'Current Provider Canteen',
      foodName: data.foodName || 'Surplus Meal Listing',
      category: data.category || 'Cooked Meals',
      quantity: Number(data.quantity) || 50,
      unit: data.unit || 'meals',
      estimatedServings: Number(data.estimatedServings) || Number(data.quantity) || 50,
      preparationTime: data.preparationTime || new Date().toISOString(),
      expiryTime: data.expiryTime || new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      storageCondition: data.storageCondition || 'Ambient',
      location: data.location || { address: 'Campus Dining Center, Hall A, Hyderabad', lat: 17.4483, lng: 78.3748 },
      urgency: aiAnalysis.urgency,
      perishability: aiAnalysis.perishability,
      remainingHours: aiAnalysis.remainingUsableHours,
      notes: data.notes || '',
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      aiAnalysis
    };

    // Attempt to persist to FastAPI backend endpoints
    try {
      const createdOnBackend = await ApiService.createSubmission(newSub);
      newSub = createdOnBackend;
    } catch (err) {
      console.warn('FastAPI backend submission failed, storing locally with mock fallback:', err);
    }

    setSubmissions(prev => [newSub, ...prev]);

    // Record Agent Event: OBSERVE
    const observeEvt = AgentEngine.createAgentEvent(
      'OBSERVE',
      `New surplus food recorded: ${newSub.foodName}`,
      `Quantity: ${newSub.quantity} ${newSub.unit} | Location: ${newSub.location.address}`,
      newSub
    );
    setAgentEvents(prev => [observeEvt, ...prev]);

    addNotification(
      'Surplus Food Submitted',
      `"${newSub.foodName}" (${newSub.quantity} ${newSub.unit}) registered into AI agent workflow.`,
      'info',
      'submissions'
    );

    return newSub;
  };

  const runAIAnalysisForSubmission = async (submissionId: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;

    setAgentStage('ANALYZE');
    const aiService = getAIService(aiMode);
    const analysis = await aiService.analyzeFoodSubmission(sub);

    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, aiAnalysis: analysis, status: 'ANALYZING' } : s));

    const analyzeEvt = AgentEngine.createAgentEvent(
      'ANALYZE',
      `AI analysis completed for ${sub.foodName}`,
      `Urgency: ${analysis.urgency} | Perishability: ${analysis.perishability} | Priority Score: ${analysis.priorityScore}/100`,
      analysis
    );
    setAgentEvents(prev => [analyzeEvt, ...prev]);

    addNotification(
      'AI Analysis Complete',
      `Priority score for "${sub.foodName}" computed at ${analysis.priorityScore}/100.`,
      'success',
      'agent'
    );
  };

  const dispatchToRecipient = async (submissionId: string, recipientId: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    const rec = recipients.find(r => r.id === recipientId);
    if (!sub || !rec) return;

    setAgentStage('DECIDE');
    const matches = MatchingEngine.calculateMatches(sub, [rec]);
    const matchScore = matches[0]?.overallScore || 90;

    // Check if redistribution already exists in state for this submission to prevent duplicate
    const existingRedist = redistributions.find(r => r.submissionId === submissionId || r.submission?.id === submissionId);
    let newRedistribution: RedistributionItem;

    if (existingRedist) {
      newRedistribution = {
        ...existingRedist,
        matchedRecipientId: rec.id,
        recipient: rec,
        matchScore,
        status: 'MATCHED',
        timeline: [
          ...existingRedist.timeline,
          { status: 'MATCHED', timestamp: new Date().toISOString(), note: `Dispatched to ${rec.name} (${matchScore}% match).` }
        ],
        updatedAt: new Date().toISOString()
      };
      setRedistributions(prev => prev.map(r => r.id === existingRedist.id ? newRedistribution : r));
    } else {
      newRedistribution = RedistributionService.createRedistribution(sub, rec, matchScore);
      setRedistributions(prev => [newRedistribution, ...prev]);
    }

    // Immediately reflect MATCHED state in local submissions
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status: 'MATCHED' } : s));

    const decideEvt = AgentEngine.createAgentEvent(
      'DECIDE',
      `Matched ${sub.foodName} to ${rec.name}`,
      `Deterministic Match Score: ${matchScore}% (Category, Need, Capacity, Distance & Availability evaluated)`,
      { submissionId, recipientId, matchScore }
    );
    setAgentEvents(prev => [decideEvt, ...prev]);

    setAgentStage('ACT');
    const actEvt = AgentEngine.createAgentEvent(
      'ACT',
      `Dispatched redistribution request to ${rec.name}`,
      `Automated notification & pickup reservation signal triggered.`,
      newRedistribution
    );
    setAgentEvents(prev => [actEvt, ...prev]);

    // Persist to FastAPI SQLite backend FIRST to get true database ID
    let persistedRedist = newRedistribution;
    try {
      persistedRedist = await ApiService.createRedistribution(newRedistribution);
      if (persistedRedist.id && persistedRedist.id !== newRedistribution.id) {
        setRedistributions(prev => prev.map(r => (r.id === newRedistribution.id || r.submissionId === submissionId) ? persistedRedist : r));
      }
    } catch (err) {
      console.warn('Backend sync note for redistribution:', err);
    }

    // Create / update Pickup task linked to persisted redistribution
    const newPickup = RedistributionService.createPickupTask(persistedRedist);
    setPickups(prev => {
      const exists = prev.some(p => p.redistributionId === persistedRedist.id);
      return exists ? prev.map(p => p.redistributionId === persistedRedist.id ? newPickup : p) : [newPickup, ...prev];
    });

    try {
      await ApiService.createPickupTask(newPickup);
    } catch (err) {
      console.warn('Backend sync note for pickup task:', err);
    }

    // Full synchronization from SQLite to ensure database truth across components
    await refreshBackendData();

    addNotification(
      'Redistribution Request Dispatched',
      `Matched "${sub.foodName}" with ${rec.name} (${matchScore}% match). Pickup dispatch queued.`,
      'success',
      'redistribution'
    );
  };

  const updateRedistributionStatus = async (id: string, status: RedistributionStatus, note?: string) => {
    setRedistributions(prev => prev.map(item => {
      if (item.id === id) {
        const updated = RedistributionService.advanceStatus(item, status, note);
        // Also sync pickup task if exists
        setPickups(pList => pList.map(p => p.redistributionId === id ? { ...p, currentStatus: status } : p));
        // Sync submission status
        setSubmissions(sList => sList.map(s => s.id === item.submissionId ? { ...s, status } : s));
        return updated;
      }
      return item;
    }));

    try {
      await ApiService.updateRedistributionStatus(id, status, note);
    } catch (err) {
      console.warn('Backend redistribution status sync note:', err);
    }

    addNotification(
      'Status Updated',
      `Redistribution #${id} updated to state: ${status}.`,
      'info',
      'pickup'
    );
  };

  const updatePickupStatus = async (id: string, status: RedistributionStatus) => {
    setPickups(prev => prev.map(p => p.id === id ? { ...p, currentStatus: status } : p));
    const pickup = pickups.find(p => p.id === id);
    if (pickup) {
      await updateRedistributionStatus(pickup.redistributionId, status);
    }
    try {
      await ApiService.updatePickupStatus(id, status);
    } catch (err) {
      console.warn('Backend pickup status sync note:', err);
    }
  };

  const triggerFullAgentSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    // Step 1: OBSERVE
    setAgentStage('OBSERVE');
    const step1 = AGENT_SIMULATION_STEPS[0];
    setAgentEvents(prev => [AgentEngine.createAgentEvent('OBSERVE', step1.message, step1.details), ...prev]);
    await new Promise(r => setTimeout(r, step1.delayMs));

    // Create realistic food item
    const simSub = await addFoodSubmission({
      foodName: 'Simulated Event Banquet Meals',
      category: 'Cooked Meals',
      quantity: 120,
      unit: 'meals',
      estimatedServings: 120,
      storageCondition: 'Hot Held',
      notes: 'Simulation run food batch'
    });

    // Step 2: ANALYZE
    setAgentStage('ANALYZE');
    const step2 = AGENT_SIMULATION_STEPS[1];
    setAgentEvents(prev => [AgentEngine.createAgentEvent('ANALYZE', step2.message, step2.details), ...prev]);
    await new Promise(r => setTimeout(r, step2.delayMs));

    // Step 3: DECIDE
    setAgentStage('DECIDE');
    const step3 = AGENT_SIMULATION_STEPS[2];
    const topRecipient = recipients[0];
    const matches = MatchingEngine.calculateMatches(simSub, recipients);
    const topMatch = matches[0];

    setAgentEvents(prev => [
      AgentEngine.createAgentEvent(
        'DECIDE', 
        `Optimal Recipient Selected: ${topRecipient.name}`, 
        `Matching Engine computed Score ${topMatch.overallScore}% across 5 decision factors.`
      ),
      ...prev
    ]);
    await new Promise(r => setTimeout(r, step3.delayMs));

    // Step 4: ACT
    setAgentStage('ACT');
    const step4 = AGENT_SIMULATION_STEPS[3];
    await dispatchToRecipient(simSub.id, topRecipient.id);
    setAgentEvents(prev => [AgentEngine.createAgentEvent('ACT', step4.message, step4.details), ...prev]);
    await new Promise(r => setTimeout(r, step4.delayMs));

    // Step 5: MONITOR
    setAgentStage('MONITOR');
    const step5 = AGENT_SIMULATION_STEPS[4];
    setAgentEvents(prev => [AgentEngine.createAgentEvent('MONITOR', step5.message, step5.details), ...prev]);
    await new Promise(r => setTimeout(r, step5.delayMs));

    setAgentStage('IDLE');
    setIsSimulating(false);

    addNotification(
      'Agent Simulation Complete',
      'Autonomous surplus-food detection, analysis, matching, dispatch, and monitoring completed successfully!',
      'success',
      'agent'
    );
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await ApiService.markNotificationRead(id);
    } catch (err) {
      console.warn('Backend mark notification read note:', err);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const resetToMockData = () => {
    setSubmissions(INITIAL_SUBMISSIONS);
    setRedistributions(INITIAL_REDISTRIBUTIONS);
    setPickups(INITIAL_PICKUPS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setMetrics(INITIAL_METRICS);
    setAgentEvents(INITIAL_AGENT_EVENTS);
    setAgentStage('IDLE');
    setIsSimulating(false);
  };

  return (
    <AppContext.Provider value={{
      userRole,
      activeTab,
      submissions,
      recipients,
      redistributions,
      pickups,
      notifications,
      agentEvents,
      agentStage,
      isSimulating,
      metrics,
      aiMode,
      isBackendOnline,
      setUserRole,
      setActiveTab,
      addFoodSubmission,
      runAIAnalysisForSubmission,
      dispatchToRecipient,
      updateRedistributionStatus,
      updatePickupStatus,
      triggerFullAgentSimulation,
      markNotificationRead,
      clearAllNotifications,
      setAiMode,
      refreshBackendData,
      resetToMockData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

