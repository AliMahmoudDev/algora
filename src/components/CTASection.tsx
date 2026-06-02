'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function CTASection() {
  const locale = useLocale();
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D12] via-[#161622] to-[#0D0D12]" />

      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-algora-gold/5 rounded-full blur-3xl" />

      {/* Top gradient border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-algora-gold/20 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-algora-gold/10 border border-algora-gold/20 mb-8 animate-glow-pulse">
          <Sparkles className="w-8 h-8 text-algora-gold" />
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          Ready to Start Your{' '}
          <span className="gradient-text-gold">Journey</span>?
        </h2>

        {/* Description */}
        <p className="text-algora-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Join hundreds of learners mastering algorithms with AI-powered guidance.
          Available in Arabic and English, 24/7.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 font-semibold text-base px-8 gold-glow rounded-lg group"
            asChild
          >
            <Link href={`/${locale}/auth/signin`}>
              Get Started — It&apos;s Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Small trust note */}
        <p className="text-algora-text-dim text-sm mt-6">
          No credit card required · Free forever · Start solving in seconds
        </p>
      </div>
    </section>
  );
}
