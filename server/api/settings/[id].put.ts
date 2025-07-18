import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getCaller, getValidatedIdParam } from "../utils";

const prisma = new PrismaClient();

const bodySchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
  userId: z.number().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getValidatedIdParam(event, "setting");
  const { id: callerId } = getCaller(event);
  const data = await readValidatedBody(event, bodySchema.parse);
  const setting = await prisma.setting.update({
    where: { id, userId: callerId },
    data,
  });
  return setting;
});
