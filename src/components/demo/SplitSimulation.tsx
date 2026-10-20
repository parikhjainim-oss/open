import React, { useState } from 'react';
import { RiderHome } from '../rider/RiderHome';
import { VehicleSelect } from '../rider/VehicleSelect';
import { LiveTripTracking } from '../rider/LiveTripTracking';
import { TripReceiptModal } from '../rider/TripReceiptModal';
import { CaptainHome } from '../captain/CaptainHome';
import { CaptainActiveTrip } from '../captain/CaptainActiveTrip';
import { store } from '../../services/store';
import { LocationPoint, RideServiceType, VehicleCategory, Ride } from '../../types';
import { Smartphone, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

export const SplitSimulation: React.FC = () => {
  // Rider subscreen state
  const [riderScreen, setRiderScreen] = useState<'home' | 'vehicle_select' | 'tracking'>('home');
  const [bookingParams, setBookingParams] = useState<{
    category: VehicleCategory;
    serviceType: RideServiceType;
    serviceDetails?: string;
    pickup: LocationPoint;
    drop: LocationPoint;
  } | null>(null);
  const [completedRide, setCompletedRide] = useState<Ride | null>(null);

  // Captain subscreen state
  const [captainScreen, setCaptainScreen] = useState<'home' | 'trip'>('home');
  const [activeCaptainTripId, setActiveCaptainTripId] = useState<string | null>(null);

  const activeRideId = store.getState().activeRideId;

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-12 pb-8 px-4 flex flex-col items-center">
      {/* Simulation banner */}
      <div className="w-full max-w-6xl my-4 p-4 bg-gray-800 rounded-2xl border border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#FF6B00] rounded-xl text-white">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white block">
              Real-Time End-to-End Simulation
            </span>
            <span className="text-gray-400">
              Left: Rider Device (Aarav P.) • Right: Captain Device (Karan Shah)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">Tip:</span>
          <span className="text-orange-400 font-medium">
            Book a ride on Left, tap Accept on Right, verify 4-digit PIN!
          </span>
        </div>
      </div>

      {/* Dual Phone Emulators */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start justify-center">
        {/* Rider Phone Frame */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-300">
            <Smartphone className="w-4 h-4 text-[#FF6B00]" />
            <span>Passenger Phone (Rider App)</span>
          </div>

          <div className="w-full max-w-[400px] h-[780px] bg-white text-gray-900 rounded-[36px] shadow-2xl border-[8px] border-gray-800 overflow-y-auto relative no-scrollbar">
            {riderScreen === 'home' && (
              <RiderHome
                activeTab="home"
                onSelectRideFlow={(category, pickup, drop, serviceType, serviceDetails) => {
                  setBookingParams({ category, pickup, drop, serviceType, serviceDetails });
                  setRiderScreen('vehicle_select');
                }}
                onOpenActivity={() => {}}
                onOpenWallet={() => {}}
                onOpenProfile={() => {}}
              />
            )}

            {riderScreen === 'vehicle_select' && bookingParams && (
              <VehicleSelect
                pickup={bookingParams.pickup}
                drop={bookingParams.drop}
                serviceType={bookingParams.serviceType}
                serviceDetails={bookingParams.serviceDetails}
                onBack={() => setRiderScreen('home')}
                onConfirmBooking={(category, paymentMethod, distanceKm, durationMins) => {
                  const newRide = store.requestRide({
                    category,
                    serviceType: bookingParams.serviceType,
                    serviceDetails: bookingParams.serviceDetails,
                    pickup: bookingParams.pickup,
                    drop: bookingParams.drop,
                    distanceKm,
                    durationMins,
                    paymentMethod,
                    promoCode: 'WELCOME_AMD'
                  });
                  setRiderScreen('tracking');
                }}
              />
            )}

            {riderScreen === 'tracking' && activeRideId && (
              <LiveTripTracking
                rideId={activeRideId}
                onBack={() => setRiderScreen('home')}
                onTripCompleted={(r) => {
                  setCompletedRide(r);
                }}
              />
            )}

            {completedRide && (
              <TripReceiptModal
                ride={completedRide}
                onClose={() => {
                  setCompletedRide(null);
                  setRiderScreen('home');
                }}
              />
            )}
          </div>
        </div>

        {/* Captain Phone Frame */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-300">
            <Smartphone className="w-4 h-4 text-[#0053DB]" />
            <span>Driver Device (Captain App)</span>
          </div>

          <div className="w-full max-w-[400px] h-[780px] bg-white text-gray-900 rounded-[36px] shadow-2xl border-[8px] border-gray-800 overflow-y-auto relative no-scrollbar">
            {captainScreen === 'home' && (
              <CaptainHome
                onOpenTripExecution={(rideId) => {
                  setActiveCaptainTripId(rideId);
                  setCaptainScreen('trip');
                }}
                onOpenEarnings={() => {}}
                onOpenProfile={() => {}}
              />
            )}

            {captainScreen === 'trip' && activeCaptainTripId && (
              <CaptainActiveTrip
                rideId={activeCaptainTripId}
                onTripCompleted={() => {
                  setCaptainScreen('home');
                  setActiveCaptainTripId(null);
                }}
                onBack={() => {
                  setCaptainScreen('home');
                  setActiveCaptainTripId(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
