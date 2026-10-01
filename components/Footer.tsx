import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Language } from '../types';
import { useSite } from '../src/config/SiteContext';

interface FooterProps {
  lang: Language;
}

const Footer: React.FC<FooterProps> = ({ lang }) => {
  const { siteType } = useSite();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isServicePage = location.pathname.startsWith('/services/');
  const socialLinks = [
    { platform: 'linkedin', url: 'https://www.linkedin.com/company/g2m-international-consulting/', icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
    { platform: 'instagram', url: 'https://www.instagram.com/mullaumm', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { platform: 'facebook', url: 'https://facebook.com/go2market.qa', icon: 'M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z' },
  ];

  const specialisedServices = [
    { slug: 'business-intelligence', title: { en: 'Business Intelligence', ru: 'Бизнес-аналитика' } },
    { slug: 'incorporation', title: { en: 'Company Incorporation', ru: 'Регистрация компании' } },
    { slug: 'business-matchmaking', title: { en: 'Business Matchmaking', ru: 'Бизнес-матчмейкинг' } },
    { slug: 'fundraising', title: { en: 'Fundraising Support', ru: 'Привлечение инвестиций' } },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 40;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 dark:bg-[#070c15] text-white">

      {/* CTA Banner */}
      <div className="border-b border-white/5 dark:border-white/10">
        <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs font-black text-qatar-maroon uppercase tracking-[0.4em] mb-3">
              {lang === 'en' ? 'Ready to start?' : 'Готовы начать?'}
            </p>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {lang === 'en'
                ? <>Let's bring your business<br />to GCC.</>
                : <>Давайте выведем ваш бизнес<br />в Ближнем Востоке.</>}
            </h3>
          </div>
          {(isHomePage || isServicePage) ? (
            <a
              href="#contacts"
              onClick={(e) => scrollToSection(e, 'contacts')}
              className="flex-shrink-0 bg-qatar-maroon hover:bg-[#701530] text-white px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              {lang === 'en' ? 'Get in touch' : 'Связаться с нами'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          ) : (
            <Link
              to="/#contacts"
              className="flex-shrink-0 bg-qatar-maroon hover:bg-[#701530] text-white px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              {lang === 'en' ? 'Get in touch' : 'Связаться с нами'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-12">

          {/* Brand */}
          <div className="md:col-span-2 space-y-6">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <img src="/images/logo/logo.webp" alt="G2M International Consulting" className="h-15 w-auto object-contain brightness-0 invert hover:opacity-80 transition-opacity" width="640" height="241" />
            </a>
            <p className="text-slate-400 leading-relaxed font-medium text-sm max-w-xs">
              {lang === 'en'
                ? 'Boutique consultancy helping businesses from around the world enter and grow in Qatar.'
                : 'Boutique-консалтинг для компаний, выходящих на рынок Катара.'}
            </p>
            <div className="flex gap-3">
              {socialLinks.map(link => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/5 hover:bg-qatar-maroon rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  aria-label={link.platform}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d={link.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-1">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6">
              {lang === 'en' ? 'Company' : 'Компания'}
            </h4>
            <ul className="space-y-3 text-slate-400 font-medium text-sm">
              <li><a href="https://go2market.qa/#about" className="hover:text-white transition-colors">{lang === 'en' ? 'About Us' : 'О нас'}</a></li>
              <li><Link to={siteType === 'consulting' ? '/#consulting-areas' : '/#registration'} className="hover:text-white transition-colors">{lang === 'en' ? 'Our Services' : 'Наши услуги'}</Link></li>
              <li><Link to="/case-studies" className="hover:text-white transition-colors">{lang === 'en' ? 'Case Studies' : 'Кейсы'}</Link></li>
              <li><Link to="/#contacts" className="hover:text-white transition-colors">{lang === 'en' ? 'Contact' : 'Контакты'}</Link></li>
            </ul>
          </div>

          {/* Specialised Services */}
          <div className="md:col-span-1">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6">
              {lang === 'en' ? 'Specialised Services' : 'Специализированные услуги'}
            </h4>
            <ul className="space-y-3 text-slate-400 font-medium text-sm">
              {specialisedServices.map((service) => (
                <li key={service.slug}>
                  <Link to={`/services/${service.slug}`} className="hover:text-white transition-colors">
                    {service.title[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-1">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6">
              {lang === 'en' ? 'Contact' : 'Контакты'}
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="text-slate-400 font-medium leading-snug">
                No. 67, D-Ring Road,<br />Doha, Qatar
              </li>
              <li>
                <a href="tel:+97450910893" className="text-slate-400 hover:text-white transition-colors font-medium">
                  +974 5091 0893
                </a>
              </li>
              <li>
                <a href="mailto:ceo@go2market.qa " className="text-qatar-maroon hover:text-white transition-colors font-semibold">
                  Info@go2market.qa
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 dark:border-white/10">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-start gap-6">
          <p className="text-slate-300 text-xs font-bold tracking-tight">
            © 2025 go2market.qa. {lang === 'en' ? 'All rights reserved.' : 'Все права защищены.'}
          </p>
          <div className="flex gap-6 text-xs text-slate-300 font-bold uppercase tracking-widest">
            <Link to="/privacy" className="hover:text-white transition-colors">{lang === 'en' ? 'Privacy' : 'Приватность'}</Link>
            <Link to="/terms" className="hover:text-white transition-colors">{lang === 'en' ? 'Terms' : 'Условия'}</Link>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;