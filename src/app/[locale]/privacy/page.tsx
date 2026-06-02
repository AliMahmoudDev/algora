import { useTranslations, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Privacy' });
  return { title: t('title'), description: t('description') };
}

export default function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  // This is a server component; use `getTranslations` for SSR
  // but we can also just render static content here.
  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D12]">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-3xl font-bold text-algora-text-primary mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-algora-text-muted text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-algora-text-primary mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly when creating an account, such as your email address, name, and GitHub profile information. We also collect usage data such as code submissions, problem attempts, and performance metrics to improve your learning experience.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-algora-text-primary mb-3">2. How We Use Your Information</h2>
            <p>
              Your information is used to provide and improve our algorithmic learning platform, track your progress, personalize your experience, and communicate important updates about the service.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-algora-text-primary mb-3">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. Your code submissions and personal data are encrypted in transit and at rest.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-algora-text-primary mb-3">4. Third-Party Services</h2>
            <p>
              We use third-party services such as GitHub and Google for authentication. These services have their own privacy policies governing the use of your information.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-algora-text-primary mb-3">5. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@algora.dev.
            </p>
          </section>
          <p className="pt-4 text-algora-text-dim text-xs">Last updated: January 2026</p>
        </div>
      </main>
    </div>
  );
}
