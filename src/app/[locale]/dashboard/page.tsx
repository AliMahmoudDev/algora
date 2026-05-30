'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Navbar from '@/components/Navbar';
import {
  Trophy,
  Target,
  TrendingUp,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Code,
  ArrowLeftRight,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockProblems, difficultyConfig, type Difficulty } from '@/data/mock-problems';
import type { Locale } from '@/i18n/routing';

// ── Mock dashboard data ──
const mockStats = {
  solved: 4,
  attempted: 7,
  total: 14,
  successRate: 57,
  currentStreak: 3,
  submissionsThisWeek: 12,
  activeDays: 5,
};

const mockRecentActivity = [
  { id: 1, problemId: '1', problemTitle: 'Two Sum', problemTitleAr: 'مجموع اثنين', status: 'accepted' as const, language: 'Python', time: '2h ago' },
  { id: 2, problemId: '4', problemTitle: 'Maximum Subarray', problemTitleAr: 'أكبر مصفوفة فرعية', status: 'wrongAnswer' as const, language: 'JavaScript', time: '5h ago' },
  { id: 3, problemId: '2', problemTitle: 'Valid Palindrome', problemTitleAr: 'السلسلة المتطابقة الصالحة', status: 'accepted' as const, language: 'C++', time: '1d ago' },
  { id: 4, problemId: '8', problemTitle: 'Container With Most Water', problemTitleAr: 'الحاوية ذات أكبر كمية ماء', status: 'accepted' as const, language: 'Java', time: '2d ago' },
  { id: 5, problemId: '12', problemTitle: 'LRU Cache', problemTitleAr: 'ذاكرة مؤقتة LRU', status: 'wrongAnswer' as const, language: 'Python', time: '3d ago' },
];

const mockSkillBreakdown = {
  Easy: { solved: 3, total: 5 },
  Medium: { solved: 1, total: 7 },
  Hard: { solved: 0, total: 2 },
};

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const unsolvedProblems = mockProblems.filter(p => p.status !== 'Solved');
  const getProblemTitle = (title: string, titleAr: string) => locale === 'ar' ? titleAr : title;

  const statCards = [
    {
      label: t('problemsSolved'),
      value: mockStats.solved,
      subtitle: `${t('of')} ${mockStats.total}`,
      icon: Trophy,
      color: 'text-algora-gold',
      iconBg: 'bg-algora-gold/10',
      borderColor: 'border-algora-gold/20',
    },
    {
      label: t('problemsAttempted'),
      value: mockStats.attempted,
      subtitle: `${mockStats.submissionsThisWeek} ${t('submissionsThisWeek')}`,
      icon: Target,
      color: 'text-algora-purple',
      iconBg: 'bg-algora-purple/10',
      borderColor: 'border-algora-purple/20',
    },
    {
      label: t('successRate'),
      value: `${mockStats.successRate}%`,
      subtitle: `${t('of')} ${mockStats.attempted} ${t('attempted').toLowerCase()}`,
      icon: TrendingUp,
      color: 'text-algora-green',
      iconBg: 'bg-algora-green/10',
      borderColor: 'border-algora-green/20',
    },
    {
      label: t('currentStreak'),
      value: mockStats.currentStreak,
      subtitle: `${mockStats.activeDays} ${t('activeDays')}`,
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
              {user?.user_metadata?.full_name
                ? `, ${user.user_metadata.full_name}`
                : user?.email ? `, ${user.email.split('@')[0]}` : ''
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
                  {mockRecentActivity.map((activity, index) => (
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
                          <span className="text-xs text-algora-text-dim">{activity.time}</span>
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
                  ))}
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
                  {(Object.entries(mockSkillBreakdown) as [Difficulty, { solved: number; total: number }][]).map(([difficulty, data]) => {
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
                  })}
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
                  {unsolvedProblems.length > 0 ? (
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
