import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const globalWithPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalWithPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalWithPrisma.prisma = prisma;

export default prisma;
