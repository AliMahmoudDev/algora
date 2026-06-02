import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === 'ar'
    ? 'الحلول المقدمة | ألغورا'
    : 'Submissions | Algora';

  const description = locale === 'ar'
    ? 'عرض جميع الحلول المقدمة لمسائل ألغورا.'
    : 'View all your problem submissions on Algora.';

  return {
    title,
    description,
  };
}

export default function SubmissionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
