const express = require('express');
const pool = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return require('stripe')(key);
}

// POST /api/stripe/create-payment-intent
router.post('/create-payment-intent', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const stripe = getStripe();
    const { amount, currency, cartItems, shippingAddress } = req.body;

    if (!amount || !cartItems || cartItems.length === 0) {
      client.release();
      return res.status(400).json({ error: 'Amount and cart items are required' });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      metadata: {
        userId: req.user.id,
      },
    });

    // Generate order number
    const orderNumber = 'SM-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Use a transaction for order + order_items
    await client.query('BEGIN');

    // Create order in database
    const orderResult = await client.query(
      `INSERT INTO orders (
        id, user_id, order_number, total_amount, status, payment_intent_id,
        shipping_first_name, shipping_last_name, shipping_address_line_1, shipping_address_line_2,
        shipping_city, shipping_state, shipping_postal_code, shipping_country,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'pending', $4,
        $5, $6, $7, $8, $9, $10, $11, $12,
        NOW(), NOW()
      ) RETURNING *`,
      [
        req.user.id,
        orderNumber,
        amount,
        paymentIntent.id,
        shippingAddress?.firstName || shippingAddress?.first_name || null,
        shippingAddress?.lastName || shippingAddress?.last_name || null,
        shippingAddress?.addressLine1 || shippingAddress?.address_line_1 || null,
        shippingAddress?.addressLine2 || shippingAddress?.address_line_2 || null,
        shippingAddress?.city || null,
        shippingAddress?.state || null,
        shippingAddress?.postalCode || shippingAddress?.postal_code || null,
        shippingAddress?.country || null,
      ]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, quantity, price)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
        [order.id, item.productId || item.product_id || item.id, item.name || item.product_name, item.image || item.product_image, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create payment intent error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  } finally {
    client.release();
  }
});

// POST /api/stripe/confirm-payment
router.post('/confirm-payment', authenticate, async (req, res) => {
  try {
    const stripe = getStripe();
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Verify payment status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      const result = await pool.query(
        `UPDATE orders SET status = 'paid', updated_at = NOW()
         WHERE payment_intent_id = $1 AND user_id = $2
         RETURNING *`,
        [paymentIntentId, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Clear the user's cart
      await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

      res.json({ data: result.rows[0], orderId: result.rows[0].id, orderNumber: result.rows[0].order_number, status: 'succeeded' });
    } else {
      // Update order with current payment status
      await pool.query(
        `UPDATE orders SET status = $1, updated_at = NOW()
         WHERE payment_intent_id = $2 AND user_id = $3`,
        [paymentIntent.status, paymentIntentId, req.user.id]
      );

      res.json({ status: paymentIntent.status });
    }
  } catch (err) {
    console.error('Confirm payment error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
