import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, RefreshCw, ShieldCheck, UserRound, Users } from 'lucide-react';
import { adminApi, AdminAccount } from '../../services/api';

export function AdminAccounts({ token, canCreateAdmins = false }: { token: string; canCreateAdmins?: boolean }) {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState<'super_admin' | 'operations_manager' | 'verification_agent' | 'support_agent'>('operations_manager');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [success, setSuccess] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setAccounts(await adminApi.listUsers(token)); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load accounts.'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void refresh(); }, [refresh]);

  const updateDriver = async (account: AdminAccount) => {
    const status = account.driverStatus === 'blocked' ? 'approved' : 'blocked';
    setSavingId(account.id);
    setError('');
    try {
      await adminApi.setDriverStatus(token, account.id, status);
      setAccounts((current) => current.map((item) => item.id === account.id ? { ...item, driverStatus: status } : item));
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to update driver.'); }
    finally { setSavingId(null); }
  };

  const createAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingAdmin(true);
    setError('');
    setSuccess('');
    try {
      await adminApi.createAdmin(token, { email: adminEmail, password: adminPassword, adminRole });
      setAdminEmail('');
      setAdminPassword('');
      setSuccess('Administrator account created.');
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create administrator.');
    } finally { setCreatingAdmin(false); }
  };

  return <section className="space-y-4">
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div><h2 className="text-base font-bold text-gray-900">User & Driver Accounts</h2><p className="text-xs text-gray-500">Accounts registered in the M3 RIDE database</p></div>
      <button type="button" onClick={() => void refresh()} disabled={loading} className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh</button>
    </div>
    {error && <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} />{error}</p>}
    {success && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{success}</p>}
    {canCreateAdmins && <form onSubmit={createAdmin} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <label className="text-xs font-semibold text-gray-700">New admin email<input required type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} className="mt-1 block w-full rounded-xl border border-gray-200 p-2.5 text-sm" placeholder="admin@example.com" /></label>
      <label className="text-xs font-semibold text-gray-700">Temporary password<input required minLength={12} type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} className="mt-1 block w-full rounded-xl border border-gray-200 p-2.5 text-sm" placeholder="At least 12 characters" /></label>
      <label className="text-xs font-semibold text-gray-700">Access role<select value={adminRole} onChange={(event) => setAdminRole(event.target.value as typeof adminRole)} className="mt-1 block w-full rounded-xl border border-gray-200 p-2.5 text-sm"><option value="super_admin">Super Admin</option><option value="operations_manager">Operations Manager</option><option value="verification_agent">Verification Agent</option><option value="support_agent">Support Agent</option></select></label>
      <button type="submit" disabled={creatingAdmin} className="rounded-xl bg-[#FF6B00] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{creatingAdmin ? 'Creating…' : 'Create admin'}</button>
    </form>}
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[680px] text-left text-xs">
        <thead className="border-b bg-[#F7F8FA] text-[10px] uppercase text-gray-500"><tr><th className="px-4 py-3">Account</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Contact / Vehicle</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status / Action</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {accounts.map((account) => <tr key={account.id}>
            <td className="px-4 py-3"><span className="block font-bold text-gray-900">{account.name || account.email}</span><span className="text-gray-500">{account.email}</span></td>
            <td className="px-4 py-3"><span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-semibold capitalize text-gray-700">{account.role === 'driver' || account.role === 'admin' ? <ShieldCheck size={12} /> : <UserRound size={12} />}{account.role === 'admin' ? account.adminRole?.replaceAll('_', ' ') || 'admin' : account.role}</span></td>
            <td className="px-4 py-3 text-gray-600">{account.phone || '—'}{account.vehicleNumber && <span className="block font-mono">{account.vehicleType} · {account.vehicleNumber}</span>}</td>
            <td className="px-4 py-3 text-gray-600">{new Date(account.createdAt).toLocaleDateString()}</td>
            <td className="px-4 py-3">{account.role === 'driver' ? <div className="flex items-center gap-2"><span className="capitalize text-gray-600">{account.driverStatus || 'pending'}</span><button type="button" disabled={savingId === account.id} onClick={() => void updateDriver(account)} className={`rounded-lg px-2.5 py-1.5 font-bold text-white disabled:opacity-50 ${account.driverStatus === 'blocked' ? 'bg-green-600' : 'bg-red-600'}`}>{savingId === account.id ? 'Saving…' : account.driverStatus === 'blocked' ? 'Reactivate' : 'Block'}</button></div> : <span className="text-gray-400">Active</span>}</td>
          </tr>)}
          {!loading && !accounts.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500"><Users className="mx-auto mb-2" size={20} />No registered accounts yet.</td></tr>}
          {loading && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading accounts…</td></tr>}
        </tbody>
      </table>
    </div>
  </section>;
}
