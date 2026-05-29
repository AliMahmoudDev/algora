'use client';

import { Brain, Languages, Code2 } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Assistant',
    description:
      'Get step-by-step algorithm explanations from our AI chatbot. Understand complex concepts through interactive dialogue.',
    accent: 'algora-purple',
    iconBg: 'bg-algora-purple/10',
  },
  {
    icon: Languages,
    title: 'Bilingual Learning',
    description:
      'Full Arabic and English support with RTL layout. Learn algorithms in the language you are most comfortable with.',
    accent: 'algora-green',
    iconBg: 'bg-algora-green/10',
  },
  {
    icon: Code2,
    title: 'Real Code Editor',
    description:
      'Write, run, and debug code in a Monaco-style editor. Support for multiple languages with real-time execution.',
    accent: 'algora-gold',
    iconBg: 'bg-algora-gold/10',
  },
];

const accentColors = {
  algora_purple: 'hover:border-algora-purple/30',
  algora_green: 'hover:border-algora-green/30',
  algora_gold: 'hover:border-algora-gold/30',
} as const;

const iconColors = {
  algora_purple: 'text-algora-purple',
  algora_green: 'text-algora-green',
  algora_gold: 'text-algora-gold',
} as const;

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D12] via-[#161622] to-[#0D0D12]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="inline-block text-sm font-medium text-algora-gold tracking-wider uppercase mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="gradient-text-gold">Succeed</span>
          </h2>
          <p className="text-algora-text-muted text-lg">
            Our platform combines cutting-edge AI, bilingual support, and professional
            tools to give you the best algorithmic learning experience.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6 md:p-8 card-hover opacity-0 animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-lg ${feature.iconBg} flex items-center justify-center mb-6`}
              >
                <feature.icon className={`w-6 h-6 ${iconColors[feature.accent as keyof typeof iconColors]}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-algora-text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-algora-text-muted leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle gradient on hover */}
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-br ${
                  feature.accent === 'algora-purple'
                    ? 'from-algora-purple/5 to-transparent'
                    : feature.accent === 'algora-green'
                      ? 'from-algora-green/5 to-transparent'
                      : 'from-algora-gold/5 to-transparent'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
