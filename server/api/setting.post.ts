import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const bodySchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  userId: z.number(),
});

export default defineEventHandler(async (event) => {
  const { name, value, userId } = await readValidatedBody(event, bodySchema.parse);
  const setting = await prisma.setting.create({ data: { name, value, userId } });
  return { setting };
}); 