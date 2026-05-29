import Image from 'next/image';

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { label: 'Problems', href: '#problems' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Community', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#how-it-works' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-[rgba(255,255,255,0.08)]">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0D0D12]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#home" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/algora_logo.png"
                alt="Algora"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-algora-text-primary">
                Algora
              </span>
            </a>
            <p className="text-algora-text-dim text-sm leading-relaxed max-w-xs">
              A bilingual algorithms education platform with AI-powered learning
              assistance.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-algora-text-primary mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-algora-text-dim hover:text-algora-gold transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-algora-text-dim text-sm">
            © 2026 Algora. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-algora-text-dim text-sm">
            Built with
            <span className="text-algora-red mx-0.5">♥</span>
            for the algorithmic community
          </div>
        </div>
      </div>
    </footer>
  );
}
