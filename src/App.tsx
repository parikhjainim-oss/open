/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { UserRole, LocationPoint, VehicleCategory, Ride } from './types';
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
import { AppSplash } from './components/common/AppSplash';
import { AuthScreen } from './components/auth/AuthScreen';
import { authApi, AuthSession } from './services/api';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => authApi.getSession());
  const [showSplash, setShowSplash] = useState(true);
  const [role, setRole] = useState<UserRole | 'split'>(() => {
    const savedSession = authApi.getSession();
    return savedSession?.user.role === 'driver' ? 'captain' : savedSession?.user.role || store.getState().currentRole;
  });

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

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  const handleAuthenticated = (nextSession: AuthSession) => {
    setSession(nextSession);
    const nextRole: UserRole = nextSession.user.role === 'driver' ? 'captain' : nextSession.user.role;
    setRole(nextRole);
    store.setRole(nextRole);
    setRiderScreen('home');
    setCaptainScreen('home');
    setBookingParams(null);
  };

  const handleLogout = () => {
    authApi.clearSession();
    setSession(null);
    setRole('rider');
    setRiderScreen('home');
    setCaptainScreen('home');
    store.setRole('rider');
  };

  if (showSplash) return <AppSplash />;
  if (!session) return <AuthScreen onAuthenticated={handleAuthenticated} />;

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-['Inter',sans-serif]">
      <div className="flex-1 flex flex-col">
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
                displayName={session.user.rider?.name}
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
              <RiderProfile account={session.user} onBack={() => setRiderScreen('home')} onLogout={handleLogout} />
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
                displayName={session.user.driver?.name || 'Driver'}
                displayVehicleNumber={session.user.driver?.vehicleNumber || 'Not added'}
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
              <CaptainProfile account={session.user} onBack={() => setCaptainScreen('home')} onLogout={handleLogout} />
            )}
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {role === 'admin' && session && <AdminDashboard token={session.token} accountEmail={session.user.email} onLogout={handleLogout} />}

        {/* DUAL SCREEN SPLIT VIEW */}
        {role === 'split' && <SplitSimulation />}
      </div>
    </div>
  );
}
