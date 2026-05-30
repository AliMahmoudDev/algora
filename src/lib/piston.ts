// Algora Code Execution Engine
// Strategy: Try multiple free Piston instances with fallback
// If all fail, use Node.js VM sandbox for JavaScript

export const LANGUAGE_NAMES: Record<string, string> = {
  python: 'Python 3',
  javascript: 'JavaScript (Node.js)',
  cpp: 'C++ (GCC)',
  java: 'Java',
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_NAMES);

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

interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  statusCode: number;
  statusDescription: string;
  time: string;
  memory: number;
}

const PISTON_INSTANCES = [
  'https://piston-api.codekitten.net',
  'https://emkc.org/api/v2/piston',
  'https://piston.fly.dev',
  'https://piston-api-1.joshpetkun.repl.co',
];

const PISTON_LANGUAGES: Record<string, { language: string; version: string }> = {
  python:     { language: 'python',     version: '3.11.4' },
  javascript: { language: 'javascript', version: '18.15.0' },
  cpp:        { language: 'c++',        version: '10.2.0' },
  java:       { language: 'java',       version: '15.0.2' },
};

async function tryPistonInstance(
  baseUrl: string,
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function executeWithPiston(
  code: string,
  language: string,
  stdin?: string
): Promise<ExecutionResult> {
  const langConfig = PISTON_LANGUAGES[language];
  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Try each instance with fallback
  const errors: string[] = [];

  for (const instance of PISTON_INSTANCES) {
    try {
      const result = await tryPistonInstance(
        instance,
        code,
        langConfig.language,
        langConfig.version,
        stdin
      );

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
    } catch (err) {
      errors.push(`${instance}: ${err instanceof Error ? err.message : 'Unknown'}`);
      continue;
    }
  }

  throw new Error(`All Piston instances failed:\n${errors.join('\n')}`);
}

// Node.js VM sandbox for JavaScript fallback
async function executeJavaScriptSandbox(
  code: string,
  stdin?: string
): Promise<ExecutionResult> {
  // Build execution script with sandboxed console
  const sandboxCode = `
    const _stdout = [];
    const _stderr = [];
    const _originalConsole = console;

    console.log = (...args) => {
      _stdout.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };
    console.error = (...args) => {
      _stderr.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };
    console.warn = (...args) => {
      _stderr.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    try {
      ${code}
      JSON.stringify({ stdout: _stdout.join('\\n'), stderr: _stderr.join('\\n'), exitCode: 0 });
    } catch (e) {
      JSON.stringify({ stdout: _stdout.join('\\n'), stderr: _stderr.join('\\n') + '\\n' + e.message, exitCode: 1 });
    }
  `;

  try {
    const start = Date.now();
    // Use dynamic import of vm module
    const { Script } = await import('vm');
    const script = new Script(sandboxCode, {
      timeout: 5000,
    });

    const context = { console, JSON, setTimeout, setInterval, clearTimeout, clearInterval, Date, Math, Array, Object, String, Number, Boolean, Map, Set, Promise };
    const result = script.runInNewContext(context, { timeout: 5000 });

    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    return {
      stdout: parsed.stdout || null,
      stderr: parsed.stderr || null,
      compileOutput: null,
      statusCode: parsed.exitCode || 0,
      statusDescription: parsed.exitCode === 0 ? 'Accepted' : 'Runtime Error',
      time: elapsed,
      memory: 0,
    };
  } catch (err) {
    return {
      stdout: null,
      stderr: `Sandbox error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      compileOutput: null,
      statusCode: 1,
      statusDescription: 'Runtime Error',
      time: '0',
      memory: 0,
    };
  }
}

export async function executeCode(
  code: string,
  language: string,
  stdin?: string
): Promise<ExecutionResult> {
  // For JavaScript, try Piston first, then fall back to VM sandbox
  if (language === 'javascript') {
    try {
      return await executeWithPiston(code, language, stdin);
    } catch {
      return await executeJavaScriptSandbox(code, stdin);
    }
  }

  // For other languages, try Piston instances
  try {
    return await executeWithPiston(code, language, stdin);
  } catch (pistonError) {
    // All instances failed
    return {
      stdout: null,
      stderr: `Code execution service unavailable for ${LANGUAGE_NAMES[language]}. Please try again later.\n\nError: ${pistonError instanceof Error ? pistonError.message : 'Unknown error'}`,
      compileOutput: null,
      statusCode: 13,
      statusDescription: 'Internal Error',
      time: '0',
      memory: 0,
    };
  }
}
