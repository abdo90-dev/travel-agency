import express from 'express';

const router = express.Router();

// Mock hotel data (integrate with Booking.com API, Expedia, etc. later)
const mockHotels = [
  {
    id: '1',
    name: 'Hotel Laico Tunis',
    rating: 5,
    location: { city: 'Tunis', address: 'Avenue Mohamed V' },
    price: 120,
    currency: 'EUR',
    images: ['https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'],
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
    description: 'Luxury hotel in the heart of Tunis with panoramic city views.',
    availability: true
  },
  {
    id: '2',
    name: 'Four Seasons Hotel Tunis',
    rating: 5,
    location: { city: 'Tunis', address: 'Gammarth' },
    price: 180,
    currency: 'EUR',
    images: ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg'],
    amenities: ['WiFi', 'Beach Access', 'Spa', 'Restaurant', 'Pool'],
    description: 'Beachfront luxury resort with world-class amenities.',
    availability: true
  }
];

/**
 * GET /api/hotels/search
 * Search for hotels based on location and dates
 */
router.get('/search', (req, res) => {
  try {
    const { location, checkin, checkout, guests = 2 } = req.query;

    setTimeout(() => {
      let results = mockHotels.filter(hotel => {
        if (location && !hotel.location.city.toLowerCase().includes(location.toLowerCase())) {
          return false;
        }
        return hotel.availability;
      });

      res.json({
        hotels: results,
        searchCriteria: {
          location,
          checkin,
          checkout,
          guests: parseInt(guests)
        },
        timestamp: new Date().toISOString()
      });
    }, 600);
  } catch (error) {
    res.status(500).json({ error: 'Hotel search failed' });
  }
});

/**
 * GET /api/hotels/:id
 * Get detailed hotel information
 */
router.get('/:id', (req, res) => {
  try {
    const hotel = mockHotels.find(h => h.id === req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const detailedHotel = {
      ...hotel,
      rooms: [
        {
          id: '1',
          type: 'Standard Room',
          price: hotel.price,
          capacity: 2,
          amenities: ['WiFi', 'Air Conditioning', 'Mini Bar']
        },
        {
          id: '2',
          type: 'Deluxe Suite',
          price: hotel.price * 1.5,
          capacity: 4,
          amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Jacuzzi']
        }
      ],
      reviews: {
        average: 4.5,
        count: 234,
        highlights: ['Great location', 'Excellent service', 'Clean rooms']
      }
    };

    res.json(detailedHotel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel details' });
  }
});

export default router;