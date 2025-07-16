import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.number().optional(),
});

export default defineEventHandler(async (event) => {
  const { name, email, password, roleId } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: "Email is already registered",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, roleId },
    select: { id: true, name: true, email: true, roleId: true },
  });

  return user;
});
