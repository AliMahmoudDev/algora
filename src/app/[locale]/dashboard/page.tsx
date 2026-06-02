'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import {
  Trophy,
  Target,
  TrendingUp,
  Flame,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Code,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mockProblems, difficultyConfig, type Difficulty } from '@/data/mock-problems';
import type { Locale } from '@/i18n/routing';

// Types for API response
interface DashboardStats {
  solved: number;
  attempted: number;
  total: number;
  successRate: number;
  currentStreak: number;
  submissionsThisWeek: number;
  recentActivity: RecentActivity[];
  skillBreakdown: {
    Easy: { solved: number; total: number };
    Medium: { solved: number; total: number };
    Hard: { solved: number; total: number };
  };
}

interface RecentActivity {
  id: string;
  problemId: string;
  problemTitle: string;
  problemTitleAr: string;
  problemDifficulty: string;
  status: 'accepted' | 'wrongAnswer' | 'error';
  language: string;
  createdAt: string;
  runtime: number | null;
  memory: number | null;
  testCasesPassed: number;
  testCasesTotal: number;
}

interface UserProblemStatus {
  problemId: string;
  status: string;
}

const emptyStats: DashboardStats = {
  solved: 0,
  attempted: 0,
  total: 14,
  successRate: 0,
  currentStreak: 0,
  submissionsThisWeek: 0,
  recentActivity: [],
  skillBreakdown: {
    Easy: { solved: 0, total: 5 },
    Medium: { solved: 0, total: 7 },
    Hard: { solved: 0, total: 2 },
  },
};

function formatTimeAgo(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (locale === 'ar') {
    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHr < 24) return `منذ ${diffHr} ساعة`;
    if (diffDay < 30) return `منذ ${diffDay} يوم`;
    return `منذ ${Math.floor(diffDay / 30)} شهر`;
  }

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [userProblemStatuses, setUserProblemStatuses] = useState<UserProblemStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async (userId: string) => {
    try {
      const [statsRes, userProblemsRes] = await Promise.all([
        fetch(`/api/dashboard/stats?userId=${userId}`),
        fetch(`/api/submissions?userId=${userId}`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (userProblemsRes.ok) {
        const submissions = await userProblemsRes.json();
        // Derive user problem statuses from submissions data
        // We also need UserProblem data, but we can derive it from the stats
        // For now, fetch the userProblems from the stats API (already included in skillBreakdown)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Also fetch UserProblem statuses for the "Continue Solving" section
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUserProblems = async () => {
      try {
        const res = await fetch(`/api/user-problems?userId=${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserProblemStatuses(data);
        }
      } catch {
        // Fallback: no user problem data
      }
    };
    fetchUserProblems();
  }, [session?.user?.id]);

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (session?.user?.id) {
      setLoading(true);
      fetchDashboardData(session.user.id);
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, authStatus, fetchDashboardData]);

  const getProblemTitle = (title: string, titleAr: string) => locale === 'ar' ? titleAr : title;

  // Determine which problems are not solved
  const solvedProblemIds = new Set(
    stats.skillBreakdown
      ? [
          // We derive solved IDs from userProblemStatuses or use empty set
        ]
      : []
  );

  // Use userProblemStatuses to determine solved problems
  const solvedIds = new Set(
    userProblemStatuses.filter(up => up.status === 'Solved').map(up => up.problemId)
  );

  const unsolvedProblems = mockProblems.filter(p => !solvedIds.has(p.id));

  // Calculate active days from current streak
  const activeDays = stats.currentStreak;

  const statCards = [
    {
      label: t('problemsSolved'),
      value: stats.solved,
      subtitle: `${t('of')} ${stats.total}`,
      icon: Trophy,
      color: 'text-algora-gold',
      iconBg: 'bg-algora-gold/10',
      borderColor: 'border-algora-gold/20',
    },
    {
      label: t('problemsAttempted'),
      value: stats.attempted,
      subtitle: `${stats.submissionsThisWeek} ${t('submissionsThisWeek')}`,
      icon: Target,
      color: 'text-algora-purple',
      iconBg: 'bg-algora-purple/10',
      borderColor: 'border-algora-purple/20',
    },
    {
      label: t('successRate'),
      value: `${stats.successRate}%`,
      subtitle: `${t('of')} ${stats.attempted} ${t('attempted').toLowerCase()}`,
      icon: TrendingUp,
      color: 'text-algora-green',
      iconBg: 'bg-algora-green/10',
      borderColor: 'border-algora-green/20',
    },
    {
      label: t('currentStreak'),
      value: stats.currentStreak,
      subtitle: `${activeDays} ${t('activeDays')}`,
      icon: Flame,
      color: 'text-algora-red',
      iconBg: 'bg-algora-red/10',
      borderColor: 'border-algora-red/20',
    },
  ];

  const skillColors: Record<Difficulty, { bar: string; bg: string; text: string }> = {
    Easy: { bar: 'bg-algora-green', bg: 'bg-algora-green/10', text: 'text-algora-green' },
    Medium: { bar: 'bg-algora-gold', bg: 'bg-algora-gold/10', text: 'text-algora-gold' },
    Hard: { bar: 'bg-algora-red', bg: 'bg-algora-red/10', text: 'text-algora-red' },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D12]">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-algora-text-primary mb-2">
              {t('title')}
            </h1>
            <p className="text-algora-text-muted text-sm md:text-base">
              {t('welcomeBack')}
              {session?.user?.name
                ? `, ${session.user.name}`
                : session?.user?.email ? `, ${session.user.email.split('@')[0]}` : ''
              }! {t('overview')}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {statCards.map((card, index) => (
              <div
                key={card.label}
                className="bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-4 md:p-6 card-hover opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${card.iconBg} border ${card.borderColor} flex items-center justify-center`}>
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                    </div>
                    <div className={`text-2xl md:text-3xl font-bold ${card.color} mb-1`}>
                      {card.value}
                    </div>
                    <div className="text-algora-text-primary text-sm font-medium">
                      {card.label}
                    </div>
                    <div className="text-algora-text-dim text-xs mt-0.5">
                      {card.subtitle}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column: Recent Activity + Skill Breakdown */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Recent Activity */}
              <section className="bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-algora-text-primary">
                      {t('recentActivity')}
                    </h2>
                    <p className="text-sm text-algora-text-dim mt-0.5">
                      {t('recentActivityDesc')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-md" />
                      </div>
                    ))
                  ) : stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                        onClick={() => router.push(`/${locale}/problems/${activity.problemId}`)}
                        style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                      >
                        {/* Status Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.status === 'accepted'
                            ? 'bg-algora-green/10'
                            : 'bg-algora-red/10'
                        }`}>
                          {activity.status === 'accepted' ? (
                            <CheckCircle2 className="w-4 h-4 text-algora-green" />
                          ) : (
                            <XCircle className="w-4 h-4 text-algora-red" />
                          )}
                        </div>

                        {/* Problem Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-algora-text-primary truncate">
                            {getProblemTitle(activity.problemTitle, activity.problemTitleAr)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-algora-text-dim">{activity.language}</span>
                            <span className="text-algora-text-dim/30">·</span>
                            <span className="text-xs text-algora-text-dim">
                              {formatTimeAgo(activity.createdAt, locale)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <Badge
                          className={`text-xs font-medium border ${
                            activity.status === 'accepted'
                              ? 'bg-algora-green/15 text-algora-green border-algora-green/30'
                              : 'bg-algora-red/15 text-algora-red border-algora-red/30'
                          }`}
                        >
                          {activity.status === 'accepted' ? t('accepted') : t('wrongAnswer')}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Code className="w-12 h-12 text-algora-text-dim/30 mx-auto mb-3" />
                      <p className="text-sm text-algora-text-dim">
                        {locale === 'ar'
                          ? 'لا يوجد نشاط بعد. ابدأ بحل مسألة!'
                          : 'No activity yet. Start solving a problem!'}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 border-algora-gold/30 text-algora-gold hover:bg-algora-gold/10 rounded-lg"
                        onClick={() => router.push(`/${locale}/problems`)}
                      >
                        <Code className="w-4 h-4 me-2" />
                        {locale === 'ar' ? 'تصفح المسائل' : 'Browse Problems'}
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              {/* Skill Breakdown */}
              <section className="bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-algora-text-primary">
                    {t('skillBreakdown')}
                  </h2>
                  <p className="text-sm text-algora-text-dim mt-0.5">
                    {t('skillBreakdownDesc')}
                  </p>
                </div>

                <div className="space-y-6">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-2.5 w-full rounded-full" />
                      </div>
                    ))
                  ) : (
                    (Object.entries(stats.skillBreakdown) as [Difficulty, { solved: number; total: number }][]).map(([difficulty, data]) => {
                      const pct = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
                      const colors = skillColors[difficulty];
                      return (
                        <div key={difficulty}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${colors.text}`}>
                                {t(difficulty.toLowerCase() as 'easy' | 'medium' | 'hard')}
                              </span>
                              <Badge className={`${difficultyConfig[difficulty].color} text-xs border`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${difficultyConfig[difficulty].dot} mr-1.5`} />
                                {difficulty}
                              </Badge>
                            </div>
                            <span className="text-sm text-algora-text-muted">
                              {data.solved}/{data.total} {t('solved').toLowerCase()}
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="text-xs text-algora-text-dim mt-1 text-end">
                            {pct}%
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Continue Solving */}
            <div className="space-y-6 md:space-y-8">
              <section className="bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-algora-text-primary">
                    {t('continueSolving')}
                  </h2>
                  <p className="text-sm text-algora-text-dim mt-0.5">
                    {t('continueSolvingDesc')}
                  </p>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto custom-scrollbar">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                        <Skeleton className="h-4 w-6" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-12 rounded-md" />
                        </div>
                      </div>
                    ))
                  ) : unsolvedProblems.length > 0 ? (
                    unsolvedProblems.map((problem) => {
                      const config = difficultyConfig[problem.difficulty];
                      return (
                        <div
                          key={problem.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer group"
                          onClick={() => router.push(`/${locale}/problems/${problem.id}`)}
                        >
                          <span className="text-algora-text-dim font-mono text-xs shrink-0">
                            #{problem.orderIndex}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-algora-text-primary truncate group-hover:text-algora-gold transition-colors">
                              {getProblemTitle(problem.title, problem.titleAr)}
                            </p>
                            <Badge className={`${config.color} text-[10px] border mt-1`}>
                              <span className={`w-1 h-1 rounded-full ${config.dot} mr-1`} />
                              {t(problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard')}
                            </Badge>
                          </div>
                          <ArrowRight className="w-4 h-4 text-algora-text-dim group-hover:text-algora-gold transition-colors shrink-0" />
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-algora-text-dim text-center py-8">
                      {t('noUnsolved')}
                    </p>
                  )}
                </div>
              </section>

              {/* Quick Actions */}
              <section className="bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6">
                <h2 className="text-lg font-semibold text-algora-text-primary mb-4">
                  {t('overview')}
                </h2>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[rgba(255,255,255,0.08)] text-algora-text-muted hover:text-algora-gold hover:border-algora-gold/30 hover:bg-algora-card-bg rounded-lg"
                    onClick={() => router.push(`/${locale}/problems`)}
                  >
                    <Code className="w-4 h-4 me-3" />
                    {t('backToProblems')}
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
