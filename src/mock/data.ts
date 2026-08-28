import { User, WorkerProfile, Gig, Booking, Community, CooperativeGig, Notification, Transaction } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_harshita',
    name: 'Harshita',
    email: 'harshita@flexywork.local',
    role: 'seeker',
    location: 'Vijayawada, India',
    avatarUrl: '/avatars/harshita.jpg'
  },
  {
    id: 'user_priya',
    name: 'Priya Sharma',
    email: 'worker@flexywork.local',
    role: 'worker',
    location: 'Vijayawada, India',
    avatarUrl: '/avatars/priya.jpg'
  },
  {
    id: 'user_amit',
    name: 'Amit Patel',
    email: 'amit@flexywork.local',
    role: 'worker',
    location: 'Vijayawada, India',
    avatarUrl: '/avatars/amit.jpg'
  },
  {
    id: 'user_ravi',
    name: 'Ravi Kumar',
    email: 'ravi@flexywork.local',
    role: 'worker',
    location: 'Vijayawada, India',
    avatarUrl: '/avatars/ravi.jpg'
  },
  {
    id: 'user_admin',
    name: 'Vikram Reddy',
    email: 'admin@flexywork.local',
    role: 'admin',
    location: 'Vijayawada, India',
    avatarUrl: '/avatars/admin.jpg'
  }
];

export const INITIAL_WORKERS: WorkerProfile[] = [
  {
    id: 'w_priya',
    userId: 'user_priya',
    name: 'Priya Sharma',
    email: 'worker@flexywork.local',
    skills: ['Deep Cleaning', 'Organization', 'Elder Care assistance', 'Disinfection Services'],
    bio: 'Experienced cleaning specialist dedicated to transforming homes. I focus on details and eco-friendly products. Part of the local community collective.',
    location: 'Suryaraopeta, Vijayawada',
    distance: 1.8,
    rating: 4.9,
    completedGigsCount: 128,
    reliabilityScore: 98,
    responseTime: 'Fast Responder (within 10m)',
    hourlyRate: 250,
    isVerified: true,
    isTopRated: true,
    communityId: 'c_home_services',
    communityName: 'Vijayawada Home Services Collective',
    avatarUrl: '/avatars/priya.jpg',
    availability: [
      { day: "Mon", status: "Available", ranges: ["9 AM - 1 PM", "4 PM - 8 PM"] },
      { day: "Tue", status: "Available", ranges: ["9 AM - 1 PM", "4 PM - 8 PM"] },
      { day: "Wed", status: "Unavailable", ranges: [] },
      { day: "Thu", status: "Available", ranges: ["9 AM - 1 PM", "4 PM - 8 PM"] },
      { day: "Fri", status: "Available", ranges: ["9 AM - 1 PM", "5 PM - 9 PM"] },
      { day: "Sat", status: "Available", ranges: ["10 AM - 6 PM"] },
      { day: "Sun", status: "Limited", ranges: ["11 AM - 3 PM"] }
    ]
  },
  {
    id: 'w_amit',
    userId: 'user_amit',
    name: 'Amit Patel',
    email: 'amit@flexywork.local',
    skills: ['Wiring & Repairs', 'Appliance Installation', 'AC Servicing', 'Smart Home Setup'],
    bio: 'Licensed electrician with 6+ years of field experience in residential and retail projects. Quick troubleshooting and neat fixes.',
    location: 'Benz Circle, Vijayawada',
    distance: 2.3,
    rating: 4.8,
    completedGigsCount: 94,
    reliabilityScore: 95,
    responseTime: 'Replies within 30 mins',
    hourlyRate: 350,
    isVerified: true,
    isTopRated: true,
    communityId: 'c_electricians',
    communityName: 'Krishna District Electricians Union',
    avatarUrl: '/avatars/amit.jpg',
    availability: [
      { day: "Mon", status: "Available", ranges: ["8 AM - 5 PM"] },
      { day: "Tue", status: "Available", ranges: ["8 AM - 5 PM"] },
      { day: "Wed", status: "Available", ranges: ["8 AM - 5 PM"] },
      { day: "Thu", status: "Available", ranges: ["8 AM - 5 PM"] },
      { day: "Fri", status: "Available", ranges: ["8 AM - 5 PM"] },
      { day: "Sat", status: "Limited", ranges: ["9 AM - 1 PM"] },
      { day: "Sun", status: "Unavailable", ranges: [] }
    ]
  },
  {
    id: 'w_ravi',
    userId: 'user_ravi',
    name: 'Ravi Kumar',
    email: 'ravi@flexywork.local',
    skills: ['Lawn Mowing', 'Pruning & Hedging', 'Garden Setup', 'Pest Control', 'Potting & Soil Mix'],
    bio: 'Passionate gardener helping urban apartments and residential villas build beautiful green zones. Highly skilled in native Indian flora.',
    location: 'Governorpet, Vijayawada',
    distance: 3.1,
    rating: 4.7,
    completedGigsCount: 64,
    reliabilityScore: 92,
    responseTime: 'Replies within 1 hour',
    hourlyRate: 200,
    isVerified: true,
    isTopRated: false,
    communityId: 'c_home_services',
    communityName: 'Vijayawada Home Services Collective',
    avatarUrl: '/avatars/ravi.jpg',
    availability: [
      { day: "Mon", status: "Available", ranges: ["7 AM - 11 AM", "3 PM - 6 PM"] },
      { day: "Tue", status: "Available", ranges: ["7 AM - 11 AM", "3 PM - 6 PM"] },
      { day: "Wed", status: "Available", ranges: ["7 AM - 11 AM", "3 PM - 6 PM"] },
      { day: "Thu", status: "Available", ranges: ["7 AM - 11 AM", "3 PM - 6 PM"] },
      { day: "Fri", status: "Available", ranges: ["7 AM - 11 AM", "3 PM - 6 PM"] },
      { day: "Sat", status: "Available", ranges: ["8 AM - 4 PM"] },
      { day: "Sun", status: "Available", ranges: ["8 AM - 12 PM"] }
    ]
  }
];

export const INITIAL_GIGS: Gig[] = [
  {
    id: 'gig_1',
    title: '2BHK Apartment Deep Cleaning',
    description: 'Requires full sweep, kitchen grease cleaning, window washing, and bathroom disinfection. Cleaning materials will be provided by me. Need a fast and thorough job.',
    category: 'Cleaning',
    requiredSkills: ['Deep Cleaning', 'Organization'],
    workersRequired: 1,
    filledCount: 1,
    date: new Date().toISOString().slice(0, 10), // Today
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    time: '10:00 AM - 2:00 PM',
    duration: '4h',
    paymentType: 'fixed',
    paymentAmount: 1000,
    location: 'Moghalrajpuram, Vijayawada',
    urgency: 'normal',
    status: 'ACCEPTED',
    employerId: 'user_harshita',
    employerName: 'Harshita',
    assignedWorkerIds: ['user_priya'],
    applicationStatus: 'accepted',
    matchScore: 98,
    matchReasons: ['Skills match perfectly (Deep Cleaning)', 'Priya is local (1.8km)', 'Highly rated in Cleaning']
  },
  {
    id: 'gig_2',
    title: 'Install Smart Light Switches & Ceiling Fans',
    description: 'Need to replace 4 standard switches with smart WiFi-enabled touch switches, and hang a new ceiling fan in the living room. Wiring is already in place.',
    category: 'Repairs',
    requiredSkills: ['Wiring & Repairs', 'Appliance Installation'],
    workersRequired: 1,
    filledCount: 0,
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // Tomorrow
    startTime: '2:00 PM',
    endTime: '4:30 PM',
    time: '2:00 PM - 4:30 PM',
    duration: '2.5h',
    paymentType: 'fixed',
    paymentAmount: 850,
    location: 'Benz Circle, Vijayawada',
    urgency: 'normal',
    status: 'REQUESTED',
    employerId: 'user_harshita',
    employerName: 'Harshita',
    assignedWorkerIds: [],
    applicationStatus: 'pending',
    matchScore: 95,
    matchReasons: ['Amit matches both required electrical skills', 'Amit lives nearby in Benz Circle']
  },
  {
    id: 'gig_3',
    title: 'Kitchen Garden Pruning & Re-potting',
    description: 'We have 15 potted plants that need trimming, fresh nutrient soil mix, and checking for root health. We will provide the soil and organic manure.',
    category: 'Gardening',
    requiredSkills: ['Pruning & Hedging', 'Potting & Soil Mix'],
    workersRequired: 1,
    filledCount: 0,
    date: new Date(Date.now() + 172800000).toISOString().slice(0, 10), // Day after
    startTime: '8:00 AM',
    endTime: '11:00 AM',
    time: '8:00 AM - 11:00 AM',
    duration: '3h',
    paymentType: 'hourly',
    paymentAmount: 600, // 200/hr
    location: 'Kanuru, Vijayawada',
    urgency: 'normal',
    status: 'REQUESTED',
    employerId: 'user_harshita',
    employerName: 'Harshita',
    assignedWorkerIds: [],
    applicationStatus: null
  }
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'c_home_services',
    name: 'Vijayawada Home Services Collective',
    memberCount: 128,
    rating: 4.8,
    services: ['Cleaning', 'Gardening', 'Elder Care', 'Cooking', 'Event Help'],
    totalEarnings: 342500,
    bannerImage: '/images/collective-banner.jpg',
    logo: 'VH',
    description: 'A local worker cooperative of skilled home professionals collaborating on gigs, sharing equipment, pooling transport, and bidding on larger commercial estate and apartment contracts together.',
    activityFeed: [
      { id: 'act_1', text: 'Priya Sharma completed 25 gigs this month.', timestamp: '2 hours ago' },
      { id: 'act_2', text: 'Ravi Kumar joined the Cooperative Board.', timestamp: '1 day ago' },
      { id: 'act_3', text: 'Collective secured the Sri Balaji Towers annual garden maintenance contract!', timestamp: '3 days ago' },
      { id: 'act_4', text: '₹42,500 earned by community members this week.', timestamp: '4 days ago' }
    ]
  },
  {
    id: 'c_electricians',
    name: 'Krishna District Electricians Union',
    memberCount: 45,
    rating: 4.7,
    services: ['Wiring & Repairs', 'Appliance Installation', 'Solar Panel Maintenance', 'HVAC Servicing'],
    totalEarnings: 189000,
    bannerImage: '/images/electrician-banner.jpg',
    logo: 'KE',
    description: 'Connecting certified electricians across the region. We standardise pricing, handle bulk contracts for commercial construction sites, and provide peer-reviewed skills upskilling sessions.',
    activityFeed: [
      { id: 'act_5', text: 'Amit Patel joined the Electricians Collective.', timestamp: '4 hours ago' },
      { id: 'act_6', text: 'Union completed rewiring for the Community Center Hall.', timestamp: '2 days ago' },
      { id: 'act_7', text: 'Free tool testing session scheduled for next Saturday.', timestamp: '5 days ago' }
    ]
  }
];

export const INITIAL_COOP_GIGS: CooperativeGig[] = [
  {
    id: 'coop_1',
    communityId: 'c_home_services',
    title: 'Community Hall Annual Maintenance',
    description: 'Comprehensive refresh of the local Suryaraopeta Community Hall. Requires structural electrical inspection, garden hedge redesign, and deep hygiene disinfection of the facilities.',
    totalPayout: 8500,
    workersRequired: 4,
    joinedWorkers: [
      { id: 'user_amit', name: 'Amit Patel', role: 'Electrician' },
      { id: 'user_ravi', name: 'Ravi Kumar', role: 'Gardener' },
      { id: 'user_suresh', name: 'Suresh Nair', role: 'Cook/Catering helper' }
    ],
    skillsRequired: [
      { skill: 'Wiring & Repairs', count: 2, filled: 1 },
      { skill: 'Lawn Mowing', count: 1, filled: 1 },
      { skill: 'Deep Cleaning', count: 1, filled: 0 }
    ],
    status: 'open',
    distribution: 'Equal parts distribution by hourly commitment. Amit: ₹3000 (2 shifts), Ravi: ₹2000 (1 shift), Suresh: ₹2000 (1 shift), Cleaner: ₹1500 (1 shift).'
  },
  {
    id: 'coop_2',
    communityId: 'c_home_services',
    title: 'Sri Balaji Towers Garden & Lobby Overhaul',
    description: 'Bi-annual spruce-up of the lawns and lobby furniture of the Sri Balaji Apartment complex. Requires hedge clipping, lobby sanitization, and light plumbing checks.',
    totalPayout: 4200,
    workersRequired: 2,
    joinedWorkers: [
      { id: 'user_ravi', name: 'Ravi Kumar', role: 'Gardener' }
    ],
    skillsRequired: [
      { skill: 'Lawn Mowing', count: 1, filled: 1 },
      { skill: 'Deep Cleaning', count: 1, filled: 0 }
    ],
    status: 'open',
    distribution: 'Gardeners take 60% of pool (₹2,520), Cleaners take 40% of pool (₹1,680).'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n_1',
    userId: 'user_harshita',
    title: 'Gig accepted!',
    message: 'Priya Sharma accepted your cleaning request for today.',
    timestamp: '15 mins ago',
    read: false,
    type: 'booking'
  },
  {
    id: 'n_2',
    userId: 'user_priya',
    title: 'New gig request',
    message: 'Harshita has requested your Deep Cleaning services for today.',
    timestamp: '1 hour ago',
    read: false,
    type: 'gig'
  },
  {
    id: 'n_3',
    userId: 'user_priya',
    title: 'Cooperative Opportunity Available',
    message: 'Vijayawada Home Services Collective has posted a new gig: Community Hall Annual Maintenance.',
    timestamp: '3 hours ago',
    read: false,
    type: 'community'
  },
  {
    id: 'n_4',
    userId: 'user_amit',
    title: 'Gig status updated',
    message: 'Community Hall Maintenance has been confirmed and you are scheduled as Electrician.',
    timestamp: '1 day ago',
    read: true,
    type: 'booking'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't_1',
    userId: 'user_priya',
    date: '2026-08-24',
    amount: 1200,
    type: 'earnings',
    description: '3BHK Dusting & Vacuuming - Indiranagar Club',
    status: 'completed'
  },
  {
    id: 't_2',
    userId: 'user_priya',
    date: '2026-08-22',
    amount: 2500,
    type: 'coop_payout',
    description: 'Cooperative Payout: Commercial Mall Disinfection',
    status: 'completed'
  },
  {
    id: 't_3',
    userId: 'user_priya',
    date: '2026-08-20',
    amount: -185,
    type: 'platform_fee',
    description: 'Platform service & group insurance fee',
    status: 'completed'
  },
  {
    id: 't_4',
    userId: 'user_priya',
    date: '2026-08-15',
    amount: 1500,
    type: 'earnings',
    description: 'Sofa cleaning & shampooing - Ram Nagar Towers',
    status: 'completed'
  }
];

// LocalStorage Helper for mock state
class MockDatabase {
  private getStore<T>(key: string, initial: T[]): T[] {
    if (typeof window === 'undefined') return initial;
    const data = localStorage.getItem(`flexywork_${key}`);
    if (!data) {
      localStorage.setItem(`flexywork_${key}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  private setStore<T>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`flexywork_${key}`, JSON.stringify(data));
  }

  // Getters
  getUsers(): User[] { return this.getStore('users', INITIAL_USERS); }
  getWorkers(): WorkerProfile[] { return this.getStore('workers', INITIAL_WORKERS); }
  getGigs(): Gig[] { return this.getStore('gigs', INITIAL_GIGS); }
  getCommunities(): Community[] { return this.getStore('communities', INITIAL_COMMUNITIES); }
  getCoopGigs(): CooperativeGig[] { return this.getStore('coop_gigs', INITIAL_COOP_GIGS); }
  getNotifications(): Notification[] { return this.getStore('notifications', INITIAL_NOTIFICATIONS); }
  getTransactions(): Transaction[] { return this.getStore('transactions', INITIAL_TRANSACTIONS); }

  // Setters/Updates
  updateUsers(users: User[]) { this.setStore('users', users); }
  updateWorkers(workers: WorkerProfile[]) { this.setStore('workers', workers); }
  updateGigs(gigs: Gig[]) { this.setStore('gigs', gigs); }
  updateCommunities(communities: Community[]) { this.setStore('communities', communities); }
  updateCoopGigs(coopGigs: CooperativeGig[]) { this.setStore('coop_gigs', coopGigs); }
  updateNotifications(notifications: Notification[]) { this.setStore('notifications', notifications); }
  updateTransactions(transactions: Transaction[]) { this.setStore('transactions', transactions); }

  // Auth State Helpers
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return INITIAL_USERS[0]; // Harshita (seeker) by default on server
    const userStr = localStorage.getItem('flexywork_current_user');
    if (!userStr) {
      // Default to Harshita seeker
      this.setCurrentUser(INITIAL_USERS[0]);
      return INITIAL_USERS[0];
    }
    return JSON.parse(userStr);
  }

  setCurrentUser(user: User | null): void {
    if (typeof window === 'undefined') return;
    if (user === null) {
      localStorage.removeItem('flexywork_current_user');
    } else {
      localStorage.setItem('flexywork_current_user', JSON.stringify(user));
    }
  }
}

export const db = new MockDatabase();
