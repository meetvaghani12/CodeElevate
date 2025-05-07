import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export class AnalyticsService {
  static async getAnalyticsData(userId: string) {
    const reviews = await prisma.codeReview.findMany({
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
        createdAt: true,
        language: true,
        issueTypes: true,
        severity: true
      }
    });

    // Calculate total reviews and issues
    const totalReviews = reviews.length;
    const totalIssues = reviews.reduce((acc, review) => acc + review.issuesCount, 0);
    const resolvedIssues = reviews.filter(review => review.status === 'COMPLETED')
      .reduce((acc, review) => acc + review.issuesCount, 0);
    const averageIssuesPerReview = totalReviews > 0 ? totalIssues / totalReviews : 0;
    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

    // Group by month for monthly activity
    const monthlyData = reviews.reduce((acc: any[], review) => {
      const month = new Date(review.createdAt).toLocaleString('default', { month: 'short' });
      const existingMonth = acc.find(m => m.name === month);
      
      if (existingMonth) {
        existingMonth.reviews++;
        existingMonth.issues += review.issuesCount;
      } else {
        acc.push({
          name: month,
          reviews: 1,
          issues: review.issuesCount
        });
      }
      return acc;
    }, []);

    // Group by language
    const languageData = reviews.reduce((acc: any[], review) => {
      const language = review.language || 'Unknown';
      const existingLang = acc.find(l => l.name === language);
      
      if (existingLang) {
        existingLang.value++;
      } else {
        acc.push({
          name: language,
          value: 1
        });
      }
      return acc;
    }, []);

    // Group by issue type
    const issueTypeData = reviews.reduce((acc: any[], review) => {
      if (review.issueTypes) {
        Object.entries(review.issueTypes).forEach(([type, count]) => {
          const existingType = acc.find(t => t.name === type);
          if (existingType) {
            existingType.value += count;
          } else {
            acc.push({
              name: type,
              value: count
            });
          }
        });
      }
      return acc;
    }, []);

    // Group by severity
    const severityData = reviews.reduce((acc: any[], review) => {
      if (review.severity) {
        Object.entries(review.severity).forEach(([level, count]) => {
          const existingSeverity = acc.find(s => s.name === level);
          if (existingSeverity) {
            existingSeverity.count += count;
          } else {
            acc.push({
              name: level,
              count: count
            });
          }
        });
      }
      return acc;
    }, []);

    return {
      overview: {
        totalReviews,
        totalIssues,
        averageIssuesPerReview,
        resolutionRate
      },
      monthlyData,
      languageData,
      issueTypeData,
      severityData
    };
  }
} 