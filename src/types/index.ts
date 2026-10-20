export type UserRole = 'rider' | 'captain' | 'admin';

export type VehicleCategory = 'bike' | 'auto' | 'cab';
export type RideServiceType = 'city' | 'parcel' | 'pro' | 'travel';

export type RideStatus =
  | 'REQUESTED'
  | 'SEARCHING'
  | 'ASSIGNED'
  | 'CAPTAIN_ARRIVING'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_CAPTAIN_AVAILABLE';

export interface LocationPoint {
  lat: number;
  lng: number;
  name: string;
  address: string;
  area: string;
  landmark?: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  perKmRate: number;
  distanceKm: number;
  platformLevy: number;
  discount: number;
  promoCode?: string;
  totalFare: number;
}

export interface RideEvent {
  status: RideStatus;
  timestamp: string;
  note: string;
}

export interface Ride {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  riderRating: number;
  riderAvatar: string;
  captainId?: string;
  captainName?: string;
  captainPhone?: string;
  captainRating?: number;
  captainPhoto?: string;
  vehicleCategory: VehicleCategory;
  serviceType?: RideServiceType;
  serviceDetails?: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  pickup: LocationPoint;
  drop: LocationPoint;
  distanceKm: number;
  durationMins: number;
  fare: FareBreakdown;
  status: RideStatus;
  pin: string;
  paymentMethod: 'Google Pay / UPI' | 'Cash' | 'M3 Wallet';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  rating?: number;
  ratingFeedback?: string;
  events: RideEvent[];
}

export interface CaptainProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo: string;
  rating: number;
  totalTrips: number;
  vehicleCategory: VehicleCategory;
  vehicleNumber: string;
  vehicleModel: string;
  isOnline: boolean;
  status: 'approved' | 'pending' | 'rejected' | 'suspended';
  rejectionReason?: string;
  languages: string[];
  helmetProvided: boolean;
  backgroundVerified: boolean;
  currentLocation: {
    lat: number;
    lng: number;
    area: string;
  };
  subscription: {
    planId: string;
    planName: string;
    pricePerDay: number;
    status: 'active' | 'expired' | 'none';
    renewedDate: string;
    expiryDate: string;
  };
  todayEarnings: number;
  todayTrips: number;
  onlineHours: number;
}

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  walletBalance: number;
  savedPlaces: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    location: LocationPoint;
  }>;
}

export interface PricingRule {
  category: VehicleCategory;
  name: string;
  baseFare: number;
  perKmRate: number;
  minFare: number;
  platformLevy: number;
  capacity: string;
  etaMins: number;
  badge?: string;
  tagline: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationText: string;
  days: number;
  benefits: string[];
  activeSubscribers: number;
  popular?: boolean;
}

export interface VerificationDocument {
  id: string;
  captainId: string;
  captainName: string;
  vehicleCategory: VehicleCategory;
  docType: 'Driving License' | 'RC Book' | 'Aadhaar Card' | 'Police Clearance';
  docNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  rejectionReason?: string;
}

export interface SupportTicket {
  id: string;
  rideId?: string;
  userName: string;
  userRole: 'rider' | 'captain';
  subject: string;
  category: 'Fare Dispute' | 'Safety / SOS' | 'Lost Item' | 'Captain Behavior' | 'Payment Issue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
  messages: Array<{
    sender: string;
    role: 'user' | 'support';
    text: string;
    timestamp: string;
  }>;
}
