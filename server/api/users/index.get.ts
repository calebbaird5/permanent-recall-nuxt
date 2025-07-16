import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(() => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      settings: true,
    },
  });
});
