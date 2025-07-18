import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getCaller } from "../utils";

const prisma = new PrismaClient();

const bodySchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const { id: callerId } = getCaller(event);
  const { name, value } = await readValidatedBody(event, bodySchema.parse);
  const setting = await prisma.setting.create({
    data: { name, value, userId: callerId },
  });
  return setting;
});
