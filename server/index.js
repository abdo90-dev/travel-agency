import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRou from './routes/auth.js';
import flightRoutes from './routes/flights.js';
import hotelRoutes from './routes/hotels.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import { authenticateToken } from './middleware/auth.js';
import webhookRoutes from './routes/webhook.js';
import pool from './db.js';
import confirmationRoutes from "./routes/pdf.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // Disable for dev, configure properly in production
}));

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ db: 'connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ db: 'error', message: err.message });
  }
});

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 

    ? ['https://travel-agency-iota-six.vercel.app'] // Replace with your production domain
    : ['http://localhost:5173', 'http://localhost:3000','https://travel-agency-iota-six.vercel.app'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/webhook', webhookRoutes);
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRou);
app.use('/api/flights', flightRoutes);
app.use('/api/hotels', hotelRoutes);
app.use("/api/confirmation", confirmationRoutes);
// Protected routes (require authentication)
app.use('/api/bookings', authenticateToken, bookingRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/admin', authenticateToken, adminRoutes); // Add admin role check later

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API endpoints available at http://localhost:${PORT}/api`);
});