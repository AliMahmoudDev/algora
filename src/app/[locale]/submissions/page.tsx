'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Loader2,
  Code2,
  Clock,
  Trophy,
  XCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Submission {
  id: string;
  code: string;
  language: string;
  status: string;
  runtime: number | null;
  memory: number | null;
  testCasesPassed: number;
  testCasesTotal: number;
  createdAt: string;
  problem: {
    title: string;
    titleAr: string;
    slug: string;
    difficulty: string;
  };
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Accepted':
      return 'bg-algora-green/15 text-algora-green border-algora-green/30';
    case 'Wrong Answer':
      return 'bg-algora-red/15 text-algora-red border-algora-red/30';
    case 'Runtime Error':
      return 'bg-algora-gold/15 text-algora-gold border-algora-gold/30';
    case 'Compilation Error':
      return 'bg-algora-purple/15 text-algora-purple border-algora-purple/30';
    case 'Time Limit Exceeded':
      return 'bg-algora-gold/15 text-algora-gold border-algora-gold/30';
    default:
      return 'bg-[rgba(255,255,255,0.08)] text-algora-text-muted border-[rgba(255,255,255,0.15)]';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Accepted':
      return <CheckCircle2 className="w-4 h-4 text-algora-green" />;
    case 'Wrong Answer':
      return <XCircle className="w-4 h-4 text-algora-red" />;
    case 'Runtime Error':
    case 'Compilation Error':
    case 'Time Limit Exceeded':
      return <AlertCircle className="w-4 h-4 text-algora-gold" />;
    default:
      return <XCircle className="w-4 h-4 text-algora-text-muted" />;
  }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy':
      return 'bg-algora-green/15 text-algora-green border-algora-green/30';
    case 'Medium':
      return 'bg-algora-gold/15 text-algora-gold border-algora-gold/30';
    case 'Hard':
      return 'bg-algora-red/15 text-algora-red border-algora-red/30';
    default:
      return 'bg-[rgba(255,255,255,0.08)] text-algora-text-muted border-[rgba(255,255,255,0.15)]';
  }
}

function timeAgo(dateStr: string, locale: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return locale === 'ar' ? 'الآن' : 'just now';
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return locale === 'ar' ? `منذ ${mins} دقيقة` : `${mins}m ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return locale === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`;
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return locale === 'ar' ? `منذ ${days} يوم` : `${days}d ago`;
  }
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function SubmissionsPage() {
  const locale = useLocale();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubmissions = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/submissions?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        setError('Failed to load submissions');
      }
    } catch {
      setError(locale === 'ar' ? 'حدث خطأ أثناء تحميل البيانات' : 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, locale]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/auth/signin`);
      return;
    }
    if (status === 'authenticated') {
      fetchSubmissions();
    }
  }, [status, fetchSubmissions, router, locale]);

  const acceptedCount = submissions.filter(s => s.status === 'Accepted').length;
  const totalSubmissions = submissions.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D12]">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${locale}/problems`)}
                className="text-algora-text-muted hover:text-algora-text-primary hover:bg-[rgba(255,255,255,0.05)] rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 me-1.5" />
                {locale === 'ar' ? 'المسائل' : 'Problems'}
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-algora-text-primary mb-2">
              {locale === 'ar' ? 'الحلول المقدمة' : 'Submissions'}
            </h1>
            <p className="text-sm text-algora-text-muted">
              {locale === 'ar'
                ? 'تتبع جميع الحلول المقدمة لمسائل ألغورا'
                : 'Track all your submitted solutions across Algora problems'}
            </p>
          </div>

          {/* Stats */}
          {totalSubmissions > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="w-4 h-4 text-algora-text-dim" />
                  <span className="text-xs text-algora-text-dim">
                    {locale === 'ar' ? 'إجمالي الحلول' : 'Total'}
                  </span>
                </div>
                <p className="text-xl font-bold text-algora-text-primary">{totalSubmissions}</p>
              </div>
              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-algora-green" />
                  <span className="text-xs text-algora-text-dim">
                    {locale === 'ar' ? 'مقبولة' : 'Accepted'}
                  </span>
                </div>
                <p className="text-xl font-bold text-algora-green">{acceptedCount}</p>
              </div>
              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-algora-gold" />
                  <span className="text-xs text-algora-text-dim">
                    {locale === 'ar' ? 'نسبة القبول' : 'Accept Rate'}
                  </span>
                </div>
                <p className="text-xl font-bold text-algora-gold">
                  {totalSubmissions > 0
                    ? `${((acceptedCount / totalSubmissions) * 100).toFixed(0)}%`
                    : '0%'}
                </p>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-algora-text-dim" />
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-20">
              <XCircle className="w-10 h-10 text-algora-red mb-3" />
              <p className="text-sm text-algora-text-muted">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && submissions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Code2 className="w-12 h-12 text-algora-text-dim mb-4" />
              <h3 className="text-lg font-semibold text-algora-text-primary mb-2">
                {locale === 'ar' ? 'لا توجد حلول مُقدمة' : 'No submissions yet'}
              </h3>
              <p className="text-sm text-algora-text-muted mb-6 text-center max-w-md">
                {locale === 'ar'
                  ? 'لم تقدم أي حل بعد. ابدأ بحل مسألة لتشاهد تقدمك هنا!'
                  : "You haven't submitted any solutions yet. Start solving problems to track your progress!"}
              </p>
              <Button
                onClick={() => router.push(`/${locale}/problems`)}
                className="bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 rounded-lg"
              >
                {locale === 'ar' ? 'تصفح المسائل' : 'Browse Problems'}
              </Button>
            </div>
          )}

          {/* Submissions List */}
          {!isLoading && !error && submissions.length > 0 && (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors overflow-hidden"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {getStatusIcon(sub.status)}
                        <button
                          onClick={() => router.push(`/${locale}/problems/${sub.problem.slug}`)}
                          className="text-sm font-medium text-algora-text-primary hover:text-algora-gold transition-colors truncate"
                        >
                          {locale === 'ar' ? sub.problem.titleAr : sub.problem.title}
                        </button>
                        <Badge className={`text-xs font-medium border shrink-0 ${getDifficultyColor(sub.problem.difficulty)}`}>
                          {sub.problem.difficulty}
                        </Badge>
                      </div>
                      <Badge className={`text-xs font-medium border shrink-0 ${getStatusBadge(sub.status)}`}>
                        {sub.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 text-xs text-algora-text-muted">
                      <span className="capitalize">
                        {sub.language === 'python' ? 'Python' : sub.language === 'javascript' ? 'JavaScript' : sub.language === 'cpp' ? 'C++' : 'Java'}
                      </span>
                      <span>
                        {sub.testCasesPassed}/{sub.testCasesTotal} {locale === 'ar' ? 'حالات' : 'cases'}
                      </span>
                      {sub.runtime !== null && (
                        <span>
                          <Clock className="w-3 h-3 inline me-1" />
                          {(sub.runtime * 1000).toFixed(0)}ms
                        </span>
                      )}
                      {sub.memory !== null && sub.memory > 0 && (
                        <span>{(sub.memory / 1024).toFixed(1)} MB</span>
                      )}
                      <span className="ms-auto text-algora-text-dim shrink-0">
                        {timeAgo(sub.createdAt, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
