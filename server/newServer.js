require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { createClient } = require("@libsql/client");

const app = express();
const PORT = process.env.PORT || 5001;
const opportunitiesRouter = require('./src/routes/createEvents.js');
const reserveRouter = require('./src/routes/reserveEvents.js'); 
const userRouter = require('./src/routes/profiles.js'); 

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "https://causeconnectus.onrender.com", // frontend origin
  credentials: true,
}));

app.use('/api', opportunitiesRouter); 
app.use('/api', reserveRouter);
app.use('/api', userRouter);

// Database connection
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Helper: authenticate middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWTSECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Helper: Email validation function
const validateEmail = (email) => {
  if (!email) return false;
  
  // Check for @ symbol
  if (!email.includes('@')) return false;
  
  // Split by @ and check for domain part
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domainPart] = parts;
  
  // Check that both parts exist
  if (!localPart || !domainPart) return false;
  
  // Check that domain part contains a dot
  if (!domainPart.includes('.')) return false;
  
  // Check that there's content after the dot
  const domainParts = domainPart.split('.');
  const lastPart = domainParts[domainParts.length - 1];
  if (!lastPart || lastPart.length < 2) return false;
  
  return true;
};

// ===== ROUTES =====

// Health check
app.get("/", (req, res) => {
  res.send("API is running");
});

// Signup - Updated for email
app.post("/api/signup", async (req, res) => {
  const { email, password, usertype } = req.body;
  
  // Email validation
  if (!email) return res.status(400).send("You must provide an email address.");
  if (!validateEmail(email)) {
    return res.status(400).send("Please provide a valid email address.");
  }

  // Password validation (keeping existing validation)
  if (!password) return res.status(400).send("You must provide a password.");
  if (password.length < 12) return res.status(400).send("Password must be at least 12 characters.");
  if (password.length > 70) return res.status(400).send("Password cannot exceed 70 characters.");

  // Usertype validation
  if (!["student", "nonprofit"].includes(usertype)) {
    return res.status(400).send("Usertype must be either 'student' or 'nonprofit'.");
  }

  // Check if email already exists
  const existingUser = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email]
  });

  if (existingUser.rows.length > 0) {
    return res.status(400).send("That email address is already registered.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute({
      sql: "INSERT INTO users (email, password, user_type) VALUES (?, ?, ?)",
      args: [email, hashedPassword, usertype],
    });
    res.status(201).send("User created");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Error creating user");
  }
});

// Login - Fixed to properly use email
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }
  
  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email],
    });
    
    const user = result.rows[0];
    if (!user) return res.status(400).send("Invalid credentials");
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send("Invalid credentials");
    
    // Create JWT token with email instead of username
    const token = jwt.sign(
      { email: user.email, userType: user.user_type, id: user.id }, 
      process.env.JWTSECRET,
      { expiresIn: "1h" }
    );
    
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
    
    const userType = user.user_type;
    let nextRoute = "";
    
    if (userType === "nonprofit") {
      const nonprofitProfile = await db.execute({
        sql: "SELECT 1 FROM nonprofit_profiles WHERE user_id = ?",
        args: [user.id],
      });
      nextRoute = "/organization-page";
    } else if (userType === "student") {
      const studentProfile = await db.execute({
        sql: "SELECT interests FROM student_profiles WHERE user_id = ?",
        args: [user.id],
      });
      nextRoute = "/landing-page";
    } else {
      return res.status(400).send("Unrecognized user type");
    }
    
    return res.json({
      success: true,
      userType,
      nextRoute,
    });
  } catch (err) {
    console.error("[LOGIN] Error during login:", err);
    res.status(500).send("Error logging in");
  }
});

// Get current user info - Updated for email
app.get("/api/me", authenticateToken, async (req, res) => {
  const { id, userType } = req.user;  // From the JWT token

  try {
    // Base user info from `users` table - updated to use email
    const baseResult = await db.execute({
      sql: "SELECT id, email, user_type FROM users WHERE id = ?",
      args: [id],
    });

    if (baseResult.rows.length === 0) return res.status(404).send("User not found");

    const baseUser = baseResult.rows[0];

    // Extend with profile data based on user type
    let profile = null;

    if (userType === "nonprofit") {
      const profileResult = await db.execute({
        sql: "SELECT * FROM nonprofit_profiles WHERE user_id = ?",
        args: [id],
      });
      profile = profileResult.rows[0] || null;
    } else if (userType === "student") {
      const profileResult = await db.execute({
        sql: "SELECT * FROM student_profiles WHERE user_id = ?",
        args: [id],
      });
      profile = profileResult.rows[0] || null;
    } else {
      return res.status(400).send("Unrecognized user type");
    }

    res.json({ ...baseUser, profile });
  } catch (err) {
    console.error("Error in /api/me:", err);
    res.status(500).send("Server error");
  }
});

// Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.send("Logged out");
});

// Session check - Updated to return email
app.get("/api/session", authenticateToken, (req, res) => {
  res.json({ email: req.user.email });
});

// Protected example route - Updated to use email
app.get("/api/protected", authenticateToken, (req, res) => {
  res.send(`Welcome ${req.user.email}, this is protected data.`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});