const express = require('express');
const jwt = require('jsonwebtoken');
const { createClient } = require('@libsql/client');

const router = express.Router();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Reuse your authenticate middleware to decode & verify token, attach user info to req.body
const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ error: 'Authentication required.' });
  }

  jwt.verify(token, process.env.JWTSECRET || '', (err, decoded) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.body.userid = decoded.id;
    req.body.userType = decoded.userType;
    next();
  });
};

// GET user profile
router.get('/profile', authenticate, async (req, res) => {
  const { userid, userType } = req.body;

  try {
    let query;
    let params = [userid];
    if (userType === 'student') {
      query = `SELECT full_name, age, school, bio, interests FROM student_profiles WHERE user_id = ?`;
    } else if (userType === 'nonprofit') {
      query = `SELECT nonprofit_name, location, category, statement FROM nonprofit_profiles WHERE user_id = ?`;
    } else {
      return res.status(400).json({ error: 'Invalid userType.' });
    }

    //console.log('Executing query:', query, 'with params:', params);
    const result = await db.execute(query, params);
    //console.log('Query result:', result.rows);
    const profile = result.rows.length > 0 ? result.rows[0] : null;
    //console.log('Profile result:', profile);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Database error.' });
  }
});

// PUT update user profile
router.put('/profile', authenticate, async (req, res) => {
  const { userid, userType } = req.body;

  try {
    if (userType === 'student') {
      const { full_name, age, school, bio, interests } = req.body;

      if (!full_name || !age || !school || !bio || !interests) {
        return res.status(400).json({ error: 'All fields are required for student profile.' });
      }

      // Check if profile exists
      const checkResult = await db.execute(`SELECT id FROM student_profiles WHERE user_id = ?`, [userid]);

      if (checkResult.rows.length === 0) {
        // Insert new profile
        await db.execute(
          `INSERT INTO student_profiles (user_id, full_name, age, school, bio, interests) VALUES (?, ?, ?, ?, ?, ?)`,
          [userid, full_name, age, school, bio, interests]
        );
      } else {
        // Update existing profile
        await db.execute(
          `UPDATE student_profiles SET full_name = ?, age = ?, school = ?, bio = ?, interests = ? WHERE user_id = ?`,
          [full_name, age, school, bio, interests, userid]
        );
      }

      return res.json({ message: 'Student profile updated successfully.' });
    } else if (userType === 'nonprofit') {
      const { nonprofit_name, location, category, statement } = req.body;

      if (!nonprofit_name || !location || !category || !statement) {
        return res.status(400).json({ error: 'All fields are required for nonprofit profile.' });
      }

      // Check if profile exists
      const checkResult = await db.execute(`SELECT id FROM nonprofit_profiles WHERE user_id = ?`, [userid]);

      if (checkResult.rows.length === 0) {
        // Insert new profile
        await db.execute(
          `INSERT INTO nonprofit_profiles (user_id, nonprofit_name, location, category, statement) VALUES (?, ?, ?, ?, ?)`,
          [userid, nonprofit_name, location, category, statement]
        );
      } else {
        // Update existing profile
        await db.execute(
          `UPDATE nonprofit_profiles SET nonprofit_name = ?, location = ?, category = ?, statement = ? WHERE user_id = ?`,
          [nonprofit_name, location, category, statement, userid]
        );
      }

      return res.json({ message: 'Nonprofit profile updated successfully.' });
    } else {
      return res.status(400).json({ error: 'Invalid userType.' });
    }
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Database error.' });
  }
});

// POST to insert a new row into a specific table (safe, limited to allowed tables)
router.post('/profile', authenticate, async (req, res) => {
  const { userid, userType } = req.body;

  try {
    if (userType === 'student') {
      const { full_name, age, school, bio, interests } = req.body;

      if (!full_name || !age || !school || !bio || !interests) {
        return res.status(400).json({ error: 'All fields are required for student profile.' });
      }

      await db.execute(
        `INSERT INTO student_profiles (user_id, full_name, age, school, bio, interests) VALUES (?, ?, ?, ?, ?, ?)`,
        [userid, full_name, age, school, bio, interests]
      );

      return res.json({ message: 'Student profile created successfully.' });

    } else if (userType === 'nonprofit') {
      const { nonprofit_name, location, category, statement } = req.body;

      if (!nonprofit_name || !location || !category || !statement) {
        return res.status(400).json({ error: 'All fields are required for nonprofit profile.' });
      }

      await db.execute(
        `INSERT INTO nonprofit_profiles (user_id, nonprofit_name, location, category, statement) VALUES (?, ?, ?, ?, ?)`,
        [userid, nonprofit_name, location, category, statement]
      );

      return res.json({ message: 'Nonprofit profile created successfully.' });

    } else {
      return res.status(400).json({ error: 'Invalid user type.' });
    }

  } catch (err) {
    console.error('Error inserting profile:', err);
    res.status(500).json({ error: 'Database error during profile creation.' });
  }
});



module.exports = router;
