
require("dotenv").config();  
const dns = require("node:dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const User = require("./model/user.js");
const Journal = require("./model/journal.js");
const diaries = require("./router/diary.js");

// ---------- App setup ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(methodOverride("_method"));

app.use(session({
  secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// har page ko user aur flash messages mil jayein
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// ---------- Database ----------
main()
    .then(() => {
        console.log("connection success");

        app.listen(process.env.PORT || 3030, () => {
            console.log(`Server is running on port ${process.env.PORT || 3030}`);
        });
    })
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
}


// ---------- Public pages ----------
app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/signin", (req, res) => {
    res.render("signin.ejs");
});

app.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

// ---------- Auth ----------
// Sign Up
app.post("/signup", async (req, res, next) => {
    try {
        let { name, email, password } = req.body;
        name = (name || "").trim();
        email = (email || "").trim();
        password = password || "";

        if (!name || !email || !password) {
            req.flash("error", "Please fill in all the fields 🌸");
            return res.redirect("/signup");
        }
        if (name.length > 30) {
            req.flash("error", "Your name can be up to 30 characters.");
            return res.redirect("/signup");
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            req.flash("error", "Please enter a valid email address.");
            return res.redirect("/signup");
        }
        if (password.length < 6) {
            req.flash("error", "Your password needs at least 6 characters.");
            return res.redirect("/signup");
        }

        const registeredUser = await User.register(new User({ name, email }), password);
        await Journal.create({ name: `${name}'s Diary`, owner: registeredUser._id });

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", `Welcome to RosyPages, ${name}! 🌷`);
            res.redirect("/diaries");
        });
    } catch (e) {
        if (e.name === "UserExistsError" || e.code === 11000) {
            req.flash("error", "An account with this email already exists. Try signing in 🌷");
        } else {
            console.log(e);
            req.flash("error", "Something went wrong. Please try again.");
        }
        res.redirect("/signup");
    }
});

// Sign In
app.post("/signin",
    passport.authenticate("local", {
        failureRedirect: "/signin",
        failureFlash: "Incorrect email or password. Please try again 🌸"
    }),
    (req, res) => {
        req.flash("success", `Welcome back, ${req.user.name}! 🌸`);
        res.redirect("/diaries");
    }
);

// Logout  
app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You've been signed out. See you soon! 🌷");
        res.redirect("/");
    });
});

app.use("/diaries" , diaries);

// ---------- Errors ----------
// 404
app.use((req, res) => {
    res.status(404).render("error.ejs", { message: "Page not found 🌷" });
});

// Unexpected errors
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).render("error.ejs", { message: "Something went wrong. Please try again in a moment 🌸" });
});

// app.listen(3030, () => {
//     console.log("server is starting at the port 3030");
// });