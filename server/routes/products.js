const express = require('express');
const pool = require('../database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length} OR brand ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Get products error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Get product error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/products (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, original_price, category, brand, image, rating, reviews } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const result = await pool.query(
      `INSERT INTO products (id, name, description, price, original_price, category, brand, image, rating, reviews, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [name, description, price, original_price || null, category, brand, image, rating || 0, reviews || 0]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error('Create product error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, original_price, category, brand, image, rating, reviews } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           original_price = COALESCE($4, original_price),
           category = COALESCE($5, category),
           brand = COALESCE($6, brand),
           image = COALESCE($7, image),
           rating = COALESCE($8, rating),
           reviews = COALESCE($9, reviews),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [name, description, price, original_price, category, brand, image, rating, reviews, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Update product error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Delete product error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
