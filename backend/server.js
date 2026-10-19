// server.js - Express API for Rapido-like app
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = '7d';

// ---------- Helper ----------
function generateToken(user) {
  const payload = { id: user.id, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ---------- Auth Routes ----------
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role, ...extra } = req.body;
  if (!email || !password || !role) return res.status(400).json({ msg: 'Missing fields' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, extra_data) VALUES ($1, $2, $3, $4) RETURNING id, email, role`,
      [email, hashed, role, extra]
    );
    const user = result.rows[0];
    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ msg: 'Invalid credentials' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ msg: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ---------- Protected middleware ----------
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
}

// ---------- Driver Routes ----------
app.get('/api/driver/me', authMiddleware, async (req, res) => {
  if (req.user.role !== 'driver') return res.status(403).json({ msg: 'Forbidden' });
  try {
    const result = await pool.query('SELECT id, email, extra_data FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.put('/api/driver/me', authMiddleware, async (req, res) => {
  if (req.user.role !== 'driver') return res.status(403).json({ msg: 'Forbidden' });
  const { licence_number, vehicle_make, vehicle_model, plate_number } = req.body;
  try {
    await pool.query(
      'UPDATE users SET extra_data = jsonb_set(extra_data, $1, to_jsonb($2::text)) WHERE id = $3',
      ['{licence_number}', licence_number, req.user.id]
    );
    // Simplified: you would update all fields similarly.
    res.json({ msg: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ---------- Admin Routes (basic) ----------
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
  try {
    const result = await pool.query('SELECT id, email, role FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ---------- Health ----------
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
