import type { FoodSubmission, Recipient, RecipientMatch, MatchScoreBreakdown } from '../../types';

export class MatchingEngine {
  /**
   * Calculates deterministic, explainable match scores (0 - 100) between a FoodSubmission and a list of Recipients.
   */
  public static calculateMatches(submission: FoodSubmission, recipients: Recipient[]): RecipientMatch[] {
    return recipients.map(recipient => {
      const breakdown = this.computeScoreBreakdown(submission, recipient);
      const overallScore = Math.round(
        breakdown.categoryCompatibilityScore +
        breakdown.needLevelScore +
        breakdown.capacityMatchScore +
        breakdown.distanceScore +
        breakdown.availabilityScore
      );

      let suitabilityStatus: 'OPTIMAL' | 'GOOD' | 'MODERATE' | 'POOR' = 'POOR';
      if (overallScore >= 85) suitabilityStatus = 'OPTIMAL';
      else if (overallScore >= 70) suitabilityStatus = 'GOOD';
      else if (overallScore >= 50) suitabilityStatus = 'MODERATE';

      return {
        recipientId: recipient.id,
        recipient,
        submissionId: submission.id,
        overallScore,
        breakdown,
        suitabilityStatus
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }

  /**
   * Explains 5-factor score breakdown:
   * 1. Category Compatibility (Max 25 pts)
   * 2. Need Level (Max 25 pts)
   * 3. Capacity Match (Max 20 pts)
   * 4. Distance / Proximity (Max 15 pts)
   * 5. Availability Window (Max 15 pts)
   */
  private static computeScoreBreakdown(submission: FoodSubmission, recipient: Recipient): MatchScoreBreakdown {
    // 1. Category Compatibility (25 pts max)
    const isCategoryAccepted = recipient.foodCompatibility.includes(submission.category);
    let categoryCompatibilityScore = isCategoryAccepted ? 25 : 5;
    
    // 2. Need Level (25 pts max)
    let needLevelScore = 10;
    switch (recipient.currentNeedLevel) {
      case 'CRITICAL': needLevelScore = 25; break;
      case 'HIGH': needLevelScore = 20; break;
      case 'MEDIUM': needLevelScore = 15; break;
      case 'LOW': needLevelScore = 10; break;
    }

    // 3. Capacity Match (20 pts max)
    // Compare required quantity / capacity with submission estimated servings
    const servings = submission.estimatedServings || submission.quantity;
    const capacityRatio = recipient.availableCapacity / Math.max(1, servings);
    let capacityMatchScore = 10;
    if (capacityRatio >= 1.0) {
      capacityMatchScore = 20; // Full capacity to accommodate
    } else if (capacityRatio >= 0.7) {
      capacityMatchScore = 16;
    } else if (capacityRatio >= 0.4) {
      capacityMatchScore = 12;
    } else {
      capacityMatchScore = 6;
    }

    // 4. Distance / Proximity (15 pts max)
    // Closer recipient = higher score
    let distanceScore = 15;
    if (recipient.distanceKm <= 3) {
      distanceScore = 15;
    } else if (recipient.distanceKm <= 6) {
      distanceScore = 12;
    } else if (recipient.distanceKm <= 10) {
      distanceScore = 9;
    } else if (recipient.distanceKm <= 15) {
      distanceScore = 6;
    } else {
      distanceScore = 3;
    }

    // 5. Availability Window (15 pts max)
    // High urgency submissions benefit from immediate availability
    let availabilityScore = 15;
    if (submission.urgency === 'CRITICAL' && recipient.currentNeedLevel === 'CRITICAL') {
      availabilityScore = 15;
    } else if (submission.urgency === 'HIGH') {
      availabilityScore = 13;
    } else {
      availabilityScore = 11;
    }

    return {
      categoryCompatibilityScore,
      needLevelScore,
      capacityMatchScore,
      distanceScore,
      availabilityScore
    };
  }
}
