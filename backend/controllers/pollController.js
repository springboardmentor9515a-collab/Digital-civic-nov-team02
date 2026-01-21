const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

// 1. Create a Poll
exports.createPoll = async (req, res) => {
  try {
    const { title, options, targetLocation, description } = req.body;
    if (!options || options.length < 2) {
      return res.status(400).json({ message: "A poll must have at least 2 options." });
    }

    const poll = await Poll.create({
      title,
      description,
      options: options.map(opt => ({ text: opt })),
      targetLocation,
      createdBy: req.user.id
    });
    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. Get All Polls
exports.getPolls = async (req, res) => {
  try {
    const { location } = req.query;
    const filter = location ? { targetLocation: location } : {};
    
    const polls = await Poll.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(polls); 
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 3. Get Single Poll (THE MISSING FUNCTION)
exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('createdBy', 'name');
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 4. Vote on Poll
exports.voteOnPoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const pollId = req.params.id;
    const userId = req.user.id;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const existingVote = await Vote.findOne({ poll: pollId, user: userId });
    if (existingVote) {
      return res.status(400).json({ message: "You have already voted on this poll" });
    }

    await Vote.create({ poll: pollId, user: userId });
    poll.options[optionIndex].votes += 1;
    await poll.save();

    res.status(200).json(poll);
  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ message: "You have already voted on this poll" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};