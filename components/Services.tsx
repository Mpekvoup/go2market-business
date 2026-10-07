import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import { SERVICES } from '../constants';

interface ServicesProps {
  lang: Language;
}

const ICONS = [
  // B2B Lead Generation — target/bullseye
  <svg key="lead" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  // Business Intelligence — bar chart
  <svg key="bi" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  // Incorporation — building
  <svg key="inc" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  // Business Matchmaking — people
  <svg key="mm" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  // Fundraising — money
  <svg key="fr" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
];

const LANGUAGES = ['KZ', 'RU', 'EN', 'AR', 'TR'];

const Services: React.FC<ServicesProps> = ({ lang }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const handleCardClick = (idx: number) => {
    setActiveIdx(activeIdx === idx ? null : idx);
  };

  const steps = [
    {
      title: { en: 'Pick a time & format', ru: 'Выберите время и формат' },
      desc: {
        en: 'Choose whatever works for you: video call, WhatsApp, or a phone call.',
        ru: 'Как вам удобно: видеозвонок, WhatsApp или обычный телефонный звонок.',
      },
    },
    {
      title: { en: '1 - hour call', ru: 'Часовой созвон' },
      desc: {
        en: 'A direct conversation about your situation — market entry, registration, or a trading deal.',
        ru: 'Прямой разговор о вашей задаче — выход на рынок, регистрация или сделка.',
      },
    },
    {
      title: { en: 'Written action plan', ru: 'Письменный план действий' },
      desc: {
        en: 'You leave with concrete next steps in writing, not just notes from a call.',
        ru: 'На выходе — конкретные следующие шаги в письменном виде, а не просто заметки после звонка.',
      },
    },
  ];

  return (
    <section id="services" className="py-32 bg-[#FCFCFD] relative">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16 space-y-5">
          <h2 className="text-xs font-black text-qatar-maroon uppercase tracking-[0.4em]">
            {lang === 'en' ? 'Start here' : 'Начните отсюда'}
          </h2>
          <p className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            {lang === 'en' ? 'Book a consultation with the managing partner' : 'Консультация с управляющим партнёром'}
          </p>
          <p className="text-lg text-slate-500 font-medium">
            {lang === 'en'
              ? 'One 1-hour call to map out your market entry, registration, or trading deal.'
              : '1 час, чтобы разобрать выход на рынок, регистрацию компании или сделку.'}
          </p>
        </div>

        {/* Consultation panel — sits first, above the services grid */}
        <div className="max-w-6xl mx-auto rounded-[2.5rem] overflow-hidden shadow-[0_24px_80px_-16px_rgba(141,27,61,0.25)] border border-qatar-maroon/10 flex flex-col lg:flex-row mb-20">
          {/* Left: who you're talking to + price + CTA */}
          <div className="lg:w-[36%] bg-gradient-to-br from-qatar-maroon to-[#5e1128] p-10 md:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative space-y-6">
              {/* Adjust the path below to wherever the photo actually lives in /public/images */}
              <img
                src="/images/about/about.jpg"
                alt={lang === 'en'
                  ? "Begarys Otarov - Managing Partner at G2M International Consulting, Qatar business registration expert"
                  : "Бегарыс Отаров - Управляющий партнер G2M International Consulting, эксперт по регистрации бизнеса в Катаре"}
                className="w-80 h-80 rounded-2xl object-cover object-[center_30%] lg:object-[center_25%] flex-shrink-0 border border-white/20"
                width="800"
                height="909"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3 className="text-xl font-extrabold text-white leading-tight">
                  Begarys Otarov
                </h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider mt-1">
                  {lang === 'en' ? 'Managing Partner' : 'Управляющий партнёр'}
                </p>
                <p className="text-white/70 text-sm leading-relaxed mt-4">
                  {lang === 'en'
                    ? "You'll speak directly with the managing partner — not a call center or a junior associate."
                    : 'Вы говорите напрямую с управляющим партнёром — не с колл-центром и не с младшим сотрудником.'}
                </p>
              </div>

              {/* Languages */}
              <div className="flex items-center gap-2 pt-1">
                {LANGUAGES.map((code) => (
                  <span
                    key={code}
                    className="text-[10px] font-bold text-white/70 bg-white/10 border border-white/15 rounded-md px-2 py-1"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mt-10">
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-4xl font-black text-white">$100</span>
                <span className="text-white/50 text-xs font-semibold">
                  · 1 {lang === 'en' ? 'hour' : 'час'}
                </span>
              </div>
              <a
                href="#contacts"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('contacts');
                  if (element) {
                    const offset = 80;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = element.getBoundingClientRect().top;
                    const offsetPosition = elementRect - bodyRect - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                  }
                }}
                className="group inline-flex w-full items-center justify-center gap-2 bg-white text-qatar-maroon font-black text-sm px-7 py-4 rounded-2xl shadow-[0_10px_28px_rgba(0,0,0,0.22)] hover:shadow-[0_14px_34px_rgba(0,0,0,0.28)] hover:-translate-y-0.5 transition-all duration-200"
              >
                {lang === 'en' ? 'Book Now' : 'Записаться'}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <p className="text-white/45 text-[11px] font-semibold mt-3 text-center">
                {lang === 'en' ? 'Typically responds within 24 hours' : 'Обычно отвечаем в течение 24 часов'}
              </p>
            </div>
          </div>

          {/* Right: how it works + trust stats + FAQ */}
          <div className="flex-1 bg-white p-10 md:p-12">
            <p className="text-[10px] font-black text-qatar-maroon uppercase tracking-[0.4em] mb-7">
              {lang === 'en' ? 'How it works' : 'Как это проходит'}
            </p>
            <div>
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-5">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-9 h-9 bg-qatar-maroon text-white rounded-xl flex items-center justify-center text-xs font-black shadow-sm">
                      {idx + 1}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="w-px flex-1 bg-qatar-maroon/12 my-1.5" />
                    )}
                  </div>
                  <div className={idx < steps.length - 1 ? 'pb-6' : ''}>
                    <h5 className="font-bold text-slate-900 text-sm mb-1 pt-1.5 leading-tight">
                      {step.title[lang]}
                    </h5>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {step.desc[lang]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-7 my-8 border-y border-slate-100">
              {[
                { value: '20+', label: { en: 'Companies helped', ru: 'Компаний сопроводили' } },
                { value: 'QFC', label: { en: 'Licensed in Qatar', ru: 'Лицензия в Катаре' } },
                { value: '1:1', label: { en: 'Direct, no hand-offs', ru: 'Без передачи менеджеру' } },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-black text-qatar-maroon leading-none">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide mt-2">
                    {stat.label[lang]}
                  </p>
                </div>
              ))}
            </div>

            {/* Mini FAQ */}
            <div>
              <p className="text-[10px] font-black text-qatar-maroon uppercase tracking-[0.4em] mb-5">
                {lang === 'en' ? 'FAQ' : 'Частые вопросы'}
              </p>
              <div className="space-y-5">
                {[
                  {
                    q: { en: 'Is the first call free?', ru: 'Первая консультация бесплатна?' },
                    a: {
                      en: 'No — every session is paid from the start, including the first one. That keeps the time focused on your case, not a generic sales pitch.',
                      ru: 'Нет — каждая консультация платная с самого начала, включая первую. Это гарантирует, что время идёт на вашу задачу, а не на общую презентацию.',
                    },
                  },
                  {
                    q: { en: "What's included in the $100?", ru: 'Что входит в $100?' },
                    a: {
                      en: 'A 1-hour call plus a written action plan afterward — not just notes.',
                      ru: 'Часовой созвон и письменный план действий после него — не просто заметки.',
                    },
                  },
                  {
                    q: { en: 'Can I reschedule?', ru: 'Можно перенести время?' },
                    a: {
                      en: 'Yes — just message beforehand and we\u2019ll find a new slot.',
                      ru: 'Да — просто напишите заранее, подберём новое время.',
                    },
                  },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-sm font-bold text-slate-900 mb-1">{item.q[lang]}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.a[lang]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Services grid — restored original interactive cards, topics covered on the call */}
        <p className="text-[10px] font-black text-qatar-maroon uppercase tracking-[0.4em] mb-6 text-center">
          {lang === 'en' ? "What we'll cover" : 'Что обсудим на консультации'}
        </p>

        {/* B2B LEAD GENERATION — Premium Wide Card */}
        <div
          className="group w-full text-left rounded-[2.5rem] border overflow-hidden transition-all duration-300 mb-8 shadow-[0_16px_48px_rgba(141,27,61,0.22)] border-qatar-maroon/30 hover:shadow-[0_32px_72px_-10px_rgba(141,27,61,0.35)] hover:border-qatar-maroon"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Left: Gradient side with icon & badge */}
            <div className="lg:w-80 flex-shrink-0 bg-gradient-to-br from-qatar-maroon to-[#5e1128] p-10 lg:p-12 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

              <div className="relative">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-8">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/90 text-[10px] font-black uppercase tracking-wider">
                    {lang === 'en' ? 'New Service' : 'Новый сервис'}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center text-white mb-8 border border-white/20">
                  {ICONS[0]}
                </div>

                {/* Title */}
                <h3 className="text-3xl font-black text-white mb-4 leading-tight">
                  {SERVICES[0].title[lang]}
                </h3>

                {/* Description */}
                <p className="text-white/75 text-sm leading-relaxed mb-8">
                  {SERVICES[0].desc[lang]}
                </p>

                {/* Key Benefits */}
                <div className="space-y-3">
                  {[
                    { en: 'Targeted GCC decision-makers', ru: 'Целевые лица, принимающие решения в GCC' },
                    { en: 'Personalised outreach at scale', ru: 'Персонализированный охват в масштабе' },
                    { en: 'Pay for results, not activity', ru: 'Платите за результаты, а не за активность' },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-white/90 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/85 text-xs font-semibold">{benefit[lang]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: White side with details & CTA */}
            <div className="flex-1 bg-white p-10 lg:p-12 flex flex-col justify-between">
              {/* Top section */}
              <div>
                <p className="text-[10px] font-black text-qatar-maroon uppercase tracking-[0.4em] mb-6">
                  {lang === 'en' ? 'What you get' : 'Что входит'}
                </p>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {[
                    { value: '4-8', label: { en: 'weeks', ru: 'недель' } },
                    { value: '500+', label: { en: 'leads reached', ru: 'лидов' } },
                    { value: '100%', label: { en: 'outreach delivered', ru: 'охват' } },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-3xl font-black text-qatar-maroon leading-none mb-2">{stat.value}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide leading-tight">
                        {stat.label[lang]}
                      </p>
                    </div>
                  ))}
                </div>

                {/* What's Included */}
                <div className="bg-slate-50/70 rounded-2xl p-6 mb-6">
                  <p className="text-xs font-bold text-slate-900 mb-4">
                    {lang === 'en' ? "What's included:" : 'Что включено:'}
                  </p>
                  <div className="space-y-3">
                    {[
                      { en: 'ICP and target list building', ru: 'ICP и построение целевых списков' },
                      { en: 'Multi-channel outreach (email, LinkedIn, WhatsApp)', ru: 'Мультиканальный охват (email, LinkedIn, WhatsApp)' },
                      { en: 'Messaging and sequence design', ru: 'Дизайн сообщений и последовательностей' },
                      { en: 'Meeting booking and handoff', ru: 'Бронирование встреч и передача' },
                      { en: 'Weekly pipeline reporting', ru: 'Еженедельная отчетность по воронке' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-qatar-maroon flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 text-xs font-semibold leading-relaxed">{item[lang]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom: CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a
                  href="#contacts"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('contacts');
                    if (element) {
                      const offset = 40;
                      const bodyRect = document.body.getBoundingClientRect().top;
                      const elementRect = element.getBoundingClientRect().top;
                      const offsetPosition = elementRect - bodyRect - offset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }}
                  className="group/cta flex items-center justify-center gap-2 bg-qatar-maroon text-white font-black text-sm px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex-1"
                >
                  {lang === 'en' ? 'Get Started' : 'Начать'}
                  <svg className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* INCORPORATION — Premium Wide Card */}
        <div
          className="group w-full text-left rounded-[2.5rem] border overflow-hidden transition-all duration-300 mb-8 shadow-[0_16px_48px_rgba(141,27,61,0.22)] border-qatar-maroon/30 hover:shadow-[0_32px_72px_-10px_rgba(141,27,61,0.35)] hover:border-qatar-maroon"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Left: Gradient side with icon & badge */}
            <div className="lg:w-80 flex-shrink-0 bg-gradient-to-br from-qatar-maroon to-[#5e1128] p-10 lg:p-12 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

              <div className="relative">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-8">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white/90 text-[10px] font-black uppercase tracking-wider">
                    {lang === 'en' ? 'Most Popular' : 'Хит продаж'}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center text-white mb-8 border border-white/20">
                  {ICONS[2]}
                </div>

                {/* Title */}
                <h3 className="text-3xl font-black text-white mb-4 leading-tight">
                  {SERVICES[2].title[lang]}
                </h3>

                {/* Description */}
                <p className="text-white/75 text-sm leading-relaxed mb-8">
                  {SERVICES[2].desc[lang]}
                </p>

                {/* Key Benefits */}
                <div className="space-y-3">
                  {[
                    { en: 'QFC, Madayn & Kuwait zones', ru: 'QFC, Madayn и зоны Кувейта' },
                    { en: 'Visa & residency included', ru: 'Виза и резидентство включены' },
                    { en: 'Bank account setup', ru: 'Открытие банковского счёта' },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-white/90 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/85 text-xs font-semibold">{benefit[lang]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: White side with details & CTA */}
            <div className="flex-1 bg-white p-10 lg:p-12 flex flex-col justify-between">
              {/* Top section */}
              <div>
                <p className="text-[10px] font-black text-qatar-maroon uppercase tracking-[0.4em] mb-6">
                  {lang === 'en' ? 'What you get' : 'Что входит'}
                </p>

                {/* What's Included */}
                <div className="bg-slate-50/70 rounded-2xl p-6 mb-6">
                  <p className="text-xs font-bold text-slate-900 mb-4">
                    {lang === 'en' ? "What's included:" : 'Что включено:'}
                  </p>
                  <div className="space-y-3">
                    {[
                      { en: 'Company registration in QFC/Madayn', ru: 'Регистрация компании в QFC/Madayn' },
                      { en: 'Commercial license & approvals', ru: 'Коммерческая лицензия и согласования' },
                      { en: 'Resident visa for founders', ru: 'Резидентская виза для основателей' },
                      { en: 'Corporate bank account setup', ru: 'Открытие корпоративного счёта' },
                      { en: 'Ongoing compliance support', ru: 'Постоянная поддержка по compliance' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-qatar-maroon flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 text-xs font-semibold leading-relaxed">{item[lang]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom: CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a
                  href="#contacts"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('contacts');
                    if (element) {
                      const offset = 40;
                      const bodyRect = document.body.getBoundingClientRect().top;
                      const elementRect = element.getBoundingClientRect().top;
                      const offsetPosition = elementRect - bodyRect - offset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }}
                  className="group/cta flex items-center justify-center gap-2 bg-qatar-maroon text-white font-black text-sm px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex-1"
                >
                  {lang === 'en' ? 'Get Started' : 'Начать'}
                  <svg className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Other Services — 3 column grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, idx) => {
            if (idx === 0 || idx === 2) return null; // Skip B2B Lead Gen & Incorporation — they're above

            // Calculate display number for remaining cards
            const displayNumber = idx === 1 ? 1 : (idx === 3 ? 2 : 3);

            return (
              <button
                key={idx}
                onClick={() => handleCardClick(idx)}
                className={`group text-left bg-white p-10 rounded-[2.5rem] border transition-all duration-200 flex flex-col h-full cursor-pointer active:scale-[0.98] ${
                  activeIdx === idx
                    ? 'shadow-[0_24px_64px_-10px_rgba(141,27,61,0.22)] border-qatar-maroon -translate-y-2'
                    : 'shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-slate-100 hover:shadow-[0_24px_48px_-10px_rgba(0,0,0,0.13)] hover:-translate-y-2 hover:border-qatar-maroon/30'
                }`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 ${
                    activeIdx === idx
                      ? 'bg-qatar-maroon text-white'
                      : 'bg-slate-50 text-slate-900 group-hover:bg-qatar-maroon group-hover:text-white'
                  }`}>
                    {ICONS[idx]}
                  </div>
                  <span className="text-3xl font-black tabular-nums leading-none text-slate-500 dark:text-slate-400">
                    {String(displayNumber).padStart(2, '0')}
                  </span>
                </div>
                <h3 className={`text-xl font-bold mb-4 transition-colors leading-tight ${
                  activeIdx === idx ? 'text-qatar-maroon' : 'text-slate-900 group-hover:text-qatar-maroon'
                }`}>
                  {service.title[lang]}
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium flex-grow text-sm">
                  {service.desc[lang]}
                </p>
                <div className={`mt-6 self-start flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 ${
                  activeIdx === idx
                    ? 'bg-qatar-maroon text-white border-qatar-maroon'
                    : 'bg-slate-50 text-slate-600 border-slate-200 group-hover:bg-qatar-maroon group-hover:text-white group-hover:border-qatar-maroon'
                }`}>
                  <span>
                    {activeIdx === idx
                      ? (lang === 'en' ? 'Hide steps' : 'Скрыть шаги')
                      : (lang === 'en' ? 'View steps' : 'Показать шаги')}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${activeIdx === idx ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Mobile-only: steps inside the card */}
                {activeIdx === idx && (
                  <div className="lg:hidden mt-6 pt-6 border-t border-qatar-maroon/10 animate-steps-in">
                    {service.steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex gap-4">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-8 h-8 bg-qatar-maroon text-white rounded-xl flex items-center justify-center text-xs font-black shadow-sm">
                            {stepIdx + 1}
                          </div>
                          {stepIdx < service.steps.length - 1 && (
                            <div className="w-px flex-1 bg-qatar-maroon/12 my-1.5" />
                          )}
                        </div>
                        <div className={`text-left ${stepIdx < service.steps.length - 1 ? 'pb-5' : ''}`}>
                          <h5 className="font-bold text-slate-900 mb-1 text-sm pt-1 leading-tight">{step.title[lang]}</h5>
                          <p className="text-slate-500 text-xs leading-relaxed">{step.desc[lang]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Steps Panel — desktop only */}
        {activeIdx !== null && (
          <div className="hidden lg:flex mt-8 rounded-[2.5rem] overflow-hidden shadow-[0_16px_64px_rgba(141,27,61,0.13)] animate-steps-in border border-qatar-maroon/10">
            {/* Left: service info */}
            <div className="w-80 flex-shrink-0 bg-gradient-to-br from-qatar-maroon to-[#5e1128] p-10 flex flex-col">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center text-white mb-8">
                {ICONS[activeIdx]}
              </div>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                {lang === 'en' ? 'Service' : 'Услуга'}
              </p>
              <h4 className="text-2xl font-extrabold text-white mb-5 leading-snug">
                {SERVICES[activeIdx].title[lang]}
              </h4>
              <p className="text-white/65 text-sm leading-relaxed flex-grow">
                {SERVICES[activeIdx].desc[lang]}
              </p>
              <div className="mt-10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40" />
                <span className="text-white/50 text-xs font-semibold">
                  {SERVICES[activeIdx].steps.length}{' '}
                  {lang === 'en' ? 'steps' : 'шага'}
                </span>
              </div>
            </div>

            {/* Right: steps timeline */}
            <div className="flex-1 bg-white p-10">
              <p className="text-[10px] font-black text-qatar-maroon uppercase tracking-[0.4em] mb-8">
                {lang === 'en' ? 'How it works' : 'Как это работает'}
              </p>
              <div>
                {SERVICES[activeIdx].steps.map((step, stepIdx) => (
                  <div key={stepIdx} className="flex gap-5">
                    {/* Number + connector */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-9 h-9 bg-qatar-maroon text-white rounded-xl flex items-center justify-center text-xs font-black shadow-sm">
                        {stepIdx + 1}
                      </div>
                      {stepIdx < SERVICES[activeIdx].steps.length - 1 && (
                        <div className="w-px flex-1 bg-qatar-maroon/12 my-1.5" />
                      )}
                    </div>
                    {/* Text */}
                    <div className={stepIdx < SERVICES[activeIdx].steps.length - 1 ? 'pb-6' : ''}>
                      <h5 className="font-bold text-slate-900 text-sm mb-1 pt-1.5 leading-tight">
                        {step.title[lang]}
                      </h5>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {step.desc[lang]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;



