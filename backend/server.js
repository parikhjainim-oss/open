// backend/server.js - Main entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const app = express();

// ---------- CORS ----------
// Allow the web app (VITE_API_URL origin) and Capacitor app (file:// protocol)
const allowedOrigins = [
  process.env.CORS_ORIGIN_WEB || '*', // e.g., https://myapp.example.com
  'capacitor://localhost',
  'http://localhost', // dev
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ---------- Import routes ----------
const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/driver');
const adminRoutes = require('./routes/admin');
const { authenticate } = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/driver', authenticate, driverRoutes);
app.use('/api/admin', authenticate, adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
