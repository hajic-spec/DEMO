import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export const SiteHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { href: '#philosophie', label: 'Approche' },
    { href: '#expertises', label: 'Expertises' },
    { href: '#territoire', label: 'Oliviers & OLD' },
    { href: '#galerie', label: 'Galerie' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#E5DEC9] py-3'
          : 'bg-[#091B12]/70 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-10 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#top"
          className={`font-serif text-xl md:text-2xl font-bold tracking-[0.06em] whitespace-nowrap shrink-0 transition-colors ${
            scrolled ? 'text-[#0E281B]' : 'text-white'
          }`}
        >
          RELIEF <span className={scrolled ? 'text-[#9C7228]' : 'text-[#CFA75B]'}>PAYSAGE</span>
        </a>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Navigation principale">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium whitespace-nowrap shrink-0 border-b border-transparent hover:border-[#CFA75B] py-1 transition-colors ${
                scrolled
                  ? 'text-[#1A211D] hover:text-[#9C7228]'
                  : 'text-white/90 hover:text-[#EBD9B3]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action button (plus mobile menu trigger on small viewports) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded bg-[#B5893A] text-white hover:bg-[#9C7228] transition-colors whitespace-nowrap shrink-0"
          >
            Demander une étude
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            className={`md:hidden inline-flex items-center justify-center w-11 h-11 rounded border ${
              scrolled
                ? 'border-[#E5DEC9] text-[#0E281B]'
                : 'border-white/30 text-white'
            }`}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Navigation mobile"
          className={`md:hidden px-5 pb-5 pt-3 border-t ${
            scrolled
              ? 'bg-[#FAF8F3] border-[#E5DEC9] text-[#0E281B]'
              : 'bg-[#091B12] border-white/15 text-white'
          }`}
        >
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="py-2 text-base font-medium border-b border-current/10"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded bg-[#B5893A] text-white"
            >
              Demander une étude
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
