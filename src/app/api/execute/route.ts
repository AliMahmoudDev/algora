import { NextRequest, NextResponse } from 'next/server';
import { executeCode, SUPPORTED_LANGUAGES } from '@/lib/judge0';

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

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}` },
        { status: 400 }
      );
    }

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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
