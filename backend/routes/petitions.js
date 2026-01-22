const express = require("express");
const router = express.Router();
const Petition = require("../models/Petition");
const Signature = require("../models/Signature");
const auth = require("../middleware/auth");
const { isOfficial } = require("../middleware/roles");

/* ==========================
   1. CREATE PETITION
   POST /api/petitions
   Citizen only
========================== */
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "citizen") {
      return res
        .status(403)
        .json({ message: "Only citizens can create petitions" });
    }

    let { title, description, category, location, goal } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Handle location object (frontend may send { label: "...", value: "..." })
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

    return res.status(201).json(petition);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ==========================
   2. GET ALL PETITIONS (FILTER)
   GET /api/petitions
   Public endpoint
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

    return res.json(petitions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ==========================
   2B. OFFICIAL LOCAL PETITIONS
   GET /api/petitions/local
   Official only
========================== */
router.get("/local", auth, isOfficial, async (req, res) => {
  try {
    const officialLocation = req.user.location;

    const petitions = await Petition.find({
      location: { $regex: `^${officialLocation}$`, $options: "i" },
    })
      .populate("creator", "name role")
      .sort({ createdAt: -1 });

    return res.json(petitions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ==========================
   3. GET PETITION BY ID
   GET /api/petitions/:id
   Includes accurate signatureCount
========================== */
router.get("/:id", async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id).populate(
      "creator",
      "name role location"
    );

    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    const count = await Signature.countDocuments({ petition: petition._id });

    return res.json({
      ...petition.toObject(),
      signatureCount: count,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ==========================
   4. SIGN PETITION
   POST /api/petitions/:id/sign
   Citizen only
========================== */
router.post("/:id/sign", auth, async (req, res) => {
  try {
    if (req.user.role !== "citizen") {
      return res
        .status(403)
        .json({ message: "Only citizens can sign petitions" });
    }

    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    if (petition.status !== "active") {
      return res.status(400).json({ message: "Petition is not active" });
    }

    if (String(petition.creator) === String(req.user.id)) {
      return res
        .status(400)
        .json({ message: "You cannot sign your own petition" });
    }

    await Signature.create({
      petition: petition._id,
      user: req.user.id,
    });

    const updated = await Petition.findByIdAndUpdate(
      petition._id,
      { $inc: { signatureCount: 1 } },
      { new: true }
    );

    return res.json({
      message: "Petition signed successfully",
      signatureCount: updated.signatureCount,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You already signed this petition" });
    }
    return res.status(500).json({ message: err.message });
  }
});

/* ==========================
   5. EDIT PETITION
   PUT /api/petitions/:id
   Citizen + creator only
========================== */
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "citizen") {
      return res
        .status(403)
        .json({ message: "Only citizens can edit petitions" });
    }

    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    if (String(petition.creator) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You can edit only your own petitions" });
    }

    if (petition.status === "closed") {
      return res.status(400).json({ message: "Closed petitions cannot be edited" });
    }

    let { title, description, category, location, goal } = req.body;

    if (typeof location === "object" && location.label) {
      location = location.label;
    }

    if (title !== undefined && !title) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }
    if (description !== undefined && !description) {
      return res.status(400).json({ message: "Description cannot be empty" });
    }
    if (category !== undefined && !category) {
      return res.status(400).json({ message: "Category cannot be empty" });
    }
    if (location !== undefined && !location) {
      return res.status(400).json({ message: "Location cannot be empty" });
    }

    if (title !== undefined) petition.title = title;
    if (description !== undefined) petition.description = description;
    if (category !== undefined) petition.category = category;
    if (location !== undefined) petition.location = location;
    if (goal !== undefined) petition.goal = goal;

    await petition.save();

    return res.json({
      message: "Petition updated successfully",
      petition,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ==========================
   6. DELETE PETITION
   DELETE /api/petitions/:id
   Citizen + creator only
========================== */
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "citizen") {
      return res
        .status(403)
        .json({ message: "Only citizens can delete petitions" });
    }

    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    if (String(petition.creator) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You can delete only your own petitions" });
    }

    await Signature.deleteMany({ petition: petition._id });
    await Petition.deleteOne({ _id: petition._id });

    return res.json({ message: "Petition deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ==========================
   7. UPDATE PETITION STATUS (OFFICIAL)
   PATCH /api/petitions/:id/status
   Official only + location restricted
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

    const officialLocation = req.user.location || "";
    if (
      !petition.location ||
      petition.location.toLowerCase() !== officialLocation.toLowerCase()
    ) {
      return res.status(403).json({
        message: "Access denied. You can update petitions only in your location.",
      });
    }

    petition.status = status;
    await petition.save();

    return res.json({
      message: "Status updated successfully",
      petition,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
