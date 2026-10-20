export type AccountRole = 'rider' | 'driver' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: AccountRole;
  name?: string;
  phone?: string | null;
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
  if (role === 'admin') {
    const adminProfile = asObject(user.profile);
    if (typeof (user.name ?? adminProfile?.name) === 'string') authUser.name = String(user.name ?? adminProfile?.name);
    if (typeof (user.phone ?? adminProfile?.phone) === 'string') authUser.phone = String(user.phone ?? adminProfile?.phone);
  }

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
const ACCOUNTS_KEY = 'm3_ride_accounts';
const USE_REMOTE_AUTH = import.meta.env.VITE_AUTH_MODE === 'api';

type StoredAccount = { user: AuthUser; salt: string; passwordHash: string; createdAt: string };
const readAccounts = (): StoredAccount[] => {
  try {
    const value = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
};
const writeAccounts = (accounts: StoredAccount[]) => localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
const bytesToHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
async function passwordDigest(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: Uint8Array.from(salt.match(/.{2}/g) || [], (byte) => parseInt(byte, 16)), iterations: 120000, hash: 'SHA-256' }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}
const localSession = (user: AuthUser): AuthSession => ({ token: `local-${crypto.randomUUID?.() || Date.now().toString(36)}`, user });
function localProfile(role: AccountRole, payload: { name?: string; phone?: string; vehicleType?: string; vehicleNumber?: string }): AuthUser {
  const base = { id: crypto.randomUUID?.() || `${Date.now()}`, email: '', role } as AuthUser;
  if (role === 'rider') base.rider = { name: payload.name!.trim(), phone: payload.phone!.trim() };
  if (role === 'driver') base.driver = { name: payload.name!.trim(), phone: payload.phone!.trim(), vehicleType: payload.vehicleType, vehicleNumber: payload.vehicleNumber, status: 'pending' };
  if (role === 'admin') { base.name = payload.name?.trim() || 'Administrator'; base.phone = payload.phone?.trim() || ''; }
  return base;
}

async function localRegister(payload: { email: string; password: string; role: AccountRole; name: string; phone: string; vehicleType?: string; vehicleNumber?: string }) {
  const email = payload.email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.');
  if (payload.password.length < 8) throw new Error('Password must be at least 8 characters.');
  if (!payload.name.trim()) throw new Error('Enter your name.');
  if (readAccounts().some((account) => account.user.email === email)) throw new Error('An account with this email already exists. Sign in instead.');
  const user = localProfile(payload.role, payload);
  user.email = email;
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  const accounts = readAccounts();
  accounts.push({ user, salt, passwordHash: await passwordDigest(payload.password, salt), createdAt: new Date().toISOString() });
  writeAccounts(accounts);
  return localSession(user);
}
async function localLogin(emailInput: string, password: string) {
  const email = emailInput.trim().toLowerCase();
  const account = readAccounts().find((item) => item.user.email === email);
  if (!account || await passwordDigest(password, account.salt) !== account.passwordHash) throw new Error('Email or password is incorrect. Check your details or create an account.');
  return localSession(account.user);
}

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
  login(email: string, password: string) { return USE_REMOTE_AUTH ? authenticate('/api/auth/login', { email, password }) : localLogin(email, password); },
  async register(payload: { email: string; password: string; role: 'rider' | 'driver'; name: string; phone: string; vehicleType?: string; vehicleNumber?: string; licenceNumber?: string }) {
    return USE_REMOTE_AUTH ? authenticate('/api/auth/register', payload) : localRegister(payload);
  },
  registerAdmin(payload: { email: string; password: string; name: string; phone: string }) {
    return USE_REMOTE_AUTH ? Promise.reject(new Error('Create administrator accounts from the signed-in admin dashboard.')) : localRegister({ ...payload, role: 'admin' });
  },
  updateLocalProfile(user: AuthUser) {
    if (USE_REMOTE_AUTH) return;
    const accounts = readAccounts();
    const index = accounts.findIndex((account) => account.user.id === user.id);
    if (index >= 0) { accounts[index].user = user; writeAccounts(accounts); }
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
  async listUsers(token: string) {
    if (USE_REMOTE_AUTH) return request<AdminAccount[]>('/api/admin/users', {}, token);
    return readAccounts().map(({ user, createdAt }) => ({ id: user.id, email: user.email, role: user.role, createdAt, name: user.rider?.name || user.driver?.name || user.name, phone: user.rider?.phone || user.driver?.phone || user.phone, vehicleType: user.driver?.vehicleType, vehicleNumber: user.driver?.vehicleNumber, driverStatus: user.driver?.status as AdminAccount['driverStatus'] }));
  },
  createAdmin(token: string, payload: { email: string; password: string }) {
    if (USE_REMOTE_AUTH) return request<{ id: string; email: string; role: 'admin' }>('/api/admin/admins', { method: 'POST', body: JSON.stringify(payload) }, token);
    return localRegister({ ...payload, name: payload.email.split('@')[0], phone: '', role: 'admin' }).then(({ user }) => ({ id: user.id, email: user.email, role: 'admin' as const }));
  },
  async setDriverStatus(token: string, id: string, status: 'approved' | 'blocked') {
    if (USE_REMOTE_AUTH) return request<{ id: string; status: string }>(`/api/admin/drivers/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
    const accounts = readAccounts();
    const account = accounts.find((item) => item.user.id === id && item.user.driver);
    if (!account?.user.driver) throw new Error('Driver account not found.');
    account.user.driver.status = status;
    writeAccounts(accounts);
    return { id, status };
  },
};
