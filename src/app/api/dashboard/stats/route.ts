import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Return zeros if no userId
    if (!userId) {
      return NextResponse.json({
        solved: 0,
        attempted: 0,
        total: 14,
        successRate: 0,
        currentStreak: 0,
        submissionsThisWeek: 0,
        recentActivity: [],
        skillBreakdown: {
          Easy: { solved: 0, total: 5 },
          Medium: { solved: 0, total: 7 },
          Hard: { solved: 0, total: 2 },
        },
      });
    }

    // Parallel queries
    const [
      solvedCount,
      attemptedCount,
      totalSubmissions,
      recentSubmissions,
      solvedEasy,
      solvedMedium,
      solvedHard,
      weeklySubmissions,
    ] = await Promise.all([
      // Solved problems count
      db.userProblem.count({
        where: { userId, status: 'Solved' },
      }),
      // Attempted (but not solved) count
      db.userProblem.count({
        where: { userId, status: 'Attempted' },
      }),
      // Total submissions
      db.submission.count({
        where: { userId },
      }),
      // Recent 10 submissions with problem info
      db.submission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          problem: {
            select: {
              title: true,
              titleAr: true,
              difficulty: true,
            },
          },
        },
      }),
      // Skill breakdown: solved by difficulty
      db.userProblem.count({
        where: {
          userId,
          status: 'Solved',
          problem: { difficulty: 'Easy' },
        },
      }),
      db.userProblem.count({
        where: {
          userId,
          status: 'Solved',
          problem: { difficulty: 'Medium' },
        },
      }),
      db.userProblem.count({
        where: {
          userId,
          status: 'Solved',
          problem: { difficulty: 'Hard' },
        },
      }),
      // Submissions this week
      db.submission.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calculate success rate: solved / (solved + attempted) * 100
    const totalAttempted = solvedCount + attemptedCount;
    const successRate = totalAttempted > 0
      ? Math.round((solvedCount / totalAttempted) * 100)
      : 0;

    // Calculate current streak: consecutive days with submissions
    let currentStreak = 0;
    try {
      const allSubmissionDates = await db.submission.findMany({
        where: { userId },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
        distinct: ['createdAt'],
      });

      // Group by day
      const daySet = new Set<string>();
      for (const s of allSubmissionDates) {
        const dateStr = new Date(s.createdAt).toISOString().split('T')[0];
        daySet.add(dateStr);
      }

      // Check consecutive days from today going backwards
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

    // Format recent activity
    const recentActivity = recentSubmissions.map((s) => ({
      id: s.id,
      problemId: s.problemId,
      problemTitle: s.problem.title,
      problemTitleAr: s.problem.titleAr,
      problemDifficulty: s.problem.difficulty,
      status: s.status === 'Accepted' ? 'accepted' : s.status === 'Wrong Answer' ? 'wrongAnswer' : 'error',
      language: s.language,
      createdAt: s.createdAt.toISOString(),
      runtime: s.runtime,
      memory: s.memory,
      testCasesPassed: s.testCasesPassed,
      testCasesTotal: s.testCasesTotal,
    }));

    return NextResponse.json({
      solved: solvedCount,
      attempted: totalAttempted,
      total: 14,
      successRate,
      currentStreak,
      submissionsThisWeek: weeklySubmissions,
      recentActivity,
      skillBreakdown: {
        Easy: { solved: solvedEasy, total: 5 },
        Medium: { solved: solvedMedium, total: 7 },
        Hard: { solved: solvedHard, total: 2 },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    // Return zeros on error instead of crashing
    return NextResponse.json({
      solved: 0,
      attempted: 0,
      total: 14,
      successRate: 0,
      currentStreak: 0,
      submissionsThisWeek: 0,
      recentActivity: [],
      skillBreakdown: {
        Easy: { solved: 0, total: 5 },
        Medium: { solved: 0, total: 7 },
        Hard: { solved: 0, total: 2 },
      },
    });
  }
}
