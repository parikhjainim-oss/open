import { Header } from '../common/Header';
import { AuthUser } from '../../services/api';
import { LogOut, Mail, Phone, UserRound } from 'lucide-react';
import { AccountSettings } from '../common/AccountSettings';

interface RiderProfileProps {
  onBack: () => void;
  onLogout: () => void;
  account: AuthUser;
  onAccountUpdated: (account: AuthUser) => void;
}

export const RiderProfile = ({ onBack, onLogout, account, onAccountUpdated }: RiderProfileProps) => {
  const name = account.rider?.name || 'Rider';
  const phone = account.rider?.phone;

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <Header title="My Profile" onBack={onBack} />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-4 px-4 pb-8 pt-20">
        <section className="flex items-center gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-[#A04100]">{account.photo ? <img src={account.photo} alt="Profile" className="h-full w-full object-cover" /> : <UserRound size={30} />}</div>
          <div className="min-w-0"><h2 className="truncate text-lg font-bold text-gray-900">{name}</h2><p className="text-xs text-gray-500">Rider account</p></div>
        </section>
        <AccountSettings account={account} onUpdate={onAccountUpdated} />
        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900">Account details</h3>
          <div className="flex items-center gap-3 text-sm"><Mail size={17} className="text-[#A04100]" /><span className="break-all text-gray-700">{account.email}</span></div>
          <div className="flex items-center gap-3 text-sm"><Phone size={17} className="text-[#A04100]" /><span className="text-gray-700">{phone || 'Phone number not added'}</span></div>
        </section>
        <section className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#A04100]">M3 Pro</p><h3 className="mt-1 text-base font-extrabold text-gray-900">A smoother Ahmedabad ride</h3></div><span className="rounded-full bg-[#FF6B00] px-2.5 py-1 text-[10px] font-bold text-white">Premium</span></div>
          <p className="mt-2 text-xs leading-5 text-gray-600">Priority dispatch, comfortable cab choices, and intercity trip planning. Select Pro or Travel when choosing a service.</p>
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h3 className="text-sm font-bold text-gray-900">About M3 RIDE</h3><p className="mt-2 text-xs leading-5 text-gray-600">M3 RIDE is an Ahmedabad-first mobility demo for local rides, parcel delivery, and travel across Gujarat. Ride requests and account data in this version are stored locally in this browser.</p><p className="mt-2 text-[11px] font-semibold text-[#A04100]">#MadeForAhmedabad · Ahmedabad, Gujarat</p></section>
        <button type="button" onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200"><LogOut size={16} />Sign out</button>
      </main>
    </div>
  );
};
