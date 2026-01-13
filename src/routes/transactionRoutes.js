const express = require('express');
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  exportTransactions,
} = require('../controllers/transactionController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all transaction routes

router.get('/export', exportTransactions);
router.post('/', createTransaction);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
