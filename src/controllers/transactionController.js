const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
const prisma = require('../prisma');

const createTransaction = async (req, res) => {
  const { amount, categoryId, date, description, isRecurring, recurringInterval, currency } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  if (!categoryId) {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  try {
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid Category ID' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        categoryId,
        date: new Date(date),
        description,
        isRecurring: Boolean(isRecurring),
        recurringInterval: isRecurring ? recurringInterval || 'MONTHLY' : null,
        currency: currency || 'USD',
        userId,
      },
    });

    const transactionDate = new Date(date);
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    const budget = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId,
          month,
          year,
        },
      },
    });

    let response = { ...transaction };

    if (budget) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const aggregation = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          categoryId,
          date: { gte: startDate, lte: endDate },
        },
      });

      const totalSpent = parseFloat(aggregation._sum.amount || 0);

      if (totalSpent > parseFloat(budget.limit)) {
        response.warning = 'You have exceeded your monthly budget for this category!';
        response.message = 'Transaction added';
      }
    }

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

const getTransactions = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  const where = {
    userId,
  };

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { amount, categoryId, date, description, currency } = req.body;
  const userId = req.user.id;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this transaction' });
    }

    if (categoryId) {
        const categoryExists = await prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!categoryExists) {
            return res.status(400).json({ error: 'Invalid Category ID' });
        }
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        categoryId,
        date: date ? new Date(date) : undefined,
        description,
        currency,
      },
    });

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this transaction' });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

const exportTransactions = async (req, res) => {
  const userId = req.user.id;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    const csvStringifier = createCsvStringifier({
      header: [
        { id: 'date', title: 'Date' },
        { id: 'category', title: 'Category' },
        { id: 'amount', title: 'Amount' },
        { id: 'currency', title: 'Currency' },
        { id: 'type', title: 'Type' },
        { id: 'description', title: 'Description' },
      ],
    });

    const records = transactions.map((t) => ({
      date: t.date.toISOString().split('T')[0],
      category: t.category.name,
      amount: t.amount,
      currency: t.currency || 'USD',
      type: t.category.type,
      description: t.description || '',
    }));

    const header = csvStringifier.getHeaderString();
    const recordsString = csvStringifier.stringifyRecords(records);
    const csvContent = header + recordsString;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export transactions' });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  exportTransactions,
};
