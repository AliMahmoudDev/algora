import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const problemId = searchParams.get('problemId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: userId' },
        { status: 400 }
      );
    }

    const whereClause: Record<string, string> = { userId };

    if (problemId) {
      whereClause.problemId = problemId;
    }

    const submissions = await db.submission.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        problem: {
          select: {
            title: true,
            titleAr: true,
            slug: true,
            difficulty: true,
          },
        },
      },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
