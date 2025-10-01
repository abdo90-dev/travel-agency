// db.js
import dotenv from 'dotenv';
import pkg from 'pg';

// Load environment variables
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,         // postgres
  host: process.env.DB_HOST,         // localhost
  database: process.env.DB_NAME,     // travel_agency
  password: process.env.DB_PASSWORD, // Callman1234!
  port: process.env.DB_PORT,         // 5432
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Test connection on startup
pool.connect()
  .then(client => {
    console.log('✅ Database connection test successful');
    console.log(`📊 Connected to: ${process.env.DB_NAME} as ${process.env.DB_USER}`);
    client.release();
  })
  .catch(err => {
    console.error('❌ Database connection test failed:', err.message);
    console.error('🔍 Check your .env file and PostgreSQL service');
  });

export default pool;