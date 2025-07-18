import { PrismaClient } from "@prisma/client";
import { getCaller, getValidatedIdParam } from "../../utils";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, "passage");
  const {id: callerId} = getCaller(event)
  const passage = await prisma.passage.findUnique({
    where: { id, userId: callerId },
    include: { user: true },
  });
  if (!passage) throw createError({ statusCode: 404, message: "Passage not found" });
  return passage;
});
