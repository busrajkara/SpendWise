const prisma = require('../src/prisma');

async function main() {
  const categories = [
    { name: 'Food', type: 'EXPENSE', icon: '🍔' },
    { name: 'Rent', type: 'EXPENSE', icon: '🏠' },
    { name: 'Salary', type: 'INCOME', icon: '💰' },
    { name: 'Entertainment', type: 'EXPENSE', icon: '🎬' },
    { name: 'Transport', type: 'EXPENSE', icon: '🚌' },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
  }

  console.log('Categories seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
