require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be set before starting the backend.');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
});
pool.on('error', (error) => console.error('Unexpected PostgreSQL pool error', error));

module.exports = { pool };
