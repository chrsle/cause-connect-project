require("dotenv").config();
const express = require("express");
const path = require("path");
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

app.set('trust proxy', 1);

// CORS configuration - allow Netlify frontend
app.use(cors({
  origin: "https://causeconnectus.netlify.app", 
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Additional headers for Safari compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api', opportunitiesRouter);
app.use('/api', reserveRouter);
app.use('/api', userRouter);

// Database connection
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Helper: authenticate middleware - supports both Authorization header and cookies
const authenticateToken = (req, res, next) => {
  // Check for token in Authorization header first, then fall back to cookies
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1] || req.cookies.token;
  
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
  
  if (!email.includes('@')) return false;
  
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domainPart] = parts;
  
  if (!localPart || !domainPart) return false;
  
  if (!domainPart.includes('.')) return false;
  
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

// Signup
app.post("/api/signup", async (req, res) => {
  const { email, password, usertype } = req.body;
  
  if (!email) return res.status(400).send("You must provide an email address.");
  if (!validateEmail(email)) {
    return res.status(400).send("Please provide a valid email address.");
  }

  if (!password) return res.status(400).send("You must provide a password.");
  if (password.length < 12) return res.status(400).send("Password must be at least 12 characters.");
  if (password.length > 70) return res.status(400).send("Password cannot exceed 70 characters.");

  if (!["student", "nonprofit"].includes(usertype)) {
    return res.status(400).send("Usertype must be either 'student' or 'nonprofit'.");
  }

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

// Login - Updated to return token in response
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
    
    const token = jwt.sign(
      { email: user.email, userType: user.user_type, id: user.id }, 
      process.env.JWTSECRET,
      { expiresIn: "1h" }
    );
    
    // Set cookie as backup (for browsers that support it)
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 3600000, // 1 hour in milliseconds
      path: '/',
    });
    
    const userType = user.user_type;
    let nextRoute = "";
    
    if (userType === "nonprofit") {
      await db.execute({
        sql: "SELECT 1 FROM nonprofit_profiles WHERE user_id = ?",
        args: [user.id],
      });
      nextRoute = "/organization-page";
    } else if (userType === "student") {
      await db.execute({
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
      token, // Include token in response for localStorage storage
    });
  } catch (err) {
    console.error("[LOGIN] Error during login:", err);
    res.status(500).send("Error logging in");
  }
});

// Get current user info
app.get("/api/me", authenticateToken, async (req, res) => {
  const { id, userType } = req.user;

  try {
    const baseResult = await db.execute({
      sql: "SELECT id, email, user_type FROM users WHERE id = ?",
      args: [id],
    });

    if (baseResult.rows.length === 0) return res.status(404).send("User not found");

    const baseUser = baseResult.rows[0];

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

// Logout - Updated to also clear localStorage token
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
});

// Session check
app.get("/api/session", authenticateToken, (req, res) => {
  res.json({ email: req.user.email });
});

// Protected example route
app.get("/api/protected", authenticateToken, (req, res) => {
  res.send(`Welcome ${req.user.email}, this is protected data.`);
});

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});