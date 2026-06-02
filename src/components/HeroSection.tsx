'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const codeLines = [
  { text: 'function twoSum(nums, target) {', color: 'text-algora-purple' },
  { text: '  const map = new Map();', color: 'text-algora-text-primary' },
  { text: '  for (let i = 0; i < nums.length; i++) {', color: 'text-algora-green' },
  { text: '    const complement = target - nums[i];', color: 'text-algora-text-muted' },
  { text: '    if (map.has(complement)) {', color: 'text-algora-green' },
  { text: '      return [map.get(complement), i];', color: 'text-algora-gold' },
  { text: '    }', color: 'text-algora-green' },
  { text: '    map.set(nums[i], i);', color: 'text-algora-text-muted' },
  { text: '  }', color: 'text-algora-green' },
  { text: '}', color: 'text-algora-purple' },
];

export default function HeroSection() {
  const locale = useLocale();
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-algora-purple/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-algora-gold/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '3s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-algora-green/3 rounded-full blur-3xl"
        />
      </div>

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-algora-card-bg border border-[rgba(255,255,255,0.08)] text-sm text-algora-text-muted animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-algora-green animate-pulse" />
              Now with AI-Powered Assistance
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight animate-fade-in-up delay-100">
              Master Algorithms.
              <br />
              <span className="gradient-text-gold">Code the Future.</span>
            </h1>

            <p className="text-lg md:text-xl text-algora-text-muted max-w-lg mx-auto lg:mx-0 animate-fade-in-up delay-200">
              A bilingual learning platform for algorithms and problem-solving.
              Available in Arabic & English with AI-powered guidance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
              <Button
                size="lg"
                className="bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 font-semibold text-base px-8 gold-glow rounded-lg group"
                asChild
              >
                <Link href={`/${locale}/problems`}>
                  Start Solving
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[rgba(255,255,255,0.15)] text-algora-text-primary hover:bg-algora-card-bg hover:border-algora-gold/30 font-semibold text-base px-8 rounded-lg group"
                asChild
              >
                <Link href={`/${locale}/problems`}>
                  <Play className="w-4 h-4" />
                  View Problems
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 justify-center lg:justify-start pt-4 animate-fade-in-up delay-400">
              <div className="flex items-center gap-2 text-sm text-algora-text-dim">
                <span className="font-semibold text-algora-text-muted">50+</span> Problems
              </div>
              <div className="w-px h-4 bg-[rgba(255,255,255,0.1)]" />
              <div className="flex items-center gap-2 text-sm text-algora-text-dim">
                <span className="font-semibold text-algora-text-muted">2</span> Languages
              </div>
              <div className="w-px h-4 bg-[rgba(255,255,255,0.1)]" />
              <div className="flex items-center gap-2 text-sm text-algora-text-dim">
                <span className="font-semibold text-algora-text-muted">AI</span> Powered
              </div>
            </div>
          </div>

          {/* Right: Code Snippet */}
          <div className="hidden lg:block animate-fade-in-up delay-300">
            <div className="relative">
              {/* Glow behind code */}
              <div className="absolute -inset-4 bg-algora-purple/10 rounded-2xl blur-2xl" />

              <div className="relative bg-[#161622] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-2xl">
                {/* Code editor header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-algora-red/80" />
                    <div className="w-3 h-3 rounded-full bg-algora-gold/80" />
                    <div className="w-3 h-3 rounded-full bg-algora-green/80" />
                  </div>
                  <span className="text-xs text-algora-text-dim font-mono">
                    twoSum.js
                  </span>
                  <div className="w-16" />
                </div>

                {/* Code content */}
                <div className="p-5 font-mono text-sm leading-7">
                  {codeLines.map((line, i) => (
                    <div key={i} className="flex">
                      <span className="w-8 text-right mr-4 text-algora-text-dim/50 select-none">
                        {i + 1}
                      </span>
                      <span className={line.color}>
                        {line.text}
                        {i === codeLines.length - 1 && (
                          <span className="animate-blink-cursor" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Output bar */}
                <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.08)] bg-algora-green/5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-algora-green font-medium">✓</span>
                    <span className="text-algora-text-muted font-mono">
                      Output: [0, 1]
                    </span>
                    <span className="text-algora-text-dim ml-auto font-mono text-xs">
                      Runtime: 0ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D0D12] to-transparent" />
    </section>
  );
}
