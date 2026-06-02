import { NextRequest, NextResponse } from 'next/server';
import { executeCode, SUPPORTED_LANGUAGES } from '@/lib/judge0';
import { getProblemById } from '@/data/mock-problems';
import { db } from '@/lib/db';

interface TestCaseResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export async function POST(request: NextRequest) {
  try {
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

    // Look up the problem from mock-problems
    const problem = getProblemById(problemId);
    if (!problem) {
      return NextResponse.json(
        { error: `Problem not found with id: ${problemId}` },
        { status: 404 }
      );
    }

    const testCases = problem.examples;
    if (!testCases || testCases.length === 0) {
      return NextResponse.json(
        { error: 'No test cases available for this problem' },
        { status: 400 }
      );
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

        // Check for compilation or runtime errors
        if (result.statusCode === 6) {
          // Compilation error
          hasError = true;
          errorType = 'Compilation Error';
          results.push({
            input: testCase.input,
            expected: testCase.output,
            actual: result.compileOutput || result.stderr || 'Compilation failed',
            passed: false,
          });
          break;
        } else if (result.statusCode !== 0 && result.statusCode !== 1) {
          // Runtime error
          hasError = true;
          errorType = 'Runtime Error';
          results.push({
            input: testCase.input,
            expected: testCase.output,
            actual: result.stderr || result.statusDescription || 'Runtime error',
            passed: false,
          });
          break;
        }

        const actual = (result.stdout || '').trim();
        const expected = testCase.output.trim();
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
          expected: testCase.output,
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
