// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = '7d';

function generateToken(user) {
  const payload = { id: user.id, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Register rider or driver
router.post('/register', async (req, res) => {
  const { email, password, role, name, phone, licence_number, vehicle_type, vehicle_number } = req.body;
  if (!email || !password || !role) return res.status(400).json({ msg: 'Missing required fields' });
  if (!['rider', 'driver'].includes(role)) return res.status(400).json({ msg: 'Invalid role' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const extra = {};
    if (role === 'driver') {
      extra.name = name || '';
      extra.phone = phone || '';
      extra.licence_number = licence_number || '';
      extra.vehicle_type = vehicle_type || '';
      extra.vehicle_number = vehicle_number || '';
      // default driver status pending
      extra.driver_status = 'pending';
    }
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, extra_data) VALUES ($1, $2, $3, $4) RETURNING id, email, role, extra_data`,
      [email, hashed, role, extra]
    );
    const user = result.rows[0];
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, extra: user.extra_data } });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      // unique violation on email
      return res.status(409).json({ msg: 'Email already exists' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login for any role (rider, driver, admin)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ msg: 'Invalid credentials' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ msg: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, extra: user.extra_data } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Simple logout (client discards token). Endpoint provided for completeness.
router.post('/logout', (req, res) => {
  // In a real app you might blacklist JWTs.
  res.json({ msg: 'Logged out' });
});

module.exports = router;
