// backend/routes/driver.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get driver profile (requires auth middleware already applied)
router.get('/me', async (req, res) => {
  if (req.user.role !== 'driver') return res.status(403).json({ msg: 'Forbidden' });
  try {
    const result = await pool.query('SELECT id, email, extra_data FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update driver profile – accepts any of the extra fields
router.put('/me', async (req, res) => {
  if (req.user.role !== 'driver') return res.status(403).json({ msg: 'Forbidden' });
  const allowed = ['name', 'phone', 'licence_number', 'vehicle_type', 'vehicle_number', 'driver_status'];
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k));
  if (updates.length === 0) return res.status(400).json({ msg: 'No valid fields to update' });
  try {
    for (const [key, value] of updates) {
      await pool.query(
        "UPDATE users SET extra_data = jsonb_set(extra_data, $1, to_jsonb($2::text)) WHERE id = $3",
        [`{${key}}`, value, req.user.id]
      );
    }
    res.json({ msg: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
