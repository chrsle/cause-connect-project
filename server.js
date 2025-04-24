require("dotenv").config()
const jwt = require("jsonwebtoken")
const marked = require("marked")
const sanitizeHTML = require('sanitize-html')
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const express = require("express")
const { calculateDistance, getCoordinates } = require('./utils/geocoding');


const { createClient } = require('@libsql/client');

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,  
    authToken: process.env.TURSO_AUTH_TOKEN  
});

// Database setup
async function createTables() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                user_type TEXT
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS student_profiles(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE,
                full_name TEXT,
                age INTEGER,
                school TEXT,
                bio TEXT,
                interests TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS nonprofit_profiles(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                nonprofit_name TEXT,
                location TEXT,
                category TEXT,
                statement TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )   
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS opportunities(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                nonprofit_name TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                location TEXT NOT NULL
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS volunteer_signups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                opportunity_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                signup_date TEXT NOT NULL,
                FOREIGN KEY (opportunity_id) REFERENCES opportunities(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(opportunity_id, user_id)  -- Prevent duplicate signups
            )
        `);

        console.log("✅ Tables ensured successfully!");
    } catch (err) {
        console.error("❌ Error ensuring tables:", err);
    }
}

createTables();

const app = express()

app.set("view engine", "ejs")
app.use(express.urlencoded({extended:false}))
app.use(express.static("public"))
app.use(cookieParser())

app.use(async function(req, res, next) {
    // Make our markdown function available
    res.locals.filterUserHTML = function(content) {
        return sanitizeHTML(marked.parse(content), {
            allowedTags: ["p", "br", "ul", "li", "ol", "strong", "bold", "i", "em", "h1", "h2", "h3", "h4", "h5", "h6"],
            allowedAttributes: {}
        })
    }

    res.locals.errors = []

    // Try to decode incoming cookie
    try {
        const decoded = jwt.verify(req.cookies.ourSimpleApp, process.env.JWTSECRET)
        req.user = decoded
    } catch(err) {
        req.user = false
    }

    res.locals.user = req.user
    console.log(req.user)

    next()
})



app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/logout", (req, res) => {
    res.clearCookie("ourSimpleApp")
    res.redirect("/")
})

app.get("/student-nonprofit", mustBeLoggedIn, async (req, res) => {
    const user = await db.execute({
        sql: "SELECT user_type FROM users WHERE id = ?",
        args: [req.user.userid]
    })

    const userType = user.rows[0]?.user_type

    // Check if profile exists
    const profileExists = await db.execute({
        sql: "SELECT 1 FROM student_profiles WHERE user_id = ?",
        args: [req.user.userid]
    })

    // Redirect logic
    if(userType == 'student') {
        return profileExists.rows.length > 0
            ? res.redirect('/interests')
            : res.redirect('/student-profile')
    }

    if(userType === 'nonprofit') {
        return res.redirect('/nonprofit-profile')
    }

    res.render("student-nonprofit")
})

app.get("/student-profile", mustBeLoggedIn, async (req, res) => {
    const profile = await db.execute({
        sql: "SELECT * FROM student_profiles WHERE user_id = ?",
        args: [req.user.userid]
    })

    if(profile.rows[0] && profile.rows[0].interests && profile.rows[0].interests.trim().length > 0) {
        return res.redirect('/student-homepage')
    }

    res.render("student-profile")
})

app.post("/student-nonprofit", mustBeLoggedIn, async (req, res) => {
    const { userType } = req.body;

    if (userType !== "student" && userType !== "nonprofit") {
        return res.render("student-nonprofit", { errors: ["Invalid user type."] });
    }

    await db.execute({
        sql: "UPDATE users SET user_type = ? WHERE id = ?",
        args: [userType, req.user.userid]
    });

    if (userType === "student") {
        return res.redirect("/student-profile");
    } else if (userType === "nonprofit") {
        return res.redirect("/nonprofit-profile");
    }
})

app.get("/nonprofit-profile", mustBeLoggedIn, async (req, res) => {
    const profile = await db.execute({
        sql: "SELECT * FROM nonprofit_profiles WHERE user_id = ?",
        args: [req.user.userid]
    })

    if(profile.rows.length > 0) {
        return res.redirect('/nonprofit-homepage')
    }

    res.render("nonprofit-profile")
})

app.post("/nonprofit-profile", mustBeLoggedIn, async (req, res) => {
    const existingProfile = await db.execute({
        sql: "SELECT 1 FROM nonprofit_profiles WHERE user_id = ?",
        args: [req.user.userid]
    })

    if(existingProfile.rows.length > 0) {
        return res.redirect('/nonprofit-homepage')
    }

    await db.execute({
        sql: "INSERT INTO nonprofit_profiles (user_id, nonprofit_name, location, category, statement) VALUES(?, ?, ?, ?, ?)",
        args: [
            req.user.userid,
            req.body.nonprofitName,
            req.body.location,
            req.body.category,
            req.body.statement
        ]
    })

    res.redirect('/nonprofit-homepage')
})

app.get("/nonprofit-homepage", mustBeLoggedIn, async(req, res) => {
    const profile = await db.execute({
        sql: "SELECT nonprofit_name FROM nonprofit_profiles WHERE user_id = ?",
        args: [req.user.userid]
    })

    const nonprofitName = profile.rows[0]?.nonprofit_name


    res.render("nonprofit-homepage", {
        nonprofitName,
        showManageOpportunities: true
    })
})

app.post("/login", async (req, res) => {
    let errors = []

    // Input validation
    if(typeof req.body.username !== "string") req.body.username = ""
    if(typeof req.body.password !== "string") req.body.password = ""

    if(req.body.username.trim() == "") errors = ["Invalid username/password"]
    if(req.body.password == "") errors = ["Invalid username/password"]

    if(errors.length) {
        return res.render("login", {errors})
    }

    // Check user exists
    const userInQuestion = await db.execute({
        sql: "SELECT * FROM users WHERE username = ?",
        args: [req.body.username]
    })

    if(userInQuestion.rows.length === 0) {
        errors = ["Invalid username/password."]
        return res.render("login", {errors})
    }

    const user = userInQuestion.rows[0]
    const matchOrNot = bcrypt.compareSync(req.body.password, user.password)
    if(!matchOrNot) {
        errors = ["Invalid username/password."]
        return res.render("login", {errors})
    }

    // Create JWT token
    const ourTokenValue = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, 
        userid: user.id, 
        username: user.username
    }, process.env.JWTSECRET)

    res.cookie("ourSimpleApp", ourTokenValue, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24
    })

    // Get user type
    const userTypeResult = await db.execute({
        sql: "SELECT user_type FROM users WHERE id = ?",
        args: [user.id]
    })
    const userType = userTypeResult.rows[0]?.user_type

    // Handle nonprofit users
    if (userType === 'nonprofit') {
        const nonprofitProfile = await db.execute({
            sql: "SELECT 1 FROM nonprofit_profiles WHERE user_id = ?",
            args: [user.id]
        })
        return nonprofitProfile.rows.length > 0 
            ? res.redirect('/nonprofit-homepage')
            : res.redirect('/nonprofit-profile')
    }

    // Handle student users - FIXED SECTION
    if (userType === 'student') {
        const studentProfile = await db.execute({
            sql: "SELECT id, interests FROM student_profiles WHERE user_id = ?",
            args: [user.id]
        })
        
        // No profile exists - go to profile creation
        if (studentProfile.rows.length === 0) {
            return res.redirect('/student-profile')
        }
        
        // Check if interests exist
        if (!studentProfile.rows[0].interests || studentProfile.rows[0].interests.trim() === '') {
            return res.redirect('/interests')
        }
        
        // If profile exists with interests, go to homepage
        return res.redirect('/student-homepage')
    }

    // New users without type selection
    return res.redirect('/student-nonprofit')
})

function mustBeLoggedIn(req, res, next) {
    if(req.user) {
        return next()
    }
    return res.redirect("/")
}

app.get("/interests", mustBeLoggedIn, (req, res) => {
    res.render("interests")
})

app.get("/student-homepage", mustBeLoggedIn, async(req, res) => {
    const profile = await db.execute({
        sql: "SELECT full_name FROM student_profiles WHERE user_id = ?",
        args: [req.user.userid]

    })

    const fullName = profile.rows[0]?.full_name || req.user.username


    res.render("student-homepage" ,{fullName})
})

app.get("/student-profile-button", mustBeLoggedIn, async(req,res) =>{
    const profile = await db.execute({
        sql: "SELECT full_name FROM student_profiles WHERE  user_id = ?",
        args: [req.user.userid]
    })

    const fullName = profile.rows[0]?. full_name || req.user.username

    res.render("student-profile-button", {fullName})
})

app.post("/interests", mustBeLoggedIn, async (req, res) => {
    let selectedInterests = req.body.interests

    if (!Array.isArray(selectedInterests)) {
        selectedInterests = [selectedInterests]
    }

    const interestsString = selectedInterests.join(", ")
    
    await db.execute({
        sql: "UPDATE student_profiles SET interests = ? WHERE user_id = ?",
        args: [interestsString, req.user.userid]
    })

    res.redirect("/student-homepage")
})

function sharedPostValidation(req) {
    const errors = []

    if(typeof req.body.title !== "string") req.body.title = ""
    if(typeof req.body.body !== "string") req.body.body = ""

    req.body.title = sanitizeHTML(req.body.title.trim(), {allowedTags: [], allowedAttributes: {}})
    req.body.body = sanitizeHTML(req.body.body.trim(), {allowedTags: [], allowedAttributes: {}})

    if(!req.body.title) errors.push("You must provide a title.")
    if(!req.body.body) errors.push("You must provide content.")

    return errors
}



app.post('/student-profile', mustBeLoggedIn, async (req, res) => {
    const existingProfile = await db.execute({
        sql: "SELECT interests FROM student_profiles WHERE user_id = ?",
        args: [req.user.userid]
    });

    // If profile exists and has interests, go to homepage
    if (existingProfile.rows.length > 0 && 
        existingProfile.rows[0].interests && 
        existingProfile.rows[0].interests.trim().length > 0) {
        return res.redirect('/student-homepage');
    }
    
    // If profile exists but no interests, go to interests
    if (existingProfile.rows.length > 0) {
        return res.redirect('/interests');
    }

    // Create new profile
    await db.execute({
        sql: "INSERT INTO student_profiles (user_id, full_name, age, school, bio) VALUES(?, ?, ?, ?, ?)",
        args: [
            req.user.userid,
            req.body.fullName,
            req.body.age,
            req.body.school,
            req.body.bio
        ]
    });

    // New profiles go to interests
    res.redirect('/interests');
});

app.get("/create-opportunity", mustBeLoggedIn,  async(req,res) =>{
    res.render("create-opportunity")


})

app.post('/create-opportunity', mustBeLoggedIn, async (req, res) => {
    try {
        // Extract and validate fields
        const { title, description, date, time, location } = req.body;
        const userId = req.user.userid;

        // Basic validation
        if (!title || !description || !date || !time || !location) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Get nonprofit name
        const nonprofitResult = await db.execute({
            sql: "SELECT nonprofit_name FROM nonprofit_profiles WHERE user_id = ?",
            args: [userId]
        });

        if (nonprofitResult.rows.length === 0) {
            return res.status(404).json({ error: 'Nonprofit profile not found.' });
        }

        const nonprofitName = nonprofitResult.rows[0].nonprofit_name;

        // Ensure all values are strings (convert if necessary)
        const insertValues = {
            userId: String(userId),
            nonprofitName: String(nonprofitName),
            title: String(title),
            description: String(description),
            date: String(date),
            time: String(time),
            location: String(location)
        };

        // Insert the opportunity
        await db.execute({
            sql: `INSERT INTO opportunities 
                 (user_id, nonprofit_name, title, description, date, time, location)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [
                insertValues.userId,
                insertValues.nonprofitName,
                insertValues.title,
                insertValues.description,
                insertValues.date,
                insertValues.time,
                insertValues.location
            ]
        });

        res.redirect('/nonprofit-homepage');
    } catch (error) {
        console.error('Error creating opportunity:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


// New route for viewing opportunities with location filtering
app.get('/view-opportunity', mustBeLoggedIn, async (req, res) => {
    try {
      // Get query parameters
      const locationFilter = req.query.location_filter || '';
      const maxDistance = parseInt(req.query.distance) || 25; // Default to 25 miles
      
      // 1. Get student's location from profile
      const studentProfile = await db.execute(
        "SELECT school as location FROM student_profiles WHERE user_id = ?",
        [req.user.userid]
      );
      const studentLocation = studentProfile.rows[0]?.location || '';
      
      // Use location filter if provided, otherwise use student location
      const searchLocation = locationFilter || studentLocation;
  
      // 2. Get all opportunities
      const allOpportunities = await db.execute(`
        SELECT o.*, np.nonprofit_name 
        FROM opportunities o
        JOIN nonprofit_profiles np ON o.user_id = np.user_id
      `);
  
      let opportunities = allOpportunities.rows;
  
      // 3. Add distance if location exists
      if (searchLocation) {
        const searchCoords = await getCoordinates(searchLocation);
        
        if (searchCoords) {
          for (const opp of opportunities) {
            const oppCoords = await getCoordinates(opp.location);
            opp.distance = oppCoords 
              ? calculateDistance(
                  searchCoords.lat, searchCoords.lon,
                  oppCoords.lat, oppCoords.lon
                ).toFixed(1)
              : 'Unknown';
          }
  
          // Filter by distance if specified
          if (maxDistance) {
            opportunities = opportunities.filter(opp => 
              opp.distance !== 'Unknown' && parseFloat(opp.distance) <= maxDistance
            );
          }
  
          // Sort by distance (nearest first)
          opportunities.sort((a, b) => {
            if (a.distance === 'Unknown') return 1;
            if (b.distance === 'Unknown') return -1;
            return parseFloat(a.distance) - parseFloat(b.distance);
          });
        }
      }
  
      res.render('view-opportunity', {
        opportunities,
        studentLocation,
        maxDistance,
        query: req.query // Pass the query object to the template
      });
  
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Server error");
    }
  });
  

app.get('/opportunity/:id', mustBeLoggedIn, async (req, res) => {
    try {
        // Get the opportunity details
        const opportunity = await db.execute({
            sql: `SELECT o.*, np.nonprofit_name, np.location AS org_location, np.category, np.statement
                 FROM opportunities o
                 JOIN nonprofit_profiles np ON o.user_id = np.user_id
                 WHERE o.id = ?`,
            args: [req.params.id]
        });

        if (opportunity.rows.length === 0) {
            return res.status(404).send("Opportunity not found");
        }

        // Check if user is already signed up
        const isSignedUp = await db.execute({
            sql: "SELECT 1 FROM volunteer_signups WHERE opportunity_id = ? AND user_id = ?",
            args: [req.params.id, req.user.userid]
        });

        // Get the message from query params
        const message = req.query.message;

        res.render("opportunity", {
            opportunity: opportunity.rows[0],
            isSignedUp: isSignedUp.rows.length > 0,
            message: message
        });
    } catch (error) {
        console.error('Error fetching opportunity:', error);
        res.status(500).send("Server error");
    }
});

app.post('/signup-opportunity/:id', mustBeLoggedIn, async (req, res) => {
    try {
        const opportunityId = req.params.id;
        const userId = req.user.userid;

        // Check if opportunity exists
        const opportunity = await db.execute({
            sql: "SELECT 1 FROM opportunities WHERE id = ?",
            args: [opportunityId]
        });

        if (opportunity.rows.length === 0) {
            return res.status(404).send("Opportunity not found");
        }

        // Check if already signed up
        const existingSignup = await db.execute({
            sql: "SELECT 1 FROM volunteer_signups WHERE opportunity_id = ? AND user_id = ?",
            args: [opportunityId, userId]
        });

        if (existingSignup.rows.length > 0) {
            return res.redirect(`/opportunity/${opportunityId}?message=already_signed_up`);
        }

        // Create new signup
        await db.execute({
            sql: "INSERT INTO volunteer_signups (opportunity_id, user_id, signup_date) VALUES (?, ?, ?)",
            args: [opportunityId, userId, new Date().toISOString()]
        });

        res.redirect(`/opportunity/${opportunityId}?message=signup_success`);
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).send("Server error");
    }
});

app.get("/nonprofit-opportunities", mustBeLoggedIn, async (req, res) => {
    try {
        // Get nonprofit name first
        const nonprofitResult = await db.execute({
            sql: "SELECT nonprofit_name FROM nonprofit_profiles WHERE user_id = ?",
            args: [req.user.userid]
        });

        if (nonprofitResult.rows.length === 0) {
            return res.status(404).send("Nonprofit profile not found");
        }

        const nonprofitName = nonprofitResult.rows[0].nonprofit_name;

        // Get all opportunities for this nonprofit
        const opportunities = await db.execute({
            sql: "SELECT * FROM opportunities WHERE user_id = ? ORDER BY date DESC",
            args: [req.user.userid]
        });

        res.render("nonprofit-opportunities", {
            opportunities: opportunities.rows,
            nonprofitName: nonprofitName
        });
    } catch (error) {
        console.error('Error fetching nonprofit opportunities:', error);
        res.status(500).send("Server error");
    }
});



app.get("/edit-opportunity/:id", mustBeLoggedIn, async (req, res) => {
    try {
        // Verify the opportunity belongs to the current nonprofit
        const opportunity = await db.execute({
            sql: "SELECT * FROM opportunities WHERE id = ? AND user_id = ?",
            args: [req.params.id, req.user.userid]
        });

        if (opportunity.rows.length === 0) {
            return res.status(404).send("Opportunity not found or you don't have permission to edit it");
        }

        res.render("edit-opportunity", {
            opportunity: opportunity.rows[0]
        });
    } catch (error) {
        console.error('Error fetching opportunity for edit:', error);
        res.status(500).send("Server error");
    }
});

app.post("/edit-opportunity/:id", mustBeLoggedIn, async (req, res) => {
    try {
        const { title, description, date, time, location } = req.body;
        const opportunityId = req.params.id;

        // Verify the opportunity belongs to the current nonprofit
        const verifyOwnership = await db.execute({
            sql: "SELECT 1 FROM opportunities WHERE id = ? AND user_id = ?",
            args: [opportunityId, req.user.userid]
        });

        if (verifyOwnership.rows.length === 0) {
            return res.status(403).send("You don't have permission to edit this opportunity");
        }

        // Update the opportunity
        await db.execute({
            sql: `UPDATE opportunities SET 
                 title = ?, 
                 description = ?, 
                 date = ?, 
                 time = ?, 
                 location = ?
                 WHERE id = ?`,
            args: [
                title,
                description,
                date,
                time,
                location,
                opportunityId
            ]
        });

        res.redirect('/nonprofit-opportunities');
    } catch (error) {
        console.error('Error updating opportunity:', error);
        res.status(500).send("Server error");
    }
});

app.post("/delete-opportunity/:id", mustBeLoggedIn, async (req, res) => {
    try {
        const opportunityId = req.params.id;

        // Verify the opportunity belongs to the current nonprofit
        const verifyOwnership = await db.execute({
            sql: "SELECT 1 FROM opportunities WHERE id = ? AND user_id = ?",
            args: [opportunityId, req.user.userid]
        });

        if (verifyOwnership.rows.length === 0) {
            return res.status(403).send("You don't have permission to delete this opportunity");
        }

        // First delete any signups for this opportunity
        await db.execute({
            sql: "DELETE FROM volunteer_signups WHERE opportunity_id = ?",
            args: [opportunityId]
        });

        // Then delete the opportunity
        await db.execute({
            sql: "DELETE FROM opportunities WHERE id = ?",
            args: [opportunityId]
        });

        res.redirect('/nonprofit-opportunities');
    } catch (error) {
        console.error('Error deleting opportunity:', error);
        res.status(500).send("Server error");
    }
});


app.get("/student-opportunities", mustBeLoggedIn, async (req, res) => {
    try {
        // Get all opportunities the student has signed up for
        const opportunities = await db.execute({
            sql: `SELECT o.*, np.nonprofit_name 
                 FROM opportunities o
                 JOIN volunteer_signups vs ON o.id = vs.opportunity_id
                 JOIN nonprofit_profiles np ON o.user_id = np.user_id
                 WHERE vs.user_id = ?
                 ORDER BY o.date DESC`,
            args: [req.user.userid]
        });

        res.render("student-opportunities", {
            opportunities: opportunities.rows
        });
    } catch (error) {
        console.error('Error fetching student opportunities:', error);
        res.status(500).send("Server error");
    }
});


app.post("/leave-opportunity/:id", mustBeLoggedIn, async (req, res) => {
    try {
        const opportunityId = req.params.id;
        const userId = req.user.userid;

        // Verify the student is actually signed up for this opportunity
        const signup = await db.execute({
            sql: "SELECT 1 FROM volunteer_signups WHERE opportunity_id = ? AND user_id = ?",
            args: [opportunityId, userId]
        });

        if (signup.rows.length === 0) {
            return res.status(404).send("You haven't signed up for this opportunity");
        }

        // Remove the signup
        await db.execute({
            sql: "DELETE FROM volunteer_signups WHERE opportunity_id = ? AND user_id = ?",
            args: [opportunityId, userId]
        });

        res.redirect("/student-opportunities");
    } catch (error) {
        console.error('Error leaving opportunity:', error);
        res.status(500).send("Server error");
    }
});




app.post("/register", async (req, res) => {
    const errors = []

    if(typeof req.body.username !== "string") req.body.username = ""
    if(typeof req.body.password !== "string") req.body.password = ""

    req.body.username = req.body.username.trim()

    if(!req.body.username) errors.push("You must provide a username.")
    if(req.body.username && req.body.username.length < 3) errors.push("Username must be at least 3 characters")
    if(req.body.username && req.body.username.length > 10) errors.push("Username cannot exceed 10 characters")
    if(req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only contain letters and numbers")

    const usernameCheck = await db.execute({
        sql: "SELECT * FROM users WHERE username = ?",
        args: [req.body.username]
    })

    if(usernameCheck.rows.length > 0) errors.push("That username is already taken.")

    if(!req.body.password) errors.push("You must provide a password.")
    if(req.body.password && req.body.password.length < 12) errors.push("Password must be at least 12 characters")
    if(req.body.password && req.body.password.length > 70) errors.push("Password cannot exceed 70 characters")

    if(errors.length) {
        return res.render("homepage", {errors})
    }

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(req.body.password, salt)

    const result = await db.execute({
        sql: "INSERT INTO users (username, password) VALUES (?, ?)",
        args: [req.body.username, hashedPassword]
    })

    const ourTokenValue = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        userid: result.lastInsertRowid.toString(),
        username: req.body.username
    }, process.env.JWTSECRET)

    res.cookie("ourSimpleApp", ourTokenValue, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24
    })

    res.redirect("/student-nonprofit")
})

app.get("/", async (req, res) => {
    // If user is logged in, redirect them to appropriate page
    if (req.user) {
        // Get user type
        const userTypeResult = await db.execute({
            sql: "SELECT user_type FROM users WHERE id = ?",
            args: [req.user.userid]
        })
        const userType = userTypeResult.rows[0]?.user_type
        
        // Handle nonprofit users
        if (userType === 'nonprofit') {
            const nonprofitProfile = await db.execute({
                sql: "SELECT 1 FROM nonprofit_profiles WHERE user_id = ?",
                args: [req.user.userid]
            })
            return nonprofitProfile.rows.length > 0 
                ? res.redirect('/nonprofit-homepage')
                : res.redirect('/nonprofit-profile')
        }
        
        // Handle student users
        if (userType === 'student') {
            const studentProfile = await db.execute({
                sql: "SELECT id, interests FROM student_profiles WHERE user_id = ?",
                args: [req.user.userid]
            })
            
            // No profile exists - go to profile creation
            if (studentProfile.rows.length === 0) {
                return res.redirect('/student-profile')
            }
            
            // Check if interests exist
            if (!studentProfile.rows[0].interests || studentProfile.rows[0].interests.trim() === '') {
                return res.redirect('/interests')
            }
            
            // If profile exists with interests, go to homepage
            return res.redirect('/student-homepage')
        }
        
        return res.redirect('/student-nonprofit')
    }
    
    // If not logged in, show the homepage
    res.render("homepage")
})

app.listen(5000)