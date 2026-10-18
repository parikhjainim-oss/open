/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { UserRole, LocationPoint, VehicleCategory, Ride } from './types';
import { DevRoleSwitcher } from './components/common/DevRoleSwitcher';
import { RiderHome } from './components/rider/RiderHome';
import { VehicleSelect } from './components/rider/VehicleSelect';
import { LiveTripTracking } from './components/rider/LiveTripTracking';
import { TripReceiptModal } from './components/rider/TripReceiptModal';
import { RiderActivity } from './components/rider/RiderActivity';
import { RiderWallet } from './components/rider/RiderWallet';
import { RiderProfile } from './components/rider/RiderProfile';
import { CaptainHome } from './components/captain/CaptainHome';
import { CaptainActiveTrip } from './components/captain/CaptainActiveTrip';
import { CaptainEarnings } from './components/captain/CaptainEarnings';
import { CaptainProfile } from './components/captain/CaptainProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SplitSimulation } from './components/demo/SplitSimulation';

export default function App() {
  const [role, setRole] = useState<UserRole | 'split'>(() => store.getState().currentRole);

  // Rider navigation state
  const [riderScreen, setRiderScreen] = useState<'home' | 'vehicle_select' | 'tracking' | 'activity' | 'wallet' | 'profile'>('home');
  const [bookingParams, setBookingParams] = useState<{
    category: VehicleCategory;
    pickup: LocationPoint;
    drop: LocationPoint;
  } | null>(null);
  const [completedRide, setCompletedRide] = useState<Ride | null>(null);

  // Captain navigation state
  const [captainScreen, setCaptainScreen] = useState<'home' | 'trip' | 'earnings' | 'profile'>('home');
  const [activeCaptainTripId, setActiveCaptainTripId] = useState<string | null>(null);

  // Active ride from store
  const [activeRideId, setActiveRideId] = useState<string | null>(() => store.getState().activeRideId);

  useEffect(() => {
    return store.subscribe((state) => {
      setActiveRideId(state.activeRideId);
    });
  }, []);

  const handleRoleChange = (newRole: UserRole | 'split') => {
    setRole(newRole);
    if (newRole !== 'split') {
      store.setRole(newRole as UserRole);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-['Inter',sans-serif]">
      {/* Top Development Role Switcher Bar */}
      <DevRoleSwitcher
        currentRole={role}
        onChangeRole={handleRoleChange}
        activeRideId={activeRideId}
      />

      {/* Main Content Area (offset by 40px for top dev bar) */}
      <div className="pt-10 flex-1 flex flex-col">
        {/* RIDER APPLICATION */}
        {role === 'rider' && (
          <div className="w-full max-w-md mx-auto min-h-screen bg-white shadow-xl sm:border-x border-gray-200 relative flex flex-col">
            {riderScreen === 'home' && (
              <RiderHome
                activeTab="home"
                onSelectRideFlow={(category, pickup, drop) => {
                  setBookingParams({ category, pickup, drop });
                  setRiderScreen('vehicle_select');
                }}
                onOpenActivity={() => setRiderScreen('activity')}
                onOpenWallet={() => setRiderScreen('wallet')}
                onOpenProfile={() => setRiderScreen('profile')}
              />
            )}

            {riderScreen === 'vehicle_select' && bookingParams && (
              <VehicleSelect
                pickup={bookingParams.pickup}
                drop={bookingParams.drop}
                onBack={() => setRiderScreen('home')}
                onConfirmBooking={(category, paymentMethod) => {
                  const newRide = store.requestRide({
                    category,
                    pickup: bookingParams.pickup,
                    drop: bookingParams.drop,
                    distanceKm: 8.4,
                    durationMins: 22,
                    paymentMethod,
                    promoCode: 'WELCOME_AMD'
                  });
                  setRiderScreen('tracking');
                }}
              />
            )}

            {riderScreen === 'tracking' && (
              <LiveTripTracking
                rideId={activeRideId || store.getState().rides[0]?.id || 'M3-R-8419'}
                onBack={() => setRiderScreen('home')}
                onTripCompleted={(ride) => {
                  setCompletedRide(ride);
                }}
              />
            )}

            {riderScreen === 'activity' && (
              <RiderActivity
                onBack={() => setRiderScreen('home')}
                onSelectRideDetails={() => setRiderScreen('tracking')}
              />
            )}

            {riderScreen === 'wallet' && (
              <RiderWallet onBack={() => setRiderScreen('home')} />
            )}

            {riderScreen === 'profile' && (
              <RiderProfile onBack={() => setRiderScreen('home')} />
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
        )}

        {/* CAPTAIN APPLICATION */}
        {role === 'captain' && (
          <div className="w-full max-w-md mx-auto min-h-screen bg-white shadow-xl sm:border-x border-gray-200 relative flex flex-col">
            {captainScreen === 'home' && (
              <CaptainHome
                onOpenTripExecution={(rideId) => {
                  setActiveCaptainTripId(rideId);
                  setCaptainScreen('trip');
                }}
                onOpenEarnings={() => setCaptainScreen('earnings')}
                onOpenProfile={() => setCaptainScreen('profile')}
              />
            )}

            {captainScreen === 'trip' && (
              <CaptainActiveTrip
                rideId={activeCaptainTripId || activeRideId || store.getState().rides[0]?.id || 'M3-R-8419'}
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

            {captainScreen === 'earnings' && (
              <CaptainEarnings onBack={() => setCaptainScreen('home')} />
            )}

            {captainScreen === 'profile' && (
              <CaptainProfile onBack={() => setCaptainScreen('home')} />
            )}
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {role === 'admin' && <AdminDashboard />}

        {/* DUAL SCREEN SPLIT VIEW */}
        {role === 'split' && <SplitSimulation />}
      </div>
    </div>
  );
}
