import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      settings: true,
      password: true,
    },
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
    });
  }

  // Compare password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
    });
  }

  // Remove password before setting session/response
  const { password: _pw, ...userSession } = user;

  // set the user session in the cookie
  await setUserSession(event, {
    user: userSession,
  });
  return {
    success: true,
    user: userSession,
  };
});
