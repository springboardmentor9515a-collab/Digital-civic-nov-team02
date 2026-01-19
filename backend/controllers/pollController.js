const mongoose = require("mongoose");
const Poll = require("../models/Poll");

/* =========================
   CREATE POLL (OFFICIAL)
========================= */
exports.createPoll = async (req, res) => {
  try {
    const { title, options, targetLocation } = req.body;

    if (!title || !Array.isArray(options) || options.length < 2 || !targetLocation) {
      return res.status(400).json({
        message: "Title, location & minimum 2 options required",
      });
    }

    const formattedOptions = options.map(text => ({
      text,
      votes: 0,
    }));

    const poll = await Poll.create({
      title,
      options: formattedOptions,
      targetLocation,
      createdBy: req.user.id,
      status: "active",
      voters: [],
    });

    res.status(201).json({
      message: "Poll created successfully",
      poll,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET POLLS (LOCATION BASED)
========================= */
exports.getPolls = async (req, res) => {
  try {
    const polls = await Poll.find({
      targetLocation: req.user.location,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name role");

    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET POLL BY ID
========================= */
exports.getPollById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid poll ID" });
    }

    const poll = await Poll.findById(id).populate(
      "createdBy",
      "name role"
    );

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   VOTE ON POLL (CITIZEN)
========================= */
exports.voteOnPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;

    if (optionIndex === undefined) {
      return res.status(400).json({ message: "Option index required" });
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.status !== "active") {
      return res.status(400).json({ message: "Poll is closed" });
    }

    if (!poll.options[optionIndex]) {
      return res.status(400).json({ message: "Invalid option selected" });
    }

    // ✅ FIX: ObjectId comparison
    const alreadyVoted = poll.voters.some(
      voterId => voterId.toString() === req.user.id
    );

    if (alreadyVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }

    poll.options[optionIndex].votes += 1;
    poll.voters.push(req.user.id);

    await poll.save();

    res.status(200).json({
      message: "Vote recorded successfully",
      poll,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
