const express = require('express');
const pool = require('../database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Get categories error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/categories (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await pool.query(
      `INSERT INTO categories (id, name, description, created_at)
       VALUES (gen_random_uuid(), $1, $2, NOW())
       RETURNING *`,
      [name, description || null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error('Create category error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/categories/:id (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [name, description, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Update category error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/categories/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Delete category error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
