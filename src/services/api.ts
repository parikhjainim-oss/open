export type AccountRole = 'rider' | 'driver' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: AccountRole;
  rider?: { name: string; phone?: string | null } | null;
  driver?: { name: string; phone?: string | null; vehicleType?: string; vehicleNumber?: string; status?: string } | null;
}

export interface AuthSession { token: string; user: AuthUser; }

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const SESSION_KEY = 'm3_ride_auth_session';

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Unable to complete this request.');
  return data as T;
}

export const authApi = {
  login(email: string, password: string) { return request<AuthSession>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); },
  register(payload: { email: string; password: string; role: 'rider' | 'driver'; name: string; phone?: string; vehicleType?: string; vehicleNumber?: string; licenceNumber?: string }) {
    return request<AuthSession>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },
  saveSession(session: AuthSession) { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); },
  getSession(): AuthSession | null {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
  },
  clearSession() { localStorage.removeItem(SESSION_KEY); },
};
