import { PrismaClient } from '@prisma/client';
import { getValidatedIdParam } from '../utils';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, 'passage');
  const passage = await prisma.passage.findUnique({ where: { id }, include: { user: true } });
  if (!passage) throw createError({ statusCode: 404, message: 'Passage not found' });
  return { passage };
}); 