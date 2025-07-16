import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { name, description } = await readValidatedBody(
    event,
    bodySchema.parse,
  );
  const role = await prisma.role.create({ data: { name, description } });
  return role;
});
