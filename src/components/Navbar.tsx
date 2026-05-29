'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Code2 } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Problems', href: '#problems' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#how-it-works' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0D0D12]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-algora-gold/10 flex items-center justify-center group-hover:bg-algora-gold/20 transition-colors">
              <Code2 className="w-5 h-5 text-algora-gold" />
            </div>
            <span className="text-xl font-bold tracking-tight text-algora-text-primary">
              Algora
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-algora-text-muted hover:text-algora-gold transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <Button
              className="bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 font-semibold gold-glow rounded-lg"
              size="sm"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-algora-text-muted hover:text-algora-text-primary transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-[#161622]/95 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)] animate-fade-in-up">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-algora-text-muted hover:text-algora-gold transition-colors py-2"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button
              className="w-full bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 font-semibold rounded-lg"
              size="sm"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
