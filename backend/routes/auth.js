const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER API
router.post("/register", async (req, res) => {
  try {
    // 1. Get data from the frontend
    const { name, email, password, role, location } = req.body;

    // 2. Validation: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // 3. Security: Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Milestone 1 Logic: Set Verification Status
    // Citizens are auto-verified. Officials must wait for admin approval.
    let isVerified = false;
    if (role === "citizen") {
      isVerified = true;
    }

    // 5. Create and Save the User
    const newUser = new User({
      name,
      email,
      passwordHash,
      role,
      location,
      isVerified, // This saves the status we calculated above
    });

    const savedUser = await newUser.save();

    // 6. Respond to frontend
    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        role: savedUser.role,
        isVerified: savedUser.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    // 3. Create Token (JWT)
    // We include role and location in the token for the dashboard to use later
    const token = jwt.sign(
      { id: user._id, role: user.role, location: user.location },
      process.env.JWT_SECRET || "default_secret_key", // Make sure to set JWT_SECRET in your .env file
      { expiresIn: "1h" }
    );

    // 4. Send Response
    // We send 'user' data back so the frontend knows if they are Verified
    res.status(200).json({
      token,
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;