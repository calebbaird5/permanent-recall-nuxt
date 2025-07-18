import { PrismaClient } from "@prisma/client";
import { getCaller } from "../utils";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { id: callerId } = await getCaller(event);
  return prisma.passage.findMany({
    where: { userId: callerId },
  });
});
