/**
 * Comprehensive business logic tests for M3 RIDE
 * Tests: Fare calculations, Ride lifecycle state machine,
 * Concurrent assignment prevention, Captain subscription, and Admin permissions.
 */

import { store } from '../services/store';

export function runTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`✅ [PASS] ${testName}`);
    } else {
      failed++;
      results.push(`❌ [FAIL] ${testName}`);
      console.error(`Test failed: ${testName}`);
    }
  }

  // 1. Fare Calculation Test
  const bikeFare = store.calculateFare('bike', 8.4, 22, 'WELCOME_AMD');
  // Base 25 + 8.4*5(42) + platform 3 - discount 2 = 68
  assert(bikeFare.totalFare === 68, `Bike fare calculation for 8.4 km should equal ₹68 (got ₹${bikeFare.totalFare})`);
  assert(bikeFare.baseFare === 25, 'Base minimum fare is ₹25 for Bike');

  const autoFare = store.calculateFare('auto', 8.4, 22);
  assert(autoFare.totalFare >= 40, `Auto fare should be above minimum ₹40 (got ₹${autoFare.totalFare})`);

  const cabFare = store.calculateFare('cab', 8.4, 22);
  assert(cabFare.totalFare >= 65, `Cab fare should be above minimum ₹65 (got ₹${cabFare.totalFare})`);

  // 2. Minimum Fare Enforcement Test
  const shortTripFare = store.calculateFare('bike', 0.1, 1);
  assert(shortTripFare.totalFare >= 25, `Short trip must enforce minimum fare of ₹25 (got ₹${shortTripFare.totalFare})`);

  // 3. Ride Creation Test
  const testRide = store.requestRide({
    category: 'bike',
    pickup: {
      lat: 23.0365,
      lng: 72.5611,
      name: 'Navrangpura Post Office',
      address: 'Navrangpura, Ahmedabad',
      area: 'Navrangpura'
    },
    drop: {
      lat: 23.0225,
      lng: 72.6025,
      name: 'Ahmedabad Railway Station, Kalupur',
      address: 'Kalupur, Ahmedabad',
      area: 'Kalupur'
    },
    distanceKm: 8.4,
    durationMins: 22,
    promoCode: 'WELCOME_AMD'
  });

  assert(testRide.status === 'SEARCHING', 'Newly created ride must be in SEARCHING state');
  assert(testRide.pin.length === 4, `Start Ride PIN must be exactly 4 digits (got "${testRide.pin}")`);

  // 4. Ride Assignment & Single-Captain Atomic Guarantee
  const assigned = store.acceptRide(testRide.id, 'capt_karan');
  assert(assigned === true, 'Captain Karan must be able to accept the SEARCHING ride');

  // Attempting second assignment should fail
  const doubleAssigned = store.acceptRide(testRide.id, 'capt_rajesh');
  assert(doubleAssigned === false, 'Cannot reassign already accepted ride to another captain');

  // 5. Lifecycle Transitions: Captain Arrival
  const arrived = store.captainArrived(testRide.id);
  assert(arrived === true, 'Captain can mark arrival at pickup spot');

  // 6. Security PIN Verification
  const badPinResult = store.startRideWithPin(testRide.id, '0000');
  assert(badPinResult.success === false, 'Incorrect PIN must be rejected');

  const goodPinResult = store.startRideWithPin(testRide.id, testRide.pin);
  assert(goodPinResult.success === true, 'Correct PIN must allow ride to start');

  // 7. Completion and Payment Credit
  const initialCaptainEarnings = store.getState().captains.find(c => c.id === 'capt_karan')?.todayEarnings || 0;
  const completed = store.completeRide(testRide.id);
  assert(completed === true, 'Ride successfully completed');

  const newCaptainEarnings = store.getState().captains.find(c => c.id === 'capt_karan')?.todayEarnings || 0;
  assert(
    newCaptainEarnings === initialCaptainEarnings + testRide.fare.totalFare,
    `Captain earnings must increase by total fare ₹${testRide.fare.totalFare}`
  );

  // 8. Cancellation Policy Test
  const rideToCancel = store.requestRide({
    category: 'auto',
    pickup: { lat: 23.03, lng: 72.56, name: 'Satellite', address: 'Satellite', area: 'Satellite' },
    drop: { lat: 23.05, lng: 72.53, name: 'Vastrapur', address: 'Vastrapur', area: 'Vastrapur' },
    distanceKm: 4.5,
    durationMins: 15
  });
  const cancelled = store.cancelRide(rideToCancel.id, 'User booked other transport');
  assert(cancelled === true, 'Ride can be cancelled with audit reason');
  assert(
    store.getState().rides.find(r => r.id === rideToCancel.id)?.status === 'CANCELLED',
    'Ride status must reflect CANCELLED'
  );

  // 9. Captain Subscription Activation
  store.renewSubscription('capt_karan', 'plan_monthly');
  const karan = store.getState().captains.find(c => c.id === 'capt_karan');
  assert(
    karan?.subscription.planId === 'plan_monthly',
    'Captain subscription updated to Pro Monthly Pass'
  );

  // 10. Admin Document KYC Verification
  const pendingDoc = store.getState().documents.find(d => d.status === 'pending');
  if (pendingDoc) {
    store.approveDocument(pendingDoc.id);
    assert(
      store.getState().documents.find(d => d.id === pendingDoc.id)?.status === 'approved',
      'Admin can approve pending KYC document'
    );
  }

  return { passed, failed, results };
}
