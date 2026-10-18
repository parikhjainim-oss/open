import React, { useState } from 'react';
import { Header } from '../common/Header';
import { store } from '../../services/store';
import { Wallet, Plus, Tag, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

interface RiderWalletProps {
  onBack: () => void;
}

export const RiderWallet: React.FC<RiderWalletProps> = ({ onBack }) => {
  const [balance, setBalance] = useState(store.getState().rider.walletBalance);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState<number | null>(null);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'WELCOME_AMD' || code === 'APNU_AMD' || code === 'GUJARAT50') {
      setPromoMessage(`Coupon "${code}" active! Enjoy ₹50 bonus balance.`);
      setBalance((b) => b + 50);
      setPromoInput('');
    } else {
      setPromoMessage('Invalid coupon code. Try WELCOME_AMD or APNU_AMD.');
    }
    setTimeout(() => setPromoMessage(null), 4000);
  };

  const handleAddMoney = (amt: number) => {
    setBalance((b) => b + amt);
    setAddAmount(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA]">
      <Header title="M3 Wallet" onBack={onBack} />

      <main className="flex-1 w-full max-w-lg mx-auto pt-20 pb-8 px-4 space-y-4">
        {/* Wallet Balance Card */}
        <div className="bg-[#171717] text-white rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#FF6B00]/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>M3 RIDE PRE-PAID CASH</span>
            <span className="text-amber-400 font-bold">Ahmedabad Direct Pay</span>
          </div>

          <div>
            <span className="text-3xl font-extrabold font-['Inter'] text-white">
              ₹{balance}.00
            </span>
            <p className="text-xs text-gray-400 mt-0.5">Available for instant auto-deduct</p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            {[100, 250, 500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleAddMoney(amt)}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>+₹{amt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Linked UPI Accounts */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Linked Payment Accounts</h3>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F3FF] border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#DBE1FF] text-[#0053DB] flex items-center justify-center font-bold text-sm">
                UPI
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Google Pay / UPI</p>
                <p className="text-[11px] text-gray-500 font-mono">kotak.4829@okhdfcbank</p>
              </div>
            </div>
            <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
              Primary
            </span>
          </div>
        </div>

        {/* Coupon Promo Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <Tag className="w-4 h-4 text-[#A04100]" />
            <span>Apply Amdavad Coupon</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="e.g. WELCOME_AMD or APNU_AMD"
              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-xs outline-none uppercase font-mono tracking-wider focus:border-[#FF6B00]"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
            >
              Apply
            </button>
          </div>

          {promoMessage && (
            <p className="text-xs font-semibold text-[#A04100] bg-orange-50 p-2.5 rounded-lg border border-orange-100">
              {promoMessage}
            </p>
          )}

          <div className="pt-1 flex items-center gap-2">
            <span className="text-[10px] bg-orange-100 text-[#A04100] px-2 py-0.5 rounded font-bold font-mono">
              WELCOME_AMD
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Flat ₹20 off on your first 3 trips</span>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Wallet Activity</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-bold text-gray-900">Wallet Top-up via GPay</p>
                  <p className="text-[10px] text-gray-400">Oct 16, 2026, 11:20 AM</p>
                </div>
              </div>
              <span className="font-bold text-green-600 font-mono">+₹500.00</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-bold text-gray-900">Trip Payment: M3-R-8419</p>
                  <p className="text-[10px] text-gray-400">Yesterday, 06:44 PM</p>
                </div>
              </div>
              <span className="font-bold text-gray-900 font-mono">-₹68.00</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
