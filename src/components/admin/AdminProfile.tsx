import { LogOut, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import type { AuthUser } from '../../services/api';
import { AccountSettings } from '../common/AccountSettings';

interface AdminProfileProps {
  email: string;
  name?: string;
  phone?: string | null;
  adminRole?: string;
  accountId: string;
  account?: AuthUser;
  onAccountUpdated?: (account: AuthUser) => void;
  onLogout: () => void;
}

export function AdminProfile({ email, name, phone, adminRole, accountId, account, onAccountUpdated, onLogout }: AdminProfileProps) {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-[#A04100]">{account?.photo ? <img src={account.photo} alt="Administrator profile" className="h-full w-full object-cover" /> : <UserRound size={30} />}</div>
          <div><h2 className="text-lg font-bold text-gray-900">{name || 'Administrator'}</h2><p className="text-sm text-gray-500">Administrator profile</p></div>
        </div>
        <dl className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 p-4"><Mail size={17} className="text-[#A04100]" /><div><dt className="text-[10px] font-bold uppercase text-gray-400">Email</dt><dd className="break-all text-sm font-semibold text-gray-800">{email}</dd></div></div>
          <div className="flex items-center gap-3 p-4"><Phone size={17} className="text-[#A04100]" /><div><dt className="text-[10px] font-bold uppercase text-gray-400">Phone</dt><dd className="text-sm font-semibold text-gray-800">{phone || 'Not provided'}</dd></div></div>
          <div className="flex items-center gap-3 p-4"><ShieldCheck size={17} className="text-[#A04100]" /><div><dt className="text-[10px] font-bold uppercase text-gray-400">Account type</dt><dd className="text-sm font-semibold capitalize text-gray-800">{(adminRole || 'operations_manager').replaceAll('_', ' ')}</dd></div></div>
          <div className="p-4"><dt className="text-[10px] font-bold uppercase text-gray-400">Account ID</dt><dd className="mt-1 break-all font-mono text-xs text-gray-600">{accountId}</dd></div>
        </dl>
      </div>
      {account && onAccountUpdated && <AccountSettings account={account} onUpdate={onAccountUpdated} />}
      <button type="button" onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white hover:bg-gray-800"><LogOut size={16} />Sign out and return to login</button>
    </section>
  );
}
