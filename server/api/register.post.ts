import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from "zod";

const prisma = new PrismaClient();

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const { email, password, name } = await readValidatedBody(event, bodySchema.parse);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: "Email is already registered",
    });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  // Optionally, set the user session after registration
  await setUserSession(event, {
    user: {
      name: user.name,
      email: user.email,
    },
  });

  return { success: true };
}); 