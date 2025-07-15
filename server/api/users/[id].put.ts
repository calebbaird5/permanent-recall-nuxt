import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getValidatedIdParam } from "../utils";

const prisma = new PrismaClient();

const bodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  roleId: z.number().optional(),
});

type BodyInput = z.infer<typeof bodySchema>;

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const id = getValidatedIdParam(event, "user");

  const { password, ...rest } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const updateData: Partial<Omit<BodyInput, "id">> = {
    ...rest,
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      roleId: true,
      role: true,
      settings: true,
    },
  });

  // Update session user if this is the current user
  if (user.id === id) {
    await setUserSession(event, { user: updatedUser });
  }

  return { updatedUser };
});
