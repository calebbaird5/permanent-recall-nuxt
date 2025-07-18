import { PrismaClient } from "@prisma/client";
import { getCaller } from "../utils";

const prisma = new PrismaClient();

export default defineEventHandler((event) => {
  const { id: callerId } = getCaller(event);
  return prisma.setting.findMany({
    where: { userId: callerId },
    include: { user: true },
  });
});
