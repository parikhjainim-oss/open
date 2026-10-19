// backend/routes/admin.js
const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Middleware: only admin users may access these routes
function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ msg: 'No token' });
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
  next();
}

// List all riders and drivers (excluding admins)
router.get('/users', adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role, extra_data FROM users WHERE role IN ('rider', 'driver') ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Approve or block a driver (status stored in extra_data.driver_status)
router.patch('/drivers/:id/status', adminOnly, async (req, res) => {
  const driverId = req.params.id;
  const { status } = req.body; // expected: 'approved' or 'blocked'
  if (!['approved', 'blocked'].includes(status)) {
    return res.status(400).json({ msg: "Status must be 'approved' or 'blocked'" });
  }
  try {
    await pool.query(
      "UPDATE users SET extra_data = jsonb_set(extra_data, '{driver_status}', to_jsonb($1::text)) WHERE id = $2 AND role = 'driver'",
      [status, driverId]
    );
    res.json({ msg: `Driver ${driverId} status set to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
