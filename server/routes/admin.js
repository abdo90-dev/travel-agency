import express from 'express';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply admin check to all routes
router.use(requireRole);

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
router.get('/stats', (req, res) => {
  try {
    const mockStats = {
      totalBookings: 1247,
      totalRevenue: 284500,
      currency: 'EUR',
      bookingsToday: 23,
      revenueToday: 5680,
      bookingsByStatus: {
        confirmed: 1050,
        pending: 97,
        cancelled: 100
      },
      popularDestinations: [
        { destination: 'Paris', bookings: 345, revenue: 87500 },
        { destination: 'Nice', bookings: 234, revenue: 58900 },
        { destination: 'Lyon', bookings: 198, revenue: 49600 },
        { destination: 'Marseille', bookings: 156, revenue: 39200 }
      ],
      monthlyRevenue: [
        { month: 'Jan', revenue: 45000 },
        { month: 'Feb', revenue: 52000 },
        { month: 'Mar', revenue: 48000 },
        { month: 'Apr', revenue: 55000 },
        { month: 'May', revenue: 62000 },
        { month: 'Jun', revenue: 58000 }
      ],
      recentBookings: [
        {
          id: 'BK001',
          customer: 'John Doe',
          destination: 'Paris',
          amount: 560,
          status: 'confirmed',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'BK002',
          customer: 'Jane Smith',
          destination: 'Nice',
          amount: 340,
          status: 'pending',
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ]
    };

    res.json(mockStats);
  } catch (error) {
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