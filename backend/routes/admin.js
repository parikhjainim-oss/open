const express = require('express');
const { pool } = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireRole('admin'));

router.get('/users', async (_req, res, next) => {
  try {
    const result = await pool.query(`SELECT u.id, u.email, u.role, u.created_at AS "createdAt", d.name, d.phone, d.vehicle_type AS "vehicleType", d.vehicle_number AS "vehicleNumber", d.status AS "driverStatus" FROM users u LEFT JOIN driver_profiles d ON d.user_id = u.id WHERE u.role IN ('rider', 'driver') ORDER BY u.created_at DESC`);
    return res.json(result.rows);
  } catch (error) { return next(error); }
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
