import { PrismaClient } from "@prisma/client";
import { getCaller, getValidatedIdParam } from "../utils";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, "setting");
  const { id: callerId } = getCaller(event);
  await prisma.setting.delete({ where: { id, userId: callerId } });
  return { success: true };
});
