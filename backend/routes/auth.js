const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authenticate, getJwtSecret } = require('../middleware/auth');

const router = express.Router();
const tokenLifetime = process.env.JWT_EXPIRES_IN || '7d';
const tokenFor = (user) => jwt.sign({ id: user.id, role: user.role }, getJwtSecret(), { expiresIn: tokenLifetime });
const publicUser = (user) => ({ id: user.id, email: user.email, role: user.role, driver: user.driver || null, rider: user.rider || null });

router.post('/register', async (req, res, next) => {
  const { email, password, role, name, phone, licenceNumber, vehicleType, vehicleNumber } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'Provide a valid email and a password of at least 8 characters.' });
  if (!['rider', 'driver'].includes(role)) return res.status(400).json({ message: 'Role must be rider or driver.' });
  if (!name || typeof name !== 'string' || name.trim().length < 2) return res.status(400).json({ message: 'Provide your name.' });
  if (role === 'driver' && !['bike', 'auto', 'cab'].includes(vehicleType)) return res.status(400).json({ message: 'Drivers require a valid vehicle type.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await client.query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role', [normalizedEmail, passwordHash, role]);
    const user = result.rows[0];
    if (role === 'driver') {
      const profile = await client.query(`INSERT INTO driver_profiles (user_id, name, phone, licence_number, vehicle_type, vehicle_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING name, phone, licence_number AS "licenceNumber", vehicle_type AS "vehicleType", vehicle_number AS "vehicleNumber", status`, [user.id, name.trim(), phone || null, licenceNumber || null, vehicleType, vehicleNumber || null]);
      user.driver = profile.rows[0];
    } else {
      const profile = await client.query('INSERT INTO rider_profiles (user_id, name, phone) VALUES ($1, $2, $3) RETURNING name, phone', [user.id, name.trim(), phone || null]);
      user.rider = profile.rows[0];
    }
    await client.query('COMMIT');
    return res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') return res.status(409).json({ message: 'An account with this email already exists.' });
    return next(error);
  } finally { client.release(); }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || typeof password !== 'string') return res.status(400).json({ message: 'Email and password are required.' });
  try {
    const result = await pool.query(`SELECT u.id, u.email, u.role, u.password_hash, jsonb_build_object('name', d.name, 'phone', d.phone, 'licenceNumber', d.licence_number, 'vehicleType', d.vehicle_type, 'vehicleNumber', d.vehicle_number, 'status', d.status) AS driver, jsonb_build_object('name', r.name, 'phone', r.phone) AS rider FROM users u LEFT JOIN driver_profiles d ON d.user_id = u.id LEFT JOIN rider_profiles r ON r.user_id = u.id WHERE u.email = $1`, [normalizedEmail]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: 'Invalid email or password.' });
    if (user.role !== 'driver') user.driver = null;
    if (user.role !== 'rider') user.rider = null;
    return res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { return next(error); }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT u.id, u.email, u.role, jsonb_build_object('name', d.name, 'phone', d.phone, 'licenceNumber', d.licence_number, 'vehicleType', d.vehicle_type, 'vehicleNumber', d.vehicle_number, 'status', d.status) AS driver, jsonb_build_object('name', r.name, 'phone', r.phone) AS rider FROM users u LEFT JOIN driver_profiles d ON d.user_id = u.id LEFT JOIN rider_profiles r ON r.user_id = u.id WHERE u.id = $1`, [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    if (user.role !== 'driver') user.driver = null;
    if (user.role !== 'rider') user.rider = null;
    return res.json({ user: publicUser(user) });
  } catch (error) { return next(error); }
});

module.exports = router;
