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

// GET: Retrieve all opportunities for STUDENTS (no filter on user_id) - ONLY ACTIVE EVENTS
router.get('/opportunities/all', async (req, res) => {
  try {
    // Get current date in YYYY-MM-DD format for comparison
    const today = new Date().toISOString().split('T')[0];
    
    const query = `SELECT * FROM opportunities WHERE date >= ? ORDER BY date ASC, time ASC`;
    const opportunities = await db.execute(query, [today]);
    
    // Helper function to format time to PST with AM/PM
    const formatTimeToPST = (timeString) => {
      if (!timeString) return '';
      
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      return date.toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };
    
    // Helper function to format date without timezone issues
    const formatDateWithoutTimezone = (dateString) => {
      if (!dateString) return '';
      
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // Map the database fields to match frontend Event type
    const mappedEvents = opportunities.rows.map(event => ({
      id: event.id,
      title: event.title,
      organization: event.nonprofit_name,
      body: event.description,
      createdDate: event.created_at || new Date().toISOString(),
      author_id: event.user_id,
      startDate: event.date,
      startTime: event.time,
      endDate: event.end_date || event.date,
      endTime: event.end_time || "",
      location: event.location,
      cause: event.cause || "",
      status: "upcoming",
      formattedDate: formatDateWithoutTimezone(event.date),
      formattedTime: formatTimeToPST(event.time),
      rawTime: event.time
    }));

    res.json(mappedEvents);

  } catch (err) {
    console.error('Error fetching all opportunities:', err);
    res.status(500).json({ error: 'Database error backend.', details: err.message });
  }
});

// GET: Retrieve opportunities for ORGANIZATIONS (filtered by user_id) - ALL EVENTS (past and future)
router.get('/opportunities', authenticate, async (req, res) => {
  const { userid } = req.body; 
  
  try {
    const query = `SELECT * FROM opportunities WHERE user_id = ?`;
    const opportunities = await db.execute(query, [userid]);
    
    // Helper function to format time to PST with AM/PM
    const formatTimeToPST = (timeString) => {
      if (!timeString) return '';
      
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      return date.toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };
    
    // Helper function to format date without timezone issues
    const formatDateWithoutTimezone = (dateString) => {
      if (!dateString) return '';
      
      // Parse the date as local date (avoid timezone conversion)
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // Map the database fields to match frontend Event type
    const mappedEvents = opportunities.rows.map(event => ({
      id: event.id,
      title: event.title,
      organization: event.nonprofit_name,
      body: event.description,
      createdDate: event.created_at || new Date().toISOString(),
      author_id: event.user_id,
      startDate: event.date,
      startTime: event.time,
      endDate: event.end_date || event.date,
      endTime: event.end_time || "",
      location: event.location,
      cause: event.cause || "",
      status: "upcoming",
      formattedDate: formatDateWithoutTimezone(event.date),
      formattedTime: formatTimeToPST(event.time),
      rawTime: event.time
    }));
    
    res.json(mappedEvents);
  } catch (err) {
    console.error('Error fetching opportunities:', err);
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
  const { userid } = req.body;

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

    // Step 1: Delete all volunteer signups for this event first
    const deleteSignupsQuery = `DELETE FROM volunteer_signups WHERE opportunity_id = ?`;  
    const deleteSignupsResult = await db.execute(deleteSignupsQuery, [id]);

    console.log(`Deleted ${deleteSignupsResult.changes} volunteer signups for event ${id}`);

    // Step 2: Delete the opportunity itself
    const deleteQuery = `DELETE FROM opportunities WHERE id = ? AND user_id = ?`;
    const result = await db.execute(deleteQuery, [id, userid]);

    if (result.changes === 0) {
      return res.status(400).json({ error: 'No opportunity deleted.' });
    }

    console.log(`Successfully deleted event ${id} and ${deleteSignupsResult.changes} associated signups`);

    res.json({ 
      message: 'Opportunity and all volunteer signups deleted successfully.',
      deletedSignups: deleteSignupsResult.changes
    });
  } catch (err) {
    console.error('Error deleting opportunity:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

module.exports = router;