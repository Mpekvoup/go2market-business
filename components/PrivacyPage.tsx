import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import Header from './Header';
import Footer from './Footer';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
}

const PrivacyPage: React.FC<Props> = ({ lang, setLang }) => {
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
            {lang === 'en' ? 'Privacy Policy' : 'Политика конфиденциальности'}
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-16">
            {lang === 'en' ? 'Last updated: February 2026' : 'Последнее обновление: февраль 2026'}
          </p>

          <div className="space-y-12 text-slate-600 dark:text-slate-300 leading-relaxed font-medium">

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '1. Who We Are' : '1. Кто мы'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'G2M International Consulting ("G2M", "we", "us") is a boutique business consultancy based in Doha, Qatar (No. 67, D-Ring Road). We help companies from around the world enter and grow in the Qatari market. This Privacy Policy explains how we collect, use and protect your personal data when you visit go2market.qa.'
                  : 'G2M International Consulting ("G2M", "мы") — boutique-консалтинговая компания, расположенная в Дохе, Катар (No. 67, D-Ring Road). Мы помогаем компаниям со всего мира выходить на рынок Катара. Настоящая Политика объясняет, как мы собираем, используем и защищаем ваши персональные данные при посещении go2market.qa.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '2. Data We Collect' : '2. Какие данные мы собираем'}
              </h2>
              <p className="mb-4">
                {lang === 'en'
                  ? 'When you submit the contact form on our website, we collect:'
                  : 'При отправке формы обратной связи мы собираем:'}
              </p>
              <ul className="space-y-2 list-disc list-inside text-slate-500 dark:text-slate-400">
                <li>{lang === 'en' ? 'Your name' : 'Ваше имя'}</li>
                <li>{lang === 'en' ? 'Phone number or email address' : 'Номер телефона или email'}</li>
                <li>{lang === 'en' ? 'Your message and business details you choose to share' : 'Ваше сообщение и бизнес-детали, которые вы указали'}</li>
              </ul>
              <p className="mt-4">
                {lang === 'en'
                  ? 'We also automatically collect anonymised analytics data via Google Analytics and Yandex Metrika (page views, device type, approximate location). No personal identifiers are linked to this data.'
                  : 'Мы также автоматически собираем анонимные аналитические данные через Google Analytics и Яндекс.Метрику (просмотры страниц, тип устройства, приблизительное местоположение). Персональные данные с этой информацией не связаны.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '3. How We Use Your Data' : '3. Как мы используем данные'}
              </h2>
              <ul className="space-y-2 list-disc list-inside text-slate-500 dark:text-slate-400">
                <li>{lang === 'en' ? 'To respond to your enquiry and provide consultancy services' : 'Для ответа на ваш запрос и предоставления консалтинговых услуг'}</li>
                <li>{lang === 'en' ? 'To improve our website based on usage analytics' : 'Для улучшения сайта на основе аналитики'}</li>
                <li>{lang === 'en' ? 'We do not sell, rent or share your data with third parties for marketing purposes' : 'Мы не продаём, не сдаём в аренду и не передаём ваши данные третьим лицам в маркетинговых целях'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '4. Third-Party Services' : '4. Сторонние сервисы'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'We use the following third-party services that may process your data according to their own privacy policies:'
                  : 'Мы используем следующие сторонние сервисы, которые могут обрабатывать данные согласно своим политикам:'}
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-slate-500 dark:text-slate-400">
                <li><strong>EmailJS</strong> — {lang === 'en' ? 'to deliver contact form submissions to us' : 'для доставки сообщений из формы обратной связи'}</li>
                <li><strong>Google Analytics</strong> — {lang === 'en' ? 'for anonymous website analytics' : 'для анонимной аналитики сайта'}</li>
                <li><strong>Yandex Metrika</strong> — {lang === 'en' ? 'for anonymous website analytics' : 'для анонимной аналитики сайта'}</li>
                <li><strong>LinkedIn Insight Tag</strong> — {lang === 'en' ? 'to measure the effectiveness of our advertising campaigns and create targeted audiences for remarketing purposes' : 'для измерения эффективности рекламных кампаний и создания целевых аудиторий для ремаркетинга'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '5. Data Retention' : '5. Хранение данных'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'We retain your contact details only as long as necessary to respond to your enquiry or as required by applicable law. You may request deletion of your data at any time.'
                  : 'Мы храним ваши контактные данные только до тех пор, пока это необходимо для ответа на ваш запрос или требуется действующим законодательством. Вы можете запросить удаление данных в любое время.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '6. Your Rights' : '6. Ваши права'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'You have the right to access, correct or delete your personal data. To exercise these rights, contact us at:'
                  : 'Вы имеете право получить доступ, исправить или удалить свои персональные данные. Для этого свяжитесь с нами:'}
              </p>
              <p className="mt-4 font-semibold text-qatar-maroon dark:text-rose-400">Info@go2market.qa</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'en' ? '7. Governing Law' : '7. Применимое право'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'This Privacy Policy is governed by the laws of the State of Qatar.'
                  : 'Настоящая Политика регулируется законодательством Государства Катар.'}
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
};

export default PrivacyPage;
