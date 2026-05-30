import { NextRequest, NextResponse } from 'next/server';
import { executeCode, PISTON_LANGUAGES, PISTON_LANGUAGE_NAMES } from '@/lib/piston';

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

    const langConfig = PISTON_LANGUAGES[language];
    if (!langConfig) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}. Supported: ${Object.keys(PISTON_LANGUAGES).join(', ')}` },
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
    } catch (pistonError) {
      const message = pistonError instanceof Error ? pistonError.message : 'Unknown Piston error';

      return NextResponse.json({
        stdout: null,
        stderr: `Piston API unavailable: ${message}\n\nPlease try again later.`,
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
