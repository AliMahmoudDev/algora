'use client';

import { use, useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Terminal,
  TestTube2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { getProblemById, difficultyConfig, type Problem } from '@/data/mock-problems';

// Dynamically import Monaco Editor (no SSR)
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#161622]">
      <div className="flex items-center gap-2 text-algora-text-dim">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading editor...</span>
      </div>
    </div>
  ),
});

const fileNames: Record<string, string> = {
  python: 'solution.py',
  javascript: 'solution.js',
  cpp: 'solution.cpp',
  java: 'Solution.java',
};

const monacoLanguageIds: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  cpp: 'cpp',
  java: 'java',
};

interface TestCaseResult {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  time: string;
  memory: number;
  error?: string;
}

interface ExecutionOutput {
  type: 'run' | 'submit';
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  statusCode: number;
  statusDescription: string;
  time: string;
  memory: number;
  testCaseResults?: TestCaseResult[];
}

export default function ProblemViewPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params);
  const t = useTranslations('ProblemView');
  const locale = useLocale();
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<ExecutionOutput | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<'success' | 'fail' | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
  const [consoleTab, setConsoleTab] = useState<'output' | 'testcases'>('output');
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [expandedTestCases, setExpandedTestCases] = useState<Set<number>>(new Set());
  const editorRef = useRef<unknown>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const problem = getProblemById(id);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleEditorMount = useCallback((editor: unknown) => {
    editorRef.current = editor;
  }, []);

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D12]">
        <div className="text-center">
          <p className="text-algora-text-muted text-lg mb-4">Problem not found</p>
          <Link href={`/${locale}/problems`}>
            <Button className="bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 rounded-lg">
              {locale === 'ar' ? 'العودة للمسائل' : 'Back to Problems'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const config = difficultyConfig[problem.difficulty];

  // Compute current code (not a hook — plain computed value)
  const currentCode = code || problem.starterCode[language as keyof Problem['starterCode']] || '';

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(''); // Reset code so it picks up the new starter code
    setOutput(null);
    setSubmitResult(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    setSubmitResult(null);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          language,
          stdin: showCustomInput ? customInput : undefined,
        }),
      });

      const result = await response.json();

      setOutput({
        type: 'run',
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compile_output,
        statusCode: result.statusCode,
        statusDescription: result.statusDescription,
        time: result.time,
        memory: result.memory,
      });
      setConsoleTab('output');
    } catch (error) {
      setOutput({
        type: 'run',
        stdout: null,
        stderr: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        compileOutput: null,
        statusCode: 13,
        statusDescription: 'Internal Error',
        time: '0',
        memory: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setOutput(null);
    setSubmitResult(null);

    const testCaseResults: TestCaseResult[] = [];
    let allPassed = true;

    try {
      // Run each test case
      for (let i = 0; i < problem.testCases.length; i++) {
        const tc = problem.testCases[i];

        try {
          const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: currentCode,
              language,
              stdin: tc.input,
            }),
          });

          const result = await response.json();
          const actualOutput = (result.stdout || '').trim();
          const expectedOutput = tc.expectedOutput.trim();
          const passed = actualOutput === expectedOutput;

          if (!passed) allPassed = false;

          testCaseResults.push({
            testCaseIndex: i,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput,
            passed,
            time: result.time || '0',
            memory: result.memory || 0,
            error: result.stderr || result.compile_output || undefined,
          });
        } catch {
          allPassed = false;
          testCaseResults.push({
            testCaseIndex: i,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: 'Error executing code',
            passed: false,
            time: '0',
            memory: 0,
            error: 'Failed to execute',
          });
        }
      }

      setOutput({
        type: 'submit',
        stdout: null,
        stderr: null,
        compileOutput: null,
        statusCode: allPassed ? 0 : 1,
        statusDescription: allPassed ? 'Accepted' : 'Wrong Answer',
        time: testCaseResults.map(r => r.time).join(', '),
        memory: Math.max(...testCaseResults.map(r => r.memory)),
        testCaseResults,
      });

      setSubmitResult(allPassed ? 'success' : 'fail');
      setConsoleTab('testcases');

      // Auto-expand failed test cases
      const failedIndexes = new Set(
        testCaseResults.filter(r => !r.passed).map(r => r.testCaseIndex)
      );
      setExpandedTestCases(failedIndexes);
    } catch (error) {
      setOutput({
        type: 'submit',
        stdout: null,
        stderr: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        compileOutput: null,
        statusCode: 13,
        statusDescription: 'Internal Error',
        time: '0',
        memory: 0,
      });
      setSubmitResult('fail');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTestCaseExpand = (index: number) => {
    setExpandedTestCases(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  return (
    <div className="h-screen flex flex-col bg-[#0D0D12]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(255,255,255,0.08)] bg-[#0D0D12]">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/problems`} className="text-algora-text-muted hover:text-algora-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-algora-text-dim font-mono text-sm">
              {problem.orderIndex}.
            </span>
            <span className="text-sm font-medium text-algora-text-primary">
              {locale === 'ar' ? problem.titleAr : problem.title}
            </span>
            <Badge className={`${config.color} text-xs font-medium border`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot} me-1.5`} />
              {problem.difficulty}
            </Badge>
          </div>
        </div>

        {/* Language selector */}
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-36 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary rounded-lg h-8 text-xs focus:border-algora-gold focus:ring-algora-gold/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)]">
            <SelectItem value="python">Python 3</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="java">Java</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main content - split layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Problem Description */}
        <div className="md:w-[45%] lg:w-[50%] flex flex-col border-r border-[rgba(255,255,255,0.08)]">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'description' | 'submissions')} className="flex-1 flex flex-col">
            <TabsList className="bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.08)] rounded-none px-4 h-10 w-full justify-start">
              <TabsTrigger
                value="description"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-algora-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-algora-text-muted data-[state=active]:text-algora-gold h-full px-4 text-sm"
              >
                {t('description')}
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-algora-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-algora-text-muted data-[state=active]:text-algora-gold h-full px-4 text-sm"
              >
                Submissions (3)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 mt-0">
              <div className="space-y-4">
                {/* Problem Statement */}
                <div className="text-sm text-algora-text-muted leading-relaxed whitespace-pre-line">
                  {locale === 'ar' ? problem.descriptionAr : problem.description}
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-algora-text-primary">
                    {t('examples')}
                  </h3>
                  {problem.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[rgba(255,255,255,0.08)] overflow-hidden"
                    >
                      <div className="bg-[rgba(255,255,255,0.02)] px-4 py-2.5 border-b border-[rgba(255,255,255,0.08)]">
                        <span className="text-xs font-medium text-algora-text-dim">
                          Example {idx + 1}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <span className="text-xs font-medium text-algora-text-dim block mb-1">
                            {t('input')}:
                          </span>
                          <code className="text-sm text-algora-green font-mono bg-[rgba(16,185,129,0.05)] px-2 py-1 rounded">
                            {example.input}
                          </code>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-algora-text-dim block mb-1">
                            {t('output')}:
                          </span>
                          <code className="text-sm text-algora-green font-mono bg-[rgba(16,185,129,0.05)] px-2 py-1 rounded">
                            {example.output}
                          </code>
                        </div>
                        {(locale === 'ar' ? example.explanationAr : example.explanation) && (
                          <div>
                            <span className="text-xs font-medium text-algora-text-dim block mb-1">
                              {t('explanation')}:
                            </span>
                            <p className="text-sm text-algora-text-muted">
                              {locale === 'ar' ? example.explanationAr : example.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-algora-text-primary">
                    {t('constraints')}
                  </h3>
                  <div className="text-sm text-algora-text-muted leading-relaxed whitespace-pre-line bg-[rgba(255,255,255,0.02)] rounded-lg p-4 border border-[rgba(255,255,255,0.06)]">
                    {locale === 'ar' ? problem.constraintsAr : problem.constraints}
                  </div>
                </div>

                {/* Related Tags */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-algora-text-primary">
                    {t('relatedTags')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[problem.category, ...problem.tags].map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1.5 rounded-lg bg-algora-purple/10 text-algora-purple border border-algora-purple/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="flex-1 overflow-y-auto p-5 md:p-6 mt-0">
              <div className="text-sm text-algora-text-dim text-center py-12">
                {isSupabaseConfigured 
                  ? (locale === 'ar' ? 'قريباً - سجل الدخول لمشاهدة الإرسالات' : 'Coming soon — sign in to view submissions')
                  : (locale === 'ar' ? 'قريباً — connect Supabase لتفعيل هذه الميزة' : 'Coming soon — connect Supabase to enable this feature')
                }
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Code Editor + Console */}
        <div className="md:w-[55%] lg:w-[50%] flex flex-col bg-[#0D0D12]">
          {/* Action buttons */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(255,255,255,0.08)]">
            <Button
              size="sm"
              className="bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-algora-text-primary rounded-lg h-8 text-xs"
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
            >
              {isRunning ? (
                <Loader2 className="w-3.5 h-3.5 me-1.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 me-1.5" />
              )}
              {isRunning ? t('running') : t('runCode')}
            </Button>
            <Button
              size="sm"
              className="bg-algora-green/90 hover:bg-algora-green text-algora-bg-primary rounded-lg h-8 text-xs font-medium"
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 me-1.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 me-1.5" />
              )}
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>

            {submitResult && (
              <div className={`ms-auto flex items-center gap-1.5 text-xs font-medium ${submitResult === 'success' ? 'text-algora-green' : 'text-algora-red'}`}>
                {submitResult === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {submitResult === 'success' ? t('accepted') : t('wrongAnswer')}
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Editor header */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#161622] border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-algora-red/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-algora-gold/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-algora-green/70" />
                  </div>
                  <span className="text-xs text-algora-text-dim font-mono ms-2">
                    {fileNames[language] || 'solution.txt'}
                  </span>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 min-h-[200px] md:min-h-0">
                <MonacoEditor
                  height="100%"
                  language={monacoLanguageIds[language] || 'plaintext'}
                  theme="vs-dark"
                  value={currentCode}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorMount}
                  options={{
                    fontSize: 14,
                    fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, Menlo, Monaco, monospace',
                    fontLigatures: true,
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    insertSpaces: true,
                    wordWrap: 'on',
                    bracketPairColorization: { enabled: true },
                    guides: {
                      bracketPairs: true,
                      indentation: true,
                    },
                    padding: { top: 16, bottom: 16 },
                    renderLineHighlight: 'line',
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    selectOnLineNumbers: true,
                    roundedSelection: true,
                    contextmenu: true,
                    folding: true,
                    foldingHighlight: true,
                    showFoldingControls: 'always',
                    matchBrackets: 'always',
                    links: true,
                    colorDecorators: true,
                    overviewRulerBorder: false,
                    scrollbar: {
                      verticalScrollbarSize: 8,
                      horizontalScrollbarSize: 8,
                    },
                  }}
                  loading={
                    <div className="flex items-center justify-center h-full bg-[#161622]">
                      <div className="flex items-center gap-2 text-algora-text-dim">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading Monaco Editor...</span>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>

          {/* Console */}
          <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#161622]" style={{ height: '240px' }}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-4">
                <Tabs value={consoleTab} onValueChange={(v) => setConsoleTab(v as 'output' | 'testcases')}>
                  <TabsList className="bg-transparent h-8 p-0">
                    <TabsTrigger
                      value="output"
                      className="rounded-lg data-[state=active]:bg-[rgba(255,255,255,0.06)] data-[state=active]:text-algora-gold text-algora-text-dim data-[state=active]:shadow-none h-7 px-3 text-xs"
                    >
                      <Terminal className="w-3 h-3 me-1.5" />
                      {t('outputTab')}
                    </TabsTrigger>
                    <TabsTrigger
                      value="testcases"
                      className="rounded-lg data-[state=active]:bg-[rgba(255,255,255,0.06)] data-[state=active]:text-algora-gold text-algora-text-dim data-[state=active]:shadow-none h-7 px-3 text-xs"
                    >
                      <TestTube2 className="w-3 h-3 me-1.5" />
                      {t('testCasesTab')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-algora-text-dim hover:text-algora-text-muted px-2"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                >
                  {showCustomInput ? <ChevronDown className="w-3 h-3 me-1" /> : <ChevronRight className="w-3 h-3 me-1" />}
                  {t('stdin')}
                </Button>
              </div>
            </div>

            {/* Custom Input */}
            {showCustomInput && (
              <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-2">
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={t('enterCustomInput')}
                  className="w-full bg-[rgba(255,255,255,0.02)] text-algora-text-primary text-xs font-mono p-2 rounded border border-[rgba(255,255,255,0.06)] focus:border-algora-gold focus:ring-algora-gold/20 focus:outline-none resize-none"
                  rows={3}
                  spellCheck={false}
                />
              </div>
            )}

            <div className="overflow-y-auto p-4" style={{ maxHeight: showCustomInput ? '130px' : '170px' }}>
              {/* Output Tab */}
              {consoleTab === 'output' && (
                output ? (
                  <div className="space-y-2">
                    {output.stdout && (
                      <div>
                        <span className="text-[10px] font-medium text-algora-green/70 uppercase tracking-wider block mb-1">{t('stdout')}</span>
                        <pre className="text-xs text-algora-text-primary font-mono whitespace-pre-wrap leading-5 bg-[rgba(255,255,255,0.02)] p-2 rounded border border-[rgba(255,255,255,0.04)]">
                          {output.stdout}
                        </pre>
                      </div>
                    )}
                    {output.stderr && (
                      <div>
                        <span className="text-[10px] font-medium text-algora-red/70 uppercase tracking-wider block mb-1">{t('stderr')}</span>
                        <pre className="text-xs text-algora-red font-mono whitespace-pre-wrap leading-5 bg-[rgba(239,68,68,0.03)] p-2 rounded border border-[rgba(239,68,68,0.1)]">
                          {output.stderr}
                        </pre>
                      </div>
                    )}
                    {output.compileOutput && (
                      <div>
                        <span className="text-[10px] font-medium text-algora-gold/70 uppercase tracking-wider block mb-1">{t('compilationError')}</span>
                        <pre className="text-xs text-algora-gold font-mono whitespace-pre-wrap leading-5 bg-[rgba(245,158,11,0.03)] p-2 rounded border border-[rgba(245,158,11,0.1)]">
                          {output.compileOutput}
                        </pre>
                      </div>
                    )}
                    {!output.stdout && !output.stderr && !output.compileOutput && (
                      <pre className="text-xs text-algora-text-muted font-mono whitespace-pre-wrap leading-5">
                        {output.statusDescription}
                      </pre>
                    )}
                    {output.time && output.time !== '0' && (
                      <div className="flex items-center gap-4 pt-1 text-[10px] text-algora-text-dim">
                        <span>{t('executionTime')}: {output.time}s</span>
                        {output.memory > 0 && <span>{t('memoryUsage')}: {(output.memory / 1024).toFixed(1)} MB</span>}
                      </div>
                    )}
                    <div ref={consoleEndRef} />
                  </div>
                ) : (
                  <p className="text-xs text-algora-text-dim">
                    {t('noOutput')}
                  </p>
                )
              )}

              {/* Test Cases Tab */}
              {consoleTab === 'testcases' && (
                output?.testCaseResults ? (
                  <div className="space-y-2">
                    {/* Summary */}
                    <div className="flex items-center gap-3 text-xs font-medium pb-2 border-b border-[rgba(255,255,255,0.06)]">
                      <span className={`flex items-center gap-1 ${output.testCaseResults.every(r => r.passed) ? 'text-algora-green' : 'text-algora-red'}`}>
                        {output.testCaseResults.every(r => r.passed) ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> {output.testCaseResults.length}/{output.testCaseResults.length} {t('passed')}</>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            {output.testCaseResults.filter(r => r.passed).length}/{output.testCaseResults.length} {t('passed')}
                          </>
                        )}
                      </span>
                    </div>

                    {/* Individual test cases */}
                    {output.testCaseResults.map((tc, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border overflow-hidden ${tc.passed ? 'border-algora-green/20' : 'border-algora-red/20'}`}
                      >
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                          onClick={() => toggleTestCaseExpand(idx)}
                        >
                          {expandedTestCases.has(idx) ? (
                            <ChevronDown className="w-3 h-3 text-algora-text-dim shrink-0" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-algora-text-dim shrink-0" />
                          )}
                          <span className={`text-xs font-medium ${tc.passed ? 'text-algora-green' : 'text-algora-red'}`}>
                            {t('testCase')} {idx + 1}
                          </span>
                          {tc.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-algora-green ms-auto shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-algora-red ms-auto shrink-0" />
                          )}
                        </button>

                        {expandedTestCases.has(idx) && (
                          <div className="px-3 py-2 space-y-2 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
                            <div>
                              <span className="text-[10px] text-algora-text-dim uppercase tracking-wider">{t('input')}:</span>
                              <pre className="text-xs text-algora-text-muted font-mono mt-0.5">{tc.input}</pre>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[10px] text-algora-text-dim uppercase tracking-wider">{t('output')}:</span>
                                <pre className="text-xs text-algora-text-primary font-mono mt-0.5 bg-[rgba(255,255,255,0.02)] p-1.5 rounded">{tc.actualOutput || '(empty)'}</pre>
                              </div>
                              <div>
                                <span className="text-[10px] text-algora-text-dim uppercase tracking-wider">{t('passed')}:</span>
                                <pre className="text-xs text-algora-green font-mono mt-0.5 bg-[rgba(16,185,129,0.03)] p-1.5 rounded">{tc.expectedOutput}</pre>
                              </div>
                            </div>
                            {tc.error && (
                              <div>
                                <span className="text-[10px] text-algora-red/70 uppercase tracking-wider">{t('stderr')}:</span>
                                <pre className="text-xs text-algora-red font-mono mt-0.5">{tc.error}</pre>
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-[10px] text-algora-text-dim pt-1">
                              <span>{t('executionTime')}: {tc.time}s</span>
                              {tc.memory > 0 && <span>{t('memoryUsage')}: {(tc.memory / 1024).toFixed(1)} MB</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={consoleEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-algora-text-dim">
                    <TestTube2 className="w-6 h-6 mb-2 opacity-50" />
                    <p className="text-xs">
                      {isSubmitting ? t('submitting') : (locale === 'ar' ? 'اضغط "إرسال" لتشغيل حالات الاختبار' : 'Click "Submit" to run test cases')}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
