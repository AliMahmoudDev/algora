'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Github, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const t = useTranslations('Auth.signUp');
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = t('errors.nameRequired');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('errors.invalidEmail');
    }
    if (!password) {
      newErrors.password = t('errors.passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('errors.passwordMinLength');
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordMismatch');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setErrors({ general: 'Authentication service is not configured.' });
      setIsLoading(false);
      return;
    }

    try {
      // Create user via Supabase REST API
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            full_name: name.trim(),
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg =
          errorData?.msg || errorData?.error_msg || errorData?.message || "Sign up failed. Please try again.";
        // Check for common error messages
        if (errorMsg.includes("already registered") || errorMsg.includes("already been registered")) {
          setErrors({ email: "An account with this email already exists." });
        } else {
          setErrors({ general: errorMsg });
        }
        setIsLoading(false);
        return;
      }

      // Auto sign in with credentials after successful sign-up
      const signInResult = await signIn("credentials", {
        email,
        password,
        callbackUrl: `/${locale}/problems`,
        redirect: false,
      });

      if (signInResult?.error) {
        // User was created but auto sign-in failed, redirect to sign in
        router.push(`/${locale}/auth/signin`);
      } else {
        router.push(`/${locale}/problems`);
        router.refresh();
      }
    } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setOauthLoading(provider);
    try {
      await signIn(provider, {
        callbackUrl: `/${locale}/problems`,
        redirect: true,
      });
    } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D12] px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-algora-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-algora-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2.5 group">
            <Image
              src="/algora_logo.png"
              alt="Algora"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold tracking-tight text-algora-text-primary">
              Algora
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-algora-text-primary mb-2">
              {t('title')}
            </h1>
            <p className="text-sm text-algora-text-muted">
              {t('subtitle')}
            </p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-3 rounded-lg bg-algora-red/10 border border-algora-red/20 text-algora-red text-sm text-center">
              {errors.general}
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.2)] text-algora-text-primary rounded-lg h-11"
              onClick={() => handleOAuth('github')}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === 'github' ? (
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
              ) : (
                <Github className="w-4 h-4 me-2" />
              )}
              {t('github')}
            </Button>
            <Button
              variant="outline"
              className="w-full border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.2)] text-algora-text-primary rounded-lg h-11"
              onClick={() => handleOAuth('google')}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
              ) : (
                <svg className="w-4 h-4 me-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {t('google')}
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-[rgba(255,255,255,0.08)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-algora-card-bg px-3 text-algora-text-dim">
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-algora-text-muted text-sm">
                {t('name')}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary placeholder:text-algora-text-dim h-11 rounded-lg focus:border-algora-gold focus:ring-algora-gold/20"
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-xs text-algora-red">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-algora-text-muted text-sm">
                {t('email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary placeholder:text-algora-text-dim h-11 rounded-lg focus:border-algora-gold focus:ring-algora-gold/20"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-algora-red">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-algora-text-muted text-sm">
                {t('password')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary placeholder:text-algora-text-dim h-11 rounded-lg focus:border-algora-gold focus:ring-algora-gold/20 pe-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-algora-text-dim hover:text-algora-text-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-algora-red">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-algora-text-muted text-sm">
                {t('confirmPassword')}
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary placeholder:text-algora-text-dim h-11 rounded-lg focus:border-algora-gold focus:ring-algora-gold/20"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-algora-red">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 font-semibold gold-glow rounded-lg h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  Creating...
                </>
              ) : (
                t('submit')
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-algora-text-muted">
            {t('hasAccount')}{' '}
            <Link
              href={`/${locale}/auth/signin`}
              className="text-algora-gold hover:text-algora-gold/80 font-medium transition-colors"
            >
              {t('signInLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
