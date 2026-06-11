import { NextRequest, NextResponse } from 'next/server';
import { executeCode, SUPPORTED_LANGUAGES } from '@/lib/judge0';
import { db } from '@/lib/db';
import { checkRateLimit, submitLimiter } from '@/lib/rate-limit';

interface TestCaseResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (10 req/min per IP)
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await checkRateLimit(submitLimiter, ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { code, language, problemId, userId } = body;

    if (!code || !language || !problemId) {
      return NextResponse.json(
        { error: 'Missing required fields: code, language, and problemId' },
        { status: 400 }
      );
    }

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}` },
        { status: 400 }
      );
    }

    // Look up the problem from database
    const problem = await db.problem.findUnique({
      where: { id: problemId },
    });
    if (!problem) {
      return NextResponse.json(
        { error: `Problem not found with id: ${problemId}` },
        { status: 404 }
      );
    }

    // Parse testCases from JSON string
    // Seed stores test cases as { input, expectedOutput } — NOT { input, output }
    let testCases: { input: string; expectedOutput: string }[] = [];
    try {
      testCases = typeof problem.testCases === 'string'
        ? JSON.parse(problem.testCases)
        : (problem.testCases as { input: string; expectedOutput: string }[] || []);
    } catch {
      testCases = [];
    }

    const results: TestCaseResult[] = [];
    let totalRuntime = 0;
    let maxMemory = 0;
    let hasError = false;
    let errorType = '';

    // Run each test case
    for (const testCase of testCases) {
      try {
        const result = await executeCode(code, language, testCase.input);

        // Judge0 CE status codes:
        //   3 = Accepted, 4 = Wrong Answer — both need output comparison
        //   5 = Time Limit Exceeded
        //   6 = Compilation Error
        //   7+ = Runtime Errors (SIGSEGV, SIGXFSZ, etc.)
        if (result.statusCode === 6) {
          // Compilation error
          hasError = true;
          errorType = 'Compilation Error';
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: result.compileOutput || result.stderr || 'Compilation failed',
            passed: false,
          });
          break;
        } else if (result.statusCode === 5) {
          // Time Limit Exceeded
          hasError = true;
          errorType = 'Time Limit Exceeded';
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: result.stderr || result.statusDescription || 'Time limit exceeded',
            passed: false,
          });
          break;
        } else if (result.statusCode >= 7) {
          // Runtime errors (SIGSEGV, SIGXFSZ, etc.)
          hasError = true;
          errorType = 'Runtime Error';
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: result.stderr || result.statusDescription || 'Runtime error',
            passed: false,
          });
          break;
        }
        // Status 3 (Accepted) or 4 (Wrong Answer) → compare output below

        const actual = (result.stdout || '').trim();
        const expected = testCase.expectedOutput.trim();
        const passed = actual === expected;

        results.push({
          input: testCase.input,
          expected,
          actual,
          passed,
        });

        const runtime = parseFloat(result.time) || 0;
        totalRuntime += runtime;
        if (result.memory > maxMemory) {
          maxMemory = result.memory;
        }

        if (!passed && !hasError) {
          errorType = 'Wrong Answer';
        }
      } catch (execError) {
        hasError = true;
        errorType = errorType || 'Runtime Error';
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: execError instanceof Error ? execError.message : 'Execution failed',
          passed: false,
        });
        break;
      }
    }

    // Determine final status
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = testCases.length;
    let status: string;

    if (hasError) {
      status = errorType;
    } else if (passedCount === totalCount) {
      status = 'Accepted';
    } else {
      status = 'Wrong Answer';
    }

    const avgRuntime = totalCount > 0 ? totalRuntime / totalCount : 0;
    let submissionId: string | null = null;

    // Save to DB if userId is provided
    if (userId) {
      try {
        const submission = await db.submission.create({
          data: {
            code,
            language,
            status,
            runtime: avgRuntime,
            memory: maxMemory,
            testCasesPassed: passedCount,
            testCasesTotal: totalCount,
            userId,
            problemId,
          },
        });
        submissionId = submission.id;

        // Update or create UserProblem record
        const existingUserProblem = await db.userProblem.findUnique({
          where: {
            userId_problemId: { userId, problemId },
          },
        });

        if (existingUserProblem) {
          const updateData: Record<string, unknown> = {
            attempts: { increment: 1 },
          };

          if (status === 'Accepted') {
            updateData.status = 'Solved';
            if (!existingUserProblem.bestRuntime || avgRuntime < existingUserProblem.bestRuntime) {
              updateData.bestRuntime = avgRuntime;
            }
            if (!existingUserProblem.bestMemory || maxMemory < existingUserProblem.bestMemory) {
              updateData.bestMemory = maxMemory;
            }
          } else if (existingUserProblem.status !== 'Solved') {
            updateData.status = 'Attempted';
          }

          await db.userProblem.update({
            where: {
              userId_problemId: { userId, problemId },
            },
            data: updateData,
          });
        } else {
          await db.userProblem.create({
            data: {
              userId,
              problemId,
              status: status === 'Accepted' ? 'Solved' : 'Attempted',
              attempts: 1,
              bestRuntime: status === 'Accepted' ? avgRuntime : null,
              bestMemory: status === 'Accepted' ? maxMemory : null,
            },
          });
        }
      } catch (dbError) {
        // Log DB error but don't fail the submission
        console.error('Failed to save submission to DB:', dbError);
      }
    }

    return NextResponse.json({
      status,
      testCasesPassed: passedCount,
      testCasesTotal: totalCount,
      results,
      runtime: avgRuntime,
      memory: maxMemory,
      submissionId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
