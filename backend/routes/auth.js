const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

const ALLOWED_ROLES = ["citizen", "official"];

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, location: user.location },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

/* ======================
   REGISTER
====================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    if (!name || !email || !password || !role || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      location,
    });

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ======================
   LOGIN
====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ======================
   SESSION (Milestone-1 REQUIRED)
====================== */
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  res.json({ user });
});

/* ======================
   LOGOUT
====================== */
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
