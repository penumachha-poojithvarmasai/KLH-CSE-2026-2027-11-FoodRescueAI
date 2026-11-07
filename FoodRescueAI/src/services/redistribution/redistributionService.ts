import type { 
  RedistributionItem, 
  RedistributionStatus, 
  FoodSubmission, 
  Recipient, 
  PickupTask 
} from '../../types';

export class RedistributionService {
  /**
   * Creates a new redistribution item given a submission and recipient.
   */
  public static createRedistribution(
    submission: FoodSubmission, 
    recipient: Recipient, 
    matchScore: number
  ): RedistributionItem {
    const now = new Date().toISOString();
    return {
      id: `red-${Date.now().toString().slice(-6)}`,
      submissionId: submission.id,
      submission,
      matchedRecipientId: recipient.id,
      recipient,
      matchScore,
      status: 'MATCHED',
      timeline: [
        { status: 'AVAILABLE', timestamp: submission.createdAt, note: 'Food submission reported.' },
        { status: 'ANALYZING', timestamp: now, note: 'AI Rule Engine completed perishability analysis.' },
        { status: 'MATCHED', timestamp: now, note: `Matched with ${recipient.name} (Score: ${matchScore}%).` }
      ],
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Advances a redistribution state cleanly through the state machine.
   */
  public static advanceStatus(
    item: RedistributionItem, 
    nextStatus: RedistributionStatus, 
    note?: string
  ): RedistributionItem {
    const now = new Date().toISOString();
    const updatedTimeline = [
      ...item.timeline,
      {
        status: nextStatus,
        timestamp: now,
        note: note || `Status transitioned to ${nextStatus}`
      }
    ];

    return {
      ...item,
      status: nextStatus,
      timeline: updatedTimeline,
      updatedAt: now
    };
  }

  /**
   * Generates a PickupTask when status transitions to ACCEPTED or PICKUP_REQUESTED.
   */
  public static createPickupTask(item: RedistributionItem): PickupTask {
    const pickupAddress = item.submission.location.address;
    const destinationAddress = item.recipient?.location.address || 'Recipient Location';
    
    return {
      id: `pick-${Date.now().toString().slice(-6)}`,
      redistributionId: item.id,
      providerName: item.submission.providerName,
      recipientName: item.recipient?.name || 'Recipient Shelter',
      pickupAddress,
      destinationAddress,
      coordinatorName: 'Automated Logistics Vehicle #3',
      driverPhone: '+91 98765 88900',
      currentStatus: item.status,
      estimatedPickup: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedArrival: new Date(Date.now() + 45 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distanceKm: item.recipient?.distanceKm || 3.5
    };
  }
}
