'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('Auth.callback');

  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  useEffect(() => {
    if (!isSupabaseConfigured) {
      router.push(`/${locale}/auth/signin`);
      return;
    }

    const supabase = createClient();

    // Exchange code for session
    const hash = window.location.hash;
    const code = searchParams.get('code') || 
      (hash.startsWith('#') ? 
        new URLSearchParams(hash.substring(1)).get('code') : 
        null);

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error('Auth callback error:', error.message);
          router.push(`/${locale}/auth/signin`);
        } else {
          router.push(`/${locale}/problems`);
        }
      });
    } else {
      // Check if we have an access_token from implicit grant flow
      const accessToken = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : '').get('access_token');
      if (accessToken) {
        // Session is already set by Supabase client automatically
        router.push(`/${locale}/problems`);
      } else {
        router.push(`/${locale}/auth/signin`);
      }
    }
  }, [router, searchParams, locale, isSupabaseConfigured]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D12] px-4">
      <div className="text-center">
        {!isSupabaseConfigured ? (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-algora-red mx-auto" />
            <h1 className="text-xl font-semibold text-algora-text-primary">
              {t('error')}
            </h1>
            <p className="text-sm text-algora-text-muted max-w-md">
              Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-algora-gold mx-auto animate-spin" />
            <h1 className="text-xl font-semibold text-algora-text-primary">
              {t('processing')}
            </h1>
            <p className="text-sm text-algora-text-muted">
              {t('redirecting')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
