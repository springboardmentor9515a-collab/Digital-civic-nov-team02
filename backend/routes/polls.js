const express = require('express');
const router = express.Router();
// Import the new getPollById function
const { createPoll, getPolls, getPollById, voteOnPoll } = require('../controllers/pollController');
const { protect, authorize } = require('../middleware/authMiddleware');

// 1. Get all polls
router.get('/', protect, getPolls);

// 2. Get Single Poll (✅ NEW ROUTE - Fixes "Unable to load details")
router.get('/:id', protect, getPollById);

// 3. Create a poll (Officials/Admins Only)
router.post('/', protect, authorize('official', 'admin'), createPoll);

// 4. Vote on a poll
router.put('/:id/vote', protect, voteOnPoll);

module.exports = router;