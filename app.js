import express from "express";
import session from "express-session";
import multer from "multer";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// Fake admin account (replace with DB later)
const adminUser = {
  username: "admin",
  passwordHash: bcrypt.hashSync("admin123", 10),
};

// File upload setup
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed!"));
    }
    cb(null, true);
  },
});

// Authentication middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Home", user: req.session.user });
})

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
