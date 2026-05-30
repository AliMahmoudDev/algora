// Algora Code Execution Engine
// Uses Judge0 CE (ce.judge0.com) — Free, no API key!
// Supports: Python, JavaScript, C++, Java

export const LANGUAGE_NAMES: Record<string, string> = {
  python: 'Python 3',
  javascript: 'JavaScript (Node.js)',
  cpp: 'C++ (GCC)',
  java: 'Java',
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_NAMES);

// Judge0 CE language IDs
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  cpp: 54,
  java: 62,
};

// Fallback instances if ce.judge0.com is down
const JUDGE0_INSTANCES = [
  'https://ce.judge0.com',
  'https://judge0.ce.judge0.com',
];

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  statusCode: number;
  statusDescription: string;
  time: string;
  memory: number;
}

async function submitToJudge0(
  code: string,
  languageId: number,
  stdin?: string
): Promise<ExecutionResult> {
  const body: Record<string, unknown> = {
    source_code: code,
    language_id: languageId,
    cpu_time_limit: 5,
    memory_limit: 256000,
  };

  if (stdin) {
    body.stdin = stdin;
  }

  const errors: string[] = [];

  for (const baseUrl of JUDGE0_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `${baseUrl}/submissions?base64_encoded=false&wait=true`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const stdout = result.stdout?.trim() || null;
      const stderr = result.stderr?.trim() || null;
      const compileOutput = result.compile_output?.trim() || null;
      const exitCode = result.status?.id ?? 1;
      const statusDesc = result.status?.description || 'Unknown';

      return {
        stdout,
        stderr,
        compileOutput,
        statusCode: exitCode,
        statusDescription: statusDesc,
        time: result.time || '0',
        memory: result.memory || 0,
      };
    } catch (err) {
      errors.push(`${baseUrl}: ${err instanceof Error ? err.message : 'Unknown'}`);
      continue;
    }
  }

  throw new Error(`All Judge0 instances failed:\n${errors.join('\n')}`);
}

export async function executeCode(
  code: string,
  language: string,
  stdin?: string
): Promise<ExecutionResult> {
  const languageId = JUDGE0_LANGUAGE_IDS[language];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  return submitToJudge0(code, languageId, stdin);
}
