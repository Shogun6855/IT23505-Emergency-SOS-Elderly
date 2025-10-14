const { Pool } = require('pg');
const path = require('path');

// Load environment variables from the project root
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Database connection string from demo credentials
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:wTXRhREDHbxiaMRzsgdAoQVuSjYTTCSf@shinkansen.proxy.rlwy.net:55982/railway';

const pool = new Pool({
  connectionString: DATABASE_URL
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};