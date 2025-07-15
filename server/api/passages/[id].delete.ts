import { PrismaClient } from '@prisma/client';
import { getValidatedIdParam } from '../utils';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, 'passage');
  await prisma.passage.delete({ where: { id } });
  return { success: true };
}); 