require("dotenv").config()
const jwt = require("jsonwebtoken")
const marked = require("marked")
const sanitizeHTML = require('sanitize-html')
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const express = require("express")

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
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                createdDate TEXT,
                authorid INTEGER,
                FOREIGN KEY (authorid) REFERENCES users (id)
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

app.get("/", async (req, res) => {
    if(req.user) {
        const posts = await db.execute({
            sql: "SELECT * FROM posts WHERE authorid = ? ORDER BY createdDate DESC",
            args: [req.user.userid]
        })
        return res.render("dashboard", {posts: posts.rows})
    }
    res.render("homepage")
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


    res.render("nonprofit-homepage", {nonprofitName})
})

app.post("/login", async (req, res) => {
    let errors = []

    if(typeof req.body.username !== "string") req.body.username = ""
    if(typeof req.body.password !== "string") req.body.password = ""

    if(req.body.username.trim() == "") errors = ["Invalid username/password"]
    if(req.body.password == "") errors = ["Invalid username/password"]

    if(errors.length) {
        return res.render("login", {errors})
    }

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

    const profile = await db.execute({
        sql: "SELECT interests FROM student_profiles WHERE user_id = ?",
        args: [user.id]
    })

    if (profile.rows[0] && profile.rows[0].interests && profile.rows[0].interests.trim().length > 0) {
        return res.redirect("/student-homepage")
    }

    res.redirect("/student-nonprofit")
})

function mustBeLoggedIn(req, res, next) {
    if(req.user) {
        return next()
    }
    return res.redirect("/")
}

app.get("/create-post", mustBeLoggedIn, (req, res) => {
    res.render("create-post")
})

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

app.get("/edit-post/:id", mustBeLoggedIn, async (req, res) => {
    const post = await db.execute({
        sql: "SELECT * FROM posts WHERE id = ?",
        args: [req.params.id]
    })

    if (post.rows.length === 0) {
        return res.redirect("/")
    }

    if (post.rows[0].authorid !== req.user.userid) {
        return res.redirect("/")
    }

    res.render("edit-post", { post: post.rows[0] })
})

app.post('/student-profile', mustBeLoggedIn, async (req, res) => {
    const existingProfile = await db.execute({
        sql: "SELECT 1 FROM student_profiles WHERE user_id = ?",
        args: [req.user.userid]
    })

    if (existingProfile.rows.length > 0) {
        return res.redirect('/interests')
    }
    
    await db.execute({
        sql: "INSERT INTO student_profiles (user_id, full_name, age, school, bio) VALUES(?, ?, ?, ?, ?)",
        args: [
            req.user.userid,
            req.body.fullName,
            req.body.age,
            req.body.school,
            req.body.bio
        ]
    })

    res.redirect('/interests')
})

app.post("/edit-post/:id", mustBeLoggedIn, async (req, res) => {
    const post = await db.execute({
        sql: "SELECT * FROM posts WHERE id = ?",
        args: [req.params.id]
    })

    if (post.rows.length === 0) {
        return res.redirect("/")
    }

    if (post.rows[0].authorid !== req.user.userid) {
        return res.redirect("/")
    }

    const errors = sharedPostValidation(req)

    if (errors.length) {
        return res.render("edit-post", { errors })
    }

    await db.execute({
        sql: "UPDATE posts SET title = ?, body = ? WHERE id = ?",
        args: [req.body.title, req.body.body, req.params.id]
    })

    res.redirect(`/post/${req.params.id}`)
})

app.post("/delete-post/:id", mustBeLoggedIn, async (req, res) => {
    const post = await db.execute({
        sql: "SELECT * FROM posts WHERE id = ?",
        args: [req.params.id]
    })

    if(post.rows.length === 0) {
        return res.redirect("/")
    }

    if(post.rows[0].authorid !== req.user.userid) {
        return res.redirect("/")
    }

    await db.execute({
        sql: "DELETE FROM posts WHERE id = ?",
        args: [req.params.id]
    })

    res.redirect("/")
})

app.get("/post/:id", async (req, res) => {
    const post = await db.execute({
        sql: "SELECT posts.*, users.username FROM posts INNER JOIN users ON posts.authorid = users.id WHERE posts.id = ?",
        args: [req.params.id]
    })

    if(post.rows.length === 0) {
        return res.redirect("/")
    }

    const isAuthor = req.user && post.rows[0].authorid === req.user.userid

    res.render("single-post", {post: post.rows[0], isAuthor})
})

app.post("/create-post", mustBeLoggedIn, async (req, res) => {
    const errors = sharedPostValidation(req)

    if(errors.length) {
        return res.render("create-post", {errors})
    }

    const result = await db.execute({
        sql: "INSERT INTO posts (title, body, authorid, createdDate) VALUES (?, ?, ?, ?)",
        args: [req.body.title, req.body.body, req.user.userid, new Date().toISOString()]
    })

    const postId = result.lastInsertRowid

    res.redirect(`/post/${postId}`)
})

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

app.listen(5001)