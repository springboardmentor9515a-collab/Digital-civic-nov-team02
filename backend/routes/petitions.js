const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Petition = require("../models/Petition");

// Create petition
router.post("/", auth, async (req, res) => {
  try {
    const petition = new Petition({
      ...req.body,
      author: req.user.id,
    });

    await petition.save();
    res.status(201).json(petition);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all petitions
router.get("/", async (req, res) => {
  try {
    const petitions = await Petition.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(petitions);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Get single petition
router.get("/:id", async (req, res) => {
  try {
    const p = await Petition.findById(req.params.id).populate(
      "author",
      "name email"
    );
    if (!p) return res.status(404).json({ message: "Petition not found" });

    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
