import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(() => {
  return prisma.setting.findMany({ include: { user: true } });
});
