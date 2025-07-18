import { PrismaClient } from "@prisma/client";
import { getCaller, getValidatedIdParam } from "../utils";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, "setting");
  const { id: callerId } = await getCaller(event);
  const setting = await prisma.setting.findUnique({
    where: { id, userId: callerId },
    include: { user: true },
  });
  if (!setting)
    throw createError({ statusCode: 404, message: "Setting not found" });
  return setting;
});
