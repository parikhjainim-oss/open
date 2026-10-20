// src/lib/api.ts

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'rider' | 'captain' | 'admin';
  avatar?: string;
  city: string;
  // Captain-specific fields
  vehicleType?: 'bike' | 'auto' | 'cab';
  vehiclePlate?: string;
  vehicleModel?: string;
  rating?: number;
  walletBalance?: number;
  isOnline?: boolean;
  totalTrips?: number;
}

export interface RideRequest {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  captainId?: string;
  captainName?: string;
  captainVehicle?: string;
  captainPlate?: string;
  pickupAddress: string;
  dropAddress: string;
  pickupCoords: [number, number];
  dropCoords: [number, number];
  fare: number;
  distanceKm: number;
  vehicleTier: 'bike' | 'auto' | 'cab';
  status: 'searching' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  otp: string;
  createdAt: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Local DB Keys
const STORAGE_USER_KEY = 'm3_active_user';
const STORAGE_RIDES_KEY = 'm3_active_rides';
const STORAGE_CAPTAINS_KEY = 'm3_captains_fleet';

// Universal Safe Fetcher that will never crash on HTML responses
export async function safeApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      const contentType = res.headers.get('content-type') || '';
      
      // If server returned HTML (static file rewrite), fallback
      if (contentType.includes('text/html')) {
        console.warn(`[API] Endpoint ${endpoint} returned HTML. Falling back to client-side storage engine.`);
      } else if (res.ok) {
        return (await res.json()) as T;
      }
    } catch (err) {
      console.warn(`[API] Network error connecting to ${API_BASE_URL}${endpoint}. Switching to offline storage.`);
    }
  }

  // Graceful Local Engine Fallback
  return mockLocalApiHandler<T>(endpoint, options);
}

// Local mock handler with real persistence
function mockLocalApiHandler<T>(endpoint: string, options: RequestInit): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : null;

  return new Promise((resolve) => {
    setTimeout(() => {
      // 1. Auth Login / Signup
      if (endpoint === '/api/auth/login' || endpoint === '/api/auth/register') {
        const profile: UserProfile = {
          id: 'USR-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          name: body?.name?.trim() || (body?.role === 'admin' ? 'Fleet Administrator' : 'Urban Commuter'),
          phone: body?.phone || '+91 98765 43210',
          email: body?.email || 'user@m3ride.com',
          role: body?.role || 'rider',
          city: body?.city || 'Ahmedabad',
          vehicleType: body?.vehicleType || 'bike',
          vehiclePlate: body?.vehiclePlate || 'GJ-01-AB-1234',
          vehicleModel: body?.vehicleModel || 'Honda Activa 6G',
          rating: 4.9,
          walletBalance: body?.role === 'captain' ? 450 : 200,
          isOnline: true,
          totalTrips: body?.role === 'captain' ? 12 : 5
        };

        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
        return resolve({ success: true, user: profile, token: 'mock-jwt-token-m3' } as unknown as T);
      }

      // 2. Fetch current profile
      if (endpoint === '/api/auth/me') {
        const stored = localStorage.getItem(STORAGE_USER_KEY);
        if (stored) {
          return resolve(JSON.parse(stored) as T);
        }
        return resolve(null as unknown as T);
      }

      // 3. Rides Dispatch & Management
      if (endpoint === '/api/rides' && method === 'POST') {
        const existingRides: RideRequest[] = JSON.parse(localStorage.getItem(STORAGE_RIDES_KEY) || '[]');
        const newRide: RideRequest = {
          id: 'RIDE-' + Math.floor(1000 + Math.random() * 9000),
          riderId: body.riderId,
          riderName: body.riderName,
          riderPhone: body.riderPhone,
          pickupAddress: body.pickupAddress,
          dropAddress: body.dropAddress,
          pickupCoords: body.pickupCoords,
          dropCoords: body.dropCoords,
          fare: body.fare,
          distanceKm: body.distanceKm,
          vehicleTier: body.vehicleTier,
          status: 'searching',
          otp: String(Math.floor(1000 + Math.random() * 9000)),
          createdAt: Date.now()
        };
        existingRides.unshift(newRide);
        localStorage.setItem(STORAGE_RIDES_KEY, JSON.stringify(existingRides));
        return resolve(newRide as unknown as T);
      }

      // Default fallback
      resolve({ success: true } as unknown as T);
    }, 200);
  });
}
