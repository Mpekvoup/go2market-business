import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Language } from './types';
import { SiteProvider } from './src/config/SiteContext';
import { detectSiteType, SiteType } from './src/config/site';
import ScrollToTopOnNavigate from './components/ScrollToTopOnNavigate';

// Site-specific homepages
import ConsultingHomePage from './src/sites/consulting/ConsultingHomePage';
import RegistrationHomePage from './src/sites/registration/RegistrationHomePage';

// Lazy load shared pages
const CaseStudiesPage = lazy(() => import('./components/CaseStudies'));
const CaseStudyDetail = lazy(() => import('./components/CaseStudyDetail'));
const ServiceDetailPage = lazy(() => import('./components/ServiceDetailPage'));
const PrivacyPage = lazy(() => import('./components/PrivacyPage'));
const TermsPage = lazy(() => import('./components/TermsPage'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));

interface AppInternalProps {
  siteType: SiteType;
}

const AppInternal: React.FC<AppInternalProps> = ({ siteType }) => {
  const [lang, setLang] = useState<Language>('ru');

  // Initialize Meta Pixel
  useEffect(() => {
    // Load Meta Pixel script
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Initialize pixel and track PageView
    if (window.fbq) {
      window.fbq('init', '2384562945644423');
      window.fbq('track', 'PageView');
    }
  }, []);

  return (
    <SiteProvider siteType={siteType}>
      <ScrollToTop />
      <ScrollToTopOnNavigate />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-qatar-maroon border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route
            path="/"
            element={
              siteType === 'consulting'
                ? <ConsultingHomePage lang={lang} setLang={setLang} />
                : <RegistrationHomePage lang={lang} setLang={setLang} />
            }
          />
          <Route path="/case-studies" element={<CaseStudiesPage lang={lang} setLang={setLang} />} />
          <Route path="/case-studies/:slug" element={<CaseStudyDetail lang={lang} setLang={setLang} />} />
          <Route path="/services/:slug" element={<ServiceDetailPage lang={lang} setLang={setLang} />} />
          <Route path="/privacy" element={<PrivacyPage lang={lang} setLang={setLang} />} />
          <Route path="/terms" element={<TermsPage lang={lang} setLang={setLang} />} />
          <Route path="*" element={<NotFoundPage lang={lang} setLang={setLang} />} />
        </Routes>
      </Suspense>
    </SiteProvider>
  );
};

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll(); // Check initial scroll position
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Don't render anything during SSR or before hydration
  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className={`fixed bottom-32 right-10 z-50 w-12 h-12 bg-white border border-slate-200 text-slate-700 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-qatar-maroon hover:text-white hover:border-qatar-maroon hover:scale-110 active:scale-95 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

// Main App component - accepts siteType as prop (used by SSR)
export const App: React.FC<AppInternalProps> = ({ siteType }) => {
  return <AppInternal siteType={siteType} />;
};

// For browser-side rendering, detect site type from hostname
const AppWithDetection: React.FC = () => {
  const siteType = detectSiteType();
  return <App siteType={siteType} />;
};

export default AppWithDetection;