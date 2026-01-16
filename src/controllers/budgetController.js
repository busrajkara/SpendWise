const prisma = require('../prisma');

const createBudget = async (req, res) => {
  const { categoryId, limit, month, year } = req.body;
  const userId = req.user.id;

  if (!categoryId || !limit || !month || !year) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  try {
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid Category ID' });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId,
          month,
          year,
        },
      },
      update: {
        limit: parseFloat(limit),
      },
      create: {
        userId,
        categoryId,
        limit: parseFloat(limit),
        month,
        year,
      },
    });

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to set budget' });
  }
};

const getBudgets = async (req, res) => {
  const userId = req.user.id;
  const { month, year } = req.query;

  const where = {
    userId,
  };

  if (month && year) {
    where.month = parseInt(month);
    where.year = parseInt(year);
  }

  try {
    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: true,
      },
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

module.exports = {
  createBudget,
  getBudgets,
};
