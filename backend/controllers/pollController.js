const mongoose = require("mongoose");
const Poll = require("../models/Poll");

/* =========================
   CREATE POLL (OFFICIAL)
========================= */
exports.createPoll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, options, targetLocation } = req.body;

    // ✅ allow fallback to official location if frontend passes empty
    const finalTargetLocation = String(targetLocation || req.user.location || "").trim();

    if (!title || !Array.isArray(options) || options.length < 2 || !finalTargetLocation) {
      return res.status(400).json({ message: "Invalid poll data" });
    }

    const cleanedOptions = options.map((o) => String(o).trim()).filter(Boolean);
    if (cleanedOptions.length < 2) {
      return res.status(400).json({ message: "Poll must have at least 2 options" });
    }

    const poll = await Poll.create({
      title: String(title).trim(),
      options: cleanedOptions.map((text) => ({ text, votes: 0 })),
      targetLocation: finalTargetLocation,
      createdBy: userId,
      voters: [],
      status: "active",
    });

    return res.status(201).json(poll);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET POLLS (AUTH + LOCATION)
   ✅ FIX: flexible location match
========================= */
exports.getPolls = async (req, res) => {
  try {
    const userLocation = String(req.user.location || "").trim();

    // ✅ location "contains" match (case-insensitive)
    const query = { status: "active" };
    if (userLocation) {
      query.targetLocation = { $regex: userLocation, $options: "i" };
    }

    const polls = await Poll.find(query)
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    return res.json(polls);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET POLL BY ID (FRONTEND CONTRACT)
========================= */
exports.getPollById = async (req, res) => {
  try {
    const pollId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ message: "Invalid poll id" });
    }

    const poll = await Poll.findById(pollId).populate("createdBy", "name");
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    return res.json({
      id: poll._id,
      question: poll.title,
      location: poll.targetLocation,
      createdBy: poll.createdBy?.name || "Unknown",
      status: poll.status,
      createdAt: poll.createdAt,
      voters: poll.voters || [],
      options: (poll.options || []).map((o, index) => ({
        id: index,
        text: o.text,
        votes: Number(o.votes || 0),
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =========================
   VOTE ON POLL (CITIZEN)
========================= */
exports.voteOnPoll = async (req, res) => {
  try {
    const pollId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ message: "Invalid poll id" });
    }

    const userId = req.user.id;
    const idx = Number(req.body.optionIndex);

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (poll.status !== "active") {
      return res.status(400).json({ message: "Poll is closed" });
    }

    if (Number.isNaN(idx) || idx < 0 || idx >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option selected" });
    }

    // ✅ FIX: ObjectId vs string compare
    const alreadyVoted = (poll.voters || []).some((v) => String(v) === String(userId));
    if (alreadyVoted) {
      return res.status(400).json({ message: "Already voted" });
    }

    poll.options[idx].votes = Number(poll.options[idx].votes || 0) + 1;
    poll.voters.push(userId);

    await poll.save();

    return res.json({
      message: "Vote recorded",
      options: poll.options.map((o, i) => ({
        id: i,
        text: o.text,
        votes: Number(o.votes || 0),
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
