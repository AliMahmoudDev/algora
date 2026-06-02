import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mockProblems } from '@/data/mock-problems';

// Points mapping by difficulty
const POINTS_MAP: Record<string, number> = {
  Easy: 10,
  Medium: 25,
  Hard: 50,
};

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userImage: string | null;
  problemsSolved: number;
  totalSubmissions: number;
  successRate: number;
  points: number;
  bestRuntime: number | null;
}

export async function GET() {
  try {
    // Get all users who have at least one solved problem
    const solvedUserProblems = await db.userProblem.findMany({
      where: { status: 'Solved' },
      include: {
        user: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    // Get unique userIds that have at least 1 solved problem
    const activeUserIds = [
      ...new Set(solvedUserProblems.map((up) => up.userId)),
    ];

    if (activeUserIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // For each user, gather all their data
    const entries: LeaderboardEntry[] = await Promise.all(
      activeUserIds.map(async (userId) => {
        // Get all solved user problems for this user
        const userSolved = solvedUserProblems.filter((up) => up.userId === userId);

        // Calculate points using mock-problems difficulty lookup
        let points = 0;
        for (const up of userSolved) {
          const mockProblem = mockProblems.find((p) => p.id === up.problemId);
          if (mockProblem) {
            points += POINTS_MAP[mockProblem.difficulty] || 15; // fallback to avg 15
          } else {
            points += 15;
          }
        }

        // Count total submissions
        const totalSubmissions = await db.submission.count({
          where: { userId },
        });

        // Count accepted submissions
        const acceptedSubmissions = await db.submission.count({
          where: { userId, status: 'Accepted' },
        });

        // Calculate success rate
        const successRate =
          totalSubmissions > 0
            ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
            : 0;

        // Get best runtime across all solved problems
        const bestRuntimes = userSolved
          .map((up) => up.bestRuntime)
          .filter((r): r is number => r !== null);

        const bestRuntime =
          bestRuntimes.length > 0 ? Math.min(...bestRuntimes) : null;

        const user = userSolved[0].user;

        return {
          rank: 0, // Will be assigned after sorting
          userId,
          userName: user.name || user.email?.split('@')[0] || 'Unknown',
          userImage: user.image,
          problemsSolved: userSolved.length,
          totalSubmissions,
          successRate,
          points,
          bestRuntime,
        } satisfies LeaderboardEntry;
      })
    );

    // Sort: points desc, then problemsSolved desc, then bestRuntime asc
    entries.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.problemsSolved !== a.problemsSolved)
        return b.problemsSolved - a.problemsSolved;
      if (a.bestRuntime !== null && b.bestRuntime !== null)
        return a.bestRuntime - b.bestRuntime;
      if (a.bestRuntime !== null) return -1;
      if (b.bestRuntime !== null) return 1;
      return 0;
    });

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return NextResponse.json({ data: entries });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}
