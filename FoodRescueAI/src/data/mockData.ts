import type { 
  FoodSubmission, 
  Recipient, 
  RedistributionItem, 
  PickupTask, 
  NotificationItem, 
  DashboardMetrics,
  AgentEvent
} from '../types';

export const INITIAL_RECIPIENTS: Recipient[] = [
  {
    id: 'rec-001',
    name: 'The Akshaya Patra Foundation',
    organizationType: 'Community Kitchen',
    distanceKm: 2.4,
    requiredQuantity: 150,
    availableCapacity: 250,
    foodCompatibility: ['Cooked Meals', 'Bakery', 'Fruits & Vegetables', 'Dairy', 'Packaged Food'],
    currentNeedLevel: 'HIGH',
    availabilityHours: '06:00 - 22:00',
    location: { address: 'Akshaya Patra Mega Kitchen, Narsingi, Ranga Reddy District, Hyderabad, Telangana 500075', lat: 17.3753, lng: 78.3612 },
    contactPerson: 'Satya Gaura Chandra Dasa',
    phone: '+91 40 2339 9625',
    sourceName: 'The Akshaya Patra Foundation Official Registry',
    sourceUrl: 'https://www.akshayapatra.org'
  },
  {
    id: 'rec-002',
    name: 'Don Bosco Navajeevan (Hyderabad Child Relief)',
    organizationType: 'Orphanage',
    distanceKm: 3.8,
    requiredQuantity: 60,
    availableCapacity: 80,
    foodCompatibility: ['Cooked Meals', 'Dairy', 'Bakery', 'Beverages', 'Packaged Food'],
    currentNeedLevel: 'CRITICAL',
    availabilityHours: '24/7 Open',
    location: { address: '11-6-472, Nampally Station Road, Bazar Ghat, Hyderabad, Telangana 500001', lat: 17.3980, lng: 78.4682 },
    contactPerson: 'Fr. Sudhakar Bellamkonda',
    phone: '+91 40 2330 0814',
    sourceName: 'Don Bosco Navajeevan Hyderabad Care Registry',
    sourceUrl: 'https://donbosconavajeevan.org'
  },
  {
    id: 'rec-003',
    name: 'Feed The Need - GHMC & Apple Homes Food Bank',
    organizationType: 'Food Bank',
    distanceKm: 7.5,
    requiredQuantity: 200,
    availableCapacity: 350,
    foodCompatibility: ['Packaged Food', 'Bakery', 'Fruits & Vegetables', 'Beverages'],
    currentNeedLevel: 'MEDIUM',
    availabilityHours: '09:00 - 18:00',
    location: { address: 'Near Annapurna Canteen, Road No. 2, Banjara Hills, Hyderabad, Telangana 500034', lat: 17.4156, lng: 78.4350 },
    contactPerson: 'Dr. Sunitha Reddy',
    phone: '+91 98490 12345',
    sourceName: 'GHMC Feed The Need Food Initiative',
    sourceUrl: 'https://ghmc.gov.in/feedtheneed'
  },
  {
    id: 'rec-004',
    name: 'Grace Cancer Foundation & Elder Care Nutrition',
    organizationType: 'Senior Home',
    distanceKm: 3.2,
    requiredQuantity: 45,
    availableCapacity: 60,
    foodCompatibility: ['Cooked Meals', 'Bakery', 'Dairy'],
    currentNeedLevel: 'HIGH',
    availabilityHours: '08:00 - 20:00',
    location: { address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033', lat: 17.4325, lng: 78.4071 },
    contactPerson: 'Dr. Chinnababu Sunkavalli',
    phone: '+91 40 2355 4567',
    sourceName: 'Grace Cancer Foundation Community Relief',
    sourceUrl: 'https://gracecancerfoundation.org'
  },
  {
    id: 'rec-005',
    name: 'Sphoorti Foundation (Children & Community Shelter)',
    organizationType: 'Shelter',
    distanceKm: 5.4,
    requiredQuantity: 100,
    availableCapacity: 140,
    foodCompatibility: ['Cooked Meals', 'Bakery', 'Fruits & Vegetables', 'Dairy', 'Packaged Food'],
    currentNeedLevel: 'MEDIUM',
    availabilityHours: '07:00 - 21:00',
    location: { address: 'Survey No 324, IDA Bollaram Industrial Area, Near Dundigal, Hyderabad, Telangana 502325', lat: 17.5528, lng: 78.3472 },
    contactPerson: 'Srivatsa Prasanna',
    phone: '+91 99665 59665',
    sourceName: 'Sphoorti Foundation Child Relief Portal',
    sourceUrl: 'https://sphoorti.org'
  },
  {
    id: 'rec-006',
    name: 'Goonj Hyderabad Processing Centre',
    organizationType: 'NGO',
    distanceKm: 8.2,
    requiredQuantity: 150,
    availableCapacity: 200,
    foodCompatibility: ['Packaged Food', 'Bakery', 'Fruits & Vegetables'],
    currentNeedLevel: 'LOW',
    availabilityHours: '10:00 - 17:00',
    location: { address: 'Plot No. 84, Phase-1, IDA Cherlapally, Secunderabad / Hyderabad, Telangana 500051', lat: 17.4647, lng: 78.5992 },
    contactPerson: 'Paritosh Joshi',
    phone: '+91 40 2712 1109',
    sourceName: 'Goonj National Relief Network',
    sourceUrl: 'https://goonj.org'
  }
];

export const INITIAL_SUBMISSIONS: FoodSubmission[] = [
  {
    id: 'sub-101',
    providerId: 'prov-01',
    providerName: 'Grand Horizon University Canteen',
    foodName: 'Hot Vegetable Biryani & Paneer Curry',
    category: 'Cooked Meals',
    quantity: 85,
    unit: 'meals',
    estimatedServings: 85,
    preparationTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    expiryTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    storageCondition: 'Hot Held',
    location: { address: 'University Campus Center, Osmania University, Hyderabad, Telangana 500007', lat: 17.4143, lng: 78.5283 },
    urgency: 'HIGH',
    perishability: 'HIGH',
    remainingHours: 4,
    notes: 'Prepared fresh for lunch banquet. Maintained above 65°C.',
    status: 'MATCHED',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'sub-102',
    providerId: 'prov-02',
    providerName: 'Artisan Bakery & Cafe',
    foodName: 'Assorted Fresh Artisanal Bread & Pastries',
    category: 'Bakery',
    quantity: 45,
    unit: 'kg',
    estimatedServings: 120,
    preparationTime: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    expiryTime: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    storageCondition: 'Ambient',
    location: { address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034', lat: 17.4125, lng: 78.4482 },
    urgency: 'MEDIUM',
    perishability: 'MEDIUM',
    remainingHours: 20,
    notes: 'Whole wheat sourdough, croissants, and fruit muffins individually wrapped.',
    status: 'ACCEPTED',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  },
  {
    id: 'sub-103',
    providerId: 'prov-03',
    providerName: 'Fresh Harvest Farmers Market',
    foodName: 'Organic Apples, Oranges & Fresh Salad Greens',
    category: 'Fruits & Vegetables',
    quantity: 110,
    unit: 'kg',
    estimatedServings: 220,
    preparationTime: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    expiryTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    storageCondition: 'Refrigerated',
    location: { address: 'Rythu Bazaar, Mehdipatnam, Hyderabad, Telangana 500028', lat: 17.3916, lng: 78.4412 },
    urgency: 'LOW',
    perishability: 'LOW',
    remainingHours: 48,
    notes: 'Crate packed surplus. Excellent freshness level.',
    status: 'AVAILABLE',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'sub-104',
    providerId: 'prov-04',
    providerName: 'Silicon Tech Campus Cafeteria',
    foodName: 'Grilled Veggies & Steamed Rice Meals',
    category: 'Cooked Meals',
    quantity: 60,
    unit: 'meals',
    estimatedServings: 60,
    preparationTime: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    expiryTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    storageCondition: 'Hot Held',
    location: { address: 'Mindspace IT Park, Building 12, Madhapur, HITEC City, Hyderabad, Telangana 500081', lat: 17.4401, lng: 78.3802 },
    urgency: 'CRITICAL',
    perishability: 'CRITICAL',
    remainingHours: 3,
    notes: 'High demand meal prep surplus, requires rapid dispatch.',
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  }
];

export const INITIAL_REDISTRIBUTIONS: RedistributionItem[] = [
  {
    id: 'red-201',
    submissionId: 'sub-101',
    submission: INITIAL_SUBMISSIONS[0],
    matchedRecipientId: 'rec-001',
    recipient: INITIAL_RECIPIENTS[0],
    matchScore: 94,
    status: 'MATCHED',
    timeline: [
      { status: 'AVAILABLE', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), note: 'Surplus food reported by provider.' },
      { status: 'ANALYZING', timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(), note: 'AI Rule Engine analyzed perishability & urgency.' },
      { status: 'MATCHED', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), note: 'Matched with The Akshaya Patra Foundation (Score: 94%).' }
    ],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'red-202',
    submissionId: 'sub-102',
    submission: INITIAL_SUBMISSIONS[1],
    matchedRecipientId: 'rec-002',
    recipient: INITIAL_RECIPIENTS[1],
    matchScore: 89,
    status: 'ACCEPTED',
    timeline: [
      { status: 'AVAILABLE', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), note: 'Bakery surplus posted.' },
      { status: 'ANALYZING', timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(), note: 'AI classified medium perishability.' },
      { status: 'MATCHED', timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(), note: 'Matched with Don Bosco Navajeevan.' },
      { status: 'REQUESTED', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), note: 'Redistribution dispatch request sent.' },
      { status: 'ACCEPTED', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), note: 'Recipient confirmed acceptance.' }
    ],
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  },
  {
    id: 'red-203',
    submissionId: 'sub-104',
    submission: INITIAL_SUBMISSIONS[3],
    matchedRecipientId: 'rec-001',
    recipient: INITIAL_RECIPIENTS[0],
    matchScore: 97,
    status: 'IN_TRANSIT',
    timeline: [
      { status: 'AVAILABLE', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), note: 'Critical food item logged.' },
      { status: 'MATCHED', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), note: 'Priority matched to The Akshaya Patra Foundation.' },
      { status: 'ACCEPTED', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), note: 'Accepted by recipient coordinator.' },
      { status: 'PICKUP_CONFIRMED', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), note: 'Logistics vehicle dispatched.' },
      { status: 'IN_TRANSIT', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), note: 'Food package picked up and en route.' }
    ],
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

export const INITIAL_PICKUPS: PickupTask[] = [
  {
    id: 'pick-301',
    redistributionId: 'red-203',
    providerName: 'Silicon Tech Campus Cafeteria',
    recipientName: 'The Akshaya Patra Foundation',
    pickupAddress: 'Mindspace IT Park, Building 12, Madhapur, HITEC City, Hyderabad, Telangana 500081',
    destinationAddress: 'Akshaya Patra Mega Kitchen, Narsingi, Ranga Reddy District, Hyderabad, Telangana 500075',
    coordinatorName: 'Vikram Rao (Express Van #4)',
    driverPhone: '+91 98765 43210',
    currentStatus: 'IN_TRANSIT',
    estimatedPickup: new Date(Date.now() - 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estimatedArrival: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    distanceKm: 2.8,
    sourceName: 'FoodRescue Dispatch System',
    sourceUrl: 'https://foodrescue.ai/logistics/pick-301'
  },
  {
    id: 'pick-302',
    redistributionId: 'red-202',
    providerName: 'Artisan Bakery & Cafe',
    recipientName: 'Don Bosco Navajeevan (Hyderabad Child Relief)',
    pickupAddress: 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
    destinationAddress: '11-6-472, Nampally Station Road, Bazar Ghat, Hyderabad, Telangana 500001',
    coordinatorName: 'Sunil Kumar (Eco Cargo Bike #2)',
    driverPhone: '+91 98765 12345',
    currentStatus: 'ACCEPTED',
    estimatedPickup: new Date(Date.now() + 20 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estimatedArrival: new Date(Date.now() + 45 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    distanceKm: 4.1,
    sourceName: 'FoodRescue Dispatch System',
    sourceUrl: 'https://foodrescue.ai/logistics/pick-302'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    title: 'Critical Surplus Food Detected',
    message: 'Silicon Tech Campus submitted 60 cooked meals with 3 hours usable window.',
    type: 'warning',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: false,
    targetSection: 'agent'
  },
  {
    id: 'notif-02',
    title: 'Optimal Recipient Matched',
    message: 'The Akshaya Patra Foundation matched with 97% compatibility for sub-104.',
    type: 'success',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    read: false,
    targetSection: 'matching'
  },
  {
    id: 'notif-03',
    title: 'Pickup Vehicle En Route',
    message: 'Logistics coordinator Vikram R. confirmed pickup from Silicon Tech Campus.',
    type: 'info',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: true,
    targetSection: 'pickup'
  }
];

export const INITIAL_METRICS: DashboardMetrics = {
  totalFoodRecoveredKg: 4250,
  totalMealsSaved: 8500,
  activeDonations: 4,
  successfulRedistributions: 142,
  urgentRequests: 2,
  recipientsServed: 28,
  foodWastePreventedKg: 4250,
  co2DivertedKg: 10625,
  waterSavedLiters: 127500
};

export const INITIAL_AGENT_EVENTS: AgentEvent[] = [
  {
    id: 'evt-01',
    stage: 'OBSERVE',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    message: 'Surplus food detection triggered from Silicon Tech Campus',
    details: 'Received submission: 60 meals (Grilled Veggies & Steamed Rice)'
  },
  {
    id: 'evt-02',
    stage: 'ANALYZE',
    timestamp: new Date(Date.now() - 44 * 60 * 1000).toISOString(),
    message: 'Rule Engine evaluation completed',
    details: 'Urgency: CRITICAL | Perishability: CRITICAL | Priority Score: 96/100'
  },
  {
    id: 'evt-03',
    stage: 'DECIDE',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    message: 'Deterministic 5-factor recipient matching executed',
    details: 'Top choice: The Akshaya Patra Foundation (Score 97%)'
  },
  {
    id: 'evt-04',
    stage: 'ACT',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    message: 'Redistribution request dispatched via API signal',
    details: 'Payload delivered to recipient dashboard & SMS notification service'
  },
  {
    id: 'evt-05',
    stage: 'MONITOR',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    message: 'Pickup tracking telemetry active',
    details: 'Express Van #4 picked up package, ETA destination in 15 mins'
  }
];
