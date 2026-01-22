const express = require("express");
const router = express.Router();

const { getReports, exportReportsCSV } = require("../controllers/reportController");

const auth = require("../middleware/auth");          // ✅ cookie + header
const roles = require("../middleware/roles");        // ✅ roles("official")

router.get("/", auth, roles("official"), getReports);
router.get("/export", auth, roles("official"), exportReportsCSV);

module.exports = router;
