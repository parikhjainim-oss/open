const express = require('express');
const { pool } = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireRole('driver'));

router.get('/me', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT u.id, u.email, d.name, d.phone, d.licence_number AS "licenceNumber", d.vehicle_type AS "vehicleType", d.vehicle_number AS "vehicleNumber", d.status FROM users u JOIN driver_profiles d ON d.user_id = u.id WHERE u.id = $1`, [req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Driver profile not found.' });
    return res.json(result.rows[0]);
  } catch (error) { return next(error); }
});

router.put('/me', async (req, res, next) => {
  const { name, phone, licenceNumber, vehicleType, vehicleNumber } = req.body || {};
  if (vehicleType !== undefined && !['bike', 'auto', 'cab'].includes(vehicleType)) return res.status(400).json({ message: 'Invalid vehicle type.' });
  if ([name, phone, licenceNumber, vehicleType, vehicleNumber].every((value) => value === undefined)) return res.status(400).json({ message: 'No supported profile fields supplied.' });
  try {
    const result = await pool.query(
      `UPDATE driver_profiles SET name = COALESCE($1, name), phone = COALESCE($2, phone), licence_number = COALESCE($3, licence_number), vehicle_type = COALESCE($4, vehicle_type), vehicle_number = COALESCE($5, vehicle_number), updated_at = NOW() WHERE user_id = $6 RETURNING name, phone, licence_number AS "licenceNumber", vehicle_type AS "vehicleType", vehicle_number AS "vehicleNumber", status`,
      [name, phone, licenceNumber, vehicleType, vehicleNumber, req.user.id],
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Driver profile not found.' });
    return res.json(result.rows[0]);
  } catch (error) { return next(error); }
});

module.exports = router;
