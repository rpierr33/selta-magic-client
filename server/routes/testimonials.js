const express = require('express');
const pool = require('../database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/testimonials
router.get('/', async (req, res) => {
  try {
    const { approved, productId, rating, sortBy } = req.query;
    let query = 'SELECT * FROM testimonials';
    const params = [];
    const conditions = [];

    if (approved !== undefined) {
      params.push(approved === 'true');
      conditions.push(`is_approved = $${params.length}`);
    }

    if (productId) {
      params.push(productId);
      conditions.push(`product_id = $${params.length}`);
    }

    if (rating) {
      params.push(parseInt(rating, 10));
      conditions.push(`rating = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    if (sortBy === 'highest') {
      query += ' ORDER BY rating DESC, created_at DESC';
    } else if (sortBy === 'lowest') {
      query += ' ORDER BY rating ASC, created_at DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const result = await pool.query(query, params);
    const mapped = result.rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      customerEmail: row.email,
      productName: row.product_name,
      productId: row.product_id,
      message: row.message,
      rating: row.rating,
      isApproved: row.is_approved,
      createdAt: row.created_at,
    }));
    res.json({ data: mapped });
  } catch (err) {
    console.error('Get testimonials error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/testimonials (authenticated)
router.post('/', authenticate, async (req, res) => {
  try {
    const { customer_name, email, product_name, product_id, message, rating } = req.body;

    if (!message || !rating) {
      return res.status(400).json({ error: 'Message and rating are required' });
    }

    const result = await pool.query(
      `INSERT INTO testimonials (id, customer_name, email, product_name, product_id, message, rating, is_approved, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, false, NOW())
       RETURNING *`,
      [
        customer_name || req.user.first_name + ' ' + req.user.last_name,
        email || req.user.email,
        product_name || null,
        product_id || null,
        message,
        rating
      ]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error('Create testimonial error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/testimonials/:id (admin - approve/reject)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { is_approved, customer_name, message, rating } = req.body;

    const result = await pool.query(
      `UPDATE testimonials
       SET is_approved = COALESCE($1, is_approved),
           customer_name = COALESCE($2, customer_name),
           message = COALESCE($3, message),
           rating = COALESCE($4, rating)
       WHERE id = $5
       RETURNING *`,
      [is_approved, customer_name, message, rating, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Update testimonial error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/testimonials/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM testimonials WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Delete testimonial error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
