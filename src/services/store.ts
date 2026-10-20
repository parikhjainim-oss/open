import {
  Ride,
  CaptainProfile,
  RiderProfile,
  PricingRule,
  SubscriptionPlan,
  VerificationDocument,
  SupportTicket,
  VehicleCategory,
  RideServiceType,
  LocationPoint,
  FareBreakdown
} from '../types';

const STORAGE_KEY = 'm3_ride_store_v1';
const CHANNEL_NAME = 'm3_ride_bus';

// Ahmedabad Standard Locations
export const AHMEDABAD_LOCATIONS: LocationPoint[] = [
  {
    lat: 23.0365,
    lng: 72.5611,
    name: 'Navrangpura Post Office',
    address: 'Near Commerce Six Roads, Navrangpura, Ahmedabad',
    area: 'Navrangpura',
    landmark: 'Opposite Municipal Market curb'
  },
  {
    lat: 23.0225,
    lng: 72.6025,
    name: 'Ahmedabad Railway Station, Kalupur',
    address: 'Main Concourse Gate No. 2, East Entry, Kalupur',
    area: 'Kalupur',
    landmark: 'Platform 1 East Entry'
  },
  {
    lat: 23.0305,
    lng: 72.5074,
    name: 'Satellite Hub',
    address: 'Near ISRO Colony, Satellite Rd, Ahmedabad',
    area: 'Satellite',
    landmark: 'Opposite Star Bazaar'
  },
  {
    lat: 23.0538,
    lng: 72.5293,
    name: 'Vastrapur Lake Promenade',
    address: 'Alpha One Mall Side, Vastrapur, Ahmedabad',
    area: 'Vastrapur',
    landmark: 'Amphitheatre Gate'
  },
  {
    lat: 23.1611,
    lng: 72.6842,
    name: 'GIFT City Tower 1',
    address: 'GIFT City Rd, Gandhinagar Highway, Ahmedabad Metro',
    area: 'GIFT City',
    landmark: 'Grand Tower Concourse'
  },
  {
    lat: 23.0232,
    lng: 72.5574,
    name: 'Law Garden Night Market',
    address: 'Ellisbridge, Maharashtra Society, Ahmedabad',
    area: 'Law Garden',
    landmark: 'Handicraft lane curb'
  },
  {
    lat: 23.0722,
    lng: 72.5152,
    name: 'SG Highway Artery',
    address: 'Near ISKCON Cross Roads, SG Highway, Ahmedabad',
    area: 'SG Highway',
    landmark: 'Flyover junction'
  },
  {
    lat: 23.2156,
    lng: 72.6369,
    name: 'Gandhinagar Central Bus Station',
    address: 'Sector 11, Gandhinagar, Gujarat',
    area: 'Gandhinagar',
    landmark: 'Central Bus Station'
  },
  {
    lat: 22.3072,
    lng: 73.1812,
    name: 'Vadodara Railway Station',
    address: 'Alkapuri, Vadodara, Gujarat',
    area: 'Vadodara',
    landmark: 'Main station entrance'
  }
];

export const INITIAL_PRICING: Record<VehicleCategory, PricingRule> = {
  bike: {
    category: 'bike',
    name: 'M3 Bike',
    baseFare: 25,
    perKmRate: 5,
    minFare: 25,
    platformLevy: 3,
    capacity: '1 seat',
    etaMins: 2,
    badge: 'FASTEST',
    tagline: 'Fastest solo commute • Drop 10:14 AM'
  },
  auto: {
    category: 'auto',
    name: 'M3 Auto',
    baseFare: 40,
    perKmRate: 8.5,
    minFare: 40,
    platformLevy: 4,
    capacity: '3 seats',
    etaMins: 4,
    tagline: 'Covered & breeze-friendly • Drop 10:20 AM'
  },
  cab: {
    category: 'cab',
    name: 'M3 Prime Cab',
    baseFare: 65,
    perKmRate: 14,
    minFare: 65,
    platformLevy: 6,
    capacity: '4 seats',
    etaMins: 6,
    badge: 'Top Rated',
    tagline: 'AC Sedan, zero surge • Drop 10:24 AM'
  }
};

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_daily',
    name: 'Active Daily Pass',
    price: 49,
    durationText: '24 Hours',
    days: 1,
    benefits: [
      'Zero Commission (100% Ride Fares Kept)',
      'Instant UPI Auto-Payouts',
      'Priority Dispatch Allocation',
      'Free 24x7 Helmet Sanitization Stations'
    ],
    activeSubscribers: 124,
    popular: true
  },
  {
    id: 'plan_weekly',
    name: 'Weekly Power Pass',
    price: 299,
    durationText: '7 Days',
    days: 7,
    benefits: [
      'Save ₹44 compared to daily pass',
      'Zero Commission on all trips',
      'Free Fuel Vouchers worth ₹150',
      'Accident & OPD Shield Insurance'
    ],
    activeSubscribers: 86
  },
  {
    id: 'plan_monthly',
    name: 'Pro Monthly Pass',
    price: 999,
    durationText: '30 Days',
    days: 30,
    benefits: [
      'Maximum savings (32% off daily rate)',
      'Zero Platform deductions',
      'Priority Airport & Railway queues',
      'Dedicated Captain Care Hotline'
    ],
    activeSubscribers: 42
  }
];

export const INITIAL_RIDER: RiderProfile = {
  id: 'rider_aarav',
  name: 'Aarav Patel',
  phone: '+91 98792 48291',
  email: 'aarav.patel@gmail.com',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTXrcdJIoRdV5U9HQ5kIVBY1vwkRrptr-f1okmxcc_--v4DpK--7V8m2Lb9T6EOtkYZb2C8jHxGVzKtf33Bfo9Hz980Dr3Jn3cEE1sEP_fr1H716eDnZJcTDCfGleEzBJAx4hCQw7f3GwMeEVopsvtXWYq9yrPVJmwbRyTCenLWSFBUFxFjcPN7eXgfFkjTsViA_6rXX3N0rJCP0eTzahUN9tHPCK4835h_wR5pAYf6TOw2NQuc0fT',
  rating: 4.9,
  walletBalance: 340,
  savedPlaces: [
    {
      id: 'p1',
      title: 'Home',
      subtitle: 'Satellite',
      icon: '🏠',
      location: AHMEDABAD_LOCATIONS[2]
    },
    {
      id: 'p2',
      title: 'Work',
      subtitle: 'GIFT City Rd',
      icon: '💼',
      location: AHMEDABAD_LOCATIONS[4]
    },
    {
      id: 'p3',
      title: 'Kalupur',
      subtitle: 'Rly Station',
      icon: '🚆',
      location: AHMEDABAD_LOCATIONS[1]
    },
    {
      id: 'p4',
      title: 'Law Garden',
      subtitle: 'Night Market',
      icon: '🏛️',
      location: AHMEDABAD_LOCATIONS[5]
    }
  ]
};

export const INITIAL_CAPTAINS: CaptainProfile[] = [
  {
    id: 'capt_karan',
    name: 'Karan Shah',
    phone: '+91 98250 17842',
    email: 'karan.shah@gmail.com',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUX2ae_4J4GiFx-1aJRutvUyq0TRivovDTncsU5RYnmqyDSaYcBPTkkqkQmlrt6OpZU-_v1U4T5QWFvFsb9C49W10gRTsIhAdiCmPKxi5nan8Snkr_8NO8_86K2YHEhCAbTjzBdif3PZ1Rkwyyx1ykeTq1SV_GjullwUFXXkeSgYH9oIJX-TynU9LZXNu0_aZVVskcIPfZ8omWhzFBl_Ca2plNXGrnYa4cvrCzyY3goaLH1g40HKPi',
    rating: 4.96,
    totalTrips: 2480,
    vehicleCategory: 'bike',
    vehicleNumber: 'GJ-01-ET-7842',
    vehicleModel: 'Hero Splendor Plus',
    isOnline: true,
    status: 'approved',
    languages: ['Gujarati', 'Hindi', 'English'],
    helmetProvided: true,
    backgroundVerified: true,
    currentLocation: {
      lat: 23.037,
      lng: 72.562,
      area: 'Navrangpura, Commerce Six Roads'
    },
    subscription: {
      planId: 'plan_daily',
      planName: 'Active Daily Pass (₹49/day)',
      pricePerDay: 49,
      status: 'active',
      renewedDate: 'Today, 06:00 AM',
      expiryDate: 'Tomorrow, 06:00 AM'
    },
    todayEarnings: 840,
    todayTrips: 9,
    onlineHours: 5.2
  },
  {
    id: 'capt_rajesh',
    name: 'Rajesh Solanki',
    phone: '+91 97241 33901',
    email: 'rajesh.auto@gmail.com',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4.88,
    totalTrips: 3820,
    vehicleCategory: 'auto',
    vehicleNumber: 'GJ-01-AY-4091',
    vehicleModel: 'Bajaj Compact 4S Auto',
    isOnline: true,
    status: 'approved',
    languages: ['Gujarati', 'Hindi'],
    helmetProvided: false,
    backgroundVerified: true,
    currentLocation: {
      lat: 23.033,
      lng: 72.564,
      area: 'Ashram Road'
    },
    subscription: {
      planId: 'plan_weekly',
      planName: 'Weekly Power Pass',
      pricePerDay: 42.7,
      status: 'active',
      renewedDate: '2 days ago',
      expiryDate: 'In 5 days'
    },
    todayEarnings: 1120,
    todayTrips: 11,
    onlineHours: 6.4
  },
  {
    id: 'capt_vikram',
    name: 'Vikram Dave',
    phone: '+91 94280 62118',
    email: 'vikram.dave@gmail.com',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rating: 4.94,
    totalTrips: 1940,
    vehicleCategory: 'cab',
    vehicleNumber: 'GJ-01-KC-9921',
    vehicleModel: 'Maruti Suzuki Dzire AC',
    isOnline: true,
    status: 'approved',
    languages: ['Gujarati', 'Hindi', 'English'],
    helmetProvided: false,
    backgroundVerified: true,
    currentLocation: {
      lat: 23.05,
      lng: 72.53,
      area: 'SG Highway / Vastrapur'
    },
    subscription: {
      planId: 'plan_monthly',
      planName: 'Pro Monthly Pass',
      pricePerDay: 33.3,
      status: 'active',
      renewedDate: '10 days ago',
      expiryDate: 'In 20 days'
    },
    todayEarnings: 1950,
    todayTrips: 7,
    onlineHours: 7.1
  },
  {
    id: 'capt_jignesh',
    name: 'Jignesh Prajapati',
    phone: '+91 99099 87214',
    email: 'jignesh.p@gmail.com',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    rating: 4.75,
    totalTrips: 840,
    vehicleCategory: 'bike',
    vehicleNumber: 'GJ-27-BD-3312',
    vehicleModel: 'Honda Shine 125',
    isOnline: false,
    status: 'pending',
    languages: ['Gujarati', 'Hindi'],
    helmetProvided: true,
    backgroundVerified: false,
    currentLocation: {
      lat: 23.02,
      lng: 72.58,
      area: 'Maninagar'
    },
    subscription: {
      planId: '',
      planName: 'Pending Activation',
      pricePerDay: 0,
      status: 'none',
      renewedDate: '-',
      expiryDate: '-'
    },
    todayEarnings: 0,
    todayTrips: 0,
    onlineHours: 0
  }
];

export const INITIAL_DOCUMENTS: VerificationDocument[] = [
  {
    id: 'doc_jignesh_dl',
    captainId: 'capt_jignesh',
    captainName: 'Jignesh Prajapati',
    vehicleCategory: 'bike',
    docType: 'Driving License',
    docNumber: 'GJ01 20210049281',
    status: 'pending',
    submittedAt: 'Today, 08:30 AM'
  },
  {
    id: 'doc_jignesh_rc',
    captainId: 'capt_jignesh',
    captainName: 'Jignesh Prajapati',
    vehicleCategory: 'bike',
    docType: 'RC Book',
    docNumber: 'GJ-27-BD-3312',
    status: 'pending',
    submittedAt: 'Today, 08:35 AM'
  },
  {
    id: 'doc_karan_dl',
    captainId: 'capt_karan',
    captainName: 'Karan Shah',
    vehicleCategory: 'bike',
    docType: 'Driving License',
    docNumber: 'GJ01 20180092831',
    status: 'approved',
    submittedAt: 'Jan 12, 2026'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_101',
    rideId: 'M3-R-8419',
    userName: 'Meera Trivedi',
    userRole: 'rider',
    subject: 'UPI transaction debited twice',
    category: 'Payment Issue',
    priority: 'high',
    status: 'open',
    createdAt: 'Today, 09:12 AM',
    messages: [
      {
        sender: 'Meera Trivedi',
        role: 'user',
        text: 'Hi, for ride M3-R-8419 ₹68 was deducted twice from GPay. Reference ID: UPI/504938291.',
        timestamp: '09:12 AM'
      }
    ]
  },
  {
    id: 'tkt_102',
    rideId: 'M3-R-8392',
    userName: 'Karan Shah',
    userRole: 'captain',
    subject: 'Surge bonus adjustment query',
    category: 'Fare Dispute',
    priority: 'medium',
    status: 'investigating',
    createdAt: 'Yesterday, 07:45 PM',
    messages: [
      {
        sender: 'Karan Shah',
        role: 'user',
        text: 'The SG Highway 1.8x bonus was ₹15 instead of ₹20 during evening rush.',
        timestamp: 'Yesterday 07:45 PM'
      },
      {
        sender: 'M3 Fleet Support',
        role: 'support',
        text: 'Reviewing trip route telemetry and zone timestamp.',
        timestamp: 'Yesterday 08:10 PM'
      }
    ]
  }
];

export const INITIAL_PAST_RIDES: Ride[] = [
  {
    id: 'M3-R-8419',
    riderId: 'rider_aarav',
    riderName: 'Aarav Patel',
    riderPhone: '+91 98792 48291',
    riderRating: 4.9,
    riderAvatar: INITIAL_RIDER.avatar,
    captainId: 'capt_karan',
    captainName: 'Karan Shah',
    captainPhone: '+91 98250 17842',
    captainRating: 4.92,
    captainPhoto: INITIAL_CAPTAINS[0].photo,
    vehicleCategory: 'bike',
    vehicleNumber: 'GJ-01-ET-7842',
    vehicleModel: 'Hero Splendor Plus',
    pickup: AHMEDABAD_LOCATIONS[0],
    drop: AHMEDABAD_LOCATIONS[1],
    distanceKm: 8.4,
    durationMins: 22,
    fare: {
      baseFare: 25,
      distanceFare: 42,
      perKmRate: 5,
      distanceKm: 8.4,
      platformLevy: 3,
      discount: 2,
      promoCode: 'WELCOME_AMD',
      totalFare: 68
    },
    status: 'COMPLETED',
    pin: '4916',
    paymentMethod: 'Google Pay / UPI',
    paymentStatus: 'completed',
    createdAt: 'Yesterday, 06:14 PM',
    startedAt: 'Yesterday, 06:22 PM',
    completedAt: 'Yesterday, 06:44 PM',
    rating: 5,
    ratingFeedback: 'Smooth ride through Relief Road traffic! Provided clean sanitized helmet.',
    events: [
      { status: 'REQUESTED', timestamp: '06:14 PM', note: 'Ride requested by rider' },
      { status: 'ASSIGNED', timestamp: '06:15 PM', note: 'Assigned to Captain Karan Shah' },
      { status: 'ARRIVED', timestamp: '06:19 PM', note: 'Captain arrived at Navrangpura pickup' },
      { status: 'IN_PROGRESS', timestamp: '06:22 PM', note: 'Ride started with PIN verification 4916' },
      { status: 'COMPLETED', timestamp: '06:44 PM', note: 'Trip completed at Kalupur Rly Station' }
    ]
  },
  {
    id: 'M3-R-8392',
    riderId: 'rider_aarav',
    riderName: 'Aarav Patel',
    riderPhone: '+91 98792 48291',
    riderRating: 4.9,
    riderAvatar: INITIAL_RIDER.avatar,
    captainId: 'capt_rajesh',
    captainName: 'Rajesh Solanki',
    captainPhone: '+91 97241 33901',
    captainRating: 4.88,
    vehicleCategory: 'auto',
    vehicleNumber: 'GJ-01-AY-4091',
    vehicleModel: 'Bajaj Compact 4S Auto',
    pickup: AHMEDABAD_LOCATIONS[2],
    drop: AHMEDABAD_LOCATIONS[3],
    distanceKm: 5.2,
    durationMins: 16,
    fare: {
      baseFare: 40,
      distanceFare: 44.2,
      perKmRate: 8.5,
      distanceKm: 5.2,
      platformLevy: 4,
      discount: 0,
      totalFare: 88
    },
    status: 'COMPLETED',
    pin: '8312',
    paymentMethod: 'Google Pay / UPI',
    paymentStatus: 'completed',
    createdAt: 'Oct 15, 2026, 08:30 AM',
    startedAt: 'Oct 15, 2026, 08:38 AM',
    completedAt: 'Oct 15, 2026, 08:54 AM',
    rating: 5,
    events: [
      { status: 'COMPLETED', timestamp: '08:54 AM', note: 'Completed at Vastrapur Lake' }
    ]
  }
];

export interface AppStoreState {
  currentRole: 'rider' | 'captain' | 'admin';
  rider: RiderProfile;
  captains: CaptainProfile[];
  pricing: Record<VehicleCategory, PricingRule>;
  plans: SubscriptionPlan[];
  documents: VerificationDocument[];
  tickets: SupportTicket[];
  rides: Ride[];
  activeRideId: string | null;
  // Live simulation flags
  simulationSpeed: number;
}

class AppStore {
  private state: AppStoreState;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(state: AppStoreState) => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'STATE_UPDATE') {
          this.state = event.data.payload;
          this.notify();
        }
      };
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            this.state = JSON.parse(e.newValue);
            this.notify();
          } catch (err) {
            console.error('Failed to parse storage update', err);
          }
        }
      });
    }
  }

  private loadInitialState(): AppStoreState {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (err) {
          console.error('Error reading localStorage, reverting to seed', err);
        }
      }
    }

    return {
      currentRole: 'rider',
      rider: INITIAL_RIDER,
      captains: INITIAL_CAPTAINS,
      pricing: INITIAL_PRICING,
      plans: INITIAL_PLANS,
      documents: INITIAL_DOCUMENTS,
      tickets: INITIAL_TICKETS,
      rides: INITIAL_PAST_RIDES,
      activeRideId: null,
      simulationSpeed: 1
    };
  }

  private persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }
    if (this.channel) {
      this.channel.postMessage({ type: 'STATE_UPDATE', payload: this.state });
    }
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public subscribe(listener: (state: AppStoreState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AppStoreState {
    return this.state;
  }

  public setRole(role: 'rider' | 'captain' | 'admin') {
    this.state.currentRole = role;
    this.persist();
  }

  public updateRiderAccount(profile: Partial<RiderProfile>) {
    this.state.rider = { ...this.state.rider, ...profile };
    this.persist();
  }

  // --- FARE CALCULATION ENGINE (Server authoritative logic) ---
  public calculateFare(
    category: VehicleCategory,
    distanceKm: number,
    durationMins: number,
    promoCode?: string
  ): FareBreakdown {
    const rules = this.state.pricing[category];
    const baseFare = rules.baseFare;
    const distanceFare = Math.round(distanceKm * rules.perKmRate);
    const platformLevy = rules.platformLevy;

    let discount = 0;
    if (promoCode === 'WELCOME_AMD' || promoCode === 'APNU_AMD') {
      discount = category === 'bike' ? 2 : 10;
    }

    const calculated = baseFare + distanceFare + platformLevy - discount;
    const totalFare = Math.max(rules.minFare, calculated);

    return {
      baseFare,
      distanceFare,
      perKmRate: rules.perKmRate,
      distanceKm,
      platformLevy,
      discount,
      promoCode,
      totalFare
    };
  }

  // --- RIDE LIFECYCLE ---
  public requestRide(params: {
    category: VehicleCategory;
    serviceType?: RideServiceType;
    serviceDetails?: string;
    pickup: LocationPoint;
    drop: LocationPoint;
    distanceKm: number;
    durationMins: number;
    paymentMethod?: 'Google Pay / UPI' | 'Cash' | 'M3 Wallet';
    promoCode?: string;
  }): Ride {
    const fare = this.calculateFare(
      params.category,
      params.distanceKm,
      params.durationMins,
      params.promoCode || 'WELCOME_AMD'
    );

    // Generate random 4-digit PIN for high-security rider boarding
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const rideId = `M3-R-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRide: Ride = {
      id: rideId,
      riderId: this.state.rider.id,
      riderName: this.state.rider.name,
      riderPhone: this.state.rider.phone,
      riderRating: this.state.rider.rating,
      riderAvatar: this.state.rider.avatar,
      vehicleCategory: params.category,
      serviceType: params.serviceType || 'city',
      serviceDetails: params.serviceDetails,
      pickup: params.pickup,
      drop: params.drop,
      distanceKm: params.distanceKm,
      durationMins: params.durationMins,
      fare,
      status: 'SEARCHING',
      pin,
      paymentMethod: params.paymentMethod || 'Google Pay / UPI',
      paymentStatus: 'pending',
      createdAt: 'Just now',
      events: [
        {
          status: 'REQUESTED',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Ride requested for ${params.category.toUpperCase()} from ${params.pickup.name}`
        },
        {
          status: 'SEARCHING',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: 'Locating nearest verified Ahmedabad captain...'
        }
      ]
    };

    this.state.rides = [newRide, ...this.state.rides];
    this.state.activeRideId = newRide.id;
    this.persist();

    return newRide;
  }

  // Captain accepts the ride
  public acceptRide(rideId: string, captainId: string): boolean {
    const ride = this.state.rides.find((r) => r.id === rideId);
    const captain = this.state.captains.find((c) => c.id === captainId);

    if (!ride || !captain) return false;
    if (ride.status !== 'REQUESTED' && ride.status !== 'SEARCHING') {
      return false; // Prevent multiple captains or already assigned
    }

    ride.status = 'ASSIGNED';
    ride.captainId = captain.id;
    ride.captainName = captain.name;
    ride.captainPhone = captain.phone;
    ride.captainRating = captain.rating;
    ride.captainPhoto = captain.photo;
    ride.vehicleNumber = captain.vehicleNumber;
    ride.vehicleModel = captain.vehicleModel;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    ride.events.push({
      status: 'ASSIGNED',
      timestamp: timeStr,
      note: `Assigned to Captain ${captain.name} (${captain.vehicleNumber})`
    });

    // Immediately mark as Captain Arriving
    ride.status = 'CAPTAIN_ARRIVING';
    ride.events.push({
      status: 'CAPTAIN_ARRIVING',
      timestamp: timeStr,
      note: `Captain is approaching pickup spot: ${ride.pickup.name}`
    });

    this.persist();
    return true;
  }

  public captainArrived(rideId: string): boolean {
    const ride = this.state.rides.find((r) => r.id === rideId);
    if (!ride) return false;

    ride.status = 'ARRIVED';
    ride.events.push({
      status: 'ARRIVED',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: 'Captain has reached the pickup location'
    });

    this.persist();
    return true;
  }

  public startRideWithPin(rideId: string, pin: string): { success: boolean; error?: string } {
    const ride = this.state.rides.find((r) => r.id === rideId);
    if (!ride) return { success: false, error: 'Ride not found' };

    if (ride.pin !== pin) {
      return { success: false, error: 'Incorrect Start Ride PIN. Please verify with passenger.' };
    }

    ride.status = 'IN_PROGRESS';
    ride.startedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    ride.events.push({
      status: 'IN_PROGRESS',
      timestamp: ride.startedAt,
      note: 'OTP verified. Trip is now in progress towards destination'
    });

    this.persist();
    return { success: true };
  }

  public completeRide(rideId: string): boolean {
    const ride = this.state.rides.find((r) => r.id === rideId);
    if (!ride) return false;

    ride.status = 'COMPLETED';
    ride.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    ride.paymentStatus = 'completed';
    ride.events.push({
      status: 'COMPLETED',
      timestamp: ride.completedAt,
      note: `Arrived at ${ride.drop.name}. Payment of ₹${ride.fare.totalFare} received via ${ride.paymentMethod}.`
    });

    // Credit captain earnings
    if (ride.captainId) {
      const captain = this.state.captains.find((c) => c.id === ride.captainId);
      if (captain) {
        captain.todayEarnings += ride.fare.totalFare;
        captain.todayTrips += 1;
        captain.totalTrips += 1;
      }
    }

    this.persist();
    return true;
  }

  public cancelRide(rideId: string, reason: string): boolean {
    const ride = this.state.rides.find((r) => r.id === rideId);
    if (!ride) return false;

    ride.status = 'CANCELLED';
    ride.cancelledAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    ride.cancellationReason = reason;
    ride.events.push({
      status: 'CANCELLED',
      timestamp: ride.cancelledAt,
      note: `Trip cancelled. Reason: ${reason}`
    });

    this.persist();
    return true;
  }

  public rateRide(rideId: string, rating: number, feedback?: string) {
    const ride = this.state.rides.find((r) => r.id === rideId);
    if (ride) {
      ride.rating = rating;
      ride.ratingFeedback = feedback;
      this.persist();
    }
  }

  public clearActiveRide() {
    this.state.activeRideId = null;
    this.persist();
  }

  // --- CAPTAIN CONTROLS ---
  public toggleCaptainDuty(captainId: string) {
    const captain = this.state.captains.find((c) => c.id === captainId);
    if (captain) {
      captain.isOnline = !captain.isOnline;
      this.persist();
    }
  }

  public renewSubscription(captainId: string, planId: string) {
    const captain = this.state.captains.find((c) => c.id === captainId);
    const plan = this.state.plans.find((p) => p.id === planId);
    if (captain && plan) {
      captain.subscription = {
        planId: plan.id,
        planName: plan.name,
        pricePerDay: plan.price / plan.days,
        status: 'active',
        renewedDate: 'Just now',
        expiryDate: `In ${plan.days} days`
      };
      plan.activeSubscribers += 1;
      this.persist();
    }
  }

  // --- ADMIN MANAGEMENT ---
  public approveDocument(docId: string) {
    const doc = this.state.documents.find((d) => d.id === docId);
    if (doc) {
      doc.status = 'approved';
      // If all documents for this captain are approved, approve captain
      const allCaptainDocs = this.state.documents.filter((d) => d.captainId === doc.captainId);
      const allApproved = allCaptainDocs.every((d) => d.id === docId || d.status === 'approved');
      if (allApproved) {
        const captain = this.state.captains.find((c) => c.id === doc.captainId);
        if (captain) captain.status = 'approved';
      }
      this.persist();
    }
  }

  public rejectDocument(docId: string, reason: string) {
    const doc = this.state.documents.find((d) => d.id === docId);
    if (doc) {
      doc.status = 'rejected';
      doc.rejectionReason = reason;
      const captain = this.state.captains.find((c) => c.id === doc.captainId);
      if (captain) {
        captain.status = 'rejected';
        captain.rejectionReason = reason;
      }
      this.persist();
    }
  }

  public toggleCaptainSuspension(captainId: string) {
    const captain = this.state.captains.find((c) => c.id === captainId);
    if (captain) {
      captain.status = captain.status === 'suspended' ? 'approved' : 'suspended';
      if (captain.status === 'suspended') {
        captain.isOnline = false;
      }
      this.persist();
    }
  }

  public updatePricing(category: VehicleCategory, updates: Partial<PricingRule>) {
    this.state.pricing[category] = {
      ...this.state.pricing[category],
      ...updates
    };
    this.persist();
  }

  public resolveTicket(ticketId: string, note?: string) {
    const ticket = this.state.tickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = 'resolved';
      if (note) {
        ticket.messages.push({
          sender: 'M3 Operations Team',
          role: 'support',
          text: note,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
      this.persist();
    }
  }

  // Reset demo state back to pristine seed
  public resetToSeed() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.state = this.loadInitialState();
    this.persist();
  }
}

export const store = new AppStore();
