const express = require('express');
const jwt = require('jsonwebtoken');
const { createClient } = require("@libsql/client");

const router = express.Router();

// Database connection
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Middleware to validate JWT and extract user info
const authenticate = (req, res, next) => {
  const token = req.cookies.token;  // assuming the token is stored in a cookie
  if (!token) {
    return res.status(403).json({ error: 'Authentication required.' });
  }

  jwt.verify(token, process.env.JWTSECRET || '', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.body.userid = decoded.id;  // Attach user info to request body
    next();
  });
};

// POST: Volunteer for an opportunity
router.post('/events/volunteer', authenticate, async (req, res) => {
  const { opportunity_id } = req.body;
  const { userid } = req.body;

  if (!opportunity_id) {
    return res.status(400).json({ error: 'Opportunity ID is required.' });
  }

  const signupDate = new Date().toISOString();

  try {
    // Check if opportunity exists
    const opportunity = await db.execute(`SELECT * FROM opportunities WHERE id = ?`, [opportunity_id]);
    if (opportunity.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }

    // Check if already signed up
    const existingSignup = await db.execute(
      `SELECT * FROM volunteer_signups WHERE user_id = ? AND opportunity_id = ?`,
      [userid, opportunity_id]
    );
    if (existingSignup.rows.length > 0) {
      return res.status(400).json({ error: 'You have already signed up for this opportunity.' });
    }

    // Insert the signup
    const insertResult = await db.execute(
      `INSERT INTO volunteer_signups (user_id, opportunity_id, signup_date) VALUES (?, ?, ?)`,
      [userid, opportunity_id, signupDate]
    );

    res.status(201).json({
      message: 'Successfully signed up for the opportunity.',
      signupId: Number(insertResult.lastInsertRowid)
    });
  } catch (err) {
    console.error('Volunteer signup error:', err);
    res.status(500).json({ error: err.message || 'Database error.' });
  }
});

// GET: Opportunities the user has signed up for
router.get('/events/volunteered', authenticate, async (req, res) => {
  const { userid } = req.body;

  try {
    const result = await db.execute(`
      SELECT opportunities.id, opportunities.title, opportunities.description, opportunities.date, opportunities.time, opportunities.location
      FROM opportunities
      INNER JOIN volunteer_signups ON opportunities.id = volunteer_signups.opportunity_id
      WHERE volunteer_signups.user_id = ?
    `, [userid]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error.' });
  }
});

// DELETE: Cancel volunteer signup
router.delete('/events/volunteer/cancel/:opportunity_id', authenticate, async (req, res) => {
  const { opportunity_id } = req.params;
  const { userid } = req.body;

  try {
    const signup = await db.execute(
      `SELECT * FROM volunteer_signups WHERE user_id = ? AND opportunity_id = ?`,
      [userid, opportunity_id]
    );

    if (signup.rows.length === 0) {
      return res.status(404).json({ error: 'Signup not found.' });
    }

    const result = await db.execute(
      `DELETE FROM volunteer_signups WHERE user_id = ? AND opportunity_id = ?`,
      [userid, opportunity_id]
    );

    if (result.changes === 0) {
      return res.status(400).json({ error: 'Failed to cancel signup.' });
    }

    res.json({ message: 'Signup canceled successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error.' });
  }
});

// GET: Volunteers for an opportunity
router.get('/events/opportunity/:opportunity_id/volunteers', async (req, res) => {
  const { opportunity_id } = req.params;

  try {
    const result = await db.execute(`
      SELECT users.id, users.username, users.email
      FROM users
      INNER JOIN volunteer_signups ON users.id = volunteer_signups.user_id
      WHERE volunteer_signups.opportunity_id = ?
    `, [opportunity_id]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error.' });
  }
});

module.exports = router;
