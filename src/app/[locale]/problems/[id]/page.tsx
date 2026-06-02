'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Code2,
} from 'lucide-react';
import { getProblemById, difficultyConfig, type Problem } from '@/data/mock-problems';
import CodeEditor from '@/components/CodeEditor';
import { useSession } from 'next-auth/react';

const starterCode: Record<string, Record<string, string>> = {
  'two-sum': {
    python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your solution here\n        pass`,
    javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your solution here\n}`,
    cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n    }\n};`,
    java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n    }\n}`,
  },
  'valid-palindrome': {
    python: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        # Write your solution here\n        pass`,
    javascript: `function isPalindrome(s) {\n    // Write your solution here\n}`,
    cpp: `class Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your solution here\n    }\n};`,
    java: `class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your solution here\n    }\n}`,
  },
  'binary-search': {
    python: `class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        # Write your solution here\n        pass`,
    javascript: `function search(nums, target) {\n    // Write your solution here\n}`,
    cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your solution here\n    }\n};`,
    java: `class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n    }\n}`,
  },
};

const defaultStarterCode: Record<string, string> = {
  python: `class Solution:\n    def solve(self) -> None:\n        # Write your solution here\n        pass`,
  javascript: `function solve() {\n    // Write your solution here\n}`,
  cpp: `class Solution {\npublic:\n    // Write your solution here\n};`,
  java: `class Solution {\n    // Write your solution here\n}`,
};

const fileNames: Record<string, string> = {
  python: 'solution.py',
  javascript: 'solution.js',
  cpp: 'solution.cpp',
  java: 'Solution.java',
};

export default function ProblemViewPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params);
  const t = useTranslations('ProblemView');
  const locale = useLocale();
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<'success' | 'fail' | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
  const [submissions, setSubmissions] = useState<Array<{
    id: string;
    code: string;
    language: string;
    status: string;
    runtime: number | null;
    memory: number | null;
    testCasesPassed: number;
    testCasesTotal: number;
    createdAt: string;
  }>>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  const { data: session } = useSession();

  // State for DB-backed problem with mock-data fallback
  const [dbProblem, setDbProblem] = useState<Problem | null>(null);
  const [isLoadingProblem, setIsLoadingProblem] = useState(true);

  // Fetch problem from DB on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchProblem() {
      try {
        const res = await fetch(`/api/problems?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data && !data.error) setDbProblem(data);
        }
      } catch {
        // Silently fall back to mock data
      } finally {
        if (!cancelled) setIsLoadingProblem(false);
      }
    }
    fetchProblem();
    return () => { cancelled = true; };
  }, [id]);

  const problem = dbProblem || getProblemById(id);

  const fetchSubmissions = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoadingSubmissions(true);
    try {
      const response = await fetch(`/api/submissions?userId=${session.user.id}&problemId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [session?.user?.id, id]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, fetchSubmissions]);

  if (isLoadingProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D12]">
        <Loader2 className="w-6 h-6 animate-spin text-algora-text-dim" />
      </div>
    );
  }

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

  const getCode = () => {
    if (code) return code;
    const slugCode = starterCode[problem.slug];
    if (slugCode && slugCode[language]) return slugCode[language];
    return defaultStarterCode[language] || '';
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setSubmitResult(null);

    try {
      // Test against first example
      const example = problem.examples[0];
      if (!example) {
        setOutput('No test cases available');
        setIsRunning(false);
        return;
      }

      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: getCode(),
          language,
          stdin: example.input,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setOutput(`Error: ${result.error}`);
      } else {
        const actual = (result.stdout || '').trim();
        const expected = example.output.trim();
        const passed = actual === expected;

        setOutput(
          `Test Case 1:\nInput: ${example.input}\nExpected: ${expected}\nOutput: ${actual}\n${passed ? '✓ Passed' : '✗ Failed'}${result.time ? ` (${result.time}s)` : ''}\n` +
          (result.stderr ? `\nStderr: ${result.stderr}\n` : '') +
          (result.time ? `Execution Time: ${(parseFloat(result.time) * 1000).toFixed(0)}ms\n` : '') +
          (result.memory ? `Memory: ${(result.memory / 1024).toFixed(1)} MB` : '')
        );
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Failed to execute code'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setOutput('');
    setSubmitResult(null);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: getCode(),
          language,
          problemId: problem.id,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setOutput(`Error: ${result.error}`);
        setSubmitResult('fail');
      } else {
        const { status, testCasesPassed, testCasesTotal, results } = result;
        const isAccepted = status === 'Accepted';

        let outputStr = isAccepted
          ? '✓ All Test Cases Passed!\n\n'
          : `✗ ${status}\n\n`;

        outputStr += `Test Cases: ${testCasesPassed}/${testCasesTotal}\n\n`;

        results.forEach((tc: { input: string; expected: string; actual: string; passed: boolean }, idx: number) => {
          outputStr += `Test Case ${idx + 1}:\n`;
          outputStr += `  Input: ${tc.input}\n`;
          outputStr += `  Expected: ${tc.expected}\n`;
          outputStr += `  Output: ${tc.actual}\n`;
          outputStr += `  ${tc.passed ? '✓ Passed' : '✗ Failed'}\n\n`;
        });

        if (result.runtime) outputStr += `Runtime: ${(result.runtime * 1000).toFixed(0)}ms\n`;
        if (result.memory) outputStr += `Memory: ${(result.memory / 1024).toFixed(1)} MB\n`;

        setOutput(outputStr);
        setSubmitResult(isAccepted ? 'success' : 'fail');
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Submission failed'}`);
      setSubmitResult('fail');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Select value={language} onValueChange={setLanguage}>
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
                {t('submissions')} ({submissions.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
              {activeTab === 'description' ? (
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
              ) : (
              <div className="space-y-4">
                {/* Submissions List */}
                {isLoadingSubmissions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-algora-text-dim" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Code2 className="w-10 h-10 text-algora-text-dim mb-3" />
                    <p className="text-sm text-algora-text-muted">
                      {locale === 'ar' ? 'لا توجد حلول مُقدمة لهذه المسألة بعد' : 'No submissions for this problem yet'}
                    </p>
                    <p className="text-xs text-algora-text-dim mt-1">
                      {locale === 'ar' ? 'قدّم حلك الأول!' : 'Submit your first solution!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4 hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            className={`text-xs font-medium border ${
                              sub.status === 'Accepted'
                                ? 'bg-algora-green/15 text-algora-green border-algora-green/30'
                                : sub.status === 'Wrong Answer'
                                ? 'bg-algora-red/15 text-algora-red border-algora-red/30'
                                : 'bg-algora-gold/15 text-algora-gold border-algora-gold/30'
                            }`}
                          >
                            {sub.status === 'Accepted' ? '✓' : '✗'} {sub.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-algora-text-dim">
                            <Clock className="w-3 h-3" />
                            {new Date(sub.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-algora-text-muted">
                          <span className="capitalize">
                            {sub.language === 'python' ? 'Python' : sub.language === 'javascript' ? 'JavaScript' : sub.language === 'cpp' ? 'C++' : 'Java'}
                          </span>
                          <span>
                            {sub.testCasesPassed}/{sub.testCasesTotal} {locale === 'ar' ? 'حالات اختبار' : 'test cases'}
                          </span>
                          {sub.runtime !== null && (
                            <span>{(sub.runtime * 1000).toFixed(0)}ms</span>
                          )}
                          <span>{sub.code.length} {locale === 'ar' ? 'حرف' : 'chars'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
            </div>
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
              disabled={isRunning}
            >
              {isRunning ? (
                <Loader2 className="w-3.5 h-3.5 me-1.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 me-1.5" />
              )}
              {t('runCode')}
            </Button>
            <Button
              size="sm"
              className="bg-algora-green/90 hover:bg-algora-green text-algora-bg-primary rounded-lg h-8 text-xs font-medium"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 me-1.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 me-1.5" />
              )}
              {t('submit')}
            </Button>

            {submitResult && (
              <div className={`ms-auto flex items-center gap-1.5 text-xs font-medium ${submitResult === 'success' ? 'text-algora-green' : 'text-algora-red'}`}>
                {submitResult === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {submitResult === 'success' ? t('submitSuccess') : t('submitFail')}
              </div>
            )}
          </div>

          {/* Code Editor (placeholder) */}
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

              {/* Monaco Code Editor */}
              <div className="flex-1 min-h-0">
                <CodeEditor
                  value={getCode()}
                  onChange={(val) => setCode(val)}
                  language={language}
                  height="100%"
                />
              </div>
            </div>
          </div>

          {/* Console */}
          <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#161622]">
            <div className="flex items-center px-4 py-2 border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-xs font-medium text-algora-text-dim">
                {t('console')}
              </span>
            </div>
            <div className="p-4 max-h-40 overflow-y-auto">
              {output ? (
                <pre className="text-xs text-algora-text-muted font-mono whitespace-pre-wrap leading-5">
                  {output}
                </pre>
              ) : (
                <p className="text-xs text-algora-text-dim">
                  {t('noOutput')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
