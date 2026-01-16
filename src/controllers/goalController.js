const prisma = require('../prisma');

const getGoals = async (req, res) => {
  const userId = req.user.id;
  try {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

const createGoal = async (req, res) => {
  const userId = req.user.id;
  const { title, targetAmount, deadline } = req.body;

  if (!title || !targetAmount || !deadline) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        targetAmount: parseFloat(targetAmount),
        deadline: new Date(deadline),
      },
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

const deleteGoal = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const goal = await prisma.goal.findUnique({ where: { id } });
    if (!goal || goal.userId !== userId) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await prisma.goal.delete({ where: { id } });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

module.exports = { getGoals, createGoal, deleteGoal };
