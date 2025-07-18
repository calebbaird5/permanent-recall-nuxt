import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getCaller, getValidatedIdParam } from "../../utils";

const prisma = new PrismaClient();

const bodySchema = z.object({
  prompt: z.string().optional(),
  reference: z.string().optional(),
  text: z.string().optional(),
  userId: z.number().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, "passage");
  const { id: callerId } = await getCaller(event);
  const data = await readValidatedBody(event, bodySchema.parse);
  const passage = await prisma.passage.update({
    where: { id, userId: callerId },
    data,
    include: {
      user: true,
      reviews: {
        orderBy: { date: "desc" },
      },
    },
  });
  return passage;
});
