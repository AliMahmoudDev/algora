'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
  Code,
} from 'lucide-react';
import type { Locale } from '@/i18n/routing';

// Types for API response
interface ProfileData {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    createdAt: string;
  } | null;
  stats: {
    problemsSolved: number;
    totalSubmissions: number;
    successRate: number;
    currentStreak: number;
  };
  activityData: number[];
  skillTags: string[];
  bio: string;
}

const emptyProfile: ProfileData = {
  user: null,
  stats: { problemsSolved: 0, totalSubmissions: 0, successRate: 0, currentStreak: 0 },
  activityData: Array(84).fill(0),
  skillTags: [],
  bio: '',
};

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const locale = useLocale() as Locale;
  const { data: session, status: authStatus } = useSession();

  const [profileData, setProfileData] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState('');
  const [savedBio, setSavedBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [bioSaving, setBioSaving] = useState(false);

  const fetchProfileData = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
      if (res.ok) {
        const data: ProfileData = await res.json();
        setProfileData(data);
        setBio(data.bio || '');
        setSavedBio(data.bio || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (session?.user?.id) {
      setLoading(true);
      fetchProfileData(session.user.id);
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, authStatus, fetchProfileData]);

  const handleSaveBio = async () => {
    if (!session?.user?.id) return;
    const trimmed = bioDraft.trim();
    setBioSaving(true);
    try {
      const res = await fetch(`/api/profile?userId=${session.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        setBio(data.bio || '');
        setSavedBio(data.bio || '');
        setIsEditingBio(false);
      }
    } catch (error) {
      console.error('Failed to save bio:', error);
    } finally {
      setBioSaving(false);
    }
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
    if (!session?.user) return 'Algora User';
    return session.user.name || session.user.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const joinDate = profileData.user?.createdAt
    ? new Date(profileData.user.createdAt).toLocaleDateString(
        locale === 'ar' ? 'ar-SA' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : new Date().toLocaleDateString(
        locale === 'ar' ? 'ar-SA' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      );

  const statCards = [
    {
      label: t('problemsSolved'),
      value: profileData.stats.problemsSolved,
      icon: Trophy,
      color: 'text-algora-gold',
      iconBg: 'bg-algora-gold/10',
      borderColor: 'border-algora-gold/20',
    },
    {
      label: t('totalSubmissions'),
      value: profileData.stats.totalSubmissions,
      icon: Send,
      color: 'text-algora-purple',
      iconBg: 'bg-algora-purple/10',
      borderColor: 'border-algora-purple/20',
    },
    {
      label: t('successRate'),
      value: `${profileData.stats.successRate}%`,
      icon: TrendingUp,
      color: 'text-algora-green',
      iconBg: 'bg-algora-green/10',
      borderColor: 'border-algora-green/20',
    },
    {
      label: t('currentStreak'),
      value: `${profileData.stats.currentStreak} ${t('days')}`,
      icon: Flame,
      color: 'text-algora-red',
      iconBg: 'bg-algora-red/10',
      borderColor: 'border-algora-red/20',
    },
  ];

  // Activity calendar grid - 12 weeks x 7 days
  const weeks = 12;
  const dayLabels = [t('mon'), '', t('wed'), '', t('fri'), '', t('sun')];
  const activityData = profileData.activityData;

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
              {loading ? (
                <Skeleton className="h-24 w-24 md:h-28 md:w-28 rounded-full shrink-0" />
              ) : (
                <Avatar className="h-24 w-24 md:h-28 md:w-28 border-2 border-algora-gold/30 shrink-0">
                  <AvatarImage src={session?.user?.image} alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-algora-gold/20 text-algora-gold text-2xl font-bold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-algora-text-primary">
                        {getUserDisplayName()}
                      </h1>
                    </div>
                    <p className="text-sm text-algora-text-muted mb-1">
                      {session?.user?.email || 'user@algora.dev'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-algora-text-dim">
                      <Calendar className="w-4 h-4" />
                      <span>{t('joinDate')}: {joinDate}</span>
                    </div>
                  </>
                )}
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
                {!isEditingBio && !loading && (
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

              {loading ? (
                <Skeleton className="h-16 w-full rounded-lg" />
              ) : isEditingBio ? (
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
                      disabled={bioSaving}
                    >
                      <Check className="w-3.5 h-3.5 me-1.5" />
                      {bioSaving ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t('saveBio')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border-[rgba(255,255,255,0.1)] text-algora-text-muted hover:text-algora-text-primary rounded-lg text-xs"
                      onClick={handleCancelBio}
                      disabled={bioSaving}
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
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
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
                  </>
                )}
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
                            const idx = weekIdx * 7 + dayIdx;
                            const count = activityData[idx] || 0;
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

                {loading ? (
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-20 rounded-lg" />
                    ))}
                  </div>
                ) : profileData.skillTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skillTags.map((tag) => (
                      <Badge
                        key={tag}
                        className="px-3 py-1.5 rounded-lg bg-algora-purple/10 text-algora-purple border border-algora-purple/20 text-xs font-medium hover:bg-algora-purple/20 transition-colors cursor-default"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Code className="w-10 h-10 text-algora-text-dim/30 mx-auto mb-2" />
                    <p className="text-sm text-algora-text-dim">
                      {locale === 'ar'
                        ? 'لم تحل أي مسائل بعد. ابدأ الآن!'
                        : 'No skills yet. Start solving problems!'}
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
