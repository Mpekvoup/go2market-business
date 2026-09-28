
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import { CASE_STUDIES } from '../caseStudiesData';
import Header from './Header';
import Footer from './Footer';

interface CaseStudiesPageProps {
  lang: Language;
  setLang: (l: Language) => void;
}

const CaseStudiesPage: React.FC<CaseStudiesPageProps> = ({ lang, setLang }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-grow">

        {/* ──────────────────── HERO ──────────────────── */}
        <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 bg-white dark:bg-qatar-night overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-qatar-maroon opacity-[0.02] dark:opacity-[0.05] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-200 dark:bg-white/5 opacity-30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

          <div className="container mx-auto px-6 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm font-medium text-slate-400 dark:text-slate-500 mb-12">
              <Link to="/" className="hover:text-qatar-maroon dark:hover:text-rose-400 transition-colors">
                {lang === 'en' ? 'Home' : 'Главная'}
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-slate-600 dark:text-slate-400">
                {lang === 'en' ? 'Case Studies' : 'Кейсы'}
              </span>
            </nav>

            <div className="max-w-4xl">
              <h1 className="text-xs font-black text-qatar-maroon dark:text-rose-400 uppercase tracking-[0.4em] mb-6">
                {lang === 'en' ? 'Case Studies' : 'Наши кейсы'}
              </h1>
              <p className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-8 text-balance">
                {lang === 'en'
                  ? 'Delivering measurable impact for every client'
                  : 'Измеримые результаты для каждого клиента'}
              </p>
              <p className="text-xl md:text-2xl text-slate-400 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                {lang === 'en'
                  ? 'We partner with ambitious companies entering the Qatar market. These are their stories.'
                  : 'Мы работаем с амбициозными компаниями, выходящими на рынок Катара. Это их истории.'}
              </p>
            </div>

            {/* Stats strip */}
            <div className="mt-16 grid grid-cols-2 sm:flex sm:flex-wrap gap-8 sm:gap-16 md:gap-24">
              {[
                { value: '20+', label: { en: 'Companies registered', ru: 'Компаний зарегистрировано' } },
                { value: '10+', label: { en: 'Industries served', ru: 'Обслуженных отраслей' } },
                { value: '100%', label: { en: 'Client satisfaction', ru: 'Удовлетворённость клиентов' } },
              ].map((stat, i) => (
                <div key={i} className="min-w-0">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-qatar-maroon dark:text-rose-400 tracking-tight break-words">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-semibold mt-1">{stat.label[lang]}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────── CASE STUDY CARDS ──────────────────── */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-[#FCFCFD] to-white dark:from-qatar-night-surface dark:to-qatar-night">
          <div className="container mx-auto px-6">
            <div className="space-y-8">
              {CASE_STUDIES.map((cs, idx) => (
                <Link
                  key={cs.id}
                  to={`/case-studies/${cs.slug}`}
                  className="group block"
                >
                  <article className="relative bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 rounded-3xl p-8 md:p-12 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(114,28,36,0.15)] dark:hover:shadow-black/30 hover:border-qatar-maroon/20 dark:hover:border-rose-400/30 hover:-translate-y-1 overflow-hidden">

                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-qatar-maroon/[0.02] dark:from-rose-400/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    {/* Accent line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-qatar-maroon dark:from-rose-400 to-qatar-maroon/20 dark:to-rose-400/20 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>

                    <div className="relative z-10">
                      {/* Top row: number + industry + year */}
                      <div className="flex items-center justify-between mb-8 md:mb-10">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-qatar-maroon dark:text-rose-400 uppercase tracking-[0.3em] bg-qatar-maroon/5 dark:bg-rose-400/10 px-4 py-2 rounded-full">
                            {lang === 'en' ? 'Case' : 'Кейс'} {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 dark:from-white/[0.05] dark:to-white/[0.02] text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border border-slate-200/50 dark:border-white/10 group-hover:border-qatar-maroon/20 dark:group-hover:border-rose-400/30 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-qatar-maroon dark:bg-rose-400"></span>
                            {cs.industry[lang]}
                          </span>
                        </div>
                        <span className="text-sm text-slate-300 dark:text-slate-600 font-bold tracking-wider hidden md:block group-hover:text-qatar-maroon/40 dark:group-hover:text-rose-400/40 transition-colors">{cs.year}</span>
                      </div>

                      {/* Main content row */}
                      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                        {/* Left: Company + subtitle */}
                        <div className="lg:col-span-5">
                          {cs.logo && (
                            <div className="mb-6 p-4 bg-slate-50 dark:bg-white/90 rounded-2xl inline-block group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                              <img
                                src={cs.logo}
                                alt={`${cs.company[lang]} - ${cs.industry[lang]} ${lang === 'en' ? 'case study by G2M International Qatar' : 'кейс от G2M International Qatar'}`}
                                className="h-12 w-auto object-contain"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          )}
                          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-4 group-hover:text-qatar-maroon dark:group-hover:text-rose-400 transition-colors duration-300">
                            {cs.company[lang]}
                          </h2>
                          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            {cs.subtitle[lang]}
                          </p>
                        </div>

                        {/* Center: Context preview */}
                        <div className="lg:col-span-5">
                          <p className="text-slate-600 dark:text-slate-300 leading-[1.8] font-medium text-base line-clamp-3 mb-8">
                            {cs.context[lang]}
                          </p>

                          {/* Results preview - Enhanced design */}
                          <div className="grid grid-cols-3 gap-6 p-6 bg-gradient-to-br from-slate-50 to-white dark:from-white/[0.04] dark:to-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/10 group-hover:border-qatar-maroon/10 dark:group-hover:border-rose-400/20 group-hover:shadow-sm transition-all duration-300">
                            {cs.results[lang].slice(0, 3).map((result, i) => (
                              <div key={i} className="text-center">
                                <div className="text-2xl md:text-3xl font-black bg-gradient-to-br from-qatar-maroon to-qatar-maroon/70 dark:from-rose-400 dark:to-rose-400/70 bg-clip-text text-transparent tracking-tight mb-1">
                                  {result.metric}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide leading-tight">
                                  {result.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right: Arrow */}
                        <div className="lg:col-span-2 flex lg:justify-end items-start">
                          <div className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-qatar-maroon group-hover:bg-qatar-maroon group-hover:scale-110 transition-all duration-300 shadow-sm">
                            <svg className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-white transition-all duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────── CTA BANNER ──────────────────── */}
        <section className="py-24 bg-white dark:bg-qatar-night">
          <div className="container mx-auto px-6">
            <div className="bg-gradient-to-br from-qatar-maroon to-[#5d1428] rounded-[60px] p-12 lg:p-24 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-[120px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>

              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                  {lang === 'en'
                    ? 'Ready to write your own success story?'
                    : 'Готовы написать свою историю успеха?'}
                </h2>
                <p className="text-lg text-white/60 font-medium mb-10 leading-relaxed">
                  {lang === 'en'
                    ? 'Tell us about your business goals. We will show you the most efficient path to the Qatar market.'
                    : 'Расскажите о ваших бизнес-целях. Мы покажем самый эффективный путь на рынок Катара.'}
                </p>
                <a
                  href="/#contacts"
                  className="inline-flex items-center gap-3 bg-white text-qatar-maroon px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/90 hover:scale-105 transition-premium shadow-xl"
                >
                  {lang === 'en' ? 'Get in Touch' : 'Связаться'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer lang={lang} />

      {/* WhatsApp Float */}
      <a
        href={`https://wa.me/97450910893?text=${lang === 'en' ? 'Hello!' : 'Здравствуйте!'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-slate-800 px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
          {lang === 'en' ? 'Get a Consultation' : 'Получить консультацию'}
        </span>
      </a>
    </div>
  );
};

export default CaseStudiesPage;
