'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { type Locale } from '@/i18n/routing';

export default function NotFound() {
  const t = useTranslations('NotFound');
  const locale = useLocale() as Locale;

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D12]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/algora_logo.png"
              alt="Algora"
              width={64}
              height={64}
              className="rounded-xl"
            />
          </div>

          {/* 404 Number */}
          <div className="text-8xl md:text-9xl font-bold text-algora-gold/20 mb-4 select-none">
            404
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-algora-text-primary mb-4">
            {t('title')}
          </h1>

          {/* Description */}
          <p className="text-algora-text-muted text-base md:text-lg mb-10 max-w-md mx-auto">
            {t('description')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 font-semibold text-base px-8 gold-glow rounded-lg group"
              asChild
            >
              <Link href={`/${locale}`}>
                <Home className="w-4 h-4 me-2" />
                {t('backHome')}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[rgba(255,255,255,0.15)] text-algora-text-primary hover:bg-algora-card-bg hover:border-algora-gold/30 font-semibold text-base px-8 rounded-lg group"
              asChild
            >
              <Link href={`/${locale}/problems`}>
                <BookOpen className="w-4 h-4 me-2" />
                {t('viewProblems')}
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
