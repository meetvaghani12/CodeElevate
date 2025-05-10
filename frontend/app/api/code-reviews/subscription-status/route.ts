import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use relative URL since we're in the same domain
    const response = await fetch('http://localhost:5000/api/code-reviews/subscription-status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription status');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in subscription status route:', error);
    return NextResponse.json(
      { message: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
} 