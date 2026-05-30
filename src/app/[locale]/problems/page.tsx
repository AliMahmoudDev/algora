'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  CheckCircle2,
  Circle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { mockProblems, difficultyOrder, difficultyConfig, categoryList, type Difficulty, type ProblemStatus } from '@/data/mock-problems';

const ITEMS_PER_PAGE = 6;

const statusConfig: Record<ProblemStatus, { icon: typeof CheckCircle2; color: string; labelKey: string }> = {
  'Not Started': { icon: Circle, color: 'text-algora-text-dim', labelKey: 'notStarted' },
  'Attempted': { icon: Clock, color: 'text-algora-gold', labelKey: 'attempted' },
  'Solved': { icon: CheckCircle2, color: 'text-algora-green', labelKey: 'solved' },
};

type SortOption = 'order' | 'difficulty' | 'acceptance' | 'title';

export default function ProblemsPage() {
  const t = useTranslations('Problems');
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProblems = useMemo(() => {
    let result = [...mockProblems];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.titleAr.includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter((p) => p.difficulty === difficultyFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(
        (p) => p.category === categoryFilter || p.tags.includes(categoryFilter)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'difficulty':
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'acceptance':
          return a.acceptanceRate - b.acceptanceRate;
        case 'title':
          return locale === 'ar'
            ? a.titleAr.localeCompare(b.titleAr, 'ar')
            : a.title.localeCompare(b.title, 'en');
        default:
          return a.orderIndex - b.orderIndex;
      }
    });

    return result;
  }, [search, difficultyFilter, categoryFilter, statusFilter, sortBy, locale]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProblems = filteredProblems.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const hasActiveFilters = difficultyFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setDifficultyFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSearch('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D12]">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20 bg-[#0D0D12]" />

      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.08)] bg-[#0D0D12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-algora-text-primary mb-2">
            {t('pageTitle')}
          </h1>
          <p className="text-algora-text-muted text-sm md:text-base">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b border-[rgba(255,255,255,0.08)] bg-[#0D0D12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-algora-text-dim" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder={t('search')}
                className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary placeholder:text-algora-text-dim h-10 rounded-lg ps-9 focus:border-algora-gold focus:ring-algora-gold/20"
              />
            </div>

            {/* Filter toggle (mobile) */}
            <Button
              variant="outline"
              className="sm:hidden border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-algora-text-primary rounded-lg h-10"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 me-2" />
              {t('filters')}
            </Button>

            {/* Desktop filters row */}
            <div className="hidden sm:flex items-center gap-3">
              <Select value={difficultyFilter} onValueChange={(v) => { setDifficultyFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary rounded-lg h-10 focus:border-algora-gold focus:ring-algora-gold/20">
                  <SelectValue placeholder={t('difficulty')} />
                </SelectTrigger>
                <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)]">
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="Easy">{t('easy')}</SelectItem>
                  <SelectItem value="Medium">{t('medium')}</SelectItem>
                  <SelectItem value="Hard">{t('hard')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-40 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary rounded-lg h-10 focus:border-algora-gold focus:ring-algora-gold/20">
                  <SelectValue placeholder={t('category')} />
                </SelectTrigger>
                <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)] max-h-60 overflow-y-auto">
                  <SelectItem value="all">{t('all')}</SelectItem>
                  {categoryList.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary rounded-lg h-10 focus:border-algora-gold focus:ring-algora-gold/20">
                  <SelectValue placeholder={t('status')} />
                </SelectTrigger>
                <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)]">
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="Not Started">{t('notStarted')}</SelectItem>
                  <SelectItem value="Attempted">{t('attempted')}</SelectItem>
                  <SelectItem value="Solved">{t('solved')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-40 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary rounded-lg h-10 focus:border-algora-gold focus:ring-algora-gold/20">
                  <SelectValue placeholder={t('sort')} />
                </SelectTrigger>
                <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)]">
                  <SelectItem value="order">#</SelectItem>
                  <SelectItem value="difficulty">{t('difficulty')}</SelectItem>
                  <SelectItem value="acceptance">{t('acceptanceRate')}</SelectItem>
                  <SelectItem value="title">{t('titleCol')}</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-algora-text-muted hover:text-algora-gold h-10 px-3 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="sm:hidden grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] animate-fade-in-up">
              <Select value={difficultyFilter} onValueChange={(v) => { setDifficultyFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary rounded-lg h-10">
                  <SelectValue placeholder={t('difficulty')} />
                </SelectTrigger>
                <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)]">
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="Easy">{t('easy')}</SelectItem>
                  <SelectItem value="Medium">{t('medium')}</SelectItem>
                  <SelectItem value="Hard">{t('hard')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary rounded-lg h-10">
                  <SelectValue placeholder={t('category')} />
                </SelectTrigger>
                <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)] max-h-60 overflow-y-auto">
                  <SelectItem value="all">{t('all')}</SelectItem>
                  {categoryList.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary rounded-lg h-10">
                  <SelectValue placeholder={t('status')} />
                </SelectTrigger>
                <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)]">
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="Not Started">{t('notStarted')}</SelectItem>
                  <SelectItem value="Attempted">{t('attempted')}</SelectItem>
                  <SelectItem value="Solved">{t('solved')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary rounded-lg h-10">
                  <SelectValue placeholder={t('sort')} />
                </SelectTrigger>
                <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)]">
                  <SelectItem value="order">#</SelectItem>
                  <SelectItem value="difficulty">{t('difficulty')}</SelectItem>
                  <SelectItem value="acceptance">{t('acceptanceRate')}</SelectItem>
                  <SelectItem value="title">{t('titleCol')}</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="col-span-2 border-[rgba(255,255,255,0.12)] text-algora-text-muted hover:text-algora-gold h-10 rounded-lg"
                  onClick={clearFilters}
                >
                  {t('clearFilters')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Problem list */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-algora-text-dim">
            {t('showing')} {paginatedProblems.length} {t('of')} {filteredProblems.length} {t('problems')}
          </p>
        </div>

        {paginatedProblems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-algora-text-dim text-lg">{t('noResults')}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.08)]">
                    <th className="w-16 px-4 py-3 text-start text-xs font-medium text-algora-text-dim uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-algora-text-dim uppercase tracking-wider">{t('titleCol')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-algora-text-dim uppercase tracking-wider">{t('difficultyLabel')}</th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-algora-text-dim uppercase tracking-wider">{t('categoryLabel')}</th>
                    <th className="w-28 px-4 py-3 text-start text-xs font-medium text-algora-text-dim uppercase tracking-wider">{t('acceptanceLabel')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {paginatedProblems.map((problem) => {
                    const config = difficultyConfig[problem.difficulty];
                    const statusCfg = statusConfig[problem.status];
                    const StatusIcon = statusCfg.icon;

                    return (
                      <tr
                        key={problem.id}
                        className="hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3">
                          <StatusIcon className={`w-5 h-5 ${statusCfg.color}`} />
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/${locale}/problems/${problem.id}`}
                            className="group-hover:text-algora-gold transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-algora-text-dim font-mono text-sm">
                                {problem.orderIndex}.
                              </span>
                              <span className="text-sm font-medium text-algora-text-primary group-hover:text-algora-gold transition-colors">
                                {locale === 'ar' ? problem.titleAr : problem.title}
                              </span>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${config.color} text-xs font-medium border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} me-1.5`} />
                            {t(problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-algora-text-muted">
                            {problem.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-algora-text-muted font-mono">
                            {problem.acceptanceRate}%
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
              {paginatedProblems.map((problem) => {
                const config = difficultyConfig[problem.difficulty];
                const statusCfg = statusConfig[problem.status];
                const StatusIcon = statusCfg.icon;

                return (
                  <Link
                    key={problem.id}
                    href={`/${locale}/problems/${problem.id}`}
                    className="block bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-4 card-hover"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <StatusIcon className={`w-5 h-5 flex-shrink-0 ${statusCfg.color}`} />
                        <div>
                          <span className="text-algora-text-dim font-mono text-xs">
                            {problem.orderIndex}.
                          </span>
                          <h3 className="text-sm font-medium text-algora-text-primary">
                            {locale === 'ar' ? problem.titleAr : problem.title}
                          </h3>
                        </div>
                      </div>
                      <Badge className={`${config.color} text-xs font-medium border flex-shrink-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} me-1.5`} />
                        {t(problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.05)] text-algora-text-dim border border-[rgba(255,255,255,0.06)]">
                          {problem.category}
                        </span>
                      </div>
                      <span className="text-xs text-algora-text-dim font-mono">
                        {problem.acceptanceRate}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-algora-text-primary rounded-lg h-9 w-9 p-0"
                  onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === safePage ? 'default' : 'outline'}
                    size="sm"
                    className={
                      page === safePage
                        ? 'bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 rounded-lg h-9 w-9 p-0 font-medium'
                        : 'border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-algora-text-primary rounded-lg h-9 w-9 p-0'
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-algora-text-primary rounded-lg h-9 w-9 p-0"
                  onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
