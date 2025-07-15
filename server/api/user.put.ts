import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

const bodySchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  roleId: z.number().optional(),
});

export default defineEventHandler(async (event) => {
  const { id, name, email, password, roleId } = await readValidatedBody(event, bodySchema.parse);

  const data: any = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (roleId !== undefined) data.roleId = roleId;
  if (password) data.password = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, roleId: true },
  });

  return { user };
}); 