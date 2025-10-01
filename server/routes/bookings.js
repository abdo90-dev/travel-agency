import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import Stripe from "stripe";
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// ✅ Get user's bookings
router.get("/", authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { user_id: Number(req.user.id) },
      include: {
        passengers: true,
        payments: true,
        invoices: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json({ bookings, total: bookings.length });
  } catch (error) {
    console.error("❌ Fetch bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});


// ✅ Create booking

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { booking_type, provider, provider_ref, total_price, margin_applied, passengers } = req.body;
    if (!booking_type || !total_price) {
      return res.status(400).json({ error: "Booking type and total price are required" });
    }

const newBooking = await prisma.booking.create({
  data: {
    user_id: Number(req.user.id),
    booking_type,
    provider,
    provider_ref,
    total_price,
    margin_applied,
    status: "pending",
    passengers: {
      create: Array.isArray(passengers)
        ? passengers.map(p => ({
            first_name: p.firstName,
            last_name: p.lastName,
            email: p.email || '',
            phone: p.phone || '',
            passport_number: p.passportNumber || null,
            birth_date: p.birthDate ? new Date(p.birthDate) : null,
            seat_choice: p.seatChoice || null,
            baggage_option: p.baggageOption || null,
            meal_option: p.mealOption || null,
          }))
        : []
    }
  },
  include: { passengers: true },
});


  // 2. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_price * 100), // Stripe expects cents
      currency: "eur",
      payment_method_types: ["card"],
      metadata: { bookingId: newBooking.id.toString() },
    });

    // 3. Store payment in DB (pending)
    await prisma.payment.create({
      data: {
        booking_id: newBooking.id,
        stripe_payment_id: paymentIntent.id,
        amount: total_price,
        currency: "EUR",
        status: "pending",
      },
    });

    res.status(201).json({
  booking: newBooking,
  clientSecret: paymentIntent.client_secret
});
  } catch (error) {
    console.error("❌ Booking creation error:", error);
    res.status(500).json({ error: "Booking creation failed" });
  }
});


// ✅ Get booking details
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: Number(req.params.id), user_id: Number(req.user.id) },
      include: {
        passengers: true,
        payments: true,
        invoices: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch booking details" });
  }
});

router.put("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: Number(req.params.id), user_id: Number(req.user.id) },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status === "canceled") {
      return res.status(400).json({ error: "Booking already canceled" });
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "canceled", updated_at: new Date() },
    });

    res.json(cancelledBooking);
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});


export default router;
