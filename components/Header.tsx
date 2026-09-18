
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Language } from '../types';
import { useSite } from '../src/config/SiteContext';

interface HeaderProps {
  lang: Language;
  setLang: (l: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ lang, setLang }) => {
  const { siteType } = useSite();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isServicePage = location.pathname.startsWith('/services/');

  // Site-specific navigation
  const navLinks = siteType === 'consulting'
    ? [
        { id: 'consulting-areas', label: { en: 'Consulting', ru: 'Консалтинг' } },
        { id: 'process', label: { en: 'How It Works', ru: 'Как это работает' } },
        { id: 'faq', label: { en: 'FAQ', ru: 'FAQ' } },
        { id: 'contacts', label: { en: 'Contact', ru: 'Контакты' } }
      ]
    : [
        { id: 'registration', label: { en: 'Registration', ru: 'Регистрация' } },
        { id: 'process', label: { en: 'Process', ru: 'Процесс' } },
        { id: 'faq', label: { en: 'FAQ', ru: 'FAQ' } },
        { id: 'contacts', label: { en: 'Contact', ru: 'Контакты' } }
      ];

  // Site-specific CTA
  const ctaText = siteType === 'consulting'
    ? { en: 'Book Consultation', ru: 'Консультация' }
    : { en: 'Start Registration', ru: 'Начать регистрацию' };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Определяем, прокручено ли вниз
      setIsScrolled(currentScrollY > 20);

      // Определяем направление скролла
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Скроллим вниз
        setIsScrollingDown(true);
      } else {
        // Скроллим вверх или в самом верху
        setIsScrollingDown(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 40; // Offset for fixed header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Bar - Contact Info */}
      <div className={`bg-gradient-to-r from-qatar-maroon/70 to-[#6B1F3D]/70 backdrop-blur-md transition-all duration-500 ease-in-out overflow-hidden ${isScrollingDown ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center py-1.5">
            {/* Contact Info - All devices */}
            <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm text-white/70">
              <a href="mailto:ceo@go2market.qa" className="flex items-center gap-1.5 md:gap-2 hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Info@go2market.qa</span>
                <span className="sm:hidden">Info@go2market.qa</span>
              </a>
              <a href="tel:+97450910893" className="flex items-center gap-1.5 md:gap-2 hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="whitespace-nowrap">+974 5091 0893</span>
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 ml-auto">
              <a href="https://www.linkedin.com/company/g2m-international-consulting" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className={`bg-gradient-to-r from-slate-900/75 to-slate-800/75 backdrop-blur-md transition-shadow duration-500 ease-in-out ${isScrolled ? 'shadow-2xl' : 'shadow-lg'}`}>
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            {(isHomePage || isServicePage) ? (
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center space-x-3 group cursor-pointer"
              >
                <img src="/images/logo/logo.webp" alt="G2M International Consulting" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform brightness-0 invert" width="269" height="101" fetchPriority="high" />
              </a>
            ) : (
              <Link
                to="/"
                className="flex items-center space-x-3 group cursor-pointer"
              >
                <img src="/images/logo/logo.webp" alt="G2M International Consulting" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform brightness-0 invert" width="269" height="101" fetchPriority="high" />
              </Link>
            )}

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                isHomePage ? (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => scrollToSection(e, link.id)}
                    className="text-sm font-semibold text-white hover:text-qatar-maroon transition-colors uppercase"
                  >
                    {link.label[lang]}
                  </a>
                ) : (
                  <Link
                    key={link.id}
                    to={`/#${link.id}`}
                    className="text-sm font-semibold text-white hover:text-qatar-maroon transition-colors uppercase"
                  >
                    {link.label[lang]}
                  </Link>
                )
              ))}

              {/* Language Switcher */}
              <div className="flex items-center space-x-2 bg-white/10 p-1 rounded-md">
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${lang === 'en' ? 'bg-qatar-maroon text-white' : 'text-white/70 hover:text-white'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('ru')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${lang === 'ru' ? 'bg-qatar-maroon text-white' : 'text-white/70 hover:text-white'}`}
                >
                  RU
                </button>
              </div>

              {/* CTA Button */}
              {isHomePage ? (
                <a
                  href="#contacts"
                  onClick={(e) => scrollToSection(e, 'contacts')}
                  className="bg-qatar-maroon hover:bg-[#6B1F3D] text-white px-6 py-2.5 rounded-md font-semibold transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  {ctaText[lang]}
                </a>
              ) : (
                <Link
                  to="/#contacts"
                  className="bg-qatar-maroon hover:bg-[#6B1F3D] text-white px-6 py-2.5 rounded-md font-semibold transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  {ctaText[lang]}
                </Link>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className={`lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <span className="block h-0.5 w-6 bg-white rounded-full" />
              <span className="block h-0.5 w-4 bg-white rounded-full" />
              <span className="block h-0.5 w-6 bg-white rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Menu Overlay - outside header to avoid stacking context issues */}
      <div className={`md:hidden fixed inset-0 z-[200] transition-all duration-500 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Panel */}
        <div className={`absolute top-0 right-0 h-full w-4/5 max-w-xs bg-slate-900 flex flex-col transition-transform duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          {/* Close button */}
          <div className="flex items-center justify-between px-8 pt-10 pb-8 border-b border-white/10">
            <img src="/images/logo/logo.webp" alt="G2M" className="h-8 w-auto object-contain brightness-0 invert" width="215" height="81" />
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col px-8 py-8 gap-1 flex-grow">
            {navLinks.map((link, idx) => (
              isHomePage ? (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className="flex items-center justify-between py-4 border-b border-white/5 text-white group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-white/20 w-5">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="text-lg font-extrabold tracking-tight">{link.label[lang]}</span>
                  </div>
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-qatar-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ) : (
                <Link
                  key={link.id}
                  to={`/#${link.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-4 border-b border-white/5 text-white group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-white/20 w-5">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="text-lg font-extrabold tracking-tight">{link.label[lang]}</span>
                  </div>
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-qatar-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-8 pb-10 space-y-4">
            <div className="flex gap-3">
              <button onClick={() => { setLang('en'); }} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${lang === 'en' ? 'bg-qatar-maroon text-white' : 'bg-white/10 text-white/50'}`}>EN</button>
              <button onClick={() => { setLang('ru'); }} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${lang === 'ru' ? 'bg-qatar-maroon text-white' : 'bg-white/10 text-white/50'}`}>RU</button>
            </div>
            <a href="mailto:Info@go2market.qa" className="block text-center text-sm font-semibold text-white/40 hover:text-white transition-colors">
              Info@go2market.qa
            </a>
          </div>

        </div>
      </div>
    </>
  );
};

export default Header;
