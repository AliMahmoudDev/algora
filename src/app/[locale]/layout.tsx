import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { Toaster } from "@/components/ui/toaster";

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
    ? "ألغورا — أتقن الخوارزميات. اصنع المستقبل."
    : "Algora — Master Algorithms. Code the Future.";

  const description = locale === 'ar'
    ? "منصة تعليمية ثنائية اللغة للخوارزميات وحل المشكلات مع تعلم مدعوم بالذكاء الاصطناعي."
    : "A bilingual (Arabic + English) algorithms & problem-solving education platform with AI-powered learning.";

  return {
    title,
    description,
    keywords: [
      "Algora",
      "algorithms",
      "competitive programming",
      "problem solving",
      "bilingual",
      "Arabic",
      "English",
      "AI",
      "code editor",
    ],
    authors: [{ name: "Algora Team" }],
    icons: {
      icon: "/icon.png",
      apple: "/apple-icon.png",
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
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
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
