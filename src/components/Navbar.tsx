'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const locale = useLocale() as Locale;
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    // Replace the current locale segment in the path
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    router.push(segments.join('/'));
  };

  const navLinks = [
    { label: t('home'), href: `#${locale}` },
    { label: t('problems'), href: '#problems' },
    { label: t('features'), href: '#features' },
    { label: t('about'), href: '#how-it-works' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0D0D12]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href={`#${locale}`} className="flex items-center gap-2.5 group">
            <Image
              src="/algora_logo.png"
              alt="Algora"
              width={32}
              height={32}
              className="rounded-lg group-hover:brightness-110 transition-all"
            />
            <span className="text-xl font-bold tracking-tight text-algora-text-primary">
              Algora
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-algora-text-muted hover:text-algora-gold transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={switchLocale}
              className="text-algora-text-muted hover:text-algora-gold hover:bg-algora-card-bg rounded-lg px-3"
            >
              <Globe className="w-4 h-4 me-2" />
              {locale === 'en' ? 'العربية' : 'English'}
            </Button>
            <Button
              className="bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 font-semibold gold-glow rounded-lg"
              size="sm"
              asChild
            >
              <a href={`/${locale}/auth/signin`}>
                {t('signIn')}
              </a>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-algora-text-muted hover:text-algora-text-primary transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label={t('mobileMenu')}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-[#161622]/95 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)] animate-fade-in-up">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-algora-text-muted hover:text-algora-gold transition-colors py-2"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
              <Button
                variant="ghost"
                size="sm"
                onClick={switchLocale}
                className="flex-1 text-algora-text-muted hover:text-algora-gold hover:bg-algora-card-bg rounded-lg"
              >
                <Globe className="w-4 h-4 me-2" />
                {locale === 'en' ? 'العربية' : 'English'}
              </Button>
            </div>
            <Button
              className="w-full bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 font-semibold rounded-lg"
              size="sm"
              asChild
            >
              <a href={`/${locale}/auth/signin`}>
                {t('signIn')}
              </a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
