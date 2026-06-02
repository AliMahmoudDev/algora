'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

const footerSections = [
  {
    titleKey: 'platform',
    links: [
      { labelKey: 'problems', href: '/problems' },
      { labelKey: 'features', href: '#features' },
      { labelKey: 'pricing', href: '#' }, // Page doesn't exist yet
    ],
  },
  {
    titleKey: 'resources',
    links: [
      { labelKey: 'documentation', href: '#' }, // Page doesn't exist yet
      { labelKey: 'blog', href: '#' }, // Page doesn't exist yet
      { labelKey: 'community', href: '#' }, // Page doesn't exist yet
    ],
  },
  {
    titleKey: 'company',
    links: [
      { labelKey: 'about', href: '#how-it-works' },
      { labelKey: 'contact', href: '#' }, // Page doesn't exist yet
      { labelKey: 'privacy', href: '/privacy' },
    ],
  },
];

export default function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();

  return (
    <footer className="relative border-t border-[rgba(255,255,255,0.08)]">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0D0D12]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2.5 mb-4">
              <Image
                src="/algora_logo.png"
                alt="Algora"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-algora-text-primary">
                Algora
              </span>
            </Link>
            <p className="text-algora-text-dim text-sm leading-relaxed max-w-xs">
              {t('description')}
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.titleKey}>
              <h4 className="text-sm font-semibold text-algora-text-primary mb-4">
                {t(section.titleKey)}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.labelKey}>
                    {link.href.startsWith('/') ? (
                      <Link
                        href={`/${locale}${link.href}`}
                        className="text-sm text-algora-text-dim hover:text-algora-gold transition-colors"
                      >
                        {t(link.labelKey)}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-algora-text-dim hover:text-algora-gold transition-colors"
                      >
                        {t(link.labelKey)}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-algora-text-dim text-sm">
            {t('copyright')}
          </p>
          <div className="flex items-center gap-1.5 text-algora-text-dim text-sm">
            {t('builtWith')}
            <span className="text-algora-red mx-0.5">♥</span>
            {locale === 'ar' ? 'لمجتمع الخوارزميات' : 'for the algorithmic community'}
          </div>
        </div>
      </div>
    </footer>
  );
}
