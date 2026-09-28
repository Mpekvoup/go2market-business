import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import Header from './Header';
import Footer from './Footer';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
}

const NotFoundPage: React.FC<Props> = ({ lang, setLang }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} setLang={setLang} />
      <main className="flex-grow bg-[#FCFCFD] dark:bg-qatar-night flex items-center justify-center py-24">
        <div className="text-center px-6">
          <p className="text-[120px] md:text-[180px] font-black text-slate-100 dark:text-white/[0.05] leading-none select-none">
            404
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white -mt-4 mb-4">
            {lang === 'en' ? 'Page not found' : 'Страница не найдена'}
          </h1>
          <p className="text-slate-400 dark:text-slate-500 font-medium mb-10 max-w-sm mx-auto">
            {lang === 'en'
              ? 'The page you are looking for does not exist or has been moved.'
              : 'Страница, которую вы ищете, не существует или была перемещена.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-qatar-maroon text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-[#701530] hover:scale-[1.02] active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {lang === 'en' ? 'Back to Home' : 'На главную'}
          </Link>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
};

export default NotFoundPage;
