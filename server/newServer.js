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

// Trust proxy (needed on platforms like Render to handle secure cookies correctly)
app.set('trust proxy', 1);

// CORS configuration - allow local dev and deployed frontend origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://causeconnectus.onrender.com" 
];

app.use(cors({
  origin: function(origin, callback) {
      console.log("CORS Origin:", origin);

    // Allow requests with no origin like mobile apps, curl, Postman
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

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

// Login
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
    
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
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

// Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.send("Logged out");
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
