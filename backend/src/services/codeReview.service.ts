import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from "./"

const prisma = new PrismaClient();

export interface CreateCodeReviewDto {
  fileName?: string;
  code: string;
  review: string;
  score: number;
  issuesCount: number;
  language?: string;
}

export class CodeReviewService {
  static async createReview(data: CreateCodeReviewDto) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    return prisma.codeReview.create({
      data: {
        userId: session.user.id,
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

  static async getReviewById(id: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    return prisma.codeReview.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });
  }

  static async deleteReview(id: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    return prisma.codeReview.delete({
      where: {
        id,
        userId: session.user.id
      }
    });
  }
} 