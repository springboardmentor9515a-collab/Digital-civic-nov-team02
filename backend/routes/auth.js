const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* =========================
   REGISTER API
========================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    // Validation
    if (!name || !email || !password || !role || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Verification logic
    let isVerified = false;
    if (role === "citizen") {
      isVerified = true;
    }

    // Create user
    const newUser = new User({
      name,
      email,
      passwordHash,
      role,
      location,
      isVerified,
    });

    const savedUser = await newUser.save();

    // 🔐 Create JWT
    const token = jwt.sign(
      {
        id: savedUser._id,
        role: savedUser.role,
        location: savedUser.location,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 🍪 SET COOKIE (AUTO LOGIN)
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // localhost
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        location: savedUser.location,
        isVerified: savedUser.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   LOGIN API
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        location: user.location,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 🍪 SET COOKIE (THIS FIXES YOUR ISSUE)
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // MUST be false on localhost
    });

    res.status(200).json({
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

/* =========================
   LOGOUT API (OPTIONAL)
========================= */
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
