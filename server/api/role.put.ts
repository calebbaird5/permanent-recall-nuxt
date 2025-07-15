import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const bodySchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { id, ...data } = await readValidatedBody(event, bodySchema.parse);
  const role = await prisma.role.update({ where: { id }, data });
  return { role };
}); 