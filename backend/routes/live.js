// backend/routes/live.js
// Live operations: driving route (polyline) via Google Routes API with a
// haversine fallback, captain GPS beacons, ride chat, and UPI payment intents.
const express = require('express');
const { pool } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const GOOGLE_KEY = process.env.GOOGLE_MAPS_SERVER_KEY || '';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// ---------- Geohash-free helpers ----------
function haversineKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ---------- Driving route + polyline ----------
// POST /api/live/route { pickup:{lat,lng}, drop:{lat,lng} }
// Uses the Routes API computeRoutes when GOOGLE_MAPS_SERVER_KEY is present;
// otherwise returns a straight-line estimate that still renders a line.
router.post('/route', async (req, res, next) => {
  try {
    const { pickup, drop } = req.body || {};
    if (!pickup?.lat || !pickup?.lng || !drop?.lat || !drop?.lng) {
      return res.status(400).json({ message: 'pickup and drop with lat/lng are required.' });
    }
    if (GOOGLE_KEY) {
      const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_KEY,
          'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
        },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: pickup.lat, longitude: pickup.lng } } },
          destination: { location: { latLng: { latitude: drop.lat, longitude: drop.lng } } },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const data = await response.json();
        const route = data.routes?.[0];
        if (route) {
          return res.json({
            source: 'google_routes',
            distanceKm: Math.round((route.distanceMeters / 1000) * 10) / 10,
            etaMins: Math.max(1, Math.round(parseInt(route.duration, 10) / 60)),
            polyline: route.polyline?.encodedPolyline || null,
          });
        }
      }
      // fall through to estimate on non-OK (quota, key issues, timeout upstream)
    }
    const km = haversineKm(pickup, drop);
    const roadKm = Math.round(km * 1.35 * 10) / 10;
    return res.json({
      source: 'estimate',
      distanceKm: roadKm,
      etaMins: Math.max(4, Math.round((roadKm / 24) * 60 + 2)),
      polyline: null,
    });
  } catch (error) { return next(error); }
});

// ---------- Captain GPS beacons ----------
// POST /api/live/location  (drivers) { lat, lng, heading? }
router.post('/location', async (req, res, next) => {
  try {
    if (req.user.role !== 'driver') return res.status(403).json({ message: 'Only drivers can post location beacons.' });
    const lat = Number(req.body?.lat);
    const lng = Number(req.body?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return res.status(400).json({ message: 'Valid lat and lng are required.' });
    }
    const heading = Number.isFinite(Number(req.body?.heading)) ? Number(req.body.heading) : null;
    const vehicle = await pool.query('SELECT vehicle_type FROM driver_profiles WHERE user_id = $1', [req.user.id]);
    await pool.query(
      `INSERT INTO driver_locations (driver_id, lat, lng, heading, vehicle_type, is_online, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       ON CONFLICT (driver_id) DO UPDATE SET lat = $2, lng = $3, heading = $4, vehicle_type = $5, is_online = true, updated_at = NOW()`,
      [req.user.id, lat, lng, heading, vehicle.rows[0]?.vehicle_type || null]
    );
    return res.json({ ok: true });
  } catch (error) { return next(error); }
});

// DELETE /api/live/location  (driver goes offline)
router.delete('/location', async (req, res, next) => {
  try {
    if (req.user.role !== 'driver') return res.status(403).json({ message: 'Only drivers can toggle their beacon.' });
    await pool.query('UPDATE driver_locations SET is_online = false, updated_at = NOW() WHERE driver_id = $1', [req.user.id]);
    return res.json({ ok: true });
  } catch (error) { return next(error); }
});

// GET /api/live/captains?lat=&lng=&radiusKm= — nearby online captains
router.get('/captains', async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Math.min(Number(req.query.radiusKm) || 8, 50);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: 'lat and lng query parameters are required.' });
    }
    const result = await pool.query(
      `SELECT dl.driver_id, dl.lat, dl.lng, dl.heading, dl.vehicle_type, dl.updated_at,
              d.name, d.vehicle_number
         FROM driver_locations dl
         JOIN driver_profiles d ON d.user_id = dl.driver_id
        WHERE dl.is_online = true
          AND dl.updated_at > NOW() - INTERVAL '10 minutes'
          AND dl.lat BETWEEN $1 AND $2 AND dl.lng BETWEEN $3 AND $4`,
      [lat - radiusKm / 111, lat + radiusKm / 111, lng - radiusKm / 95, lng + radiusKm / 95]
    );
    return res.json({
      captains: result.rows.map((row) => ({
        id: row.driver_id,
        lat: row.lat,
        lng: row.lng,
        heading: row.heading,
        vehicleType: row.vehicle_type,
        vehicleNumber: row.vehicle_number,
        name: row.name,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) { return next(error); }
});

// ---------- Ride chat ----------
async function assertRideAccess(rideId, user) {
  const result = await pool.query('SELECT rider_id, driver_id FROM rides WHERE id = $1', [rideId]);
  if (!result.rows[0]) return null;
  const ride = result.rows[0];
  if (ride.rider_id !== user.id && ride.driver_id !== user.id) return null;
  return ride;
}

// GET /api/live/rides/:id/messages?after=<id>
router.get('/rides/:id/messages', async (req, res, next) => {
  try {
    const ride = await assertRideAccess(req.params.id, req.user);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });
    const after = Number(req.query.after) || 0;
    const result = await pool.query(
      `SELECT id, sender_id AS "senderId", sender_role AS "senderRole", text, created_at AS "createdAt"
         FROM ride_messages WHERE ride_id = $1 AND id > $2 ORDER BY id ASC LIMIT 200`,
      [req.params.id, after]
    );
    return res.json({ messages: result.rows });
  } catch (error) { return next(error); }
});

// POST /api/live/rides/:id/messages { text }
router.post('/rides/:id/messages', async (req, res, next) => {
  try {
    const ride = await assertRideAccess(req.params.id, req.user);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });
    const text = String(req.body?.text || '').trim().slice(0, 500);
    if (!text) return res.status(400).json({ message: 'Message text is required.' });
    const role = req.user.role === 'driver' ? 'driver' : 'rider';
    const result = await pool.query(
      `INSERT INTO ride_messages (ride_id, sender_id, sender_role, text)
       VALUES ($1, $2, $3, $4) RETURNING id, sender_role AS "senderRole", text, created_at AS "createdAt"`,
      [req.params.id, req.user.id, role, text]
    );
    return res.status(201).json({ message: result.rows[0] });
  } catch (error) { return next(error); }
});

// ---------- UPI payments (Razorpay with simulated sandbox fallback) ----------
function simpleOrder(rideId, amountPaise) {
  return `order_${rideId.slice(0, 8)}_${Date.now().toString(36)}`;
}

// POST /api/live/payments/order { rideId, amount }
router.post('/payments/order', async (req, res, next) => {
  try {
    const rideId = String(req.body?.rideId || '');
    const amount = Number(req.body?.amount);
    if (!rideId || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'rideId and a positive amount are required.' });
    }
    const ride = await assertRideAccess(rideId, req.user);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });
    const amountPaise = Math.round(amount * 100);
    let orderId = simpleOrder(rideId, amountPaise);
    let provider = 'sandbox';

    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
        body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt: rideId, notes: { rideId } }),
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const order = await response.json();
        orderId = order.id;
        provider = 'razorpay';
      }
    }
    await pool.query(
      'INSERT INTO payment_intents (ride_id, provider, order_id, amount_paise) VALUES ($1, $2, $3, $4) ON CONFLICT (order_id) DO NOTHING',
      [rideId, provider, orderId, amountPaise]
    );
    return res.status(201).json({
      provider,
      orderId,
      amountPaise,
      keyId: provider === 'razorpay' ? RAZORPAY_KEY_ID : null, // sandbox flows open the confirm endpoint directly
    });
  } catch (error) { return next(error); }
});

// POST /api/live/payments/confirm { orderId, paymentRef? }
// Sandbox mode marks paid immediately; Razorpay mode verifies the checkout signature.
router.post('/payments/confirm', async (req, res, next) => {
  try {
    const orderId = String(req.body?.orderId || '');
    if (!orderId) return res.status(400).json({ message: 'orderId is required.' });
    const intent = await pool.query('SELECT pi.id, pi.ride_id, pi.provider, pi.amount_paise, pi.status, r.rider_id FROM payment_intents pi JOIN rides r ON r.id = pi.ride_id WHERE pi.order_id = $1', [orderId]);
    if (!intent.rows[0]) return res.status(404).json({ message: 'Payment intent not found.' });
    const row = intent.rows[0];
    if (row.rider_id !== req.user.id) return res.status(403).json({ message: 'Only the rider can confirm payment.' });
    if (row.status === 'paid') return res.json({ ok: true, alreadyPaid: true });

    let paymentRef = String(req.body?.paymentRef || `sandbox_${Date.now().toString(36)}`);
    let paid = row.provider === 'sandbox';
    if (row.provider === 'razorpay') {
      const { razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body || {};
      if (!razorpayPaymentId || !razorpaySignature) return res.status(400).json({ message: 'Razorpay payment id and signature are required.' });
      const crypto = require('crypto');
      const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(`${orderId}|${razorpayPaymentId}`).digest('hex');
      if (expected !== razorpaySignature) return res.status(400).json({ message: 'Payment signature verification failed.' });
      paymentRef = razorpayPaymentId;
      paid = true;
    }
    if (!paid) return res.status(400).json({ message: 'Payment could not be confirmed.' });
    await pool.query(`UPDATE payment_intents SET status = 'paid', payment_ref = $2, paid_at = NOW() WHERE order_id = $1`, [orderId, paymentRef]);
    await pool.query(`UPDATE rides SET payment_status = 'paid' WHERE id = $1`, [row.ride_id]);
    await pool.query(`INSERT INTO ride_events (ride_id, actor_id, status, note) VALUES ($1, $2, 'completed', 'UPI payment received: ' || $3)`, [row.ride_id, req.user.id, paymentRef]);
    return res.json({ ok: true, paymentRef });
  } catch (error) { return next(error); }
});

module.exports = router;
