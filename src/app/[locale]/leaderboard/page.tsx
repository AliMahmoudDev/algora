'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Medal,
  Crown,
  Timer,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { Locale } from '@/i18n/routing';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userImage: string | null;
  problemsSolved: number;
  totalSubmissions: number;
  successRate: number;
  points: number;
  bestRuntime: number | null;
}

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative flex items-center justify-center w-10 h-10">
        <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
        <span className="absolute -bottom-1.5 text-[10px] font-bold text-yellow-400">
          1
        </span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="relative flex items-center justify-center w-10 h-10">
        <Medal className="w-6 h-6 text-gray-300 drop-shadow-[0_0_6px_rgba(209,213,219,0.4)]" />
        <span className="absolute -bottom-1.5 text-[10px] font-bold text-gray-300">
          2
        </span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="relative flex items-center justify-center w-10 h-10">
        <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_6px_rgba(217,119,6,0.4)]" />
        <span className="absolute -bottom-1.5 text-[10px] font-bold text-amber-600">
          3
        </span>
      </div>
    );
  }
  return (
    <span className="text-algora-text-dim font-mono text-sm w-10 text-center">
      {rank}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl bg-algora-card-bg border border-[rgba(255,255,255,0.08)]"
        >
          <Skeleton className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)]" />
          <Skeleton className="h-4 w-32 bg-[rgba(255,255,255,0.06)]" />
          <div className="flex-1" />
          <Skeleton className="h-4 w-16 bg-[rgba(255,255,255,0.06)]" />
          <Skeleton className="h-4 w-16 bg-[rgba(255,255,255,0.06)]" />
          <Skeleton className="h-4 w-16 bg-[rgba(255,255,255,0.06)]" />
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const t = useTranslations('Leaderboard');
  const locale = useLocale() as Locale;
  const { data: session } = useSession();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const json = await res.json();
          setEntries(json.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const currentUserId = session?.user?.id;
  const currentUserEntry = entries.find((e) => e.userId === currentUserId);
  const topThree = entries.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D12]">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-algora-gold/10 border border-algora-gold/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-algora-gold" />
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-algora-text-primary">
                {t('title')}
              </h1>
            </div>
            <p className="text-algora-text-muted text-sm md:text-base">
              {t('topPerformers')}
            </p>
          </div>

          {/* Top 3 Podium - Desktop */}
          {!loading && entries.length >= 3 && (
            <div className="hidden md:grid md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
              {/* 2nd place */}
              <div className="order-1 flex flex-col items-center bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                <RankBadge rank={2} />
                <Avatar className="size-16 mt-3 ring-2 ring-gray-300/30">
                  <AvatarImage src={topThree[1].userImage ?? ''} alt={topThree[1].userName} />
                  <AvatarFallback className="bg-gray-300/15 text-gray-300 text-lg font-bold">
                    {getUserInitials(topThree[1].userName)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-algora-text-primary mt-3 text-center">
                  {topThree[1].userName}
                </p>
                <p className="text-2xl font-bold text-gray-300 mt-2">
                  {topThree[1].points}
                </p>
                <p className="text-xs text-algora-text-dim">{t('points')}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-algora-text-muted">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-gray-300" />
                    {topThree[1].problemsSolved} {t('problemsSolved').toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {topThree[1].successRate}%
                  </span>
                </div>
              </div>

              {/* 1st place */}
              <div className="order-2 flex flex-col items-center bg-algora-card-bg rounded-xl border border-yellow-400/20 p-6 md:-mt-4 md:mb-4 relative overflow-hidden opacity-0 animate-fade-in-up" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <RankBadge rank={1} />
                  <Avatar className="size-20 mt-3 ring-2 ring-yellow-400/40">
                    <AvatarImage src={topThree[0].userImage ?? ''} alt={topThree[0].userName} />
                    <AvatarFallback className="bg-yellow-400/15 text-yellow-400 text-xl font-bold">
                      {getUserInitials(topThree[0].userName)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-base font-bold text-algora-text-primary mt-3 text-center">
                    {topThree[0].userName}
                  </p>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">
                    {topThree[0].points}
                  </p>
                  <p className="text-xs text-yellow-400/60">{t('points')}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-algora-text-muted">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-yellow-400" />
                      {topThree[0].problemsSolved} {t('problemsSolved').toLowerCase()}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {topThree[0].successRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 3rd place */}
              <div className="order-3 flex flex-col items-center bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <RankBadge rank={3} />
                <Avatar className="size-16 mt-3 ring-2 ring-amber-600/30">
                  <AvatarImage src={topThree[2].userImage ?? ''} alt={topThree[2].userName} />
                  <AvatarFallback className="bg-amber-600/15 text-amber-600 text-lg font-bold">
                    {getUserInitials(topThree[2].userName)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-algora-text-primary mt-3 text-center">
                  {topThree[2].userName}
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-2">
                  {topThree[2].points}
                </p>
                <p className="text-xs text-algora-text-dim">{t('points')}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-algora-text-muted">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-amber-600" />
                    {topThree[2].problemsSolved} {t('problemsSolved').toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {topThree[2].successRate}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Top 3 - Horizontal Cards */}
          {!loading && entries.length >= 3 && (
            <div className="md:hidden grid grid-cols-3 gap-3 mb-8">
              {topThree.map((entry, i) => (
                <div
                  key={entry.userId}
                  className={`flex flex-col items-center bg-algora-card-bg rounded-xl border p-4 opacity-0 animate-fade-in-up ${
                    entry.rank === 1
                      ? 'border-yellow-400/20'
                      : 'border-[rgba(255,255,255,0.08)]'
                  }`}
                  style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <RankBadge rank={entry.rank} />
                  <Avatar
                    className={`size-12 mt-2 ring-2 ${
                      entry.rank === 1
                        ? 'ring-yellow-400/40'
                        : entry.rank === 2
                        ? 'ring-gray-300/30'
                        : 'ring-amber-600/30'
                    }`}
                  >
                    <AvatarImage src={entry.userImage ?? ''} alt={entry.userName} />
                    <AvatarFallback
                      className={`text-sm font-bold ${
                        entry.rank === 1
                          ? 'bg-yellow-400/15 text-yellow-400'
                          : entry.rank === 2
                          ? 'bg-gray-300/15 text-gray-300'
                          : 'bg-amber-600/15 text-amber-600'
                      }`}
                    >
                      {getUserInitials(entry.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-medium text-algora-text-primary mt-2 truncate w-full text-center">
                    {entry.userName}
                  </p>
                  <p
                    className={`text-lg font-bold mt-1 ${
                      entry.rank === 1
                        ? 'text-yellow-400'
                        : entry.rank === 2
                        ? 'text-gray-300'
                        : 'text-amber-600'
                    }`}
                  >
                    {entry.points}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Current User Rank Banner */}
          {!loading && currentUserEntry && (
            <div className="mb-6 bg-algora-gold/10 border border-algora-gold/20 rounded-xl p-4 flex items-center gap-4 animate-fade-in-up">
              <div className="w-10 h-10 rounded-full bg-algora-gold/20 flex items-center justify-center">
                <span className="text-sm font-bold text-algora-gold">
                  #{currentUserEntry.rank}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-algora-gold">
                  {t('yourRank')}
                </p>
                <p className="text-xs text-algora-text-muted">
                  {currentUserEntry.points} {t('points').toLowerCase()} · {currentUserEntry.problemsSolved} {t('problemsSolved').toLowerCase()} · {currentUserEntry.successRate}%
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && <LoadingSkeleton />}

          {/* Empty State */}
          {!loading && entries.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-algora-card-bg border border-[rgba(255,255,255,0.08)] flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-algora-text-dim" />
              </div>
              <p className="text-algora-text-muted text-lg">{t('noData')}</p>
            </div>
          )}

          {/* Leaderboard Table - Desktop */}
          {!loading && entries.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.08)]">
                      <th className="w-20 px-4 py-3 text-start text-xs font-medium text-algora-text-dim uppercase tracking-wider">
                        {t('rank')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium text-algora-text-dim uppercase tracking-wider">
                        {t('user')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-algora-text-dim uppercase tracking-wider">
                        {t('problemsSolved')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-algora-text-dim uppercase tracking-wider">
                        {t('points')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-algora-text-dim uppercase tracking-wider">
                        {t('successRate')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-algora-text-dim uppercase tracking-wider">
                        {t('totalSubmissions')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-algora-text-dim uppercase tracking-wider">
                        {t('bestRuntime')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                    {entries.map((entry) => {
                      const isCurrentUser = entry.userId === currentUserId;
                      return (
                        <tr
                          key={entry.userId}
                          className={`transition-colors ${
                            isCurrentUser
                              ? 'bg-algora-gold/8 border-l-2 border-l-algora-gold'
                              : 'hover:bg-[rgba(255,255,255,0.02)]'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <RankBadge rank={entry.rank} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarImage
                                  src={entry.userImage ?? ''}
                                  alt={entry.userName}
                                />
                                <AvatarFallback className="bg-algora-gold/20 text-algora-gold text-xs font-semibold">
                                  {getUserInitials(entry.userName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-algora-text-primary">
                                {entry.userName}
                                {isCurrentUser && (
                                  <Badge className="ml-2 bg-algora-gold/15 text-algora-gold border border-algora-gold/30 text-[10px] px-1.5 py-0">
                                    {t('you')}
                                  </Badge>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-algora-green">
                              {entry.problemsSolved}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-sm font-bold ${
                                entry.rank === 1
                                  ? 'text-yellow-400'
                                  : entry.rank === 2
                                  ? 'text-gray-300'
                                  : entry.rank === 3
                                  ? 'text-amber-600'
                                  : 'text-algora-gold'
                              }`}
                            >
                              {entry.points}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-algora-text-muted">
                              {entry.successRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-algora-text-muted">
                              {entry.totalSubmissions}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-algora-text-muted font-mono">
                              {entry.bestRuntime !== null
                                ? `${entry.bestRuntime.toFixed(2)}s`
                                : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {entries.map((entry) => {
                  const isCurrentUser = entry.userId === currentUserId;
                  return (
                    <div
                      key={entry.userId}
                      className={`bg-algora-card-bg rounded-xl border p-4 card-hover ${
                        isCurrentUser
                          ? 'border-algora-gold/30'
                          : 'border-[rgba(255,255,255,0.08)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <RankBadge rank={entry.rank} />
                        <Avatar className="size-9">
                          <AvatarImage
                            src={entry.userImage ?? ''}
                            alt={entry.userName}
                          />
                          <AvatarFallback className="bg-algora-gold/20 text-algora-gold text-xs font-semibold">
                            {getUserInitials(entry.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-algora-text-primary truncate">
                            {entry.userName}
                            {isCurrentUser && (
                              <Badge className="ms-2 bg-algora-gold/15 text-algora-gold border border-algora-gold/30 text-[10px] px-1.5 py-0">
                                {t('you')}
                              </Badge>
                            )}
                          </p>
                        </div>
                        <span
                          className={`text-lg font-bold ${
                            entry.rank === 1
                              ? 'text-yellow-400'
                              : entry.rank === 2
                              ? 'text-gray-300'
                              : entry.rank === 3
                              ? 'text-amber-600'
                              : 'text-algora-gold'
                          }`}
                        >
                          {entry.points}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-algora-text-muted">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-algora-green" />
                          {entry.problemsSolved} {t('problemsSolved').toLowerCase()}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {entry.successRate}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {entry.bestRuntime !== null
                            ? `${entry.bestRuntime.toFixed(2)}s`
                            : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
