import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getCaller } from "../utils";

const prisma = new PrismaClient();

const bodySchema = z.object({
  prompt: z.string().min(1),
  reference: z.string().min(1),
  text: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const { prompt, reference, text } = await readValidatedBody(
    event,
    bodySchema.parse
  );
  const { id: callerId } = await getCaller(event);
  const passage = await prisma.passage.create({
    data: {
      prompt,
      reference,
      text,
      userId: callerId,
    },
  });
  return passage;
});
