require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,capacitor://localhost')
  .split(',').map((origin) => origin.trim()).filter(Boolean);
// The production web client is hosted here. Keep it allowed even when the
// backend's CORS_ORIGINS environment variable only lists local development URLs.
if (!allowedOrigins.includes('https://open-skzo.onrender.com')) allowedOrigins.push('https://open-skzo.onrender.com');
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

// ---------- Import routes ----------
const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/driver');
const adminRoutes = require('./routes/admin');
const { authenticate, getJwtSecret } = require('./middleware/auth');

getJwtSecret();

app.use('/api/auth', authRoutes);
app.use('/api/driver', authenticate, driverRoutes);
app.use('/api/admin', authenticate, adminRoutes);

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok' });
  } catch (error) { return next(error); }
});

app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.type === 'entity.parse.failed' ? 400 : 500;
  res.status(status).json({ message: status === 400 ? 'Malformed JSON request body.' : 'Internal server error.' });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
function shutdown(signal) {
  console.log(`${signal} received; shutting down.`);
  server.close(() => pool.end().finally(() => process.exit(0)));
}
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
