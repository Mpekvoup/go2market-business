import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distClient = path.resolve(root, 'dist');
const distServer = path.resolve(root, 'dist-server');

// Site configurations
const SITES = {
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

const SHARED_ROUTES = [
  '/case-studies',
  '/case-studies/caring-hands',
  '/case-studies/sidr-technology',
  '/case-studies/qalan',
  '/services/b2b-lead-generation',
  '/services/business-intelligence',
  '/services/incorporation',
  '/services/business-matchmaking',
  '/services/fundraising',
  '/privacy',
  '/terms'
];

function generateMetaTags(siteConfig, lang = 'en', pathname = '/') {
  // Build canonical URL
  const canonicalBase = siteConfig.canonical.replace(/\/$/, '');
  const canonicalPath = pathname === '/' ? '' : pathname;
  const canonical = canonicalBase + canonicalPath;

  return `
    <title>${siteConfig.title[lang]}</title>
    <meta name="description" content="${siteConfig.description[lang]}" />
    <link rel="canonical" href="${canonical}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${siteConfig.title[lang]}" />
    <meta property="og:description" content="${siteConfig.description[lang]}" />
    <meta property="og:image" content="${siteConfig.ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Qatar Business District - G2M International Consulting" />
    <meta property="og:site_name" content="G2M International Consulting" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:locale:alternate" content="ru_RU" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${siteConfig.title[lang]}" />
    <meta name="twitter:description" content="${siteConfig.description[lang]}" />
    <meta name="twitter:image" content="${siteConfig.ogImage}" />
  `.trim();
}

async function prerender() {
  const serverEntryPath = pathToFileURL(path.join(distServer, 'entry-server.js')).href;
  const { render } = await import(serverEntryPath);
  const baseTemplate = await fs.readFile(path.join(root, 'index.html'), 'utf-8');

  // Generate consulting template
  console.log('\n🔵 Generating consulting site...');
  const consultingConfig = SITES.consulting;
  const consultingMeta = generateMetaTags(consultingConfig, 'en', '/');
  const consultingTemplate = baseTemplate.replace('<!-- SITE_META -->', consultingMeta);

  // Pre-render consulting homepage
  const consultingAppHtml = render('/', 'consulting');
  const consultingHtml = consultingTemplate.replace(
    '<div id="root"></div>',
    `<div id="root">${consultingAppHtml}</div>`
  );

  await fs.writeFile(
    path.join(distClient, 'index-consulting.html'),
    consultingHtml,
    'utf-8'
  );
  console.log('✓  index-consulting.html');

  // Generate registration template
  console.log('\n🟢 Generating registration site...');
  const registrationConfig = SITES.registration;
  const registrationMeta = generateMetaTags(registrationConfig, 'en', '/');
  const registrationTemplate = baseTemplate.replace('<!-- SITE_META -->', registrationMeta);

  // Pre-render registration homepage
  const registrationAppHtml = render('/', 'registration');
  const registrationHtml = registrationTemplate.replace(
    '<div id="root"></div>',
    `<div id="root">${registrationAppHtml}</div>`
  );

  await fs.writeFile(
    path.join(distClient, 'index-registration.html'),
    registrationHtml,
    'utf-8'
  );
  console.log('✓  index-registration.html');

  // Pre-render shared routes (using consulting as default base, but with path-specific canonical)
  console.log('\n📄 Generating shared routes...');
  for (const route of SHARED_ROUTES) {
    try {
      // Use consulting for shared routes
      const sharedMeta = generateMetaTags(consultingConfig, 'en', route);
      const sharedTemplate = baseTemplate.replace('<!-- SITE_META -->', sharedMeta);

      const appHtml = render(route, 'consulting');
      const html = sharedTemplate.replace(
        '<div id="root"></div>',
        `<div id="root">${appHtml}</div>`
      );

      const filePath = path.join(distClient, route.slice(1), 'index.html');
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, html, 'utf-8');
      console.log(`✓  ${route}`);
    } catch (err) {
      console.error(`✗  ${route}:`, err.message);
    }
  }

  await fs.rm(distServer, { recursive: true, force: true });
  console.log('\n✅ Pre-rendering complete.\n');
}

prerender();
