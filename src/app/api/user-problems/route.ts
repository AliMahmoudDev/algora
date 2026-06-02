import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json([]);
    }

    const userProblems = await db.userProblem.findMany({
      where: { userId },
      select: {
        problemId: true,
        status: true,
        attempts: true,
        bestRuntime: true,
        bestMemory: true,
      },
    });

    return NextResponse.json(userProblems);
  } catch (error) {
    console.error('UserProblems API error:', error);
    return NextResponse.json([]);
  }
}
