import { Passage, PrismaClient, Review } from "@prisma/client";
import {
  getCaller,
  getLatestReviewDate,
  isToday,
  monthBefore,
  weekBefore,
  yearBefore,
} from "../utils";

const prisma = new PrismaClient();

export interface PassageWithLatestReview extends Passage {
  latestReviewDate: Date | null;
  reviews: Review[];
}

export default defineEventHandler(async (event) => {
  const { id: callerId } = await getCaller(event);
  const passages = await prisma.passage.findMany({
    where: { userId: callerId },
    include: { reviews: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "asc" },
  });
  const passagesWithLatestReviewDate: PassageWithLatestReview[] = passages.map(
    (passage) => ({
      ...passage,
      latestReviewDate: passage.reviews?.length
        ? passage.reviews[0].createdAt
        : null,
    })
  );

  const daily = passagesWithLatestReviewDate.filter(
    (el) =>
      !el.reviews.length ||
      !el.latestReviewDate ||
      (el.reviews.length < 7 && !isToday(el.latestReviewDate))
  );

  const weekly = passagesWithLatestReviewDate.filter(
    (el) =>
      el.latestReviewDate &&
      el.reviews.length >= 7 &&
      el.reviews.length < 11 &&
      el.latestReviewDate < weekBefore()
  );

  const monthly = passagesWithLatestReviewDate.filter(
    (el) =>
      el.latestReviewDate &&
      el.reviews.length >= 11 &&
      el.reviews.length < 23 &&
      el.latestReviewDate < monthBefore()
  );

  const yearly = passagesWithLatestReviewDate.filter(
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
