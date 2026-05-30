import { NextRequest, NextResponse } from 'next/server';
import { executeCode, JUDGE0_LANGUAGE_IDS } from '@/lib/judge0';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, stdin } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: code and language' },
        { status: 400 }
      );
    }

    const languageId = JUDGE0_LANGUAGE_IDS[language];
    if (!languageId) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}. Supported: ${Object.keys(JUDGE0_LANGUAGE_IDS).join(', ')}` },
        { status: 400 }
      );
    }

    try {
      const result = await executeCode(code, language, stdin);

      return NextResponse.json({
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compileOutput,
        statusCode: result.statusCode,
        statusDescription: result.statusDescription,
        time: result.time,
        memory: result.memory,
      });
    } catch (judgeError) {
      const message = judgeError instanceof Error ? judgeError.message : 'Unknown Judge0 error';
      
      // If Judge0 is unavailable, return a simulated response
      return NextResponse.json({
        stdout: null,
        stderr: `Judge0 API unavailable: ${message}\n\nNote: Make sure JUDGE0_API_KEY is set in your environment.`,
        compile_output: null,
        statusCode: 13,
        statusDescription: 'Internal Error',
        time: '0',
        memory: 0,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
