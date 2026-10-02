/**
 * Shared metadata processing functions for business site prerendering.
 * Pure functions without side effects - safe to import in tests.
 */

export const SITE_ORIGIN = 'https://consulting.go2market.qa';
export const COMPANY_NAME = 'G2M International';

/**
 * Escape HTML special characters for safe insertion into HTML attributes and text.
 */
export function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Build full canonical URL for a route.
 * Currently uses consulting domain as canonical for all shared routes.
 */
export function getCanonicalUrl(routePath) {
  if (routePath === '/') {
    return `${SITE_ORIGIN}/`;
  }
  return `${SITE_ORIGIN}${routePath}`;
}

/**
 * Site configurations for homepage metadata.
 */
export const SITES = {
  consulting: {
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
  },
  registration: {
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
  }
};

/** Static route metadata - uses neutral descriptions */
const STATIC_ROUTE_META = {
  '/case-studies': {
    title: { en: 'Case Studies', ru: 'Кейсы' },
    description: {
      en: 'Client success stories from G2M International Consulting in Qatar.',
      ru: 'Истории успеха клиентов G2M International Consulting в Катаре.'
    }
  },
  '/privacy': {
    title: { en: 'Privacy Policy', ru: 'Политика конфиденциальности' },
    description: {
      en: 'Privacy policy for G2M International Consulting services.',
      ru: 'Политика конфиденциальности G2M International Consulting.'
    }
  },
  '/terms': {
    title: { en: 'Terms of Service', ru: 'Условия использования' },
    description: {
      en: 'Terms of service for G2M International Consulting.',
      ru: 'Условия использования G2M International Consulting.'
    }
  }
};

/**
 * Build metadata for a route using data sources.
 * Returns { title: { en, ru }, description: { en, ru } } or null if route is unknown.
 */
export function buildRouteMeta(routePath, servicesData, caseStudiesData) {
  // Static routes
  if (STATIC_ROUTE_META[routePath]) {
    return STATIC_ROUTE_META[routePath];
  }

  // Service routes - use title and subtitle from servicesData
  const serviceMatch = routePath.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const slug = serviceMatch[1];
    const service = servicesData.find(s => s.slug === slug);
    if (service) {
      return {
        title: service.title,
        description: service.subtitle
      };
    }
    return null; // Service not found
  }

  // Case study routes - use company name and subtitle from caseStudiesData
  const caseStudyMatch = routePath.match(/^\/case-studies\/([^/]+)$/);
  if (caseStudyMatch) {
    const slug = caseStudyMatch[1];
    const caseStudy = caseStudiesData.find(cs => cs.slug === slug);
    if (caseStudy) {
      return {
        title: {
          en: `${caseStudy.company.en} Case Study`,
          ru: `Кейс ${caseStudy.company.ru}`
        },
        description: {
          en: `${caseStudy.company.en}: ${caseStudy.subtitle.en}`,
          ru: `${caseStudy.company.ru}: ${caseStudy.subtitle.ru}`
        }
      };
    }
    return null; // Case study not found
  }

  return null; // Unknown route
}

/**
 * Generate complete meta tags HTML for a route.
 * Throws if meta is null (unknown route).
 */
export function generateMetaTags(routePath, meta, lang = 'en') {
  if (!meta) {
    throw new Error(`No metadata defined for route: ${routePath}`);
  }

  const canonical = getCanonicalUrl(routePath);
  const ogImage = SITES.consulting.ogImage;

  // Build full title with company name suffix
  const rawTitle = meta.title[lang];
  const fullTitle = rawTitle.includes(COMPANY_NAME)
    ? rawTitle
    : `${rawTitle} | ${COMPANY_NAME}`;

  const safeTitle = escapeHtml(fullTitle);
  const safeDescription = escapeHtml(meta.description[lang]);

  return `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${canonical}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Qatar Business District - G2M International Consulting" />
    <meta property="og:site_name" content="G2M International Consulting" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:locale:alternate" content="ru_RU" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${ogImage}" />
  `.trim();
}

/**
 * Generate homepage meta tags for a specific site.
 */
export function generateHomepageMetaTags(siteKey, lang = 'en') {
  const siteConfig = SITES[siteKey];
  if (!siteConfig) {
    throw new Error(`Unknown site: ${siteKey}`);
  }

  const safeTitle = escapeHtml(siteConfig.title[lang]);
  const safeDescription = escapeHtml(siteConfig.description[lang]);

  return `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${siteConfig.canonical}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${siteConfig.canonical}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${siteConfig.ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Qatar Business District - G2M International Consulting" />
    <meta property="og:site_name" content="G2M International Consulting" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:locale:alternate" content="ru_RU" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${siteConfig.ogImage}" />
  `.trim();
}
