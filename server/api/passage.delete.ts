import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const bodySchema = z.object({ id: z.number() });

export default defineEventHandler(async (event) => {
  const { id } = await readValidatedBody(event, bodySchema.parse);
  await prisma.passage.delete({ where: { id } });
  return { success: true };
}); 