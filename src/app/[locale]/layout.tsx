import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/providers/session-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Navbar' });

  const title = locale === 'ar'
    ? 'ألغورا — أتقن الخوارزميات وهياكل البيانات'
    : 'Algora — Master Algorithms & Data Structures';

  const description = locale === 'ar'
    ? 'تدرّب على الخوارزميات مع تنفيذ الأكواد في الوقت الحقيقي بلغة بايثون وجافاسكريبت وسي بلس بلس وجافا. منصة ثنائية اللغة بالعربية والإنجليزية.'
    : 'Practice algorithms with real-time code execution in Python, JavaScript, C++, and Java. Bilingual platform in Arabic and English.';

  return {
    title,
    description,
    keywords: [
      'Algora',
      'algorithms',
      'data structures',
      'competitive programming',
      'problem solving',
      'bilingual',
      'Arabic',
      'English',
      'AI',
      'code editor',
      'Python',
      'JavaScript',
      'C++',
      'Java',
      'LeetCode alternative',
    ],
    authors: [{ name: 'Algora Team', url: 'https://github.com/AliMahmoudDev/algora' }],
    icons: {
      icon: [
        { url: '/icon.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-icon.png',
    },
    metadataBase: new URL('https://algora.dev'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        ar: '/ar',
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://algora.dev/${locale}`,
      siteName: 'Algora',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
      creator: '@algora_dev',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'ar')) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
