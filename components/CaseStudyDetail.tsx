
import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Language } from '../types';
import { CASE_STUDIES } from '../caseStudiesData';
import Header from './Header';
import Footer from './Footer';

interface CaseStudyDetailProps {
  lang: Language;
  setLang: (l: Language) => void;
}

const CaseStudyDetail: React.FC<CaseStudyDetailProps> = ({ lang, setLang }) => {
  const { slug } = useParams<{ slug: string }>();

  const caseIndex = CASE_STUDIES.findIndex((cs) => cs.slug === slug);
  const cs = CASE_STUDIES[caseIndex];
  const prevCase = caseIndex > 0 ? CASE_STUDIES[caseIndex - 1] : null;
  const nextCase = caseIndex < CASE_STUDIES.length - 1 ? CASE_STUDIES[caseIndex + 1] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!cs) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-grow">

        {/* ──────────────────── HERO ──────────────────── */}
        <section className="relative pt-40 pb-20 md:pt-48 md:pb-28 bg-white dark:bg-qatar-night overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-qatar-maroon opacity-[0.02] dark:opacity-[0.05] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>

          <div className="container mx-auto px-6 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm font-medium text-slate-400 dark:text-slate-500 mb-12">
              <Link to="/" className="hover:text-qatar-maroon dark:hover:text-rose-400 transition-colors">
                {lang === 'en' ? 'Home' : 'Главная'}
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <Link to="/case-studies" className="hover:text-qatar-maroon dark:hover:text-rose-400 transition-colors">
                {lang === 'en' ? 'Case Studies' : 'Кейсы'}
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-slate-600 dark:text-slate-400">
                {cs.company[lang]}
              </span>
            </nav>

            {/* Meta row */}
            <div className="flex items-center gap-5 mb-8">
              <span className="text-[11px] font-black text-qatar-maroon dark:text-rose-400 uppercase tracking-[0.3em]">
                {lang === 'en' ? 'Case' : 'Кейс'} {String(caseIndex + 1).padStart(2, '0')}
              </span>
              <span className="inline-block px-4 py-1.5 rounded-full bg-qatar-maroon/5 dark:bg-rose-400/10 text-qatar-maroon dark:text-rose-400 text-[11px] font-bold uppercase tracking-widest">
                {cs.industry[lang]}
              </span>
              <span className="text-sm text-slate-300 dark:text-slate-600 font-bold tracking-wider hidden md:inline">{cs.year}</span>
            </div>

            {/* Title */}
            <div className="max-w-4xl">
              {cs.logo && (
                <img
                  src={cs.logo}
                  alt={cs.company[lang]}
                  className="h-20 w-auto object-contain mb-6 dark:bg-white/90 dark:rounded-xl dark:p-2"
                />
              )}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-5">
                {cs.company[lang]}
              </h1>
              <p className="text-2xl md:text-3xl text-slate-400 font-semibold">
                {cs.subtitle[lang]}
              </p>
            </div>
          </div>
        </section>

        {/* ──────────────────── KEY RESULTS STRIP ──────────────────── */}
        <section className="bg-qatar-maroon py-12 md:py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-x-8 md:gap-x-12 lg:gap-x-16 gap-y-8">
              {cs.results[lang].map((result: { metric: string; label: string }, i: number) => (
                <div key={i} className="text-center md:text-left min-w-0">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-1 tracking-tight break-words">{result.metric}</div>
                  <div className="text-xs sm:text-sm text-white/70 font-semibold">{result.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────── CASE CONTENT ──────────────────── */}
        <section className="py-24 md:py-32 bg-[#FCFCFD] dark:bg-qatar-night-surface">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-y-20 gap-x-12 lg:gap-x-24">

              {/* LEFT COLUMN: Context + Challenges */}
              <div className="lg:col-span-5">
                <div className="space-y-16 lg:sticky lg:top-32">

                  {/* Context */}
                  <div>
                    <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                      <span className="w-8 h-px bg-qatar-maroon dark:bg-rose-400"></span>
                      {lang === 'en' ? 'Context' : 'Контекст'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 leading-[1.85] font-medium text-[15px]">
                      {cs.context[lang]}
                    </p>
                  </div>

                  {/* Challenges */}
                  <div>
                    <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                      <span className="w-8 h-px bg-qatar-maroon dark:bg-rose-400"></span>
                      {lang === 'en' ? 'Challenges' : 'Задачи'}
                    </h2>
                    <ul className="space-y-6">
                      {cs.challenges[lang].map((challenge: string, i: number) => (
                        <li key={i} className="flex items-start gap-4">
                          <span className="w-7 h-7 rounded-full bg-qatar-maroon/5 dark:bg-rose-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[11px] font-black text-qatar-maroon dark:text-rose-400">{i + 1}</span>
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 leading-[1.75] font-medium text-[15px]">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Solution + Results + Quote */}
              <div className="lg:col-span-7 space-y-16">

                {/* Our Approach */}
                <div>
                  <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                    <span className="w-8 h-px bg-qatar-maroon dark:bg-rose-400"></span>
                    {lang === 'en' ? 'Our Approach' : 'Наш подход'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 leading-[1.85] font-medium text-[15px]">
                    {cs.solution[lang]}
                  </p>
                </div>

                {/* Results cards */}
                <div>
                  <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] mb-8 flex items-center gap-3">
                    <span className="w-8 h-px bg-qatar-maroon dark:bg-rose-400"></span>
                    {lang === 'en' ? 'Results' : 'Результаты'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {cs.results[lang].map((result: { metric: string; label: string }, i: number) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-white/[0.04] p-6 md:p-8 rounded-[1.5rem] border border-slate-100 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-black/10 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] dark:hover:shadow-black/20 hover:-translate-y-1 transition-premium min-w-0"
                      >
                        <div className="text-xl sm:text-2xl md:text-3xl font-black text-qatar-maroon dark:text-rose-400 mb-2 tracking-tight break-words">
                          {result.metric}
                        </div>
                        <div className="text-xs sm:text-[13px] text-slate-400 font-semibold leading-snug">
                          {result.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <div className="bg-white dark:bg-white/[0.04] p-10 md:p-12 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-black/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-qatar-maroon/20 dark:bg-rose-400/30 rounded-full"></div>
                  <blockquote className="relative z-10 pl-6 md:pl-8">
                    <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic mb-6">
                      {cs.quote[lang]}
                    </p>
                    <cite className="text-[13px] text-slate-400 font-bold not-italic uppercase tracking-wider">
                      — {cs.quotee[lang]}
                    </cite>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────── PREV / NEXT NAVIGATION ──────────────────── */}
        <section className="bg-white dark:bg-qatar-night border-t border-slate-100 dark:border-white/10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2">

              {/* Previous */}
              {prevCase ? (
                <Link
                  to={`/case-studies/${prevCase.slug}`}
                  className="group py-16 md:py-20 pr-8 md:pr-16 border-r border-slate-100 dark:border-white/10 transition-premium hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-4">
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    {lang === 'en' ? 'Previous Case' : 'Предыдущий кейс'}
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-qatar-maroon dark:group-hover:text-rose-400 transition-colors mb-2">
                    {prevCase.company[lang]}
                  </h3>
                  <p className="text-sm text-slate-400 font-semibold">{prevCase.subtitle[lang]}</p>
                </Link>
              ) : (
                <Link
                  to="/case-studies"
                  className="group py-16 md:py-20 pr-8 md:pr-16 border-r border-slate-100 dark:border-white/10 transition-premium hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-4">
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    {lang === 'en' ? 'All Cases' : 'Все кейсы'}
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-qatar-maroon dark:group-hover:text-rose-400 transition-colors">
                    {lang === 'en' ? 'Back to Case Studies' : 'Назад к кейсам'}
                  </h3>
                </Link>
              )}

              {/* Next */}
              {nextCase ? (
                <Link
                  to={`/case-studies/${nextCase.slug}`}
                  className="group py-16 md:py-20 pl-8 md:pl-16 text-right transition-premium hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-end gap-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-4">
                    {lang === 'en' ? 'Next Case' : 'Следующий кейс'}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-qatar-maroon dark:group-hover:text-rose-400 transition-colors mb-2">
                    {nextCase.company[lang]}
                  </h3>
                  <p className="text-sm text-slate-400 font-semibold">{nextCase.subtitle[lang]}</p>
                </Link>
              ) : (
                <Link
                  to="/case-studies"
                  className="group py-16 md:py-20 pl-8 md:pl-16 text-right transition-premium hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-end gap-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-4">
                    {lang === 'en' ? 'All Cases' : 'Все кейсы'}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-qatar-maroon dark:group-hover:text-rose-400 transition-colors">
                    {lang === 'en' ? 'Back to Case Studies' : 'Назад к кейсам'}
                  </h3>
                </Link>
              )}

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
                  {lang === 'en' ? 'Discuss Your Project' : 'Обсудить ваш проект'}
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

export default CaseStudyDetail;
