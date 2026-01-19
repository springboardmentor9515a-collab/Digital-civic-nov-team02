const express = require("express");
const router = express.Router();
const Petition = require("../models/Petition");
const Signature = require("../models/Signature");
const auth = require("../middleware/auth");
const { isOfficial } = require("../middleware/roles");

/* ==========================
   1. CREATE PETITION
========================== */
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "citizen") {
      return res.status(403).json({ message: "Only citizens can create petitions" });
    }

    let { title, description, category, location, goal } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Handle location object
    if (typeof location === "object" && location.label) {
      location = location.label;
    }

    const petition = await Petition.create({
      title,
      description,
      category,
      location,
      goal: goal || 100,
      creator: req.user.id,
      status: "active",
    });

    res.status(201).json(petition);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ==========================
   2. GET ALL PETITIONS (FILTER)
========================== */
router.get("/", async (req, res) => {
  try {
    const { location, category, status } = req.query;
    const query = {};

    if (location) query.location = { $regex: location, $options: "i" };
    if (category) query.category = category;
    if (status) query.status = status;

    const petitions = await Petition.find(query)
      .populate("creator", "name role")
      .sort({ createdAt: -1 });

    res.json(petitions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ==========================
   3. GET PETITION BY ID
========================== */
router.get("/:id", async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id)
      .populate("creator", "name role location");

    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    res.json(petition);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ==========================
   4. SIGN PETITION
========================== */
router.post("/:id/sign", auth, async (req, res) => {
  try {
    if (req.user.role !== "citizen") {
      return res.status(403).json({ message: "Only citizens can sign petitions" });
    }

    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    if (petition.status !== "active") {
      return res.status(400).json({ message: "Petition is not active" });
    }

    await Signature.create({
      petition: petition._id,
      user: req.user.id,
    });

    petition.signatureCount += 1;
    await petition.save();

    res.json({
      message: "Petition signed successfully",
      signatureCount: petition.signatureCount,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You already signed this petition" });
    }
    res.status(500).json({ message: err.message });
  }
});

/* ==========================
   5. UPDATE PETITION STATUS (OFFICIAL)
========================== */
router.patch("/:id/status", auth, isOfficial, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "under_review", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    petition.status = status;
    await petition.save();

    res.json({
      message: "Status updated successfully",
      petition,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
