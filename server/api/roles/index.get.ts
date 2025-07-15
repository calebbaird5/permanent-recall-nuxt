import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (_event) => {
  const roles = await prisma.role.findMany({ include: { users: true } });
  return { roles };
}); 