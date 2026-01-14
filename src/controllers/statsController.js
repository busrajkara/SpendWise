const prisma = require('../prisma');

const getForecast = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const today = now.getDate();

  try {
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfToday = new Date(currentYear, currentMonth, today, 23, 59, 59, 999);

    const currentAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
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

    const currentSpending = parseFloat(currentAgg._sum.amount || 0);
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

    const lastAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
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

    const lastPeriodSpending = parseFloat(lastAgg._sum.amount || 0);

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
    console.error(error);
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

    // Get all categories to know which are INCOME and which are EXPENSE
    const categories = await prisma.category.findMany();
    const categoryTypeMap = {};
    categories.forEach((cat) => {
      categoryTypeMap[cat.id] = cat.type;
    });

    // Group transactions by categoryId and sum amounts
    const aggregations = await prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: {
        amount: true,
      },
      where,
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    aggregations.forEach((agg) => {
      const type = categoryTypeMap[agg.categoryId];
      const amount = parseFloat(agg._sum.amount || 0);

      if (type === 'INCOME') {
        totalIncome += amount;
      } else if (type === 'EXPENSE') {
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
    console.error(error);
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

    const categories = await prisma.category.findMany();
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.id] = cat;
    });

    const aggregations = await prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: {
        amount: true,
      },
      where,
    });

    const breakdown = aggregations
      .map((agg) => {
        const category = categoryMap[agg.categoryId];
        // Filter only for EXPENSE type as per typical dashboard breakdown, 
        // but user asked for "list of categories". 
        // Usually pie charts show expenses breakdown. 
        // Let's include only EXPENSE for now as it makes most sense for "spent in each".
        if (category && category.type === 'EXPENSE') {
          return {
            category: category.name,
            total: parseFloat(agg._sum.amount || 0),
            icon: category.icon,
          };
        }
        return null;
      })
      .filter((item) => item !== null)
      .sort((a, b) => b.total - a.total); // Sort by highest spend

    res.json(breakdown);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
};

const getDailyTrends = async (req, res) => {
  const userId = req.user.id;
  const { days = 30 } = req.query; // default to 30 days

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    // We need to sum daily spending (Expenses only)
    // Using $queryRaw to group by DATE(date)
    
    // Note: Prisma raw query returns BigInt for counts usually, but Decimal for sums. 
    // We cast to proper types.
    const result = await prisma.$queryRaw`
      SELECT 
        DATE(t.date) as date, 
        SUM(t.amount) as total 
      FROM "Transaction" t
      JOIN "Category" c ON t."categoryId" = c.id
      WHERE t."userId" = ${userId}
        AND c.type = 'EXPENSE'
        AND t.date >= ${startDate}
        AND t.date <= ${endDate}
      GROUP BY DATE(t.date)
      ORDER BY DATE(t.date) ASC
    `;

    // Format result
    const trends = result.map((row) => ({
      date: row.date.toISOString().split('T')[0], // Format YYYY-MM-DD
      total: parseFloat(row.total || 0),
    }));

    res.json(trends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch daily trends' });
  }
};

const getBudgetStatus = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  try {
    // 1. Get all budgets for the current month
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

    // 2. Calculate total spent for each budget's category in the current month
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const statusList = await Promise.all(
      budgets.map(async (budget) => {
        const aggregations = await prisma.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            userId,
            categoryId: budget.categoryId,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const spent = parseFloat(aggregations._sum.amount || 0);
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
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch budget status' });
  }
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getDailyTrends,
  getBudgetStatus,
};
