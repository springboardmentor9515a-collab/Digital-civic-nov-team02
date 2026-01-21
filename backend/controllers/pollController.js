const mongoose = require("mongoose");
const Poll = require("../models/Poll");

/* =========================
   CREATE POLL
========================= */
exports.createPoll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, options, targetLocation } = req.body;

    if (!title || !Array.isArray(options) || options.length < 2 || !targetLocation) {
      return res.status(400).json({ message: "Invalid poll data" });
    }

    const poll = await Poll.create({
      title,
      options: options.map(text => ({ text, votes: 0 })),
      targetLocation,
      createdBy: userId,
      voters: [],
    });

    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET POLLS
========================= */
exports.getPolls = async (req, res) => {
  try {
    const polls = await Poll.find({
      targetLocation: req.user.location,
      status: "active",
    }).sort({ createdAt: -1 });

    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET POLL BY ID
========================= */
exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate("createdBy", "name");

    if (!poll) return res.status(404).json({ message: "Poll not found" });

    res.json({
      id: poll._id,
      question: poll.title,
      location: poll.targetLocation,
      createdBy: poll.createdBy.name,
      status: poll.status,
      createdAt: poll.createdAt,
      options: poll.options.map((o, index) => ({
        id: index,
        text: o.text,
        votes: o.votes,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   VOTE ON POLL
========================= */
exports.voteOnPoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const userId = req.user.id;

    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (poll.voters.includes(userId)) {
      return res.status(400).json({ message: "Already voted" });
    }

    poll.options[optionIndex].votes += 1;
    poll.voters.push(userId);

    await poll.save();

    res.json({ message: "Vote recorded" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
