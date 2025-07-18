import { PrismaClient } from "@prisma/client";
import {
  getCaller,
  isToday,
  monthBefore,
  weekBefore,
  yearBefore,
} from "../utils";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { id: callerId } = await getCaller(event);
  const passages = await prisma.passageWithLatestReview.findMany({
    where: { userId: callerId },
    include: { reviews: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "asc" },
  });

  const daily = passages.filter(
    (el) =>
      !el.reviews.length ||
      !el.latestReviewDate ||
      (el.reviews.length < 7 && !isToday(el.latestReviewDate))
  );

  const weekly = passages.filter(
    (el) =>
      el.latestReviewDate &&
      el.reviews.length >= 7 &&
      el.reviews.length < 11 &&
      el.latestReviewDate < weekBefore()
  );

  const monthly = passages.filter(
    (el) =>
      el.latestReviewDate &&
      el.reviews.length >= 11 &&
      el.reviews.length < 23 &&
      el.latestReviewDate < monthBefore()
  );

  const yearly = passages.filter(
    (el) =>
      el.latestReviewDate &&
      el.reviews.length >= 23 &&
      el.latestReviewDate < yearBefore()
  );

  return {
    daily,
    weekly,
    monthly,
    yearly,
    all: ([] as typeof passages).concat(daily, weekly, monthly, yearly),
  };
});
