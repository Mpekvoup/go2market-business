import React, { lazy, Suspense } from 'react';
import { Language } from '@/types';
import { registrationContent } from './data/registrationContent';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Shared components
const ContactForm = lazy(() => import('@/components/ContactForm'));
const Partners = lazy(() => import('@/components/Partners'));

interface RegistrationHomePageProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

const RegistrationHomePage: React.FC<RegistrationHomePageProps> = ({ lang, setLang }) => {
  const content = registrationContent;

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[520px] md:min-h-[560px] lg:min-h-[600px] flex items-center overflow-hidden pt-20 md:pt-24 lg:pt-28">
          {/* Background image */}
          <picture className="absolute inset-0 w-full h-full">
            <img
              src="/images/hero/hero-main.jpeg"
              alt=""
              className="w-full h-full object-cover object-[75%_center] md:object-[70%_center] lg:object-center"
              width="1920"
              height="1080"
              fetchPriority="high"
              decoding="async"
            />
          </picture>

          {/* Dark overlay - base layer */}
          <div className="absolute inset-0 bg-slate-900/40" aria-hidden="true" />

          {/* Gradient overlay - stronger on left */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/20 md:from-slate-900/85 md:via-slate-900/50 md:to-slate-900/15" aria-hidden="true" />

          {/* Additional top gradient for mobile text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-transparent md:hidden" aria-hidden="true" />

          {/* Content container */}
          <div className="container mx-auto px-6 relative z-10 py-16 md:py-20 lg:py-24">
            <div className="max-w-[640px] lg:max-w-[720px]">
              {/* Badge */}
              <div className="inline-block mb-5 md:mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold tracking-wide shadow-sm">
                  {content.hero.badge[lang]}
                </span>
              </div>

              {/* H1 */}
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-5 md:mb-6">
                {content.hero.headline[lang]}
              </h1>

              {/* Description */}
              <p className="text-[15px] sm:text-lg md:text-xl text-white/90 leading-[1.55] sm:leading-normal mb-14 md:mb-12 max-w-[540px]">
                {content.hero.subheadline[lang]}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contacts"
                  className="inline-flex items-center justify-center px-7 py-4 bg-qatar-maroon hover:bg-qatar-maroon-dark text-white font-bold text-base rounded-xl shadow-lg shadow-qatar-maroon/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[48px]"
                >
                  {content.hero.primaryCTA[lang]}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <a
                  href="#process"
                  className="inline-flex items-center justify-center px-7 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-base rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[48px]"
                >
                  {content.hero.secondaryCTA[lang]}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* What We Help With */}
        <section id="registration" className="py-24 md:py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                {content.whatWeHelpWith.title[lang]}
              </h2>
              <p className="text-xl text-slate-600">
                {content.whatWeHelpWith.subtitle[lang]}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.whatWeHelpWith.services.map((service, index) => (
                <div
                  key={index}
                  className="p-8 bg-slate-50 hover:bg-white border border-slate-100 hover:border-qatar-maroon/20 rounded-2xl transition-all hover:shadow-lg group"
                >
                  <div className="w-14 h-14 bg-qatar-maroon/10 text-qatar-maroon rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {service.icon === 'file-text' && <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></>}
                      {service.icon === 'clipboard-check' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
                      {service.icon === 'award' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />}
                      {service.icon === 'folder' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />}
                      {service.icon === 'map-pin' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />}
                      {service.icon === 'credit-card' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {service.title[lang]}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {service.description[lang]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-24 md:py-32 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                {content.whoItsFor.title[lang]}
              </h2>
              <p className="text-xl text-slate-600">
                {content.whoItsFor.subtitle[lang]}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.whoItsFor.audience.map((item, index) => (
                <div
                  key={index}
                  className="p-6 bg-white rounded-xl border border-slate-100 hover:border-qatar-maroon/30 hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title[lang]}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.description[lang]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="py-24 md:py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                {content.process.title[lang]}
              </h2>
              <p className="text-xl text-slate-600">
                {content.process.subtitle[lang]}
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {content.process.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-6 p-6 bg-slate-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-slate-100"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-qatar-maroon text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {step.title[lang]}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {step.description[lang]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why G2M */}
        <section className="py-24 md:py-32 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                {content.whyG2M.title[lang]}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {content.whyG2M.reasons.map((reason, index) => (
                <div key={index} className="p-6 bg-white rounded-xl border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {reason.title[lang]}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {reason.description[lang]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 md:py-32 bg-white">
            <div className="container mx-auto px-6">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                  {content.faq.title[lang]}
                </h2>
              </div>

              <div className="max-w-3xl mx-auto space-y-4">
                {content.faq.items.map((item, index) => (
                  <details
                    key={index}
                    className="group p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-qatar-maroon/30 transition-all"
                  >
                    <summary className="font-bold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                      {item.question[lang]}
                      <svg
                        className="w-5 h-5 text-qatar-maroon group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-4 text-slate-600 leading-relaxed">
                      {item.answer[lang]}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

        {/* Shared sections */}
        <Suspense fallback={<div className="min-h-screen" />}>
          <ContactForm lang={lang} />
          <Partners lang={lang} />
        </Suspense>
      </main>

      <Footer lang={lang} />
    </div>
  );
};

export default RegistrationHomePage;
