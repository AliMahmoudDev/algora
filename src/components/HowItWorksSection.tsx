'use client';

import { BookOpen, Code, MessageSquare } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: BookOpen,
    title: 'Choose a Problem',
    description:
      'Browse our curated library of algorithmic challenges. Filter by difficulty, topic, or language preference.',
    color: 'text-algora-gold',
    borderColor: 'border-algora-gold/20',
    bgFrom: 'from-algora-gold/5',
  },
  {
    step: 2,
    icon: Code,
    title: 'Write Your Solution',
    description:
      'Use our integrated code editor to write your solution in your preferred programming language. Run tests instantly.',
    color: 'text-algora-purple',
    borderColor: 'border-algora-purple/20',
    bgFrom: 'from-algora-purple/5',
  },
  {
    step: 3,
    icon: MessageSquare,
    title: 'Get AI Feedback',
    description:
      'Receive detailed, personalized feedback from our AI assistant. Get hints, explanations, and optimization suggestions.',
    color: 'text-algora-green',
    borderColor: 'border-algora-green/20',
    bgFrom: 'from-algora-green/5',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0D0D12]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="inline-block text-sm font-medium text-algora-gold tracking-wider uppercase mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Start Learning in{' '}
            <span className="gradient-text-gold">3 Steps</span>
          </h2>
          <p className="text-algora-text-muted text-lg">
            Our streamlined process gets you from problem selection to solution mastery as quickly as possible.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-20 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-algora-gold/20 via-algora-purple/20 to-algora-green/20" />

          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'forwards' }}
            >
              {/* Step number + icon */}
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.bgFrom} to-transparent border ${step.borderColor} flex items-center justify-center mb-4 relative z-10`}
                >
                  <step.icon className={`w-7 h-7 ${step.color}`} />
                </div>
                <span
                  className={`absolute top-0 right-1/2 translate-x-6 -translate-y-1 text-xs font-bold ${step.color} w-6 h-6 rounded-full bg-[#0D0D12] border ${step.borderColor} flex items-center justify-center`}
                >
                  {step.step}
                </span>
              </div>

              {/* Content card */}
              <div className="bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6 text-center">
                <h3 className="text-lg font-semibold text-algora-text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-algora-text-muted text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
