const cron = require('node-cron');
const prisma = require('../prisma');

const scheduleRecurringTransactionsJob = () => {
  cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    try {
      const recurringTransactions = await prisma.transaction.findMany({
        where: {
          isRecurring: true,
          OR: [
            { recurringInterval: null },
            { recurringInterval: 'MONTHLY' },
          ],
        },
      });

      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

      for (const t of recurringTransactions) {
        const originalDate = new Date(t.date);
        const originalDay = originalDate.getDate();

        if (originalDay !== currentDay) {
          continue;
        }

        const existing = await prisma.transaction.findFirst({
          where: {
            userId: t.userId,
            categoryId: t.categoryId,
            amount: t.amount,
            description: t.description,
            isRecurring: true,
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        if (existing) {
          continue;
        }

        await prisma.transaction.create({
          data: {
            userId: t.userId,
            categoryId: t.categoryId,
            amount: t.amount,
            date: new Date(currentYear, currentMonth - 1, currentDay, originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds(), originalDate.getMilliseconds()),
            description: t.description,
            isRecurring: true,
            recurringInterval: t.recurringInterval || 'MONTHLY',
          },
        });
      }
    } catch (error) {
      console.error('Recurring transactions cron error:', error);
    }
  });
};

module.exports = {
  scheduleRecurringTransactionsJob,
};

