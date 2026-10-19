import React, { useState } from 'react';
import { Header } from '../common/Header';
import { store } from '../../services/store';
import { AuthUser } from '../../services/api';
import { User, Phone, Mail, MapPin, Shield, Bell, Globe, LogOut, Check } from 'lucide-react';

interface RiderProfileProps {
  onBack: () => void;
  onLogout?: () => void;
  account: AuthUser;
}

export const RiderProfile: React.FC<RiderProfileProps> = ({ onBack, onLogout, account }) => {
  const rider = store.getState().rider;
  const accountName = account.rider?.name || account.email;
  const accountPhone = account.rider?.phone;
  const [language, setLanguage] = useState<'Gujarati' | 'Hindi' | 'English'>('Gujarati');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSavePref = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA]">
      <Header title="Rider Profile" onBack={onBack} />

      <main className="flex-1 w-full max-w-lg mx-auto pt-20 pb-8 px-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
          <img
            src={rider.avatar}
            alt={accountName}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-100"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{accountName}</h2>
            <p className="text-xs text-gray-500 font-mono">{accountPhone || 'Phone number not added'}</p>
            <p className="mt-1 truncate text-xs text-gray-500">{account.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                ★ {rider.rating} Rating
              </span>
              <span className="text-[10px] text-gray-400">Verified Rider</span>
            </div>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Saved Places</h3>
          <div className="space-y-2">
            {rider.savedPlaces.map((place) => (
              <div
                key={place.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F0F3FF] border border-blue-50"
              >
                <span className="text-lg">{place.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900">{place.title}</p>
                  <p className="text-[11px] text-gray-500 truncate">{place.location.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language & Local Preferences */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <Globe className="w-4 h-4 text-[#A04100]" />
            <span>Preferred Language</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['Gujarati', 'Hindi', 'English'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  setLanguage(lang);
                  handleSavePref();
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  language === lang
                    ? 'bg-orange-50 border-[#FF6B00] text-[#A04100]'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {savedMsg && (
            <p className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Language updated to {language}
            </p>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-red-600" />
            <span>Safety Emergency Contacts</span>
          </div>
          <p className="text-xs text-gray-500">
            Contacts notified when Emergency SOS button is triggered.
          </p>
          <div className="p-3 bg-red-50 rounded-xl text-xs font-semibold text-red-900 flex justify-between items-center border border-red-100">
            <span>Ramesh Patel (Father)</span>
            <span className="font-mono">+91 98251 09214</span>
          </div>
        </div>

        {/* Logout action */}
        <button
          type="button"
          onClick={onLogout || onBack}
          className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out from M3 RIDE</span>
        </button>
      </main>
    </div>
  );
};
