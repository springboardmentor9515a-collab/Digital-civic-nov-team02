const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { isCitizen, isOfficial } = require("../middleware/roles");
const pollController = require("../controllers/pollController");

router.post("/", auth, isOfficial, pollController.createPoll);
router.get("/", auth, pollController.getPolls);
router.get("/:id", auth, pollController.getPollById);
router.post("/:id/vote", auth, isCitizen, pollController.voteOnPoll);

module.exports = router;
