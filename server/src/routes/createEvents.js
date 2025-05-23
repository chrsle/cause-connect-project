const express = require('express');
const jwt = require('jsonwebtoken');
const { createClient } = require('@libsql/client');
const { calculateDistance, getCoordinates } = require('../utils/geocoding');

const router = express.Router();

// Database connection
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Middleware to validate JWT and extract user info (we don't attach `user` to req anymore)
const authenticate = (req, res, next) => {
  const token = req.cookies.token;  // now it uses 'token' from cookies 

  if (!token) {
    return res.status(403).json({ error: 'Authentication required.' });
  }

  const decoded = jwt.decode(token);
  console.log('Decoded:', decoded);
  console.log('Token expires at:', new Date(decoded.exp * 1000));  

  jwt.verify(token, process.env.JWTSECRET || '', (err, decoded) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.body.userid = decoded.id; // Attach the user ID from the token to the request body
    req.body.userType = decoded.userType; // Attach the userType from the token to the request body
    next();
  });
};

// GET: Retrieve all opportunities (no filter on user_id)
router.get('/opportunities/all', async (req, res) => {
  try {
    const query = `SELECT * FROM opportunities`;
    const opportunities = await db.execute(query)
    res.json(opportunities.rows || []);

  } catch (err) {
    res.status(500).json({ error: 'Database error backend.' , details: err.message });
  }
});

// GET: Retrieve opportunities for a specific user (filtered by user_id)
router.get('/opportunities', authenticate, async (req, res) => {
  const { userid } = req.body; 
  
  try {
    const query = `SELECT * FROM opportunities WHERE user_id = ?`;
    const opportunities = await db.execute(query, [userid]);
    //console.log('Opportunities:', opportunities);
    res.json(opportunities.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error.'});
  }
});

// GET: Find opportunities near a location
router.get('/opportunities/nearby', authenticate, async (req, res) => {
  const { location, radius } = req.query; // e.g. location=San Francisco&radius=10 (miles)

  if (!location || !radius) {
    return res.status(400).json({ error: 'Location and radius are required query parameters.' });
  }

  try {
    const userCoords = await getCoordinates(location);
    if (!userCoords) {
      return res.status(400).json({ error: 'Unable to geocode the provided location.' });
    }

    const result = await db.execute(`SELECT * FROM opportunities`);
    const allOpportunities = result.rows;

    const filtered = [];
    for (const opp of allOpportunities) {
      const coords = await getCoordinates(opp.location);
      if (!coords) continue;

      const dist = calculateDistance(userCoords.lat, userCoords.lon, coords.lat, coords.lon);
      if (dist <= parseFloat(radius)) {
        filtered.push({ ...opp, distance: dist.toFixed(2) });
      }
    }

    res.json(filtered);
  } catch (err) {
    console.error('Error in nearby search:', err);
    res.status(500).json({ error: 'Error processing location search.' });
  }
});


// POST: Create a new opportunity
router.post('/opportunities', authenticate, async (req, res) => {
  const { nonprofit_name, title, description, date, time, location, userType } = req.body;
  if (userType !== 'nonprofit') {
    return res.status(403).json({ error: 'Only nonprofit users can create opportunities.' });
  } 
  
  const { userid } = req.body; // Directly accessing userid from request body
  //console.log('User ID:', userid); // Debugging line to check if userid is being set correctly
  if (!nonprofit_name || !title || !description || !date || !time || !location) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const query = `INSERT INTO opportunities (user_id, nonprofit_name, title, description, date, time, location) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const result = await db.execute(query, [userid, nonprofit_name, title, description, date, time, location]);
    res.status(201).json({ message: 'Opportunity created successfully.', opportunityId: Number(result.lastInsertRowid) });
  } catch (err) {
    console.error('Error creating opportunity:', err);
    res.status(500).json({ error: 'Database error.' });
  }
});

// PUT: Edit an opportunity
router.put('/opportunities/:id', authenticate, async (req, res) => {
  const { nonprofit_name, title, description, date, time, location } = req.body;
  const { id } = req.params;
  const { userid } = req.body; // Directly accessing userid from request body

  if (!nonprofit_name || !title || !description || !date || !time || !location) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Ensure the opportunity exists and that the user matches the current user
    const getOpportunityQuery = `SELECT * FROM opportunities WHERE id = ?`;
    const rowResult = await db.execute(getOpportunityQuery, [id]);
    const row = rowResult.rows;

    if (row.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }
    if (row[0].user_id !== userid) {
      return res.status(403).json({ error: 'You are not authorized to edit this opportunity.' });
    }

    const updateQuery = `UPDATE opportunities SET nonprofit_name = ?, title = ?, description = ?, date = ?, time = ?, location = ? WHERE id = ? AND user_id = ?`;

    const result = await db.execute(updateQuery, [nonprofit_name, title, description, date, time, location, id, userid]);

    if (result.changes === 0) {
      return res.status(400).json({ error: 'No changes made to the opportunity.' });
    }

    res.json({ message: 'Opportunity updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error.' });
  }
});

// DELETE: Delete an opportunity
router.delete('/opportunities/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { userid } = req.body; // Directly accessing userid from request body

  try {
    const getOpportunityQuery = `SELECT * FROM opportunities WHERE id = ?`;
    const rowResult = await db.execute(getOpportunityQuery, [id]);
    const row = rowResult.rows;

    if (row.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }
    if (row[0].user_id !== userid) {
      return res.status(403).json({ error: 'You are not authorized to delete this opportunity.' });
    }

    const deleteQuery = `DELETE FROM opportunities WHERE id = ? AND user_id = ?`;

    const result = await db.execute(deleteQuery, [id, userid]);

    if (result.changes === 0) {
      return res.status(400).json({ error: 'No opportunity deleted.' });
    }

    res.json({ message: 'Opportunity deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error.' });
  }
});

module.exports = router;
