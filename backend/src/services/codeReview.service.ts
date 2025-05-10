import { PrismaClient } from '@prisma/client';
import { canCreateReview, getReviewLimit } from '../utils/subscription';

const prisma = new PrismaClient();

export interface CreateCodeReviewDto {
  fileName?: string;
  code: string;
  review: string;
  score: number;
  issuesCount: number;
  language?: string;
}

export interface SubscriptionStatus {
  plan: string | null;
  currentReviews: number;
  reviewLimit: number;
  remainingReviews: number;
}

export class CodeReviewService {
  static async createReview(data: CreateCodeReviewDto, userId: string) {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get user's subscription and current review count
    const [user, reviewCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true }
      }),
      prisma.codeReview.count({
        where: { userId }
      })
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user can create more reviews
    if (!canCreateReview(reviewCount, user.subscription?.plan || null)) {
      throw new Error('You have reached your code review limit for your current subscription plan. Please upgrade to review more code.');
    }

    return prisma.codeReview.create({
      data: {
        userId,
        fileName: data.fileName,
        code: data.code,
        review: data.review,
        score: data.score,
        issuesCount: data.issuesCount,
        language: data.language,
        status: 'COMPLETED'
      }
    });
  }

  static async getUserReviews(userId: string) {
    return prisma.codeReview.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        fileName: true,
        score: true,
        issuesCount: true,
        status: true,
        language: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async getReviewById(id: string, userId: string) {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return prisma.codeReview.findFirst({
      where: {
        id,
        userId
      }
    });
  }

  static async deleteReview(id: string, userId: string) {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return prisma.codeReview.delete({
      where: {
        id,
        userId
      }
    });
  }

  static async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const [user, reviewCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true }
      }),
      prisma.codeReview.count({
        where: { userId }
      })
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    const plan = user.subscription?.plan || null;
    const reviewLimit = getReviewLimit(plan);
    const remainingReviews = reviewLimit === Infinity ? Infinity : reviewLimit - reviewCount;

    return {
      plan: plan || 'NONE',
      currentReviews: reviewCount,
      reviewLimit,
      remainingReviews
    };
  }
} 