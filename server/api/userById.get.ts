import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid user id' });
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      settings: true,
    },
  });
  if (!user) throw createError({ statusCode: 404, message: 'User not found' });
  return { user };
}); 