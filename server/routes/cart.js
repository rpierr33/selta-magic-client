const express = require('express');
const pool = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Get cart error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/cart
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, quantity, name, price, image } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    // Check if item already exists in cart
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *`,
        [quantity, req.user.id, productId]
      );
    } else {
      result = await pool.query(
        `INSERT INTO cart_items (id, user_id, product_id, quantity, name, price, image, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [req.user.id, productId, quantity, name, price, image]
      );
    }

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error('Add to cart error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/cart/:productId
router.put('/:productId', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      // Remove item if quantity is less than 1
      await pool.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [req.user.id, req.params.productId]
      );
      return res.json({ data: null, message: 'Item removed from cart' });
    }

    const result = await pool.query(
      `UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *`,
      [quantity, req.user.id, req.params.productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Update cart error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/cart/:productId
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [req.user.id, req.params.productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Delete cart item error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
