import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid passage id' });
  const passage = await prisma.passage.findUnique({ where: { id }, include: { user: true } });
  if (!passage) throw createError({ statusCode: 404, message: 'Passage not found' });
  return { passage };
}); 