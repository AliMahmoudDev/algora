'use client';

import Image from 'next/image';

interface LoadingSpinnerProps {
  variant?: 'fullpage' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { logo: 32, text: 'text-xs' },
  md: { logo: 48, text: 'text-sm' },
  lg: { logo: 64, text: 'text-base' },
};

export default function LoadingSpinner({ variant = 'fullpage', size = 'md' }: LoadingSpinnerProps) {
  const config = sizeConfig[size];

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center gap-3 py-8">
        <div className="relative">
          <Image
            src="/algora_logo.png"
            alt="Loading"
            width={config.logo}
            height={config.logo}
            className="rounded-lg animate-pulse opacity-70"
          />
          <div className="absolute inset-0 rounded-lg animate-ping bg-algora-gold/20" />
        </div>
        <span className={`text-algora-text-dim ${config.text}`}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0D0D12] z-50">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative">
          <Image
            src="/algora_logo.png"
            alt="Algora"
            width={config.logo}
            height={config.logo}
            className="rounded-xl animate-pulse"
          />
          {/* Gold glow ring */}
          <div className="absolute -inset-2 rounded-2xl border-2 border-algora-gold/30 animate-spin" style={{ animationDuration: '3s' }} />
          {/* Outer pulse */}
          <div className="absolute -inset-4 rounded-2xl bg-algora-gold/5 animate-ping" style={{ animationDuration: '2s' }} />
        </div>

        {/* Spinner dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-algora-gold animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* Loading text */}
        <p className="text-algora-text-dim text-sm tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
}
