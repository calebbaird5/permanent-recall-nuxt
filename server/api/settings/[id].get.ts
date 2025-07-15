import { PrismaClient } from '@prisma/client';
import { getValidatedIdParam } from '../utils';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, 'setting');
  const setting = await prisma.setting.findUnique({ where: { id }, include: { user: true } });
  if (!setting) throw createError({ statusCode: 404, message: 'Setting not found' });
  return { setting };
}); 