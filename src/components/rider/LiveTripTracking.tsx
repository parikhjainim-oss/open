import React, { useState, useEffect } from 'react';
import { Header } from '../common/Header';
import { VectorMap } from '../maps/VectorMap';
import { Ride } from '../../types';
import { store } from '../../services/store';
import {
  Phone,
  MessageSquare,
  Shield,
  XCircle,
  Share2,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface LiveTripTrackingProps {
  rideId: string;
  onBack: () => void;
  onTripCompleted: (ride: Ride) => void;
}

export const LiveTripTracking: React.FC<LiveTripTrackingProps> = ({
  rideId,
  onBack,
  onTripCompleted
}) => {
  const [ride, setRide] = useState<Ride | null>(() => {
    return store.getState().rides.find((r) => r.id === rideId) || null;
  });
  const [chatMessageSent, setChatMessageSent] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [simulatedEta, setSimulatedEta] = useState('3 mins (0.8 km away)');

  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      const updated = state.rides.find((r) => r.id === rideId);
      if (updated) {
        setRide(updated);
        if (updated.status === 'COMPLETED') {
          onTripCompleted(updated);
        }
      }
    });
    return unsubscribe;
  }, [rideId, onTripCompleted]);

  // Live simulation ticks: captain moves closer
  useEffect(() => {
    if (ride?.status === 'CAPTAIN_ARRIVING') {
      const timer = setTimeout(() => {
        setSimulatedEta('1 min (0.2 km away)');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [ride?.status]);

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Trip not found</h2>
        <p className="text-sm text-gray-500 mb-4">The requested trip ID could not be loaded.</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-[#FF6B00] text-white rounded-xl font-bold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleCannedMessage = (msg: string) => {
    setChatMessageSent(msg);
    setTimeout(() => setChatMessageSent(null), 3000);
  };

  const handleConfirmCancel = () => {
    store.cancelRide(ride.id, cancelReason);
    setShowCancelModal(false);
    onBack();
  };

  // Status-dependent labels
  const getStatusBanner = () => {
    switch (ride.status) {
      case 'SEARCHING':
        return {
          title: 'Matching with nearby Captain...',
          subtitle: 'Dispatching request to nearest verified riders in Ahmedabad',
          badge: 'Searching',
          badgeColor: 'bg-orange-100 text-[#A04100]'
        };
      case 'ASSIGNED':
      case 'CAPTAIN_ARRIVING':
        return {
          title: 'Captain is approaching pickup point',
          subtitle: `${ride.pickup.name}, ${ride.pickup.area}`,
          badge: 'Arriving',
          badgeColor: 'bg-[#FFDBCC] text-[#7A3000]'
        };
      case 'ARRIVED':
        return {
          title: 'Captain has reached pickup spot!',
          subtitle: 'Please meet captain and verify OTP PIN before boarding',
          badge: 'At Pickup',
          badgeColor: 'bg-green-100 text-green-800'
        };
      case 'IN_PROGRESS':
        return {
          title: 'Ride in Progress',
          subtitle: `En route to ${ride.drop.name}`,
          badge: 'On Trip',
          badgeColor: 'bg-blue-100 text-[#0053DB]'
        };
      default:
        return {
          title: 'Trip Update',
          subtitle: ride.pickup.name,
          badge: ride.status,
          badgeColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const banner = getStatusBanner();

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA]">
      <Header
        title="Live Trip Tracking"
        onBack={onBack}
        userPhoto={store.getState().rider.avatar}
        activeRideId={ride.id}
      />

      <main className="flex flex-col w-full pt-20">
        {/* Map Canvas & Telemetry Overlay */}
        <div className="relative w-full h-[360px] overflow-hidden bg-[#E2E8F8]">
          <VectorMap
            mode="route"
            height="h-[360px]"
            etaText={simulatedEta}
            trafficStatus="Moderate Traffic"
          />
        </div>

        {/* Bottom Sheet Live Card */}
        <div className="relative bg-white rounded-t-[28px] -mt-6 shadow-2xl px-4 pt-3 pb-8 flex flex-col gap-3.5 z-20">
          {/* Sheet Handle */}
          <div className="w-12 h-1 rounded-full bg-gray-200 self-center mb-1"></div>

          {/* Toast Notification if Canned Message was Sent */}
          {chatMessageSent && (
            <div className="bg-gray-900 text-white text-xs px-3.5 py-2 rounded-xl flex items-center justify-between animate-fade-in shadow-lg">
              <span>Message dispatched to Captain: &ldquo;{chatMessageSent}&rdquo;</span>
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            </div>
          )}

          {/* Live Status Banner */}
          <div className="flex items-center justify-between bg-[#F0F3FF] rounded-xl px-3.5 py-2.5 border border-blue-100/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#FFDBCC] flex items-center justify-center text-[#A04100] shrink-0">
                <span className="material-symbols-outlined text-[18px]">near_me</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-gray-900 truncate">{banner.title}</span>
                <span className="text-[11px] text-gray-500 truncate">{banner.subtitle}</span>
              </div>
            </div>
            <span
              className={`text-[10px] ${banner.badgeColor} px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider shrink-0`}
            >
              {banner.badge}
            </span>
          </div>

          {/* High-Security OTP Verification Block */}
          <div className="bg-[#F7F8FA] rounded-xl p-3.5 shadow-sm border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#DBE1FF] flex items-center justify-center text-[#0053DB] shrink-0">
                <Shield className="w-5 h-5 text-[#0053DB]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900">Start Ride PIN</span>
                <span className="text-[11px] text-gray-500">Share verbally only after boarding</span>
              </div>
            </div>
            <div className="flex items-center bg-white px-3.5 py-1.5 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-2xl font-black text-[#A04100] tracking-widest font-mono select-all">
                {ride.pin.split('').join(' ')}
              </span>
            </div>
          </div>

          {/* Captain Profile & Vehicle Credentials Card */}
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-200 flex flex-col gap-3">
            {/* Top Driver Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    className="w-14 h-14 rounded-full object-cover shadow-sm border-2 border-orange-100"
                    alt={ride.captainName || 'Karan Shah'}
                    src={
                      ride.captainPhoto ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUX2ae_4J4GiFx-1aJRutvUyq0TRivovDTncsU5RYnmqyDSaYcBPTkkqkQmlrt6OpZU-_v1U4T5QWFvFsb9C49W10gRTsIhAdiCmPKxi5nan8Snkr_8NO8_86K2YHEhCAbTjzBdif3PZ1Rkwyyx1ykeTq1SV_GjullwUFXXkeSgYH9oIJX-TynU9LZXNu0_aZVVskcIPfZ8omWhzFBl_Ca2plNXGrnYa4cvrCzyY3goaLH1g40HKPi'
                    }
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#0053DB] text-white rounded-full p-0.5">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-gray-900">
                      {ride.captainName || 'Karan Shah'}
                    </span>
                    <span className="bg-[#F0F3FF] px-1.5 py-0.2 rounded text-[11px] font-bold text-gray-800 flex items-center gap-0.5 border border-blue-100">
                      ★ {ride.captainRating || 4.92}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    2,480+ completed trips • Top Rated
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-[#A04100] font-bold">
                      {ride.vehicleCategory === 'bike'
                        ? 'M3 Bike Captain'
                        : ride.vehicleCategory === 'auto'
                        ? 'M3 Auto Captain'
                        : 'M3 Cab Captain'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[11px] text-gray-500">Speaks Gujarati, Hindi</span>
                  </div>
                </div>
              </div>

              {/* High Contrast Indian Yellow License Plate */}
              <div className="flex flex-col items-end gap-0.5">
                <div className="bg-[#FFEB3B] text-black px-2 py-0.5 rounded shadow-sm flex flex-col items-center border border-amber-300">
                  <span className="text-[8px] uppercase tracking-wider text-black/70 font-black">
                    IND
                  </span>
                  <span className="text-xs font-black tracking-wider leading-none text-black">
                    {ride.vehicleNumber || 'GJ-01-ET-7842'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 text-right font-medium">
                  {ride.vehicleModel || 'Hero Splendor Plus'}
                </span>
              </div>
            </div>

            {/* Safety Badges Strip */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="bg-[#F0F3FF] text-gray-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 border border-blue-100">
                <span className="material-symbols-outlined text-[14px] text-[#A04100]">
                  sports_motorsports
                </span>
                Sanitized Helmet Provided
              </span>
              <span className="bg-[#F0F3FF] text-gray-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 border border-blue-100">
                <span className="material-symbols-outlined text-[14px] text-[#0053DB]">
                  health_and_safety
                </span>
                Background Verified
              </span>
            </div>

            {/* Action Buttons: Call / Chat */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${ride.captainPhone || '+919825017842'}`}
                className="h-11 rounded-xl bg-[#F0F3FF] hover:bg-[#E7EEFE] flex items-center justify-center gap-2 text-gray-900 text-xs font-bold active:scale-95 transition-all border border-blue-100"
              >
                <Phone className="w-4 h-4 text-[#A04100]" />
                <span>Call Captain</span>
              </a>

              <button
                type="button"
                onClick={() => handleCannedMessage("I'm waiting at the designated pickup curb")}
                className="h-11 rounded-xl bg-[#F0F3FF] hover:bg-[#E7EEFE] flex items-center justify-center gap-2 text-gray-900 text-xs font-bold active:scale-95 transition-all border border-blue-100"
              >
                <MessageSquare className="w-4 h-4 text-[#0053DB]" />
                <span>Message</span>
              </button>
            </div>

            {/* Quick Canned Messages for Rider */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                "👋 I'm at the main gate",
                "👕 Wearing blue shirt",
                "📍 Near BRTS station",
                "⚡ Ready to board"
              ].map((canned, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCannedMessage(canned)}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-[#F7F8FA] hover:bg-orange-50 text-gray-700 hover:text-[#A04100] text-[11px] font-medium border border-gray-200 active:scale-95 transition-all"
                >
                  {canned}
                </button>
              ))}
            </div>
          </div>

          {/* Trip Route Overview Card */}
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-200 flex items-start gap-3">
            <div className="flex flex-col items-center pt-1">
              <span className="w-3 h-3 rounded-full bg-[#A04100] ring-4 ring-orange-100"></span>
              <span className="w-0.5 h-7 bg-gray-200 my-0.5"></span>
              <span className="w-3 h-3 rounded-sm bg-gray-900"></span>
            </div>

            <div className="flex flex-col justify-between flex-1 gap-1.5 min-w-0">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Pickup Spot</span>
                <span className="text-xs font-bold text-gray-900 truncate">
                  {ride.pickup.name}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Destination</span>
                <span className="text-xs font-bold text-gray-900 truncate">
                  {ride.drop.name}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end justify-center self-center bg-[#F0F3FF] px-3 py-1.5 rounded-lg border border-blue-100 shrink-0">
              <span className="text-[10px] text-gray-500 font-semibold">Ride Fare</span>
              <span className="text-base font-black text-gray-900 font-['Inter']">
                ₹{ride.fare.totalFare}
              </span>
              <span className="text-[9px] text-[#0053DB] font-extrabold uppercase">
                {ride.paymentMethod}
              </span>
            </div>
          </div>

          {/* Safety Shield Banner */}
          <div className="bg-[#F0F3FF] rounded-xl p-3 flex items-center justify-between border border-blue-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900">Safety Shield & Support</span>
                <span className="text-[10px] text-gray-500">Live ride tracking shared with contacts</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCannedMessage('Live tracking link sent to family via SMS')}
              className="px-3 py-1.5 rounded-lg bg-white text-gray-900 text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Share Ride
            </button>
          </div>

          {/* Ride Cancel Controls */}
          <div className="flex items-center justify-between px-1 pt-1 text-gray-500">
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 active:opacity-75"
            >
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Cancel Ride</span>
            </button>
            <span className="text-[11px] text-gray-400">No fee if cancelled within 2 mins</span>
          </div>

          {/* Dev Simulation Helpers for smooth testing without waiting */}
          <div className="mt-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-gray-600 text-[10px] uppercase tracking-wider">
                ⚡ Development Ride Controls
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Status: {ride.status}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ride.status === 'SEARCHING' && (
                <button
                  type="button"
                  onClick={() => store.acceptRide(ride.id, 'capt_karan')}
                  className="px-2.5 py-1 bg-[#FF6B00] text-white rounded-lg font-bold text-[11px]"
                >
                  Simulate Captain Accept
                </button>
              )}
              {ride.status === 'CAPTAIN_ARRIVING' && (
                <button
                  type="button"
                  onClick={() => store.captainArrived(ride.id)}
                  className="px-2.5 py-1 bg-green-600 text-white rounded-lg font-bold text-[11px]"
                >
                  Mark Captain Arrived
                </button>
              )}
              {ride.status === 'ARRIVED' && (
                <button
                  type="button"
                  onClick={() => store.startRideWithPin(ride.id, ride.pin)}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold text-[11px]"
                >
                  Enter PIN & Start Ride
                </button>
              )}
              {ride.status === 'IN_PROGRESS' && (
                <button
                  type="button"
                  onClick={() => store.completeRide(ride.id)}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
                >
                  Complete Trip & Collect ₹{ride.fare.totalFare}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Cancel your ride?</h3>
            <p className="text-xs text-gray-500">
              Please let us know why you are cancelling to help improve M3 RIDE services.
            </p>

            <div className="space-y-2">
              {[
                'Changed my mind',
                'Driver asked to cancel',
                'Driver is too far away',
                'Selected wrong pickup location'
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-xs"
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <span className="font-medium text-gray-800">{reason}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
              >
                Keep Ride
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
