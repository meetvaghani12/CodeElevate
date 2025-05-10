import { SubscriptionPlan } from '@prisma/client';

export const REVIEW_LIMITS = {
  NONE: 5,
  BASIC: 30,
  ADVANCED: 200,
  ENTERPRISE: Infinity
};

export function getReviewLimit(plan: SubscriptionPlan | null): number {
  if (!plan) return REVIEW_LIMITS.NONE;
  return REVIEW_LIMITS[plan];
}

export function canCreateReview(currentReviewCount: number, plan: SubscriptionPlan | null): boolean {
  const limit = getReviewLimit(plan);
  return currentReviewCount < limit;
} 