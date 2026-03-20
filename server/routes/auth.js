const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../database');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'user', NOW(), NOW())
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email.toLowerCase(), passwordHash, firstName, lastName]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Signin error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/signout
router.post('/signout', authenticate, (req, res) => {
  res.json({ message: 'Signed out successfully' });
});

// GET /api/auth/session
router.get('/session', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
