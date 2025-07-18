import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getCaller } from "../utils";

const prisma = new PrismaClient();

const passageSchema = z.object({
  prompt: z.string().min(1),
  reference: z.string().min(1),
  text: z.string().min(1),
});

const bodySchema = z.array(passageSchema);

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addWeeks(date: Date, weeks: number) {
  return addDays(date, weeks * 7);
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// Review schedule:
// - Every day for a week (7 days)
// - Once a week for a month (next 3 weeks, i.e., days 7, 14, 21)
// - Once a month for a year (next 11 months, i.e., months 1-11 after creation)
function getReviewDates(createdAt: Date, now: Date) {
  const reviewDates: Date[] = [];

  // Daily for 7 days
  for (let i = 0; i < 7; i++) {
    const d = addDays(createdAt, i);
    if (d <= now) reviewDates.push(d);
  }

  // Weekly for next 3 weeks (days 7, 14, 21)
  for (let i = 1; i <= 3; i++) {
    const d = addWeeks(createdAt, i);
    if (d <= now) reviewDates.push(d);
  }

  // Monthly for next 11 months (months 1-11 after creation)
  for (let i = 1; i <= 11; i++) {
    const d = addMonths(createdAt, i);
    if (d <= now) reviewDates.push(d);
  }

  return reviewDates;
}

export default defineEventHandler(async (event) => {
  const passagesData = await readValidatedBody(event, bodySchema.parse);
  const { id: callerId } = await getCaller(event);

  // Assume the oldest passage was created N-1 days ago, next N-2, ..., newest today
  const now = new Date();
  const total = passagesData.length;

  const createdPassages = [];
  for (let i = 0; i < total; i++) {
    const passageData = passagesData[i];
    const createdAt = addDays(now, i - total + 1); // oldest first
    const passage = await prisma.passage.create({
      data: {
        prompt: passageData.prompt,
        reference: passageData.reference,
        text: passageData.text,
        userId: callerId,
        createdAt,
        updatedAt: createdAt,
      },
    });

    // Create reviews for this passage according to the review schedule
    const reviewDates = getReviewDates(createdAt, now);
    if (reviewDates.length > 0) {
      await prisma.review.createMany({
        data: reviewDates.map((date) => ({
          passageId: passage.id,
          date,
          createdAt: date,
          updatedAt: date,
        })),
      });
    }

    createdPassages.push(passage);
  }

  return createdPassages;
});
