import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === 'ar'
    ? 'لوحة التحكم | ألغورا'
    : 'Dashboard | Algora';

  const description = locale === 'ar'
    ? 'تتبع تقدمك في حل المسائل وعرض إحصائياتك ونشاطك الأخير على ألغورا.'
    : 'Track your problem-solving progress, view your statistics and recent activity on Algora.';

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
