const prisma = require('../prisma');

const EXCHANGE_RATES = {
  'USD': 35,
  'EUR': 38,
  'TL': 1
};

const convertToTL = (amount, currency) => {
  const rate = EXCHANGE_RATES[currency] || 1;
  return amount * rate;
};

const getForecast = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const today = now.getDate();

  try {
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfToday = new Date(currentYear, currentMonth, today, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfToday,
        },
        category: {
          type: 'EXPENSE',
        },
      },
    });

    const currentSpending = transactions.reduce((sum, t) => {
      return sum + convertToTL(parseFloat(t.amount), t.currency || 'USD');
    }, 0);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyAverage = currentSpending / today || 0;
    const predictedSpending = dailyAverage * daysInMonth;

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: currentMonth + 1,
        year: currentYear,
      },
    });

    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.limit), 0);
    const remainingBudget = totalBudget - predictedSpending;

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonth = lastMonthDate.getMonth();

    const startOfLastMonth = new Date(lastMonthYear, lastMonth, 1);
    const endOfLastPeriod = new Date(lastMonthYear, lastMonth, today, 23, 59, 59, 999);

    const lastTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfLastMonth,
          lte: endOfLastPeriod,
        },
        category: {
          type: 'EXPENSE',
        },
      },
    });

    const lastPeriodSpending = lastTransactions.reduce((sum, t) => {
      return sum + convertToTL(parseFloat(t.amount), t.currency || 'USD');
    }, 0);

    let percentageChange = 0;
    if (lastPeriodSpending > 0) {
      percentageChange = ((currentSpending - lastPeriodSpending) / lastPeriodSpending) * 100;
    }

    res.json({
      currentSpending,
      predictedSpending,
      remainingBudget,
      dailyAverage,
      totalBudget,
      lastPeriodSpending,
      percentageChange,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast stats' });
  }
};

const getSummary = async (req, res) => {
  const userId = req.user.id;
  const { month, year } = req.query;

  try {
    const where = {
      userId,
    };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((t) => {
      const amount = convertToTL(parseFloat(t.amount), t.currency || 'USD');
      if (t.category.type === 'INCOME') {
        totalIncome += amount;
      } else if (t.category.type === 'EXPENSE') {
        totalExpenses += amount;
      }
    });

    const netBalance = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      netBalance,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary stats' });
  }
};

const getCategoryBreakdown = async (req, res) => {
  const userId = req.user.id;
  const { month, year } = req.query;

  try {
    const where = {
      userId,
    };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
    });

    const categoryTotals = {};

    transactions.forEach((t) => {
      if (t.category.type === 'EXPENSE') {
        const amount = convertToTL(parseFloat(t.amount), t.currency || 'USD');
        if (!categoryTotals[t.category.name]) {
          categoryTotals[t.category.name] = {
            total: 0,
            icon: t.category.icon,
          };
        }
        categoryTotals[t.category.name].total += amount;
      }
    });

    const breakdown = Object.keys(categoryTotals)
      .map((catName) => ({
        category: catName,
        total: categoryTotals[catName].total,
        icon: categoryTotals[catName].icon,
      }))
      .sort((a, b) => b.total - a.total);

    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
};

const getDailyTrends = async (req, res) => {
  const userId = req.user.id;
  const { days = 30 } = req.query;

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    // Using raw SQL for date grouping but need to handle currency conversion manually or with complex SQL case
    // Since we need to support specific rates, complex SQL might be brittle if rates change.
    // Let's fetch data and aggregate in JS for consistency with other endpoints.
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        category: {
          type: 'EXPENSE',
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const dailyTotals = {};

    transactions.forEach((t) => {
      const dateKey = t.date.toISOString().split('T')[0];
      const amount = convertToTL(parseFloat(t.amount), t.currency || 'USD');
      
      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = 0;
      }
      dailyTotals[dateKey] += amount;
    });

    const trends = Object.keys(dailyTotals)
      .map((date) => ({
        date,
        total: dailyTotals[date],
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily trends' });
  }
};

const getBudgetStatus = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  try {
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
      include: {
        category: true,
      },
    });

    if (budgets.length === 0) {
      return res.json([]);
    }

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const statusList = await Promise.all(
      budgets.map(async (budget) => {
        const transactions = await prisma.transaction.findMany({
          where: {
            userId,
            categoryId: budget.categoryId,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const spent = transactions.reduce((sum, t) => {
          return sum + convertToTL(parseFloat(t.amount), t.currency || 'USD');
        }, 0);

        const limit = parseFloat(budget.limit);
        const percentage = (spent / limit) * 100;
        const remaining = limit - spent;

        return {
          category: budget.category.name,
          limit,
          spent,
          remaining,
          percentage: parseFloat(percentage.toFixed(2)),
          message: `You have spent ${percentage.toFixed(0)}% of your ${budget.category.name} budget`,
        };
      })
    );

    res.json(statusList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget status' });
  }
};

module.exports = {
  getForecast,
  getSummary,
  getCategoryBreakdown,
  getDailyTrends,
  getBudgetStatus,
};
