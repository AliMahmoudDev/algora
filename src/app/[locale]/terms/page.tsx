import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Terms' });
  return { title: t('title'), description: t('description') };
}

export default function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D12]">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-3xl font-bold text-algora-text-primary mb-8">Terms of Service</h1>
        <div className="space-y-6 text-algora-text-muted text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-algora-text-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Algora, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-algora-text-primary mb-3">2. Use of Service</h2>
            <p>
              Algora provides a bilingual algorithmic learning platform. You agree to use the service for educational purposes only and not to misuse, copy, or redistribute any content without permission.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-algora-text-primary mb-3">3. Intellectual Property</h2>
            <p>
              All content on Algora, including problems, solutions, and explanations, is the property of Algora or its content creators. User-submitted code remains the property of the user.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-algora-text-primary mb-3">4. Limitation of Liability</h2>
            <p>
              Algora is provided &quot;as is&quot; without any warranties. We are not responsible for any damages arising from the use of our platform.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-algora-text-primary mb-3">5. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at legal@algora.dev.
            </p>
          </section>
          <p className="pt-4 text-algora-text-dim text-xs">Last updated: January 2026</p>
        </div>
      </main>
    </div>
  );
}
