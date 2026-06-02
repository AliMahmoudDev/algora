'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe, LogOut, LayoutDashboard, User, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getUserInitials(user: { name?: string | null; email?: string | null }): string {
  if (user?.name) {
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return user?.email?.[0]?.toUpperCase() || '?';
}

function AuthSection({
  locale,
  onSignInLabel,
  onDashboardLabel,
  onProfileLabel,
  onSignOutLabel,
  onSignOut,
  onNavigate,
}: {
  locale: string;
  onSignInLabel: string;
  onDashboardLabel: string;
  onProfileLabel: string;
  onSignOutLabel: string;
  onSignOut: () => void;
  onNavigate: (path: string) => void;
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-algora-card-bg animate-pulse" />
    );
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full ring-2 ring-transparent hover:ring-algora-gold/30 transition-all duration-200">
            <Avatar className="size-8">
              <AvatarImage src={session.user.image ?? ''} alt={session.user.name ?? ''} />
              <AvatarFallback className="bg-algora-gold/20 text-algora-gold text-xs font-semibold">
                {getUserInitials(session.user)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-algora-card-bg border-[rgba(255,255,255,0.08)]"
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-algora-text-primary">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-algora-text-muted truncate">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.08)]" />
          <DropdownMenuItem
            onClick={() => onNavigate(`/${locale}/dashboard`)}
            className="text-algora-text-muted hover:text-algora-text-primary hover:bg-[rgba(255,255,255,0.05)] cursor-pointer focus:bg-[rgba(255,255,255,0.05)]"
          >
            <LayoutDashboard className="w-4 h-4 me-2" />
            {onDashboardLabel}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onNavigate(`/${locale}/profile`)}
            className="text-algora-text-muted hover:text-algora-text-primary hover:bg-[rgba(255,255,255,0.05)] cursor-pointer focus:bg-[rgba(255,255,255,0.05)]"
          >
            <User className="w-4 h-4 me-2" />
            {onProfileLabel}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onNavigate(`/${locale}/leaderboard`)}
            className="text-algora-text-muted hover:text-algora-text-primary hover:bg-[rgba(255,255,255,0.05)] cursor-pointer focus:bg-[rgba(255,255,255,0.05)]"
          >
            <Trophy className="w-4 h-4 me-2" />
            Leaderboard
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.08)]" />
          <DropdownMenuItem
            onClick={onSignOut}
            variant="destructive"
            className="text-algora-red hover:text-algora-red hover:bg-algora-red/10 cursor-pointer focus:bg-algora-red/10"
          >
            <LogOut className="w-4 h-4 me-2" />
            {onSignOutLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      className="bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 font-semibold gold-glow rounded-lg"
      size="sm"
      asChild
    >
      <a href={`/${locale}/auth/signin`}>
        {onSignInLabel}
      </a>
    </Button>
  );
}

function MobileAuthSection() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
        <div className="w-8 h-8 rounded-full bg-algora-card-bg animate-pulse" />
        <div className="h-4 w-24 rounded bg-algora-card-bg animate-pulse" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
        <Avatar className="size-8">
          <AvatarImage src={session.user.image ?? ''} alt={session.user.name ?? ''} />
          <AvatarFallback className="bg-algora-gold/20 text-algora-gold text-xs font-semibold">
            {getUserInitials(session.user)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-algora-text-primary truncate">
            {session.user.name || 'User'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const locale = useLocale() as Locale;
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    router.push(segments.join('/'));
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${locale}` });
  };

  const navLinks = [
    { label: t('home'), href: `/${locale}` },
    { label: t('problems'), href: `/${locale}/problems` },
    { label: t('features'), href: `/${locale}/#features` },
    { label: t('about'), href: `/${locale}/#how-it-works` },
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
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
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
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-algora-text-muted hover:text-algora-gold transition-colors duration-200"
              >
                {link.label}
              </Link>
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
            <AuthSection
              locale={locale}
              onSignInLabel={t('signIn')}
              onDashboardLabel={t('dashboard')}
              onProfileLabel={t('profile')}
              onSignOutLabel={t('signOut')}
              onSignOut={handleSignOut}
              onNavigate={(path) => router.push(path)}
            />
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
              <Link
                key={link.label}
                href={link.href}
                className="block text-sm text-algora-text-muted hover:text-algora-gold transition-colors py-2"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  switchLocale();
                  setIsMobileOpen(false);
                }}
                className="flex-1 text-algora-text-muted hover:text-algora-gold hover:bg-algora-card-bg rounded-lg"
              >
                <Globe className="w-4 h-4 me-2" />
                {locale === 'en' ? 'العربية' : 'English'}
              </Button>
            </div>
            <MobileAuthSection />
            {!session?.user && (
              <Button
                className="w-full bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 font-semibold rounded-lg"
                size="sm"
                asChild
              >
                <Link href={`/${locale}/auth/signin`} onClick={() => setIsMobileOpen(false)}>
                  {t('signIn')}
                </Link>
              </Button>
            )}
            {session?.user && (
              <>
                <Button
                  variant="ghost"
                  className="w-full text-algora-text-muted hover:text-algora-gold hover:bg-[rgba(255,255,255,0.05)] rounded-lg"
                  size="sm"
                  onClick={() => {
                    router.push(`/${locale}/dashboard`);
                    setIsMobileOpen(false);
                  }}
                >
                  <LayoutDashboard className="w-4 h-4 me-2" />
                  {t('dashboard')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-algora-text-muted hover:text-algora-gold hover:bg-[rgba(255,255,255,0.05)] rounded-lg"
                  size="sm"
                  onClick={() => {
                    router.push(`/${locale}/profile`);
                    setIsMobileOpen(false);
                  }}
                >
                  <User className="w-4 h-4 me-2" />
                  {t('profile')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-algora-text-muted hover:text-algora-gold hover:bg-[rgba(255,255,255,0.05)] rounded-lg"
                  size="sm"
                  onClick={() => {
                    router.push(`/${locale}/leaderboard`);
                    setIsMobileOpen(false);
                  }}
                >
                  <Trophy className="w-4 h-4 me-2" />
                  Leaderboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-algora-red hover:text-algora-red hover:bg-algora-red/10 rounded-lg"
                  size="sm"
                  onClick={() => {
                    handleSignOut();
                    setIsMobileOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 me-2" />
                  {t('signOut')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
