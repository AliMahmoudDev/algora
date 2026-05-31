'use client';

import { use, useState } from 'react';
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
} from 'lucide-react';
import { getProblemById, difficultyConfig } from '@/data/mock-problems';

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

  const problem = getProblemById(id);

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
    await new Promise(resolve => setTimeout(resolve, 2000));
    setOutput(`Running...\n\nTest Case 1: ${problem.examples[0]?.input || 'N/A'}\nOutput: ${problem.examples[0]?.output || 'N/A'}\n✓ Passed (0ms)\n\nTest Case 2: ${problem.examples[1]?.input || 'N/A'}\nOutput: ${problem.examples[1]?.output || 'N/A'}\n✓ Passed (1ms)\n\nExecution Time: 52ms\nMemory: 42.1 MB`);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setOutput('');
    setSubmitResult(null);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setOutput(`\n✓ All Test Cases Passed!\n\nTest Cases: 52/52\nRuntime: 72ms (faster than 87.3%)\nMemory: 42.1 MB (less than 91.2%)`);
    setSubmitResult('success');
    setIsSubmitting(false);
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
                Submissions (3)
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
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

              {/* Textarea as code editor placeholder */}
              <textarea
                value={getCode()}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 min-h-[200px] md:min-h-0 bg-[#161622] text-algora-text-primary font-mono text-sm p-4 resize-none focus:outline-none leading-6 selection:bg-algora-gold/20"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
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
