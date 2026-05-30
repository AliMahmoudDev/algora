// Piston API — Free, no API key needed!
// Public instances:
//   https://emkc.org/api/v2/piston
//   https://piston-api.codekitten.net

export const PISTON_BASE_URL = 'https://emkc.org/api/v2/piston';

// Piston uses language + version instead of language IDs
export const PISTON_LANGUAGES: Record<string, { language: string; version: string }> = {
  python:     { language: 'python',     version: '3.11.4' },
  javascript: { language: 'javascript', version: '18.15.0' },
  cpp:        { language: 'c++',        version: '10.2.0' },
  java:       { language: 'java',       version: '15.0.2' },
};

export const PISTON_LANGUAGE_NAMES: Record<string, string> = {
  python: 'Python 3',
  javascript: 'JavaScript (Node.js)',
  cpp: 'C++ (GCC)',
  java: 'Java',
};

interface PistonFile {
  content: string;
}

interface PistonSubmission {
  language: string;
  version: string;
  files: PistonFile[];
  stdin?: string;
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

interface PistonRunResult {
  stdout: string;
  stderr: string;
  output: string;
  code: number;
  signal: string | null;
  compile_output: string | null;
}

interface PistonResult {
  language: string;
  version: string;
  run: PistonRunResult;
  compile: PistonRunResult | null;
}

export async function submitToPiston(
  code: string,
  language: string,
  version: string,
  stdin?: string
): Promise<PistonResult> {
  const submission: PistonSubmission = {
    language,
    version,
    files: [{ content: code }],
    compile_timeout: 10000,
    run_timeout: 5000,
    compile_memory_limit: 256000000,
    run_memory_limit: 256000000,
  };

  if (stdin) {
    submission.stdin = stdin;
  }

  const response = await fetch(`${PISTON_BASE_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Piston API failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function executeCode(
  code: string,
  language: string,
  stdin?: string
): Promise<{
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  statusCode: number;
  statusDescription: string;
  time: string;
  memory: number;
}> {
  const langConfig = PISTON_LANGUAGES[language];
  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const result = await submitToPiston(code, langConfig.language, langConfig.version, stdin);

  const stdout = result.run?.stdout?.trim() || null;
  const stderr = result.run?.stderr?.trim() || null;
  const compileOutput = result.compile?.output?.trim() || result.compile?.stdout?.trim() || null;
  const exitCode = result.run?.code ?? 1;

  return {
    stdout,
    stderr,
    compileOutput,
    statusCode: exitCode,
    statusDescription: exitCode === 0 ? 'Accepted' : 'Runtime Error',
    time: '0',
    memory: 0,
  };
}
