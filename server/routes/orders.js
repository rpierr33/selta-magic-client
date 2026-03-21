const express = require('express');
const pool = require('../database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders (authenticated user's orders)
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, COALESCE(json_agg(
         json_build_object(
           'id', oi.id,
           'product_id', oi.product_id,
           'product_name', oi.product_name,
           'product_image', oi.product_image,
           'quantity', oi.quantity,
           'price', oi.price
         )
       ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Get orders error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/:id (authenticated)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, COALESCE(json_agg(
         json_build_object(
           'id', oi.id,
           'product_id', oi.product_id,
           'product_name', oi.product_name,
           'product_image', oi.product_image,
           'quantity', oi.quantity,
           'price', oi.price
         )
       ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Get order error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/orders (admin - all orders)
// This route is mounted at /api/admin/orders -> GET /
const adminRouter = express.Router();

adminRouter.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.*,
        u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_image', oi.product_image,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN users u ON o.user_id = u.id
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` WHERE o.status = $${params.length}`;
    }

    query += ' GROUP BY o.id, u.email, u.first_name, u.last_name ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Get admin orders error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { router, adminRouter };
