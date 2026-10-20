import React, { useState } from 'react';
import { Header } from '../common/Header';
import { VectorMap } from '../maps/VectorMap';
import { LocationPoint, RideServiceType, VehicleCategory } from '../../types';
import { store } from '../../services/store';
import { Verified, Receipt, ChevronDown, ArrowRight, Check, ShieldCheck, Wallet, Sparkles } from 'lucide-react';

interface VehicleSelectProps {
  pickup: LocationPoint;
  drop: LocationPoint;
  serviceType?: RideServiceType;
  serviceDetails?: string;
  onBack: () => void;
  onConfirmBooking: (category: VehicleCategory, paymentMethod: 'Google Pay / UPI' | 'Cash' | 'M3 Wallet', distanceKm: number, durationMins: number) => void;
}

export const VehicleSelect: React.FC<VehicleSelectProps> = ({
  pickup,
  drop,
  serviceType = 'city',
  serviceDetails,
  onBack,
  onConfirmBooking
}) => {
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('bike');
  const [paymentMethod, setPaymentMethod] = useState<'Google Pay / UPI' | 'Cash' | 'M3 Wallet'>('Google Pay / UPI');
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState('WELCOME_AMD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const radians = (degrees: number) => degrees * Math.PI / 180;
  const deltaLat = radians(drop.lat - pickup.lat);
  const deltaLng = radians(drop.lng - pickup.lng);
  const haversine = Math.sin(deltaLat / 2) ** 2 + Math.cos(radians(pickup.lat)) * Math.cos(radians(drop.lat)) * Math.sin(deltaLng / 2) ** 2;
  const distanceKm = Math.max(1, Math.round(6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)) * 1.25 * 10) / 10);
  const durationMins = Math.max(8, Math.round(distanceKm / (distanceKm > 35 ? 42 : 22) * 60 + 5));

  const pricing = store.getState().pricing;

  const fareBike = store.calculateFare('bike', distanceKm, durationMins, appliedPromo);
  const fareAuto = store.calculateFare('auto', distanceKm, durationMins, appliedPromo);
  const fareCab = store.calculateFare('cab', distanceKm, durationMins, appliedPromo);

  const currentFare =
    selectedCategory === 'bike'
      ? fareBike
      : selectedCategory === 'auto'
      ? fareAuto
      : fareCab;

  const handleBooking = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmBooking(selectedCategory, paymentMethod, distanceKm, durationMins);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA]">
      <Header
        title="Vehicle Select"
        onBack={onBack}
        userPhoto={store.getState().rider.avatar}
      />

      <main className="flex flex-col w-full pt-20">
        {/* Map Route Canvas */}
        <VectorMap
          mode="route"
          height="h-72"
          etaText={`${distanceKm} km · ${durationMins} mins estimated`}
          trafficStatus="Moderate Traffic"
        />

        {/* Bottom Sheet: Interactive Selection Surface */}
        <div className="relative w-full bg-white rounded-t-[28px] shadow-[0px_8px_24px_-4px_rgba(23,23,23,0.12)] -mt-6 pt-3 pb-safe px-4 flex flex-col gap-3.5 z-20">
          {/* Sheet Handle */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1"></div>

          {/* Sheet Header & Curated Ahmedabad Pickup Guidance */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div><h2 className="text-lg font-bold text-gray-900">{serviceType === 'parcel' ? 'Choose a delivery ride' : serviceType === 'travel' ? 'Choose your intercity ride' : serviceType === 'pro' ? 'Choose an M3 Pro ride' : 'Choose a ride'}</h2>{serviceDetails && <p className="mt-0.5 text-xs text-gray-500">Parcel: {serviceDetails}</p>}</div>
              <span className="bg-[#F0F3FF] text-gray-700 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold border border-blue-100">
                <Verified className="w-3.5 h-3.5 text-[#0053DB]" /> Verified Captains
              </span>
            </div>

            {/* Contextual Curb Assist */}
            <div className="bg-[#F0F3FF] p-2.5 rounded-xl flex items-center gap-2.5 border border-blue-100/60">
              <div className="w-7 h-7 rounded-full bg-[#FFDBCC] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#A04100] text-[16px]">near_me</span>
              </div>
              <p className="text-xs text-gray-600 min-w-0 flex-1 truncate">
                <strong className="text-gray-900">Pickup Spot:</strong> {pickup.name} ({pickup.landmark || pickup.address})
              </p>
            </div>
            <a href={`https://www.google.com/maps/dir/?api=1&origin=${pickup.lat},${pickup.lng}&destination=${drop.lat},${drop.lng}&travelmode=driving`} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-[#0053DB] hover:bg-blue-50">View live route in Google Maps <ArrowRight size={14} /></a>
          </div>

          {/* Ride Options Selection Roster */}
          <div className="flex flex-col gap-2.5">
            {/* Option 1: M3 Bike */}
            <div
              onClick={() => setSelectedCategory('bike')}
              className={`cursor-pointer relative rounded-xl p-3.5 flex items-center justify-between transition-all duration-200 border ${
                selectedCategory === 'bike'
                  ? 'bg-[#FFDBCC]/30 border-[#FF6B00] shadow-[0px_2px_12px_rgba(255,107,0,0.14)] ring-1 ring-[#FF6B00]'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#FF6B00] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                <Sparkles className="w-3 h-3 fill-white" /> FASTEST
              </span>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-13 h-13 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-gray-100">
                  <span className="material-symbols-outlined text-[#FF6B00] text-[34px]">
                    two_wheeler
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-gray-900">M3 Bike</span>
                    <span className="bg-[#E7EEFE] text-gray-800 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                      1 seat
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">Fastest solo commute • Drop 10:14 AM</p>
                  <p className="text-xs text-[#0053DB] font-semibold flex items-center gap-0.5 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">near_me</span> 2 mins away
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 pl-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs line-through text-gray-400">₹85</span>
                  <span className="text-2xl font-black text-gray-900 font-['Inter']">
                    ₹{fareBike.totalFare}
                  </span>
                </div>
                <span className="text-[10px] text-[#A04100] font-bold bg-[#FFDBCC] px-1.5 py-0.5 rounded-full mt-0.5">
                  20% OFF
                </span>
              </div>
            </div>

            {/* Option 2: M3 Auto */}
            <div
              onClick={() => setSelectedCategory('auto')}
              className={`cursor-pointer relative rounded-xl p-3.5 flex items-center justify-between transition-all duration-200 border ${
                selectedCategory === 'auto'
                  ? 'bg-[#FFDBCC]/30 border-[#FF6B00] shadow-[0px_2px_12px_rgba(255,107,0,0.14)] ring-1 ring-[#FF6B00]'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-13 h-13 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-gray-900 text-[34px]">
                    electric_rickshaw
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-gray-900">M3 Auto</span>
                    <span className="bg-[#E7EEFE] text-gray-800 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                      3 seats
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">Covered & breeze-friendly • Drop 10:20 AM</p>
                  <p className="text-xs text-gray-500 font-semibold flex items-center gap-0.5 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">near_me</span> 4 mins away
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="text-2xl font-black text-gray-900 font-['Inter']">
                  ₹{fareAuto.totalFare}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">Standard</span>
              </div>
            </div>

            {/* Option 3: M3 Cab Economy */}
            <div
              onClick={() => setSelectedCategory('cab')}
              className={`cursor-pointer relative rounded-xl p-3.5 flex items-center justify-between transition-all duration-200 border ${
                selectedCategory === 'cab'
                  ? 'bg-[#FFDBCC]/30 border-[#FF6B00] shadow-[0px_2px_12px_rgba(255,107,0,0.14)] ring-1 ring-[#FF6B00]'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-13 h-13 rounded-xl bg-[#DBE1FF] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#0053DB] text-[34px]">
                    local_taxi
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-gray-900">M3 Prime Cab</span>
                    <span className="bg-[#E7EEFE] text-gray-800 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                      4 seats
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">AC Sedan, zero surge • Drop 10:24 AM</p>
                  <p className="text-xs text-gray-500 font-semibold flex items-center gap-0.5 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">near_me</span> 6 mins away
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="text-2xl font-black text-gray-900 font-['Inter']">
                  ₹{fareCab.totalFare}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">AC Comfort</span>
              </div>
            </div>
          </div>

          {/* Transparent Fare Breakdown Component */}
          <div className="bg-[#F0F3FF] rounded-xl p-3.5 flex flex-col gap-2 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#A04100]" />
                <span className="text-xs font-bold text-gray-900">Transparent Fare Breakdown</span>
              </div>
              <span className="bg-white text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                Zero Surge Lock
              </span>
            </div>

            <div className="flex flex-col gap-1 text-xs pt-1 border-t border-blue-100/60">
              <div className="flex justify-between items-center text-gray-500">
                <span>Base Minimum Fare</span>
                <span className="text-gray-900 font-semibold">₹{currentFare.baseFare}.00</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Distance ({distanceKm} km @ ₹{pricing[selectedCategory].perKmRate}/km)</span>
                <span className="text-gray-900 font-semibold">₹{currentFare.distanceFare}.00</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span className="flex items-center gap-1">Platform & Road Safety Levy</span>
                <span className="text-gray-900 font-semibold">₹{currentFare.platformLevy}.00</span>
              </div>
              {currentFare.discount > 0 && (
                <div className="flex justify-between items-center text-[#A04100] font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">local_offer</span>
                    Amdavad Promo ({currentFare.promoCode})
                  </span>
                  <span>-₹{currentFare.discount}.00</span>
                </div>
              )}
            </div>

            {/* Total Row */}
            <div className="bg-white p-2.5 rounded-lg flex items-center justify-between mt-1 border border-blue-100">
              <div>
                <p className="text-xs font-bold text-gray-900">Total Payable</p>
                <p className="text-[10px] text-gray-500">Guaranteed price upfront</p>
              </div>
              <span className="text-2xl font-extrabold text-gray-900 font-['Inter']">
                ₹{currentFare.totalFare}
              </span>
            </div>
          </div>

          {/* Payment Instrument Selector */}
          <div className="relative">
            <div
              onClick={() => setShowPaymentPicker(!showPaymentPicker)}
              className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#F0F3FF] flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-[#0053DB]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 truncate">{paymentMethod}</span>
                    <span className="bg-[#DBE1FF] text-[#00174B] text-[9px] px-1 rounded font-bold">
                      Linked
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 truncate">
                    {paymentMethod === 'Google Pay / UPI'
                      ? 'kotak.4829@okhdfcbank'
                      : paymentMethod === 'M3 Wallet'
                      ? 'Balance: ₹340.00'
                      : 'Pay cash directly to driver'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-gray-900">
                <span className="text-[11px] font-bold text-[#A04100]">CHANGE</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>

            {showPaymentPicker && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-30 space-y-1">
                {(['Google Pay / UPI', 'Cash', 'M3 Wallet'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method);
                      setShowPaymentPicker(false);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left text-xs font-bold flex items-center justify-between transition-colors ${
                      paymentMethod === method ? 'bg-orange-50 text-[#A04100]' : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <span>{method}</span>
                    {paymentMethod === method && <Check className="w-4 h-4 text-[#A04100]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Booking CTA Button */}
          <div className="pt-1 pb-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleBooking}
              className="w-full min-h-[52px] bg-[#FF6B00] hover:bg-[#E05E00] active:scale-[0.98] text-white rounded-xl font-bold flex items-center justify-between px-5 shadow-[0px_4px_16px_rgba(255,107,0,0.35)] transition-all disabled:opacity-75"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">
                  {selectedCategory === 'bike' ? 'two_wheeler' : selectedCategory === 'auto' ? 'electric_rickshaw' : 'local_taxi'}
                </span>
                <span>
                  {isSubmitting
                    ? 'Confirming with Ahmedabad Fleet...'
                    : `Book ${pricing[selectedCategory].name} • ₹${currentFare.totalFare}`}
                </span>
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-[11px] text-gray-500 mt-2 font-medium">
              Instant driver confirmation & OTP security verification
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
