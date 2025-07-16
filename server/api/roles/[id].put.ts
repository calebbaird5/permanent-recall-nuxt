import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getValidatedIdParam } from "../utils";

const prisma = new PrismaClient();

const bodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, "role");
  const data = await readValidatedBody(event, bodySchema.parse);
  const role = await prisma.role.update({ where: { id }, data });
  return role;
});
