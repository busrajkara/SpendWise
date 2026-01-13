const express = require('express');
const { createBudget, getBudgets } = require('../controllers/budgetController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createBudget);
router.get('/', getBudgets);

module.exports = router;
