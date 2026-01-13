const express = require('express');
const {
  getSummary,
  getCategoryBreakdown,
  getDailyTrends,
  getBudgetStatus,
} = require('../controllers/statsController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all stats routes

router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/trends', getDailyTrends);
router.get('/budgets-status', getBudgetStatus);

module.exports = router;
