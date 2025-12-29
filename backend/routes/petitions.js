const express = require("express");
const router = express.Router();
const Petition = require("../models/Petition");
const auth = require("../middleware/auth");

// ==========================
// 1. CREATE PETITION (POST)
// ==========================
router.post("/", auth, async (req, res) => {
  try {
    console.log("📥 Creating Petition...");
    console.log("👤 User ID:", req.user.id);

    // 1. Destructure the data
    let { title, description, category, location, signatureGoal, goal } = req.body;

    // --- FIX: Handle Location Object vs String ---
    // If location is an object (from Map), grab the 'label'. If it's just text, keep it.
    if (typeof location === 'object' && location !== null && location.label) {
      location = location.label;
    }

    // --- FIX: Handle Goal Naming Mismatch ---
    const finalGoal = goal || signatureGoal || 100;

    // 2. Validate
    if (!title || !description || !category || !location) {
      console.log("❌ Missing Fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // 3. Create the object
    const newPetition = new Petition({
      title,
      description,
      category,
      location: location, // Now guaranteed to be a String
      goal: finalGoal,
      creator: req.user.id,
      status: "active",
      signers: [],
      signatureCount: 0
    });

    const savedPetition = await newPetition.save();
    console.log("✅ Saved to DB Successfully!");
    res.status(201).json(savedPetition);

  } catch (err) {
    console.error("🔥 Save Error:", err.message);
    res.status(500).json({ error: "Server Error: " + err.message });
  }
});

// ==========================
// 2. GET ALL PETITIONS (GET) - WITH FILTERS
// ==========================
router.get("/", async (req, res) => {
  try {
    // 1. Grab filters from URL (sent by Dashboard)
    const { location, category, status } = req.query;
    
    // 2. Build the query object
    let query = {};

    // Filter by Location
    if (location && location !== "All Locations") {
      query.location = { $regex: location, $options: "i" }; // "i" = case insensitive
    }

    // Filter by Category
    if (category && category !== "All Categories") {
      query.category = category;
    }

    // Filter by Status
    if (status && status !== "Status: All") {
      query.status = status.toLowerCase();
    }

    // 3. Find in Database
    const petitions = await Petition.find(query)
      .populate("creator", "name") // Show creator's name
      .sort({ createdAt: -1 });    // Newest first

    res.json(petitions);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==========================
// 3. SIGN PETITION (POST)
// ==========================
router.post("/:id/sign", auth, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    
    // Check if petition exists
    if (!petition) return res.status(404).json({ msg: "Petition not found" });

    // Check if user already signed
    if (petition.signers.includes(req.user.id)) {
      return res.status(400).json({ message: "You already signed this!" });
    }

    // Add signature
    petition.signers.push(req.user.id);
    petition.signatureCount = petition.signers.length;
    
    await petition.save();
    res.json(petition); // Return updated petition so frontend can show new count

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================
// 4. EDIT PETITION (PUT)
// ==========================
router.put("/:id", auth, async (req, res) => {
  try {
    let petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ msg: "Petition not found" });

    // Only creator can edit
    if (petition.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // Update allowed fields
    const { title, description, goal } = req.body;
    if (title) petition.title = title;
    if (description) petition.description = description;
    if (goal) petition.goal = goal;

    await petition.save();
    res.json(petition);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==========================
// 5. DELETE PETITION (DELETE)
// ==========================
router.delete("/:id", auth, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ msg: "Petition not found" });

    // Only creator can delete
    if (petition.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await petition.deleteOne();
    res.json({ msg: "Petition removed" });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;