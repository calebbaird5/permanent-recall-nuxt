import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getValidatedIdParam } from '../utils';

const prisma = new PrismaClient();

const bodySchema = z.object({
  prompt: z.string().optional(),
  reference: z.string().optional(),
  text: z.string().optional(),
  reviewDates: z.array(z.coerce.date()).optional(),
  latestReviewDate: z.coerce.date().optional(),
  userId: z.number().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, 'passage');
  const data = await readValidatedBody(event, bodySchema.parse);
  const passage = await prisma.passage.update({
    where: { id },
    data,
  });
  return { passage };
}); 