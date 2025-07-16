import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const bodySchema = z.object({
  prompt: z.string().min(1),
  reference: z.string().min(1),
  text: z.string().min(1),
  userId: z.number(),
  reviewDates: z.array(z.coerce.date()).optional(),
  latestReviewDate: z.coerce.date().optional(),
});

export default defineEventHandler(async (event) => {
  const { prompt, reference, text, userId, reviewDates, latestReviewDate } =
    await readValidatedBody(event, bodySchema.parse);
  const passage = await prisma.passage.create({
    data: { prompt, reference, text, userId, reviewDates, latestReviewDate },
  });
  return passage;
});
