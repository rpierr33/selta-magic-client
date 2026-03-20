const express = require('express');
const pool = require('../database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role, first_name, last_name } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET role = COALESCE($1, role),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, first_name, last_name, role, created_at, updated_at`,
      [role, first_name, last_name, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
