// routes/webhook.js
import express from "express";
import Stripe from "stripe";
import pool from "../db.js"; // ✅ use Postgres pool

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/",
  express.raw({ type: "application/json" }), // ✅ Stripe needs raw body
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body, // raw Buffer
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === "payment_intent.succeeded") {
        const intent = event.data.object;

        // ✅ Update payment
        await pool.query(
          "UPDATE \"Payment\" SET status = $1 WHERE stripe_payment_id = $2",
          ["succeeded", intent.id]
        );

        // ✅ Update booking
        await pool.query(
          "UPDATE \"Booking\" SET status = $1, updated_at = NOW() WHERE id = $2",
          ["confirmed", intent.metadata.bookingId]
        );
      }

      if (event.type === "payment_intent.payment_failed") {
        const intent = event.data.object;

        await pool.query(
          "UPDATE \"Payment\" SET status = $1 WHERE stripe_payment_id = $2",
          ["failed", intent.id]
        );
      }

      res.json({ received: true });
    } catch (err) {
      console.error("⚠️ Webhook error:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
