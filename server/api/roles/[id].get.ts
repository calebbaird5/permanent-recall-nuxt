import { PrismaClient } from '@prisma/client';
import { getValidatedIdParam } from '../utils';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, 'role');
  const role = await prisma.role.findUnique({ where: { id }, include: { users: true } });
  if (!role) throw createError({ statusCode: 404, message: 'Role not found' });
  return { role };
}); 