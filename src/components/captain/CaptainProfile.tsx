import { Header } from '../common/Header';
import { AuthUser } from '../../services/api';
import { Bike, LogOut, Mail, Phone, UserRound } from 'lucide-react';
import { AccountSettings } from '../common/AccountSettings';
import { store } from '../../services/store';

interface CaptainProfileProps {
  onBack: () => void;
  onLogout: () => void;
  account: AuthUser;
  onAccountUpdated: (account: AuthUser) => void;
}

export const CaptainProfile = ({ onBack, onLogout, account, onAccountUpdated }: CaptainProfileProps) => {
  const driver = account.driver;
  const name = driver?.name || 'Driver';
  const captainStats = store.getState().captains.find((captain) => captain.email.toLowerCase() === account.email.toLowerCase());

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <Header title="My Driver Profile" onBack={onBack} />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-4 px-4 pb-8 pt-20">
        <section className="flex items-center gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-[#A04100]">{account.photo ? <img src={account.photo} alt="Driver profile" className="h-full w-full object-cover" /> : <UserRound size={30} />}</div>
          <div className="min-w-0"><h2 className="truncate text-lg font-bold text-gray-900">{name}</h2><p className="text-xs capitalize text-gray-500">Driver · {driver?.status || 'pending verification'}</p></div>
        </section>
        <section className="grid grid-cols-3 divide-x rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm"><div><p className="text-xl font-extrabold text-gray-900">{captainStats?.rating.toFixed(1) || '—'}</p><p className="text-[10px] font-semibold uppercase text-gray-500">Rating</p></div><div><p className="text-xl font-extrabold text-gray-900">{captainStats?.totalTrips || 0}</p><p className="text-[10px] font-semibold uppercase text-gray-500">Trips</p></div><div><p className="text-sm font-extrabold text-gray-900">{driver?.status || 'Pending'}</p><p className="text-[10px] font-semibold uppercase text-gray-500">Verification</p></div></section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h3 className="text-sm font-bold text-gray-900">M3 Driver ID</h3><p className="mt-1 font-mono text-sm text-gray-700">M3-D-{account.id.slice(0, 8).toUpperCase()}</p><p className="mt-2 text-xs text-gray-500">Keep your profile and vehicle documents current for verification.</p></section>
        <AccountSettings account={account} onUpdate={onAccountUpdated} />
        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900">Account details</h3>
          <div className="flex items-center gap-3 text-sm"><Mail size={17} className="text-[#A04100]" /><span className="break-all text-gray-700">{account.email}</span></div>
          <div className="flex items-center gap-3 text-sm"><Phone size={17} className="text-[#A04100]" /><span className="text-gray-700">{driver?.phone || 'Phone number not added'}</span></div>
          <div className="flex items-center gap-3 text-sm"><Bike size={17} className="text-[#A04100]" /><span className="capitalize text-gray-700">{driver?.vehicleType || 'Vehicle type not added'} · {driver?.vehicleNumber || 'Vehicle number not added'}</span></div>
        </section>
        <button type="button" onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200"><LogOut size={16} />Sign out</button>
      </main>
    </div>
  );
};
