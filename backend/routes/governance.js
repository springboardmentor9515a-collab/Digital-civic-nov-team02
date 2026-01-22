const express = require("express");
const router = express.Router();

const { getPetitionsForOfficial, respondToPetition } = require("../controllers/governanceController");

const auth = require("../middleware/auth");    // ✅ cookie + header
const roles = require("../middleware/roles");  // ✅ roles("official")

router.get("/petitions", auth, roles("official"), getPetitionsForOfficial);
router.post("/petitions/:id/respond", auth, roles("official"), respondToPetition);

module.exports = router;
