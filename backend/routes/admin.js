const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireRole('admin'));

router.get('/users', async (_req, res, next) => {
  try {
    const result = await pool.query(`SELECT u.id, u.email, u.role, u.created_at AS "createdAt", COALESCE(d.name, r.name) AS name, COALESCE(d.phone, r.phone) AS phone, d.vehicle_type AS "vehicleType", d.vehicle_number AS "vehicleNumber", d.status AS "driverStatus" FROM users u LEFT JOIN driver_profiles d ON d.user_id = u.id LEFT JOIN rider_profiles r ON r.user_id = u.id ORDER BY u.created_at DESC`);
    return res.json(result.rows);
  } catch (error) { return next(error); }
});

router.post('/admins', async (req, res, next) => {
  const { email, password } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || typeof password !== 'string' || password.length < 12) {
    return res.status(400).json({ message: 'Provide a valid email and a password of at least 12 characters.' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin') RETURNING id, email, role`,
      [normalizedEmail, passwordHash],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'An account with this email already exists.' });
    return next(error);
  }
});

router.patch('/drivers/:id/status', async (req, res, next) => {
  const { status } = req.body || {};
  if (!['approved', 'blocked'].includes(status)) return res.status(400).json({ message: "Status must be 'approved' or 'blocked'." });
  try {
    const result = await pool.query('UPDATE driver_profiles SET status = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id AS id, status', [status, req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Driver not found.' });
    return res.json(result.rows[0]);
  } catch (error) { return next(error); }
});

module.exports = router;
