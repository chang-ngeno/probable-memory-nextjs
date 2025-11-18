const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const plain = process.env.SEED_PASSWORD || 'password';
  const hashed = bcrypt.hashSync(plain, 10);

  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { name: 'Demo Admin', password: hashed, role: 'admin' },
    create: { email: 'demo@example.com', name: 'Demo Admin', password: hashed, role: 'admin' },
  });

  await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: { name: 'Demo Member', password: hashed, role: 'user' },
    create: { email: 'member@example.com', name: 'Demo Member', password: hashed, role: 'user' },
  });

  console.log('Seed: created demo users (email: demo@example.com, member@example.com)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
