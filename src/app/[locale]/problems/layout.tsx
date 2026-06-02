import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === 'ar'
    ? 'مجموعة المسائل | ألغورا'
    : 'Problem Set | Algora';

  const description = locale === 'ar'
    ? 'تصفح مجموعتنا المختارة من المسائل الخوارزمية. تدرّب على البرمجة مع شروحات مفصلة بالعربية والإنجليزية.'
    : 'Browse our curated collection of algorithmic problems. Practice coding with detailed explanations in both Arabic and English.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
