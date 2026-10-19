export type AccountRole = 'rider' | 'driver' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: AccountRole;
  rider?: { name: string; phone?: string | null } | null;
  driver?: { name: string; phone?: string | null; vehicleType?: string; vehicleNumber?: string; status?: string } | null;
}

export interface AuthSession { token: string; user: AuthUser; }

const isAuthSession = (value: unknown): value is AuthSession => {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<AuthSession>;
  const user = session.user;
  return typeof session.token === 'string' && session.token.length > 0
    && !!user && typeof user === 'object'
    && typeof user.id === 'string' && typeof user.email === 'string'
    && ['rider', 'driver', 'admin'].includes(user.role);
};

function parseAuthSession(value: unknown): AuthSession {
  if (!isAuthSession(value)) throw new Error('The server returned an invalid login session. Please try again.');
  return value;
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
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Unable to complete this request.');
  return data as T;
}

export const authApi = {
  async login(email: string, password: string) { return parseAuthSession(await request<unknown>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })); },
  async register(payload: { email: string; password: string; role: 'rider' | 'driver'; name: string; phone: string; vehicleType?: string; vehicleNumber?: string; licenceNumber?: string }) {
    return parseAuthSession(await request<unknown>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }));
  },
  saveSession(session: AuthSession) { localStorage.setItem(SESSION_KEY, JSON.stringify(parseAuthSession(session))); },
  getSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const session = parseAuthSession(JSON.parse(stored));
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
  role: 'rider' | 'driver';
  createdAt: string;
  name?: string;
  phone?: string | null;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  driverStatus?: 'pending' | 'approved' | 'blocked' | null;
}

export const adminApi = {
  listUsers(token: string) { return request<AdminAccount[]>('/api/admin/users', {}, token); },
  setDriverStatus(token: string, id: string, status: 'approved' | 'blocked') {
    return request<{ id: string; status: string }>(`/api/admin/drivers/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
  },
};
