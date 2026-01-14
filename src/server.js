const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const statsRoutes = require('./routes/statsRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const protect = require('./middleware/authMiddleware');
const { scheduleRecurringTransactionsJob } = require('./services/cronService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/budgets', budgetRoutes);

// Protected Health check
app.get('/api/health', protect, (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running and authenticated', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  scheduleRecurringTransactionsJob();
});
