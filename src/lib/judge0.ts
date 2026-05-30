// Judge0 CE API Language IDs
export const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python: 71,      // Python 3
  javascript: 63,  // Node.js
  cpp: 54,         // C++ (GCC)
  java: 62,        // Java
};

export const JUDGE0_LANGUAGE_NAMES: Record<string, string> = {
  python: 'Python 3',
  javascript: 'JavaScript (Node.js)',
  cpp: 'C++ (GCC)',
  java: 'Java',
};

export const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
  exit_code: number;
  exit_signal: number | null;
}

export async function submitToJudge0(
  code: string,
  languageId: number,
  stdin?: string
): Promise<Judge0Result> {
  const apiKey = process.env.JUDGE0_API_KEY;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
  };

  if (apiKey) {
    headers['X-RapidAPI-Key'] = apiKey;
  }

  // Step 1: Submit the code
  const submission: Judge0Submission = {
    source_code: code,
    language_id: languageId,
    cpu_time_limit: 5,
    memory_limit: 256000,
  };

  if (stdin) {
    submission.stdin = stdin;
  }

  const submitResponse = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers,
    body: JSON.stringify(submission),
  });

  if (!submitResponse.ok) {
    const errorText = await submitResponse.text();
    throw new Error(`Judge0 submission failed: ${submitResponse.status} ${errorText}`);
  }

  const result = await submitResponse.json();
  return result as Judge0Result;
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
  const languageId = JUDGE0_LANGUAGE_IDS[language];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const result = await submitToJudge0(code, languageId, stdin);

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    compileOutput: result.compile_output,
    statusCode: result.status.id,
    statusDescription: result.status.description,
    time: result.time,
    memory: result.memory,
  };
}
