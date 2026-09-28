import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import Header from './Header';
import Footer from './Footer';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
}

const TermsPage: React.FC<Props> = ({ lang, setLang }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} setLang={setLang} />
      <main className="flex-grow bg-[#FCFCFD] dark:bg-qatar-night py-24 md:py-32">
        <div className="container mx-auto px-6 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 dark:text-slate-500 hover:text-qatar-maroon dark:hover:text-rose-400 transition-colors mb-12">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {lang === 'en' ? 'Back to Home' : 'На главную'}
          </Link>

          <h2 className="text-xs font-black text-qatar-maroon dark:text-rose-400 uppercase tracking-[0.4em] mb-4">
            {lang === 'en' ? 'Legal' : 'Документы'}
          </h2>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            {lang === 'en' ? 'Terms of Use' : 'Условия использования'}
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-16">
            {lang === 'en' ? 'Last updated: February 2026' : 'Последнее обновление: февраль 2026'}
          </p>

          <div className="space-y-12 text-slate-600 dark:text-slate-300 leading-relaxed font-medium">

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '1. Acceptance of Terms' : '1. Принятие условий'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'By accessing and using go2market.qa, you agree to be bound by these Terms of Use. If you do not agree, please discontinue use of the website.'
                  : 'Используя сайт go2market.qa, вы соглашаетесь с настоящими Условиями. Если вы не согласны, пожалуйста, прекратите использование сайта.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '2. About the Service' : '2. О сервисе'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'G2M International Consulting provides business consultancy services including market entry strategy, company registration, business matchmaking and fundraising in Qatar and the wider Gulf region. The information on this website is for general informational purposes only and does not constitute legal or financial advice.'
                  : 'G2M International Consulting предоставляет консалтинговые услуги, включая стратегию выхода на рынок, регистрацию компаний, бизнес-партнёрство и привлечение инвестиций в Катаре и регионе Залива. Информация на сайте носит исключительно ознакомительный характер и не является юридической или финансовой консультацией.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '3. Intellectual Property' : '3. Интеллектуальная собственность'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'All content on this website — including text, graphics, logos, case studies and design — is the property of G2M International Consulting and is protected by applicable intellectual property laws. You may not reproduce or distribute any content without prior written permission.'
                  : 'Весь контент сайта — включая тексты, графику, логотипы, кейсы и дизайн — является собственностью G2M International Consulting и защищён законодательством об интеллектуальной собственности. Воспроизведение или распространение контента без письменного разрешения запрещено.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '4. User Conduct' : '4. Поведение пользователей'}
              </h2>
              <p className="mb-4">{lang === 'en' ? 'When using this website, you agree not to:' : 'Используя сайт, вы соглашаетесь не:'}</p>
              <ul className="space-y-2 list-disc list-inside text-slate-500 dark:text-slate-400">
                <li>{lang === 'en' ? 'Submit false or misleading information via the contact form' : 'Отправлять ложную или вводящую в заблуждение информацию через форму'}</li>
                <li>{lang === 'en' ? 'Attempt to gain unauthorised access to any part of the website' : 'Пытаться получить несанкционированный доступ к любой части сайта'}</li>
                <li>{lang === 'en' ? 'Use the website for any unlawful purpose' : 'Использовать сайт в незаконных целях'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '5. Limitation of Liability' : '5. Ограничение ответственности'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'G2M International Consulting shall not be liable for any indirect, incidental or consequential damages arising from the use of, or inability to use, this website or its content. We make no warranties, express or implied, regarding the accuracy or completeness of the information provided.'
                  : 'G2M International Consulting не несёт ответственности за косвенный, случайный или последующий ущерб, возникший в результате использования или невозможности использования сайта. Мы не даём никаких гарантий, явных или подразумеваемых, относительно точности или полноты предоставленной информации.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '6. Governing Law' : '6. Применимое право'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'These Terms of Use are governed by and construed in accordance with the laws of the State of Qatar. Any disputes shall be subject to the exclusive jurisdiction of the courts of Qatar.'
                  : 'Настоящие Условия регулируются законодательством Государства Катар. Все споры подлежат исключительной юрисдикции судов Катара.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '7. Contact' : '7. Контакты'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'For any questions regarding these Terms, please contact us at:'
                  : 'По любым вопросам, связанным с настоящими Условиями, свяжитесь с нами:'}
              </p>
              <p className="mt-4 font-semibold text-qatar-maroon dark:text-rose-400">Info@go2market.qa</p>
            </section>

          </div>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
};

export default TermsPage;
