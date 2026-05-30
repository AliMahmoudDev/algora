'use client';

import { BookOpen, Languages, Bot, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function StatsSection() {
  const t = useTranslations('StatsSection');

  const stats = [
    {
      value: '50+',
      labelKey: 'andGrowing',
      descriptionKey: 'algorithmicProblems',
      icon: BookOpen,
      color: 'text-algora-gold',
    },
    {
      value: '2',
      labelKey: 'arabicEnglish',
      descriptionKey: 'languagesSupported',
      icon: Languages,
      color: 'text-algora-green',
    },
    {
      value: 'AI',
      labelKey: 'poweredAssistant',
      descriptionKey: 'smartExplanations',
      icon: Bot,
      color: 'text-algora-purple',
    },
    {
      value: '24/7',
      labelKey: 'alwaysAvailable',
      descriptionKey: 'learnAnytime',
      icon: Clock,
      color: 'text-algora-red',
    },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D12] via-[#161622] to-[#0D0D12]" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-algora-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-algora-purple/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.labelKey}
              className="text-center opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mx-auto mb-4">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>

              {/* Value */}
              <div className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-2 ${stat.color}`}>
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-algora-text-primary font-medium text-sm md:text-base mb-1">
                {t(stat.labelKey)}
              </div>

              {/* Description */}
              <div className="text-algora-text-dim text-xs md:text-sm">
                {t(stat.descriptionKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
