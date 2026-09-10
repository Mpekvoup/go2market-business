import React, { useState, useRef } from 'react';
import { Language } from '../types';
import { useSite } from '../src/config/SiteContext';

interface ContactFormProps {
  lang: Language;
}

const COOLDOWN_SECONDS = 120;
const MAX_DAILY_SUBMISSIONS = 5;
const STORAGE_KEY_LAST_SUBMIT = 'g2m_last_submit';
const STORAGE_KEY_DAILY_COUNT = 'g2m_daily_count';
const STORAGE_KEY_DAILY_DATE = 'g2m_daily_date';

function getRemainingCooldown(): number {
  if (typeof window === 'undefined') return 0;
  const last = localStorage.getItem(STORAGE_KEY_LAST_SUBMIT);
  if (!last) return 0;
  const elapsed = Math.floor((Date.now() - Number(last)) / 1000);
  return Math.max(0, COOLDOWN_SECONDS - elapsed);
}

function getDailyCount(): number {
  if (typeof window === 'undefined') return 0;
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem(STORAGE_KEY_DAILY_DATE);
  if (storedDate !== today) return 0;
  return Number(localStorage.getItem(STORAGE_KEY_DAILY_COUNT) || 0);
}

const ContactForm: React.FC<ContactFormProps> = ({ lang }) => {
  const { siteType, siteConfig } = useSite();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'limited'>('idle');
  const [cooldown, setCooldown] = useState(0); // Initialize with 0 to avoid SSR mismatch
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    region: 'qatar',
    message: ''
  });
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Site-specific service and source
  const service = siteType === 'consulting' ? 'Business Consultation' : 'Company Registration';
  const source = siteConfig.domain;

  // Функция отправки в Telegram
  const sendToTelegram = async (data: typeof formData) => {
    const botToken = '8840974420:AAHtYHhZXWnobVwMR0GpQ15Q1qFEKZ7mID8';
    const chatId = '-1004304606289';

    const regionLabels = {
      qatar: { en: 'Qatar', ru: 'Катар' },
      uae: { en: 'UAE', ru: 'ОАЭ' },
      kazakhstan: { en: 'Kazakhstan', ru: 'Казахстан' },
      russia: { en: 'Russia', ru: 'Россия' },
      uzbekistan: { en: 'Uzbekistan', ru: 'Узбекистан' },
      other: { en: 'Other', ru: 'Другая страна' }
    };

    const message = `
🆕 <b>Новая заявка с сайта!</b>

📋 <b>Услуга:</b> ${service}
👤 <b>Имя:</b> ${data.name}
📱 <b>Контакт:</b> ${data.contact}
🌍 <b>Регион:</b> ${regionLabels[data.region as keyof typeof regionLabels]?.en || data.region}
💬 <b>Сообщение:</b>
${data.message}

⏰ <i>${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Qatar' })}</i>
🌐 <i>${source}</i>
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }

    return response.json();
  };

  // Восстановление cooldown при загрузке
  React.useEffect(() => {
    const remaining = getRemainingCooldown();
    if (remaining > 0) {
      setCooldown(remaining);
      cooldownIntervalRef.current = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };
  }, []);

  const countries = [
    { value: 'qatar', label: { en: 'Qatar', ru: 'Катар' } },
    { value: 'uae', label: { en: 'UAE', ru: 'ОАЭ' } },
  ];

  const steps = [
    {
      id: 'name',
      question: { en: "What's your name?", ru: 'Как вас зовут?' },
      placeholder: 'Jane Cooper',
      type: 'text' as const,
      field: 'name' as const
    },
    {
      id: 'contact',
      question: { en: 'How can we reach you?', ru: 'Как с вами связаться?' },
      placeholder: '+974 0000 0000 / email@address.com',
      type: 'tel' as const,
      field: 'contact' as const
    },
    {
      id: 'region',
      question: { en: 'Which region are you targeting?', ru: 'Какой регион вас интересует?' },
      type: 'select' as const,
      field: 'region' as const,
      options: countries
    },
    {
      id: 'message',
      question: { en: 'What do you need help with?', ru: 'С чем вам нужна помощь?' },
      placeholder: { en: 'Tell us about your goals...', ru: 'Расскажите о ваших целях...' },
      type: 'textarea' as const,
      field: 'message' as const
    }
  ];

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const currentField = steps[currentStep].field;
    if (!formData[currentField]) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Проверяем что все обязательные поля заполнены
    if (!formData.name || !formData.contact || !formData.message) {
      console.error('Not all required fields are filled');
      return;
    }

    if (cooldown > 0) return;

    if (getDailyCount() >= MAX_DAILY_SUBMISSIONS) {
      setStatus('limited');
      return;
    }

    setStatus('loading');

    try {
      // Отправляем данные в Telegram
      const result = await sendToTelegram(formData);
      console.log('Telegram success:', result);

      setStatus('success');

      // Google Analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { event_category: 'contact', event_label: 'form_submit' });
      }

      // Facebook Pixel Lead event
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_name: 'Contact Form',
          content_category: 'Contact',
          value: 100,
          currency: 'USD'
        });
      }

      // Добавляем параметр success=true в URL для отслеживания конверсий
      const url = new URL(window.location.href);
      url.searchParams.set('success', 'true');
      window.history.pushState({}, '', url.toString());

      // Очищаем форму после успешной отправки
      setFormData({ name: '', contact: '', region: 'qatar', message: '' });
      setCurrentStep(0);

      // Сохраняем timestamp и счётчик в localStorage
      localStorage.setItem(STORAGE_KEY_LAST_SUBMIT, String(Date.now()));
      const today = new Date().toDateString();
      const storedDate = localStorage.getItem(STORAGE_KEY_DAILY_DATE);
      const count = storedDate === today ? getDailyCount() + 1 : 1;
      localStorage.setItem(STORAGE_KEY_DAILY_DATE, today);
      localStorage.setItem(STORAGE_KEY_DAILY_COUNT, String(count));

      setCooldown(COOLDOWN_SECONDS);

      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);

      cooldownIntervalRef.current = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('EmailJS error:', error);
      setStatus('error');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    const step = steps[currentStep];
    const value = formData[step.field];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-qatar-maroon/60 uppercase tracking-widest">
              {lang === 'en' ? 'Question' : 'Вопрос'} {currentStep + 1}/{steps.length}
            </span>
          </div>
          <h3 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            {step.question[lang]}
          </h3>
        </div>

        {step.type === 'text' || step.type === 'tel' ? (
          <input
            type={step.type}
            value={value}
            onChange={(e) => updateField(step.field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value) {
                handleNext();
              }
            }}
            placeholder={step.placeholder}
            className="w-full px-8 py-6 text-xl bg-slate-50 border-2 border-slate-200 focus:border-qatar-maroon focus:bg-white rounded-3xl outline-none transition-all font-medium"
          />
        ) : step.type === 'select' ? (
          <div className="space-y-3">
            {step.options?.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  updateField(step.field, option.value);
                  setTimeout(() => handleNext(), 150);
                }}
                className={`w-full px-8 py-5 text-left text-lg font-bold rounded-2xl transition-all border-2 ${
                  value === option.value
                    ? 'bg-qatar-maroon text-white border-qatar-maroon shadow-lg scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-qatar-maroon/30 hover:bg-white'
                }`}
              >
                {option.label[lang]}
              </button>
            ))}
          </div>
        ) : step.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => updateField(step.field, e.target.value)}
            placeholder={typeof step.placeholder === 'object' ? step.placeholder[lang] : step.placeholder}
            rows={5}
            className="w-full px-8 py-6 text-xl bg-slate-50 border-2 border-slate-200 focus:border-qatar-maroon focus:bg-white rounded-3xl outline-none transition-all font-medium resize-none"
          />
        ) : null}
      </div>
    );
  };

  return (
    <section id="contacts" className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row bg-[#0F172A] rounded-[3rem] shadow-2xl overflow-hidden min-h-[700px]">
          <div className="lg:w-[45%] p-12 lg:p-20 bg-qatar-maroon text-white flex flex-col relative overflow-hidden">

            <div className="relative z-10 space-y-8 flex-grow">
              <h2 className="text-4xl lg:text-4xl font-extrabold leading-[1.1]">
                {lang === 'en' ? "Let's Talk About Your Plans" : 'Расскажите о ваших планах'}
              </h2>
              <p className="text-white/70 text-lg leading-relaxed font-medium">
                {lang === 'en'
                  ? "Book a call with our team. We'll discuss your goals and explain how we can help."
                  : 'Запишитесь на звонок с нашей командой. Обсудим ваши цели и объясним, как можем помочь.'}
              </p>

              <div className="space-y-8 pt-10">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em] mb-1">{lang === 'en' ? 'Phone' : 'Телефон'}</div>
                    <div className="text-lg sm:text-2xl font-bold tracking-tight">+974 5091 0893</div>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 012 2H3a2 2 0 012-2z" /></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em] mb-1">{lang === 'en' ? 'Email' : 'Email'}</div>
                    <div className="text-base sm:text-2xl font-bold tracking-tight break-all sm:break-normal">ceo@go2market.qa</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-12 flex items-center gap-4 text-sm font-bold">
               <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
               <span className="text-white/70 tracking-wide uppercase">
                 {lang === 'en' ? 'Reply within 2 hours' : 'Отвечаем в течение 2 часов'}
               </span>
            </div>
          </div>

          <div className="lg:w-[55%] p-12 lg:p-20 bg-white">
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center border-4 border-green-100/50">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-extrabold text-slate-900">
                    {lang === 'en' ? 'Got it!' : 'Получили!'}
                  </h3>
                  <p className="text-slate-500 font-medium text-lg">
                    {lang === 'en' ? "We'll get back to you within 24 hours." : 'Ответим в течение 24 часов.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStatus('idle');
                    // Очищаем параметр success из URL
                    const url = new URL(window.location.href);
                    url.searchParams.delete('success');
                    window.history.pushState({}, '', url.toString());
                  }}
                  className="bg-slate-50 text-slate-400 px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 hover:text-slate-600 transition-all"
                >
                  {lang === 'en' ? 'Send another request' : 'Отправить заново'}
                </button>
              </div>
            ) : status === 'limited' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center border-4 border-amber-100/50">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-extrabold text-slate-900">
                    {lang === 'en' ? 'Daily Limit Reached' : 'Дневной лимит достигнут'}
                  </h3>
                  <p className="text-slate-500 font-medium text-lg">
                    {lang === 'en' ? 'You have reached the maximum number of requests for today. Please try again tomorrow.' : 'Вы достигли максимального количества заявок на сегодня. Попробуйте завтра.'}
                  </p>
                </div>
              </div>
            ) : status === 'error' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center border-4 border-red-100/50">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-extrabold text-slate-900">
                    {lang === 'en' ? 'Error Occurred' : 'Произошла ошибка'}
                  </h3>
                  <p className="text-slate-500 font-medium text-lg">
                    {lang === 'en' ? 'Please try again later.' : 'Пожалуйста, попробуйте позже.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStatus('idle');
                    // Очищаем параметр success из URL
                    const url = new URL(window.location.href);
                    url.searchParams.delete('success');
                    window.history.pushState({}, '', url.toString());
                  }}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all"
                >
                  {lang === 'en' ? 'Try Again' : 'Попробовать снова'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">

                {/* Progress bar */}
                <div className="mb-8">
                  <div className="flex gap-2">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                          index <= currentStep ? 'bg-qatar-maroon' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Current step */}
                <div className="flex-grow">
                  {renderStep()}
                </div>

                {/* Navigation buttons */}
                <div className="pt-8 space-y-4">
                  <div className="flex gap-4">
                    {currentStep > 0 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {lang === 'en' ? 'Back' : 'Назад'}
                      </button>
                    )}

                    {currentStep < steps.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!formData[steps[currentStep].field]}
                        className="flex-1 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {lang === 'en' ? 'Next' : 'Далее'}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={status === 'loading' || cooldown > 0 || !formData.message}
                        className="flex-1 bg-qatar-maroon hover:bg-qatar-maroon/90 text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {status === 'loading' ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {lang === 'en' ? 'Sending...' : 'Отправка...'}
                          </>
                        ) : (
                          <>
                            {lang === 'en' ? 'Send Request' : 'Отправить'}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {cooldown > 0 && (
                    <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                      {lang === 'en' ? `Please wait ${cooldown}s before sending another request.` : `Подождите ${cooldown}с перед повторной отправкой.`}
                    </p>
                  )}

                  <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                    {lang === 'en' ? 'Your data stays private' : 'Ваши данные остаются приватными'}
                  </p>

                  {/* Hint for Enter key */}
                  {currentStep < steps.length - 1 && steps[currentStep].type !== 'select' && (
                    <p className="text-center text-xs text-slate-400 font-medium">
                      {lang === 'en' ? 'Press Enter ↵ to continue' : 'Нажмите Enter ↵ чтобы продолжить'}
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
