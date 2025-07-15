import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (_event) => {
  const settings = await prisma.setting.findMany({ include: { user: true } });
  return { settings };
}); 