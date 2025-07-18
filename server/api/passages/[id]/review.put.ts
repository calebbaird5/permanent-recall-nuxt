import { PrismaClient } from "@prisma/client";
import { getValidatedIdParam, getCaller } from "../../utils";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, "passage");
  const { id: callerId } = await getCaller(event);
  const passage = await prisma.passage.findUnique({
    where: { id, userId: callerId },
  });
  if (!passage) {
    throw createError({ statusCode: 404, message: "Passage not found" });
  }

  await prisma.review.create({
    data: { passageId: passage.id },
  });
  return { success: true };
});
