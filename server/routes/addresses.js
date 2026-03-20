const express = require('express');
const pool = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/addresses
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Get addresses error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/addresses
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      type, first_name, last_name, address_line_1, address_line_2,
      city, state, postal_code, country, phone, is_default
    } = req.body;

    if (!address_line_1 || !city || !state || !postal_code || !country) {
      return res.status(400).json({ error: 'Required address fields are missing' });
    }

    // If setting as default, unset other defaults first
    if (is_default) {
      await pool.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [req.user.id]
      );
    }

    const result = await pool.query(
      `INSERT INTO addresses (id, user_id, type, first_name, last_name, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       RETURNING *`,
      [req.user.id, type || 'shipping', first_name, last_name, address_line_1, address_line_2 || null, city, state, postal_code, country, phone || null, is_default || false]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error('Create address error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/addresses/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      type, first_name, last_name, address_line_1, address_line_2,
      city, state, postal_code, country, phone, is_default
    } = req.body;

    // If setting as default, unset other defaults first
    if (is_default) {
      await pool.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [req.user.id]
      );
    }

    const result = await pool.query(
      `UPDATE addresses
       SET type = COALESCE($1, type),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           address_line_1 = COALESCE($4, address_line_1),
           address_line_2 = COALESCE($5, address_line_2),
           city = COALESCE($6, city),
           state = COALESCE($7, state),
           postal_code = COALESCE($8, postal_code),
           country = COALESCE($9, country),
           phone = COALESCE($10, phone),
           is_default = COALESCE($11, is_default)
       WHERE id = $12 AND user_id = $13
       RETURNING *`,
      [type, first_name, last_name, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Update address error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/addresses/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Delete address error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
