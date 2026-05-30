'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { type Locale } from '@/i18n/routing';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface SampleProblem {
  id: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  difficulty: Difficulty;
  tags: string[];
  acceptance: number;
}

const difficultyConfig = {
  Easy: {
    color: 'bg-algora-green/15 text-algora-green border-algora-green/30',
    dot: 'bg-algora-green',
  },
  Medium: {
    color: 'bg-algora-gold/15 text-algora-gold border-algora-gold/30',
    dot: 'bg-algora-gold',
  },
  Hard: {
    color: 'bg-algora-red/15 text-algora-red border-algora-red/30',
    dot: 'bg-algora-red',
  },
};

const problems: SampleProblem[] = [
  {
    id: 1,
    title: 'Two Sum',
    titleAr: 'مجموع اثنين',
    description: 'Given an array of integers, return indices of two numbers that add up to a target.',
    descriptionAr: 'باستخدام مصفوفة من الأعداد الصحيحة، أعد فهري العددين اللذين مجموعهما يساوي القيمة المستهدفة.',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Map'],
    acceptance: 78.5,
  },
  {
    id: 2,
    title: 'Longest Palindromic Substring',
    titleAr: 'أطول سلسلة فرعية متطابقة',
    description: 'Find the longest palindromic substring in a given string.',
    descriptionAr: 'ابحث عن أطول سلسلة فرعية متطابقة في سلسلة معينة.',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    acceptance: 52.3,
  },
  {
    id: 3,
    title: 'Merge K Sorted Lists',
    titleAr: 'دمج قوائم مرتبة',
    description: 'Merge k sorted linked lists into one sorted linked list.',
    descriptionAr: 'ادمج قوائم مرتبة مرتبة في قائمة مرتبة واحدة.',
    difficulty: 'Hard',
    tags: ['Linked List', 'Heap', 'Divide & Conquer'],
    acceptance: 34.7,
  },
  {
    id: 4,
    title: 'Binary Search',
    titleAr: 'البحث الثنائي',
    description: 'Implement binary search on a sorted array to find a target value.',
    descriptionAr: 'نفذ البحث الثنائي على مصفوفة مرتبة للعثور على قيمة مستهدفة.',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    acceptance: 85.2,
  },
];

export default function ProblemsSection() {
  const t = useTranslations('ProblemsSection');
  const locale = useLocale() as Locale;

  return (
    <section id="problems" className="relative py-24 md:py-32">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[#0D0D12]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="inline-block text-sm font-medium text-algora-gold tracking-wider uppercase mb-4">
            {t('badge')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t('title')}{' '}
            <span className="gradient-text-gold">{t('titleHighlight')}</span>
          </h2>
          <p className="text-algora-text-muted text-lg">
            {t('description')}
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {problems.map((problem, index) => {
            const config = difficultyConfig[problem.difficulty];
            return (
              <Link
                key={problem.id}
                href={`/${locale}/problems/${problem.id}`}
                className="block group bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6 card-hover opacity-0 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-algora-text-dim font-mono text-sm">
                      #{problem.id}
                    </span>
                    <h3 className="text-lg font-semibold text-algora-text-primary group-hover:text-algora-gold transition-colors">
                      {locale === 'ar' ? problem.titleAr : problem.title}
                    </h3>
                  </div>
                  <Badge
                    className={`${config.color} text-xs font-medium border`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`}
                    />
                    {problem.difficulty}
                  </Badge>
                </div>

                <p className="text-algora-text-muted text-sm mb-4 leading-relaxed">
                  {locale === 'ar' ? problem.descriptionAr : problem.description}
                </p>

                <div className="flex items-center justify-between">
                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-md bg-[rgba(255,255,255,0.05)] text-algora-text-dim border border-[rgba(255,255,255,0.06)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Acceptance */}
                  <div className="flex items-center gap-1.5 text-sm text-algora-text-dim">
                    <CheckCircle2 className="w-3.5 h-3.5 text-algora-green" />
                    <span className="font-medium text-algora-text-muted">
                      {problem.acceptance}%
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all link */}
        <div className="text-center mt-12">
          <Link href={`/${locale}/problems`} className="inline-flex items-center gap-2 text-algora-gold hover:text-algora-gold/80 font-medium transition-colors group">
            {t('viewAll')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
