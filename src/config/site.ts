export type SiteType = 'consulting' | 'registration';

export interface SiteConfig {
  type: SiteType;
  domain: string;
  title: {
    en: string;
    ru: string;
  };
  description: {
    en: string;
    ru: string;
  };
  canonical: string;
  ogImage: string;
}

export const CONSULTING_CONFIG: SiteConfig = {
  type: 'consulting',
  domain: 'consulting.go2market.qa',
  title: {
    en: 'Business Consulting in Qatar | G2M International',
    ru: 'Бизнес-консультация в Катаре | G2M International'
  },
  description: {
    en: 'G2M provides business consulting, market-entry guidance, and strategic support for companies and entrepreneurs operating in Qatar and GCC.',
    ru: 'G2M предоставляет бизнес-консультации, поддержку выхода на рынок и стратегическую помощь для компаний и предпринимателей в Катаре и GCC.'
  },
  canonical: 'https://consulting.go2market.qa/',
  ogImage: 'https://consulting.go2market.qa/images/hero/qatar.jpg'
};

export const REGISTRATION_CONFIG: SiteConfig = {
  type: 'registration',
  domain: 'registration.go2market.qa',
  title: {
    en: 'Company Registration in Qatar | G2M International',
    ru: 'Регистрация компании в Катаре | G2M International'
  },
  description: {
    en: 'G2M supports entrepreneurs and businesses with company registration and business setup in Qatar and GCC.',
    ru: 'G2M поддерживает предпринимателей и бизнес в регистрации компаний и открытии бизнеса в Катаре и GCC.'
  },
  canonical: 'https://registration.go2market.qa/',
  ogImage: 'https://registration.go2market.qa/images/hero/qatar.jpg'
};

/**
 * Detect site type from hostname (browser-side)
 * Supports localhost development via ?site=registration query param
 */
export function detectSiteType(): SiteType {
  if (typeof window === 'undefined') {
    return 'consulting'; // SSR fallback
  }

  // Check query param for localhost development
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get('site');
  if (siteParam === 'registration') {
    return 'registration';
  }
  if (siteParam === 'consulting') {
    return 'consulting';
  }

  // Check hostname for production
  const hostname = window.location.hostname;
  if (hostname.startsWith('registration.')) {
    return 'registration';
  }

  return 'consulting'; // default
}

/**
 * Get site configuration by type
 */
export function getSiteConfig(type: SiteType): SiteConfig {
  return type === 'registration' ? REGISTRATION_CONFIG : CONSULTING_CONFIG;
}
