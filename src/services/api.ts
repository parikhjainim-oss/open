export type AccountRole = 'rider' | 'driver' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: AccountRole;
  rider?: { name: string; phone?: string | null } | null;
  driver?: { name: string; phone?: string | null; vehicleType?: string; vehicleNumber?: string; status?: string } | null;
}

export interface AuthSession { token: string; user: AuthUser; }

type JsonObject = Record<string, unknown>;
const asObject = (value: unknown): JsonObject | null => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : null;

function unwrapResponse(value: unknown): JsonObject[] {
  const first = asObject(value);
  if (!first) return [];
  const layers = [first];
  for (let i = 0; i < layers.length && i < 5; i += 1) {
    for (const key of ['data', 'result', 'session', 'auth']) {
      const nested = asObject(layers[i][key]);
      if (nested && !layers.includes(nested)) layers.push(nested);
    }
  }
  return layers;
}

function normalizeRole(value: unknown): AccountRole | null {
  if (typeof value !== 'string') return null;
  const role = value.toLowerCase().replace(/[ -]/g, '_');
  if (['rider', 'user', 'customer', 'passenger'].includes(role)) return 'rider';
  if (['driver', 'captain'].includes(role)) return 'driver';
  if (['admin', 'administrator', 'super_admin'].includes(role)) return 'admin';
  return null;
}

function normalizeAuthUser(value: unknown, fallback: JsonObject[] = []): AuthUser | null {
  let user = asObject(value);
  if (user?.user) user = asObject(user.user) || user;
  if (!user) user = fallback.find((item) => typeof item.email === 'string' && (item.role || item.userRole || item.user_type)) || null;
  if (!user) return null;

  const role = normalizeRole(user.role ?? user.userRole ?? user.user_type ?? user.accountType ?? user.type)
    || fallback.map((item) => normalizeRole(item.role ?? item.userRole ?? item.user_type ?? item.accountType)).find(Boolean)
    || null;
  const email = user.email ?? user.emailAddress ?? user.email_address;
  if (!role || typeof email !== 'string' || !email) return null;

  const rawProfile = role === 'driver'
    ? user.driver ?? user.driverProfile ?? user.driver_profile ?? user.captain ?? user.profile
    : role === 'rider' ? user.rider ?? user.riderProfile ?? user.rider_profile ?? user.profile : null;
  const profile = asObject(rawProfile);
  const name = profile?.name ?? profile?.fullName ?? profile?.full_name;
  const phone = profile?.phone ?? profile?.phoneNumber ?? profile?.phone_number;
  const id = user.id ?? user.userId ?? user.user_id ?? user.sub ?? email;
  const authUser: AuthUser = { id: String(id), email, role };

  if (role === 'rider') authUser.rider = profile ? {
    name: typeof name === 'string' && name ? name : email,
    phone: typeof phone === 'string' ? phone : null,
  } : null;
  if (role === 'driver') authUser.driver = profile ? {
    name: typeof name === 'string' && name ? name : email,
    phone: typeof phone === 'string' ? phone : null,
    vehicleType: typeof (profile.vehicleType ?? profile.vehicle_type) === 'string' ? String(profile.vehicleType ?? profile.vehicle_type) : undefined,
    vehicleNumber: typeof (profile.vehicleNumber ?? profile.vehicle_number) === 'string' ? String(profile.vehicleNumber ?? profile.vehicle_number) : undefined,
    status: typeof profile.status === 'string' ? profile.status : undefined,
  } : null;
  return authUser;
}

function normalizeAuthSession(value: unknown): AuthSession | null {
  const layers = unwrapResponse(value);
  const tokenValue = layers.map((item) => item.token ?? item.accessToken ?? item.access_token ?? item.jwt).find((item) => typeof item === 'string' && item.length > 0);
  if (typeof tokenValue !== 'string') return null;
  const userValue = layers.map((item) => item.user ?? item.account).find((item) => asObject(item));
  const user = normalizeAuthUser(userValue, layers);
  return user ? { token: tokenValue, user } : null;
}

async function authenticate(path: string, payload: Record<string, unknown>): Promise<AuthSession> {
  const response = await request<unknown>(path, { method: 'POST', body: JSON.stringify(payload) });
  const session = normalizeAuthSession(response);
  if (session) return session;

  // Some API hosts return the token separately from the account. Resolve the
  // account from the protected profile endpoint before routing by role.
  const layers = unwrapResponse(response);
  const token = layers.map((item) => item.token ?? item.accessToken ?? item.access_token ?? item.jwt).find((item) => typeof item === 'string' && item.length > 0);
  if (typeof token === 'string') {
    const current = await request<unknown>('/api/auth/me', { method: 'GET' }, token);
    const currentLayers = unwrapResponse(current);
    const userValue = currentLayers.map((item) => item.user ?? item.account).find((item) => asObject(item));
    const user = normalizeAuthUser(userValue, currentLayers);
    if (user) return { token, user };
  }
  throw new Error('The login API did not return an account and access token. Confirm the deployed backend uses the M3 RIDE auth API.');
}

// Production builds should use the same origin unless VITE_API_URL explicitly
// points at a separately deployed API. This avoids sending hosted users to localhost.
const API_URL = (import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000')).replace(/\/$/, '');
const SESSION_KEY = 'm3_ride_auth_session';

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    });
  } catch {
    throw new Error('Cannot reach the M3 RIDE API. Check that the backend is running and VITE_API_URL points to it.');
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (response.ok) throw new Error('The API returned a web page instead of JSON. Deploy the backend with the web app or set VITE_API_URL to the backend URL.');
    throw new Error(`The API returned an unexpected response (${response.status}).`);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Unable to complete this request.');
  return data as T;
}

export const authApi = {
  login(email: string, password: string) { return authenticate('/api/auth/login', { email, password }); },
  async register(payload: { email: string; password: string; role: 'rider' | 'driver'; name: string; phone: string; vehicleType?: string; vehicleNumber?: string; licenceNumber?: string }) {
    return authenticate('/api/auth/register', payload);
  },
  saveSession(session: AuthSession) { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); },
  getSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const session = normalizeAuthSession(JSON.parse(stored));
      if (!session) localStorage.removeItem(SESSION_KEY);
      return session;
    } catch {
      try { localStorage.removeItem(SESSION_KEY); } catch { /* Storage may be unavailable in restricted browsers. */ }
      return null;
    }
  },
  clearSession() { localStorage.removeItem(SESSION_KEY); },
};

export interface AdminAccount {
  id: string;
  email: string;
  role: 'rider' | 'driver' | 'admin';
  createdAt: string;
  name?: string;
  phone?: string | null;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  driverStatus?: 'pending' | 'approved' | 'blocked' | null;
}

export const adminApi = {
  listUsers(token: string) { return request<AdminAccount[]>('/api/admin/users', {}, token); },
  createAdmin(token: string, payload: { email: string; password: string }) {
    return request<{ id: string; email: string; role: 'admin' }>('/api/admin/admins', { method: 'POST', body: JSON.stringify(payload) }, token);
  },
  setDriverStatus(token: string, id: string, status: 'approved' | 'blocked') {
    return request<{ id: string; status: string }>(`/api/admin/drivers/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
  },
};
