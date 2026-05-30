'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/use-auth';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  Send,
  TrendingUp,
  Flame,
  Calendar,
  Edit3,
  Check,
  X,
  Tag,
} from 'lucide-react';
import type { Locale } from '@/i18n/routing';

// ── Mock profile data ──
const mockStats = {
  problemsSolved: 4,
  totalSubmissions: 12,
  successRate: 57,
  currentStreak: 3,
};

const mockSkillTags = [
  'Arrays',
  'Hash Table',
  'Two Pointers',
  'Dynamic Programming',
  'Strings',
  'Binary Search',
];

// Generate 12 weeks of activity (84 days) of mock data
const generateActivityData = () => {
  const data: number[] = [];
  for (let i = 0; i < 84; i++) {
    // More activity in recent weeks
    const recentness = i / 84;
    const rand = Math.random();
    if (rand < 0.15 + recentness * 0.25) {
      data.push(Math.floor(Math.random() * 4) + 1);
    } else {
      data.push(0);
    }
  }
  return data;
};

const activityData = generateActivityData();

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const locale = useLocale() as Locale;
  const { user } = useAuth();

  const [bio, setBio] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('algora-profile-bio') || '';
  });
  const [savedBio, setSavedBio] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('algora-profile-bio') || '';
  });
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');

  const handleSaveBio = () => {
    const trimmed = bioDraft.trim();
    setBio(trimmed);
    setSavedBio(trimmed);
    localStorage.setItem('algora-profile-bio', trimmed);
    setIsEditingBio(false);
  };

  const handleCancelBio = () => {
    setBioDraft(bio);
    setIsEditingBio(false);
  };

  const handleStartEditBio = () => {
    setBioDraft(bio);
    setIsEditingBio(true);
  };

  const getUserDisplayName = () => {
    if (!user) return 'Algora User';
    const metaData = user.user_metadata;
    return metaData?.full_name || metaData?.name || user.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(
        locale === 'ar' ? 'ar-SA' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : '2025-01-15';

  const statCards = [
    {
      label: t('problemsSolved'),
      value: mockStats.problemsSolved,
      icon: Trophy,
      color: 'text-algora-gold',
      iconBg: 'bg-algora-gold/10',
      borderColor: 'border-algora-gold/20',
    },
    {
      label: t('totalSubmissions'),
      value: mockStats.totalSubmissions,
      icon: Send,
      color: 'text-algora-purple',
      iconBg: 'bg-algora-purple/10',
      borderColor: 'border-algora-purple/20',
    },
    {
      label: t('successRate'),
      value: `${mockStats.successRate}%`,
      icon: TrendingUp,
      color: 'text-algora-green',
      iconBg: 'bg-algora-green/10',
      borderColor: 'border-algora-green/20',
    },
    {
      label: t('currentStreak'),
      value: `${mockStats.currentStreak} ${t('days')}`,
      icon: Flame,
      color: 'text-algora-red',
      iconBg: 'bg-algora-red/10',
      borderColor: 'border-algora-red/20',
    },
  ];

  // Activity calendar grid - 12 weeks x 7 days
  const weeks = 12;
  const dayLabels = [t('mon'), '', t('wed'), '', t('fri'), '', t('sun')];
  const activityCells: { week: number; day: number; count: number }[] = [];
  for (let week = 0; week < weeks; week++) {
    for (let day = 0; day < 7; day++) {
      const idx = week * 7 + day;
      activityCells.push({ week, day, count: activityData[idx] || 0 });
    }
  }

  const getActivityColor = (count: number) => {
    if (count === 0) return 'bg-[rgba(255,255,255,0.04)]';
    if (count === 1) return 'bg-algora-green/20';
    if (count === 2) return 'bg-algora-green/40';
    if (count === 3) return 'bg-algora-green/60';
    return 'bg-algora-green/80';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D12]">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Profile Header */}
          <div className="bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6 md:p-8 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border-2 border-algora-gold/30 shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                <AvatarFallback className="bg-algora-gold/20 text-algora-gold text-2xl font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-algora-text-primary">
                    {getUserDisplayName()}
                  </h1>
                </div>
                <p className="text-sm text-algora-text-muted mb-1">
                  {user?.email || 'user@algora.dev'}
                </p>
                <div className="flex items-center gap-2 text-sm text-algora-text-dim">
                  <Calendar className="w-4 h-4" />
                  <span>{t('joinDate')}: {joinDate}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <Separator className="my-5 bg-[rgba(255,255,255,0.06)]" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-algora-text-primary flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-algora-text-dim" />
                  {t('bio')}
                </h2>
                {!isEditingBio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-algora-text-muted hover:text-algora-gold hover:bg-[rgba(255,255,255,0.05)] rounded-lg text-xs"
                    onClick={handleStartEditBio}
                  >
                    <Edit3 className="w-3.5 h-3.5 me-1.5" />
                    {t('editBio')}
                  </Button>
                )}
              </div>

              {isEditingBio ? (
                <div className="space-y-3">
                  <textarea
                    value={bioDraft}
                    onChange={(e) => setBioDraft(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] focus:border-algora-gold focus:ring-algora-gold/20 focus:outline-none text-algora-text-primary text-sm rounded-lg p-3 resize-none transition-colors"
                    rows={3}
                    placeholder={t('noBio')}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 rounded-lg text-xs"
                      onClick={handleSaveBio}
                    >
                      <Check className="w-3.5 h-3.5 me-1.5" />
                      {t('saveBio')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border-[rgba(255,255,255,0.1)] text-algora-text-muted hover:text-algora-text-primary rounded-lg text-xs"
                      onClick={handleCancelBio}
                    >
                      <X className="w-3.5 h-3.5 me-1.5" />
                      {t('cancelBio')}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-algora-text-muted leading-relaxed">
                  {savedBio || t('noBio')}
                </p>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
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
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Activity Calendar */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-algora-text-primary">
                    {t('activityCalendar')}
                  </h2>
                  <p className="text-sm text-algora-text-dim mt-0.5">
                    {t('activityCalendarDesc')}
                  </p>
                </div>

                {/* Calendar Grid */}
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    <div className="flex gap-1">
                      {/* Day labels column */}
                      <div className="flex flex-col gap-1 me-1">
                        {dayLabels.map((label, i) => (
                          <div key={i} className="h-3 w-6 flex items-center">
                            {label && <span className="text-[9px] text-algora-text-dim">{label}</span>}
                          </div>
                        ))}
                      </div>
                      {/* Activity cells */}
                      {Array.from({ length: weeks }).map((_, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1">
                          {Array.from({ length: 7 }).map((_, dayIdx) => {
                            const cell = activityCells.find(c => c.week === weekIdx && c.day === dayIdx);
                            const count = cell?.count || 0;
                            return (
                              <div
                                key={dayIdx}
                                className={`w-3 h-3 rounded-sm ${getActivityColor(count)} transition-colors`}
                                title={`${count} ${count === 1 ? 'submission' : 'submissions'}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-4 text-[10px] text-algora-text-dim">
                  <span>{t('lessActivity')}</span>
                  <div className="w-3 h-3 rounded-sm bg-[rgba(255,255,255,0.04)]" />
                  <div className="w-3 h-3 rounded-sm bg-algora-green/20" />
                  <div className="w-3 h-3 rounded-sm bg-algora-green/40" />
                  <div className="w-3 h-3 rounded-sm bg-algora-green/60" />
                  <div className="w-3 h-3 rounded-sm bg-algora-green/80" />
                  <span>{t('moreActivity')}</span>
                </div>
              </section>
            </div>

            {/* Skill Tags */}
            <div className="space-y-6">
              <section className="bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-algora-text-primary flex items-center gap-2">
                    <Tag className="w-5 h-5 text-algora-purple" />
                    {t('skillTags')}
                  </h2>
                  <p className="text-sm text-algora-text-dim mt-0.5">
                    {t('skillTagsDesc')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mockSkillTags.map((tag) => (
                    <Badge
                      key={tag}
                      className="px-3 py-1.5 rounded-lg bg-algora-purple/10 text-algora-purple border border-algora-purple/20 text-xs font-medium hover:bg-algora-purple/20 transition-colors cursor-default"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
