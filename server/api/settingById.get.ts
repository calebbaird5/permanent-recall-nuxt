import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid setting id' });
  const setting = await prisma.setting.findUnique({ where: { id }, include: { user: true } });
  if (!setting) throw createError({ statusCode: 404, message: 'Setting not found' });
  return { setting };
}); 