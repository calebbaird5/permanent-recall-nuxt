import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(() => {
  return prisma.role.findMany({ include: { users: true } });
});
