const express = require('express');
const router = express.Router();
const { getGoals, createGoal, deleteGoal } = require('../controllers/goalController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getGoals);
router.post('/', createGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
