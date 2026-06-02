import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        user: null,
        stats: { problemsSolved: 0, totalSubmissions: 0, successRate: 0, currentStreak: 0 },
        activityData: Array(84).fill(0),
        skillTags: [],
        bio: '',
      });
    }

    // Fetch user data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        user: null,
        stats: { problemsSolved: 0, totalSubmissions: 0, successRate: 0, currentStreak: 0 },
        activityData: Array(84).fill(0),
        skillTags: [],
        bio: '',
      });
    }

    // Parallel queries for stats
    const [
      solvedCount,
      attemptedCount,
      totalSubmissions,
      allSubmissions,
      solvedProblems,
    ] = await Promise.all([
      db.userProblem.count({
        where: { userId, status: 'Solved' },
      }),
      db.userProblem.count({
        where: { userId, status: 'Attempted' },
      }),
      db.submission.count({
        where: { userId },
      }),
      // All submissions for activity calendar (last 84 days)
      db.submission.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 84 * 24 * 60 * 60 * 1000),
          },
        },
        select: { createdAt: true },
      }),
      // Solved problems for skill tags
      db.userProblem.findMany({
        where: { userId, status: 'Solved' },
        include: {
          problem: {
            select: { tags: true },
          },
        },
      }),
    ]);

    const totalAttempted = solvedCount + attemptedCount;
    const successRate = totalAttempted > 0
      ? Math.round((solvedCount / totalAttempted) * 100)
      : 0;

    // Calculate current streak
    let currentStreak = 0;
    try {
      const allSubmissionDates = await db.submission.findMany({
        where: { userId },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
      });

      const daySet = new Set<string>();
      for (const s of allSubmissionDates) {
        const dateStr = new Date(s.createdAt).toISOString().split('T')[0];
        daySet.add(dateStr);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (daySet.has(dateStr)) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }
    } catch {
      currentStreak = 0;
    }

    // Build activity data array (84 days, 12 weeks)
    const activityData: number[] = new Array(84).fill(0);
    for (const s of allSubmissions) {
      const submissionDate = new Date(s.createdAt);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const diffMs = todayStart.getTime() - submissionDate.getTime();
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

      if (diffDays >= 0 && diffDays < 84) {
        // Index 0 = 83 days ago, index 83 = today
        const idx = 83 - diffDays;
        activityData[idx]++;
      }
    }

    // Extract unique skill tags from solved problems
    const skillTagsSet = new Set<string>();
    for (const up of solvedProblems) {
      try {
        const tags = JSON.parse(up.problem.tags as string) as string[];
        for (const tag of tags) {
          skillTagsSet.add(tag);
        }
      } catch {
        // tags might be stored differently
      }
    }
    const skillTags = Array.from(skillTagsSet);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
      },
      stats: {
        problemsSolved: solvedCount,
        totalSubmissions,
        successRate,
        currentStreak,
      },
      activityData,
      skillTags,
      bio: user.bio || '',
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { bio } = body;

    if (typeof bio !== 'string') {
      return NextResponse.json(
        { error: 'bio must be a string' },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { bio: bio.slice(0, 500) }, // Limit bio length
      select: { id: true, bio: true },
    });

    return NextResponse.json({ bio: updatedUser.bio });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
