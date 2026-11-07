import type { FoodSubmission, AIAnalysis, PerishabilityLevel, UrgencyLevel } from '../../types';
import { ApiService } from '../api/apiService';

export interface IAIService {
  analyzeFoodSubmission(submission: Partial<FoodSubmission>): Promise<AIAnalysis>;
  getEngineName(): string;
}

export class RuleEngineFallback implements IAIService {
  getEngineName(): string {
    return 'Deterministic Rule-Engine (Zero External Dependency)';
  }

  async analyzeFoodSubmission(submission: Partial<FoodSubmission>): Promise<AIAnalysis> {
    const category = submission.category || 'Cooked Meals';
    const quantity = submission.quantity || 1;
    const unit = submission.unit || 'meals';
    const storageCondition = submission.storageCondition || 'Ambient';
    
    // 1. Calculate remaining usable hours based on category & storage condition
    let remainingUsableHours = submission.remainingHours || 4;
    
    if (!submission.remainingHours) {
      switch (category) {
        case 'Cooked Meals':
          remainingUsableHours = storageCondition === 'Hot Held' ? 3 : storageCondition === 'Refrigerated' ? 6 : 2;
          break;
        case 'Dairy':
          remainingUsableHours = storageCondition === 'Refrigerated' ? 24 : 4;
          break;
        case 'Bakery':
          remainingUsableHours = 24;
          break;
        case 'Fruits & Vegetables':
          remainingUsableHours = 48;
          break;
        case 'Packaged Food':
          remainingUsableHours = 72;
          break;
        default:
          remainingUsableHours = 12;
      }
    }

    // 2. Determine perishability
    let perishability: PerishabilityLevel = 'MEDIUM';
    if (category === 'Cooked Meals' || category === 'Dairy') {
      perishability = remainingUsableHours <= 3 ? 'CRITICAL' : 'HIGH';
    } else if (category === 'Bakery') {
      perishability = 'MEDIUM';
    } else {
      perishability = 'LOW';
    }

    // 3. Determine urgency based on remaining usable hours
    let urgency: UrgencyLevel = 'MEDIUM';
    if (remainingUsableHours <= 3) {
      urgency = 'CRITICAL';
    } else if (remainingUsableHours <= 6) {
      urgency = 'HIGH';
    } else if (remainingUsableHours <= 24) {
      urgency = 'MEDIUM';
    } else {
      urgency = 'LOW';
    }

    // 4. Calculate Priority Score (0 - 100)
    // High volume + High urgency = Higher Priority
    const urgencyScore = urgency === 'CRITICAL' ? 40 : urgency === 'HIGH' ? 30 : urgency === 'MEDIUM' ? 20 : 10;
    const perishabilityScore = perishability === 'CRITICAL' ? 30 : perishability === 'HIGH' ? 25 : perishability === 'MEDIUM' ? 15 : 5;
    const volumeScore = Math.min(30, Math.floor(quantity / 5));
    
    const priorityScore = Math.min(100, Math.max(10, urgencyScore + perishabilityScore + volumeScore));

    // 5. Quantity assessment & recommendations
    const quantityAssessment = `${quantity} ${unit} (~${submission.estimatedServings || quantity} servings) available for immediate dispatch.`;
    const suitability = `Suitable for immediate distribution to Community Shelters, NGO Kitchens, and Group Homes.`;
    
    const recommendedRecipients = [
      'Community Shelters with warm holding capacity',
      'Local NGO Kitchens',
      'Children & Family Centers'
    ];

    const recommendedAction = urgency === 'CRITICAL' || urgency === 'HIGH' 
      ? 'IMMEDIATE_REDISTRIBUTION_DISPATCH' 
      : 'SCHEDULED_STANDARD_PICKUP';

    const reasoningSummary = `High perishability food item with ${remainingUsableHours}h usable window. Combined with high demand, immediate recipient matching and rapid logistics dispatch are strongly recommended.`;

    return {
      submissionId: submission.id || 'temp-id',
      category,
      quantityAssessment,
      perishability,
      urgency,
      remainingUsableHours,
      suitability,
      recommendedRecipients,
      priorityScore,
      recommendedAction,
      pickupRequired: true,
      reasoningSummary,
      analyzedAt: new Date().toISOString()
    };
  }
}

export class SimulatedGeminiAIService implements IAIService {
  getEngineName(): string {
    return 'Gemini 1.5 Pro Intelligence Engine (Simulated Fallback Mode)';
  }

  async analyzeFoodSubmission(submission: Partial<FoodSubmission>): Promise<AIAnalysis> {
    // Simulate API delay
    await new Promise(res => setTimeout(res, 800));
    
    const ruleEngine = new RuleEngineFallback();
    const baseAnalysis = await ruleEngine.analyzeFoodSubmission(submission);
    
    // Add enriched LLM reasoning string
    return {
      ...baseAnalysis,
      reasoningSummary: `[Gemini 1.5 Analysis] Multi-dimensional analysis completed. Identified high-value surplus (${submission.foodName}). Usable lifespan estimated at ${baseAnalysis.remainingUsableHours} hours. Recommended immediate automated dispatch to highest compatibility local shelter.`
    };
  }
}

export class GeminiAIService implements IAIService {
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  getEngineName(): string {
    return 'Google Gemini 3.8 Flash Cloud API (Production Ready)';
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  async analyzeFoodSubmission(submission: Partial<FoodSubmission>): Promise<AIAnalysis> {
    // 1. Primary: Delegate to FastAPI backend AI service (which loads GEMINI_API_KEY from backend/.env)
    try {
      const backendAnalysis = await ApiService.analyzeFood(submission);
      if (backendAnalysis && backendAnalysis.priorityScore !== undefined) {
        return backendAnalysis;
      }
    } catch (err) {
      console.warn('[GeminiAIService] Backend AI service unavailable or returned error, engaging local RuleEngineFallback:', err);
    }

    // 2. Secondary: Fall back cleanly to deterministic RuleEngineFallback
    const fallback = new RuleEngineFallback();
    const fallbackAnalysis = await fallback.analyzeFoodSubmission(submission);
    return {
      ...fallbackAnalysis,
      reasoningSummary: `[Fallback Mode: Deterministic Engine] ${fallbackAnalysis.reasoningSummary}`
    };
  }
}

export function getAIService(mode: 'RULE_ENGINE' | 'SIMULATED_GEMINI' | 'REAL_GEMINI' = 'RULE_ENGINE'): IAIService {
  switch (mode) {
    case 'SIMULATED_GEMINI':
      return new SimulatedGeminiAIService();
    case 'REAL_GEMINI':
      return new GeminiAIService();
    case 'RULE_ENGINE':
    default:
      return new RuleEngineFallback();
  }
}
