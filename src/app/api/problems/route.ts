import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/problems — fetch all published problems (or a single one by ?id=)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (id) {
      // Fetch single problem by id
      const problem = await db.problem.findUnique({
        where: { id },
      });

      if (!problem) {
        return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
      }

      return NextResponse.json(transformProblem(problem));
    }

    if (slug) {
      // Fetch single problem by slug
      const problem = await db.problem.findUnique({
        where: { slug },
      });

      if (!problem) {
        return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
      }

      return NextResponse.json(transformProblem(problem));
    }

    // Fetch all published problems
    const problems = await db.problem.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json(problems.map(transformProblem));
  } catch (error) {
    console.error('Failed to fetch problems:', error);
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
  }
}

/** Transform a DB problem record into the same shape as mockProblems */
function transformProblem(record: {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  difficulty: string;
  category: string;
  tags: string;
  examples: string;
  constraints: string | null;
  constraintsAr: string | null;
  acceptanceRate: number;
  starterCode: string | null;
  testCases: string | null;
  orderIndex: number;
}) {
  return {
    id: record.id,
    title: record.title,
    titleAr: record.titleAr,
    slug: record.slug,
    description: record.description,
    descriptionAr: record.descriptionAr,
    difficulty: record.difficulty,
    category: record.category,
    tags: JSON.parse(record.tags),
    examples: JSON.parse(record.examples),
    constraints: record.constraints || '',
    constraintsAr: record.constraintsAr || '',
    acceptanceRate: record.acceptanceRate,
    status: 'Not Started' as const,
    orderIndex: record.orderIndex,
    starterCode: record.starterCode ? JSON.parse(record.starterCode) : null,
    testCases: record.testCases ? JSON.parse(record.testCases) : null,
  };
}
