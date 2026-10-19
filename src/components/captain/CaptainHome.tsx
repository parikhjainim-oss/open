import React, { useState, useEffect } from 'react';
import { Header } from '../common/Header';
import { VectorMap } from '../maps/VectorMap';
import { store } from '../../services/store';
import { Ride, CaptainProfile } from '../../types';
import {
  TrendingUp,
  ShieldCheck,
  Check,
  X,
  ThumbsUp,
  Flame,
  Radio,
  Clock,
  Compass,
  Wallet,
  User,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface CaptainHomeProps {
  onOpenTripExecution: (rideId: string) => void;
  onOpenEarnings: () => void;
  onOpenProfile: () => void;
  displayName?: string;
  displayVehicleNumber?: string;
}

export const CaptainHome: React.FC<CaptainHomeProps> = ({
  onOpenTripExecution,
  onOpenEarnings,
  onOpenProfile,
  displayName,
  displayVehicleNumber
}) => {
  const [captain, setCaptain] = useState<CaptainProfile>(() => store.getState().captains[0]);
  const [incomingRide, setIncomingRide] = useState<Ride | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Sync store state
  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      const capt = state.captains.find((c) => c.id === 'capt_karan');
      if (capt) setCaptain(capt);

      // Check if there is an unassigned ride waiting for captain
      const pendingRide = state.rides.find(
        (r) => r.status === 'SEARCHING' || r.status === 'REQUESTED'
      );
      if (pendingRide && capt?.isOnline) {
        setIncomingRide(pendingRide);
        setSecondsLeft(15);
      } else if (!pendingRide) {
        // If captain already accepted an active ride, redirect
        const activeTrip = state.rides.find(
          (r) =>
            r.captainId === 'capt_karan' &&
            ['ASSIGNED', 'CAPTAIN_ARRIVING', 'ARRIVED', 'IN_PROGRESS'].includes(r.status)
        );
        if (activeTrip) {
          onOpenTripExecution(activeTrip.id);
        }
      }
    });
    return unsubscribe;
  }, [onOpenTripExecution]);

  // Countdown timer for incoming ride request
  useEffect(() => {
    if (!incomingRide) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIncomingRide(null);
          showToast('Ride request timed out');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingRide]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleDuty = () => {
    store.toggleCaptainDuty(captain.id);
    const willBeOnline = !captain.isOnline;
    showToast(
      willBeOnline
        ? 'Captain is now ONLINE and visible on map'
        : 'Captain is OFFLINE. No incoming dispatches.'
    );
  };

  const handleAcceptRide = () => {
    if (!incomingRide) return;
    const success = store.acceptRide(incomingRide.id, captain.id);
    if (success) {
      showToast('Ride accepted! Heading to pickup spot');
      onOpenTripExecution(incomingRide.id);
    }
  };

  const handleDeclineRide = () => {
    setIncomingRide(null);
    showToast('Ride declined. Still online for jobs');
  };

  const handleSimulateNewRequest = () => {
    // Creates a sample ride for testing
    const sample = store.requestRide({
      category: 'bike',
      pickup: store.getState().rider.savedPlaces[0]?.location || {
        lat: 23.0365,
        lng: 72.5611,
        name: 'Navrangpura Post Office',
        address: 'Near Mithakhali Six Roads, Ahmedabad',
        area: 'Navrangpura'
      },
      drop: {
        lat: 23.0225,
        lng: 72.6025,
        name: 'Ahmedabad Railway Station, Kalupur',
        address: 'Main Concourse Gate No. 2, East Entry',
        area: 'Kalupur'
      },
      distanceKm: 8.4,
      durationMins: 22,
      promoCode: 'WELCOME_AMD'
    });
    setIncomingRide(sample);
    setSecondsLeft(15);
    showToast('New ride request incoming!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA] pb-24">
      {/* Header */}
      <Header
        onProfileClick={onOpenProfile}
        userPhoto={captain.photo}
      />

      <main className="flex flex-col w-full pt-20">
        {/* Dynamic Toast Feedback Banner */}
        {toastMessage && (
          <div className="fixed top-20 left-4 right-4 z-50 flex items-center justify-between p-3 rounded-xl bg-gray-900 text-white shadow-xl animate-fade-in text-xs font-semibold">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Captain Profile & Instant Status Card */}
        <section className="px-4 pt-2 pb-3 flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  className="w-13 h-13 rounded-full object-cover ring-2 ring-orange-200"
                  alt={displayName || captain.name}
                  src={captain.photo}
                />
                <span className="absolute -bottom-1 -right-1 bg-[#0053DB] text-white rounded-full p-0.5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-gray-900 truncate">{displayName || captain.name}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FFDBCC] text-[#7A3000] text-[11px] font-extrabold">
                    {captain.rating} ★
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <span className="material-symbols-outlined text-[15px]">two_wheeler</span>
                  <span className="font-bold uppercase tracking-wider">{displayVehicleNumber || captain.vehicleNumber}</span>
                </div>
              </div>
            </div>

            {/* Online / Offline Switch Component */}
            <button
              type="button"
              onClick={handleToggleDuty}
              className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-[#F0F3FF] shadow-sm hover:bg-[#E7EEFE] transition-all border border-blue-100"
            >
              <div className="relative flex items-center justify-center">
                {captain.isOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#0053DB] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0053DB]"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-400"></span>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-gray-900 tracking-wide">
                  {captain.isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
                <span className="text-[10px] text-gray-500 -mt-1 font-medium">
                  {captain.isOnline ? 'Duty Active' : 'Duty Paused'}
                </span>
              </div>
            </button>
          </div>

          {/* Quick Earning Banner */}
          <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
                  Today&apos;s Net Earnings
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gray-900 font-['Inter']">
                    ₹{captain.todayEarnings}.00
                  </span>
                  <span className="text-xs font-bold text-green-600 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +22%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-gray-900 font-['Inter']">
                    {captain.todayTrips}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Trips</span>
                </div>
                <div className="h-7 w-px bg-gray-200"></div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-gray-900 font-['Inter']">
                    {captain.onlineHours}h
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Online</span>
                </div>
              </div>
            </div>

            {/* Zero-Commission Subscription Status Pill */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0F3FF] border border-blue-100">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-5 h-5 text-[#FF6B00] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-900 truncate">
                    {captain.subscription.planName}
                  </span>
                  <span className="text-[11px] text-gray-500 truncate">
                    Zero Commission • 100% Ride Fares Kept
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubscriptionModal(true)}
                className="px-2.5 py-1 rounded-full bg-[#FFDBCC] text-[#7A3000] text-xs font-bold shrink-0 hover:bg-[#ffb693] transition-colors"
              >
                Renewed
              </button>
            </div>
          </div>
        </section>

        {/* Ahmedabad Live Demand Surge Viewport */}
        <section className="px-4 py-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#A04100]" />
              <h2 className="text-sm font-bold text-gray-900">Ahmedabad Live Demand Surge</h2>
            </div>
            <span className="text-[10px] font-semibold text-[#A04100] px-2 py-0.5 rounded-full bg-[#FFDBCC]">
              Updated 30s ago
            </span>
          </div>

          <VectorMap mode="surge" height="h-72" />
        </section>

        {/* Incoming High-Priority Ride Request Modal Sheet */}
        {incomingRide ? (
          <section className="px-4 pt-3 pb-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-white shadow-2xl border-2 border-[#FF6B00] flex flex-col gap-3.5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF6B00]"></div>

              {/* Timer & Category Header */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  {/* Circular Countdown Timer */}
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-[#FF6B00] transition-all duration-1000 ease-linear"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${(secondsLeft / 15) * 100}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-gray-900 font-mono">
                      {secondsLeft}s
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900">M3 Bike Taxi</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#FFDBCC] text-[#7A3000] text-[10px] font-extrabold">
                        +₹15 Bonus
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <span className="material-symbols-outlined text-[13px]">bolt</span>
                      <span>High Priority Surge Pickup</span>
                    </div>
                  </div>
                </div>

                {/* Net Earning Display */}
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-[#A04100] font-['Inter']">
                    ₹{incomingRide.fare.totalFare}.00
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Net to Captain</span>
                </div>
              </div>

              {/* Rider Info Badge */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0F3FF] border border-blue-100">
                <div className="flex items-center gap-2">
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    alt={incomingRide.riderName}
                    src={incomingRide.riderAvatar}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">{incomingRide.riderName}</span>
                    <span className="text-[10px] text-gray-500">
                      ★ {incomingRide.riderRating} Rating (42 Trips)
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-gray-800 text-[10px] font-bold border border-gray-200">
                  ⚡ {incomingRide.paymentMethod}
                </span>
              </div>

              {/* Route Trajectory Card */}
              <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                {/* Pickup */}
                <div className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center mt-1">
                    <span className="w-3 h-3 rounded-full bg-[#0053DB] ring-2 ring-blue-100"></span>
                    <span className="w-0.5 h-6 bg-gray-300 my-0.5"></span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-[#0053DB] uppercase">Pickup</span>
                      <span className="text-[10px] text-gray-500 font-semibold">0.8 km away • 3 min</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {incomingRide.pickup.name}
                    </span>
                    <span className="text-[11px] text-gray-500 truncate">{incomingRide.pickup.address}</span>
                  </div>
                </div>

                {/* Drop */}
                <div className="flex items-start gap-2.5">
                  <span className="w-3 h-3 rounded-sm bg-[#FF6B00] mt-1 shrink-0"></span>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-[#FF6B00] uppercase">Drop</span>
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {incomingRide.distanceKm} km • {incomingRide.durationMins} min trip
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {incomingRide.drop.name}
                    </span>
                    <span className="text-[11px] text-gray-500 truncate">{incomingRide.drop.address}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Decline & Accept */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDeclineRide}
                  className="col-span-2 h-13 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Decline</span>
                </button>

                <button
                  type="button"
                  onClick={handleAcceptRide}
                  className="col-span-3 h-13 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 active:scale-98 transition-all tracking-wider"
                >
                  <ThumbsUp className="w-5 h-5 fill-white" />
                  <span>ACCEPT RIDE</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          /* Empty radar state waiting for rides */
          <section className="px-4 py-8 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#E7EEFE] flex items-center justify-center text-[#A04100] shadow-inner mb-1">
              <Radio className="w-8 h-8 text-[#FF6B00] animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {captain.isOnline ? 'Searching for Nearby Ahmedabad Rides...' : 'You are currently Offline'}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs">
              {captain.isOnline
                ? 'Stay near SG Highway, Vastrapur, or Navrangpura for quickest allocation.'
                : 'Turn duty Online above to start receiving ride dispatches.'}
            </p>

            {captain.isOnline && (
              <button
                type="button"
                onClick={handleSimulateNewRequest}
                className="mt-3 px-4 py-2 rounded-xl bg-orange-50 border border-[#FF6B00] text-[#A04100] font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Simulate Sample Ride Dispatch</span>
              </button>
            )}
          </section>
        )}
      </main>

      {/* Subscription Plans Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Zero-Commission Passes</h3>
                <p className="text-xs text-gray-500">Keep 100% of rider fares in Ahmedabad</p>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {store.getState().plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    captain.subscription.planId === plan.id
                      ? 'border-[#FF6B00] bg-orange-50/50 ring-1 ring-[#FF6B00]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{plan.name}</h4>
                      <p className="text-xs text-gray-500">{plan.durationText} validity</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-gray-900 font-['Inter']">
                        ₹{plan.price}
                      </span>
                      {plan.popular && (
                        <span className="block text-[9px] bg-[#FF6B00] text-white font-extrabold px-1.5 py-0.2 rounded mt-0.5">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="mt-2 space-y-1 text-xs text-gray-600">
                    {plan.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      store.renewSubscription(captain.id, plan.id);
                      showToast(`Renewed ${plan.name} successfully!`);
                      setShowSubscriptionModal(false);
                    }}
                    className="w-full mt-3 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all"
                  >
                    Activate / Renew for ₹{plan.price}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Captain Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 w-16 text-[#A04100] font-bold transition-colors"
          >
            <Compass className="w-6 h-6 text-[#A04100]" />
            <span className="text-[10px]">Duty</span>
          </button>

          <button
            type="button"
            onClick={onOpenEarnings}
            className="flex flex-col items-center justify-center gap-1 w-16 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Wallet className="w-6 h-6 text-gray-500" />
            <span className="text-[10px]">Earnings</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="flex flex-col items-center justify-center gap-1 w-16 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <User className="w-6 h-6 text-gray-500" />
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
