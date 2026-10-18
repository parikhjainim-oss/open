import React, { useState, useEffect } from 'react';
import { Header } from '../common/Header';
import { VectorMap } from '../maps/VectorMap';
import { store } from '../../services/store';
import { Ride } from '../../types';
import {
  Navigation,
  Phone,
  MessageSquare,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  KeyRound,
  RotateCcw
} from 'lucide-react';

interface CaptainActiveTripProps {
  rideId: string;
  onTripCompleted: () => void;
  onBack: () => void;
}

export const CaptainActiveTrip: React.FC<CaptainActiveTripProps> = ({
  rideId,
  onTripCompleted,
  onBack
}) => {
  const [ride, setRide] = useState<Ride | null>(() => {
    return store.getState().rides.find((r) => r.id === rideId) || null;
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [tripFinished, setTripFinished] = useState(false);

  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      const updated = state.rides.find((r) => r.id === rideId);
      if (updated) {
        setRide(updated);
        if (updated.status === 'COMPLETED') {
          setTripFinished(true);
        }
      }
    });
    return unsubscribe;
  }, [rideId]);

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <p className="text-sm text-gray-500 mb-4">Trip not active or cancelled.</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl font-bold">
          Back to Duty
        </button>
      </div>
    );
  }

  const handleMarkArrived = () => {
    store.captainArrived(ride.id);
  };

  const handleVerifyPinAndStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim().length !== 4) {
      setPinError('Please enter the full 4-digit PIN provided by passenger.');
      return;
    }

    const res = store.startRideWithPin(ride.id, pinInput.trim());
    if (!res.success) {
      setPinError(res.error || 'Invalid PIN code');
    } else {
      setPinError(null);
    }
  };

  const handleCompleteTrip = () => {
    store.completeRide(ride.id);
    setTripFinished(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA]">
      <Header
        title={tripFinished ? 'Trip Completed' : 'Active Ride Navigation'}
        onBack={tripFinished ? onTripCompleted : onBack}
        userPhoto={store.getState().captains[0].photo}
        activeRideId={ride.id}
      />

      <main className="flex flex-col w-full pt-20">
        <VectorMap
          mode="route"
          height="h-72"
          etaText={
            ride.status === 'IN_PROGRESS'
              ? '8.4 km • 22 mins to Kalupur Rly Station'
              : '0.8 km • 3 mins to Navrangpura Pickup'
          }
          trafficStatus="Relief Rd Flowing"
        />

        <div className="relative bg-white rounded-t-[28px] -mt-6 shadow-2xl px-4 pt-3 pb-8 flex flex-col gap-3.5 z-20">
          <div className="w-12 h-1 rounded-full bg-gray-200 self-center mb-1"></div>

          {/* Passenger Info Card */}
          <div className="bg-[#F0F3FF] p-3.5 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={ride.riderAvatar}
                alt={ride.riderName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-200"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-900">{ride.riderName}</span>
                  <span className="text-[10px] bg-white px-1.5 py-0.2 rounded font-bold text-gray-800 border">
                    ★ {ride.riderRating}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-mono">{ride.riderPhone}</span>
                <span className="block text-[10px] text-[#A04100] font-bold">
                  {ride.paymentMethod} • Net: ₹{ride.fare.totalFare}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${ride.riderPhone}`}
                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#A04100] shadow-sm border border-gray-200 hover:bg-gray-50"
              >
                <Phone className="w-4 h-4 text-[#A04100]" />
              </a>
            </div>
          </div>

          {/* Location Milestone */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-start gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#0053DB] mt-1 shrink-0"></span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Pickup</span>
                <p className="text-xs font-bold text-gray-900 truncate">{ride.pickup.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{ride.pickup.address}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-2 flex items-start gap-2.5">
              <span className="w-3 h-3 rounded-sm bg-[#FF6B00] mt-1 shrink-0"></span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Drop</span>
                <p className="text-xs font-bold text-gray-900 truncate">{ride.drop.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{ride.drop.address}</p>
              </div>
            </div>
          </div>

          {/* STEP CONTROLS BASED ON LIFECYCLE */}
          {ride.status === 'CAPTAIN_ARRIVING' && (
            <div className="space-y-2 pt-1">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-2 text-xs text-blue-900">
                <Navigation className="w-4 h-4 text-[#0053DB] shrink-0" />
                <span>Follow GPS directions to Navrangpura Post Office curb.</span>
              </div>

              <button
                type="button"
                onClick={handleMarkArrived}
                className="w-full h-13 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 active:scale-98 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>I HAVE ARRIVED AT PICKUP SPOT</span>
              </button>
            </div>
          )}

          {ride.status === 'ARRIVED' && (
            <form onSubmit={handleVerifyPinAndStart} className="space-y-3 pt-1">
              <div className="p-3.5 bg-orange-50 rounded-xl border border-[#FF6B00]/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <KeyRound className="w-4 h-4 text-[#A04100]" />
                  <span>Enter Passenger Start Ride PIN</span>
                </div>
                <p className="text-[11px] text-gray-600">
                  Ask passenger {ride.riderName} for the 4-digit PIN displayed on their app (Tip: &quot;{ride.pin}&quot;).
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-digit PIN"
                    className="w-full text-center text-xl font-black tracking-widest font-mono py-2 rounded-xl border border-gray-300 outline-none focus:border-[#FF6B00] bg-white text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setPinInput(ride.pin)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-xl shrink-0"
                  >
                    Auto-Fill ({ride.pin})
                  </button>
                </div>

                {pinError && (
                  <p className="text-xs text-red-600 font-bold">{pinError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-13 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-98 transition-all tracking-wider"
              >
                <span>VERIFY PIN & START RIDE</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {ride.status === 'IN_PROGRESS' && (
            <div className="space-y-3 pt-1">
              <div className="p-3.5 bg-green-50 rounded-xl border border-green-200 text-xs text-green-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">Trip in Progress</span>
                  <p className="text-[11px] text-green-700">Driving to Ahmedabad Railway Station Kalupur</p>
                </div>
                <span className="text-xs font-mono font-bold">8.4 km left</span>
              </div>

              <button
                type="button"
                onClick={handleCompleteTrip}
                className="w-full h-13 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-98 transition-all tracking-wide"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>COMPLETE TRIP & COLLECT ₹{ride.fare.totalFare}</span>
              </button>
            </div>
          )}

          {tripFinished && (
            <div className="space-y-3 pt-1">
              <div className="p-4 bg-green-50 rounded-2xl border border-green-200 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">Trip Completed Successfully!</h3>
                <p className="text-xs text-gray-600">
                  ₹{ride.fare.totalFare}.00 has been credited 100% to your daily earnings.
                </p>
              </div>

              <button
                type="button"
                onClick={onTripCompleted}
                className="w-full h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-sm shadow-md active:scale-98 transition-all"
              >
                Back to Online Duty
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
