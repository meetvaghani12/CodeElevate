import { NextRequest, NextResponse } from 'next/server';
import { authApi } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to verify authentication
    const profileResponse = await authApi.getUserProfile(token);
    if (!profileResponse.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch code reviews from the backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/code-reviews`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch code reviews');
    }

    const reviews = await response.json();

    // Calculate total reviews and issues
    const totalReviews = reviews.length;
    const totalIssues = reviews.reduce((acc: number, review: any) => acc + review.issuesCount, 0);
    const resolvedIssues = reviews.filter((review: any) => review.status === 'COMPLETED')
      .reduce((acc: number, review: any) => acc + review.issuesCount, 0);
    const averageIssuesPerReview = totalReviews > 0 ? totalIssues / totalReviews : 0;
    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

    // Group by month for monthly activity
    const monthlyData = reviews.reduce((acc: any[], review: any) => {
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
    const languageData = reviews.reduce((acc: any[], review: any) => {
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
    const issueTypeData = reviews.reduce((acc: any[], review: any) => {
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
    const severityData = reviews.reduce((acc: any[], review: any) => {
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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 