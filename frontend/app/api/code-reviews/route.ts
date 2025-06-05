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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/code-reviews/subscription-status`, {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 🔧 Replace this with your DB save logic
    console.log('Received review data:', body);

    // Example response
    return NextResponse.json({ message: 'Review saved successfully' });
  } catch (error) {
    console.error('Failed to save review:', error);
    return NextResponse.json(
      { message: 'Failed to save review to database' },
      { status: 500 }
    );
  }
}
