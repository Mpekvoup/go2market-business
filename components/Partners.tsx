import React, { useState } from 'react';
import { Language } from '../types';
import { PARTNERS, CLIENTS } from '../constants';

interface PartnersProps {
  lang: Language;
}

const Partners: React.FC<PartnersProps> = ({ lang }) => {
  const [currentClient, setCurrentClient] = useState(0);

  const nextClient = () => {
    setCurrentClient((prev) => (prev + 1) % CLIENTS.length);
  };

  const prevClient = () => {
    setCurrentClient((prev) => (prev - 1 + CLIENTS.length) % CLIENTS.length);
  };

  return (
    <section className="py-24 bg-white dark:bg-qatar-night overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Main registration zones section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {lang === 'en' ? 'Main registration zones in Qatar' : 'Основные зоны регистрации в Катаре'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg mb-12 max-w-3xl mx-auto">
            {lang === 'en'
              ? 'Partnering with Government Entities to Drive Progress and Deliver Specialized Solutions'
              : 'Партнерство с государственными органами для достижения прогресса и предоставления специализированных решений'
            }
          </p>
        </div>
      </div>

      {/* Infinite Scroll Logo Wall - full width, outside container */}
      <div className="relative mb-24">
        <div className="flex animate-scroll whitespace-nowrap gap-16">
          {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((p, idx) => (
            <a
              key={idx}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block flex-shrink-0 hover:scale-110 transition-all duration-500"
            >
              <img src={p.logo} alt={p.altText?.[lang] || p.name} className="h-24 object-contain dark:brightness-110" loading="lazy" decoding="async" />
            </a>
          ))}
        </div>
        {/* Fades */}
        <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-white dark:from-qatar-night to-transparent z-10"></div>
        <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-white dark:from-qatar-night to-transparent z-10"></div>
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-sm font-black text-qatar-maroon dark:text-rose-400 uppercase tracking-[0.3em]">
            {lang === 'en' ? 'Our clients' : 'Наши клиенты'}
          </h2>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
            {lang === 'en' ? 'Companies we worked with' : 'Компании, с которыми мы работали'}
          </h3>
        </div>

        {/* Mobile: Navigation with buttons */}
        <div className="md:hidden relative mb-12">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevClient}
              className="w-10 h-10 bg-slate-100 dark:bg-white/[0.05] hover:bg-qatar-maroon hover:text-white text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center transition-all flex-shrink-0"
              aria-label="Previous client"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 max-w-xs">
              <div className="w-full aspect-video bg-slate-50 dark:bg-white/90 rounded-2xl p-6 flex items-center justify-center border border-slate-100 dark:border-white/10">
                <img src={CLIENTS[currentClient].logo} alt={CLIENTS[currentClient].altText?.[lang] || CLIENTS[currentClient].name} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
              </div>
            </div>

            <button
              onClick={nextClient}
              className="w-10 h-10 bg-slate-100 dark:bg-white/[0.05] hover:bg-qatar-maroon hover:text-white text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center transition-all flex-shrink-0"
              aria-label="Next client"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {CLIENTS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentClient(idx)}
                className="w-11 h-11 flex items-center justify-center"
                aria-label={`Go to client ${idx + 1}`}
              >
                <span className={`rounded-full transition-all block ${idx === currentClient ? 'bg-qatar-maroon w-8 h-2' : 'bg-slate-300 dark:bg-white/20 w-2 h-2'}`} />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Desktop: Infinite Scroll - full width, outside container */}
      <div className="hidden md:block relative">
        <div className="flex animate-scroll whitespace-nowrap gap-8">
          {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((c, idx) => (
            <div
              key={idx}
              className="inline-flex flex-shrink-0 items-center justify-center w-48 h-28 bg-slate-50 dark:bg-white/90 rounded-2xl p-6 border border-slate-100 dark:border-white/10 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            >
              <img src={c.logo} alt={c.altText?.[lang] || c.name} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
        {/* Fades */}
        <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-white dark:from-qatar-night to-transparent z-10"></div>
        <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-white dark:from-qatar-night to-transparent z-10"></div>
      </div>
    </section>
  );
};

export default Partners;
