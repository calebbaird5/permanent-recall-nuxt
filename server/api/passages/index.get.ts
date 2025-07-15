import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (_event) => {
  const passages = await prisma.passage.findMany({ include: { user: true } });
  return { passages };
}); 