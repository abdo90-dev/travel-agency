import express from 'express';
import { requireRole } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const router = express.Router();

// Apply admin check to all routes
router.use(requireRole(['admin']));

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
router.get('/stats', async (req, res) => {
  console.log("test");
  try {
    // Total bookings
    const totalBookings = await prisma.booking.count();
console.log("test");

    // Total revenue
    const revenueAgg = await prisma.payment.aggregate({
      _sum: { amount: true }
    });

    // Bookings today
    const today = new Date();
    today.setHours(0,0,0,0);

    const bookingsToday = await prisma.booking.count({
      where: {
        created_at: { gte: today }
      }
    });

    const revenueTodayAgg = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        created_at: { gte: today }
      }
    });

    // Bookings by status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    // Popular destinations (example: group by destination city)
    const popularDestinations = await prisma.booking.groupBy({
      by: ['destination'],
      _count: { destination: true },
      _sum: { total_price: true },
      orderBy: { _count: { destination: 'desc' } },
      take: 5
    });

    res.json({
      totalBookings,
      totalRevenue: revenueAgg._sum.amount || 0,
      currency: 'EUR',
      bookingsToday,
      revenueToday: revenueTodayAgg._sum.amount || 0,
      bookingsByStatus,
      popularDestinations
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});


/**
 * GET /api/admin/bookings
 * Get all bookings for admin
 */
router.get('/bookings', (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    const mockBookings = [
      {
        id: 'BK001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        type: 'flight',
        destination: 'Paris',
        amount: 560,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'BK002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        type: 'hotel',
        destination: 'Nice',
        amount: 340,
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Apply filters (implement proper filtering logic)
    let filteredBookings = mockBookings;
    if (status) {
      filteredBookings = filteredBookings.filter(b => b.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    res.json({
      bookings: paginatedBookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredBookings.length,
        pages: Math.ceil(filteredBookings.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * GET /api/admin/customers
 * Get customer list
 */
router.get('/customers', (req, res) => {
  try {
    const mockCustomers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        totalBookings: 5,
        totalSpent: 2800,
        lastBooking: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        totalBookings: 3,
        totalSpent: 1650,
        lastBooking: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      }
    ];

    res.json({
      customers: mockCustomers,
      total: mockCustomers.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

export default router;