import { FormEvent, useState } from 'react';
import { Bike, CarFront, ShieldCheck, UserRound } from 'lucide-react';
import { authApi, AuthSession, USE_REMOTE_AUTH } from '../../services/api';

type AccountType = 'rider' | 'driver' | 'admin';

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [accountType, setAccountType] = useState<AccountType>('rider');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [adminRole, setAdminRole] = useState<NonNullable<AuthSession['user']['adminRole']>>('operations_manager');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const session = mode === 'login'
        ? await authApi.login(email, password)
        : accountType === 'admin'
          ? await authApi.registerAdmin({ email, password, name, phone, adminRole })
          : await authApi.register({ email, password, role: accountType, name, phone, vehicleType: accountType === 'driver' ? vehicleType : undefined, vehicleNumber: accountType === 'driver' ? vehicleNumber : undefined, licenceNumber: accountType === 'driver' ? licenceNumber : undefined });
      if (mode === 'login' && session.user.role !== accountType) throw new Error(`This account is registered as ${session.user.role}, not ${accountType}.`);
      authApi.saveSession(session); onAuthenticated(session);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to sign in.'); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] p-5 font-['Inter',sans-serif] sm:flex sm:items-center sm:justify-center">
      <section className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-orange-950/10">
        <div className="bg-[#171717] px-7 pb-8 pt-10 text-white"><div className="mb-6 flex items-center gap-3"><div className="rounded-2xl bg-[#FF6B00] p-3"><CarFront size={28} /></div><div><h1 className="text-2xl font-black">M3 RIDE</h1><p className="text-xs tracking-widest text-orange-200">SAFE. FAST. LOCAL.</p></div></div><h2 className="text-xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="mt-1 text-sm text-white/65">Sign in to book, drive, or manage M3 rides.</p></div>
        <form onSubmit={submit} className="space-y-4 p-7">
          <div className="grid grid-cols-3 gap-2">{([['rider', UserRound, 'Rider'], ['driver', Bike, 'Driver'], ['admin', ShieldCheck, 'Admin']] as const).map(([value, Icon, label]) => <button key={value} type="button" onClick={() => { setAccountType(value); setMode('login'); setError(''); }} className={`rounded-xl border p-3 text-xs font-bold ${accountType === value ? 'border-[#FF6B00] bg-orange-50 text-[#A04100]' : 'border-gray-200 text-gray-500'}`}><Icon className="mx-auto mb-1" size={19} />{label}</button>)}</div>
          {mode === 'register' && <><label className="block text-sm font-semibold">Full name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#FF6B00]" placeholder="Your name" /></label><label className="block text-sm font-semibold">Phone number<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#FF6B00]" placeholder="+91 98765 43210" /></label>{accountType === 'driver' && <><div className="grid grid-cols-2 gap-3"><label className="block text-sm font-semibold">Vehicle<select value={vehicleType} onChange={(event) => setVehicleType(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3"><option value="bike">Bike</option><option value="auto">Auto</option><option value="cab">Cab</option></select></label><label className="block text-sm font-semibold">Vehicle number<input value={vehicleNumber} onChange={(event) => setVehicleNumber(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3" placeholder="GJ-01-AB-1234" /></label></div><label className="block text-sm font-semibold">Driving licence number<input value={licenceNumber} onChange={(event) => setLicenceNumber(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3" placeholder="GJ0120..." /></label></>}</>}
          {mode === 'register' && accountType === 'admin' && <label className="block text-sm font-semibold">Administrator access<select value={adminRole} onChange={(event) => setAdminRole(event.target.value as typeof adminRole)} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3"><option value="super_admin">Super Admin</option><option value="operations_manager">Operations Manager</option><option value="verification_agent">Verification Agent</option><option value="support_agent">Support Agent</option></select></label>}
          <label className="block text-sm font-semibold">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#FF6B00]" placeholder="you@example.com" /></label>
          <label className="block text-sm font-semibold">Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#FF6B00]" placeholder="Minimum 8 characters" /></label>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-[#FF6B00] p-3.5 font-bold text-white disabled:opacity-60">{loading ? 'Please wait…' : mode === 'login' ? `Sign in as ${accountType}` : 'Create account'}</button>
          {(accountType !== 'admin' || !USE_REMOTE_AUTH) && <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="w-full text-sm font-semibold text-[#A04100]">{mode === 'login' ? accountType === 'admin' ? 'Create an admin account' : 'New here? Create an account' : 'Already have an account? Sign in'}</button>}
          <p className="text-center text-xs text-gray-500">Accounts are stored in this browser. Use the same browser to sign in later.</p>
        </form>
      </section>
    </main>
  );
}
