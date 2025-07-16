import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(() => {
  return prisma.passage.findMany({ include: { user: true } });
});
