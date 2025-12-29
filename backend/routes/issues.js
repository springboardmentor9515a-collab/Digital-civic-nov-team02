const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");

// --- THE FIX IS HERE ---
// We removed { } because your auth.js exports the function directly
const verifyToken = require("../middleware/auth"); 

// POST /api/issues/create
// Creates a new issue
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    // Create new issue object
    const newIssue = new Issue({
      title,
      description,
      category,
      priority,
      user: req.user.id, // This comes from the decoded token in auth.js
    });

    // Save to DB
    const savedIssue = await newIssue.save();

    res.status(201).json(savedIssue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/issues
// Gets all issues (for the feed)
router.get("/", async (req, res) => {
  try {
    // .populate("user", "name") fetches the user's name instead of just their ID
    const issues = await Issue.find().populate("user", "name"); 
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;