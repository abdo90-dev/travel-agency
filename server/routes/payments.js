import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === "payment_intent.succeeded") {
        const intent = event.data.object;

        // Update Payment
        await pool.query(
          'UPDATE "Payment" SET status = $1 WHERE stripe_payment_id = $2',
          ["succeeded", intent.id]
        );

        // Update Booking
        await pool.query(
          'UPDATE "Booking" SET status = $1, updated_at = NOW() WHERE id = $2',
          ["confirmed", intent.metadata.bookingId]
        );
      }

      if (event.type === "payment_intent.payment_failed") {
        const intent = event.data.object;

        await pool.query(
          'UPDATE "Payment" SET status = $1 WHERE stripe_payment_id = $2',
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

router.get('/:id/status', (req, res) => {
  try {
    // Mock payment status check
    const statuses = ['processing', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    res.json({
      paymentId: req.params.id,
      status: randomStatus,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

router.post('/refund', (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    const mockRefund = {
      id: `REF_${uuidv4()}`,
      paymentId,
      amount,
      reason,
      status: 'processing',
      requestedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    res.json(mockRefund);
  } catch (error) {
    res.status(500).json({ error: 'Refund processing failed' });
  }
});

export default router;