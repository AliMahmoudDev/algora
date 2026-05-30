// Algora Code Execution Engine
// JavaScript → Node.js VM sandbox (works on Vercel/any server)
// Python/C++/Java → Coming soon (requires dedicated server)

export const LANGUAGE_NAMES: Record<string, string> = {
  javascript: 'JavaScript (Node.js)',
  python: 'Python 3',
  cpp: 'C++ (GCC)',
  java: 'Java',
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_NAMES);

// Languages that actually work right now
export const ACTIVE_LANGUAGES = ['javascript'];

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  statusCode: number;
  statusDescription: string;
  time: string;
  memory: number;
}

// ── JavaScript VM Sandbox ──
async function executeJavaScript(
  code: string,
  stdin?: string
): Promise<ExecutionResult> {
  // Build execution script with sandboxed console
  const executionCode = stdin
    ? `
      (function() {
        const _stdout = [];
        const _stderr = [];
        const _stdin = ${JSON.stringify(stdin)};
        const _stdinLines = _stdin.split('\\n');
        let _stdinIdx = 0;

        const _console = {
          log: (...args) => _stdout.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          error: (...args) => _stderr.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          warn: (...args) => _stderr.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        };

        try {
          const fn = new Function('console', 'require', '__stdin', ${JSON.stringify(code)});
          fn(_console, undefined, _stdin);
          return { stdout: _stdout.join('\\n'), stderr: _stderr.join('\\n'), exitCode: 0 };
        } catch (e) {
          return { stdout: _stdout.join('\\n'), stderr: _stderr.join('\\n') + (e.message ? '\\n' + e.message : ''), exitCode: 1 };
        }
      })();
    `
    : `
      (function() {
        const _stdout = [];
        const _stderr = [];

        const _console = {
          log: (...args) => _stdout.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          error: (...args) => _stderr.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          warn: (...args) => _stderr.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        };

        try {
          const fn = new Function('console', 'require', ${JSON.stringify(code)});
          fn(_console, undefined);
          return { stdout: _stdout.join('\\n'), stderr: _stderr.join('\\n'), exitCode: 0 };
        } catch (e) {
          return { stdout: _stdout.join('\\n'), stderr: _stderr.join('\\n') + (e.message ? '\\n' + e.message : ''), exitCode: 1 };
        }
      })();
    `;

  try {
    const start = Date.now();
    const { Script, createContext } = await import('vm');
    const context = createContext({
      console: {
        log: (...args: unknown[]) => {},
        error: (...args: unknown[]) => {},
        warn: (...args: unknown[]) => {},
      },
      require: undefined,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Date,
      Math,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Map,
      Set,
      Promise,
      JSON,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      Infinity,
      NaN,
      undefined,
      null: null,
      true: true,
      false: false,
    });

    const script = new Script(executionCode, { timeout: 5000 });
    const result = script.runInContext(context, { timeout: 5000 });

    const elapsed = ((Date.now() - start) / 1000).toFixed(3);

    // The script returns a JSON string with results
    let parsed: { stdout: string; stderr: string; exitCode: number };
    if (typeof result === 'string') {
      parsed = JSON.parse(result);
    } else if (typeof result === 'object' && result !== null) {
      parsed = result as typeof parsed;
    } else {
      parsed = { stdout: String(result), stderr: '', exitCode: 0 };
    }

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
      stderr: `Runtime Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      compileOutput: null,
      statusCode: 1,
      statusDescription: 'Runtime Error',
      time: '0',
      memory: 0,
    };
  }
}

// ── Coming Soon Languages ──
function comingSoonResult(language: string): ExecutionResult {
  return {
    stdout: null,
    stderr: null,
    compileOutput: null,
    statusCode: 0,
    statusDescription: 'Coming Soon',
    time: '0',
    memory: 0,
  };
}

// ── Main Execute Function ──
export async function executeCode(
  code: string,
  language: string,
  stdin?: string
): Promise<ExecutionResult> {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  if (language === 'javascript') {
    return executeJavaScript(code, stdin);
  }

  // Python, C++, Java — coming soon
  return comingSoonResult(language);
}
