const express = require('express');
const router = express.Router();
const { 
  respondToPetition, 
  getReports, 
  exportReports 
} = require('../controllers/governanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes here require login AND 'official' role
router.use(protect);
router.use(authorize('official'));

// 1. Respond to Petitions
router.post('/petitions/:id/respond', respondToPetition);

// 2. Get Analytics Dashboard (JSON)
router.get('/reports', getReports);

// 3. Download CSV Report
router.get('/reports/export', exportReports);

module.exports = router;