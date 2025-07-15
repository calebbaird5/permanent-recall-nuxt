import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid role id' });
  const role = await prisma.role.findUnique({ where: { id }, include: { users: true } });
  if (!role) throw createError({ statusCode: 404, message: 'Role not found' });
  return { role };
}); 