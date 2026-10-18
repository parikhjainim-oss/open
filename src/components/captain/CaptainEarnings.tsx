import React, { useState } from 'react';
import { Header } from '../common/Header';
import { store } from '../../services/store';
import { TrendingUp, ShieldCheck, ArrowDownRight, Wallet, Check, Download } from 'lucide-react';

interface CaptainEarningsProps {
  onBack: () => void;
}

export const CaptainEarnings: React.FC<CaptainEarningsProps> = ({ onBack }) => {
  const captain = store.getState().captains[0];
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const handleInstantPayout = () => {
    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 4000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA]">
      <Header title="Captain Earnings" onBack={onBack} userPhoto={captain.photo} />

      <main className="flex-1 w-full max-w-lg mx-auto pt-20 pb-8 px-4 space-y-4">
        {/* Net Today Card */}
        <div className="bg-[#171717] text-white rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
            <span>TODAY&apos;S NET EARNINGS</span>
            <span className="text-[#FF6B00]">100% Ride Fares Kept</span>
          </div>

          <div>
            <span className="text-4xl font-extrabold font-['Inter'] text-white">
              ₹{captain.todayEarnings}.00
            </span>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              <span>{captain.todayTrips} trips today</span>
              <span>•</span>
              <span>{captain.onlineHours} hours online</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstantPayout}
            className="w-full py-3 bg-[#FF6B00] hover:bg-[#E05E00] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-98 transition-all"
          >
            <Wallet className="w-4 h-4 text-white" />
            <span>Instant UPI Payout to Bank</span>
          </button>

          {payoutSuccess && (
            <div className="p-2.5 bg-green-900/60 rounded-xl text-green-300 text-xs font-semibold flex items-center gap-2 border border-green-700 animate-fade-in">
              <Check className="w-4 h-4" />
              <span>₹{captain.todayEarnings}.00 dispatched to UPI: 9825017842@okhdfcbank</span>
            </div>
          )}
        </div>

        {/* Zero Commission Plan Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="text-sm font-bold text-gray-900">{captain.subscription.planName}</h3>
            </div>
            <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Valid until {captain.subscription.expiryDate}. No platform commission is deducted from your trips.
          </p>
        </div>

        {/* Weekly & Monthly Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase">This Week</span>
            <p className="text-xl font-black text-gray-900 font-['Inter']">₹6,420.00</p>
            <span className="text-[10px] text-green-600 font-bold">54 Completed Trips</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase">This Month</span>
            <p className="text-xl font-black text-gray-900 font-['Inter']">₹28,840.00</p>
            <span className="text-[10px] text-green-600 font-bold">248 Completed Trips</span>
          </div>
        </div>

        {/* Trip-by-Trip Breakdown */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Recent Completed Trips</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Swastik Cross Rd → Kalupur Stn</p>
                <p className="text-[10px] text-gray-400">8.4 km • Bike Taxi • 22 mins</p>
              </div>
              <span className="font-bold text-gray-900 font-mono text-sm">+₹68.00</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">SG Highway → Vastrapur Lake</p>
                <p className="text-[10px] text-gray-400">4.1 km • Bike Taxi • 12 mins</p>
              </div>
              <span className="font-bold text-gray-900 font-mono text-sm">+₹42.00</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-bold text-gray-900">Law Garden → Navrangpura Bus Stand</p>
                <p className="text-[10px] text-gray-400">3.2 km • Bike Taxi • 10 mins</p>
              </div>
              <span className="font-bold text-gray-900 font-mono text-sm">+₹35.00</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
